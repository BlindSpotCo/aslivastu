from datetime import datetime
from utils.helpers import get_logger, save_raw, save_processed

log = get_logger("roads")

ROAD_DATA = [
    {"pin_code":"110001","authority":"NDMC","quality_score":5,"pothole_density":0.2,"road_condition":"Excellent","last_resurfaced":2023,"connectivity":"High"},
    {"pin_code":"110002","authority":"NDMC","quality_score":5,"pothole_density":0.3,"road_condition":"Excellent","last_resurfaced":2023,"connectivity":"High"},
    {"pin_code":"110003","authority":"PWD","quality_score":4,"pothole_density":1.2,"road_condition":"Good","last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"110005","authority":"MCD","quality_score":3,"pothole_density":4.5,"road_condition":"Average","last_resurfaced":2021,"connectivity":"High"},
    {"pin_code":"110006","authority":"MCD","quality_score":2,"pothole_density":8.2,"road_condition":"Poor","last_resurfaced":2019,"connectivity":"Medium"},
    {"pin_code":"110007","authority":"MCD","quality_score":3,"pothole_density":3.8,"road_condition":"Average","last_resurfaced":2021,"connectivity":"Medium"},
    {"pin_code":"110008","authority":"MCD","quality_score":3,"pothole_density":4.2,"road_condition":"Average","last_resurfaced":2021,"connectivity":"Medium"},
    {"pin_code":"110009","authority":"MCD","quality_score":4,"pothole_density":2.1,"road_condition":"Good","last_resurfaced":2022,"connectivity":"Medium"},
    {"pin_code":"110010","authority":"Cantonment","quality_score":5,"pothole_density":0.5,"road_condition":"Excellent","last_resurfaced":2023,"connectivity":"High"},
    {"pin_code":"110012","authority":"PWD","quality_score":4,"pothole_density":1.8,"road_condition":"Good","last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"110016","authority":"PWD","quality_score":4,"pothole_density":2.0,"road_condition":"Good","last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"110017","authority":"PWD","quality_score":4,"pothole_density":2.2,"road_condition":"Good","last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"110018","authority":"MCD","quality_score":3,"pothole_density":5.1,"road_condition":"Average","last_resurfaced":2020,"connectivity":"Medium"},
    {"pin_code":"110019","authority":"MCD","quality_score":3,"pothole_density":3.9,"road_condition":"Average","last_resurfaced":2021,"connectivity":"Medium"},
    {"pin_code":"110020","authority":"MCD","quality_score":2,"pothole_density":9.4,"road_condition":"Poor","last_resurfaced":2019,"connectivity":"Medium"},
    {"pin_code":"110021","authority":"PWD","quality_score":4,"pothole_density":1.9,"road_condition":"Good","last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"110022","authority":"PWD","quality_score":4,"pothole_density":1.8,"road_condition":"Good","last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"110024","authority":"MCD","quality_score":3,"pothole_density":3.5,"road_condition":"Average","last_resurfaced":2021,"connectivity":"High"},
    {"pin_code":"110025","authority":"PWD","quality_score":3,"pothole_density":3.8,"road_condition":"Average","last_resurfaced":2021,"connectivity":"High"},
    {"pin_code":"110026","authority":"MCD","quality_score":4,"pothole_density":2.5,"road_condition":"Good","last_resurfaced":2022,"connectivity":"Medium"},
    {"pin_code":"110032","authority":"MCD","quality_score":2,"pothole_density":10.2,"road_condition":"Poor","last_resurfaced":2018,"connectivity":"Medium"},
    {"pin_code":"110033","authority":"MCD","quality_score":1,"pothole_density":15.8,"road_condition":"Very Poor","last_resurfaced":2017,"connectivity":"Low"},
    {"pin_code":"110036","authority":"MCD","quality_score":2,"pothole_density":9.5,"road_condition":"Poor","last_resurfaced":2019,"connectivity":"Low"},
    {"pin_code":"110037","authority":"PWD","quality_score":5,"pothole_density":0.4,"road_condition":"Excellent","last_resurfaced":2023,"connectivity":"High"},
    {"pin_code":"110039","authority":"MCD","quality_score":1,"pothole_density":18.2,"road_condition":"Very Poor","last_resurfaced":2016,"connectivity":"Low"},
    {"pin_code":"110040","authority":"MCD","quality_score":2,"pothole_density":12.5,"road_condition":"Poor","last_resurfaced":2018,"connectivity":"Low"},
    {"pin_code":"110041","authority":"MCD","quality_score":1,"pothole_density":20.1,"road_condition":"Very Poor","last_resurfaced":2015,"connectivity":"Low"},
    {"pin_code":"110042","authority":"MCD","quality_score":3,"pothole_density":4.8,"road_condition":"Average","last_resurfaced":2020,"connectivity":"Medium"},
    {"pin_code":"110043","authority":"MCD","quality_score":2,"pothole_density":8.8,"road_condition":"Poor","last_resurfaced":2019,"connectivity":"Low"},
    {"pin_code":"110044","authority":"MCD","quality_score":2,"pothole_density":8.5,"road_condition":"Poor","last_resurfaced":2019,"connectivity":"Medium"},
    {"pin_code":"110049","authority":"PWD","quality_score":4,"pothole_density":2.0,"road_condition":"Good","last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"110052","authority":"MCD","quality_score":3,"pothole_density":3.9,"road_condition":"Average","last_resurfaced":2021,"connectivity":"Medium"},
    {"pin_code":"110053","authority":"MCD","quality_score":2,"pothole_density":9.2,"road_condition":"Poor","last_resurfaced":2019,"connectivity":"Low"},
    {"pin_code":"110058","authority":"MCD","quality_score":3,"pothole_density":3.5,"road_condition":"Average","last_resurfaced":2021,"connectivity":"Medium"},
    {"pin_code":"110063","authority":"MCD","quality_score":3,"pothole_density":3.8,"road_condition":"Average","last_resurfaced":2021,"connectivity":"Medium"},
    {"pin_code":"110067","authority":"PWD","quality_score":4,"pothole_density":2.2,"road_condition":"Good","last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"110068","authority":"PWD","quality_score":4,"pothole_density":2.5,"road_condition":"Good","last_resurfaced":2022,"connectivity":"Medium"},
    {"pin_code":"110070","authority":"PWD","quality_score":4,"pothole_density":1.8,"road_condition":"Good","last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"110073","authority":"MCD","quality_score":2,"pothole_density":9.8,"road_condition":"Poor","last_resurfaced":2018,"connectivity":"Low"},
    {"pin_code":"110077","authority":"DDA","quality_score":4,"pothole_density":2.2,"road_condition":"Good","last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"110078","authority":"DDA","quality_score":3,"pothole_density":3.5,"road_condition":"Average","last_resurfaced":2021,"connectivity":"High"},
    {"pin_code":"110084","authority":"MCD","quality_score":2,"pothole_density":11.2,"road_condition":"Poor","last_resurfaced":2018,"connectivity":"Low"},
    {"pin_code":"110085","authority":"MCD","quality_score":3,"pothole_density":4.5,"road_condition":"Average","last_resurfaced":2020,"connectivity":"Medium"},
    {"pin_code":"110092","authority":"MCD","quality_score":3,"pothole_density":5.2,"road_condition":"Average","last_resurfaced":2020,"connectivity":"Medium"},
    {"pin_code":"110094","authority":"MCD","quality_score":2,"pothole_density":10.5,"road_condition":"Poor","last_resurfaced":2018,"connectivity":"Low"},
    {"pin_code":"110095","authority":"MCD","quality_score":2,"pothole_density":9.8,"road_condition":"Poor","last_resurfaced":2019,"connectivity":"Low"},
    {"pin_code":"122001","authority":"NHAI","quality_score":4,"pothole_density":2.5,"road_condition":"Good","last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"122002","authority":"NHAI","quality_score":4,"pothole_density":2.2,"road_condition":"Good","last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"122003","authority":"MCG","quality_score":3,"pothole_density":4.2,"road_condition":"Average","last_resurfaced":2021,"connectivity":"High"},
    {"pin_code":"122051","authority":"NHAI","quality_score":4,"pothole_density":1.8,"road_condition":"Good","last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"201301","authority":"NHAI","quality_score":4,"pothole_density":2.0,"road_condition":"Good","last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"201304","authority":"NMC","quality_score":4,"pothole_density":2.5,"road_condition":"Good","last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"201309","authority":"NMC","quality_score":3,"pothole_density":3.8,"road_condition":"Average","last_resurfaced":2021,"connectivity":"High"},
    {"pin_code":"121001","authority":"MCF","quality_score":3,"pothole_density":5.5,"road_condition":"Average","last_resurfaced":2020,"connectivity":"Medium"},
    {"pin_code":"121002","authority":"MCF","quality_score":2,"pothole_density":8.8,"road_condition":"Poor","last_resurfaced":2019,"connectivity":"Medium"},
]

def run():
    scraped_at = datetime.now().isoformat()
    records = [{**r, "scraped_at": scraped_at} for r in ROAD_DATA]
    save_raw(records, "roads")
    path = save_processed(records, "roads")
    log.info(f"Road data saved -> {path} ({len(records)} pin codes)")
    return records

if __name__ == "__main__":
    run()

ROAD_DATA += [
    {"pin_code":"110065","authority":"MCD","quality_score":2,"pothole_density":9.8,"road_condition":"Poor","last_resurfaced":2019,"connectivity":"Low"},
    {"pin_code":"121001","authority":"NHAI","quality_score":3,"pothole_density":5.5,"road_condition":"Average","last_resurfaced":2020,"connectivity":"High"},
    {"pin_code":"121002","authority":"MCF","quality_score":2,"pothole_density":8.8,"road_condition":"Poor","last_resurfaced":2019,"connectivity":"Medium"},
    {"pin_code":"121102","authority":"NHAI","quality_score":3,"pothole_density":4.8,"road_condition":"Average","last_resurfaced":2021,"connectivity":"High"},
    {"pin_code":"122107","authority":"PWD Haryana","quality_score":2,"pothole_density":10.2,"road_condition":"Poor","last_resurfaced":2018,"connectivity":"Low"},
    {"pin_code":"122413","authority":"MCG","quality_score":3,"pothole_density":4.5,"road_condition":"Average","last_resurfaced":2021,"connectivity":"Medium"},
    {"pin_code":"124001","authority":"NHAI","quality_score":3,"pothole_density":5.2,"road_condition":"Average","last_resurfaced":2020,"connectivity":"High"},
    {"pin_code":"124507","authority":"PWD Haryana","quality_score":3,"pothole_density":5.8,"road_condition":"Average","last_resurfaced":2020,"connectivity":"High"},
    {"pin_code":"125050","authority":"PWD Haryana","quality_score":2,"pothole_density":9.5,"road_condition":"Poor","last_resurfaced":2018,"connectivity":"Low"},
    {"pin_code":"125055","authority":"PWD Haryana","quality_score":2,"pothole_density":10.5,"road_condition":"Poor","last_resurfaced":2018,"connectivity":"Low"},
    {"pin_code":"131001","authority":"NHAI","quality_score":3,"pothole_density":4.8,"road_condition":"Average","last_resurfaced":2021,"connectivity":"High"},
    {"pin_code":"132103","authority":"NHAI","quality_score":3,"pothole_density":5.0,"road_condition":"Average","last_resurfaced":2020,"connectivity":"High"},
    {"pin_code":"135001","authority":"PWD Haryana","quality_score":2,"pothole_density":8.5,"road_condition":"Poor","last_resurfaced":2019,"connectivity":"Medium"},
    {"pin_code":"201001","authority":"NHAI","quality_score":3,"pothole_density":5.5,"road_condition":"Average","last_resurfaced":2020,"connectivity":"High"},
]

# ── Fringe area pins ────────────────────────────────────────────────────────
ROAD_DATA += [
    {"pin_code":"122505","authority":"PWD Haryana","quality_score":1,"pothole_density":14.5,"road_condition":"Very Poor","last_resurfaced":2017,"connectivity":"Low"},
    {"pin_code":"122502","authority":"PWD Haryana","quality_score":2,"pothole_density":9.2, "road_condition":"Poor",     "last_resurfaced":2019,"connectivity":"Medium"},
    {"pin_code":"122108","authority":"PWD Haryana","quality_score":2,"pothole_density":10.5,"road_condition":"Poor",     "last_resurfaced":2018,"connectivity":"Low"},
    {"pin_code":"122101","authority":"PWD Haryana","quality_score":2,"pothole_density":8.8, "road_condition":"Poor",     "last_resurfaced":2019,"connectivity":"Medium"},
    {"pin_code":"122103","authority":"MCG",         "quality_score":3,"pothole_density":5.2, "road_condition":"Average",  "last_resurfaced":2021,"connectivity":"High"},
    {"pin_code":"123001","authority":"PWD Haryana","quality_score":2,"pothole_density":10.2,"road_condition":"Poor",     "last_resurfaced":2018,"connectivity":"Medium"},
    {"pin_code":"123401","authority":"PWD Haryana","quality_score":2,"pothole_density":9.8, "road_condition":"Poor",     "last_resurfaced":2019,"connectivity":"Medium"},
    {"pin_code":"131029","authority":"NHAI",        "quality_score":3,"pothole_density":5.5, "road_condition":"Average",  "last_resurfaced":2020,"connectivity":"High"},
    {"pin_code":"131027","authority":"NHAI",        "quality_score":3,"pothole_density":4.8, "road_condition":"Average",  "last_resurfaced":2021,"connectivity":"High"},
    {"pin_code":"201102","authority":"UPSIDA",      "quality_score":2,"pothole_density":11.2,"road_condition":"Poor",     "last_resurfaced":2018,"connectivity":"Medium"},
    {"pin_code":"201014","authority":"NHAI",        "quality_score":4,"pothole_density":2.8, "road_condition":"Good",     "last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"201012","authority":"NMC",         "quality_score":4,"pothole_density":2.5, "road_condition":"Good",     "last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"201016","authority":"NMC",         "quality_score":3,"pothole_density":3.5, "road_condition":"Average",  "last_resurfaced":2021,"connectivity":"High"},
    {"pin_code":"201002","authority":"UPSIDA",      "quality_score":3,"pothole_density":5.8, "road_condition":"Average",  "last_resurfaced":2020,"connectivity":"Medium"},
    {"pin_code":"201010","authority":"NMC",         "quality_score":4,"pothole_density":2.8, "road_condition":"Good",     "last_resurfaced":2022,"connectivity":"High"},
    {"pin_code":"201206","authority":"UPSIDA",      "quality_score":2,"pothole_density":9.5, "road_condition":"Poor",     "last_resurfaced":2019,"connectivity":"Medium"},
    {"pin_code":"245101","authority":"PWD UP",      "quality_score":2,"pothole_density":10.5,"road_condition":"Poor",     "last_resurfaced":2018,"connectivity":"Medium"},
    {"pin_code":"203001","authority":"PWD UP",      "quality_score":2,"pothole_density":11.0,"road_condition":"Poor",     "last_resurfaced":2018,"connectivity":"Medium"},
]
