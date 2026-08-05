# Punjab Rollout — Phase 1 (Ludhiana + Amritsar)

Source-of-truth tracking doc for adding Punjab as AsliVastu's third region. Referenced
from `web/lib/pinMeta.js`. Read `ADDING_A_CITY.md` first — this doc assumes you know why
Punjab uses locality slugs (`ldh-mall-road`) instead of pincodes as the area key.

**Status as of this rollout: PIN_META scaffolding only.** These 52 localities are real,
verified places — they are NOT scored. No `nqi_composite`, no dimension scores, no price
context. Visiting `/report/ldh-mall-road` today will resolve (no more silent 404/redirect
— that bug is what task #9 fixed) and correctly show "No data for this pin" rather than a
broken or fabricated score, because there is no pipeline entry for these ids yet. That is
intentional, not a bug. Do not backfill scores with estimates to make the report page
"look done" — every prior city followed real pipeline data in, and Punjab should too.

## Why 52 localities, and why coverage is uneven

Two research passes (one per city) were run against government sources, official zoning/PS
documents, established local news (Tribune India), and school directories, with an explicit
instruction not to fabricate or estimate anything. What came back was uneven — expected,
because government open data for Indian tier-2 cities is uneven. Rather than smoothing that
over, each locality below is marked with exactly what was found and what wasn't.

## Ludhiana — 28 localities

Standing sources cited repeatedly below (see full per-locality detail further down for exact
URLs where a specific claim needs one):
- MC Ludhiana Property Tax Collector Rates (official, zone A/B/C table): https://propertytax.mcludhiana.gov.in/Guest/CollectorRates.aspx
- Deputy Commissioner Ludhiana collector-rate notifications: https://ludhiana.nic.in/collector-rate-2025-26/ , https://ludhiana.nic.in/collector-rate-2024-2025/
- Secondary rate aggregator (cites official rates): https://aquireacres.com/new-collector-rates-in-punjab-2026-updated-residential-commercial-property-values
- Ward–councillor lists (⚠️ dated 2017, "6th House 2018–2023" per source PDF title — Ludhiana held a further civic election in late 2024, so ward boundaries/numbers may have changed; re-verify against a current MC ward map before treating as authoritative): myludhiana.com, ward ranges 1–75
- Police-station list: https://www.findeasy.in/police-stations-in-ludhiana/

| # | Locality | Slug | Coords found? | Collector rate | Police station | Ward (2017, unverified current) | Infra source |
|---|---|---|---|---|---|---|---|
| 1 | Mall Road | ldh-mall-road | Approx only (Old City centroid, not locality-specific) | ₹1,40,000/sq yd res, ₹1,48,000 comm | Not confirmed | Not found | None found |
| 2 | Navi Market | ldh-navi-market | Not found | ₹28,000/sq yd res, ₹56,000 comm | Not confirmed | Not found | None found |
| 3 | Sadar Bazaar | ldh-sadar-bazaar | 30.9145, 75.8438 (Sadar PS landmark) | ₹28,000/sq yd res, ₹67,000 comm | Ludhiana Sadar PS, Rakh Bagh | Not found | None found |
| 4 | Chaura Bazaar | ldh-chaura-bazaar | Approx only (Old City centroid) | ₹66,200–78,700/sq yd res across sub-blocks (Zone A table) | Not confirmed | Not found | None found |
| 5 | Ghumar Mandi | ldh-ghumar-mandi | 30.9023, 75.8323 (Traffic Police Post landmark) | Not found under this name | Not confirmed | Ward 53 (2017) | None found |
| 6 | Civil Lines | ldh-civil-lines | 30.9150, 75.8281 (approx, DAV School landmark) | Not found under this name | Not confirmed | Ward 54 (2017) | None found |
| 7 | Model Town | ldh-model-town | 30.8884, 75.8404 (Model Town Market) | Not found under this name | Model Town PS, 141002 | Wards 45/47/48 (2017, multiple touch this area) | General city-wide sewerage/road coverage only, not locality-specific |
| 8 | Model Gram | ldh-model-gram | 30.9021, 75.8378 (Post Office landmark) | Not found | Not confirmed | Ward 49 (2017) | None found |
| 9 | Sarabha Nagar | ldh-sarabha-nagar | 30.8928, 75.8213 (Main Market) | Not found under this name | Sarabha Nagar PS, BRS Nagar | Not found | Tribune: recarpeted Gurdwara Road dug up for Smart City water pipeline — https://www.tribuneindia.com/news/ludhiana/recarpeted-road-dug-up-for-installing-water-supply-pipes-434452 |
| 10 | BRS Nagar | ldh-brs-nagar | 30.8854, 75.8055 (Market/GHS Sunet) | Not found under this name | Sarabha Nagar PS is physically sited here (inference) | Ward 57 (2017) | None found |
| 11 | Pakhowal Road | ldh-pakhowal-road | 30.8816, 75.8193 (Indoor Stadium, corridor) | Not found | Corridor spans multiple PS (unconfirmed) | Not found | None found |
| 12 | Ferozepur Road | ldh-ferozepur-road | 30.8989, 75.8230 (Commissioner's Office, corridor) | Not found under this name | Not confirmed | Not found | None found |
| 13 | Dugri / Urban Estate Dugri | ldh-dugri | 30.8699, 75.8371 (Phase 2) | ₹3,900/sq yd res, ₹5,900 comm (Jagdish Nagar Dugri row) | Dugri PS, Phase 2 Market | Ward 43 (confirmed via Tribune, not just 2017 list) | Tribune: 48hr+ water outage, tube-well motor failure, no mandated standby — https://www.tribuneindia.com/news/ludhiana/disruption-in-water-supply-troubles-dugri-residents-439786 |
| 14 | Gill Road | ldh-gill-road | 30.8797, 75.8590 (PNB, corridor) | ₹23,300/sq yd res & comm (Nehar–Vishkarma Chowk stretch) | Not confirmed | Wards 44/67 (2017) | None found |
| 15 | Jamalpur | ldh-jamalpur | 30.9001, 75.9356 (approx) | ₹5,800–6,700/sq yd (two sub-areas, Zone B) | Jamalpur PS, Sector 33 GLADA | Wards 10/11/13/14 (2017) | None found locality-specific |
| 16 | Haibowal (Kalan) | ldh-haibowal | Not found (landmark found may be a different sub-area) | Not found under this name | Haibowal PS, Corporation Park | Wards 27/28 (2017) | Tribune: councillor filled potholes on Haibowal Road after MC inaction, cites accidents incl. a fatality — https://www.tribuneindia.com/news/ludhiana/councillor-fills-up-potholes-on-haibowal-road-slams-ludhiana-mc-for-inaction/ |
| 17 | Shimlapuri | ldh-shimlapuri | 30.8888, 75.8615 (Shimlapuri PS) | Not found | Shimlapuri PS, Gill Chowk | Wards 62/63 (2017) | None locality-specific (Buddha Nullah flooding coverage is for nearby Tajpur Road, not Shimlapuri itself) |
| 18 | Rishi Nagar | ldh-rishi-nagar | 30.911, 75.803 (approx) | ₹1,900/sq yd res, ₹7,700 comm (Tibba Road stretch) | Not confirmed | Ward 55 (2017) | None found |
| 19 | Kitchlu Nagar | ldh-kitchlu-nagar | 30.913, 75.812 (approx) | Not found | Not confirmed | Not found | None found |
| 20 | Focal Point (industrial) | ldh-focal-point | 30.8736, 75.9392 (Phase 6) | ₹8,200–11,400/sq yd comm across phases (commercial/industrial only, no residential rate — area is industrial-designated) | Focal Point PS, Phase 5 | Not found | None locality-specific |
| 21 | Dhandari Kalan | ldh-dhandari-kalan | 30.8587, 75.9164 (approx) | ₹4,500/sq yd comm (Phase I–IV, shared row with Focal Point) | Not confirmed (Focal Point PS adjacency, inference) | Ward 75 (2017) | Tribune headline only, not fetched in full: MC sub-zone office at Dhandari — https://www.tribuneindia.com/news/ludhiana/mc-to-set-up-sub-zone-office-at-dhandari-195964 |
| 22 | Salem Tabri | ldh-salem-tabri | Not found | ₹5,500/sq yd res, ₹6,600 comm | Salem Tabri PS, Jalandhar Bypass Chowk | Ward 25 (2017) | None found |
| 23 | Jawahar Nagar | ldh-jawahar-nagar | 30.897, 75.843 (approx) | Not found | Not confirmed | Ward 50 (2017) | None found |
| 24 | Rajguru Nagar | ldh-rajguru-nagar | 30.887, 75.790 (approx) | Not found | PAU PS (suggested by a landmark label, not confirmed) | Not found | None found |
| 25 | Basti Jodhewal | ldh-basti-jodhewal | Not found | ₹7,700/sq yd res, ₹17,800 comm | Jodhewal Basti PS (existence confirmed, address not) | Ward 22 (2017) | None found |
| 26 | Field Ganj | ldh-field-ganj | 30.907, 75.854 (approx) | ₹11,400/sq yd res, ₹22,800 comm | Not confirmed | Not found under this name | None found |
| 27 | Chandigarh Road | ldh-chandigarh-road | 30.9055, 75.8943 (approx, corridor) | ₹2,400–22,800/sq yd res across stretches (range, not itemized) | Not confirmed | Ward 9 (2017) | None found |
| 28 | Ayali Kalan | ldh-ayali-kalan | 30.896, 75.761 (approx) | Not found | Not confirmed | Not found (likely outside 1–75 range) | None found |

**Ludhiana dimension coverage, honestly:** locality identity is solid (all 28 verified real,
cross-checked against Wikipedia/Mappls/MC records/Tribune). Coordinates are moderate —
24 of 28 have a landmark-derived point (not an official polygon centroid; treat as
approximate). Collector rates matched an official table row for about half; several
prestige localities (Model Town, Sarabha Nagar, BRS Nagar, Civil Lines, Ferozepur Road)
likely exist in the underlying table under a sub-block name that wasn't queried — worth a
manual follow-up pass rather than treating "not found" here as final. Police-station
identity is the best-covered dimension. Ward mapping is usable but dated (flagged above —
re-verify before trusting). CBSE-school and power/water/road/drainage data are too sparse
to publish per-locality yet.

## Amritsar — 24 localities

Standing sources:
- AMC Zoning document (official, Zones A–H with area lists): https://www.amritsarcorp.com/ZoningAreas.pdf
- District police-station list (official): https://cdnbbsr.s3waas.gov.in/s3ec03f8037f94e53f17a2cc301033ca86/uploads/2024/08/2024081739.pdf
- CBSE school directory: https://www.cbseschool.org/schools/amritsar/
- Official collector-rate notification exists but the source PDF (amritsar.nic.in) blocked automated fetching on every attempt — a human should pull locality-wise rates from it directly rather than relying on this doc
- Ward count confirmed at 85 total (Tribune), but no source gave individual ward boundaries mapped to locality names

| # | Locality | Slug | Coords found? | AMC Zone | Police station | Infra source |
|---|---|---|---|---|---|---|
| 1 | Ranjit Avenue | asr-ranjit-avenue | 31.65704, 74.859485 | B | Ranjit Avenue PS (confirmed) | Sewer overflow at park, punctured water pipe, garbage/encroachment — 3 separate Tribune reports, see full research |
| 2 | Green Avenue | asr-green-avenue | Not found | A | Not confirmed | Tangled overhead wiring reported |
| 3 | Lawrence Road | asr-lawrence-road | Not found | A | Not confirmed | None found |
| 4 | Mall Road (Amritsar) | asr-mall-road | Not found | A | Not confirmed | None found |
| 5 | Hall Bazaar | asr-hall-bazaar | 31.629309, 74.877759 | A | A Division PS (confirmed) | Overhead-wire hazard, sanitation failure at Hall Gate |
| 6 | Katra Jaimal Singh | asr-katra-jaimal-singh | Not found (pincode 143006 only) | A | Not confirmed | None found |
| 7 | Batala Road | asr-batala-road | Not found | G | Not confirmed | None found |
| 8 | GT Road (Amritsar) | asr-gt-road | Not found | C/F (corridor) | Not confirmed | None found |
| 9 | Chheharta | asr-chheharta | 31.626261, 74.789291 | G/H | Chheharta PS (confirmed) | Strong: sewage-contaminated drinking water across 11 wards / ~150,000 people, Khapar Kheri STP overloaded (135 MLD load vs 95 MLD design) — https://www.tribuneindia.com/news/amritsar/safe-drinking-water-remains-a-distant-dream-in-many-chheharta-localities/ |
| 10 | Majitha Road | asr-majitha-road | 31.655551, 74.888117 | B/F/G (spans) | Majitha Road PS (confirmed) | None locality-specific |
| 11 | Circular Road | asr-circular-road | Not found | B | Not confirmed | None found |
| 12 | Court Road | asr-court-road | Not found | A | Not confirmed | None found |
| 13 | Amritsar Cantt | asr-cantt | 31.6666, 74.8424 | N/A — separate Cantonment Board jurisdiction | Cantonment PS (confirmed) | None found (separate civic-services provider) |
| 14 | Putlighar | asr-putlighar | Not found | D | Not confirmed (D Division PS is in the same zone) | None found |
| 15 | Islamabad (Amritsar) | asr-islamabad | Not found | E | Islamabad PS (confirmed) | None found |
| 16 | Gate Hakiman | asr-gate-hakiman | Not found | F | Gate Hakima PS (confirmed) | None found |
| 17 | Rani Ka Bagh | asr-rani-ka-bagh | Not found | A | Not confirmed | None found |
| 18 | Sultanwind | asr-sultanwind | Not found | D | Sultanwind PS (confirmed) | None found |
| 19 | GNDU Area | asr-gndu-area | 31.6329, 74.87775 | Not in AMC zoning doc | Not confirmed | None found |
| 20 | Tarn Taran Road | asr-tarn-taran-road | Not found | Not in AMC zoning doc | Not confirmed | None found |
| 21 | Fatehgarh Churian Road | asr-fatehgarh-churian-road | Not found | Not in AMC zoning doc | Not confirmed | Strong: newly widened (18ft→33ft) 24km road showing decay within 3 months, MP demanded Vigilance Bureau probe — https://www.tribuneindia.com/news/amritsar/fatehgarh-churian-road-shows-signs-of-decay-within-3-months |
| 22 | Golden Avenue | asr-golden-avenue | Not found | B | Not confirmed | None found |
| 23 | Vijay Nagar | asr-vijay-nagar | Not found | B/E (spans) | Not confirmed | None found |
| 24 | Basant Avenue | asr-basant-avenue | Not found | B | Not confirmed | None found |

**Amritsar dimension coverage, honestly:** locality identity strong (all 24 verified real —
one candidate, "Karol Bagh Amritsar," was checked and dropped, no evidence it's a real
Amritsar locality rather than Delhi/Jalandhar/Indore). Zone classification good (18/24
matched the official AMC zoning PDF). Coordinates are the weak point — only 6 of 24 have a
defensible point. Collector rates are effectively zero for named urban localities — the
official PDF blocked automated access; this needs a manual pull, not another automated
attempt. Police-station identity confirmed for about a third via direct name match. Ward
mapping found nothing usable at locality grain (only the citywide total). Infra data is
strong for a handful (Chheharta especially) and absent for the rest.

## What this rollout does NOT include (by design)

No `nqi_composite`, no per-dimension scores, no `price_context`, no city-wide AQI mapping
for Ludhiana/Amritsar monitoring stations. Adding real scores requires the same pipeline
work every prior city went through (`pipeline/scoring.py`, `pipeline/run_pipeline.py`,
`pipeline/scrapers/*`) — building or adapting scrapers that can actually reach Punjab-level
sources on a recurring basis, not one-time research. This doc is the research input for
that work, not a substitute for it.

## Suggested next steps, in order

1. Manual follow-up pass on Ludhiana collector rates for the ~15 localities marked "not
   found under this name" — the underlying MC table clearly has more rows than automated
   summarized fetches surfaced; try downloading the source table directly.
2. Manual pull of the Amritsar district collector-rate PDF (amritsar.nic.in) by a human —
   automated fetching is blocked there.
3. Re-verify the 2017 Ludhiana ward list against a current MC ward map before using it for
   anything ward-boundary-dependent (Ludhiana had a further civic election in late 2024).
4. Decide which dimensions are worth pursuing at all for tier-2 cities given the coverage
   gaps above — e.g. crime and power may simply never be available below police-station /
   feeder grain in Punjab, which might mean redesigning the NQI weighting for these cities
   rather than waiting for data that may not exist to be found.
5. Only after (1)–(4): start building actual scrapers/scoring for a first scored batch,
   probably the localities with the strongest data above (Sarabha Nagar, Dugri, Model Town
   for Ludhiana; Ranjit Avenue, Chheharta, Hall Bazaar for Amritsar) rather than all 52 at
   once.
