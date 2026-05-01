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
    else:
        total_weight = sum(WEIGHTS[k] for k in available)
        composite = round(sum(available[k] * WEIGHTS[k] for k in available) / total_weight)
    return {
        "pin_code":           record["pin_code"],
        "scores":             {k: v for k, v in dim_scores.items() if v is not None},
        "dimensions_scored":  len(available),
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

def run():
    master = load_processed("master_by_pin")
    if not master:
        log.error("master_by_pin_latest.json not found. Run run_pipeline.py first.")
        return []

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
