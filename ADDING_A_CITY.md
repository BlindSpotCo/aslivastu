# Adding a new city to AsliVastu — lessons from the Bangalore rollout

Reconstructed from the actual git history of the Bangalore launch (commits
`382ab85` → `67ed4ac`, 14 commits over ~July 19–26 2026), since most of these
problems were caught and patched *after* the initial launch rather than
before. Use this as a pre-launch checklist for the next city instead.

> Note: this file is a durable project doc, not Claude's account memory —
> memory is disabled for this Anthropic account, so this is the place a
> future session (or your cofounder) can find this context instead.

## 1. There is no single source of truth for the area list — six places, not one

`PIN_META` (pin → name/area/city) is duplicated as a literal object in **five
separate files**, plus one shared module that only one of them actually uses:

- `web/lib/pinMeta.js` — the "canonical" shared module, but only
  `web/pages/report/[pin].js` imports it.
- `web/pages/index.js` — own copy, named `PIN_META_LANDING`.
- `web/pages/compare.js` — own copy, named `PIN_META`.
- `web/pages/report.js` (the `/report?pin=` redirect page) — own copy.
- `web/pages/api/og.js` (OG image generation) — own copy.
- `web/pages/sitemap.xml.js` — own copy.

During the Bangalore rollout this caused real drift: a rural/edge-case pin
(`560082`, "Bannerghatta") was dropped from some copies before others, and
wrong pin→locality labels (see §2) had to be fixed in multiple files in the
same commit. **Budget time to update all six locations**, or — better —
finally consolidate them into `lib/pinMeta.js` and have every page import
from it before adding city #3. That refactor pays for itself the next time
this happens.

## 2. Hardcoded area-count strings are scattered across the UI

The total-areas number ("152") is typed as a literal string in at least:

- `web/pages/index.js` (hero stats row *and* the bottom CTA stats row —
  two separate spots)
- `web/pages/report/[pin].js` (header: `"152 AREAS · 2 CITIES"`)
- `web/pages/compare.js` (a similar area-count line)

When Bangalore's area count changed from 67 → 66 → the site-wide total of
152, this literal had to be found-and-replaced in each spot, and it was
wrong ("153") in at least one commit before being caught. Same
recommendation as above — worth computing this from `PIN_META.length` once
there's a single source of truth, so it can never drift again.

## 3. `cityOf()` and similar helpers are hardcoded binary (2 cities only)

`web/pages/report/[pin].js`:
```js
function cityOf(pin) { return String(pin).startsWith('560') ? 'Bangalore' : 'Delhi NCR' }
```
This — and the `blr = city === 'Bangalore'` ternaries used throughout
`source()`, the price-context labels, etc. — assumes exactly two cities and
silently mislabels anything else as "Delhi NCR". **Before adding city #3,
rewrite this as a proper pin-prefix → city lookup table**, not a boolean.
Same applies to `CITY_DEFAULT_PIN` and the Delhi/Bangalore toggle buttons —
those are hardcoded two-item arrays (`['Delhi NCR','Bangalore']`) in three
places (landing hero picker, landing bottom CTA, report page) and need a
third button/option added everywhere, not just one.

## 4. Pin→locality label accuracy needs real verification, not just a scrape

The initial Bangalore area list (`scrapers/bengaluru_data.py`, commit
`382ab85`) had **7 wrong PIN→locality mappings** discovered only after the
fact (commit `d14fe96`) — e.g. 560051 was labeled "Vasanth Nagar" but is
actually "HKP Road"; 560008 was labeled "Indiranagar" but is actually
"Ulsoor"; 560016/560036 had KR Puram and Ramamurthy Nagar swapped. One pin
(560082, "Bannerghatta") turned out to be a rural/duplicate entry and was
dropped entirely, changing the area count. **Cross-check every pin→locality
label against an authoritative source (India Post pincode directory, not
just a scrape) before launch**, not after.

## 5. Price/guidance-value estimates need real per-area anchors, not one tier formula

The initial price data used a single generic tier→price-band formula for
all of Bangalore. It was significantly off from real government guidance
values (commit `a710181`, "Recalibrate Bangalore guidance values to real
Kaveri levels") and had to be replaced with a per-PIN override table
anchored to verified real 2024 values (e.g. Koramangala ₹10–14k/sqft,
Whitefield ~₹6.5k/sqft) layered on top of the generic tier fallback. **For
the next city: find real anchor values for at least the well-known
localities before launch**, and treat the generic tier formula as a
fallback for everywhere else, not the primary source.

## 6. Live AQI needs three things per new state, not just "add it to the list"

`scrapers/air_quality.py`, commit `cbbb83f`:
- Add the new state to the CPCB fetch list (`for state in [...]`).
- Build a **station-name → pin** map — government station names have
  inconsistent spelling for the *same* physical station (e.g.
  "Kadabesanahalli" vs "Kadubeesanahalli", "Saneguruvanahalli" vs
  "Saneguravahalli" both appeared in the raw feed for Bangalore) — expect to
  find and de-duplicate these by hand, not assume clean data.
- Build a **fallback map** for pins with no CPCB station of their own,
  borrowing the nearest monitored pin's reading — Bangalore's station
  coverage is much sparser than Delhi's, so most of its 66 areas needed an
  explicit fallback entry, not a direct station.

## 7. The AQI scoring bug (not city-specific, but Bangalore's data exposed it)

Two real scoring bugs were only caught once Bangalore's AQI numbers were in
the mix (commits `3ad8ba2`, `67ed4ac`), and both affect Delhi too:
- `aqi_avg` was computed as the **mean** of pollutant sub-indices, not the
  **max** — CPCB defines AQI as the max sub-index, so a genuine PM10 spike
  was being diluted by benign gases and polluted areas looked artificially
  clean.
- `score_air()` used hard AQI category bands, producing a 15-point score
  cliff at each boundary (e.g. AQI 49.9 → 100, AQI 50.1 → 85). Replaced with
  interpolation between the CPCB category anchors.

**Worth sanity-checking `scoring.py` again once the next city's data is in**
— a new city's AQI/crime/price distribution can expose the same class of
edge case Delhi's data happened not to trigger.

## 8. Be upfront about data resolution differences between cities

Not a bug — a documented, intentional decision worth repeating: Bangalore's
crime data is tier-baseline/estimated (`sources:["bengaluru_seed"]`) rather
than the finer-grained curated data Delhi has, and it's labeled as such
rather than presented as equivalent precision. `pipeline/validate.py` has a
`check_signal_variation` check that WARNs (not fails) on this kind of
low-resolution-but-honest data. Keep applying that same honesty + validator
pattern to the next city rather than letting the UI imply uniform precision
across cities.

## Suggested order for the next city

1. Get the pin→locality list from an authoritative source and eyeball it
   yourself before writing any scraper code (§4).
2. Decide now whether to finally consolidate `PIN_META` into one shared
   module (§1) — worth doing before, not during, a third city.
3. Rewrite `cityOf()` / city-toggle lists as data-driven, not binary (§3).
4. Build the pipeline scraper with real per-area price anchors where
   available (§5), and add the new state to the live AQI fetch with a
   station-name dedup pass and fallback map (§6).
5. Re-run `validate.py` and re-check `scoring.py`'s assumptions against the
   new city's actual data spread (§7, §8) before launch, not after.
6. Update the area-count literals and city-toggle UI in every file listed
   in §1/§2 — grep for the current total (`152`) and `'Delhi NCR','Bangalore'`
   across `web/pages` to find them all.
