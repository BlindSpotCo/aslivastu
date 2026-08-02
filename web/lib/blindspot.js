import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Same Supabase project as BlindSpot and SunScout -- this is what makes
// "one login" possible: all three apps talk to the same auth users and
// the same `reports` table, they just each keep their own local session
// (browsers don't share storage across domains, so each app needs its
// own copy).
//
// Kept as a singleton (created once, reused) rather than a fresh client
// per call -- calling setSession() on one client instance and then
// immediately checking the session on a *different* freshly-created
// instance can race, since a brand-new client hasn't finished loading
// from storage yet even though the write already landed.
let _client = null;
export function getBlindSpotClient() {
  if (!_client) {
    _client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return _client;
}

export async function getBlindSpotSession() {
  const supabase = getBlindSpotClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// report shape:
// { pin_code, areaName, city, nqi_composite, grade, persona, url, reportLabel? }
const PENDING_SAVE_KEY = 'blindspot_pending_save';
const RETURN_TO_KEY = 'blindspot_return_to';

// Actually writes a report into the shared `reports` table. Requires an
// active session -- call getBlindSpotSession() first and redirect to
// BlindSpot's login if there isn't one (see redirectToBlindSpotLogin).
export async function saveReportToBlindSpot(report) {
  const supabase = getBlindSpotClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not signed in to BlindSpot');

  const { error } = await supabase.from('reports').insert({
    user_id: session.user.id,
    source: 'aslivastu',
    title: report.reportLabel || report.areaName || report.pin_code,
    data: {
      pin_code: report.pin_code,
      areaName: report.areaName,
      city: report.city,
      nqi_composite: report.nqi_composite,
      grade: report.grade,
      persona: report.persona,
      url: report.url,
      generatedAt: new Date().toISOString(),
    },
  });
  if (error) throw error;
}

// Stashes the report the person was trying to save (sessionStorage
// survives the round trip to BlindSpot and back), then sends them to
// BlindSpot's login with instructions to return to our callback page,
// which finishes the save once they're signed in.
export function redirectToBlindSpotLogin(report) {
  sessionStorage.setItem(PENDING_SAVE_KEY, JSON.stringify(report));
  // Remember exactly where they were (this exact report page) so the
  // callback can send them back here instead of the homepage.
  sessionStorage.setItem(RETURN_TO_KEY, window.location.href);
  const returnTo = `${window.location.origin}/blindspot-callback`;
  const blindspotLogin = `https://blindspotco.net/login?next=${encodeURIComponent(returnTo)}`;
  window.location.href = blindspotLogin;
}

export function getReturnTo() {
  return sessionStorage.getItem(RETURN_TO_KEY);
}

export function clearReturnTo() {
  sessionStorage.removeItem(RETURN_TO_KEY);
}

export function getPendingSave() {
  const raw = sessionStorage.getItem(PENDING_SAVE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearPendingSave() {
  sessionStorage.removeItem(PENDING_SAVE_KEY);
}
