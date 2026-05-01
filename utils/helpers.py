import os, json, logging
from datetime import datetime
from pathlib import Path

RAW_DATA_DIR = Path("./data/raw")
PROCESSED_DATA_DIR = Path("./data/processed")
DELHI_NCR_PIN_PREFIXES = ("110","111","112","113","121","122","123","124","125","126","127","128","129","131","132","133","134","135","136","201")

def get_logger(name):
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s — %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
    return logging.getLogger(name)

def is_delhi_ncr_pin(pin):
    return str(pin).strip().startswith(DELHI_NCR_PIN_PREFIXES)

def save_raw(data, source):
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    f = RAW_DATA_DIR / f"{source}_{ts}.json"
    f.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    return f

def save_processed(records, source):
    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    f = PROCESSED_DATA_DIR / f"{source}_latest.json"
    f.write_text(json.dumps(records, ensure_ascii=False, indent=2))
    return f

def load_processed(source):
    f = PROCESSED_DATA_DIR / f"{source}_latest.json"
    return json.loads(f.read_text()) if f.exists() else []
