import os, time, requests, json
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from utils.helpers import get_logger, save_raw, save_processed

load_dotenv()
log = get_logger("air_quality")
API_BASE = "https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"
API_KEY = os.getenv("DATA_GOV_API_KEY")

STATION_PIN_MAP = {
    "Anand Vihar":"110032","Ashok Vihar":"110052","Bawana":"110039",
    "Burari Crossing":"110084","IGI Airport":"110037","ITO":"110002",
    "Jahangirpuri":"110033","Lodhi Road":"110003","Mundka":"110041",
    "Narela":"110040","NSIT Dwarka":"110078","Okhla Phase-2":"110020",
    "Patparganj":"110092","Punjabi Bagh":"110026","R.K. Puram":"110022",
    "R K Puram":"110022","Rohini":"110085","Shadipur":"110008",
    "Sirifort":"110049","Vivek Vihar":"110095","Wazirpur":"110052",
    "Alipur":"110036","CRRI Mathura Road":"110025","DTU":"110042",
    "Najafgarh":"110043","Nehru Nagar":"110065","North Campus":"110007",
    "Major Dhyan Chand":"110001","Mandir Marg":"110008",
    "NSUT Jaffarpur":"110073","IIT Delhi":"110016",
    "Sri Aurobindo Marg":"110016","Pusa":"110012",
    "IGNOU":"110068","Maidan Garhi":"110068",
    "IHBAS":"110095","Dilshad Garden":"110095",
    "Cantonment":"110010","Chandni Chowk":"110006",
    "Dwarka Sector 8":"110077","Dwarka-Sector 8":"110077",
    "Dwarka":"110078","Pitampura":"110034",
    "Sonia Vihar":"110094","Mayur Vihar":"110091",
    "Commonwealth Sports Complex":"110092",
    "Dr. Karni Singh":"110070","JNU":"110067",
    "Jawaharlal Nehru Stadium":"110003",
    "New Moti Bagh":"110021","Talkatora":"110001",
    "Amity University":"122413","Panchgaon":"122413",
    "Gurugram":"122001","Gurgaon":"122001",
    "Faridabad":"121001","Ballabhgarh":"121004",
    "Manesar":"122051","Bhiwadi":"301019",
    "Rohtak":"124001","Sonipat":"131001",
    "Panipat":"132103","Bahadurgarh":"124507",
    "Dharuhera":"123106","Palwal":"121102",
    "Rewari":"123401","Sohna":"122103",
    "Sector 51":"122003","Sector 25":"122002",
    "DLF":"122002","Palam Vihar":"122017",
    "Kundli":"131028","Murthal":"131027",
    "Yamuna Nagar":"135001","Gobind Pura":"135001",
    "Fatehabad":"125050","Sirsa":"125055",
    "Nuh":"122107","Mandikhera":"122107",
    "Noida Sector-62":"201309","Noida Sector-1":"201301",
    "Noida":"201301","Ghaziabad":"201001",
    "Loni":"201102","Indirapuram":"201014",
    # Fringe UP pins — mapped to nearest CPCB stations
    "Vasundhara":"201012",
    "Crossing Republik":"201016",
    "Raj Nagar":"201002",
    "Kaushambi":"201010",
    "Muradnagar":"201206",
    "Hapur":"245101",
    "Bulandshahr":"203001",
    # Fringe Haryana pins — mapped to nearest CPCB stations
    "Sohna":"122101",
    "Taoru":"122108",
    "Rewari Town":"123401",
    "Jhajjar":"123001",
    "Kundli":"131029",
    "Murthal":"131027",
    "Mahendragarh":"122505",
    "Gurgaon South":"122103",
}

# Fringe pins with no direct CPCB station — borrow from nearest monitored pin
FALLBACK_AQI_PINS = {
    "201012": "201301",  # Vasundhara → Noida Sector-1
    "201016": "201301",  # Crossing Republik → Noida Sector-1
    "201002": "201001",  # Raj Nagar → Ghaziabad
    "201010": "201301",  # Kaushambi → Noida Sector-1
    "201206": "201001",  # Muradnagar → Ghaziabad
    "245101": "201001",  # Hapur → Ghaziabad
    "203001": "201001",  # Bulandshahr → Ghaziabad
    "122101": "122001",  # Sohna → Gurugram
    "122108": "122001",  # Taoru → Gurugram
    "122103": "122001",  # Gurgaon South → Gurugram
    "122505": "124001",  # Mahendragarh → Rohtak
    "123001": "131001",  # Jhajjar → Sonipat
    "123401": "122001",  # Rewari Town → Gurugram
    "131029": "131001",  # Kundli → Sonipat
    "131027": "131001",  # Murthal → Sonipat
    "122502": "122001",  # Rewari → Gurugram
}

def resolve_pin(station):
    for key, pin in STATION_PIN_MAP.items():
        if key.lower() in station.lower():
            return pin
    return None

def aqi_cat(v):
    for lo,hi,label in [(0,50,"Good"),(51,100,"Satisfactory"),(101,200,"Moderate"),(201,300,"Poor"),(301,400,"Very Poor"),(401,999,"Severe")]:
        if lo <= v <= hi: return label
    return "Severe"

def fetch_state(state, key):
    records, offset = [], 0
    while True:
        try:
            r = requests.get(API_BASE, params={"api-key":key,"format":"json","limit":500,"offset":offset,"filters[state]":state}, timeout=60)
            r.raise_for_status()
            page = r.json()
        except Exception as e:
            log.warning(f"{state} fetch error: {e}")
            break
        recs = page.get("records",[])
        if not recs: break
        records.extend(recs)
        offset += 500
        if offset >= int(page.get("total",0)): break
        time.sleep(0.5)
    return records

def run():
    load_dotenv()
    key = os.getenv("DATA_GOV_API_KEY")
    log.info(f"Using API key: {key[:15]}...")
    scraped_at = datetime.now().isoformat()

    all_raw = []
    for state in ["Delhi", "Haryana", "Uttar Pradesh"]:
        log.info(f"Fetching {state}...")
        recs = fetch_state(state, key)
        log.info(f"  {len(recs)} stations")
        all_raw.extend(recs)

    if not all_raw:
        log.warning("No data returned")
        return []

    save_raw(all_raw, "cpcb_aqi_all")

    cleaned = []
    for r in all_raw:
        station = str(r.get("station","")).strip()
        if not station: continue
        pin = resolve_pin(station)
        if not pin: continue
        try:
            avg = float(r.get("avg_value") or r.get("pollutant_avg") or r.get("aqi") or 0)
        except: avg = 0.0
        if avg == 0: continue
        cleaned.append({
            "station": station,
            "pin_code": pin,
            "pollutant_id": str(r.get("pollutant_id","")).strip(),
            "aqi": avg,
            "aqi_category": aqi_cat(avg),
            "scraped_at": scraped_at,
        })

    # Build a lookup of pin → avg AQI from direct measurements
    pin_aqi = {}
    for r in cleaned:
        pin_aqi.setdefault(r["pin_code"], []).append(r["aqi"])
    pin_avg = {p: sum(v)/len(v) for p, v in pin_aqi.items()}

    # Inject fallback records for fringe pins with no direct CPCB station
    for fringe_pin, source_pin in FALLBACK_AQI_PINS.items():
        if fringe_pin not in pin_avg and source_pin in pin_avg:
            avg = pin_avg[source_pin]
            cleaned.append({
                "station": f"[Nearest] {source_pin}",
                "pin_code": fringe_pin,
                "pollutant_id": "PM2.5",
                "aqi": avg,
                "aqi_category": aqi_cat(avg),
                "scraped_at": scraped_at,
            })
            log.info(f"Fallback AQI for {fringe_pin} from {source_pin}: {avg:.1f}")

    pins = len(set(r["pin_code"] for r in cleaned))
    log.info(f"AQI saved — {len(cleaned)} records across {pins} pin codes")
    save_raw(cleaned, "cpcb_aqi")
    path = save_processed(cleaned, "cpcb_aqi")
    log.info(f"Saved → {path}")
    return cleaned

if __name__ == "__main__":
    run()
