import json

EXTRA_PIN_MAP = {
    "Alipur": "110036",
    "CRRI Mathura Road": "110025",
    "DTU": "110042",
    "Najafgarh": "110043",
    "Nehru Nagar": "110065",
    "North Campus DU": "110007",
    "North Campus": "110007",
    "Major Dhyan Chand": "110001",
    "Mandir Marg": "110008",
    "NSUT Jaffarpur": "110073",
    "IIT Delhi": "110016",
    "Sri Aurobindo Marg": "110016",
    "Pusa": "110012",
    "IGNOU": "110068",
    "Maidan Garhi": "110068",
    "IHBAS": "110095",
    "Dilshad Garden": "110095",
    "Cantonment": "110010",
    "Chandni Chowk": "110006",
    "Dwarka Sector 8": "110077",
    "Dwarka Sector 9": "110075",
    "Dwarka": "110078",
    "Mundka Industrial": "110041",
    "Rohini Sector": "110085",
    "Pitampura": "110034",
    "Sonia Vihar": "110094",
    "Mayur Vihar": "110091",
    "Loni": "201102",
    "Indirapuram": "201014",
    "Vasundhara": "201012",
    "Crossing Republik": "201016",
    "Raj Nagar": "201002",
    "Hindon": "201001",
    "Noida Sector 125": "201313",
    "Noida Sector 116": "201307",
    "Noida Sector 1": "201301",
    "Noida Sector 62": "201309",
    "Sector 1,Noida": "201301",
    "Knowledge Park": "201310",
    "Manesar": "122051",
    "Bhiwadi": "301019",
    "Ballabhgarh": "121004",
    "Faridabad Sector": "121001",
    "NIT Faridabad": "121001",
    "Bahadurgarh": "124507",
    "Rohtak": "124001",
}

data = json.load(open('data/processed/cpcb_aqi_latest.json'))
fixed = 0
for r in data:
    if r['pin_code']:
        continue
    station = r['station']
    for key, pin in EXTRA_PIN_MAP.items():
        if key.lower() in station.lower():
            r['pin_code'] = pin
            fixed += 1
            break

print(f"Fixed {fixed} stations")
still_unmatched = [r['station'] for r in data if not r['pin_code']]
print(f"Still unmatched: {len(still_unmatched)}")

with open('data/processed/cpcb_aqi_latest.json', 'w') as f:
    json.dump(data, f, indent=2)
print("Saved.")
