# AsliVastu — User Feedback (Resident of a Low-Scoring PIN)

**Context:** I live in one of the PIN codes that comes up as a "C" on this site. A friend sent me the link after using it to evaluate my area before deciding whether to buy nearby. I'm not a customer — I'm the subject of the data — and that's exactly the problem.

## The core issue

Nobody asked me, and nobody checked with anyone who actually lives here, before putting a letter grade on my neighborhood that a stranger now uses to decide whether it's safe to move next door. That grade is now the first impression a lot of prospective buyers and tenants get of where I live, and I have no way to see how it was calculated, no way to flag that it's wrong, and no way to know when — or if — it gets corrected.

## Specific problems I can point to

**The crime number doesn't match how this area actually feels.** My PIN shows a high "total cognizable crimes" figure, but that count covers a police station catchment area far bigger than my actual colony — it includes a market and a highway stretch a couple kilometers from my house where most of the incidents happen. My street has had one minor theft in three years. The score doesn't distinguish between "my block" and "the entire jurisdiction," and that distinction matters enormously to someone reading it as "is it safe to walk here at night."

**The data is old and nobody tells the reader that.** A lot has changed in my area in the last two years — a new market opened, a road got resurfaced, there's now a police outpost two streets over. None of that shows up. The site presents a static number with the same confidence as if it were live, and that's misleading to anyone using it to make a decision today.

**There's no appeals or correction process that I can find.** If this were a review on a map app, I could at least respond publicly or flag it. Here, a locality gets scored once by someone who's never lived there, using data from a static file, and that's the end of it. If the underlying "infra_score_raw" or crime figure is wrong, there's no visible channel for a resident to say so.

**It flattens a neighborhood that isn't actually one thing.** My PIN code has a well-maintained residential pocket, an older unauthorized colony, and a commercial strip, all lumped into a single score. Whoever built this dataset clearly worked at the PIN level because that's what was available, not because it reflects how anyone who lives here would describe the area. The result is that good streets get dragged down and bad streets get a free pass, and outsiders can't tell the difference.

**This has real consequences for people, not just abstractions.** A lower score can affect resale value, rental demand, and even how insurers or lenders might eventually treat an area if a tool like this gets cited. That's a lot of weight for a number built from a hardcoded crime list and a report from a couple of years ago.

## What would actually address this

1. Publish the methodology and raw inputs per PIN, not just the final score — if I can see exactly why my area scored what it did, I can at least evaluate whether it's fair.
2. Add a visible "data last updated" date on every dimension, prominently, not buried.
3. Give residents (or local RWAs) a way to submit corrections or context, even if moderated.
4. Move toward finer-than-PIN granularity, or at minimum flag when a PIN is known to be internally diverse (mixed zone type, wide range of building age, etc.).
5. Add per-capita or area-normalized crime figures instead of station-wide totals, so a big jurisdiction doesn't unfairly tar a small quiet pocket within it.

## Bottom line

I understand the intent — helping buyers make informed decisions is a good goal. But right now the tool makes confident, public judgments about real neighborhoods and the people in them using outdated, PIN-level-blunt data, with no way for the people being scored to weigh in or correct the record. That's the part that needs fixing before I'd consider this a fair or accurate picture of where I live.
