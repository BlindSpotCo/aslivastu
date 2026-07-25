// pages/api/geocode.js
// Forward-geocodes a free-text address/building query to coordinates, scoped
// toward this report's city so results actually land near the pincode the
// user is looking at. Used by the Sun & Shadow Check card to hand off a
// precise point to SunScout — AV's own data is pincode/area-level, but
// SunScout needs an exact lat/lon to compute shadows for a specific building.
//
// Nominatim is a shared public service — this retries transient failures.

const MAX_ATTEMPTS = 2;
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export default async function handler(req, res) {
  const { q, city } = req.query;
  if (!q || String(q).trim().length < 3) {
    return res.status(200).json({ results: [] });
  }

  const cityHint = city === 'Bangalore' ? 'Bengaluru, India' : 'Delhi NCR, India';
  const query = `${q}, ${cityHint}`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AsliVastu_NextJS/1.0 (+https://aslivastu.com)',
            'Accept-Language': 'en',
          },
        }
      );
      if (r.status === 429) throw new Error('rate_limited');
      if (!r.ok) throw new Error(`Nominatim returned ${r.status}`);
      const data = await r.json();
      const results = (data || []).map((d) => ({
        lat: parseFloat(d.lat),
        lon: parseFloat(d.lon),
        label: d.display_name,
      }));
      return res.status(200).json({ results });
    } catch (e) {
      if (attempt === MAX_ATTEMPTS) {
        console.warn('geocode: failed after retries', e);
        return res.status(200).json({ results: [] });
      }
      await sleep(500 * attempt);
    }
  }
}
