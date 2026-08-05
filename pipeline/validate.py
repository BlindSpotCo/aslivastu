#!/usr/bin/env python3
"""
validate.py — data integrity checks for the AsliVastu pipeline.

Run after run_pipeline.py + scoring.py:
    python3 validate.py            # full report
    python3 validate.py --quiet    # only failures
Exits non-zero if any CHECK fails, so it can gate CI or a deploy.

Every check here exists because a real bug shipped:
  • AQI was stored as the MEAN of pollutant sub-indices instead of the CPCB
    MAX, so a PM10 spike of 113 got diluted by NH3=4 / ozone=7 into "49.9 Good".
    Polluted areas with many sensors looked cleanest.
  • Bengaluru air was seeded with invented values 25-40 points too pessimistic,
    so the cleaner city scored worse than the dirtier one.
  • score_air used flat CPCB bands, so AQI 49.9 -> 100 and 50.1 -> 85: a 0.2
    difference caused a 15-point swing and made comparison meaningless.
  • water/roads/sewerage all emitted `quality_score`/`coverage_pct`; a blind
    dict.update() let one silently overwrite the others.
"""
import json, re, sys
from pathlib import Path
from datetime import datetime, timedelta
from collections import Counter, defaultdict

PROC = Path(__file__).parent / "data" / "processed"
RAW = Path(__file__).parent / "data" / "raw"
STALE_DAYS = 30

results = []          # (level, name, message)  level: PASS | FAIL | WARN


def record(level, name, msg=""):
    results.append((level, name, msg))


def load(name, base=PROC):
    p = base / f"{name}.json"
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text())
    except ValueError:
        return None


def aqi_category(v):
    for hi, lab in [(50, "Good"), (100, "Satisfactory"), (200, "Moderate"),
                    (300, "Poor"), (400, "Very Poor")]:
        if v <= hi:
            return lab
    return "Severe"


# ── A. AQI methodology ──────────────────────────────────────────────────────
def check_aqi_is_max(master, cpcb):
    """CPCB AQI = worst pollutant sub-index, never the average."""
    if not cpcb:
        record("WARN", "aqi/max-not-mean", "no cpcb_aqi_latest.json — skipped")
        return
    by_pin = defaultdict(list)
    for r in cpcb:
        if r.get("pin_code") and r.get("aqi") is not None:
            by_pin[r["pin_code"]].append(float(r["aqi"]))

    bad = []
    for rec in master:
        pin = rec.get("pin_code")
        vals = by_pin.get(pin)
        if not vals or rec.get("aqi_avg") is None:
            continue
        expected = round(max(vals), 1)
        actual = round(float(rec["aqi_avg"]), 1)
        if abs(actual - expected) > 0.5:
            mean = round(sum(vals) / len(vals), 1)
            hint = " (looks like the MEAN)" if abs(actual - mean) <= 0.5 else ""
            bad.append(f"{pin}: stored {actual}, CPCB max {expected}{hint}")
    if bad:
        record("FAIL", "aqi/max-not-mean",
               f"{len(bad)} pins wrong — e.g. " + "; ".join(bad[:3]))
    else:
        record("PASS", "aqi/max-not-mean", f"{len(by_pin)} live pins use max sub-index")


def check_aqi_category(master):
    bad = [f"{r['pin_code']}: {r.get('aqi_avg')} labelled {r.get('aqi_category')}"
           for r in master
           if r.get("aqi_avg") is not None and r.get("aqi_category")
           and r["aqi_category"] != aqi_category(r["aqi_avg"])]
    if bad:
        record("FAIL", "aqi/category-matches", "; ".join(bad[:3]))
    else:
        record("PASS", "aqi/category-matches")


# ── B. Freshness ────────────────────────────────────────────────────────────
def check_freshness(cpcb):
    if not cpcb:
        record("WARN", "aqi/freshness", "no live AQI file")
        return
    stamps = [r.get("scraped_at", "")[:19] for r in cpcb if r.get("scraped_at")]
    if not stamps:
        record("WARN", "aqi/freshness", "no scraped_at timestamps")
        return
    newest = max(stamps)
    try:
        age = datetime.now() - datetime.fromisoformat(newest)
    except ValueError:
        record("WARN", "aqi/freshness", f"unparseable timestamp {newest}")
        return
    if age > timedelta(days=STALE_DAYS):
        record("WARN", "aqi/freshness",
               f"live AQI is {age.days} days old (last {newest[:10]}) — rerun run_pipeline.py")
    else:
        record("PASS", "aqi/freshness", f"{age.days} days old")


# ── C. Distribution sanity (catches fabricated / uniform data) ──────────────
def check_air_distribution(scores):
    by_city = defaultdict(list)
    for r in scores:
        a = r.get("scores", {}).get("air")
        if a is not None:
            by_city[r.get("city", "?")].append(a)
    for city, vals in by_city.items():
        distinct = len(set(vals))
        if len(vals) >= 10 and distinct <= 2:
            record("FAIL", f"air/spread[{city}]",
                   f"only {distinct} distinct value(s) across {len(vals)} areas — likely fabricated/uniform")
        else:
            record("PASS", f"air/spread[{city}]", f"{distinct} distinct values / {len(vals)} areas")


def check_cross_city_plausibility(scores, master):
    """A city whose measured AQI is worse must not score better on air."""
    m = {r["pin_code"]: r for r in master}
    agg = defaultdict(lambda: {"aqi": [], "air": []})
    for r in scores:
        pin, city = r["pin_code"], r.get("city", "?")
        air = r.get("scores", {}).get("air")
        aqi = m.get(pin, {}).get("aqi_avg")
        if air is not None and aqi is not None:
            agg[city]["aqi"].append(aqi)
            agg[city]["air"].append(air)
    cities = [(c, sum(v["aqi"]) / len(v["aqi"]), sum(v["air"]) / len(v["air"]))
              for c, v in agg.items() if v["aqi"]]
    ok = True
    for i, (c1, aqi1, air1) in enumerate(cities):
        for c2, aqi2, air2 in cities[i + 1:]:
            # worse (higher) AQI must not yield a higher air score
            if (aqi1 - aqi2) * (air1 - air2) > 0:
                record("FAIL", "air/cross-city",
                       f"{c1} AQI {aqi1:.0f}/air {air1:.0f} vs {c2} AQI {aqi2:.0f}/air {air2:.0f} — inverted")
                ok = False
    if ok:
        record("PASS", "air/cross-city",
               " | ".join(f"{c}: AQI {a:.0f} -> air {s:.0f}" for c, a, s in cities))


def check_signal_variation(scores):
    """Estimate data is fine when it's labelled — but a dimension that barely
    varies within a city carries little independent signal. Bengaluru crime is
    seeded from per-tier baselines (see bengaluru_data.TIER), so its value mostly
    restates the area's assigned tier instead of measuring that area: 66 areas
    collapse onto ~10 values, one of which covers a third of them. Delhi crime,
    entered per police station, spreads across 30+ values. This flags a
    count-like field that clusters onto a handful of values across many areas, so
    a thin dimension can't quietly look as informative as a differentiated one.
    WARN, not FAIL: the data is honestly labelled, just low-resolution — replace
    the seed with real per-area figures to clear it."""
    FIELD = "total_cognizable_crimes"
    by_city = defaultdict(list)
    for r in scores:
        v = r.get(FIELD)
        if v is not None:
            by_city[r.get("city", "?")].append(v)
    for city, vals in by_city.items():
        n = len(vals)
        if n < 20:                       # too few areas to judge variation
            continue
        distinct = len(set(vals))
        top3 = sum(c for _, c in Counter(vals).most_common(3)) / n
        if distinct / n < 0.25 or top3 > 0.70:
            record("WARN", f"signal/crime-variation[{city}]",
                   f"{distinct} distinct values across {n} areas, top-3 cover "
                   f"{top3:.0%} — low independent signal (tracks area tier; "
                   f"seed with real per-area crime data to clear)")
        else:
            record("PASS", f"signal/crime-variation[{city}]",
                   f"{distinct} distinct values / {n} areas")


# ── D. Field collisions ─────────────────────────────────────────────────────
def check_namespaced_fields(master):
    """water/roads/sewerage must not share one collided value."""
    missing = [r["pin_code"] for r in master
               if r.get("supply_hours") is not None
               and (r.get("water_coverage") is None or r.get("water_quality") is None)]
    if missing:
        record("FAIL", "merge/namespaced-fields",
               f"{len(missing)} pins missing water_* namespaced keys — collision bug may have returned")
        return
    collided = [r["pin_code"] for r in master
                if r.get("water_coverage") is not None
                and r.get("sewerage_coverage") is not None
                and r.get("water_quality") is not None
                and r.get("road_quality") is not None
                and r["water_coverage"] == r["sewerage_coverage"]
                and r["water_quality"] == r["road_quality"]]
    # identical values are possible but suspicious across many pins
    if len(collided) > len(master) * 0.5:
        record("FAIL", "merge/namespaced-fields",
               f"{len(collided)} pins have identical water/sewerage AND water/road values — likely collided")
    else:
        record("PASS", "merge/namespaced-fields")


def check_area_profile(scores):
    """Sub-PIN honesty: every scored PIN must carry an area_profile with a known
    representativeness level (high/medium/low/unknown, derived from zone_type).
    This is the flag that tells a reader how well one PIN-level score represents
    the whole PIN — guard against a pin shipping without that caveat."""
    VALID = {"high", "medium", "low", "unknown"}
    bad = [r["pin_code"] for r in scores
           if not isinstance(r.get("area_profile"), dict)
           or r["area_profile"].get("representativeness") not in VALID]
    if bad:
        record("FAIL", "granularity/area-profile",
               f"{len(bad)} pins missing/invalid area_profile: {', '.join(bad[:5])}")
    else:
        n_low = sum(1 for r in scores
                    if r["area_profile"]["representativeness"] in ("low", "unknown"))
        record("PASS", "granularity/area-profile",
               f"all {len(scores)} pins carry a representativeness signal "
               f"({n_low} flagged low/unknown)")


# ── E. Score integrity ──────────────────────────────────────────────────────
GRADES = [(90, "A+"), (80, "A"), (70, "B+"), (60, "B"), (50, "C+"), (40, "C"), (0, "D")]


def grade_for(s):
    for t, g in GRADES:
        if s >= t:
            return g
    return "D"


def check_score_ranges(scores):
    bad = []
    for r in scores:
        for k, v in r.get("scores", {}).items():
            if v is None or not (0 <= v <= 100):
                bad.append(f"{r['pin_code']}.{k}={v}")
        n = r.get("nqi_composite")
        if n is not None and not (0 <= n <= 100):
            bad.append(f"{r['pin_code']}.nqi={n}")
    record("FAIL" if bad else "PASS", "scores/range-0-100", "; ".join(bad[:4]))


def check_composite_bounds(scores):
    """A weighted mean must lie between the min and max of its components."""
    bad = []
    for r in scores:
        vals = [v for v in r.get("scores", {}).values() if v is not None]
        n = r.get("nqi_composite")
        if vals and n is not None and not (min(vals) - 1 <= n <= max(vals) + 1):
            bad.append(f"{r['pin_code']}: nqi {n} outside [{min(vals)},{max(vals)}]")
    record("FAIL" if bad else "PASS", "scores/composite-in-bounds", "; ".join(bad[:3]))


def check_grades(scores):
    bad = [f"{r['pin_code']}: {r['nqi_composite']} labelled {r['grade']}"
           for r in scores
           if r.get("nqi_composite") is not None and r.get("grade")
           and r["grade"] != grade_for(r["nqi_composite"])]
    record("FAIL" if bad else "PASS", "scores/grade-matches", "; ".join(bad[:3]))


def check_weights(scores, methodology):
    if methodology:
        total = sum(d["weight"] for d in methodology.get("dimensions", {}).values())
        if abs(total - 1.0) > 0.001:
            record("FAIL", "weights/sum-to-1", f"base weights sum to {total}")
        else:
            record("PASS", "weights/sum-to-1")
    bad = []
    for r in scores:
        wa = r.get("weights_applied") or {}
        if wa and abs(sum(wa.values()) - 1.0) > 0.01:
            bad.append(f"{r['pin_code']}: {round(sum(wa.values()),3)}")
    record("FAIL" if bad else "PASS", "weights/applied-renormalised", "; ".join(bad[:3]))


# ── F. Coverage & semantics ─────────────────────────────────────────────────
def check_pins(scores, prices):
    pins = [r["pin_code"] for r in scores]
    dupes = [p for p, c in Counter(pins).items() if c > 1]
    record("FAIL" if dupes else "PASS", "pins/no-duplicates", ", ".join(dupes[:5]))

    # A valid pin_code is either a legacy 6-digit postal pincode (Delhi,
    # Bangalore) or a city-prefixed locality slug (Punjab and future tier-2/3
    # cities, e.g. "ldh-mall-road") — see ADDING_A_CITY.md for why pincode
    # stopped being a usable area unit once we went past metro cities.
    PIN_RE = re.compile(r"^\d{6}$|^[a-z]{2,6}-[a-z0-9]+(-[a-z0-9]+)*$")
    bad = [p for p in pins if not PIN_RE.match(p)]
    record("FAIL" if bad else "PASS", "pins/format", ", ".join(bad[:5]))

    nocity = [r["pin_code"] for r in scores if not r.get("city")]
    record("FAIL" if nocity else "PASS", "pins/city-tagged", ", ".join(nocity[:5]))

    if prices:
        missing = [p for p in pins if p not in prices.get("pins", {})]
        record("WARN" if missing else "PASS", "pins/price-coverage",
               f"{len(missing)} without price context" if missing else "")


def check_web_in_sync(master, scores):
    """The pipeline->web handoff is a manual copy, so 'fixed' and 'shipped' can
    silently diverge: a bug can be fixed in data/processed/ and never reach
    public/. This has happened. Fail loudly when they drift."""
    web = Path(__file__).parent.parent / "nqr-web" / "public"
    if not web.exists():
        record("WARN", "sync/web-public", "nqr-web/public not found — skipped")
        return
    # Timestamps change on every regeneration, so comparing raw JSON would always
    # "fail". Strip volatile fields and compare the data that actually matters.
    VOLATILE = {"scored_at", "merged_at", "scraped_at", "published_at", "generated_at"}

    def strip(obj):
        if isinstance(obj, dict):
            return {k: strip(v) for k, v in obj.items() if k not in VOLATILE}
        if isinstance(obj, list):
            return [strip(v) for v in obj]
        return obj

    pairs = [("nqi_scores_latest.json", "nqi_scores.json", scores),
             ("master_by_pin_latest.json", "master_by_pin.json", master)]
    drift = []
    for src_name, dst_name, src_data in pairs:
        dst = web / dst_name
        if not dst.exists():
            drift.append(f"{dst_name} missing")
            continue
        try:
            dst_data = json.loads(dst.read_text())
        except ValueError:
            drift.append(f"{dst_name} unparseable")
            continue
        src_data, dst_data = strip(src_data), strip(dst_data)
        if dst_data != src_data:
            # pinpoint an example so the message is actionable
            s = {r["pin_code"]: r for r in src_data if isinstance(r, dict) and "pin_code" in r}
            d = {r["pin_code"]: r for r in dst_data if isinstance(r, dict) and "pin_code" in r}
            ex = next((p for p in s if p in d and s[p] != d[p]), None)
            hint = ""
            if ex and "scores" in s[ex]:
                hint = (f" e.g. {ex} air {d[ex].get('scores',{}).get('air')}"
                        f" -> {s[ex].get('scores',{}).get('air')}")
            elif ex:
                hint = (f" e.g. {ex} aqi {d[ex].get('aqi_avg')} -> {s[ex].get('aqi_avg')}")
            drift.append(f"{dst_name} stale{hint}")
    if drift:
        record("FAIL", "sync/web-public",
               "; ".join(drift) + " — run ./deploy.sh (or copy data/processed -> nqr-web/public)")
    else:
        record("PASS", "sync/web-public", "public/ matches data/processed/")


def check_waterlogging(master):
    """Inverted scale: 5 = safest, 1 = worst. Guard the semantics."""
    bad = [f"{r['pin_code']}={r['waterlogging_risk']}" for r in master
           if r.get("waterlogging_risk") is not None
           and not (1 <= r["waterlogging_risk"] <= 5)]
    record("FAIL" if bad else "PASS", "sewerage/waterlogging-range", "; ".join(bad[:4]))

    inconsistent = [r["pin_code"] for r in master
                    if r.get("waterlogging_risk") is not None
                    and r.get("flooding_incidents_annual") is not None
                    and r["waterlogging_risk"] >= 4 and r["flooding_incidents_annual"] > 6]
    record("WARN" if inconsistent else "PASS", "sewerage/waterlogging-consistency",
           f"{len(inconsistent)} pins marked low-risk but flood often: {', '.join(inconsistent[:4])}"
           if inconsistent else "")


# ── run ─────────────────────────────────────────────────────────────────────
def main():
    quiet = "--quiet" in sys.argv
    master = load("master_by_pin_latest") or []
    scores = load("nqi_scores_latest") or []
    cpcb = load("cpcb_aqi_latest") or []
    methodology = load("methodology_latest")
    prices = load("price_tier_by_pin", RAW)

    if not master or not scores:
        print("FATAL: master_by_pin_latest.json / nqi_scores_latest.json missing. "
              "Run run_pipeline.py and scoring.py first.")
        return 2

    check_aqi_is_max(master, cpcb)
    check_aqi_category(master)
    check_freshness(cpcb)
    check_air_distribution(scores)
    check_cross_city_plausibility(scores, master)
    check_signal_variation(scores)
    check_area_profile(scores)
    check_namespaced_fields(master)
    check_score_ranges(scores)
    check_composite_bounds(scores)
    check_grades(scores)
    check_weights(scores, methodology)
    check_pins(scores, prices)
    check_waterlogging(master)
    check_web_in_sync(master, scores)

    fails = [r for r in results if r[0] == "FAIL"]
    warns = [r for r in results if r[0] == "WARN"]

    print(f"\n{'='*72}\nASLIVASTU DATA VALIDATION — {len(scores)} pins\n{'='*72}")
    for level, name, msg in results:
        if quiet and level == "PASS":
            continue
        mark = {"PASS": "  ok ", "FAIL": "FAIL ", "WARN": "warn "}[level]
        print(f"{mark} {name}" + (f"\n         {msg}" if msg else ""))
    print(f"{'='*72}")
    print(f"{len(results)-len(fails)-len(warns)} passed · {len(warns)} warnings · {len(fails)} failed")
    print(f"{'='*72}\n")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
