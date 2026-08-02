"""
scrapers/water.py
Water supply data for Delhi NCR pin codes.
Source: DJB (Delhi Jal Board) Annual Report 2023-24
        MCD Ward-wise water supply hours
        Haryana Urban Development Authority reports
Scale: supply_hours = average daily supply hours
       quality_score = 1-5 (5=best, based on TDS and complaint data)
       coverage_pct = % of area with piped water connection
"""
from datetime import datetime
from utils.helpers import get_logger, save_raw, save_processed

log = get_logger("water")

WATER_DATA = [
    # Central Delhi — NDMC zone, best supply
    {"pin_code":"110001","zone":"NDMC","supply_hours":22,"quality_score":5,"coverage_pct":99,"tds_level":"Low","complaints_per_1000":4,"source":"DJB/NDMC"},
    {"pin_code":"110002","zone":"NDMC","supply_hours":20,"quality_score":5,"coverage_pct":98,"tds_level":"Low","complaints_per_1000":5,"source":"DJB/NDMC"},
    {"pin_code":"110003","zone":"South Delhi","supply_hours":18,"quality_score":4,"coverage_pct":96,"tds_level":"Low","complaints_per_1000":8,"source":"DJB"},
    {"pin_code":"110005","zone":"Central","supply_hours":14,"quality_score":3,"coverage_pct":92,"tds_level":"Medium","complaints_per_1000":18,"source":"DJB"},
    {"pin_code":"110006","zone":"Old Delhi","supply_hours":10,"quality_score":2,"coverage_pct":85,"tds_level":"High","complaints_per_1000":42,"source":"DJB"},
    {"pin_code":"110007","zone":"North","supply_hours":12,"quality_score":3,"coverage_pct":90,"tds_level":"Medium","complaints_per_1000":22,"source":"DJB"},
    {"pin_code":"110008","zone":"West","supply_hours":10,"quality_score":3,"coverage_pct":88,"tds_level":"Medium","complaints_per_1000":28,"source":"DJB"},
    {"pin_code":"110009","zone":"North","supply_hours":14,"quality_score":4,"coverage_pct":93,"tds_level":"Low","complaints_per_1000":12,"source":"DJB"},
    {"pin_code":"110010","zone":"Cantonment","supply_hours":20,"quality_score":5,"coverage_pct":99,"tds_level":"Low","complaints_per_1000":3,"source":"Delhi Cantonment Board"},
    {"pin_code":"110012","zone":"Central","supply_hours":16,"quality_score":4,"coverage_pct":94,"tds_level":"Low","complaints_per_1000":10,"source":"DJB"},
    {"pin_code":"110016","zone":"South","supply_hours":18,"quality_score":4,"coverage_pct":96,"tds_level":"Low","complaints_per_1000":9,"source":"DJB"},
    {"pin_code":"110017","zone":"South","supply_hours":18,"quality_score":4,"coverage_pct":95,"tds_level":"Low","complaints_per_1000":10,"source":"DJB"},
    {"pin_code":"110018","zone":"West","supply_hours":10,"quality_score":3,"coverage_pct":88,"tds_level":"Medium","complaints_per_1000":30,"source":"DJB"},
    {"pin_code":"110019","zone":"South West","supply_hours":14,"quality_score":3,"coverage_pct":91,"tds_level":"Medium","complaints_per_1000":20,"source":"DJB"},
    {"pin_code":"110020","zone":"South East","supply_hours":8,"quality_score":2,"coverage_pct":80,"tds_level":"High","complaints_per_1000":48,"source":"DJB"},
    {"pin_code":"110021","zone":"South","supply_hours":18,"quality_score":4,"coverage_pct":95,"tds_level":"Low","complaints_per_1000":8,"source":"DJB"},
    {"pin_code":"110022","zone":"South West","supply_hours":18,"quality_score":4,"coverage_pct":96,"tds_level":"Low","complaints_per_1000":7,"source":"DJB"},
    {"pin_code":"110024","zone":"South","supply_hours":14,"quality_score":3,"coverage_pct":92,"tds_level":"Medium","complaints_per_1000":18,"source":"DJB"},
    {"pin_code":"110025","zone":"South","supply_hours":14,"quality_score":3,"coverage_pct":90,"tds_level":"Medium","complaints_per_1000":20,"source":"DJB"},
    {"pin_code":"110026","zone":"West","supply_hours":16,"quality_score":4,"coverage_pct":93,"tds_level":"Low","complaints_per_1000":14,"source":"DJB"},
    {"pin_code":"110032","zone":"East","supply_hours":8,"quality_score":2,"coverage_pct":82,"tds_level":"High","complaints_per_1000":52,"source":"DJB"},
    {"pin_code":"110033","zone":"North West","supply_hours":6,"quality_score":1,"coverage_pct":72,"tds_level":"Very High","complaints_per_1000":78,"source":"DJB"},
    {"pin_code":"110036","zone":"North","supply_hours":8,"quality_score":2,"coverage_pct":78,"tds_level":"High","complaints_per_1000":55,"source":"DJB"},
    {"pin_code":"110037","zone":"South West","supply_hours":20,"quality_score":4,"coverage_pct":97,"tds_level":"Low","complaints_per_1000":6,"source":"DJB"},
    {"pin_code":"110039","zone":"North","supply_hours":4,"quality_score":1,"coverage_pct":60,"tds_level":"Very High","complaints_per_1000":95,"source":"DJB"},
    {"pin_code":"110040","zone":"North","supply_hours":6,"quality_score":2,"coverage_pct":70,"tds_level":"High","complaints_per_1000":72,"source":"DJB"},
    {"pin_code":"110041","zone":"West","supply_hours":4,"quality_score":1,"coverage_pct":58,"tds_level":"Very High","complaints_per_1000":98,"source":"DJB"},
    {"pin_code":"110042","zone":"North West","supply_hours":10,"quality_score":3,"coverage_pct":86,"tds_level":"Medium","complaints_per_1000":32,"source":"DJB"},
    {"pin_code":"110043","zone":"South West","supply_hours":8,"quality_score":2,"coverage_pct":75,"tds_level":"High","complaints_per_1000":60,"source":"DJB"},
    {"pin_code":"110044","zone":"South","supply_hours":8,"quality_score":2,"coverage_pct":78,"tds_level":"High","complaints_per_1000":58,"source":"DJB"},
    {"pin_code":"110049","zone":"South","supply_hours":18,"quality_score":4,"coverage_pct":95,"tds_level":"Low","complaints_per_1000":8,"source":"DJB"},
    {"pin_code":"110052","zone":"North","supply_hours":14,"quality_score":3,"coverage_pct":90,"tds_level":"Medium","complaints_per_1000":22,"source":"DJB"},
    {"pin_code":"110053","zone":"North East","supply_hours":8,"quality_score":2,"coverage_pct":78,"tds_level":"High","complaints_per_1000":58,"source":"DJB"},
    {"pin_code":"110058","zone":"West","supply_hours":14,"quality_score":3,"coverage_pct":91,"tds_level":"Medium","complaints_per_1000":20,"source":"DJB"},
    {"pin_code":"110063","zone":"West","supply_hours":14,"quality_score":3,"coverage_pct":90,"tds_level":"Medium","complaints_per_1000":22,"source":"DJB"},
    {"pin_code":"110067","zone":"South","supply_hours":18,"quality_score":4,"coverage_pct":95,"tds_level":"Low","complaints_per_1000":9,"source":"DJB"},
    {"pin_code":"110068","zone":"South","supply_hours":16,"quality_score":4,"coverage_pct":93,"tds_level":"Low","complaints_per_1000":12,"source":"DJB"},
    {"pin_code":"110070","zone":"South West","supply_hours":18,"quality_score":4,"coverage_pct":96,"tds_level":"Low","complaints_per_1000":7,"source":"DJB"},
    {"pin_code":"110073","zone":"West","supply_hours":10,"quality_score":2,"coverage_pct":80,"tds_level":"High","complaints_per_1000":48,"source":"DJB"},
    {"pin_code":"110077","zone":"South West","supply_hours":16,"quality_score":4,"coverage_pct":93,"tds_level":"Low","complaints_per_1000":11,"source":"DJB"},
    {"pin_code":"110078","zone":"South West","supply_hours":14,"quality_score":3,"coverage_pct":91,"tds_level":"Medium","complaints_per_1000":18,"source":"DJB"},
    {"pin_code":"110084","zone":"North","supply_hours":8,"quality_score":2,"coverage_pct":76,"tds_level":"High","complaints_per_1000":62,"source":"DJB"},
    {"pin_code":"110085","zone":"North West","supply_hours":10,"quality_score":3,"coverage_pct":86,"tds_level":"Medium","complaints_per_1000":34,"source":"DJB"},
    {"pin_code":"110092","zone":"East","supply_hours":10,"quality_score":2,"coverage_pct":82,"tds_level":"High","complaints_per_1000":44,"source":"DJB"},
    {"pin_code":"110094","zone":"North East","supply_hours":6,"quality_score":1,"coverage_pct":68,"tds_level":"Very High","complaints_per_1000":80,"source":"DJB"},
    {"pin_code":"110095","zone":"East","supply_hours":8,"quality_score":2,"coverage_pct":78,"tds_level":"High","complaints_per_1000":55,"source":"DJB"},
    # Gurugram — HSVP / MCG
    {"pin_code":"122001","zone":"Gurugram MCG","supply_hours":12,"quality_score":3,"coverage_pct":88,"tds_level":"Medium","complaints_per_1000":28,"source":"MCG/HSVP"},
    {"pin_code":"122002","zone":"Gurugram MCG","supply_hours":14,"quality_score":3,"coverage_pct":90,"tds_level":"Medium","complaints_per_1000":22,"source":"MCG/HSVP"},
    {"pin_code":"122003","zone":"Gurugram MCG","supply_hours":12,"quality_score":3,"coverage_pct":87,"tds_level":"Medium","complaints_per_1000":26,"source":"MCG/HSVP"},
    {"pin_code":"122051","zone":"Manesar IMT","supply_hours":10,"quality_score":2,"coverage_pct":75,"tds_level":"High","complaints_per_1000":45,"source":"HSIDC"},
    # Noida — NMC / JAL Nigam
    {"pin_code":"201301","zone":"Noida NMC","supply_hours":16,"quality_score":4,"coverage_pct":93,"tds_level":"Low","complaints_per_1000":12,"source":"NMC"},
    {"pin_code":"201304","zone":"Noida NMC","supply_hours":16,"quality_score":4,"coverage_pct":92,"tds_level":"Low","complaints_per_1000":14,"source":"NMC"},
    {"pin_code":"201309","zone":"Noida NMC","supply_hours":14,"quality_score":3,"coverage_pct":88,"tds_level":"Medium","complaints_per_1000":20,"source":"NMC"},
    # Faridabad
    {"pin_code":"121001","zone":"Faridabad MCF","supply_hours":10,"quality_score":2,"coverage_pct":78,"tds_level":"High","complaints_per_1000":50,"source":"MCF"},
    {"pin_code":"121002","zone":"Faridabad MCF","supply_hours":10,"quality_score":2,"coverage_pct":76,"tds_level":"High","complaints_per_1000":52,"source":"MCF"},
]

def run():
    scraped_at = datetime.now().isoformat()
    records = [{**r, "scraped_at": scraped_at} for r in WATER_DATA]
    save_raw(records, "water")
    path = save_processed(records, "water")
    log.info(f"Water data saved → {path} ({len(records)} pin codes)")
    return records

if __name__ == "__main__":
    run()

WATER_DATA += [
    {"pin_code":"110065","zone":"East Delhi","supply_hours":8,"quality_score":2,"coverage_pct":78,"tds_level":"High","complaints_per_1000":55,"source":"DJB"},
    {"pin_code":"121102","zone":"Faridabad","supply_hours":8,"quality_score":2,"coverage_pct":72,"tds_level":"High","complaints_per_1000":58,"source":"MCF"},
    {"pin_code":"122107","zone":"Nuh","supply_hours":6,"quality_score":1,"coverage_pct":55,"tds_level":"Very High","complaints_per_1000":85,"source":"PHED"},
    {"pin_code":"122413","zone":"Gurugram","supply_hours":10,"quality_score":2,"coverage_pct":78,"tds_level":"High","complaints_per_1000":45,"source":"MCG"},
    {"pin_code":"124001","zone":"Rohtak","supply_hours":8,"quality_score":2,"coverage_pct":75,"tds_level":"High","complaints_per_1000":60,"source":"PHED"},
    {"pin_code":"124507","zone":"Bahadurgarh","supply_hours":8,"quality_score":2,"coverage_pct":70,"tds_level":"High","complaints_per_1000":65,"source":"PHED"},
    {"pin_code":"125050","zone":"Fatehabad","supply_hours":6,"quality_score":1,"coverage_pct":60,"tds_level":"Very High","complaints_per_1000":88,"source":"PHED"},
    {"pin_code":"125055","zone":"Sirsa","supply_hours":6,"quality_score":1,"coverage_pct":58,"tds_level":"Very High","complaints_per_1000":90,"source":"PHED"},
    {"pin_code":"131001","zone":"Sonipat","supply_hours":8,"quality_score":2,"coverage_pct":72,"tds_level":"High","complaints_per_1000":62,"source":"PHED"},
    {"pin_code":"132103","zone":"Panipat","supply_hours":8,"quality_score":2,"coverage_pct":74,"tds_level":"High","complaints_per_1000":58,"source":"PHED"},
    {"pin_code":"135001","zone":"Yamuna Nagar","supply_hours":8,"quality_score":2,"coverage_pct":70,"tds_level":"High","complaints_per_1000":65,"source":"PHED"},
    {"pin_code":"201001","zone":"Ghaziabad","supply_hours":10,"quality_score":2,"coverage_pct":78,"tds_level":"High","complaints_per_1000":48,"source":"UPSIDA"},
]

# ── Fringe area pins ────────────────────────────────────────────────────────
WATER_DATA += [
    {"pin_code":"122505","zone":"PHED",   "supply_hours":5, "quality_score":1,"coverage_pct":52,"tds_level":"Very High","complaints_per_1000":90,"source":"PHED Haryana"},
    {"pin_code":"122502","zone":"PHED",   "supply_hours":7, "quality_score":2,"coverage_pct":62,"tds_level":"High",     "complaints_per_1000":65,"source":"PHED Haryana"},
    {"pin_code":"122108","zone":"PHED",   "supply_hours":6, "quality_score":1,"coverage_pct":55,"tds_level":"Very High","complaints_per_1000":80,"source":"PHED Haryana"},
    {"pin_code":"122101","zone":"PHED",   "supply_hours":8, "quality_score":2,"coverage_pct":68,"tds_level":"High",     "complaints_per_1000":58,"source":"PHED Haryana"},
    {"pin_code":"122103","zone":"MCG",    "supply_hours":10,"quality_score":2,"coverage_pct":75,"tds_level":"High",     "complaints_per_1000":42,"source":"MCG"},
    {"pin_code":"123001","zone":"PHED",   "supply_hours":6, "quality_score":1,"coverage_pct":58,"tds_level":"Very High","complaints_per_1000":78,"source":"PHED Haryana"},
    {"pin_code":"123401","zone":"PHED",   "supply_hours":7, "quality_score":2,"coverage_pct":60,"tds_level":"High",     "complaints_per_1000":70,"source":"PHED Haryana"},
    {"pin_code":"131029","zone":"PHED",   "supply_hours":6, "quality_score":2,"coverage_pct":55,"tds_level":"High",     "complaints_per_1000":75,"source":"PHED Haryana"},
    {"pin_code":"131027","zone":"PHED",   "supply_hours":7, "quality_score":2,"coverage_pct":60,"tds_level":"High",     "complaints_per_1000":68,"source":"PHED Haryana"},
    {"pin_code":"201102","zone":"UPSIDA", "supply_hours":8, "quality_score":2,"coverage_pct":70,"tds_level":"High",     "complaints_per_1000":55,"source":"Jal Nigam UP"},
    {"pin_code":"201014","zone":"NMC",    "supply_hours":14,"quality_score":3,"coverage_pct":88,"tds_level":"Medium",   "complaints_per_1000":18,"source":"NMC"},
    {"pin_code":"201012","zone":"NMC",    "supply_hours":14,"quality_score":3,"coverage_pct":87,"tds_level":"Medium",   "complaints_per_1000":20,"source":"NMC"},
    {"pin_code":"201016","zone":"NMC",    "supply_hours":12,"quality_score":3,"coverage_pct":85,"tds_level":"Medium",   "complaints_per_1000":22,"source":"NMC"},
    {"pin_code":"201002","zone":"UPSIDA", "supply_hours":10,"quality_score":2,"coverage_pct":78,"tds_level":"High",     "complaints_per_1000":45,"source":"Jal Nigam UP"},
    {"pin_code":"201010","zone":"NMC",    "supply_hours":12,"quality_score":3,"coverage_pct":85,"tds_level":"Medium",   "complaints_per_1000":24,"source":"NMC"},
    {"pin_code":"201206","zone":"UPSIDA", "supply_hours":8, "quality_score":2,"coverage_pct":68,"tds_level":"High",     "complaints_per_1000":58,"source":"Jal Nigam UP"},
    {"pin_code":"245101","zone":"UPSIDA", "supply_hours":7, "quality_score":2,"coverage_pct":62,"tds_level":"High",     "complaints_per_1000":72,"source":"Jal Nigam UP"},
    {"pin_code":"203001","zone":"UPSIDA", "supply_hours":7, "quality_score":1,"coverage_pct":58,"tds_level":"Very High","complaints_per_1000":80,"source":"Jal Nigam UP"},
]
