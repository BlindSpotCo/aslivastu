"""
scrapers/schools.py
Processes the CBSE schools CSV (basic/schools.csv from github.com/deedy/cbse_schools_data)
already downloaded to data/raw/cbse_schools.csv

Matching strategy:
  1. Exact pin code match
  2. Neighbour pin code match (pins within same area group, defined below)

Output: data/raw/schools_raw.json
  { "110016": { count, cbse, icse, state_board, avg_pass_pct, schools: [...top10] }, ... }
"""

import csv, json
from pathlib import Path
from collections import defaultdict

CSV_PATH = Path(__file__).parent.parent / 'data' / 'raw' / 'cbse_schools.csv'
OUT_FILE  = Path(__file__).parent.parent / 'data' / 'raw' / 'schools_raw.json'

# ---------------------------------------------------------------------------
# All 67 pin codes we score
# ---------------------------------------------------------------------------
ALL_PINS = {
    "110002","110003","110005","110006","110007","110008","110009","110010",
    "110012","110016","110017","110018","110019","110020","110021","110022",
    "110024","110025","110026","110032","110033","110034","110036","110037",
    "110039","110040","110041","110042","110043","110044","110049","110052",
    "110053","110058","110063","110065","110067","110068","110070","110073",
    "110077","110078","110084","110085","110092","110094","110095",
    "121001","121002","121102",
    "122001","122002","122003","122051","122107","122413",
    "123106","124001","124507","131001","132103","135001",
    "201001","201301","201304","201309",
}

# Neighbour groups — if a pin has 0 direct matches, borrow from these nearby pins
NEIGHBOURS = {
    "110002": ["110006","110005"],
    "110003": ["110021","110049"],
    "110010": ["110021","110022"],
    "110012": ["110005","110008"],
    "110020": ["110025","110024"],
    "110025": ["110024","110020"],
    "110036": ["110007","110040"],
    "110037": ["110019","110070"],
    "110039": ["110040","110036"],
    "110040": ["110036","110039"],
    "110041": ["110018","110063"],
    "110042": ["110034","110033"],
    "110043": ["110078","110019"],
    "110044": ["110020","110025"],
    "110049": ["110016","110017"],
    "110053": ["110032","110095"],
    "110065": ["110032","110092"],
    "110067": ["110016","110068"],
    "110068": ["110067","110070"],
    "110073": ["110078","110041"],
    "110077": ["110078","110019"],
    "110084": ["110007","110009"],
    "110094": ["110053","110084"],
    "121102": ["121001","121002"],
    "122107": ["122051","122001"],
    "122413": ["122001","122003"],
    "123106": ["122051","122001"],
    "124507": ["131001","124001"],
    "135001": ["132103","131001"],
    "201304": ["201301","201309"],
}

# Filter to NCR states only
NCR_STATES = {"DELHI", "HARYANA", "UTTAR PRADESH"}


def load_csv():
    """Load CSV, return list of dicts with only fields we need."""
    schools = []
    with open(CSV_PATH, encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        for row in reader:
            state = (row.get('state') or '').strip().upper()
            if state not in NCR_STATES:
                continue
            pin = (row.get('pincode') or '').strip().zfill(6)
            name = (row.get('name') or '').strip().title()
            address = (row.get('address') or '').strip().title()
            aff_type = (row.get('aff_type') or '').strip()
            district = (row.get('district') or '').strip().title()
            if not pin or not name:
                continue
            schools.append(dict(
                pin=pin,
                name=name,
                address=f"{address}, {district}".strip(', '),
                board='CBSE',
                aff_type=aff_type,
                pass_pct=None,   # not in basic CSV
            ))
    return schools


def build_pin_index(schools):
    idx = defaultdict(list)
    for s in schools:
        idx[s['pin']].append(s)
    return idx


def summarise(school_list):
    n = len(school_list)
    if n == 0:
        return dict(count=0, cbse=0, icse=0, state_board=0,
                    avg_pass_pct=None, schools=[])
    top10 = [
        dict(name=s['name'], address=s['address'],
             board=s['board'], pass_pct=s['pass_pct'],
             distance_km=None)
        for s in school_list[:10]
    ]
    return dict(count=n, cbse=n, icse=0, state_board=0,
                avg_pass_pct=None, schools=top10)


def run():
    if not CSV_PATH.exists():
        raise FileNotFoundError(
            f"CSV not found at {CSV_PATH}\n"
            "Run: curl -L https://raw.githubusercontent.com/deedy/cbse_schools_data/master/basic/schools.csv "
            "-o ~/nqr_delhi/data/raw/cbse_schools.csv"
        )

    print(f"Loading {CSV_PATH} …")
    schools = load_csv()
    print(f"  {len(schools)} NCR school records loaded")

    idx = build_pin_index(schools)

    result = {}
    direct_hits = neighbour_hits = zero_hits = 0

    for pin in sorted(ALL_PINS):
        direct = idx.get(pin, [])
        if direct:
            result[pin] = summarise(direct)
            direct_hits += 1
        else:
            borrowed = []
            for npin in NEIGHBOURS.get(pin, []):
                borrowed.extend(idx.get(npin, []))
            if borrowed:
                result[pin] = summarise(borrowed)
                result[pin]['_borrowed_from'] = NEIGHBOURS[pin]
                neighbour_hits += 1
            else:
                result[pin] = summarise([])
                zero_hits += 1

    print(f"  Direct matches:    {direct_hits} pins")
    print(f"  Neighbour fills:   {neighbour_hits} pins")
    print(f"  No data:           {zero_hits} pins")

    # ── Punjab (city 3/4) — merge in the individually-researched locality
    # records. Not from this CSV (NCR_STATES doesn't cover Punjab, and these
    # are locality slugs, not PINs) — see scrapers/punjab_data.py for the
    # real, sourced data and why it's kept separate.
    try:
        from scrapers.punjab_data import schools_records as _punjab_schools
        punjab = _punjab_schools()
        result.update(punjab)
        print(f"  Punjab (manual):   {len(punjab)} localities")
    except Exception as e:
        print(f"  Punjab schools merge failed: {e}")

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(result, indent=2, ensure_ascii=False))
    print(f"Saved → {OUT_FILE}")


if __name__ == '__main__':
    run()


if __name__ == '__main__':
    run()

# ── Fringe area pins added to ALL_PINS ─────────────────────────────────────
ALL_PINS.update({
    "122505","122502","122108","122101","122103",
    "123001","123401","131029","131027",
    "201102","201014","201012","201016","201002",
    "201010","201206","245101","203001",
})

NEIGHBOURS.update({
    "122505": ["122502","123001"],
    "122502": ["122505","122101"],
    "122108": ["122101","122103"],
    "122101": ["122103","122001"],
    "122103": ["122001","122002"],
    "123001": ["131029","124507"],
    "123401": ["122502","123001"],
    "131029": ["131001","131027"],
    "131027": ["131029","131001"],
    "201102": ["201001","201002"],
    "201014": ["201301","201016"],
    "201012": ["201014","201016"],
    "201016": ["201014","201012"],
    "201002": ["201001","201102"],
    "201010": ["201301","201014"],
    "201206": ["201001","201002"],
    "245101": ["201206","201001"],
    "203001": ["201206","245101"],
})
