"""
scrapers/waqi_aqi.py
Fetches real-time AQI from WAQI (aqicn.org) for pins not covered by CPCB.
Uses geo-lookup API: api.waqi.info/feed/geo:{lat};{lng}/?token=TOKEN

Add your token to ~/nqr_delhi/.env as:
    WAQI_TOKEN=your_token_here

Run standalone:  python3 scrapers/waqi_aqi.py
Or via pipeline: already called in run_pipeline.py after air_quality.py
"""

import os, time, json, requests
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from utils.helpers import get_logger, save_raw, save_processed, load_processed

load_dotenv()
log = get_logger("waqi_aqi")

# Pins not covered by CPCB — with their approximate lat/lon centres
WAQI_PINS = {
    "201014": {"name": "Indirapuram",       "lat": 28.6412, "lon": 77.3669},
    "201012": {"name": "Vasundhara",        "lat": 28.6600, "lon": 77.3534},
    "201016": {"name": "Crossing Republik", "lat": 28.6280, "lon": 77.4420},
    "201010": {"name": "Kaushambi",         "lat": 28.6452, "lon": 77.3273},
    "201002": {"name": "Raj Nagar",         "lat": 28.6720, "lon": 77.4140},
    "201206": {"name": "Muradnagar",        "lat": 28.7730, "lon": 77.4930},
    "245101": {"name": "Hapur",             "lat": 28.7300, "lon": 77.7760},
    "201102": {"name": "Loni",              "lat": 28.7494, "lon": 77.2881},
    "203001": {"name": "Bulandshahr",       "lat": 28.4070, "lon": 77.8490},
    "201001": {"name": "Ghaziabad",         "lat": 28.6692, "lon": 77.4538},
    "201301": {"name": "Noida Sec 1",       "lat": 28.5706, "lon": 77.3248},
    "201304": {"name": "Noida Sec 137",     "lat": 28.4830, "lon": 77.4170},
    "201309": {"name": "Noida Sec 62",      "lat": 28.6270, "lon": 77.3680},
    "110019": {"name": "Dwarka Sec 6",      "lat": 28.5923, "lon": 77.0480},
}

def aqi_cat(v):
    if v <= 50:  return "Good"
    if v <= 100: return "Satisfactory"
    if v <= 200: return "Moderate"
    if v <= 300: return "Poor"
    if v <= 400: return "Very Poor"
    return "Severe"

def fetch_waqi(lat, lon, token):
    url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={token}"
    try:
        r = requests.get(url, timeout=15)
        r.raise_for_status()
        data = r.json()
        if data.get("status") == "ok":
            aqi = data["data"].get("aqi")
            station = data["data"].get("city", {}).get("name", "")
            if aqi and str(aqi) != "-":
                return float(aqi), station
    except Exception as e:
        log.warning(f"WAQI fetch error ({lat},{lon}): {e}")
    return None, None

def run():
    load_dotenv()
    token = os.getenv("WAQI_TOKEN")
    if not token:
        log.error("WAQI_TOKEN not set in .env — get one free at aqicn.org/data-platform/token")
        return []

    log.info(f"Fetching WAQI AQI for {len(WAQI_PINS)} pins...")
    scraped_at = datetime.now().isoformat()
    results = []

    for pin, info in WAQI_PINS.items():
        aqi, station = fetch_waqi(info["lat"], info["lon"], token)
        if aqi:
            results.append({
                "pin_code":     pin,
                "station":      station or info["name"],
                "aqi":          aqi,
                "aqi_avg":      aqi,
                "aqi_category": aqi_cat(aqi),
                "source":       "WAQI",
                "scraped_at":   scraped_at,
            })
            log.info(f"  {pin} {info['name']}: AQI {aqi} ({aqi_cat(aqi)}) via {station}")
        else:
            log.warning(f"  {pin} {info['name']}: no data")
        time.sleep(0.3)  # be polite to API

    log.info(f"WAQI done — {len(results)}/{len(WAQI_PINS)} pins fetched")
    save_raw(results, "waqi_aqi")

    # Merge into master_by_pin directly
    master_path = Path(__file__).parent.parent / "data" / "processed" / "master_by_pin_latest.json"
    if master_path.exists():
        master = json.loads(master_path.read_text())
        waqi_by_pin = {r["pin_code"]: r for r in results}
        updated = 0
        for rec in master:
            pin = rec.get("pin_code", "")
            if pin in waqi_by_pin and not rec.get("aqi_avg"):
                rec["aqi_avg"]      = waqi_by_pin[pin]["aqi"]
                rec["aqi_category"] = waqi_by_pin[pin]["aqi_category"]
                if "waqi" not in rec.get("sources", []):
                    rec.setdefault("sources", []).append("waqi")
                updated += 1
        master_path.write_text(json.dumps(master, indent=2, ensure_ascii=False))
        log.info(f"Patched {updated} pins in master_by_pin")

    return results

if __name__ == "__main__":
    run()
