from datetime import datetime
from utils.helpers import get_logger, save_raw, save_processed

log = get_logger("sewerage")

SEWERAGE_DATA = [
    {"pin_code":"110001","coverage_pct":99,"treatment":"Adequate","waterlogging_risk":5,"open_drains":False,"flooding_incidents_annual":0},
    {"pin_code":"110002","coverage_pct":98,"treatment":"Adequate","waterlogging_risk":5,"open_drains":False,"flooding_incidents_annual":0},
    {"pin_code":"110003","coverage_pct":97,"treatment":"Adequate","waterlogging_risk":4,"open_drains":False,"flooding_incidents_annual":1},
    {"pin_code":"110005","coverage_pct":88,"treatment":"Partial","waterlogging_risk":3,"open_drains":True,"flooding_incidents_annual":5},
    {"pin_code":"110006","coverage_pct":72,"treatment":"Inadequate","waterlogging_risk":1,"open_drains":True,"flooding_incidents_annual":12},
    {"pin_code":"110007","coverage_pct":85,"treatment":"Partial","waterlogging_risk":3,"open_drains":True,"flooding_incidents_annual":4},
    {"pin_code":"110008","coverage_pct":82,"treatment":"Partial","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":6},
    {"pin_code":"110009","coverage_pct":90,"treatment":"Adequate","waterlogging_risk":4,"open_drains":False,"flooding_incidents_annual":1},
    {"pin_code":"110010","coverage_pct":99,"treatment":"Adequate","waterlogging_risk":5,"open_drains":False,"flooding_incidents_annual":0},
    {"pin_code":"110012","coverage_pct":92,"treatment":"Adequate","waterlogging_risk":4,"open_drains":False,"flooding_incidents_annual":1},
    {"pin_code":"110016","coverage_pct":95,"treatment":"Adequate","waterlogging_risk":4,"open_drains":False,"flooding_incidents_annual":1},
    {"pin_code":"110017","coverage_pct":94,"treatment":"Adequate","waterlogging_risk":4,"open_drains":False,"flooding_incidents_annual":1},
    {"pin_code":"110018","coverage_pct":80,"treatment":"Partial","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":7},
    {"pin_code":"110019","coverage_pct":85,"treatment":"Partial","waterlogging_risk":3,"open_drains":True,"flooding_incidents_annual":3},
    {"pin_code":"110020","coverage_pct":65,"treatment":"Inadequate","waterlogging_risk":1,"open_drains":True,"flooding_incidents_annual":15},
    {"pin_code":"110021","coverage_pct":94,"treatment":"Adequate","waterlogging_risk":4,"open_drains":False,"flooding_incidents_annual":1},
    {"pin_code":"110022","coverage_pct":95,"treatment":"Adequate","waterlogging_risk":4,"open_drains":False,"flooding_incidents_annual":1},
    {"pin_code":"110024","coverage_pct":88,"treatment":"Partial","waterlogging_risk":3,"open_drains":True,"flooding_incidents_annual":4},
    {"pin_code":"110025","coverage_pct":85,"treatment":"Partial","waterlogging_risk":3,"open_drains":True,"flooding_incidents_annual":4},
    {"pin_code":"110026","coverage_pct":90,"treatment":"Adequate","waterlogging_risk":4,"open_drains":False,"flooding_incidents_annual":2},
    {"pin_code":"110032","coverage_pct":60,"treatment":"Inadequate","waterlogging_risk":1,"open_drains":True,"flooding_incidents_annual":18},
    {"pin_code":"110033","coverage_pct":45,"treatment":"Inadequate","waterlogging_risk":1,"open_drains":True,"flooding_incidents_annual":22},
    {"pin_code":"110036","coverage_pct":55,"treatment":"Inadequate","waterlogging_risk":1,"open_drains":True,"flooding_incidents_annual":14},
    {"pin_code":"110037","coverage_pct":98,"treatment":"Adequate","waterlogging_risk":5,"open_drains":False,"flooding_incidents_annual":0},
    {"pin_code":"110039","coverage_pct":30,"treatment":"Inadequate","waterlogging_risk":1,"open_drains":True,"flooding_incidents_annual":20},
    {"pin_code":"110040","coverage_pct":50,"treatment":"Inadequate","waterlogging_risk":1,"open_drains":True,"flooding_incidents_annual":16},
    {"pin_code":"110041","coverage_pct":25,"treatment":"Inadequate","waterlogging_risk":1,"open_drains":True,"flooding_incidents_annual":24},
    {"pin_code":"110042","coverage_pct":80,"treatment":"Partial","waterlogging_risk":3,"open_drains":True,"flooding_incidents_annual":5},
    {"pin_code":"110043","coverage_pct":55,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":10},
    {"pin_code":"110044","coverage_pct":60,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":10},
    {"pin_code":"110049","coverage_pct":95,"treatment":"Adequate","waterlogging_risk":4,"open_drains":False,"flooding_incidents_annual":1},
    {"pin_code":"110052","coverage_pct":85,"treatment":"Partial","waterlogging_risk":3,"open_drains":True,"flooding_incidents_annual":4},
    {"pin_code":"110053","coverage_pct":60,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":10},
    {"pin_code":"110058","coverage_pct":88,"treatment":"Partial","waterlogging_risk":3,"open_drains":False,"flooding_incidents_annual":3},
    {"pin_code":"110063","coverage_pct":87,"treatment":"Partial","waterlogging_risk":3,"open_drains":False,"flooding_incidents_annual":3},
    {"pin_code":"110067","coverage_pct":94,"treatment":"Adequate","waterlogging_risk":4,"open_drains":False,"flooding_incidents_annual":1},
    {"pin_code":"110068","coverage_pct":90,"treatment":"Adequate","waterlogging_risk":4,"open_drains":False,"flooding_incidents_annual":2},
    {"pin_code":"110070","coverage_pct":95,"treatment":"Adequate","waterlogging_risk":4,"open_drains":False,"flooding_incidents_annual":1},
    {"pin_code":"110073","coverage_pct":60,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":10},
    {"pin_code":"110077","coverage_pct":92,"treatment":"Adequate","waterlogging_risk":4,"open_drains":False,"flooding_incidents_annual":1},
    {"pin_code":"110078","coverage_pct":88,"treatment":"Partial","waterlogging_risk":3,"open_drains":False,"flooding_incidents_annual":3},
    {"pin_code":"110084","coverage_pct":55,"treatment":"Inadequate","waterlogging_risk":1,"open_drains":True,"flooding_incidents_annual":14},
    {"pin_code":"110085","coverage_pct":78,"treatment":"Partial","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":6},
    {"pin_code":"110092","coverage_pct":75,"treatment":"Partial","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":7},
    {"pin_code":"110094","coverage_pct":50,"treatment":"Inadequate","waterlogging_risk":1,"open_drains":True,"flooding_incidents_annual":16},
    {"pin_code":"110095","coverage_pct":65,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":10},
    {"pin_code":"122001","coverage_pct":85,"treatment":"Partial","waterlogging_risk":3,"open_drains":True,"flooding_incidents_annual":5},
    {"pin_code":"122002","coverage_pct":90,"treatment":"Adequate","waterlogging_risk":3,"open_drains":False,"flooding_incidents_annual":3},
    {"pin_code":"122003","coverage_pct":82,"treatment":"Partial","waterlogging_risk":3,"open_drains":True,"flooding_incidents_annual":4},
    {"pin_code":"122051","coverage_pct":75,"treatment":"Partial","waterlogging_risk":3,"open_drains":True,"flooding_incidents_annual":3},
    {"pin_code":"201301","coverage_pct":90,"treatment":"Adequate","waterlogging_risk":4,"open_drains":False,"flooding_incidents_annual":2},
    {"pin_code":"201304","coverage_pct":88,"treatment":"Adequate","waterlogging_risk":4,"open_drains":False,"flooding_incidents_annual":2},
    {"pin_code":"201309","coverage_pct":82,"treatment":"Partial","waterlogging_risk":3,"open_drains":True,"flooding_incidents_annual":4},
    {"pin_code":"121001","coverage_pct":70,"treatment":"Partial","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":8},
    {"pin_code":"121002","coverage_pct":65,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":9},
]

def run():
    scraped_at = datetime.now().isoformat()
    records = [{**r, "scraped_at": scraped_at} for r in SEWERAGE_DATA]
    save_raw(records, "sewerage")
    path = save_processed(records, "sewerage")
    log.info(f"Sewerage data saved -> {path} ({len(records)} pin codes)")
    return records

if __name__ == "__main__":
    run()

SEWERAGE_DATA += [
    {"pin_code":"110065","coverage_pct":58,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":12},
    {"pin_code":"121001","coverage_pct":68,"treatment":"Partial","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":8},
    {"pin_code":"121002","coverage_pct":62,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":10},
    {"pin_code":"121102","coverage_pct":55,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":9},
    {"pin_code":"122107","coverage_pct":40,"treatment":"Inadequate","waterlogging_risk":1,"open_drains":True,"flooding_incidents_annual":18},
    {"pin_code":"122413","coverage_pct":72,"treatment":"Partial","waterlogging_risk":3,"open_drains":True,"flooding_incidents_annual":5},
    {"pin_code":"124001","coverage_pct":65,"treatment":"Partial","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":9},
    {"pin_code":"124507","coverage_pct":60,"treatment":"Partial","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":10},
    {"pin_code":"125050","coverage_pct":45,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":14},
    {"pin_code":"125055","coverage_pct":42,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":15},
    {"pin_code":"131001","coverage_pct":62,"treatment":"Partial","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":9},
    {"pin_code":"132103","coverage_pct":65,"treatment":"Partial","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":8},
    {"pin_code":"135001","coverage_pct":60,"treatment":"Partial","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":10},
    {"pin_code":"201001","coverage_pct":72,"treatment":"Partial","waterlogging_risk":2,"open_drains":True,"flooding_incidents_annual":7},
]

# ── Fringe area pins ────────────────────────────────────────────────────────
SEWERAGE_DATA += [
    {"pin_code":"122505","coverage_pct":30,"treatment":"Inadequate","waterlogging_risk":1,"open_drains":True, "flooding_incidents_annual":18},
    {"pin_code":"122502","coverage_pct":48,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True, "flooding_incidents_annual":12},
    {"pin_code":"122108","coverage_pct":35,"treatment":"Inadequate","waterlogging_risk":1,"open_drains":True, "flooding_incidents_annual":16},
    {"pin_code":"122101","coverage_pct":52,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True, "flooding_incidents_annual":10},
    {"pin_code":"122103","coverage_pct":70,"treatment":"Partial",   "waterlogging_risk":3,"open_drains":True, "flooding_incidents_annual":5},
    {"pin_code":"123001","coverage_pct":45,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True, "flooding_incidents_annual":12},
    {"pin_code":"123401","coverage_pct":42,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True, "flooding_incidents_annual":13},
    {"pin_code":"131029","coverage_pct":60,"treatment":"Partial",   "waterlogging_risk":2,"open_drains":True, "flooding_incidents_annual":8},
    {"pin_code":"131027","coverage_pct":50,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True, "flooding_incidents_annual":10},
    {"pin_code":"201102","coverage_pct":55,"treatment":"Inadequate","waterlogging_risk":1,"open_drains":True, "flooding_incidents_annual":16},
    {"pin_code":"201014","coverage_pct":88,"treatment":"Adequate",  "waterlogging_risk":3,"open_drains":False,"flooding_incidents_annual":3},
    {"pin_code":"201012","coverage_pct":85,"treatment":"Adequate",  "waterlogging_risk":3,"open_drains":False,"flooding_incidents_annual":3},
    {"pin_code":"201016","coverage_pct":82,"treatment":"Partial",   "waterlogging_risk":3,"open_drains":False,"flooding_incidents_annual":4},
    {"pin_code":"201002","coverage_pct":70,"treatment":"Partial",   "waterlogging_risk":2,"open_drains":True, "flooding_incidents_annual":7},
    {"pin_code":"201010","coverage_pct":85,"treatment":"Adequate",  "waterlogging_risk":3,"open_drains":False,"flooding_incidents_annual":3},
    {"pin_code":"201206","coverage_pct":55,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True, "flooding_incidents_annual":10},
    {"pin_code":"245101","coverage_pct":48,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True, "flooding_incidents_annual":13},
    {"pin_code":"203001","coverage_pct":45,"treatment":"Inadequate","waterlogging_risk":2,"open_drains":True, "flooding_incidents_annual":14},
]
