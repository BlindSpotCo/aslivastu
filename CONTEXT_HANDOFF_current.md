# AsliVastu — Context Handoff (paste into a new chat to resume)

## What AsliVastu is
A neighbourhood livability scoring product for Indian real estate. Type an area
name or PIN code and get a 0–100 **NQI** (Neighbourhood Quality Index), a letter
grade, and a breakdown of 8 government-sourced dimensions.

- **Live:** www.aslivastu.com
- **Coverage:** 152 areas — Delhi NCR (86) + Bangalore (66)
- **Owner:** Gurshaan Singh Baweja (xgurshaan@gmail.com) · prefers concise, direct
  answers, minimal fluff. Asks to be consulted before UI elements are added/removed.

## Two repos (both connected as folders in this workspace)
| Local | GitHub | What |
|---|---|---|
| `~/nqr_delhi` | `gurshaansb/aslivastu-pipeline` | Python data pipeline (18 commits) |
| `~/nqr-web` | `gurshaansb/aslivastu-web` | Next.js frontend on Vercel (47 commits) |

Also mounted: `~/Downloads/design_handoff_neighbourhood_report` (the Industry
design spec) and `~/Downloads/av_merged_v2` (a friend's merged copy — source of
the SunScout Sun & Shadow feature).

---

# CRITICAL OPERATIONAL FACTS (don't relearn these the hard way)

1. **`git push` does NOT deploy.** Vercel was set up via CLI, not GitHub
   integration. After pushing you must run `npx vercel --prod` from `~/nqr-web`.
   Wait for the final `Production: …` line. This has caused "the changes didn't
   show up" confusion repeatedly.
2. **Vercel edge-caches hard.** Verify with a fresh `?cb=<new-number>` each time.
3. **Stale `.git/index.lock` recurs constantly.** Prefix git commands with
   `rm -f .git/index.lock`. The sandbox can't delete it; the user must.
4. **I can't push or build from the sandbox** — no network, no git identity, and
   `next build` fails here (missing SWC binary for linux/arm64). Always hand the
   user exact copy-paste commands, and ask them to run `npm run build` before
   deploying since that's the only real pre-deploy check.
5. **Pipeline → web is a manual copy** (`data/processed/*.json` →
   `nqr-web/public/*.json`). This silently diverged once and served stale scores.
   `./deploy.sh` now automates it and `validate.py` fails if they drift.
6. **`data/raw/*.json` and `data/processed/*.json` are gitignored**, except
   `data/raw/price_tier_by_pin.json` which is explicitly un-ignored (curated data).
7. **data.gov.in is unreachable from the user's network** (60s timeouts on all
   states, repeatedly, across VPN toggles and hotspot). Live AQI can't refresh.
8. **Verify with real data before claiming a fix.** Multiple bugs shipped because
   output "looked defensible" instead of being checked against source rows.

---

# CURRENT STATE

## Pending (uncommitted)
- `~/nqr_delhi`: `validate.py` (timestamp-ignore fix), plus untracked docs
  (`ASLIVASTU_TECH_REFERENCE.md/.pdf`, feedback + handoff `.md` files)
- `~/nqr-web`: `public/nqi_scores.json`, `master_by_pin.json`, `methodology.json`
  (regenerated with the AQI fix — **not yet committed or deployed**)

**Next action:** run `./deploy.sh` in `~/nqr_delhi`, then commit both repos and
`npx vercel --prod`.

## Known-good reference values (after the AQI fix)
- Hauz Khas (110016): NQI 76 B+, air 75, aqi_avg 113
- Whitefield (560066): NQI 73 B+, air 88, aqi_avg 58
- Delhi AQI data is **107 days stale** (last real fetch 2026-04-10)

---

# THE SCORING ENGINE (`scoring.py`)

```
NQI = round( Σ(score_i × weight_i) / Σ(weight_i) )   # missing dims DROPPED, weights renormalised
```
Weights: crime 25, infrastructure 20, air 15, power 10, schools 10, water 8,
roads 7, sewerage 5. Grades: 90 A+, 80 A, 70 B+, 60 B, 50 C+, 40 C, else D.

**Non-composite context fields** (informational, deliberately NOT in the NQI):
`crime_percentile` / `crime_tier` (city-scoped) and `price_context`.

**Air scoring** — piecewise-linear interpolation between CPCB anchors
`[(0,100),(50,90),(100,78),(200,55),(300,35),(400,15),(500,0)]`. Was flat bands,
which caused a 15-point cliff at AQI 50.

**`waterlogging_risk` is INVERTED: 5 = safest, 1 = worst.** Easy footgun.

---

# BUGS FOUND & FIXED THIS SESSION (all verified)

1. **AQI was the MEAN of pollutant sub-indices, not the CPCB MAX.** Hauz Khas
   reported NH3 4, ozone 7, CO 29, NO2 58, PM2.5 85, PM10 113 → we stored 49.9
   ("Good") instead of 113 ("Moderate"). Benign gases diluted real spikes, so
   areas with more sensors looked cleaner. Delhi was systematically flattered.
   Fixed in `run_pipeline.py` (`max(vals)`).
2. **Bangalore AQI seeds were 25–40 points too pessimistic** (fabricated by me,
   applying Delhi assumptions). Corrected against real CPCB stations
   (BTM Layout ~59, Silk Board ~65–68).
3. **Band cliff** in `score_air` (AQI 49.9→100 vs 50.1→85). Fixed with interpolation.
4. **Field-collision bug** (earlier): water/roads/sewerage all emitted
   `quality_score`/`coverage_pct`; blind `dict.update()` let them overwrite each
   other. Fixed by namespacing in the merge (`water_quality`, `road_quality`,
   `sewerage_coverage`, `water_coverage`).
5. **Process bug:** fixed the pipeline but never copied to `public/` — site served
   stale numbers while the terminal showed correct ones.
6. **Validator false positive:** the sync check compared raw JSON including
   `scored_at`/`merged_at`, so it failed after every regeneration. Now strips
   volatile timestamp fields.

---

# TOOLING BUILT THIS SESSION

**`validate.py`** — 19 stdlib-only checks, exits non-zero on failure. Proven to
catch each bug above by re-injecting it. Groups: AQI methodology (max-not-mean,
category match), freshness (>30 days warns), distribution sanity (uniform data,
cross-city plausibility), field collisions, score integrity (ranges, composite
bounds, grades, weights), coverage/semantics, and **web sync** (public/ vs
data/processed/).

**`deploy.sh`** — atomic: scrape → merge → score → **validate → only then copy**.
Bad data can't reach the web app. Flags: `--no-scrape` (skip the 4×60s API
timeouts), `--check` (validate only).

```bash
cd ~/nqr_delhi && ./deploy.sh --no-scrape
```

---

# FRONTEND STATE

**Report page (`pages/report/[pin].js`)** — fully rebuilt in the "Industry"
blueprint design from the handoff: hairline-framed cards with `+` corner marks,
square corners, Barlow Condensed, maroon `#7a1f2b`, dark default with light
toggle. Built at `/report-v2` first, then swapped in; **old page backed up at
`legacy/report-pin-legacy.js.bak`** for instant rollback. `/report-v2` is now a
thin alias.

Contains: header, hero 3-cards (identity/score/verdict), area search + city
switcher, persona toggle (Default/Family/Investor/Safety/**Custom** with sliders),
freshness legend, colour-coded dimension readout with hatched sub-50 bars,
**SunShadowBar teaser (free)**, unlock gate, Leaflet map with nearby-area NQI
pins, comparison table, inspection notes, price context, **deep-dive stat cards
with `?` tooltips**, schools list, methodology, commute check, **SunShadowCheck**
(SunScout building search via `/api/geocode` → Nominatim), About + feedback, footer.
PDF export uses html2canvas → multi-page A4 of the real UI.

**Landing (`pages/index.js`)** — red `#e23744` replaced with maroon (`#7a1f2b`
fills, `#a75a65` text), square corners, hairline borders, `+` corner marks on
cards, softened glows. **Fonts deliberately reverted to the original Bebas Neue +
DM Sans** — the user preferred them. **All animations untouched** (verified by
diffing animation-rule counts). Hero has a compact location picker with city
toggle and sample-area chips.

**Shared:** `lib/pinMeta.js` (152 PIN→locality), `lib/areaCoords.js` (154 lat/long).
`PIN_META` is duplicated in index.js, compare.js, report.js, sitemap, api/og —
update all when adding areas.

---

# WORKING PATTERN THAT WORKS HERE

1. Verify data availability/granularity **before** promising a feature (the
   per-capita crime and exact-Kaveri-price dead ends).
2. Edit directly via Read/Edit on the mounted repos (they're the user's real files).
3. After changes: `npx eslint <file>` and compare to baseline
   (`pages/index.js` 1 error; report page ~6 errors — all pre-existing), plus
   `node -e "require('@babel/core').transformFileSync(...)"` as a build sanity check.
4. For data changes: `./deploy.sh` then confirm with `validate.py`.
5. Give exact terminal commands; never run git.
6. When something "doesn't show up": (a) was it committed, (b) was
   `vercel --prod` run, (c) edge cache, (d) **is public/ actually in sync**.

---

# OPEN ITEMS

- **Live AQI still blocked** — data.gov.in unreachable from the user's network.
  Code is correct and ready; one successful run fixes 107-day-stale Delhi data.
- **Bangalore air remains estimated** until that run.
- **Guidance values are indicative bands**, not per-PIN exact (Kaveri sets them
  per street/survey number — deliberate false-precision avoidance).
- From `aslivastu_consolidated_issues.md`: done are #3 methodology, #4 crime
  context, #7 price, #8 water/roads/sewerage in composite, #10 feedback, #16
  reweighting, plus plain-language AQI (#12), freshness (#1), shortlist (#5).
  Still open: #2 sub-PIN granularity, #6 trends (needs time-series), #9 shareable
  report, #11 scope disclaimer, #13 dead `schools_scoring.py`, #14 fragile
  `update_pins.py` geocoding, #15 changelog.
- **Interview prep:** `ASLIVASTU_TECH_REFERENCE.md` + `.pdf` (13 parts, full
  technical explanation with likely Q&A) is in `~/nqr_delhi`.
