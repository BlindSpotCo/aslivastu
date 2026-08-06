"""
scrapers/punjab_data.py
Punjab (Ludhiana + Amritsar) — first SCORED batch, city 3/4.

This is deliberately NOT the same pattern as bengaluru_data.py. Bangalore's
seed module fills crime/infrastructure/power/water/roads/sewerage with
tier-based ESTIMATES labelled 'Est.' — that is a data-provenance standard
this rollout does not meet for Punjab, and re-using it here would mean
inventing plausible-looking numbers for dimensions we have no real source
for. Instead this module only emits the dimensions we found REAL, sourced
data for, and leaves everything else absent so scoring.py's compute_nqi()
drops it (dimensions_scored < dimensions_total) rather than scoring a guess.

Data provenance, per dimension, for the 5 localities below (research dated
2026-08-06 — see PUNJAB_ROLLOUT.md for full citations):
  • Schools — REAL. Individually researched per locality (CBSE portal is
    captcha-gated, so cross-checked against cbseschool.org/icbse.com/school
    sites/news). Not from the shared NCR CSV (schools.py's ALL_PINS /
    NCR_STATES filter doesn't cover Punjab, and these are locality-scoped
    slugs, not PINs, anyway). Every school below has a source tying it to
    the named locality specifically — schools that only appeared on a
    "nearby CBSE schools" aggregator page without a matching address were
    excluded, and are documented as excluded in PUNJAB_ROLLOUT.md.
  • Air quality — NOT included. Each city has exactly one real-time CPCB/PPCB
    station (PAU for Ludhiana, Golden Temple for Amritsar) and air_quality.py
    doesn't fetch Punjab at all yet (state not in the CPCB fetch list, no
    STATION_PIN_MAP entries). A live IQAir reading exists for both stations,
    but it's US-EPA-indexed, not CPCB-indexed — mixing it into aqi_avg would
    misrepresent it as CPCB methodology (which is what score_air()'s anchors
    and the UI's "CPCB category" language assume). Left out rather than
    used with the wrong methodology silently implied.
  • Crime — NOT included, and not plausibly addable. NCRB's finest published
    geography is district-level; neither Ludhiana nor Amritsar clears the
    2M-population threshold for even NCRB's city-level table, and Punjab
    Police publishes no aggregate crime-statistics dashboard. Confirmed dead
    end — see PUNJAB_MANUAL_TODO.md.
  • Infrastructure, power, water, roads, sewerage — NOT included. No real
    per-locality source was researched for these yet; do not backfill with
    tier estimates the way bengaluru_data.py does without an explicit,
    separate decision to relax the honesty bar for Punjab the way it was
    (knowingly, and labelled) for Bangalore.
  • Collector rate (price context, NOT part of the NQI composite) — REAL,
    from the actual Sub-Registrar/Tehsil 2025-26 rate-list PDFs. Quoted in
    the source as Rs/sq YARD (Punjab's convention), converted to Rs/sq ft
    (÷9) for consistency with the Delhi/Bangalore price_context shape. The
    conversion is arithmetic, not an estimate.

Net effect: these 5 localities score on ONE dimension (schools, 10% base
weight) — compute_nqi() renormalizes to 100% since it's the only dimension
present. That's a thin composite and the UI needs to keep surfacing
`dimensions_scored: 1 / dimensions_total: 8` prominently, not just the
number, so nobody reads "72" as an 8-dimension score. This is a deliberate,
documented interim state, not a bug — see PUNJAB_ROLLOUT.md.

Hall Bazaar (asr-hall-bazaar) is the 6th locality originally targeted for
this batch but is NOT here: zero schools were found tied to that specific
locality, air was ruled out for the reason above, and crime is a hard dead
end for every locality. There is currently no real dimension to score it
on, so it stays `scored:false` in lib/pinMeta.js rather than getting a
composite built from nothing.
"""

# ── Schools ──────────────────────────────────────────────────────────────
# Shape matches schools.py's summarise() output so scoring.py's
# score_schools()/_merge_schools() (which read data/raw/schools_raw.json
# keyed by pin_code) work identically for these locality slugs.
#
# Excluded, not guessed: schools that only appear on a locality-radius
# aggregator page without an address actually in the named locality (full
# list of exclusions is in PUNJAB_ROLLOUT.md, not repeated here to avoid
# the two copies drifting).

SCHOOLS = {
    "ldh-sarabha-nagar": {
        "count": 2, "cbse": 2, "icse": 0, "state_board": 0, "avg_pass_pct": None,
        "schools": [
            {"name": "Guru Nanak Public School", "board": "CBSE",
             "address": "Sarabha Nagar, Ludhiana – 141001", "pass_pct": None, "distance_km": None},
            {"name": "Sacred Heart Convent School", "board": "CBSE",
             "address": "P.B. 370, Sarabha Nagar, Ludhiana – 141001", "pass_pct": None, "distance_km": None},
        ],
    },
    "ldh-dugri": {
        "count": 6, "cbse": 6, "icse": 0, "state_board": 0, "avg_pass_pct": None,
        "schools": [
            {"name": "Ryan International School, Dugri", "board": "CBSE",
             "address": "2537, Phase 2, Urban Estate Dugri, Ludhiana – 141003", "pass_pct": None, "distance_km": None},
            {"name": "MGM Public School", "board": "CBSE",
             "address": "Urban Estate, Phase I, Dugri, Ludhiana", "pass_pct": None, "distance_km": None},
            {"name": "Bal Bharati Public School", "board": "CBSE",
             "address": "Phase 2, Urban Estate, Dugri, Ludhiana", "pass_pct": None, "distance_km": None},
            {"name": "Ram Lal Bhasin Public School", "board": "CBSE",
             "address": "Phase I, Dugri, Ludhiana", "pass_pct": None, "distance_km": None},
            {"name": "Green Land Convent School", "board": "CBSE",
             "address": "Phase II, Dugri, Ludhiana", "pass_pct": None, "distance_km": None},
            {"name": "B C M School (Dugri Road)", "board": "CBSE",
             "address": "Basant Avenue, Dugri Road, Ludhiana", "pass_pct": None, "distance_km": None},
        ],
        # Explicitly excluded (see PUNJAB_ROLLOUT.md): Kalgidhar Academy Sr Sec
        # School (a different, rural "Dugri" village near Payal/Sahnewal, ~25km
        # away — name collision, not the same place); Sacred Soul Convent
        # School and Manav Rachna International School (addresses tie them to
        # Dhandra village / Basant Avenue, not Dugri locality proper).
    },
    "ldh-model-town": {
        "count": 2, "cbse": 2, "icse": 0, "state_board": 0, "avg_pass_pct": None,
        "schools": [
            {"name": "Guru Nanak International Public School (Gujarkhan Campus)", "board": "CBSE",
             "address": "Model Town (Gujarkhan Campus), Ludhiana", "pass_pct": None, "distance_km": None},
            {"name": "BCM Arya Model Sr. Sec. School", "board": "CBSE",
             "address": "Shastri Nagar, Ishmeet Singh Road, Near G.T.B. Hospital, Model Town, Ludhiana – 141002",
             "pass_pct": None, "distance_km": None},
        ],
        # Excluded: Sri Guru Harkrishan Public School — its address is "Model
        # Town Extension-D, Dugri Road," a related but distinct sub-locality,
        # not Model Town proper.
    },
    "asr-majitha-road": {
        "count": 4, "cbse": 4, "icse": 0, "state_board": 0, "avg_pass_pct": None,
        "schools": [
            {"name": "Sri Guru Harkrishan Sr. Sec. Public School", "board": "CBSE",
             "address": "Majitha Road Bypass, Amritsar – 143001", "pass_pct": None, "distance_km": None},
            {"name": "Shri Ram Ashram Public School", "board": "CBSE",
             "address": "Majitha Road, Amritsar – 143001", "pass_pct": None, "distance_km": None},
            {"name": "Bright Land School", "board": "CBSE",
             "address": "Village Pandori Wariach, Majitha Road, Amritsar – 143008", "pass_pct": None, "distance_km": None},
            {"name": "The Millennium School (Majitha Road campus)", "board": "CBSE",
             "address": "SG Enclave, Majitha Road, Amritsar – 143001", "pass_pct": None, "distance_km": None},
        ],
        # Excluded: several aggregator ("CBSE schools near Majitha Road")
        # results actually addressed to Green Field / Khanna Nagar / Kamla
        # Devi Avenue, 0.3–3.9km away — not Majitha Road itself.
    },
    "asr-rani-ka-bagh": {
        # Conservative count: a 3rd school (Radcliffe School) was found with
        # directly conflicting addresses across sources (one ties it to Rani
        # Ka Bagh Ward 31, another to a different Amritsar locality entirely)
        # — excluded rather than guessed which address is right.
        "count": 2, "cbse": 0, "icse": 0, "state_board": 1, "avg_pass_pct": None,
        "schools": [
            {"name": "Jagat Jyoti Senior Secondary School", "board": "Punjab State Board",
             "address": "Rani Ka Bagh, Ward No. 44, Verka, Amritsar Cantonment – 143001",
             "pass_pct": None, "distance_km": None},
            {"name": "St Jude School", "board": "Not confirmed",
             "address": "Opposite Khasa Cantonment, G T Road, Rani Ka Bagh, Amritsar – 143001",
             "pass_pct": None, "distance_km": None},
        ],
    },
    # asr-hall-bazaar deliberately absent — zero schools found tied to this
    # locality. Leaving it out of this dict (rather than a count:0 entry)
    # means score_schools() sees no data at all, same as if the file had
    # never been touched for this pin.
}


def schools_records():
    """Punjab additions to be merged into data/raw/schools_raw.json,
    keyed exactly like the rest of that file (locality slug instead of a
    numeric PIN — schools.py's own scorer doesn't care, it just does a
    dict lookup by str(pin_code))."""
    return dict(SCHOOLS)


# ── Master records (minimal — only pin_code/city/sources) ─────────────────
# Deliberately does NOT set aqi_avg, total_cognizable_crimes, infra_score_raw,
# or any power/water/roads/sewerage field — leaving those keys absent is what
# makes compute_nqi() drop those dimensions instead of scoring a fabricated
# value. schools_count/cbse/icse etc. are NOT set here either; they're
# injected separately by scoring.py's _merge_schools() from
# data/raw/schools_raw.json, same as every other city.

LOCALITIES = list(SCHOOLS.keys())

CITY_OF = {
    "ldh-sarabha-nagar": "Ludhiana",
    "ldh-dugri": "Ludhiana",
    "ldh-model-town": "Ludhiana",
    "asr-majitha-road": "Amritsar",
    "asr-rani-ka-bagh": "Amritsar",
}


def master_records():
    """Full master-shaped records for the Punjab localities that have at
    least one real, sourced dimension — currently just schools. Each
    record only carries pin_code/city/sources; everything else is left for
    other (future, real) data sources to fill in."""
    out = []
    for slug in LOCALITIES:
        out.append({
            "pin_code": slug,
            "city": CITY_OF[slug],
            "sources": ["punjab_schools_manual"],
        })
    return out


# ── Price context (collector/circle rate — informational, NOT in the NQI) ─
# Source: Sub Registrar Amritsar-1 (Kanugo Circles 109/110) and Ludhiana
# Zone D collector-rate documents, 2025-26. Quoted there in Rs/sq YARD
# (Punjab convention); converted to Rs/sq ft (÷9, exact arithmetic) to match
# the existing price_context shape used for Delhi/Bangalore. rate_exact=True
# because these are the official notified minimum rates for the cited
# block/circle row, not an estimated band — but note a single locality can
# span more than one priced row (sub-block variants), so the row cited is
# the best-matching one, not necessarily every parcel in the area.

PRICE = {
    "ldh-sarabha-nagar": {
        "tier": 2, "label": "Upper",
        "rate_sqft": [2689, 6722], "rate_type": "land", "rate_exact": True,
        "land_sqft": None, "land_exact": False,
        "basis": "Sarabha Nagar — Ludhiana Municipal Corporation collector rate 2025-26, "
                 "Zone D Block 20 West (core Blocks B&A/F-K row, ₹24,200-60,500/sq yd; "
                 "premium Block C/D/E variant up to ₹38,000/69,600/sq yd converted here as the range's low/high)",
        "source": "Govt of Punjab — Ludhiana collector rate 2025-26",
    },
    "ldh-dugri": {
        "tier": 5, "label": "Value",
        "rate_sqft": [433, 656], "rate_type": "land", "rate_exact": True,
        "land_sqft": None, "land_exact": False,
        "basis": "Dugri / Urban Estate Dugri — Ludhiana collector rate 2025-26, "
                 "Jagdish Nagar Dugri row, ₹3,900-5,900/sq yd",
        "source": "Govt of Punjab — Ludhiana collector rate 2025-26",
    },
    "ldh-model-town": {
        "tier": 3, "label": "Mid",
        "rate_sqft": [1533, 4222], "rate_type": "land", "rate_exact": True,
        "land_sqft": None, "land_exact": False,
        "basis": "Model Town — Ludhiana collector rate 2025-26, Zone D Block 18 "
                 "(core row ₹13,800/sq yd res; sub-block variants run ₹11,400-17,500/sq yd, "
                 "converted here as the range's low/high; commercial ₹38,000/sq yd)",
        "source": "Govt of Punjab — Ludhiana collector rate 2025-26",
    },
    "asr-majitha-road": {
        "tier": 2, "label": "Upper",
        "rate_sqft": [3722, 3889], "rate_type": "land", "rate_exact": True,
        "land_sqft": None, "land_exact": False,
        "basis": "Majitha Road — Amritsar collector rate 2025-26, Circle 110 Sr.5, "
                 "₹33,500→35,000/sq yd res (+4.47%)",
        "source": "Govt of Punjab — Sub Registrar Amritsar-1 collector rate 2025-26",
    },
    "asr-rani-ka-bagh": {
        "tier": 1, "label": "Premium",
        "rate_sqft": [4222, 4222], "rate_type": "land", "rate_exact": True,
        "land_sqft": None, "land_exact": False,
        "basis": "Rani Ka Bagh — Amritsar collector rate 2025-26, Circle 109 Sr.8, "
                 "₹38,000/sq yd res (flat, no revision from prior year)",
        "source": "Govt of Punjab — Sub Registrar Amritsar-1 collector rate 2025-26",
    },
}

PRICE_NOTE = (
    "Punjab collector rates are notified per square YARD, not per square foot "
    "like Delhi/Bangalore's figures — converted here (÷9) for a consistent "
    "display unit. This is the government's minimum registration value, not "
    "market price, and a single named locality can span more than one priced "
    "row in the source document; the row cited is the best match, not "
    "necessarily every parcel in the area."
)


def price_entries():
    return dict(PRICE)


def pin_meta():
    """name/area entries — informational only; lib/pinMeta.js already has
    hand-verified entries for all 52 Punjab localities (see PUNJAB_ROLLOUT.md),
    this is not wired into anything and exists for parity with
    bengaluru_data.py's shape."""
    NAMES = {
        "ldh-sarabha-nagar": ("Sarabha Nagar", "Central-West Ludhiana", "Ludhiana"),
        "ldh-dugri": ("Dugri", "South Ludhiana", "Ludhiana"),
        "ldh-model-town": ("Model Town", "East Ludhiana", "Ludhiana"),
        "asr-majitha-road": ("Majitha Road", "Amritsar", "Amritsar"),
        "asr-rani-ka-bagh": ("Rani Ka Bagh", "Amritsar", "Amritsar"),
    }
    return {slug: {"name": n, "area": a, "city": c} for slug, (n, a, c) in NAMES.items()}
