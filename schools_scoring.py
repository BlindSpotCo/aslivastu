"""
PATCH for scoring.py — Schools dimension (10% weight)
------------------------------------------------------
Add this function and call it inside your main scoring loop.

In your existing scoring.py, find where you build `scores{}` per pin
and replace the schools placeholder with:

    scores['schools'] = score_schools(pin)

Then add school summary fields to master_by_pin so the frontend
can render the full Schools section.
"""

import json
from pathlib import Path

_SCHOOLS_RAW = None

def _load_schools():
    global _SCHOOLS_RAW
    if _SCHOOLS_RAW is None:
        p = Path(__file__).parent / 'data' / 'raw' / 'schools_raw.json'
        if p.exists():
            _SCHOOLS_RAW = json.loads(p.read_text())
        else:
            _SCHOOLS_RAW = {}
    return _SCHOOLS_RAW


def score_schools(pin: str) -> int | None:
    """
    Return a 0-100 schools score for a pin code.

    Scoring rubric (weights sum to 100):
      40 pts — school count (density): 0 = 0pts, 1-2 = 20, 3-5 = 30, 6-9 = 36, 10+ = 40
      30 pts — board quality mix: CBSE/ICSE proportion of total
      30 pts — avg pass percentage (if available); falls back to 20/30 if unknown
    """
    data = _load_schools().get(pin)
    if not data or data['count'] == 0:
        return None  # no data → dimension excluded from composite

    n = data['count']

    # -- Density score (40 pts) --
    if   n >= 10: density = 40
    elif n >= 6:  density = 36
    elif n >= 3:  density = 30
    elif n >= 1:  density = 20
    else:         density = 0

    # -- Board quality score (30 pts) --
    recognized = data['cbse'] + data['icse']
    quality_ratio = recognized / n if n else 0
    board_score = round(quality_ratio * 30)

    # -- Pass percentage score (30 pts) --
    avg_pass = data.get('avg_pass_pct')
    if avg_pass is not None:
        # 95%+ → 30, 90%+ → 27, 80%+ → 22, 70%+ → 16, below → proportional
        if   avg_pass >= 95: pass_score = 30
        elif avg_pass >= 90: pass_score = 27
        elif avg_pass >= 80: pass_score = 22
        elif avg_pass >= 70: pass_score = 16
        else:                pass_score = round((avg_pass / 100) * 15)
    else:
        pass_score = 20  # neutral default when data unavailable

    total = density + board_score + pass_score
    return min(100, max(0, total))


def schools_master_fields(pin: str) -> dict:
    """
    Returns flat fields to merge into master_by_pin entry for the frontend.
    Call this when building master_by_pin in scoring.py.
    """
    data = _load_schools().get(pin, {})
    return {
        "schools_count":      data.get('count', 0),
        "schools_cbse":       data.get('cbse', 0),
        "schools_icse":       data.get('icse', 0),
        "schools_state":      data.get('state_board', 0),
        "schools_avg_pass":   data.get('avg_pass_pct'),
        "schools_list":       data.get('schools', []),   # top-10 list for frontend
    }


# ---------------------------------------------------------------------------
# HOW TO INTEGRATE into your existing scoring.py
# ---------------------------------------------------------------------------
#
# 1. At top of scoring.py, add:
#       from schools_scoring import score_schools, schools_master_fields
#
# 2. In your per-pin loop where you build `scores`, replace:
#       scores['schools'] = None   # or whatever placeholder exists
#    with:
#       scores['schools'] = score_schools(pin)
#
# 3. When building master_by_pin record, merge in:
#       record.update(schools_master_fields(pin))
#
# 4. The composite NQI calculation already handles None dimensions —
#    if score_schools returns None, that 10% weight is redistributed
#    across the other scored dimensions automatically (assuming your
#    existing composite logic does: sum(w*s for w,s if s is not None)
#    divided by sum(w for w,s if s is not None)).
# ---------------------------------------------------------------------------
