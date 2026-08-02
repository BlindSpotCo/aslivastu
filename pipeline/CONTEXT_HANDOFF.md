# AsliVastu — context handoff

Paste this into a new chat to resume. Two local repos are involved, both already connected as folders in this workspace: `/Users/gurshaan/nqr_delhi` (data pipeline) and `/Users/gurshaan/nqr-web` (Next.js frontend).

## What AsliVastu is

A Delhi NCR neighborhood livability scoring product. The pipeline (`nqr_delhi`, GitHub `gurshaansb/aslivastu-pipeline`) scrapes/hardcodes data across 8 categories (air, crime, infrastructure, power, water, roads, sewerage, schools) per PIN code and computes an "NQI" (Neighbourhood Quality Index, 0-100) with a letter grade. The frontend (`nqr-web`, GitHub `gurshaansb/aslivastu-web`, deployed on Vercel, live at **www.aslivastu.com**) is a Next.js Pages Router app that reads the pipeline's output JSON and renders it.

Owner: Gurshaan Singh Baweja (xgurshaan@gmail.com), LinkedIn: linkedin.com/in/gurshaan-singh-baweja. Prefers concise, direct responses — minimal fluff.

## Critical operational facts (don't relearn these the hard way)

- **No network access from this sandbox** to github.com or the npm registry. I cannot `git push` or `npm install` myself — always give the user copy-paste terminal commands to run themselves.
- **Vercel does NOT auto-deploy on git push** for this project (it was originally deployed via Vercel CLI, not GitHub integration — deployments show no branch/commit metadata). After every push, the user must also run `npx vercel --prod` from `~/nqr-web` to actually publish it.
- **Vercel edge-caches aggressively.** Right after a deploy, fetching the live URL can still show old content. Append a `?cb=123` query string to bypass cache when verifying, or just wait/hard-refresh.
- **Stale git lock files recur.** Because this sandbox and the user's real Mac share the same `.git` directory with different process permissions, failed git commands (mine or the user's) sometimes leave `.git/index.lock`, `.git/HEAD.lock`, or `.git/objects/maintenance.lock` behind. Fix: `rm -f` them, then retry. I cannot delete them myself (permission denied from the sandbox side) — the user has to.
- **I should not run git commit/push directly** — no author identity is configured in the sandbox and there's no network anyway. Always hand the user the exact commands.
- `nodemailer` was added to `nqr-web/package.json` but isn't in `node_modules` yet — user needs to run `npm install` once.
- Data files flow: pipeline writes to `nqr_delhi/data/processed/*.json` → gets manually copied to `nqr-web/public/nqi_scores.json` and `public/master_by_pin.json` → committed → deployed. There's no automatic sync between the two repos.

## Key files

**nqr_delhi**: `run_pipeline.py` (orchestrator), `scoring.py` (NQI composite, weights, methodology, crime percentile), `schools_scoring.py` (dead/unused code, conflicts with `scoring.py`'s `score_schools` — flagged but not yet cleaned up), `scrapers/*.py` (per-dimension data, mostly hardcoded `STATIC_DATA`, not live-scraped — `crime.py` in particular is fully static), `update_pins.py` (manual AQI station→PIN patch script).

**nqr-web**: `pages/index.js` (landing, served at `/`), `pages/landing.js` (**orphaned duplicate, nothing links to it, don't bother editing it**), `pages/report.js` (pure redirect), `pages/report/[pin].js` (the main report page — biggest file, most work happens here), `pages/compare.js`, `pages/_app.js` (created this session, holds the site-wide custom cursor), `pages/api/{all,report,og,feedback}.js`.

## Status of the 16-issue consolidated list

Full detail lives in `/Users/gurshaan/nqr_delhi/aslivastu_consolidated_issues.md` (already written to disk, read it for complete context). Summary:

- ✅ **#3 No visible methodology** — Done. Published `methodology.json`, added `weights_base`/`weights_applied` per pin, weight badges shown inline in the free Score breakdown section, plus user-adjustable weight presets (Default/Family/Investor/Safety) and a Custom mode with sliders that recompute the score live and sync the hero NQI number/grade too.
- ⚠️ **#4 Crime numbers lack context** — Partially done. Shipped `crime_percentile` + `crime_tier` (Very Low–Very High), ranking each pin's raw crime count against all others. **True per-capita rate was investigated and deliberately rejected**: Census 2011 population data for Delhi only exists at tehsil level (~27 tehsils covering ~55 tracked pins), so multiple different pins would share an identical population denominator — that's false precision, not a real fix. Don't revisit this path unless genuinely new data surfaces.
- ✅ **#10 No correction/appeals channel** — Done. Feedback boxes on both the landing page (two-column layout, About box left / feedback box right) and the report page (under the About/builder section, pre-fills pin/area/NQI context). Originally used `mailto:` links, now upgraded to silent submission via a new `pages/api/feedback.js` route using Gmail SMTP (`nodemailer`). **Not fully verified working yet** — needs the user to finish: generate a Gmail App Password, set `GMAIL_USER` + `GMAIL_APP_PASSWORD` as Vercel env vars, run `npm install`, then push + `vercel --prod`.
- ✅ **#16 Silent reweighting on missing data** — Done as part of #3 (see above).
- ⬜ Everything else (#1, #2, #5, #6, #7 in progress — see below, #8, #9, #11, #12, #13, #14, #15) — not started or blocked on data availability. #6 (trend) is specifically blocked because `crime.py` data is static hardcoded, not time-series — no amount of effort fixes that without periodic manual data refreshes going forward.

## Other completed work (not on the original issues list)

- About/builder section with photo (`IMG_6285.jpeg`), bio, LinkedIn link — landing page and report page.
- Replaced all decorative UI emoji with a custom hand-drawn minimal SVG line-icon set (`DimIcon` component, duplicated per-file since there's no shared components directory in this codebase — that's an intentional existing convention, not an oversight).
- Fixed low-contrast "barely visible" grey text site-wide (bumped `muted` color values and low-opacity white text, left borders/backgrounds alone).
- Site-wide custom cursor in `pages/_app.js` — leading dot, lagging dashed ring, two trailing particles, replicating a reference site's cursor animation. Desktop-only (checks `pointer: coarse`, skips touch devices). Lerp/lag factors were tuned once already per user feedback (currently 0.4/0.45).
- Restyled the Crime and Power cards on the report page to match the Infrastructure/Water/Roads/Sewerage visual pattern (icon + serif title + gradient divider header, `InfoBox` grid with hover tooltips) instead of the old plain list-style cards.

## Where this session left off — Issue #7, "No connection to price"

Broker and NRI investor both flagged that the score has no link to price-per-sqft, rental yield, or appreciation. Research so far, mid-task:

- **Rental yield / appreciation trend: not achievable** with free public data — same conclusion pattern as the crime trend problem. Would need private real estate platform data (99acres, MagicBricks), not available via free API.
- **Price tier / price-per-sqft: IS achievable**, unlike population. Delhi and Haryana publish official "Circle Rate" / "Collector Rate" data — government minimum property valuation used for stamp duty — at the *locality* level, not a coarser administrative unit. This is genuinely usable, unlike the tehsil-level population data.
- **Confirmed for Delhi** (~55 of 86 tracked pins): Category A–H system, verified via a NoBroker article with a full locality-to-category table. Category A = Kalindi Colony, Maharani Bagh, Vasant Vihar, etc.; B = Hauz Khas, Greater Kailash, Defence Colony; C = Vasant Kunj, Malviya Nagar, Lajpat Nagar; D = Dwarka, Janakpuri, Karol Bagh, Rajouri Garden, Mayur Vihar; E = Rohini, Chandni Chowk, Paharganj; F = Uttam Nagar, Hari Nagar, Dilshad Garden; G = Tagore Garden, Dabri; H = Sultanpur Majra. Real ₹/sqm figures exist per category (A: ₹7.74 lakh/sqm land cost down to H: ₹23,280/sqm).
- **Confirmed for Gurugram**: sector-wise collector rates officially published by gurugram.gov.in as PDFs (2024-25 rates), matching how our Gurugram pins are already organized (Sector 14, Sector 55, Cyber City, etc.).
- **Not yet verified**: Faridabad (likely same Haryana collector-rate system as Gurugram, needs confirming) and Noida/Ghaziabad (UP has its own circle-rate system, needs confirming).

**I was mid-way through asking which scope to pursue** when the question tool failed with a permission-stream error and cut the session off. The three options on the table were: (a) verify Faridabad + Noida/Ghaziabad first, then build all ~86 pins in one pass (recommended, avoids shipping incomplete coverage again); (b) ship Delhi + Gurugram now (~65 pins) as partial coverage, treat the rest as a follow-up; (c) pause this issue entirely for now.

**Immediate next step on resuming**: re-ask that scope question, then (once answered) research the remaining 1-2 regions if needed, compile everything into a new data file in the pipeline (something like `data/raw/price_tier_by_pin.json`), wire it into `scoring.py` as a non-composite "price context" field (same pattern as `crime_percentile` — informational, not folded into the NQI weight), and build a UI display on the report page clearly labeled "government minimum valuation rate, not market price" to avoid the same false-precision trap avoided with crime.

## General working pattern established this session

1. For any UI/feature change: research/verify data availability first if new data is involved (learned this the hard way with the population dead-end — don't promise something before confirming the underlying data actually supports it at the needed granularity).
2. Make code edits directly via Read/Edit tools on the mounted repo folders (they're the user's real files, not copies).
3. Run `npx eslint <file>` after every change and compare error count to the pre-existing baseline (currently: `pages/index.js` 1 error, `pages/report/[pin].js` 6 errors, `pages/compare.js` 0 errors — all pre-existing/unrelated to work done this session, never introduce new ones).
4. Give the user exact terminal commands for git add/commit/push (never run git myself) plus a reminder to run `npx vercel --prod` since deploys aren't automatic.
5. When something "doesn't appear" live, check in this order: (a) was it actually pushed + deployed via `vercel --prod`, (b) is it a Vercel edge-cache issue (test with `?cb=` cache-buster), (c) only then assume a real bug.
