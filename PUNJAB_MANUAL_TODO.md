# Punjab Rollout — Manual To-Dos

The big data-gathering pushes — Amritsar/Ludhiana collector rates, the ward map, and now the
first scored batch — are all done. What's left is one action item (deploy) plus a much
smaller, optional follow-up. Full context is in `PUNJAB_ROLLOUT.md`; this doc is just the
action items.

## Deploy the first scored batch — action needed

**Status: built and verified, not yet live.** 5 localities (Sarabha Nagar, Dugri, Model Town,
Majitha Road, Rani Ka Bagh) now have real, sourced schools data and are scored — see
`PUNJAB_ROLLOUT.md` §"Suggested next steps" item 5 for the full breakdown of what's in and
what was deliberately left out (air and crime, both genuine dead ends for this batch, not
just unbuilt). Hall Bazaar has no real data on any dimension and was correctly left unscored.

To go live, from `~/nqr-web/web`:
```bash
npm run build
npx vercel --prod
```
Then check `/report/ldh-dugri` etc. with a fresh `?cb=` to beat Vercel's edge cache.

## Chheharta and GNDU — now explained, nothing left to chase

**Status: resolved, no further action needed.** Both were already inside the Tehsil
Amritsar-II document you sent — they just aren't itemized under their everyday names:
- **Chheharta's** official revenue/postal name is **"Mahal"** (its post office is
  registered as "Chheharta S.O., Mahal Sub Urban, Amritsar"). The document has a "Mahal
  Urban" and "Mahal Sub Urban" circle with real rates for its constituent colonies (Labh
  Nagar, Navi Abadi/Mahal, Pind Mahal, Holy City, etc.) — but no row simply called
  "Chheharta," because that's not its revenue-department name.
- **GNDU's** campus sits on GT Road "next to Khalsa College" — the document has a "Kot
  Khalsa" circle (named for that same college) covering the surrounding colonies, but the
  ~500-acre university campus itself isn't priced as a locality, the same way large public
  institutions generally aren't itemized like residential colonies.

Both are documented with this explanation in `PUNJAB_ROLLOUT.md` (rows 9 and 19). There's
no missing document to find — the site's absence of "Chheharta" and "GNDU" as named
collector-rate rows is the correct, complete answer, not a search gap.

## Three ambiguous matches — mostly resolved now, no action needed

A follow-up research pass (cross-referencing police-station addresses, pincode zones, and
neighboring-locality listings) sharpened all three of these:
- **Ranjit Avenue vs. "Ranjit Pura"** — still not a direct confirmation, but there's real
  circumstantial support: Ranjit Avenue shares Ranjit Pura's general area (same 143001
  pincode zone as the other nearby Circle 109 localities, ~2.5km from Amritsar Junction).
  `PUNJAB_ROLLOUT.md` now uses Ranjit Pura's rate as a best-available proxy, flagged as such.
- **Amritsar Cantt** — now well-supported. MapsOfIndia's own Amritsar Cantonment page lists
  Chheharta as a neighboring locality, which matches the "Cantonment Area" row sitting in
  the same Mahal revenue circle as Chheharta. Confidence raised from best-guess to
  confirmed (still missing a commercial rate, which is unusual, so a small caveat remains).
- **Sultanwind** — turned out not to be a pick-one situation at all. The police station
  itself sits at the old-city end (Sultanwind Chowk, Katra Ahluwalia), but the broader
  locality's nearest rail station (Mananwala) points toward the newer colonies on the far
  side. Both rate contexts found earlier are genuinely "Sultanwind" — just opposite ends of
  one long corridor, not two competing candidates. Both are kept in the tracking doc.

Nothing further to check here unless you want to independently verify.

## Already resolved — no action needed

**Amritsar collector rates (main task)** — done, 2026-08-06. The three tehsil/sub-registrar
PDFs you found gave real rates for 15 of 24 localities (up from 0). See the full table in
`PUNJAB_ROLLOUT.md`.

**Ludhiana collector rates** — done. The full 1027-row `MC_Block_Wise_Colony_Collector_Rates.xls`
export you sent had all 10 previously-missing localities (Model Town, Sarabha Nagar, BRS
Nagar, Civil Lines, Ghumar Mandi, Pakhowal Road, Ferozepur Road, Kitchlu Nagar, Model Gram,
Rajguru Nagar) — they were just past the ~622-row cutoff automated fetching could reach.
`PUNJAB_ROLLOUT.md` is fully updated with real rates for 27 of 28 localities.

**Ludhiana ward map** — done. Your 5 screenshots of MC Ludhiana's current councillor list
confirmed the city now runs on 95 wards (not the 75 from the stale 2017 source) and gave
real current ward numbers for 20 of the 28 localities. The remaining 8 — mostly Old City
market areas like Mall Road and Sadar Bazaar — genuinely don't show up in any current
councillor's address, which is a real gap in that source, not something to re-check.
