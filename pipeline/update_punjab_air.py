"""
update_punjab_air.py

Fetches real CPCB air-quality data for Punjab (PAU station → Ludhiana,
Golden Temple station → Amritsar) via the SAME official data.gov.in CPCB API
Delhi/Bangalore already use (scrapers/air_quality.py), then safely merges the
result into ONLY the 5 already-scored Punjab records in
web/public/master_by_pin.json and web/public/nqi_scores.json.

Deliberately does NOT run the full pipeline (run_pipeline.py's main()/merge()).
This environment's data/raw and data/processed do not currently have the
Delhi/Bangalore scraper caches (crime.py, infrastructure.py, etc. may fail or
return nothing here), and a full merge() re-run would rebuild master_by_pin
from whatever those scrapers produce RIGHT NOW — silently dropping any city
whose scraper fails or has no cache. This script only touches the air
dimension for Punjab's 5 pins, leaving every other pin/dimension in the
public JSON files untouched.

Requires: pipeline/.env with a working DATA_GOV_API_KEY, and network access to
api.data.gov.in (this failed from the cloud sandbox that built this rollout —
run this ON YOUR OWN MACHINE, same as every other pipeline/build/deploy step).

Usage (from ~/nqr-web/pipeline):
    python3 update_punjab_air.py
"""
import sys, json
sys.path.insert(0, '.')

PUNJAB_PINS = {
    "ldh-sarabha-nagar", "ldh-dugri", "ldh-model-town",
    "asr-majitha-road", "asr-rani-ka-bagh",
}

def main():
    import scrapers.air_quality as air
    import scoring
    import scrapers.punjab_data as pd

    print("Fetching CPCB data (Delhi/Haryana/UP/Karnataka/Punjab)...")
    cleaned = air.run()
    if not cleaned:
        print("No data returned — check DATA_GOV_API_KEY in pipeline/.env and network access to api.data.gov.in.")
        sys.exit(1)

    punjab_records = [r for r in cleaned if r["pin_code"] in PUNJAB_PINS]
    if not punjab_records:
        print("No Punjab records matched. This means the STATION_PIN_MAP substrings")
        print("('Punjab Agricultural University', 'Golden Temple') didn't match the live")
        print("API's station name field. Inspect data/processed/cpcb_aqi_latest.json for")
        print("Punjab entries (filter station names containing 'Ludhiana' or 'Amritsar')")
        print("and fix the STATION_PIN_MAP keys in scrapers/air_quality.py accordingly.")
        sys.exit(1)

    # Same aggregation rule as run_pipeline.py's merge(): CPCB defines AQI as the
    # MAX sub-index across pollutants, not the mean — the worst pollutant sets
    # the headline number.
    from collections import defaultdict
    by_pin = defaultdict(list)
    for r in punjab_records:
        by_pin[r["pin_code"]].append(r["aqi"])
    aqi_avg = {pin: round(max(vals), 1) for pin, vals in by_pin.items()}

    print("Punjab AQI resolved:")
    for pin, val in aqi_avg.items():
        print(f"  {pin}: {val}")

    # Rebuild the 5 Punjab master/score records with air included, via the
    # real scoring engine — same pattern used for the water-dimension update.
    schools = pd.schools_records()
    open('data/raw/schools_raw.json', 'w').write(json.dumps(schools, indent=2, ensure_ascii=False))
    scoring._SCHOOLS = None

    master = pd.master_records()
    for r in master:
        if r["pin_code"] in aqi_avg:
            r["aqi_avg"] = aqi_avg[r["pin_code"]]
        r['data_completeness'] = len(set(r.get('sources', [])))
        r['merged_at'] = __import__('datetime').datetime.now().isoformat()

    master2 = pd.master_records()
    for r in master2:
        if r["pin_code"] in aqi_avg:
            r["aqi_avg"] = aqi_avg[r["pin_code"]]
    master2 = scoring._merge_schools(master2)
    results = [scoring.compute_nqi(r) for r in master2]
    results = scoring.add_crime_percentiles(results)
    results = scoring.add_price_context(results)
    results = scoring.add_punjab_notes(results)

    print("\nRecomputed scores:")
    for r in results:
        print(f"  {r['pin_code']}: {r['scores']} -> {r['nqi_composite']} {r['grade']} ({r['dimensions_scored']}/{r['dimensions_total']} dims)")

    web_master = json.load(open('../web/public/master_by_pin.json'))
    web_nqi = json.load(open('../web/public/nqi_scores.json'))
    before_m, before_n = len(web_master), len(web_nqi)
    web_master = [r for r in web_master if r['pin_code'] not in PUNJAB_PINS] + master
    web_nqi = [r for r in web_nqi if r['pin_code'] not in PUNJAB_PINS] + results
    web_nqi.sort(key=lambda r: r['nqi_composite'] or 0, reverse=True)

    assert len(web_master) == before_m, f"master count changed: {before_m} -> {len(web_master)}"
    assert len(web_nqi) == before_n, f"nqi count changed: {before_n} -> {len(web_nqi)}"

    json.dump(web_master, open('../web/public/master_by_pin.json', 'w'), indent=2, ensure_ascii=False)
    json.dump(web_nqi, open('../web/public/nqi_scores.json', 'w'), indent=2, ensure_ascii=False)
    print(f"\nWrote web/public/master_by_pin.json and nqi_scores.json ({len(web_master)} pins each, unchanged count).")

if __name__ == "__main__":
    main()
