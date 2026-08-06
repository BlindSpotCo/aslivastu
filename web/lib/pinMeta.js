// Shared PIN -> locality map — the single source of truth for area metadata.
// Every page that needs the area list imports from here (previously this was
// copy-pasted as a separate literal object in index.js, compare.js, report.js,
// api/og.js and sitemap.xml.js — see ADDING_A_CITY.md §1 for why that was a
// problem). `city` is required on every entry now (used to be inferred from
// the pin prefix via cityOf(), which only worked for exactly two cities).
export const PIN_META = {
  "110002":{ name:"ITO",               area:"Central Delhi", city:"Delhi NCR" },
  "110003":{ name:"Lodhi Road",        area:"South Delhi", city:"Delhi NCR" },
  "110005":{ name:"Karol Bagh",        area:"Central Delhi", city:"Delhi NCR" },
  "110006":{ name:"Chandni Chowk",     area:"Old Delhi", city:"Delhi NCR" },
  "110007":{ name:"Delhi University",  area:"North Delhi", city:"Delhi NCR" },
  "110008":{ name:"Shadipur",          area:"West Delhi", city:"Delhi NCR" },
  "110009":{ name:"Model Town",        area:"North Delhi", city:"Delhi NCR" },
  "110010":{ name:"Cantonment",        area:"South Delhi", city:"Delhi NCR" },
  "110012":{ name:"Pusa",              area:"Central Delhi", city:"Delhi NCR" },
  "110016":{ name:"Hauz Khas",         area:"South Delhi", city:"Delhi NCR" },
  "110017":{ name:"Saket",             area:"South Delhi", city:"Delhi NCR" },
  "110018":{ name:"Vikaspuri",         area:"West Delhi", city:"Delhi NCR" },
  "110019":{ name:"Dwarka Sec 6",      area:"South West Delhi", city:"Delhi NCR" },
  "110020":{ name:"Okhla",             area:"South East Delhi", city:"Delhi NCR" },
  "110021":{ name:"Moti Bagh",         area:"South Delhi", city:"Delhi NCR" },
  "110022":{ name:"R.K. Puram",        area:"South West Delhi", city:"Delhi NCR" },
  "110024":{ name:"Lajpat Nagar",      area:"South Delhi", city:"Delhi NCR" },
  "110025":{ name:"Mathura Road",      area:"South Delhi", city:"Delhi NCR" },
  "110026":{ name:"Punjabi Bagh",      area:"West Delhi", city:"Delhi NCR" },
  "110032":{ name:"Anand Vihar",       area:"East Delhi", city:"Delhi NCR" },
  "110033":{ name:"Jahangirpuri",      area:"North West Delhi", city:"Delhi NCR" },
  "110034":{ name:"Pitampura",         area:"North West Delhi", city:"Delhi NCR" },
  "110036":{ name:"Alipur",            area:"North Delhi", city:"Delhi NCR" },
  "110037":{ name:"Aerocity",          area:"South West Delhi", city:"Delhi NCR" },
  "110039":{ name:"Bawana",            area:"North Delhi", city:"Delhi NCR" },
  "110040":{ name:"Narela",            area:"North Delhi", city:"Delhi NCR" },
  "110041":{ name:"Mundka",            area:"West Delhi", city:"Delhi NCR" },
  "110042":{ name:"DTU",               area:"North West Delhi", city:"Delhi NCR" },
  "110043":{ name:"Najafgarh",         area:"South West Delhi", city:"Delhi NCR" },
  "110044":{ name:"Tughlakabad",       area:"South Delhi", city:"Delhi NCR" },
  "110049":{ name:"Sirifort",          area:"South Delhi", city:"Delhi NCR" },
  "110052":{ name:"Ashok Vihar",       area:"North Delhi", city:"Delhi NCR" },
  "110053":{ name:"Maujpur",           area:"North East Delhi", city:"Delhi NCR" },
  "110058":{ name:"Janakpuri",         area:"West Delhi", city:"Delhi NCR" },
  "110063":{ name:"Paschim Vihar",     area:"West Delhi", city:"Delhi NCR" },
  "110065":{ name:"Nehru Nagar",       area:"East Delhi", city:"Delhi NCR" },
  "110067":{ name:"JNU Area",          area:"South Delhi", city:"Delhi NCR" },
  "110068":{ name:"Maidan Garhi",      area:"South Delhi", city:"Delhi NCR" },
  "110070":{ name:"Vasant Kunj",       area:"South West Delhi", city:"Delhi NCR" },
  "110073":{ name:"Jaffarpur",         area:"West Delhi", city:"Delhi NCR" },
  "110077":{ name:"Dwarka Sec 8",      area:"South West Delhi", city:"Delhi NCR" },
  "110078":{ name:"Dwarka",            area:"South West Delhi", city:"Delhi NCR" },
  "110084":{ name:"Burari",            area:"North Delhi", city:"Delhi NCR" },
  "110085":{ name:"Rohini",            area:"North West Delhi", city:"Delhi NCR" },
  "110091":{ name:"Mayur Vihar",       area:"East Delhi", city:"Delhi NCR" },
  "110092":{ name:"Patparganj",        area:"East Delhi", city:"Delhi NCR" },
  "110094":{ name:"Sonia Vihar",       area:"North East Delhi", city:"Delhi NCR" },
  "110095":{ name:"Vivek Vihar",       area:"East Delhi", city:"Delhi NCR" },
  "121001":{ name:"Faridabad",         area:"Haryana NCR", city:"Delhi NCR" },
  "121002":{ name:"Faridabad NIT",     area:"Haryana NCR", city:"Delhi NCR" },
  "122001":{ name:"Gurugram",          area:"Haryana NCR", city:"Delhi NCR" },
  "122002":{ name:"Cyber City",        area:"Gurugram", city:"Delhi NCR" },
  "122003":{ name:"Gurugram Sec 55",   area:"Gurugram", city:"Delhi NCR" },
  "122051":{ name:"Manesar",           area:"Gurugram", city:"Delhi NCR" },
  "122107":{ name:"Nuh",               area:"Haryana NCR", city:"Delhi NCR" },
  "122413":{ name:"Panchgaon",         area:"Gurugram", city:"Delhi NCR" },
  "123106":{ name:"Dharuhera",         area:"Haryana NCR", city:"Delhi NCR" },
  "124001":{ name:"Rohtak",            area:"Haryana NCR", city:"Delhi NCR" },
  "124507":{ name:"Bahadurgarh",       area:"Haryana NCR", city:"Delhi NCR" },
  "125050":{ name:"Fatehabad",         area:"Haryana NCR", city:"Delhi NCR" },
  "125055":{ name:"Sirsa",             area:"Haryana NCR", city:"Delhi NCR" },
  "131001":{ name:"Sonipat",           area:"Haryana NCR", city:"Delhi NCR" },
  "132103":{ name:"Panipat",           area:"Haryana NCR", city:"Delhi NCR" },
  "135001":{ name:"Yamuna Nagar",      area:"Haryana NCR", city:"Delhi NCR" },
  "201001":{ name:"Ghaziabad",         area:"UP NCR", city:"Delhi NCR" },
  "201301":{ name:"Noida Sec 1",       area:"UP NCR", city:"Delhi NCR" },
  "201304":{ name:"Noida Sec 137",     area:"UP NCR", city:"Delhi NCR" },
  "201309":{ name:"Noida Sec 62",      area:"UP NCR", city:"Delhi NCR" },
  // NCR fringe — in our coverage zone but no scored data yet. `scored:false`
  // lets consumers (e.g. index.js's landing search) exclude these without a
  // second hardcoded pin list — see ADDING_A_CITY.md for why duplicate lists
  // caused drift bugs before.
  "122505":{ name:"Mahendragarh",      area:"Haryana NCR", city:"Delhi NCR", scored:false },
  "122502":{ name:"Rewari",            area:"Haryana NCR", city:"Delhi NCR", scored:false },
  "122108":{ name:"Taoru",             area:"Haryana NCR", city:"Delhi NCR", scored:false },
  "122101":{ name:"Sohna",             area:"Haryana NCR", city:"Delhi NCR", scored:false },
  "122103":{ name:"Gurgaon South",     area:"Haryana NCR", city:"Delhi NCR", scored:false },
  "123001":{ name:"Jhajjar",           area:"Haryana NCR", city:"Delhi NCR", scored:false },
  "123401":{ name:"Rewari Town",       area:"Haryana NCR", city:"Delhi NCR", scored:false },
  "131029":{ name:"Kundli",            area:"Haryana NCR", city:"Delhi NCR", scored:false },
  "131027":{ name:"Murthal",           area:"Haryana NCR", city:"Delhi NCR", scored:false },
  "201102":{ name:"Loni",              area:"UP NCR", city:"Delhi NCR", scored:false },
  "201014":{ name:"Indirapuram",       area:"UP NCR", city:"Delhi NCR", scored:false },
  "201012":{ name:"Vasundhara",        area:"UP NCR", city:"Delhi NCR", scored:false },
  "201016":{ name:"Crossing Republik", area:"UP NCR", city:"Delhi NCR", scored:false },
  "201002":{ name:"Raj Nagar",         area:"UP NCR", city:"Delhi NCR", scored:false },
  "201010":{ name:"Kaushambi",         area:"UP NCR", city:"Delhi NCR", scored:false },
  "201206":{ name:"Muradnagar",        area:"UP NCR", city:"Delhi NCR", scored:false },
  "245101":{ name:"Hapur",             area:"UP NCR", city:"Delhi NCR", scored:false },
  "203001":{ name:"Bulandshahr",       area:"UP NCR", city:"Delhi NCR", scored:false },
  // ── Bengaluru (city 2) ──
  "560001":{ name:"MG Road", area:"Central Bengaluru", city:"Bangalore" },
  "560025":{ name:"Richmond Town", area:"Central Bengaluru", city:"Bangalore" },
  "560051":{ name:"HKP Road", area:"Central Bengaluru", city:"Bangalore" },
  "560052":{ name:"Vasanth Nagar", area:"Central Bengaluru", city:"Bangalore" },
  "560042":{ name:"Shivajinagar", area:"Central Bengaluru", city:"Bangalore" },
  "560002":{ name:"Chickpet", area:"Central Bengaluru", city:"Bangalore" },
  "560023":{ name:"Majestic", area:"Central Bengaluru", city:"Bangalore" },
  "560003":{ name:"Malleshwaram", area:"North Bengaluru", city:"Bangalore" },
  "560010":{ name:"Rajajinagar", area:"North Bengaluru", city:"Bangalore" },
  "560020":{ name:"Seshadripuram", area:"North Bengaluru", city:"Bangalore" },
  "560021":{ name:"Sriramapuram", area:"North Bengaluru", city:"Bangalore" },
  "560022":{ name:"Yeshwanthpur", area:"North Bengaluru", city:"Bangalore" },
  "560024":{ name:"Hebbal", area:"North Bengaluru", city:"Bangalore" },
  "560032":{ name:"RT Nagar", area:"North Bengaluru", city:"Bangalore" },
  "560045":{ name:"Nagavara", area:"North Bengaluru", city:"Bangalore" },
  "560092":{ name:"Vidyaranyapura", area:"North Bengaluru", city:"Bangalore" },
  "560094":{ name:"Sanjaynagar", area:"North Bengaluru", city:"Bangalore" },
  "560097":{ name:"Byatarayanapura", area:"North Bengaluru", city:"Bangalore" },
  "560063":{ name:"Yelahanka", area:"North Bengaluru", city:"Bangalore" },
  "560064":{ name:"Yelahanka New Town", area:"North Bengaluru", city:"Bangalore" },
  "560065":{ name:"Jakkur", area:"North Bengaluru", city:"Bangalore" },
  "560008":{ name:"Ulsoor", area:"East Bengaluru", city:"Bangalore" },
  "560038":{ name:"Indiranagar East", area:"East Bengaluru", city:"Bangalore" },
  "560046":{ name:"Benson Town", area:"East Bengaluru", city:"Bangalore" },
  "560005":{ name:"Cox Town", area:"East Bengaluru", city:"Bangalore" },
  "560017":{ name:"HAL / Old Airport", area:"East Bengaluru", city:"Bangalore" },
  "560075":{ name:"New Thippasandra", area:"East Bengaluru", city:"Bangalore" },
  "560093":{ name:"CV Raman Nagar", area:"East Bengaluru", city:"Bangalore" },
  "560016":{ name:"Ramamurthy Nagar", area:"East Bengaluru", city:"Bangalore" },
  "560036":{ name:"KR Puram", area:"East Bengaluru", city:"Bangalore" },
  "560037":{ name:"Marathahalli", area:"East Bengaluru", city:"Bangalore" },
  "560048":{ name:"Mahadevapura", area:"East Bengaluru", city:"Bangalore" },
  "560066":{ name:"Whitefield", area:"East Bengaluru", city:"Bangalore" },
  "560067":{ name:"Whitefield Hope Farm", area:"East Bengaluru", city:"Bangalore" },
  "560103":{ name:"Bellandur", area:"East Bengaluru", city:"Bangalore" },
  "560035":{ name:"Sarjapur Road", area:"East Bengaluru", city:"Bangalore" },
  "560087":{ name:"Varthur", area:"East Bengaluru", city:"Bangalore" },
  "560034":{ name:"Koramangala", area:"South East Bengaluru", city:"Bangalore" },
  "560095":{ name:"Koramangala 8th Blk", area:"South East Bengaluru", city:"Bangalore" },
  "560102":{ name:"HSR Layout", area:"South East Bengaluru", city:"Bangalore" },
  "560029":{ name:"Adugodi", area:"South East Bengaluru", city:"Bangalore" },
  "560027":{ name:"Shanti Nagar", area:"South East Bengaluru", city:"Bangalore" },
  "560030":{ name:"Wilson Garden", area:"South East Bengaluru", city:"Bangalore" },
  "560068":{ name:"Bommanahalli", area:"South East Bengaluru", city:"Bangalore" },
  "560004":{ name:"Basavanagudi", area:"South Bengaluru", city:"Bangalore" },
  "560011":{ name:"Jayanagar", area:"South Bengaluru", city:"Bangalore" },
  "560041":{ name:"Jayanagar 4th Block", area:"South Bengaluru", city:"Bangalore" },
  "560019":{ name:"Hanumanthanagar", area:"South Bengaluru", city:"Bangalore" },
  "560028":{ name:"Tyagarajanagar", area:"South Bengaluru", city:"Bangalore" },
  "560050":{ name:"Banashankari", area:"South Bengaluru", city:"Bangalore" },
  "560070":{ name:"BSK 2nd Stage", area:"South Bengaluru", city:"Bangalore" },
  "560085":{ name:"BSK 3rd Stage", area:"South Bengaluru", city:"Bangalore" },
  "560078":{ name:"JP Nagar", area:"South Bengaluru", city:"Bangalore" },
  "560076":{ name:"BTM Layout", area:"South Bengaluru", city:"Bangalore" },
  "560061":{ name:"Uttarahalli", area:"South Bengaluru", city:"Bangalore" },
  "560062":{ name:"Konanakunte", area:"South Bengaluru", city:"Bangalore" },
  "560083":{ name:"Bannerghatta Road", area:"South Bengaluru", city:"Bangalore" },
  "560040":{ name:"Vijayanagar", area:"West Bengaluru", city:"Bangalore" },
  "560079":{ name:"Basaveshwaranagar", area:"West Bengaluru", city:"Bangalore" },
  "560072":{ name:"Nagarbhavi", area:"West Bengaluru", city:"Bangalore" },
  "560018":{ name:"Chamrajpet", area:"West Bengaluru", city:"Bangalore" },
  "560091":{ name:"Sunkadakatte", area:"West Bengaluru", city:"Bangalore" },
  "560056":{ name:"Jnana Bharathi", area:"West Bengaluru", city:"Bangalore" },
  "560100":{ name:"Electronic City", area:"South Bengaluru", city:"Bangalore" },
  "560099":{ name:"Hosur Road", area:"South Bengaluru", city:"Bangalore" },
  "560105":{ name:"Anekal", area:"South Bengaluru", city:"Bangalore" },
  // ── Punjab (city 3) — Phase 1: Ludhiana + Amritsar. Area ids are
  // city-prefixed slugs (e.g. "ldh-mall-road"), not postal pincodes — Punjab's
  // tier-2 cities have far coarser postal pincodes than Delhi/Bangalore (one
  // pincode often covers several distinct named localities), so pincode can't
  // be the area unit here. See ADDING_A_CITY.md for the full rationale.
  //
  // These 52 localities are real, sourced places (see PUNJAB_ROLLOUT.md for
  // full citations per locality). As of 2026-08-06, 5 of them
  // (ldh-sarabha-nagar, ldh-dugri, ldh-model-town, asr-majitha-road,
  // asr-rani-ka-bagh) have real, sourced SCHOOLS data and are scored — see
  // pipeline/scrapers/punjab_data.py. Every other entry keeps `scored:false`:
  // no nqi_composite/dimension data exists for them yet; they resolve
  // correctly as routes and show "No data for this pin" rather than a
  // fabricated score or a broken redirect. Do not remove `scored:false` until
  // real pipeline data actually exists for a given locality — see
  // PUNJAB_ROLLOUT.md §"What this rollout does NOT include" for why that's a
  // separate, larger task. Note the 5 scored ones are schools-ONLY
  // (dimensions_scored: 1 of 8) — air and crime were both ruled out as
  // genuinely unavailable for this batch, not just not-yet-built; see
  // punjab_data.py's module docstring.
  "ldh-mall-road":{ name:"Mall Road", area:"Central Ludhiana", city:"Ludhiana", scored:false },
  "ldh-navi-market":{ name:"Navi Market", area:"Central Ludhiana", city:"Ludhiana", scored:false },
  "ldh-sadar-bazaar":{ name:"Sadar Bazaar", area:"Central Ludhiana", city:"Ludhiana", scored:false },
  "ldh-chaura-bazaar":{ name:"Chaura Bazaar", area:"Central Ludhiana", city:"Ludhiana", scored:false },
  "ldh-ghumar-mandi":{ name:"Ghumar Mandi", area:"Central Ludhiana", city:"Ludhiana", scored:false },
  "ldh-civil-lines":{ name:"Civil Lines", area:"Central Ludhiana", city:"Ludhiana", scored:false },
  "ldh-model-town":{ name:"Model Town", area:"East Ludhiana", city:"Ludhiana" },
  "ldh-model-gram":{ name:"Model Gram", area:"Central Ludhiana", city:"Ludhiana", scored:false },
  "ldh-sarabha-nagar":{ name:"Sarabha Nagar", area:"Central-West Ludhiana", city:"Ludhiana" },
  "ldh-brs-nagar":{ name:"BRS Nagar", area:"West Ludhiana", city:"Ludhiana", scored:false },
  "ldh-pakhowal-road":{ name:"Pakhowal Road", area:"West Ludhiana", city:"Ludhiana", scored:false },
  "ldh-ferozepur-road":{ name:"Ferozepur Road", area:"West Ludhiana", city:"Ludhiana", scored:false },
  "ldh-dugri":{ name:"Dugri", area:"South Ludhiana", city:"Ludhiana" },
  "ldh-gill-road":{ name:"Gill Road", area:"East Ludhiana", city:"Ludhiana", scored:false },
  "ldh-jamalpur":{ name:"Jamalpur", area:"East Ludhiana", city:"Ludhiana", scored:false },
  "ldh-haibowal":{ name:"Haibowal", area:"North-Central Ludhiana", city:"Ludhiana", scored:false },
  "ldh-shimlapuri":{ name:"Shimlapuri", area:"East Ludhiana", city:"Ludhiana", scored:false },
  "ldh-rishi-nagar":{ name:"Rishi Nagar", area:"North-Central Ludhiana", city:"Ludhiana", scored:false },
  "ldh-kitchlu-nagar":{ name:"Kitchlu Nagar", area:"North-Central Ludhiana", city:"Ludhiana", scored:false },
  "ldh-focal-point":{ name:"Focal Point", area:"East Ludhiana", city:"Ludhiana", scored:false },
  "ldh-dhandari-kalan":{ name:"Dhandari Kalan", area:"East Ludhiana", city:"Ludhiana", scored:false },
  "ldh-salem-tabri":{ name:"Salem Tabri", area:"North Ludhiana", city:"Ludhiana", scored:false },
  "ldh-jawahar-nagar":{ name:"Jawahar Nagar", area:"North-Central Ludhiana", city:"Ludhiana", scored:false },
  "ldh-rajguru-nagar":{ name:"Rajguru Nagar", area:"West Ludhiana", city:"Ludhiana", scored:false },
  "ldh-basti-jodhewal":{ name:"Basti Jodhewal", area:"Central-East Ludhiana", city:"Ludhiana", scored:false },
  "ldh-field-ganj":{ name:"Field Ganj", area:"Central Ludhiana", city:"Ludhiana", scored:false },
  "ldh-chandigarh-road":{ name:"Chandigarh Road", area:"East Ludhiana", city:"Ludhiana", scored:false },
  "ldh-ayali-kalan":{ name:"Ayali Kalan", area:"West Ludhiana", city:"Ludhiana", scored:false },
  // ── Amritsar (city 4) ──
  "asr-ranjit-avenue":{ name:"Ranjit Avenue", area:"Amritsar", city:"Amritsar", scored:false },
  "asr-green-avenue":{ name:"Green Avenue", area:"Amritsar", city:"Amritsar", scored:false },
  "asr-lawrence-road":{ name:"Lawrence Road", area:"Amritsar", city:"Amritsar", scored:false },
  "asr-mall-road":{ name:"Mall Road", area:"Amritsar", city:"Amritsar", scored:false },
  // Researched specifically (2026-08-06) as part of the first scored batch —
  // stays scored:false on purpose, not an oversight: zero schools were found
  // tied to this specific locality, air was ruled out (no live CPCB feed for
  // Punjab yet, and the one nearby station's live reading uses a different,
  // non-CPCB index), and crime data doesn't exist for any Punjab locality.
  // There's currently no real dimension to build a composite from — see
  // PUNJAB_ROLLOUT.md and pipeline/scrapers/punjab_data.py.
  "asr-hall-bazaar":{ name:"Hall Bazaar", area:"Walled City / Old Amritsar", city:"Amritsar", scored:false },
  "asr-katra-jaimal-singh":{ name:"Katra Jaimal Singh", area:"Walled City / Old Amritsar", city:"Amritsar", scored:false },
  "asr-batala-road":{ name:"Batala Road", area:"Amritsar", city:"Amritsar", scored:false },
  "asr-gt-road":{ name:"GT Road", area:"Amritsar", city:"Amritsar", scored:false },
  "asr-chheharta":{ name:"Chheharta", area:"Amritsar", city:"Amritsar", scored:false },
  "asr-majitha-road":{ name:"Majitha Road", area:"Amritsar", city:"Amritsar" },
  "asr-circular-road":{ name:"Circular Road", area:"Walled City / Old Amritsar", city:"Amritsar", scored:false },
  "asr-court-road":{ name:"Court Road", area:"Amritsar", city:"Amritsar", scored:false },
  "asr-cantt":{ name:"Amritsar Cantt", area:"Amritsar Cantonment", city:"Amritsar", scored:false },
  "asr-putlighar":{ name:"Putlighar", area:"Amritsar", city:"Amritsar", scored:false },
  "asr-islamabad":{ name:"Islamabad", area:"Amritsar", city:"Amritsar", scored:false },
  "asr-gate-hakiman":{ name:"Gate Hakiman", area:"Walled City / Old Amritsar", city:"Amritsar", scored:false },
  "asr-rani-ka-bagh":{ name:"Rani Ka Bagh", area:"Amritsar", city:"Amritsar" },
  "asr-sultanwind":{ name:"Sultanwind", area:"Amritsar", city:"Amritsar", scored:false },
  "asr-gndu-area":{ name:"GNDU Area", area:"Amritsar", city:"Amritsar", scored:false },
  "asr-tarn-taran-road":{ name:"Tarn Taran Road", area:"Amritsar", city:"Amritsar", scored:false },
  "asr-fatehgarh-churian-road":{ name:"Fatehgarh Churian Road", area:"Amritsar", city:"Amritsar", scored:false },
  "asr-golden-avenue":{ name:"Golden Avenue", area:"Amritsar", city:"Amritsar", scored:false },
  "asr-vijay-nagar":{ name:"Vijay Nagar", area:"Amritsar", city:"Amritsar", scored:false },
  "asr-basant-avenue":{ name:"Basant Avenue", area:"Amritsar", city:"Amritsar", scored:false },
}

// Total areas with SCORED data (i.e. present in nqi_scores.json) — not the
// same as Object.keys(PIN_META).length, since PIN_META also carries a few
// "NCR fringe" pins that are named but have no data yet. Kept as one
// explicit constant instead of a literal string repeated in three separate
// UI files (see ADDING_A_CITY.md §2) — update this by hand when the scored
// count changes, e.g. after a new city's pipeline data goes live.
export const TOTAL_SCORED_AREAS = 157

// Ordered list of live cities, driving every city-toggle button in the UI.
// Adding a city = add one line here (plus its PIN_META entries) instead of
// editing three separate hardcoded ['Delhi NCR','Bangalore'] arrays.
//
// Ludhiana and Amritsar were added 2026-08-06, once the first 5 localities
// (3 Ludhiana + 2 Amritsar) got real, sourced schools data — see
// pipeline/scrapers/punjab_data.py. The other 47 Punjab localities in
// PIN_META above are still `scored:false` and stay unreachable from the
// landing/CTA city search (which filters against PIN_META_LANDING, itself
// filtered to scored areas) — only reachable via their direct /report/<slug>
// URL (shows "No data for this pin") or compare.js's general search.
export const CITIES = ['Delhi NCR', 'Bangalore', 'Ludhiana', 'Amritsar']

// Per-city defaults used by the city switcher (landing pin to jump to) and
// search placeholders (an example area name shown in the input).
// Ludhiana/Amritsar default to their strongest-data scored locality (not
// necessarily the "best known" name) since every other Punjab locality is
// still scored:false and would be a dead end as a default.
export const CITY_META = {
  'Delhi NCR': { defaultPin: '110016', example: 'Hauz Khas' },
  'Bangalore': { defaultPin: '560034', example: 'Koramangala' },
  'Ludhiana': { defaultPin: 'ldh-dugri', example: 'Dugri' },
  'Amritsar': { defaultPin: 'asr-majitha-road', example: 'Majitha Road' },
}

// city(pin) replaces the old cityOf() which only handled exactly two cities
// via `pin.startsWith('560')`. Falls back to 'Delhi NCR' for legacy callers
// that pass an unrecognized/undefined pin rather than throwing.
export function cityFor(pin) {
  return PIN_META[pin]?.city || 'Delhi NCR'
}
