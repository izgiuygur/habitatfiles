# The Habitat Files

An interactive, fully-sourced brief on the U.S. Endangered Species Act and the 2026 rule that
rescinds the regulatory definition of **"harm"** (announced July 10, 2026; effective **September 14, 2026**).

**Live:** https://habitatfiles.org

## What it is

A single, **self-contained** HTML page. All CSS, JavaScript, and data are inline — no build step,
no dependencies, no framework. Open `index.html` in any modern browser and it runs.

Highlights:

- An **interactive explorer** of all **1,643** distinct U.S. ESA-listed species (1,594 managed by
  the Fish & Wildlife Service + 49 marine species managed by NOAA Fisheries). Every dot is a real,
  named species — hover for its name, scientific name, status, and agency; arrange by group, status,
  or source; or search.
- **Range-loss** squares (area-accurate) and **recovery** slope charts, every figure cited.
- A plain-language walkthrough of what the "harm" rule changes — and what remains in force
  (listings, critical habitat, Section 7 consultation).

## Structure

```
index.html        The entire site (self-contained: HTML + CSS + JS + data)
og-preview.png    1200×630 social-share card
data/             Source datasets, kept for provenance
  fws-csv-files-US/   FWS ECOS "species-by-taxonomic-group" exports (14 files)
  noaa_esa_*.csv      NOAA Fisheries ESA species directory export
scripts/          Node/Python used to assemble & verify the species data
```

## Data & sourcing

Every species record comes directly from primary agency data:

- **U.S. Fish & Wildlife Service** — ECOS species-listings-by-taxonomic-group reports.
- **NOAA Fisheries** — ESA Threatened & Endangered species directory (verified row-by-row against
  the live table: 105 species / 174 listings, 100% match).

Co-managed species (sea turtles, some sturgeon, Atlantic salmon) are counted once. Recovery,
range-loss, and rule/legal facts are cited inline in the page's footnotes. The rule itself:
Federal Register **2026-14195**, effective Sept 14, 2026. Legal challenge filed July 14, 2026
(Earthjustice et al., W.D. Wash.).

## Run locally

Open `index.html` directly, or serve it:

```
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Deploy

Static hosting, no build command, publish directory = repo root:

- **Cloudflare Pages** or **Netlify** (git-connected, auto-deploy on push) — recommended.
- **GitHub Pages** also works (serve from root).
- Custom domain: `habitatfiles.org`.

## Notes

Underlying species data is public-domain U.S. government data. The written brief takes a point of
view but presents the administration's case alongside the critics'; all figures are sourced in-page.
