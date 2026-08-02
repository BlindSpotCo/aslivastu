# AsliVastu — Consolidated Issues List

Compiled from four feedback perspectives (homebuyer, property broker, resident of a low-scoring PIN, NRI investor) plus a direct review of the codebase. Ordered by how many perspectives independently raised the same issue — that's a rough proxy for priority.

Status key: ✅ Done · ⚠️ Partially done · ⬜ Not started

## Raised by all four (or nearly all)

1. ⬜ **No data freshness indicator.** Crime, power, roads, and sewerage data is static/hardcoded (dated to ~2023 reports in the code), but nothing on the user-facing side shows when a number was last updated. Every persona hit this independently — a buyer can't trust a number they can't date. *(The Est./Live tags on each dimension are a partial signal but there's still no explicit "last verified" date surfaced per PIN.)*
2. ⬜ **PIN code is too coarse a unit.** A single PIN can span a quiet residential pocket, an unauthorized colony, and a commercial strip, all scored identically. This came up from the homebuyer (comparing sectors), the broker (undersells good listings, oversells bad ones), and the resident (flattens genuinely different streets into one grade).
3. ✅ **No visible methodology.** *(Fixed.)* Published `methodology.json` with the exact formula and weight per dimension; each scored PIN now carries `weights_base`/`weights_applied`; the free Score breakdown section shows weight badges inline. Went further than originally scoped: the report page now has user-adjustable weight presets (Default/Family/Investor/Safety) plus a Custom mode with sliders, so a homebuyer, broker, or resident can literally re-weight the score to match their own priorities and see both "your score" and the official score side by side.
4. ⚠️ **Crime numbers lack context.** *(Percentile fix shipped; true per-capita investigated and deliberately dropped.)* Every pin now gets a `crime_percentile` and `crime_tier` (Very Low–Very High), ranking its raw crime count against all other tracked pins, shown on both the free Score breakdown and the detailed Crime card. A true per-capita rate (crimes per 1,000 residents) was researched and rejected: Census 2011 only publishes population down to the tehsil level in Delhi (~27 tehsils covering ~55 tracked pins), so multiple different pins would share an identical population denominator — that wouldn't add real information, it would just relabel the existing raw-count comparison in different units while looking more rigorous than it is. Percentile/tier is the honest ceiling without population data that doesn't exist at usable resolution.

## Raised by two perspectives

5. ⬜ **No comparison / shortlist tooling.** The homebuyer wanted side-by-side PIN comparison; the NRI investor wanted to save and share a shortlist with family/broker across time zones. A `/compare` page exists for two areas at a time, but there's still no save/share/shortlist capability.
6. ⬜ **No trajectory/trend signal.** The broker and NRI investor both wanted to know if an area is improving or declining, not just its current-moment score. Blocked on the same root cause as freshness: the crime/infra/power data is static, not time-series, so there's nothing to compute a trend from yet — needs periodic hand-refreshes of the source data going forward before this becomes possible.
7. ⬜ **No connection to price.** Both the broker and NRI investor noted the score has no link to price-per-sqft trends, rental yield, or appreciation — livability alone doesn't answer "is this a good investment."

## Raised by one perspective (still worth tracking)

8. ⬜ **Water, roads, and sewerage are scored but excluded from the composite.** (Homebuyer) `score_water`, `score_roads`, `score_sewerage` exist in the code but never feed the headline NQI — waterlogging risk in particular should arguably be a visible filter, not buried.
9. ⬜ **No shareable/exportable report.** (Broker) A PDF export button exists on the report page now, but there's still no lightweight branded link specifically built for forwarding to a client.
10. ✅ **No correction or appeals channel.** *(Fixed.)* Both the landing page and the report page now have a feedback box — the report-page one pre-fills the pin/area/NQI/grade for context — that submits silently via a Gmail-backed API route, no email client popup required.
11. ⬜ **No scope disclaimer.** (NRI investor) Nothing clarifies that this covers neighborhood livability only, not property-level legal/title risk or fraud — a real risk of over-trusting the tool outside what it actually measures.
12. ⬜ **No plain-language translation for non-local readers.** (NRI investor) AQI categories and jargon assume a reader already living in Delhi.

## Issues found directly in the code (not surfaced by any persona, but real)

13. ⬜ **Dead/conflicting code:** `schools_scoring.py` is an unused patch file with a *different* scoring rubric than the live `score_schools` in `scoring.py` — a maintenance hazard if someone edits the wrong one.
14. ⬜ **Fragile geocoding:** `update_pins.py` manually patches AQI stations that failed to match a PIN code via string matching — suggests the station-to-PIN mapping process is ad hoc and error-prone, which could quietly cause some of the "wrong-feeling" numbers residents flagged.
15. ⬜ **No changelog/history:** The pipeline repo now has multiple real commits (methodology, crime percentiles, etc.) instead of a single initial commit, which helps, but there's still no changelog explaining *what* changed and *why* for a non-technical reader.
16. ✅ **Silent reweighting on missing data.** *(Fixed as part of #3.)* `weights_applied` vs `weights_base` is now exposed per PIN, and the free Score breakdown shows a strikethrough of the original weight next to the rescaled one whenever a pin leaned on fewer dimensions than usual.

## Suggested priority order to act on

1. ⬜ Freshness disclosure + explicit "last verified" date per PIN (fixes #1, cheapest remaining item, still the most-cited complaint left open).
2. ⬜ Comparison/shortlist save-and-share (#5) — highest-leverage remaining UX gap for both buyers and brokers.
3. ⬜ Dead code cleanup (`schools_scoring.py`, geocoding fragility) — low-risk code health, doesn't need product input.
4. ⬜ Everything else (granularity, price trend, scope disclaimer, plain-language translation) requires new data sources or workflows and is longer-term.
