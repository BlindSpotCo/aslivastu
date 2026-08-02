from datetime import datetime
from utils.helpers import get_logger, save_raw, save_processed

log = get_logger("infrastructure")

DMRC_STATIONS = [
    {"name": "Janakpuri West",    "pin_code": "110058", "status": "under_construction"},
    {"name": "Mukundpur",         "pin_code": "110042", "status": "under_construction"},
    {"name": "Maujpur",           "pin_code": "110053", "status": "operational"},
    {"name": "Huda City Centre",  "pin_code": "122001", "status": "operational"},
    {"name": "Cyber City",        "pin_code": "122002", "status": "operational"},
    {"name": "Sector 55-56",      "pin_code": "122003", "status": "planned"},
    {"name": "Botanical Garden",  "pin_code": "201301", "status": "operational"},
    {"name": "Sector 137",        "pin_code": "201304", "status": "operational"},
    # Fringe area metro stations
    {"name": "Indirapuram",           "pin_code": "201014", "status": "operational"},
    {"name": "Vasundhara",            "pin_code": "201012", "status": "operational"},
    {"name": "Kaushambi",             "pin_code": "201010", "status": "operational"},
    {"name": "Crossing Republik",     "pin_code": "201016", "status": "planned"},
    {"name": "Raj Nagar Extension",   "pin_code": "201002", "status": "planned"},
    {"name": "Loni",                  "pin_code": "201102", "status": "planned"},
    {"name": "Sohna Road",            "pin_code": "122101", "status": "planned"},
    {"name": "Gurgaon South",         "pin_code": "122103", "status": "planned"},
]

ZONE_DATA = {
    "110001": "Commercial", "110002": "Mixed",        "110003": "Residential",
    "110005": "Mixed",      "110009": "Residential",  "110016": "Residential",
    "110017": "Residential","110018": "Residential",  "110019": "Residential",
    "110020": "Mixed",      "110022": "Residential",  "110024": "Residential",
    "110026": "Residential","110032": "Mixed",        "110033": "Mixed",
    "110037": "Commercial", "110039": "Industrial",   "110040": "Mixed",
    "110041": "Industrial", "110042": "Mixed",        "110044": "Mixed",
    "110049": "Residential","110052": "Residential",  "110053": "Mixed",
    "110058": "Residential","110063": "Residential",  "110070": "Residential",
    "110078": "Residential","110084": "Mixed",        "110085": "Residential",
    "110092": "Mixed",      "110095": "Mixed",
    "122001": "Commercial", "122002": "Commercial",   "122003": "Residential",
    "201301": "Mixed",      "201304": "Residential",  "201309": "Commercial",
    "121001": "Industrial", "121002": "Mixed",        "201001": "Mixed",
    # Extra Delhi pins
    "110006": "Mixed",      "110007": "Residential",  "110008": "Mixed",
    "110010": "Residential","110012": "Residential",  "110021": "Residential",
    "110025": "Mixed",      "110036": "Mixed",        "110043": "Mixed",
    "110065": "Mixed",      "110067": "Residential",  "110068": "Residential",
    "110073": "Mixed",      "110077": "Residential",  "110094": "Mixed",
    "121102": "Mixed",      "122051": "Commercial",   "122107": "Mixed",
    "122413": "Residential","124001": "Mixed",        "124507": "Mixed",
    "125050": "Mixed",      "125055": "Mixed",        "131001": "Mixed",
    "132103": "Mixed",      "135001": "Mixed",
    # Fringe areas
    "122505": "Rural",      "122502": "Mixed",        "122108": "Mixed",
    "122101": "Residential","122103": "Residential",  "123001": "Mixed",
    "123401": "Mixed",      "131029": "Industrial",   "131027": "Mixed",
    "201102": "Mixed",      "201014": "Residential",  "201012": "Residential",
    "201016": "Residential","201002": "Mixed",        "201010": "Residential",
    "201206": "Mixed",      "245101": "Mixed",        "203001": "Mixed",
}

SMART_CITY_PINS = {"110001","110002","110003","110005","122001","122002","201301"}

HIGHWAY_PROXIMITY = {
    "110037": "High",  "110078": "High",  "110070": "High",
    "122001": "High",  "122002": "High",  "201301": "High",
    "201304": "High",  "110020": "Medium","110032": "Medium",
    "110044": "High",  "110025": "High",
    # Extra
    "110006": "Medium","110007": "Low",   "110008": "Medium",
    "110010": "High",  "110012": "Medium","110021": "High",
    "110036": "Low",   "110043": "High",  "110065": "Medium",
    "110067": "Medium","110068": "Medium","110073": "High",
    "110077": "High",  "110094": "Low",   "121102": "High",
    "122051": "High",  "122107": "Medium","122413": "High",
    "124001": "Medium","124507": "High",  "125050": "Medium",
    "125055": "Medium","131001": "High",  "132103": "High",
    "135001": "Medium","121001": "High",  "121002": "High",
    # Fringe
    "122505": "Low",   "122502": "Medium","122108": "Medium",
    "122101": "Medium","122103": "High",  "123001": "Low",
    "123401": "Medium","131029": "High",  "131027": "High",
    "201102": "Medium","201014": "High",  "201012": "High",
    "201016": "High",  "201002": "Medium","201010": "High",
    "201206": "Medium","245101": "Medium","203001": "Low",
}

def run():
    scraped_at = datetime.now().isoformat()
    all_pins = set(ZONE_DATA.keys()) | {s["pin_code"] for s in DMRC_STATIONS}
    records = []
    for pin in sorted(all_pins):
        zone = ZONE_DATA.get(pin, "Mixed")
        stations = [s for s in DMRC_STATIONS if s["pin_code"] == pin]
        metro_op = sum(1 for s in stations if s["status"] == "operational")
        metro_pl = sum(1 for s in stations if s["status"] in ("planned", "under_construction"))
        highway = HIGHWAY_PROXIMITY.get(pin, "Low")
        smart = pin in SMART_CITY_PINS
        zone_score    = {"Residential":25,"Mixed":20,"Commercial":15,"Industrial":5,"Rural":5}.get(zone, 10)
        highway_score = {"High":20,"Medium":12,"Low":5}.get(highway, 5)
        score = min(zone_score + min(metro_op*12,24) + min(metro_pl*6,6) + highway_score + (10 if smart else 0) + 15, 100)
        records.append({
            "pin_code":               pin,
            "zone_type":              zone,
            "metro_stations_nearby":  metro_op,
            "metro_planned_stations": metro_pl,
            "highway_proximity":      highway,
            "smart_city_project":     smart,
            "infra_score_raw":        score,
            "scraped_at":             scraped_at,
        })
    save_raw(records, "infrastructure")
    path = save_processed(records, "infrastructure")
    log.info(f"Infrastructure saved -> {path} ({len(records)} pins)")
    return records

if __name__ == "__main__":
    run()
