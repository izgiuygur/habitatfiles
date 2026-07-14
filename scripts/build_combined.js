const fs=require("fs");
function parse(t){t=t.replace(/^﻿/,"");const rows=[];let i=0,f="",row=[],q=false;
 for(;i<t.length;i++){const c=t[i];
  if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}
  else{if(c==='"')q=true;else if(c===","){row.push(f);f="";}else if(c==="\n"||c==="\r"){if(c==="\r"&&t[i+1]==="\n")i++;if(f!==""||row.length){row.push(f);rows.push(row);row=[];f="";}}else f+=c;}}
 if(f!==""||row.length){row.push(f);rows.push(row);}return rows;}
const normSci=s=>s.toLowerCase().replace(/\(=?[^)]*\)/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const gs=s=>normSci(s).split(" ").slice(0,2).join(" ");

// ---------- FWS distinct species ----------
const fwsDir="/sessions/busy-dazzling-darwin/mnt/endangered-species-act/fws-csv-files-US/";
let fwsAll=[];
fs.readdirSync(fwsDir).filter(f=>f.endsWith(".csv")).forEach(fn=>{parse(fs.readFileSync(fwsDir+fn,"utf8")).slice(1).forEach(r=>{if(r.length>=6&&r[0].trim())fwsAll.push({sci:r[0].trim(),common:r[1].trim(),status:r[4].trim(),group:r[5].trim()});});});
const rank={"Endangered":3,"Threatened":2,"Experimental Population, Non-Essential":1,"Similarity of Appearance (Threatened)":0};
const codeF={"Endangered":"E","Threatened":"T","Experimental Population, Non-Essential":"X","Similarity of Appearance (Threatened)":"S"};
const fwsM={};
fwsAll.forEach(r=>{const k=r.group+"||"+r.sci+"||"+r.common; if(!fwsM[k]||rank[r.status]>rank[fwsM[k].status])fwsM[k]=r;});
const fwsDistinct=Object.values(fwsM);
const fwsSciSet=new Set(fwsDistinct.map(r=>gs(r.sci)));
const fwsCommonSet=new Set(fwsDistinct.map(r=>r.common.toLowerCase().replace(/[^a-z0-9]/g,"")));

// ---------- NOAA distinct US species ----------
const noaa=parse(fs.readFileSync("/sessions/busy-dazzling-darwin/mnt/endangered-species-act/noaa_esa_threatened_endangered_species.csv","utf8"));
const H=noaa[0], iN=H.indexOf("Species Name"), iSci=H.indexOf("Scientific Name"), iStat=H.indexOf("Protected Status"), iCat=H.indexOf("Species Category");
const bySpecies={};
noaa.slice(1).forEach(r=>{
  const sci=r[iSci].trim(), common=r[iN].trim().replace(/\s*\(Protected\)\s*/i,"").trim(), st=r[iStat].trim(), cat=r[iCat].trim();
  const key=sci.toLowerCase();
  if(!bySpecies[key])bySpecies[key]={sci,common,cat,usStatuses:[],hasForeign:false,hasCand:false,hasExp:false};
  const S=bySpecies[key];
  if(/Candidate/.test(st)){S.hasCand=true;return;}
  if(/Experimental/.test(st)){S.hasExp=true;return;}
  if(/Foreign/.test(st)){S.hasForeign=true;return;}
  if(/Endangered/.test(st))S.usStatuses.push("E");
  else if(/Threatened/.test(st))S.usStatuses.push("T");
});
function noaaGroup(cat,common){
  if(/Corals/.test(cat))return "Corals";
  if(/Abalone/.test(cat)||/Protected Invertebrate/.test(cat)||/conch/i.test(common)||/nautilus/i.test(common))return "Marine molluscs";
  if(/Fish|Shark|Salmon|Steelhead|Groundfish|Reef|Migratory|Seafood/.test(cat))return "Fishes";
  if(/Whale|Dolphin|Porpoise|Seal|Sea Lion/.test(cat))return "Mammals";
  if(/Sea Turtle/.test(cat))return "Reptiles";
  if(/snake/i.test(common))return "Reptiles";
  return "Other:"+cat;
}
const noaaNet=[]; let usCount=0, overlap=[], foreignOnly=0, unmapped=[];
Object.values(bySpecies).forEach(S=>{
  if(S.usStatuses.length===0){foreignOnly++; return;} // no US listing (foreign/candidate/experimental only)
  usCount++;
  // overlap with FWS?
  if(fwsSciSet.has(gs(S.sci)) || fwsCommonSet.has(S.common.toLowerCase().replace(/[^a-z0-9]/g,""))){overlap.push(S.common+" ("+S.sci+")");return;}
  const status=S.usStatuses.includes("E")?"E":"T";
  const grp=noaaGroup(S.cat,S.common);
  if(grp.startsWith("Other:")){unmapped.push(S.common+" -> "+S.cat);}
  noaaNet.push({common:S.common,sci:S.sci,status,group:grp,source:"NOAA"});
});
console.log("FWS distinct species:",fwsDistinct.length);
console.log("NOAA distinct species total:",Object.keys(bySpecies).length);
console.log("  US NOAA species:",usCount," | foreign/candidate/exp-only:",foreignOnly);
console.log("  overlap w/ FWS (excluded, co-managed):",overlap.length,"=>",overlap.join(", "));
console.log("  NET-NEW NOAA to add:",noaaNet.length);
console.log("  unmapped categories:",unmapped);
const byG={}; noaaNet.forEach(s=>byG[s.group]=(byG[s.group]||0)+1);
console.log("  net-new by group:",byG);
console.log("  net-new list:"); noaaNet.sort((a,b)=>a.group<b.group?-1:1).forEach(s=>console.log("    ["+s.status+"] "+s.group+" — "+s.common+" ("+s.sci+")"));
console.log("\nCOMBINED TOTAL:",fwsDistinct.length+noaaNet.length);
fs.writeFileSync("/sessions/busy-dazzling-darwin/mnt/outputs/noaa_net.json",JSON.stringify(noaaNet));
