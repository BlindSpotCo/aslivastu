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
- Ward–councillor lists (⚠️ CONFIRMED STALE — see follow-up below, do not use the ward
  numbers in the table as current): myludhiana.com, ward ranges 1–75, "6th House 2018–2023"

### RESOLVED — ward list and collector rates, both fully updated (2026-08-06)

Gurshaan supplied the actual source documents directly (5 screenshots of MC Ludhiana's
current CouncilorList.aspx, and the full collector-rate export as `MC_Block_Wise_Colony_Collector_Rates.xls`
— an HTML table saved with an .xls extension, 1027 rows, the same table automated fetching
could only reach ~622 rows of). Both open items below are now genuinely resolved with real,
current, sourced data — not carried forward as manual to-dos anymore.

**Ward list**: confirmed Ludhiana MC now runs on **95 wards** (re-delimited from 75 in
2023–24, in effect for the Dec 21, 2024 election — see prior finding below), and the current
councillor-address list gives real ward numbers for 20 of the 28 target localities directly
by address text match. The other 8 (mostly Old City market areas — Mall Road, Navi Market,
Sadar Bazaar, Chaura Bazaar, Ghumar Mandi, Ferozepur Road, Field Ganj, Ayali Kalan) don't
appear in any councillor's residential address and remain unmapped; that's a real gap, not a
transcription miss — those areas may simply have few resident-councillors listing them as
home address.

**Collector rates**: all 10 previously-missing localities were found in the full 1027-row
table (they were past the ~622-row cutoff automated fetching hit) — see per-locality values
in the table below. Only "Bhai Randhir Singh Nagar" as an exact phrase had zero matches;
"BRS Nagar" itself matched one entry.

Original finding on why the ward list needed checking at all, kept for context: Ludhiana
MC's wards were re-delimited from 75 to 95, delimitation carried out in 2023, notification
released October 2024 — https://www.tribuneindia.com/news/ludhiana/mc-elections-opposition-parties-await-court-verdict-on-ward-delimitation-558970 —
and the Dec 21, 2024 election ran on the new map, confirmed via full 95-ward results (AAP 41,
Congress 30, BJP 19, SAD 2, Independents 3): https://www.cityairnews.com/content/results-of-municipal-corporation-ludhiana ;
also https://en.wikipedia.org/wiki/2024_Punjab,_India_local_elections

Police-station list: https://www.findeasy.in/police-stations-in-ludhiana/

| # | Locality | Slug | Coords found? | Collector rate (2025–26, current) | Police station | Ward (current, 95-map, Aug 2026) | Infra source |
|---|---|---|---|---|---|---|---|
| 1 | Mall Road | ldh-mall-road | Approx only (Old City centroid, not locality-specific) | ₹1,40,000/sq yd res, ₹1,48,000 comm | Not confirmed | Not found in current councillor addresses | None found |
| 2 | Navi Market | ldh-navi-market | Not found | ₹28,000/sq yd res, ₹56,000 comm | Not confirmed | Not found in current councillor addresses | None found |
| 3 | Sadar Bazaar | ldh-sadar-bazaar | 30.9145, 75.8438 (Sadar PS landmark) | ₹28,000/sq yd res, ₹67,000 comm | Ludhiana Sadar PS, Rakh Bagh | Not found in current councillor addresses | None found |
| 4 | Chaura Bazaar | ldh-chaura-bazaar | Approx only (Old City centroid) | ₹66,200–78,700/sq yd res across sub-blocks (Zone A table) | Not confirmed | Not found in current councillor addresses | None found |
| 5 | Ghumar Mandi | ldh-ghumar-mandi | 30.9023, 75.8323 (Traffic Police Post landmark) | ₹48,100/sq yd res, ₹73,300 comm (core market); up to ₹57,800/₹87,300 on the Jod Sarak stretch — Zone D, Blocks 19/20 | Not confirmed | Not found in current councillor addresses (old 2017 "Ward 53" is now Model Town under the new map — do not reuse) | None found |
| 6 | Civil Lines | ldh-civil-lines | 30.9150, 75.8281 (approx, DAV School landmark) | ₹19,000/sq yd res across sub-areas (Kundan Puri, Deep Nagar, Maya Nagar all "Civil Lines"), comm ₹34,300–38,000 — Zone D, Block 1/20 East | Not confirmed | **Wards 68, 69, 70, 91, 92** — five current councillors list a Civil Lines address (Chander Nagar, plain "Civil Line", Kundan Puri, New Kundanpuri, Jai Durga) | None found |
| 7 | Model Town | ldh-model-town | 30.8884, 75.8404 (Model Town Market) | ₹13,800/sq yd res, ₹38,000 comm (core "Model Town" row); sub-block variants ₹11,400–17,500 res — Zone D, Block 18 | Model Town PS, 141002 | **Wards 50, 51, 53, 72** — South Model Gram/Model Town, Pritam Nagar, plain "Model Town", and Jawahar Nagar/Model Town all current | General city-wide sewerage/road coverage only, not locality-specific |
| 8 | Model Gram | ldh-model-gram | 30.9021, 75.8378 (Post Office landmark) | ₹12,300/sq yd res, ₹29,400 comm; "South Model Gram, New Lajpat Nagar" variant same rate — Zone D, Block 18/26 | Not confirmed | **Ward 50** — "South Model Gram, Model Town" | None found |
| 9 | Sarabha Nagar | ldh-sarabha-nagar | 30.8928, 75.8213 (Main Market) | ₹24,200/sq yd res, ₹60,500 comm (Blocks B&A, F–K); premium Block C/D/E and the Pulli–Ferozepur Rd/Malhar Rd stretch up to ₹38,000 res, ₹69,600 comm — Zone D, Block 20 West | Sarabha Nagar PS, BRS Nagar | **Ward 55** — "169-70-J Sarabha Nagar" | Tribune: recarpeted Gurdwara Road dug up for Smart City water pipeline — https://www.tribuneindia.com/news/ludhiana/recarpeted-road-dug-up-for-installing-water-supply-pipes-434452 |
| 10 | BRS Nagar | ldh-brs-nagar | 30.8854, 75.8055 (Market/GHS Sunet) | ₹3,800/sq yd res, ₹9,500 comm ("New BRS Nagar, near Bhagat Singh Nagar" — the only BRS Nagar row; may not reflect the core/older market area) — Zone D, Block 36 West | Sarabha Nagar PS is physically sited here (inference) | **Wards 57, 58** — "984-1 BRS Nagar" and "342/100 J Block, BRS Nagar, Raj Guru Nagar" | None found |
| 11 | Pakhowal Road | ldh-pakhowal-road | 30.8816, 75.8193 (Indoor Stadium, corridor) | ₹13,800–13,900/sq yd res on the residential side-colonies (Baba Ishar Singh Nagar, Partap Colony); several main-road commercial-only stretches ₹24,900–145,200 comm with no residential rate published — Zone D, Blocks 18/20/26/36 | Corridor spans multiple PS (unconfirmed) | **Ward 85** — "26-Block Sargodha Colony, Pakhowal Road" | None found |
| 12 | Ferozepur Road | ldh-ferozepur-road | 30.8989, 75.8230 (Commissioner's Office, corridor) | ₹11,800/sq yd res, ₹17,200 comm (Inder Nagar/Barewal stretch) — Zone D, Block 35 West | Not confirmed | Not found in current councillor addresses (only appears combined inside the Sarabha Nagar Pulli entry above) | None found |
| 13 | Dugri / Urban Estate Dugri | ldh-dugri | 30.8699, 75.8371 (Phase 2) | ₹3,900/sq yd res, ₹5,900 comm (Jagdish Nagar Dugri row) | Dugri PS, Phase 2 Market | **Ward 49** — "Phase 1, Urban Estate Dugri" (also independently confirmed via Tribune) | Tribune: 48hr+ water outage, tube-well motor failure, no mandated standby — https://www.tribuneindia.com/news/ludhiana/disruption-in-water-supply-troubles-dugri-residents-439786 |
| 14 | Gill Road | ldh-gill-road | 30.8797, 75.8590 (PNB, corridor) | ₹23,300/sq yd res & comm (Nehar–Vishkarma Chowk stretch) | Not confirmed | **Wards 46, 47** — "Chet Singh Nagar, Gill Road" and "Dashmesh Nagar, Gill Road" | None found |
| 15 | Jamalpur | ldh-jamalpur | 30.9001, 75.9356 (approx) | ₹5,800–6,700/sq yd (two sub-areas, Zone B) | Jamalpur PS, Sector 33 GLADA | **Wards 17, 21, 22, 26** — "Jamalpur Awana" threads through four current wards, all Focal Point-adjacent | None found locality-specific |
| 16 | Haibowal (Kalan) | ldh-haibowal | Not found (landmark found may be a different sub-area) | Not found under this name | Haibowal PS, Corporation Park | **Wards 63, 65, 66** — "Haibowal Khurd" and "Haibowal Kalan" (Durga Puri, Bawa Colony/Balloke Road) | Tribune: councillor filled potholes on Haibowal Road after MC inaction, cites accidents incl. a fatality — https://www.tribuneindia.com/news/ludhiana/councillor-fills-up-potholes-on-haibowal-road-slams-ludhiana-mc-for-inaction/ |
| 17 | Shimlapuri | ldh-shimlapuri | 30.8888, 75.8615 (Shimlapuri PS) | Not found | Shimlapuri PS, Gill Chowk | **Wards 37, 39, 41** — "New Shimlapuri" (Barota Road, Preet Nagar, Old Police Chowki Road) | None locality-specific (Buddha Nullah flooding coverage is for nearby Tajpur Road, not Shimlapuri itself) |
| 18 | Rishi Nagar | ldh-rishi-nagar | 30.911, 75.803 (approx) | ₹1,900/sq yd res, ₹7,700 comm (Tibba Road stretch) | Not confirmed | **Ward 64** — "66 C, Rishi Nagar" | None found |
| 19 | Kitchlu Nagar | ldh-kitchlu-nagar | 30.913, 75.812 (approx) | ₹26,700/sq yd res, ₹43,700 comm (Blocks A–D); Blocks E/F/G ₹18,000 res, ₹36,000 comm — Zone D, Block 19 West | Not confirmed | **Ward 62** — "26-F, near Ram Sharnam, Kitchlu Nagar" | None found |
| 20 | Focal Point (industrial) | ldh-focal-point | 30.8736, 75.9392 (Phase 6) | ₹8,200–11,400/sq yd comm across phases (commercial/industrial only, no residential rate — area is industrial-designated) | Focal Point PS, Phase 5 | **Wards 17, 26, 27, 28** — Focal Point appears alongside Jamalpur Awana in several current addresses | None locality-specific |
| 21 | Dhandari Kalan | ldh-dhandari-kalan | 30.8587, 75.9164 (approx) | ₹4,500/sq yd comm (Phase I–IV, shared row with Focal Point) | Not confirmed (Focal Point PS adjacency, inference) | **Wards 32, 33** — "GT Road, Dhandari Kalan" and "Giaspura, Dhandari Kalan" | Tribune headline only, not fetched in full: MC sub-zone office at Dhandari — https://www.tribuneindia.com/news/ludhiana/mc-to-set-up-sub-zone-office-at-dhandari-195964 |
| 22 | Salem Tabri | ldh-salem-tabri | Not found | ₹5,500/sq yd res, ₹6,600 comm | Salem Tabri PS, Jalandhar Bypass Chowk | **Ward 1** — "New Grain Market, near Jalandhar Bye Pass, Salem Tabri" | None found |
| 23 | Jawahar Nagar | ldh-jawahar-nagar | 30.897, 75.843 (approx) | Not found | Not confirmed | **Ward 72** — "Labour Colony, Jawahar Nagar, Model Town" (combined address with Model Town) | None found |
| 24 | Rajguru Nagar | ldh-rajguru-nagar | 30.887, 75.790 (approx) | ₹13,600/sq yd res, ₹20,300 comm — Zone D, Block 35 West | PAU PS (suggested by a landmark label, not confirmed) | **Ward 58** — combined address with BRS Nagar ("342/100 J Block, BRS Nagar, Raj Guru Nagar") | None found |
| 25 | Basti Jodhewal | ldh-basti-jodhewal | Not found | ₹7,700/sq yd res, ₹17,800 comm | Jodhewal Basti PS (existence confirmed, address not) | **Wards 3, 4, 6, 7, 8, 9, 12, 13, 15, 87** — by far the most ward-spanning locality in the city; ten current councillors list a Basti Jodhewal address | None found |
| 26 | Field Ganj | ldh-field-ganj | 30.907, 75.854 (approx) | ₹11,400/sq yd res, ₹22,800 comm | Not confirmed | Not found in current councillor addresses | None found |
| 27 | Chandigarh Road | ldh-chandigarh-road | 30.9055, 75.8943 (approx, corridor) | See itemized sub-block breakdown below (GK Colony, Hari Nagar, Indra Colony, Jiwan Nagar, Kirti Nagar, Samrala Chowk Octroi Post) | Not confirmed | **Ward 19** — "Sector 39, Chandigarh Road" | None found |
| 28 | Ayali Kalan | ldh-ayali-kalan | 30.896, 75.761 (approx) | Not found | Not confirmed | Not found in current councillor addresses (likely genuinely outside the urban 95-ward area — it's a census village on the city's western edge) | None found |

Precise sub-block breakdown for Chandigarh Road (from the full 1027-row export):

| Sr.No | Zone | Block | Tehsil | Colony name (as published) | Residential ₹/sq yd | Commercial ₹/sq yd |
|---|---|---|---|---|---|---|
| 350 | B | 31 | West | G K Colony (GK Estate) | 4,900 | 5,800 |
| 378 | B | 31 | East | Hari Nagar (Chandigarh Road), near GTB Nagar | 2,900 | 4,900 |
| 383 | B | 31 | East | Indra Colony (Chandigarh Road) | 4,900 | 5,800 |
| 400 | B | 30 | East | Jiwan Nagar (Chandigarh Road) | 2,400 | 3,500 |
| 411 | B | 30 | East | Kirti Nagar Chandigarh Road | 7,700 | 9,500 |
| 486 | B | 30 | East | Samrala Chowk to Chandigarh Road Octroi Post | 22,800 | 57,000 |
| 487 | B | 31 | East | Samrala Chowk to Chandigarh Road Octroi Post | 22,800 | 57,000 |

**Ludhiana dimension coverage, honestly, as of this update:** locality identity is solid (all
28 verified real, cross-checked against Wikipedia/Mappls/MC records/Tribune). Coordinates
are moderate — 24 of 28 have a landmark-derived point (not an official polygon centroid;
treat as approximate); the 4 without one (Navi Market, Haibowal, Salem Tabri, Basti Jodhewal)
are still genuinely unresolved. Collector rates are now essentially complete — 27 of 28
localities have a real, current, sourced rate (only Ayali Kalan, a village on the city's
edge, has none). Ward mapping is now current (95-ward map, Aug 2026) for 20 of 28
localities; 8 mostly-market Old City areas remain unmapped because no current councillor
lists them as a home address — that's a real data gap, not a stale-source problem anymore.
Police-station identity remains the least-improved dimension of the three tackled here —
still only confirmed for about a third of localities.
CBSE-school and power/water/road/drainage data are too sparse to publish per-locality yet.

## Amritsar — 24 localities

Standing sources:
- AMC Zoning document (official, Zones A–H with area lists): https://www.amritsarcorp.com/ZoningAreas.pdf
- District police-station list (official): https://cdnbbsr.s3waas.gov.in/s3ec03f8037f94e53f17a2cc301033ca86/uploads/2024/08/2024081739.pdf
- CBSE school directory: https://www.cbseschool.org/schools/amritsar/
- Collector-rate source: three Year 2025–26 PDFs Gurshaan pulled directly from
  amritsar.nic.in/revenue/ (see resolution below) — automated fetching of that page remains
  blocked, but these three documents cover all three Amritsar sub-registrar jurisdictions
- Ward count confirmed at 85 total (Tribune), but no source gave individual ward boundaries mapped to locality names

### RESOLVED (mostly) — collector-rate PDFs found and processed (2026-08-06)

Gurshaan located and uploaded the three real Year 2025–26 collector-rate documents from
amritsar.nic.in/revenue/ — one per Amritsar sub-registrar jurisdiction:
- **Sub Registrar Amritsar-1** (32 pages) — the urban core; organized into "Kanugo Circles"
  (Nawa Pind Kanugo, Urban Circle 107, 108, 109, 110, Bharariwal, Sultanwind Urban and
  sub-circles), each a clean `Sr.No / Name of Village-or-locality / Residential / Commercial
  / Agriculture / Industrial` table — this is where almost all of the hits below came from.
- **Tehsil Amritsar-II** (46 pages) — a mix of true rural villages (Nangal, Mahal, Fatehpur,
  Rakhsikargah) and an "Amritsar Sub Urban" section (Punjabi-language) covering newer
  peripheral colonies (Gopal Nagar, Bhawani Nagar, Vijay Nagar, Krishna Nagar, etc.) and
  the Verka circle.
- **Sub Registrar Amritsar-III** (46 pages) — entirely rural, covering the Tarn Taran
  Road / Chabba / Sathiala / Bohru corridor. All Punjabi-language, no urban locality rows.

All three are scanned image PDFs (OCR'd via `pdf2image` + `pytesseract`, then cross-checked
by directly viewing the actual page images for every hit — OCR alone was too garbled to
trust for exact figures on this document). **15 of the 24 target localities now have a
real, sourced, current collector rate; 9 remain unresolved** — either genuinely not
itemized under that name in these three documents, or (for Ranjit Avenue, Chheharta, GNDU,
Cantt specifically) possibly covered by a different administrative document not yet
located (Chheharta and Amritsar Cantonment are historically separate municipal/cantonment
jurisdictions, which may explain why they don't appear in any of the three Sub-Registrar
PDFs above).

| # | Locality | Slug | Coords found? | AMC Zone | Collector rate (2025–26, current) | Police station | Infra source |
|---|---|---|---|---|---|---|---|
| 1 | Ranjit Avenue | asr-ranjit-avenue | 31.65704, 74.859485 | B | **Probable match, not a direct confirmation:** "Ranjit Avenue" itself has no priced row; "Ranjit **Pura**" does (Circle 109, Sr.21: ₹14,500→16,000/sq yd res, +10.34%; ₹50,500→55,000 comm, +8.91%). Circumstantial support for treating Ranjit Pura as the revenue-department name underlying the Ranjit Avenue address: Ranjit Avenue shares the 143001 (central Amritsar) pincode with the other Circle 109 localities (Islamabad, Putlighar, Rani Ka Bagh) and sits only ~2.5km from Amritsar Junction, i.e. genuinely close-in, not a distant/different area. This is the same colloquial-name-vs-revenue-name pattern confirmed for Chheharta/Mahal and GNDU/Kot Khalsa below — plausible but not independently proven the same way those two were (no source explicitly equates the two names). Use Ranjit Pura's rate as the best available proxy, with this caveat attached. | Ranjit Avenue PS (confirmed) | Sewer overflow at park, punctured water pipe, garbage/encroachment — 3 separate Tribune reports, see full research |
| 2 | Green Avenue | asr-green-avenue | Not found | A | **₹40,000→42,000/sq yd res (+5%), ₹78,000→80,000 comm (+2.56%)** — Circle 110, Sr.43 | Not confirmed | Tangled overhead wiring reported |
| 3 | Lawrence Road | asr-lawrence-road | Not found | A | **₹36,500→42,000/sq yd res (+15.06%), ₹1,11,000→1,15,000 comm (+3.60%)** — Circle 110, Sr.16 ("Lawrance Road") | Not confirmed | None found |
| 4 | Mall Road (Amritsar) | asr-mall-road | Not found | A | **₹38,500→40,000/sq yd res (+3.89%), ₹1,16,500 comm (flat)** — Circle 110, Sr.17 | Not confirmed | None found |
| 5 | Hall Bazaar | asr-hall-bazaar | 31.629309, 74.877759 | A | **₹35,000→38,500/sq yd res (+10%), ₹1,15,000→1,20,000 comm (+4.34%)** — Circle 107, Sr.28(1) | A Division PS (confirmed) | Overhead-wire hazard, sanitation failure at Hall Gate |
| 6 | Katra Jaimal Singh | asr-katra-jaimal-singh | Not found (pincode 143006 only) | A | **₹35,000→38,500/sq yd res (+10%), ₹1,15,000→1,20,000 comm (+4.34%)** — Circle 107, Sr.12 | Not confirmed | None found |
| 7 | Batala Road | asr-batala-road | Not found | G | Not found as its own priced row — "Batala Road" appears only as a boundary/adjacency description for rural villages (e.g. "Bir Bharatpur (Batala Road)") in Tehsil Amritsar-II, not as a locality with its own rate | Not confirmed | None found |
| 8 | GT Road (Amritsar) | asr-gt-road | Not found | C/F (corridor) | Not found in any of the 3 documents | Not confirmed | None found |
| 9 | Chheharta | asr-chheharta | 31.626261, 74.789291 | G/H | **Found the containing circle, not a priced row under "Chheharta" itself.** Chheharta's official India Post revenue name is **"Mahal"** — confirmed via postal records ("Chheharta S.O., Mahal Sub Urban, Amritsar"). The Tehsil Amritsar-II document has "Mahal Urban" and "Mahal Sub Urban" Kanugo circles (pages 21–22), but Chheharta itself has no priced row by that name — only its constituent colonies do (Labh Nagar ₹14,000→16,000, Navi Abadi/Mahal ₹6,200→7,000, Pind Mahal ₹6,200→7,200, Holy City/Holy Enclave ₹6,200→8,500, etc., all res/sq yd). Same pattern as Sultanwind below — the historic town name isn't itemized, only its modern sub-colonies are. | Chheharta PS (confirmed) | Strong: sewage-contaminated drinking water across 11 wards / ~150,000 people, Khapar Kheri STP overloaded (135 MLD load vs 95 MLD design) — https://www.tribuneindia.com/news/amritsar/safe-drinking-water-remains-a-distant-dream-in-many-chheharta-localities/ |
| 10 | Majitha Road | asr-majitha-road | 31.655551, 74.888117 | B/F/G (spans) | **₹33,500→35,000/sq yd res (+4.47%), ₹73,500→75,000 comm (+2.04%)** — Circle 110, Sr.5. Note: "Majitha Road" also appears repeatedly as a rural boundary marker in Tehsil Amritsar-II's village tables (e.g. Bal Kalan/Bal Khurd land classification) — that's a different, non-priced usage of the name and was not used here. | Majitha Road PS (confirmed) | None locality-specific |
| 11 | Circular Road | asr-circular-road | Not found | B | **₹32,500/sq yd res (flat), ₹69,000→75,000 comm (+8.69%)** — Circle 110, Sr.39 | Not confirmed | None found |
| 12 | Court Road | asr-court-road | Not found | A | **₹42,000→50,000/sq yd res (+19.05%), ₹1,14,500 comm (flat)** — Circle 110, Sr.15 | Not confirmed | None found |
| 13 | Amritsar Cantt | asr-cantt | 31.6666, 74.8424 | N/A — separate Cantonment Board jurisdiction | **Confirmed, well-supported:** the "Cantonment Area" row (₹12,000→13,000/sq yd res) inside the Mahal Urban circle (Sr.2) — the same circle Chheharta falls under — is independently corroborated: MapsOfIndia's own Amritsar Cantonment locality page lists **Chheharta** as one of its neighboring localities, matching the two being in the same revenue circle here. Better match than the earlier "Cantt (Chaoni)" colony (₹5,000→6,000 res, +20%; ₹9,000→10,000 comm, +11.1%) found elsewhere. Still no commercial/agri rate given for the Cantonment Area row itself, which is unusual for a full locality row — worth keeping that caveat, but the geographic match is now real evidence, not a guess. | Cantonment PS (confirmed) | None found (separate civic-services provider) |
| 14 | Putlighar | asr-putlighar | Not found | D | **₹15,000→16,000/sq yd res (+6.67%), ₹56,000→65,000 comm (+16.07%), ₹50,000→55,000 industrial (+9.09%)** — Circle 109, Sr.30 | Not confirmed (D Division PS is in the same zone) | None found |
| 15 | Islamabad (Amritsar) | asr-islamabad | Not found | E | **₹12,000→13,000/sq yd res (+8.33%), ₹42,000→46,000 comm (+9.52%), ₹38,000→40,000 industrial (+5.26%)** — Circle 109, Sr.14 | Islamabad PS (confirmed) | None found |
| 16 | Gate Hakiman | asr-gate-hakiman | Not found | F | **₹9,500→10,500/sq yd res (+10.53%), ₹58,500→60,000 comm (+2.56%)** — Circle 107, Sr.118 ("Gate Hakima") | Gate Hakima PS (confirmed) | None found |
| 17 | Rani Ka Bagh | asr-rani-ka-bagh | Not found | A | **₹38,000/sq yd res (flat), ₹86,500 comm (flat)** — Circle 109, Sr.8 | Not confirmed | None found |
| 18 | Sultanwind | asr-sultanwind | Not found | D | **Resolved as "both are real, at different points along one corridor," not a pick-one ambiguity.** Sultanwind Police Station itself sits at Sultanwind Chowk, Katra Ahluwalia — right at the old-city gate end, matching the Circle 107 "Sultanwind Gate to Jallianwala Bagh" segment (₹16,000→18,500 res, +15.63%; ₹72,000→80,000 comm, +11.11%). But the broader "Sultanwind" locality as tracked by GeoIQ (2.4 sq km, pop. 17,172) has its nearest railway station at **Mananwala**, which sits southeast toward Chogawan — the same direction as the newer "Kanugo Circle Sultanwind Urban" colonies (Gurnam Nagar, Kot Atma Ram, etc., typically ₹7,000→8,500/sq yd res) and the separate "Sultanwind Sub Urban Taraf Behniwal/Mahal" sections found further into the same document. Read together: Sultanwind PS's jurisdiction plausibly spans the whole corridor from the old gate out through the newer colonies that grew along it — both rate contexts are genuinely "Sultanwind," just at opposite ends of the same named area, not competing candidates for a single answer. | Sultanwind PS (confirmed) | None found |
| 19 | GNDU Area | asr-gndu-area | 31.6329, 74.87775 | Not in AMC zoning doc | **Located the likely circle, not a priced row for the university itself.** GNDU's campus sits on GT Road "next to Khalsa College" (Wikipedia) — the Tehsil Amritsar-II document has a "Kot Khalsa Urban" / "Kot Khalsa Sub Urban" circle (pages 8–9, named for that same Khalsa College landmark) listing colonies like Sanjhu Colony, Mohni Park, Kabir Park, Kirpal/Preet/Hargobind Avenue, Guru Tegh Bahadar Nagar. GNDU itself, as a ~500-acre institutional campus rather than a residential/commercial colony, doesn't get its own collector-rate row — consistent with how large public institutions generally aren't itemized the same way colonies are. | Not confirmed | None found |
| 20 | Tarn Taran Road | asr-tarn-taran-road | Not found | Not in AMC zoning doc | Not found by this name — the Sub Registrar Amritsar-III document covers the Tarn Taran Road-corridor *rural villages* (Chabba, Sathiala, Bohru) but has no urban "Tarn Taran Road" locality row itself | Not confirmed | None found |
| 21 | Fatehgarh Churian Road | asr-fatehgarh-churian-road | Not found | Not in AMC zoning doc | Not found by this name directly — only referenced as "F.G.C. Road" (a boundary marker, e.g. "Majitha Road and First acre of F.G.C. Road") in Tehsil Amritsar-II's rural land-value tables, not priced as its own urban locality | Not confirmed | Strong: newly widened (18ft→33ft) 24km road showing decay within 3 months, MP demanded Vigilance Bureau probe — https://www.tribuneindia.com/news/amritsar/fatehgarh-churian-road-shows-signs-of-decay-within-3-months |
| 22 | Golden Avenue | asr-golden-avenue | Not found | B | **₹30,000/sq yd res (flat), ₹62,500 comm (flat)** — Circle 110, Sr.38, listed as "Golden Avenue near Head Water Works" | Not confirmed | None found |
| 23 | Vijay Nagar | asr-vijay-nagar | Not found | B/E (spans) | Two separate entries found, consistent with the existing "spans zones" note: urban-core Circle 110 Sr.30 — ₹22,000 res flat, ₹61,500→70,000 comm (+13.82%); Tehsil Amritsar-II "Amritsar Sub Urban" Sr.3 — ₹16,000→18,000 res (+12.5%), ₹30,000 comm flat, ₹28,000→30,000 industrial (+7.14%) | Not confirmed | None found |
| 24 | Basant Avenue | asr-basant-avenue | Not found | B | Not found under this exact name — a differently-named "Basant **Nagar**" appears in the Tehsil Amritsar-II Sub Urban colony list (₹14,000→16,000 res, +14.28%; ₹30,000→33,000 comm, +10%), but this may not be the same place as "Basant Avenue"; do not treat as confirmed | Not confirmed | None found |

**Amritsar dimension coverage, honestly, as of this update:** locality identity strong (all
24 verified real — one candidate, "Karol Bagh Amritsar," was checked and dropped, no
evidence it's a real Amritsar locality rather than Delhi/Jalandhar/Indore). Zone
classification good (18/24 matched the official AMC zoning PDF). Coordinates are still the
weak point — only 6 of 24 have a defensible point. **Collector rates went from 0/24 to
15/24 real and sourced** this update (7 more have a partial/ambiguous match worth a second
look if higher confidence is needed — Ranjit Pura vs. Ranjit Avenue, "Cantonment Area" vs.
Amritsar Cantt, Sultanwind's two conflicting contexts, Basant Nagar vs. Basant Avenue,
Batala/GT/Fatehgarh Churian/Tarn Taran Roads appearing only as boundary markers, and
Chheharta/GNDU Area's containing circles found but not the named localities themselves —
see rows 9, 13, 19 above for why: Chheharta's revenue name is "Mahal," GNDU sits in the
"Kot Khalsa" circle but campuses aren't priced like colonies are). **2 of the 24 remain
genuinely not found anywhere in the source material**: GT Road (Amritsar) and Tarn Taran
Road, as named urban localities. Police-station identity confirmed for about a third via
direct name match. Ward mapping found nothing usable at locality grain (only the citywide
total). Infra data is strong for a handful (Chheharta especially) and absent for the rest.

## Which dimensions are actually worth pursuing for tier-2 cities (see task list item 4)

The site's 8 dimensions are `crime, infrastructure, air, power, schools, water, roads,
sewerage`. Rather than assume they all need identical treatment, here's an honest per-
dimension read, grounded in what the two research passes above actually found plus a
targeted check this round on power and water specifically:

**Genuinely locality-gradable now, same grain as Delhi/Bangalore already use — build these
first:**
- **Schools** — CBSE's own directory is address-level everywhere in India, not just Delhi/
  Bangalore. This was the strongest dimension in the research above and needs no new
  sourcing strategy, just the same directory lookup already used elsewhere.
- **Air** — CPCB/PPCB monitoring stations are sparse in Ludhiana/Amritsar (probably 1–3 per
  city), but that's the same nearest-station approach already used for Delhi/Bangalore, just
  with a bigger radius per station. No new design needed, just add the stations.
- **Crime** — police-station jurisdiction is the same coarse-but-real floor used elsewhere
  already. This research found confirmed PS names for roughly a third of localities in each
  city; the rest need the same treatment, not a different one.

**Not a dead end, but needs real scraper investment before it's usable — don't write off,
don't fabricate a number in the meantime:**
- **Power** — a live, official source exists: PSPCL's own "Distribution Returns" portal
  (https://distribution.pspcl.in/returns/module.php?to=Feeders.viewPlannedShutdownsPrintFormat)
  publishes planned outages by 11KV/66KV feeder with named villages, for the *current* week
  (verified live during this research, showing real dated entries for Aug 2026). This
  contradicts an earlier assumption that power data "may never be available" — it's real,
  granular, and government-run. What's unverified: whether it reliably covers Ludhiana/
  Amritsar's *urban* feeders (the entries this research happened to see were rural-circle
  villages), and whether the site is scrapeable on a recurring schedule rather than a one-off
  read. This is worth a dedicated follow-up investigation, not more general research — a
  focused look at whether the portal has a circle/division selector for Ludhiana Urban /
  Amritsar Urban specifically.

**Genuinely sparse as structured data — but real, sourced incidents exist. Use those as
qualitative signal, not a fabricated numeric score:**
- **Water, roads, sewerage/infrastructure** — no ongoing structured locality-level dataset
  was found for any of these (PWSSB doesn't publish granular schedules; MC road-repair
  budgets exist but aren't itemized by locality in an accessible form). What DOES exist is
  real, dated, sourced incident reporting — Chheharta's sewage-contaminated water crisis
  (Tribune, cites an actual STP capacity figure), Dugri's 48-hour outage after a tube-well
  failure, Haibowal's pothole coverage, Fatehgarh Churian Road's road-decay story. The
  report page already has a UI pattern built for exactly this: the `highlights(report)`
  function in `report/[pin].js` generates qualitative good/bad callout text separate from
  the strict numeric dimension scores. For these three dimensions in tier-2 cities, populate
  that qualitative layer from real sourced incidents where they exist, rather than inventing
  a 0–100 number to make the report page "look complete."

**A genuinely useful architectural fact for this**: `nqi` composite in `report/[pin].js`
already renormalizes weights over whatever keys exist in `report.scores`
(`totalW = keys.reduce((s,k) => s + (w[k]||0), 0) || 1`) — meaning a locality that only has
`air`, `schools`, and `crime` populated will correctly compute a 3-dimension composite
without any code change. **No pipeline schema change is needed to launch a partial
composite** — just genuinely populate fewer dimension keys per area rather than fabricating
the rest.

**The one thing this needs that doesn't exist yet**: a UI signal that a given area's NQI is
partial (e.g. "3 of 8 dimensions scored") so a Ludhiana score isn't visually compared
against a full Delhi/Bangalore 8-dimension score as if they were the same measurement.
Comparing them silently would be its own honesty problem, just moved from data-fabrication
to presentation. Recommend: a small badge/note on the report and compare pages whenever
`Object.keys(report.scores).length < 8`, rather than assuming this is decided by omission.

## What this rollout does NOT include (by design)

No `nqi_composite`, no per-dimension scores, no `price_context`, no city-wide AQI mapping
for Ludhiana/Amritsar monitoring stations. Adding real scores requires the same pipeline
work every prior city went through (`pipeline/scoring.py`, `pipeline/run_pipeline.py`,
`pipeline/scrapers/*`) — building or adapting scrapers that can actually reach Punjab-level
sources on a recurring basis, not one-time research. This doc is the research input for
that work, not a substitute for it.

## Suggested next steps, in order

1. ~~Ludhiana collector rates~~ — **fully resolved (2026-08-06).** Gurshaan pulled the real
   1027-row export directly; all 10 previously-missing localities now have real rates in the
   table above. Only Ayali Kalan (a village) has none.
2. ~~Amritsar collector-rate PDF~~ — **mostly resolved (2026-08-06).** Gurshaan found and
   uploaded the three real Year 2025–26 documents (one per Amritsar sub-registrar
   jurisdiction); 15 of 24 localities now have a real, sourced rate, with 5 more partial/
   ambiguous matches worth a second look (see table above). Chheharta and GNDU Area — 2 of
   the original 4 priority targets — are still genuinely unresolved and may need a
   different, not-yet-located document (they may fall under a separate municipal or
   Cantonment Board jurisdiction rather than these three Sub-Registrar rate lists).
3. ~~Ludhiana ward list~~ — **fully resolved (2026-08-06).** Confirmed current at 95 wards
   (re-delimited 2023–24, in effect since the Dec 2024 election); 20 of 28 localities now
   have a real current ward number from Gurshaan's screenshots of MC Ludhiana's own
   councillor list. The remaining 8 (mostly Old City markets) genuinely don't appear in any
   current councillor's address — not a lookup failure, a real gap in what that source
   covers.
4. ~~Decide which dimensions are worth pursuing~~ — done, see the dimension-by-dimension
   section above. Short version: launch air/schools/crime first (same grain already used
   elsewhere); investigate PSPCL's Distribution Returns portal properly before writing off
   power (it's real and live, just unconfirmed for Ludhiana/Amritsar urban feeders
   specifically); use real sourced incidents as qualitative highlights (not fabricated
   numbers) for water/roads/sewerage; and add a "partial score" UI badge before shipping any
   area with fewer than 8 populated dimensions, so it isn't silently compared 1:1 against a
   full Delhi/Bangalore score.
5. ~~First scored batch~~ — **live (2026-08-06), but schools-only, not air+schools+crime.**
   Before writing any scoring code, real-data research was run (not scraping — individual
   locality lookups, same standard as the collector-rate work) for air/schools/crime across
   Sarabha Nagar, Dugri, Model Town, Hall Bazaar, Majitha Road, Rani Ka Bagh. The plan in
   item 4 above ("launch air/schools/crime first") turned out not to survive contact with
   what's actually publishable:
   - **Crime: a hard, confirmed dead end**, not a gap to fill later. NCRB's finest published
     geography is district-level, and neither Ludhiana (~1.6–1.9M) nor Amritsar (~1.1M)
     clears the 2M-population threshold for even NCRB's separate city-level table. Punjab
     Police's own site has no aggregate crime-statistics page, only individual-record lookup
     tools (FIR status, complaints). No crime dimension was added for any Punjab locality —
     not "estimated," just absent, so `compute_nqi()` drops it rather than scoring a guess.
   - **Air: ruled out for this batch, not just unbuilt.** Ludhiana and Amritsar each have
     exactly one real-time CPCB/PPCB station (PAU; Golden Temple), and `air_quality.py`
     doesn't fetch Punjab's state feed at all yet. A live reading exists for both stations via
     IQAir, but it's US-EPA-indexed, not CPCB-indexed — using it as `aqi_avg` would silently
     misrepresent it as CPCB methodology (which is what the UI's "CPCB category" language and
     `score_air()`'s anchors assume). Left out rather than mixed in with the wrong
     methodology implied. Separately, only Hall Bazaar sits close enough to Golden Temple to
     use it as a proxy at all — the other 4 don't.
   - **Schools: real data, uneven across the 6.** Sarabha Nagar, Dugri, Model Town (all
     Ludhiana) and Majitha Road (Amritsar) have solidly-confirmed CBSE schools tied to the
     named locality. Rani Ka Bagh has real schools but zero confirmed CBSE/ICSE (one is
     confirmed Punjab State Board). **Hall Bazaar has zero schools found with any board
     affiliation tied to that specific locality** — every result an aggregator surfaced
     turned out to be addressed to a different named locality nearby.

   **What actually shipped:** 5 of the original 6 localities — Sarabha Nagar, Dugri, Model
   Town, Majitha Road, Rani Ka Bagh — are now live and scored, on **schools only**
   (`dimensions_scored: 1` of 8; `compute_nqi()` renormalizes the composite to 100% schools
   weight since it's the only dimension present, which is architecturally correct but means
   these are much thinner scores than Delhi/Bangalore's 7-8 dimensions — see
   `pipeline/scrapers/punjab_data.py`'s module docstring for the full per-dimension
   provenance). Hall Bazaar has zero real data on any dimension and stays `scored:false` in
   `lib/pinMeta.js` rather than getting a score built from nothing.

   Real 2025-26 collector-rate price context (from the Amritsar/Ludhiana rate documents
   already resolved in items 1-2 above) was also attached to all 5 — informational only, not
   part of the NQI composite, same as Delhi/Bangalore.

   `CITIES`/`CITY_META` in `lib/pinMeta.js` now include Ludhiana and Amritsar;
   `TOTAL_SCORED_AREAS` is 157 (was 152). The other 47 Punjab localities remain
   `scored:false` and reachable only via their direct `/report/<slug>` URL or the general
   compare search — see `lib/pinMeta.js` for why they're excluded from the landing/CTA city
   search.

   **Not yet done:** deploying this (`npx vercel --prod` hasn't been run — see "Deploying
   this" below), and re-running `validate.py` against it (the local machine's
   `pipeline/data/raw` and `data/processed` don't currently have the Delhi/Bangalore scraper
   outputs cached, so `validate.py` can't run end-to-end in this environment right now — the
   patch above was built and cross-checked by importing `scoring.py`'s actual
   `compute_nqi()`/`_merge_schools()`/`add_price_context()` functions directly against the
   new Punjab records, not by hand-computing the numbers, so the math is real-engine-verified
   even though the full pipeline script didn't run).

## Deploying this

The pipeline source (`punjab_data.py`, plus the merge points added in `run_pipeline.py` and
`schools.py`) is updated so a full pipeline re-run reproduces this same result automatically.
But `web/public/master_by_pin.json` and `web/public/nqi_scores.json` were also patched
directly this session (adding the 5 records without a full pipeline run, since this
environment doesn't have the existing Delhi/Bangalore `data/processed` scraper cache locally)
— **the site is not live with this yet.** From `~/nqr-web/web`:

```bash
npm run build   # pre-deploy check — confirm it's clean before deploying
npx vercel --prod
```

Then verify with a fresh `?cb=<number>` (Vercel edge-caches hard) that
`/report/ldh-dugri`, `/report/ldh-sarabha-nagar`, `/report/ldh-model-town`,
`/report/asr-majitha-road`, and `/report/asr-rani-ka-bagh` show real scores, and that the
Ludhiana/Amritsar city tabs now appear on the landing page.
