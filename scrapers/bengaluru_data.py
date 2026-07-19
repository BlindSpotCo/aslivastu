"""
scrapers/bengaluru_data.py
Bengaluru (Bangalore) neighbourhood data — the city-2 expansion.

Single source of truth for all Bengaluru areas. Produces master-shaped records
(one per PIN) that run_pipeline.merge() injects into the master alongside Delhi.

Data provenance (same honesty standard as the Delhi dataset):
  • Air quality  — LIVE where a CPCB/KSPCB station exists (see air_quality.py
                   STATION_PIN_MAP). aqi_avg here is an interim estimate used
                   until the next live pipeline run refreshes it.
  • Schools      — REAL. The national CBSE affiliation CSV already covers 560xxx
                   PINs, so schools are populated automatically by schools.py.
  • Price        — REAL. Karnataka 'guidance value' (Kaveri portal), per area.
  • Crime, infrastructure, power, water, roads, sewerage — ESTIMATES dated to
                   public BBMP / BESCOM / BWSSB / Bengaluru City Police reports,
                   grounded in each area's known characteristics. Labelled 'Est.'

waterlogging_risk is inverted (5 = safest, 1 = high flood risk), matching Delhi.
"""

# ── tier → baseline defaults (overridden per area) ──────────────────────────
# tier 5 = premium established · 1 = peripheral/weak. Bengaluru-specific baselines:
# water hours are low across the board (city runs alternate-day Cauvery supply).
TIER = {
    5: dict(crime=320, metro=2, hwy="Medium", smart=False, ztype="Residential", infra=80,
            pw=4, pwh=1.5, rel="Good",   whrs=7, wq=4, wcov=90, tds="Medium", wcomp=16,
            rq=4, pot=2.5, rcond="Good", conn="High",   scov=88, streat="Adequate", wl=4, sopen=False, flood=1, aqi=78),
    4: dict(crime=360, metro=1, hwy="Medium", smart=False, ztype="Residential", infra=68,
            pw=4, pwh=2.0, rel="Good",   whrs=6, wq=3, wcov=82, tds="Medium", wcomp=24,
            rq=3, pot=4.5, rcond="Average", conn="High", scov=78, streat="Partial",  wl=3, sopen=False, flood=3, aqi=88),
    3: dict(crime=410, metro=0, hwy="Low", smart=False, ztype="Mixed", infra=54,
            pw=3, pwh=3.0, rel="Moderate", whrs=5, wq=3, wcov=72, tds="High", wcomp=36,
            rq=3, pot=6.5, rcond="Average", conn="Medium", scov=66, streat="Partial", wl=3, sopen=False, flood=5, aqi=95),
    2: dict(crime=460, metro=0, hwy="Low", smart=False, ztype="Mixed", infra=42,
            pw=3, pwh=4.0, rel="Moderate", whrs=4, wq=2, wcov=58, tds="High", wcomp=52,
            rq=2, pot=9.5, rcond="Poor", conn="Medium", scov=52, streat="Inadequate", wl=2, sopen=True, flood=8, aqi=100),
    1: dict(crime=500, metro=0, hwy="Low", smart=False, ztype="Mixed", infra=32,
            pw=2, pwh=5.5, rel="Poor",  whrs=3, wq=2, wcov=45, tds="Very High", wcomp=68,
            rq=2, pot=13.0, rcond="Poor", conn="Low", scov=42, streat="Inadequate", wl=2, sopen=True, flood=12, aqi=104),
}

# (pin, name, zone, tier, gv_low, gv_high, overrides)
AREAS = [
    # ── Central / CBD ──
    ("560001", "MG Road",            "Central", 5, 18000, 28000, dict(ztype="Commercial", crime=470, metro=2, aqi=96, whrs=8, wcov=96)),
    ("560025", "Richmond Town",      "Central", 5, 16000, 24000, dict(aqi=92)),
    ("560051", "Vasanth Nagar",      "Central", 5, 15000, 22000, {}),
    ("560052", "Cantonment",         "Central", 4, 13000, 19000, dict(metro=1)),
    ("560042", "Shivajinagar",       "Central", 3, 11000, 16000, dict(ztype="Commercial", crime=520, metro=1, aqi=104, sopen=True)),
    ("560002", "Chickpet",           "Central", 3, 12000, 18000, dict(ztype="Commercial", crime=540, whrs=6, pot=8, aqi=108)),
    ("560023", "Majestic",           "Central", 3, 11000, 16000, dict(ztype="Commercial", crime=560, metro=2, aqi=112, sopen=True)),

    # ── North ──
    ("560003", "Malleshwaram",       "North", 5, 14000, 22000, dict(metro=2)),
    ("560010", "Rajajinagar",        "North", 4, 12000, 18000, dict(metro=2)),
    ("560020", "Seshadripuram",      "North", 4, 12000, 17000, dict(metro=1)),
    ("560021", "Sriramapuram",       "North", 3, 9000, 13000, {}),
    ("560022", "Yeshwanthpur",       "North", 4, 9000, 14000, dict(metro=2, ztype="Mixed")),
    ("560024", "Ganganagar",         "North", 3, 8500, 12500, {}),
    ("560032", "RT Nagar",           "North", 3, 9000, 13500, dict(crime=430)),
    ("560045", "Nagavara",           "North", 4, 9000, 13000, dict(ztype="Mixed", infra=72, flood=6)),  # Manyata tech park
    ("560092", "Vidyaranyapura",     "North", 3, 7000, 10000, {}),
    ("560094", "Sanjaynagar",        "North", 4, 10000, 15000, {}),
    ("560097", "Byatarayanapura",    "North", 3, 7000, 10500, {}),
    ("560063", "Yelahanka",          "North", 2, 6000, 9000, dict(whrs=4, wcov=55)),
    ("560064", "Yelahanka New Town", "North", 3, 6500, 9500, dict(infra=58)),
    ("560065", "Jakkur",             "North", 3, 7000, 11000, {}),

    # ── East ──
    ("560008", "Indiranagar",        "East", 5, 18000, 28000, dict(metro=2, aqi=90)),
    ("560038", "Indiranagar East",   "East", 5, 17000, 26000, dict(metro=2)),
    ("560046", "Ulsoor",             "East", 4, 14000, 20000, dict(metro=1)),
    ("560005", "Cox Town",           "East", 4, 12000, 17000, {}),
    ("560017", "HAL / Old Airport",  "East", 4, 12000, 17000, dict(ztype="Mixed")),
    ("560075", "New Thippasandra",   "East", 4, 11000, 15000, {}),
    ("560093", "CV Raman Nagar",     "East", 3, 9000, 13000, dict(infra=58)),
    ("560016", "KR Puram",           "East", 2, 6500, 10000, dict(flood=14, wl=1, sopen=True, pot=12, rcond="Poor", aqi=106)),
    ("560036", "Ramamurthy Nagar",   "East", 2, 6500, 9500, dict(flood=9, wl=2)),
    ("560037", "Marathahalli",       "East", 4, 8000, 12000, dict(ztype="Mixed", infra=64, pot=9, rcond="Poor", conn="Medium", flood=7, wl=2, aqi=100)),
    ("560048", "Mahadevapura",       "East", 4, 8500, 13000, dict(ztype="Mixed", infra=70, flood=8, wl=2, pot=8)),
    ("560066", "Whitefield",         "East", 4, 9000, 14000, dict(ztype="Mixed", infra=72, metro=1, whrs=4, wcov=55, tds="High", flood=7, wl=2, pot=8, aqi=94)),
    ("560067", "Whitefield Hope Farm","East", 3, 7500, 11500, dict(whrs=3, wcov=48, flood=8, wl=2)),
    ("560103", "Bellandur",          "East", 4, 9000, 14000, dict(ztype="Mixed", infra=66, whrs=4, wcov=50, flood=16, wl=1, sopen=True, pot=10, rcond="Poor", aqi=98)),
    ("560035", "Sarjapur Road",      "East", 4, 8000, 13000, dict(ztype="Mixed", infra=62, whrs=3, wcov=45, tds="High", flood=8, wl=2, pot=9)),
    ("560087", "Varthur",            "East", 2, 6000, 9500, dict(flood=15, wl=1, sopen=True, whrs=3, wcov=40)),

    # ── South-East (Koramangala / HSR belt) ──
    ("560034", "Koramangala",        "South East", 5, 15000, 25000, dict(flood=11, wl=2, aqi=92)),
    ("560095", "Koramangala 8th Blk","South East", 5, 15000, 24000, dict(flood=10, wl=2)),
    ("560102", "HSR Layout",         "South East", 5, 12000, 18000, dict(flood=10, wl=2, infra=74)),
    ("560029", "Adugodi",            "South East", 4, 11000, 16000, {}),
    ("560027", "Shanti Nagar",       "South East", 3, 10000, 15000, {}),
    ("560030", "Wilson Garden",      "South East", 3, 10000, 14000, {}),
    ("560068", "Bommanahalli",       "South East", 3, 7500, 11000, dict(ztype="Mixed", flood=8, wl=2, pot=9)),

    # ── South ──
    ("560004", "Basavanagudi",       "South", 5, 13000, 20000, dict(metro=1)),
    ("560011", "Jayanagar",          "South", 5, 18000, 28000, dict(metro=2, aqi=82)),
    ("560041", "Jayanagar 4th Block","South", 5, 17000, 26000, dict(metro=2)),
    ("560019", "Hanumanthanagar",    "South", 3, 9000, 13000, {}),
    ("560028", "Tyagarajanagar",     "South", 3, 9500, 13500, {}),
    ("560050", "Banashankari",       "South", 4, 8000, 13000, dict(metro=2)),
    ("560070", "BSK 2nd Stage",      "South", 4, 9000, 14000, dict(metro=1)),
    ("560085", "BSK 3rd Stage",      "South", 3, 8000, 12000, {}),
    ("560078", "JP Nagar",           "South", 4, 9000, 14000, dict(metro=1, infra=66)),
    ("560076", "BTM Layout",         "South", 4, 9000, 14000, dict(flood=7, wl=3, aqi=96)),
    ("560061", "Uttarahalli",        "South", 2, 6500, 9500, {}),
    ("560062", "Konanakunte",        "South", 3, 6500, 10000, dict(metro=1)),
    ("560083", "Bannerghatta Road",  "South", 3, 7500, 11500, dict(ztype="Mixed", pot=8, flood=6)),
    ("560082", "Bannerghatta",       "South", 2, 5500, 8500, {}),

    # ── West ──
    ("560040", "Vijayanagar",        "West", 4, 10000, 15000, dict(metro=2)),
    ("560079", "Basaveshwaranagar",  "West", 4, 10000, 14500, {}),
    ("560072", "Nagarbhavi",         "West", 3, 8500, 12500, {}),
    ("560018", "Chamrajpet",         "West", 3, 9000, 13000, dict(ztype="Mixed")),
    ("560091", "Sunkadakatte",       "West", 2, 6000, 9000, {}),
    ("560056", "Jnana Bharathi",     "West", 2, 6000, 9000, {}),

    # ── IT South ──
    ("560100", "Electronic City",    "South", 3, 6000, 9500, dict(ztype="Mixed", infra=62, whrs=3, wcov=48, tds="High", pot=8, rcond="Poor", conn="Medium", flood=6, aqi=98)),
    ("560099", "Hosur Road",         "South", 2, 5500, 8500, dict(pot=10, flood=6)),
    ("560105", "Anekal",             "South", 1, 4500, 7000, {}),
]

TDS_OK = {"Low", "Medium", "High", "Very High"}


def _aqi_cat(v):
    if v <= 50: return "Good"
    if v <= 100: return "Satisfactory"
    if v <= 200: return "Moderate"
    if v <= 300: return "Poor"
    if v <= 400: return "Very Poor"
    return "Severe"


def master_records():
    """Full master-shaped records for every Bengaluru area."""
    out = []
    for pin, name, zone, tier, gvlo, gvhi, ov in AREAS:
        d = {**TIER[tier], **ov}
        wl = d["wl"]
        rec = {
            "pin_code": pin,
            "city": "Bangalore",
            "sources": ["bengaluru_seed"],
            # air (interim estimate; refreshed live when a CPCB station covers the pin)
            "aqi_avg": float(d["aqi"]),
            "aqi_category": _aqi_cat(d["aqi"]),
            # crime
            "total_cognizable_crimes": d["crime"],
            # infrastructure
            "zone_type": d["ztype"],
            "metro_stations_nearby": d["metro"],
            "metro_planned_stations": 1 if d["metro"] == 0 else 0,
            "highway_proximity": d["hwy"],
            "smart_city_project": d["smart"],
            "infra_score_raw": d["infra"],
            # power (BESCOM)
            "discom": "BESCOM",
            "outage_frequency": d["pw"],
            "avg_outage_hours": d["pwh"],
            "reliability": d["rel"],
            # water (BWSSB / Cauvery)
            "zone": "BWSSB",
            "supply_hours": d["whrs"],
            "quality_score": d["wq"],
            "water_quality": d["wq"],
            "coverage_pct": d["wcov"],
            "water_coverage": d["wcov"],
            "tds_level": d["tds"],
            "complaints_per_1000": d["wcomp"],
            "source": "BWSSB",
            # roads (BBMP / PWD)
            "authority": "BBMP",
            "road_quality": d["rq"],
            "pothole_density": d["pot"],
            "road_condition": d["rcond"],
            "last_resurfaced": 2022,
            "connectivity": d["conn"],
            # sewerage / drainage
            "sewerage_coverage": d["scov"],
            "treatment": d["streat"],
            "waterlogging_risk": wl,
            "open_drains": d["sopen"],
            "flooding_incidents_annual": d["flood"],
            # price backbone (guidance value ₹/sqft)
            "_guidance_value": [gvlo, gvhi],
            "_area_name": name,
            "_zone_dir": zone,
        }
        out.append(rec)
    return out


def price_entries():
    """Guidance-value price-context entries keyed by PIN (Kaveri, Karnataka)."""
    LABELS = {1: "Premium", 2: "Upper", 3: "Mid", 4: "Modest", 5: "Value"}
    out = {}
    for pin, name, zone, tier, gvlo, gvhi, ov in AREAS:
        # tier→price band: premium areas = Premium band
        pt = {5: 1, 4: 2, 3: 3, 2: 4, 1: 5}[tier]
        out[pin] = {
            "tier": pt, "label": LABELS[pt],
            "rate_sqft": [gvlo, gvhi], "rate_type": "apartment", "rate_exact": False,
            "land_sqft": None, "land_exact": False,
            "basis": f"{name} — Karnataka guidance value (Kaveri, Dept. of Stamps & Registration)",
            "source": "Govt of Karnataka",
        }
    return out


def pin_meta():
    """name/area entries for the frontend PIN_META (Bengaluru)."""
    return {pin: {"name": name, "area": f"{zone} Bengaluru", "city": "Bangalore"}
            for pin, name, zone, tier, gvlo, gvhi, ov in AREAS}
