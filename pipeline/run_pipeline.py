import json
from datetime import datetime
from collections import defaultdict
from utils.helpers import get_logger, save_processed, load_processed

log = get_logger("pipeline")

def run_air():
    from scrapers.air_quality import run; log.info("=== Air Quality ==="); return run()
def run_crime():
    from scrapers.crime import run; log.info("=== Crime ==="); return run()
def run_infra():
    from scrapers.infrastructure import run; log.info("=== Infrastructure ==="); return run()
def run_power():
    from scrapers.power import run; log.info("=== Power ==="); return run()
def run_water():
    from scrapers.water import run; log.info("=== Water ==="); return run()
def run_roads():
    from scrapers.roads import run; log.info("=== Roads ==="); return run()
def run_sewerage():
    from scrapers.sewerage import run; log.info("=== Sewerage ==="); return run()

def aqi_label(v):
    if v<=50: return "Good"
    if v<=100: return "Satisfactory"
    if v<=200: return "Moderate"
    if v<=300: return "Poor"
    if v<=400: return "Very Poor"
    return "Severe"

def merge():
    log.info("=== Merging to master ===")
    master = defaultdict(lambda: {"pin_code":None,"sources":[]})

    for r in load_processed("cpcb_aqi"):
        pin = r.get("pin_code")
        if not pin: continue
        try: aqi_val = float(r.get("aqi") or r.get("pollutant_avg") or 0)
        except: aqi_val = 0.0
        if aqi_val == 0: continue
        master[pin].setdefault("aqi_values",[]).append(aqi_val)
        master[pin]["pin_code"] = pin
        if "cpcb_aqi" not in master[pin]["sources"]: master[pin]["sources"].append("cpcb_aqi")

    for pin,m in master.items():
        if "aqi_values" in m:
            vals = m.pop("aqi_values")
            # CPCB defines the AQI as the MAXIMUM sub-index across pollutants —
            # the worst pollutant determines the air quality. We previously took
            # the mean, which diluted a genuine spike (e.g. PM10 113) with benign
            # gases (NH3 4, ozone 7) and made polluted areas look clean.
            m["aqi_avg"] = round(max(vals), 1)
            m["aqi_category"] = aqi_label(m["aqi_avg"])

    for r in load_processed("cbse_schools_by_pin"):
        pin = r.get("pin_code")
        if pin:
            master[pin]["pin_code"] = pin
            master[pin].update({k:v for k,v in r.items() if k not in ("pin_code","scraped_at")})
            if "cbse_schools" not in master[pin]["sources"]: master[pin]["sources"].append("cbse_schools")

    crime_by_pin = defaultdict(int)
    for r in load_processed("delhi_crime"):
        if r.get("pin_code"): crime_by_pin[r["pin_code"]] += r.get("total_cognizable_crimes",0)
    for pin,total in crime_by_pin.items():
        master[pin]["pin_code"] = pin
        master[pin]["total_cognizable_crimes"] = total
        if "delhi_crime" not in master[pin]["sources"]: master[pin]["sources"].append("delhi_crime")

    # Namespace fields that collide across sources. water/roads both emit
    # "quality_score" and water/sewerage both emit "coverage_pct"; a blind
    # update() lets the later source clobber the earlier one, so the sub-scorers
    # (and the report cards) were reading the wrong dimension's value. Rename to
    # dimension-specific keys so each scorer reads its own data. Originals are
    # kept too for backward compatibility with any consumer still using them.
    RENAME = {
        "water":    {"quality_score": "water_quality",  "coverage_pct": "water_coverage"},
        "roads":    {"quality_score": "road_quality"},
        "sewerage": {"coverage_pct":  "sewerage_coverage"},
    }
    for src in ["infrastructure","power","water","roads","sewerage"]:
        renames = RENAME.get(src, {})
        for r in load_processed(src):
            pin = r.get("pin_code")
            if pin:
                master[pin]["pin_code"] = pin
                for k, v in r.items():
                    if k in ("pin_code", "scraped_at"): continue
                    if k in renames:
                        master[pin][renames[k]] = v   # namespaced copy
                    master[pin][k] = v                # original (back-compat)
                if src not in master[pin]["sources"]: master[pin]["sources"].append(src)

    # ── Bengaluru (city 2) — inject the seed dataset ────────────────────────
    # Air quality for Bengaluru pins may already be present here if the CPCB
    # scraper fetched a station for that pin (STATION_PIN_MAP); in that case the
    # live value wins and the seed estimate is skipped.
    try:
        from scrapers.bengaluru_data import master_records as _blr_records
        for r in _blr_records():
            pin = r["pin_code"]
            master[pin]["pin_code"] = pin
            for k, v in r.items():
                if k.startswith("_"):
                    continue
                if k == "sources":
                    for s in v:
                        if s not in master[pin]["sources"]:
                            master[pin]["sources"].append(s)
                    continue
                if k in ("aqi_avg", "aqi_category") and master[pin].get(k) is not None:
                    continue  # keep live AQI already merged from the CPCB scraper
                master[pin][k] = v
        log.info("Bengaluru seed merged.")
    except Exception as e:
        log.error(f"Bengaluru seed merge failed: {e}")

    # ── Punjab (city 3/4) — inject the minimal, honest seed dataset. Unlike
    # the Bengaluru block above, this does NOT carry estimated crime/infra/
    # power/water/roads/sewerage fields — only pin_code/city/sources. See
    # scrapers/punjab_data.py for why.
    try:
        from scrapers.punjab_data import master_records as _pb_records
        for r in _pb_records():
            pin = r["pin_code"]
            master[pin]["pin_code"] = pin
            for k, v in r.items():
                if k == "sources":
                    for s in v:
                        if s not in master[pin]["sources"]:
                            master[pin]["sources"].append(s)
                    continue
                master[pin][k] = v
        log.info("Punjab seed merged.")
    except Exception as e:
        log.error(f"Punjab seed merge failed: {e}")

    final = [v for v in master.values() if v.get("pin_code")]
    for r in final:
        r["data_completeness"] = len(set(r.get("sources",[])))
        r["merged_at"] = datetime.now().isoformat()
        # tag city (Bengaluru pins are 560xxx; everything else is the Delhi NCR set)
        r["city"] = r.get("city") or ("Bangalore" if str(r["pin_code"]).startswith("560") else "Delhi NCR")

    path = save_processed(final,"master_by_pin")
    log.info(f"Master saved → {path}")
    print(f"\n{'='*50}\nCOVERAGE SUMMARY\n{'='*50}")
    for src in ["cpcb_aqi","cbse_schools","delhi_crime","infrastructure","power","water","roads","sewerage"]:
        print(f"  {src:<25} {sum(1 for r in final if src in r.get('sources',[]))} pins")
    print(f"  {'Total pins':<25} {len(final)}")
    print(f"{'='*50}\n")
    return final

def main():
    for fn,name in [(run_air,"air"),(run_crime,"crime"),(run_infra,"infra"),(run_power,"power"),(run_water,"water"),(run_roads,"roads"),(run_sewerage,"sewerage")]:
        try: fn()
        except Exception as e: log.error(f"{name} failed: {e}")
    merge()
    log.info("Pipeline complete.")

if __name__ == "__main__":
    main()
