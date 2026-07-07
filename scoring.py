import json
from datetime import datetime
from pathlib import Path
from utils.helpers import get_logger, load_processed, save_processed

log = get_logger("scoring")

WEIGHTS = {
    "crime":          0.30,
    "infrastructure": 0.25,
    "air":            0.20,
    "power":          0.15,
    "schools":        0.10,
}

# Human-readable rubric per dimension, published alongside scores so users
# (and brokers, and residents) can see exactly how a composite is built and
# re-derive it themselves rather than trusting a black-box number.
METHODOLOGY = {
    "crime": {
        "weight": WEIGHTS["crime"],
        "formula": "score = round((1 - (clamp(total_cognizable_crimes, 250, 650) - 250) / 400) * 100)",
        "description": (
            "Inverse-normalized against total cognizable crimes reported for the PIN's "
            "police station catchment over the reporting period. 250 or fewer scores 100; "
            "650 or more scores 0; linear in between. Note: the catchment area can be "
            "larger than a single neighbourhood/colony, so this figure reflects the whole "
            "station's jurisdiction, not necessarily any one street within it."
        ),
    },
    "infrastructure": {
        "weight": WEIGHTS["infrastructure"],
        "formula": "score = clamp(infra_score_raw, 0, 100)",
        "description": (
            "Pre-computed composite of metro station proximity, highway proximity, and "
            "smart-city project status for the PIN, passed through as-is."
        ),
    },
    "air": {
        "weight": WEIGHTS["air"],
        "formula": "score = banded(aqi_avg) using CPCB category thresholds (<=50:100, <=100:85, <=150:70, <=200:50, <=300:30, <=400:15, else 5)",
        "description": (
            "Average AQI across CPCB monitoring stations and WAQI (used as a fallback for "
            "PINs without a CPCB station), converted to points using CPCB's official AQI "
            "category bands."
        ),
    },
    "power": {
        "weight": WEIGHTS["power"],
        "formula": "score = round((outage_frequency / 5) * 60 + (1 - avg_outage_hours / 8) * 40)",
        "description": (
            "Weighted blend of outage frequency (60% of this dimension) and average outage "
            "duration (40%), sourced from DISCOM annual reports — not live-metered data."
        ),
    },
    "schools": {
        "weight": WEIGHTS["schools"],
        "formula": "score = min(100, density_points[0-60] + round((cbse_count + icse_count) / total_schools * 40))",
        "description": (
            "60 points for the number of schools found near the PIN (density), plus up to "
            "40 points for the share of those schools that are CBSE/ICSE-recognized."
        ),
    },
}

COMPOSITE_FORMULA = (
    "For each PIN, dimensions with no data are dropped entirely (not scored as 0). "
    "The remaining dimensions' weights are re-normalized to sum to 1, then the composite "
    "is their weighted average, rounded to the nearest whole number. This means two PINs "
    "can show a similar composite while having very different data coverage — see "
    "`dimensions_scored` / `dimensions_total` and `weights_applied` on each record."
)

GRADES = [(90,"A+"),(80,"A"),(70,"B+"),(60,"B"),(50,"C+"),(40,"C"),(0,"D")]

def grade(score):
    for threshold, label in GRADES:
        if score >= threshold: return label
    return "D"

def score_crime(record):
    crimes = record.get("total_cognizable_crimes")
    if crimes is None: return None
    LOW, HIGH = 250, 650
    clamped = max(LOW, min(HIGH, crimes))
    return round((1 - (clamped - LOW) / (HIGH - LOW)) * 100)

def score_infrastructure(record):
    raw = record.get("infra_score_raw")
    if raw is None: return None
    return min(100, max(0, round(raw)))

def score_air(record):
    aqi = record.get("aqi_avg")
    if aqi is None: return None
    if aqi <= 50:  return 100
    if aqi <= 100: return 85
    if aqi <= 150: return 70
    if aqi <= 200: return 50
    if aqi <= 300: return 30
    if aqi <= 400: return 15
    return 5

def score_power(record):
    freq = record.get("outage_frequency")
    hours = record.get("avg_outage_hours")
    if freq is None: return None
    freq_score = (freq / 5) * 60
    hour_score = max(0, (1 - (hours or 4)/8)) * 40
    return round(freq_score + hour_score)

# ── Schools: reads from data/raw/schools_raw.json ──────────────────────────

_SCHOOLS = None

def _load_schools():
    global _SCHOOLS
    if _SCHOOLS is None:
        p = Path(__file__).parent / 'data' / 'raw' / 'schools_raw.json'
        if p.exists():
            _SCHOOLS = json.loads(p.read_text())
            log.info(f"Loaded schools data for {len(_SCHOOLS)} pins")
        else:
            log.warning("schools_raw.json not found — schools score will be None for all pins")
            _SCHOOLS = {}
    return _SCHOOLS

def score_schools(record):
    pin  = str(record.get("pin_code", ""))
    data = _load_schools().get(pin, {})
    n    = data.get("count", 0)
    if n == 0:
        return None
    # density (60 pts)
    if   n >= 15: density = 60
    elif n >= 10: density = 56
    elif n >= 6:  density = 50
    elif n >= 3:  density = 35
    else:         density = 20
    # board quality (40 pts) — all CBSE in this dataset
    recognized  = data.get("cbse", 0) + data.get("icse", 0)
    board_score = round((recognized / n) * 40) if n else 0
    return min(100, density + board_score)

def _merge_schools(master):
    """Inject school fields into each master record for frontend use."""
    schools = _load_schools()
    for rec in master:
        pin  = str(rec.get("pin_code", ""))
        data = schools.get(pin, {})
        rec["schools_count"]       = data.get("count", 0)
        rec["schools_cbse"]        = data.get("cbse", 0)
        rec["schools_icse"]        = data.get("icse", 0)
        rec["schools_state"]       = data.get("state_board", 0)
        rec["schools_list"]        = data.get("schools", [])
        rec["schools_avg_pass"]    = data.get("avg_pass_pct")
        rec["avg_pass_percentage"] = data.get("avg_pass_pct")  # kept for compat
    return master

# ───────────────────────────────────────────────────────────────────────────

def compute_nqi(record):
    dim_scores = {
        "crime":          score_crime(record),
        "infrastructure": score_infrastructure(record),
        "air":            score_air(record),
        "power":          score_power(record),
        "schools":        score_schools(record),
    }
    available = {k: v for k, v in dim_scores.items() if v is not None}
    if not available:
        composite = None
        weights_applied = {}
    else:
        total_weight = sum(WEIGHTS[k] for k in available)
        # Re-normalized weight actually used for THIS record, since missing
        # dimensions are dropped rather than scored as 0 — exposing this lets
        # users see when a composite leaned heavily on fewer dimensions than usual.
        weights_applied = {k: round(WEIGHTS[k] / total_weight, 4) for k in available}
        composite = round(sum(available[k] * WEIGHTS[k] for k in available) / total_weight)
    return {
        "pin_code":           record["pin_code"],
        "scores":             {k: v for k, v in dim_scores.items() if v is not None},
        "weights_base":       {k: WEIGHTS[k] for k in available},
        "weights_applied":    weights_applied,
        "dimensions_scored":  len(available),
        "dimensions_total":   len(WEIGHTS),
        "nqi_composite":      composite,
        "grade":              grade(composite) if composite is not None else None,
        "scored_at":          datetime.now().isoformat(),
        # school detail fields for frontend
        "schools_count":      record.get("schools_count", 0),
        "schools_cbse":       record.get("schools_cbse", 0),
        "schools_icse":       record.get("schools_icse", 0),
        "schools_state":      record.get("schools_state", 0),
        "schools_list":       record.get("schools_list", []),
        "schools_avg_pass":   record.get("schools_avg_pass"),
    }

def save_methodology():
    """Publish the scoring rubric as its own file so it can be surfaced in the
    UI (e.g. an 'How is this calculated?' panel) instead of staying implicit
    in the code. This is the fix for: 'users can't see why crime is weighted
    30% and schools only 10%, or how the composite is built.'"""
    doc = {
        "dimensions": METHODOLOGY,
        "composite_formula": COMPOSITE_FORMULA,
        "grade_thresholds": [{"min_score": t, "grade": g} for t, g in GRADES],
        "published_at": datetime.now().isoformat(),
    }
    path = save_processed(doc, "methodology")
    log.info(f"Methodology published → {path}")
    return doc

def run():
    master = load_processed("master_by_pin")
    if not master:
        log.error("master_by_pin_latest.json not found. Run run_pipeline.py first.")
        return []

    save_methodology()

    log.info(f"Scoring {len(master)} pin codes...")
    master  = _merge_schools(master)
    results = [compute_nqi(r) for r in master if r.get("pin_code")]
    results.sort(key=lambda r: r["nqi_composite"] or 0, reverse=True)
    path = save_processed(results, "nqi_scores")
    log.info(f"Scores saved → {path}")

    print(f"\n{'='*74}")
    print(f"{'PIN CODE':<12} {'CRIME':>7} {'INFRA':>7} {'AIR':>5} {'POWER':>7} {'SCHOOL':>8} {'NQI':>5}  GRADE")
    print(f"{'='*74}")
    for r in results:
        s = r["scores"]
        print(
            f"{r['pin_code']:<12}"
            f"{str(s.get('crime','-')):>7}"
            f"{str(s.get('infrastructure','-')):>7}"
            f"{str(s.get('air','-')):>6}"
            f"{str(s.get('power','-')):>8}"
            f"{str(s.get('schools','-')):>9}"
            f"{str(r['nqi_composite'] or '-'):>6}"
            f"  {r['grade'] or '-'}"
        )
    print(f"{'='*74}")
    scored_schools = sum(1 for r in results if r["scores"].get("schools") is not None)
    print(f"Total: {len(results)} pins  |  Schools scored: {scored_schools}  |  Avg NQI: {round(sum(r['nqi_composite'] for r in results if r['nqi_composite']) / max(1,len(results)))}")
    print()
    return results

if __name__ == "__main__":
    run()

# ── sub-dimension scorers (used by report page, not in NQI composite) ──────

def score_water(record):
    hours = record.get("supply_hours")
    quality = record.get("quality_score")
    coverage = record.get("coverage_pct")
    if hours is None: return None
    hour_score    = min((hours / 22) * 40, 40)
    quality_score = ((quality or 3) / 5) * 35
    cover_score   = ((coverage or 80) / 100) * 25
    return round(hour_score + quality_score + cover_score)

def score_roads(record):
    quality = record.get("quality_score")
    potholes = record.get("pothole_density")
    if quality is None: return None
    q_score = (quality / 5) * 60
    p_score = max(0, (1 - min((potholes or 5) / 20, 1))) * 40
    return round(q_score + p_score)

def score_sewerage(record):
    coverage = record.get("coverage_pct")
    wl_risk  = record.get("waterlogging_risk")
    treatment = record.get("treatment","Partial")
    if coverage is None: return None
    cov_score  = ((coverage or 70) / 100) * 40
    risk_score = ((wl_risk or 3) / 5) * 35
    treat_score = {"Adequate":25,"Partial":15,"Inadequate":5}.get(treatment, 15)
    return round(cov_score + risk_score + treat_score)
