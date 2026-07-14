import pdfplumber, json, re
from collections import Counter

PDF="/sessions/busy-dazzling-darwin/mnt/endangered-species-act/Species Directory - ESA Threatened & Endangered _ NOAA Fisheries.pdf"
pdf=pdfplumber.open(PDF)
species=[]
for page in pdf.pages:
    ws=[w for w in page.extract_words() if 60 < w["top"] < 720]
    anchors=sorted([w for w in ws if w["text"] in ("Threatened","Endangered") and 270<w["x0"]<360], key=lambda w:w["top"])
    if not anchors: continue
    for i,a in enumerate(anchors):
        lo = -1 if i==0 else (anchors[i-1]["top"]+a["top"])/2
        hi = 1e9 if i==len(anchors)-1 else (a["top"]+anchors[i+1]["top"])/2
        band=[w for w in ws if lo<=w["top"]<hi]
        name=[w for w in band if w["x0"]<148]
        cat=[w for w in band if 148<=w["x0"]<228 and w["text"] not in ("SPECIES","CATEGORY")]
        reg=[w for w in band if w["x0"]>=498]
        name.sort(key=lambda w:(round(w["top"]),w["x0"]))
        nm=" ".join(w["text"] for w in name)
        cat.sort(key=lambda w:(round(w["top"]),w["x0"])); category=" ".join(w["text"] for w in cat)
        reg.sort(key=lambda w:(round(w["top"]),w["x0"])); region=" ".join(w["text"] for w in reg)
        toks=nm.split()
        if len(toks)<2: continue
        sci=" ".join(toks[-2:]); common=" ".join(toks[:-2]) or sci
        species.append({"common":common,"sci":sci,"status":a["text"],"category":category,"region":region})

print("parsed rows:",len(species))
us=[s for s in species if "Foreign" not in s["region"]]
print("US (non-foreign):",len(us))
print("categories:",dict(Counter(s["category"] for s in us)))
json.dump(us, open("/tmp/noaa_us.json","w"))
print("--- all US species ---")
for s in us:
    print("%-34s | %-32s | %-11s | %-28s | %s" % (s["common"][:34], s["sci"][:32], s["status"], s["category"][:28], s["region"]))
