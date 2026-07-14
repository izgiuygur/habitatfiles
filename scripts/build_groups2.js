const fs=require("fs");
function parse(t){t=t.replace(/^﻿/,"");const rows=[];let i=0,f="",row=[],q=false;
 for(;i<t.length;i++){const c=t[i];
  if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}
  else{if(c==='"')q=true;else if(c===","){row.push(f);f="";}else if(c==="\n"||c==="\r"){if(c==="\r"&&t[i+1]==="\n")i++;if(f!==""||row.length){row.push(f);rows.push(row);row=[];f="";}}else f+=c;}}
 if(f!==""||row.length){row.push(f);rows.push(row);}return rows;}
const rank={"Endangered":3,"Threatened":2,"Experimental Population, Non-Essential":1,"Similarity of Appearance (Threatened)":0};
const codeF={"Endangered":"E","Threatened":"T","Experimental Population, Non-Essential":"X","Similarity of Appearance (Threatened)":"S"};
const MAP={"Flowering Plants":"Flowering plants","Conifers and Cycads":"Conifers & cycads","Ferns and Allies":"Ferns & allies","Lichens":"Lichens","Mammals":"Mammals","Birds":"Birds","Reptiles":"Reptiles","Amphibians":"Amphibians","Fishes":"Fishes","Insects":"Insects","Clams":"Clams & mussels","Snails":"Snails","Crustaceans":"Crustaceans","Arachnids":"Arachnids"};
const kingdom={"Flowering plants":"plant","Conifers & cycads":"plant","Ferns & allies":"plant","Lichens":"plant","Mammals":"animal","Birds":"animal","Reptiles":"animal","Amphibians":"animal","Fishes":"animal","Corals":"animal","Insects":"animal","Clams & mussels":"animal","Marine molluscs":"animal","Snails":"animal","Crustaceans":"animal","Arachnids":"animal"};
const order=["Flowering plants","Conifers & cycads","Ferns & allies","Lichens","Mammals","Birds","Reptiles","Amphibians","Fishes","Corals","Insects","Clams & mussels","Marine molluscs","Snails","Crustaceans","Arachnids"];
const byKey={}; order.forEach(k=>byKey[k]=[]);

// FWS
const fwsDir="/sessions/busy-dazzling-darwin/mnt/endangered-species-act/fws-csv-files-US/";
let fwsAll=[];
fs.readdirSync(fwsDir).filter(f=>f.endsWith(".csv")).forEach(fn=>{parse(fs.readFileSync(fwsDir+fn,"utf8")).slice(1).forEach(r=>{if(r.length>=6&&r[0].trim())fwsAll.push({sci:r[0].trim(),common:r[1].trim(),status:r[4].trim(),group:r[5].trim()});});});
const fwsM={}; fwsAll.forEach(r=>{const k=r.group+"||"+r.sci+"||"+r.common; if(!fwsM[k]||rank[r.status]>rank[fwsM[k].status])fwsM[k]=r;});
Object.values(fwsM).forEach(r=>{const g=MAP[r.group]; if(!g)return; byKey[g].push([r.common,r.sci,codeF[r.status]||"E","FWS"]);});

// NOAA net-new
const noaaNet=JSON.parse(fs.readFileSync("/sessions/busy-dazzling-darwin/mnt/outputs/noaa_net.json","utf8"));
noaaNet.forEach(s=>{const c=s.common.replace(/ Coral$/,"").trim(); byKey[s.group].push([s.common.replace(/ Coral$/," Coral"),s.sci,s.status,"NOAA"]);});

// sort each group by common name
Object.values(byKey).forEach(a=>a.sort((x,y)=>x[0].toLowerCase()<y[0].toLowerCase()?-1:1));

function esc(s){return s.replace(/\\/g,"\\\\").replace(/"/g,'\\"');}
const gtxt="const GROUPS=[\n"+order.map(k=>{
  const sp=byKey[k].map(t=>`["${esc(t[0])}","${esc(t[1])}","${t[2]}","${t[3]}"]`).join(",");
  return `    {key:"${k}",kingdom:"${kingdom[k]}",count:${byKey[k].length},sp:[${sp}]}`;
}).join(",\n")+"\n  ];";
fs.writeFileSync("/sessions/busy-dazzling-darwin/mnt/outputs/GROUPS2.js",gtxt);

let plants=0,animals=0,total=0,src={FWS:0,NOAA:0},st={};
order.forEach(k=>{const n=byKey[k].length;total+=n;(kingdom[k]==="plant"?plants+=n:animals+=n);byKey[k].forEach(t=>{st[t[2]]=(st[t[2]]||0)+1;src[t[3]]++;});});
console.log("TOTAL:",total,"| plants:",plants,"| animals:",animals);
console.log("source:",src,"| status:",st);
console.log("per group:"); order.forEach(k=>console.log("  "+byKey[k].length.toString().padStart(4)+"  "+k));
console.log("snippet bytes:",gtxt.length);
