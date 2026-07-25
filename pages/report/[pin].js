// Industry / blueprint redesign of the report page — built at /report-v2 so the
// live /report page stays untouched until this is approved and swapped in.
import { useState, useMemo, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PIN_META } from '../../lib/pinMeta'
import { AREA_COORDS } from '../../lib/areaCoords'

// ── Industry design tokens + blueprint frame (self-contained for v2) ─────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700&display=swap');
* { box-sizing: border-box; } body { margin:0; }
.iv { --acc-base:#7a1f2b; --bg:#151618; --ink:#e9e8e6;
  --acc:color-mix(in srgb, var(--acc-base) 55%, #dfa3ab);
  --acc-deep:color-mix(in srgb, var(--acc-base) 35%, #f0c9cd);
  --acc-fill:var(--acc-base);
  --ink70:color-mix(in srgb,var(--ink) 70%,transparent); --ink65:color-mix(in srgb,var(--ink) 65%,transparent);
  --ink60:color-mix(in srgb,var(--ink) 60%,transparent); --ink55:color-mix(in srgb,var(--ink) 55%,transparent);
  --acc60:color-mix(in srgb,var(--acc) 60%,transparent); --acc45:color-mix(in srgb,var(--acc) 45%,transparent);
  --acc35:color-mix(in srgb,var(--acc) 35%,transparent); --fill7:color-mix(in srgb,var(--ink) 7%,var(--bg));
  background:var(--bg); color:var(--ink); font-family:'Barlow',sans-serif; min-height:100vh; }
.iv.light { --bg:#f2f2f3; --ink:#1d1f20; --acc:var(--acc-base); --acc-deep:color-mix(in srgb,var(--acc-base) 70%,#161012); }
.iv .cond { font-family:'Barlow Condensed',sans-serif; }
.iv .kick { font-size:11px; text-transform:uppercase; letter-spacing:.14em; font-weight:600; color:var(--acc); margin:0; }
.iv a { color:var(--acc-deep); text-decoration:none; } .iv a:hover { color:var(--acc); }
.iv button { font-family:'Barlow',sans-serif; cursor:pointer; }
.bpf { position:relative; border:1px solid var(--acc60); background:transparent; }
.bpf > .m { position:absolute; color:var(--acc); font-size:12px; line-height:1; }
.bpf > .tl{top:-7px;left:-5px} .bpf > .tr{top:-7px;right:-5px} .bpf > .bl{bottom:-8px;left:-5px} .bpf > .br{bottom:-8px;right:-5px}
.iv .hatch { background-image:repeating-linear-gradient(45deg,var(--ink) 0 3px,transparent 3px 6px); }
.iv button:focus-visible, .iv a:focus-visible, .iv input:focus-visible { outline:2px solid var(--acc); outline-offset:2px; }
.iv ::selection { background:var(--acc); color:#fff; }
@media (max-width:1024px){ .hero3{grid-template-columns:1fr!important} }
[data-pdf="1"] .no-pdf { display:none !important; }
`

function BPF({ children, style, className = '' }) {
  return (
    <div className={`bpf ${className}`} style={style}>
      <span className="m tl">+</span><span className="m tr">+</span><span className="m bl">+</span><span className="m br">+</span>
      {children}
    </div>
  )
}

// "?" info marker with a hover tooltip.
function Info({ text }) {
  const [show, setShow] = useState(false)
  if (!text) return null
  return (
    <span style={{ position:'relative', display:'inline-flex', marginLeft:5 }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span style={{ fontSize:9, width:13, height:13, display:'inline-flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--acc45)', color:'var(--acc)', borderRadius:'50%', cursor:'help', lineHeight:1 }}>?</span>
      {show && <span style={{ position:'absolute', bottom:'calc(100% + 9px)', left:'50%', transform:'translateX(-50%)', width:240, background:'color-mix(in srgb, var(--ink) 14%, var(--bg))', border:'1.5px solid var(--acc)', padding:'11px 13px', fontSize:12, fontWeight:400, textTransform:'none', letterSpacing:'normal', color:'var(--ink)', lineHeight:1.55, zIndex:300, boxShadow:'0 10px 34px rgba(0,0,0,0.55)' }}>{text}</span>}
    </span>
  )
}

// Spec-grid card: kicker title over a grid of label/value cells (Industry deep-dive).
function StatCard({ title, stats, wide }) {
  return (
    <BPF style={{ padding:'18px 20px' }}>
      <p className="kick">{title}</p>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fit, minmax(${wide ? 150 : 118}px, 1fr))`, gap:'14px 20px', marginTop:14 }}>
        {stats.filter(Boolean).map(([label, val, tip]) => (
          <div key={label}>
            <div style={{ fontSize:10.5, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--ink55)', display:'flex', alignItems:'center' }}>{label}<Info text={tip} /></div>
            <div className="cond" style={{ fontSize:20, fontWeight:600, marginTop:3, lineHeight:1.1 }}>{val}</div>
          </div>
        ))}
      </div>
    </BPF>
  )
}

// ── scoring config (keeps the live preset weights) ───────────────────────────
const WEIGHT_PRESETS = {
  Default:  { crime:25, infrastructure:20, air:15, power:10, schools:10, water:8,  roads:7,  sewerage:5  },
  Family:   { crime:20, infrastructure:12, air:12, power:8,  schools:30, water:8,  roads:5,  sewerage:5  },
  Investor: { crime:12, infrastructure:28, air:8,  power:18, schools:10, water:6,  roads:12, sewerage:6  },
  Safety:   { crime:40, infrastructure:15, air:12, power:8,  schools:5,  water:8,  roads:5,  sewerage:7  },
}
const LABEL = { crime:'Safety', infrastructure:'Infrastructure', air:'Air Quality', power:'Power', schools:'Schools', water:'Water Supply', roads:'Roads', sewerage:'Drainage & Sewerage' }
const AQI_PLAIN = {
  'Good':'Air is clean — safe for everyone.', 'Satisfactory':'Air is acceptable — fine for most; sensitive individuals may feel minor irritation.',
  'Moderate':'Okay for healthy people; asthma/heart/lung patients should limit long outdoor exertion.',
  'Poor':'Unhealthy — prolonged outdoor activity can cause breathing discomfort.',
  'Very Poor':'Unhealthy for everyone — avoid outdoor exertion.', 'Severe':'Hazardous — a serious health risk; stay indoors.',
}
function cityOf(pin) { return String(pin).startsWith('560') ? 'Bangalore' : 'Delhi NCR' }
// Landing area for each city, used when the city switcher is pressed.
const CITY_DEFAULT_PIN = { 'Delhi NCR': '110016', 'Bangalore': '560034' }
function gradeFor(s) { return s == null ? '—' : s >= 80 ? 'A' : s >= 70 ? 'B+' : s >= 60 ? 'B' : s >= 50 ? 'C+' : s >= 40 ? 'C' : 'D' }
function scoreColor(v) { return v >= 80 ? '#22c55e' : v >= 60 ? '#84cc16' : v >= 40 ? '#f59e0b' : '#ef4444' }
function searchPinV2(q, city) {
  const s = (q || '').trim().toLowerCase(); if (!s) return []
  const ok = p => !city || cityOf(p) === city
  if (/^\d{6}$/.test(s)) return (ok(s) && PIN_META[s]) ? [{ pin: s, name: PIN_META[s].name }] : []
  return Object.entries(PIN_META).filter(([p, m]) => ok(p) && (m.name.toLowerCase().includes(s) || p.includes(s))).slice(0, 6).map(([p, m]) => ({ pin: p, name: m.name }))
}
function loadScript(src, check) {
  return new Promise((resolve, reject) => {
    if (check()) return resolve()
    const el = document.createElement('script'); el.src = src; el.onload = resolve; el.onerror = reject; document.body.appendChild(el)
  })
}

function source(k, city) {
  const blr = city === 'Bangalore'
  const m = {
    crime: blr ? 'Bengaluru City Police / NCRB · est. 2023' : 'Delhi Police Annual Report · est. 2023',
    infrastructure: blr ? 'BBMP plans · BMRCL Namma Metro · est. 2024' : 'DDA Master Plan · DMRC · est. 2024',
    air: blr ? 'CPCB / KSPCB live AQI · updated daily' : 'CPCB live AQI · updated daily',
    power: blr ? 'BESCOM annual reports · est. 2023' : 'BSES / Tata Power · est. 2023',
    schools: 'CBSE affiliation database · est. 2023',
    water: blr ? 'BWSSB (Cauvery) supply & quality · est. 2023' : 'Delhi Jal Board supply & quality · est. 2023',
    roads: blr ? 'BBMP road-condition surveys · est. 2023' : 'MCD / PWD road surveys · est. 2023',
    sewerage: blr ? 'BWSSB waterlogging records · est. 2023' : 'Drainage & waterlogging records · est. 2023',
  }
  return m[k] || ''
}

// One explanation sentence per dimension, from the report data.
function explain(k, r) {
  const city = r.city || 'Delhi NCR'
  switch (k) {
    case 'crime': return r.crime_percentile != null
      ? `${r.total_cognizable_crimes} crimes reported — safer than ${r.crime_percentile}% of tracked ${city} areas (${(r.crime_tier||'').toLowerCase()} tier).`
      : 'Cognizable crimes reported for the police catchment.'
    case 'infrastructure': return `${r.metro_stations_nearby||0} operational metro station(s) · ${(r.highway_proximity||'—').toLowerCase()} highway access · ${(r.zone_type||'mixed').toLowerCase()} zone.`
    case 'air': return r.aqi_category ? `AQI ~${Math.round(r.aqi_avg)}, ${r.aqi_category} — ${AQI_PLAIN[r.aqi_category] || 'CPCB band.'}` : 'Live CPCB air-quality reading.'
    case 'power': return `${r.reliability || '—'} reliability · ~${r.avg_outage_hours ?? '—'} outage hrs/month via ${r.discom || 'the local DISCOM'}.`
    case 'schools': return r.schools_count ? `${r.schools_count} CBSE school(s) mapped to this pin.` : 'No CBSE-affiliated school in this exact pin.'
    case 'water': return `${r.supply_hours ?? '—'} hrs daily supply · ${(r.tds_level||'—')} TDS · ${(r.water_coverage ?? r.coverage_pct) ?? '—'}% piped coverage.`
    case 'roads': return `${r.road_condition || '—'} condition · ~${r.pothole_density ?? '—'} potholes/km · last resurfaced ${r.last_resurfaced || '—'}.`
    case 'sewerage': { const wl = r.waterlogging_risk; const lvl = wl==null?'—':wl>=4?'low':wl>=3?'moderate':'high'
      return `${lvl} monsoon waterlogging risk${r.flooding_incidents_annual?` — ~${r.flooding_incidents_annual} flooding incidents a year`:''}.` }
    default: return ''
  }
}

function verdictFor(nqi) {
  if (nqi >= 80) return { label:'Strong buy', why:'Scores well across the board — few weak spots to worry about.' }
  if (nqi >= 60) return { label:'Consider', why:'Decent overall, with some weak dimensions worth inspecting on site before deciding.' }
  if (nqi >= 45) return { label:'Below average', why:'Below the tracked-area average — compare nearby areas before committing.' }
  return { label:'Avoid', why:'Multiple dimensions score poorly — strongly recommend comparing alternatives.' }
}

function highlights(r) {
  const good = [], bad = [], s = r.scores
  if (s.crime >= 80) good.push('Very low crime — one of the safer areas.')
  else if (s.crime != null && s.crime < 40) bad.push('High crime rate — well above average.')
  if (s.infrastructure >= 70) good.push('Excellent connectivity — metro and highway access.')
  else if (s.infrastructure != null && s.infrastructure < 40) bad.push('Poor connectivity — limited metro/highway access.')
  if (s.air >= 80) good.push('Clean air — AQI consistently Good or Satisfactory.')
  else if (s.air != null && s.air < 50) bad.push('Poor air quality — AQI frequently in Poor range.')
  if (s.power >= 70) good.push('Reliable power supply — low outage frequency.')
  else if (s.power != null && s.power < 40) bad.push('Frequent power cuts — high outage hours.')
  if (s.schools >= 70) good.push('Strong CBSE school density near this pin.')
  if (r.waterlogging_risk != null && r.waterlogging_risk <= 2) bad.push(`High monsoon waterlogging risk${r.flooding_incidents_annual ? ` — ~${r.flooding_incidents_annual} flooding incidents a year` : ''}.`)
  if (s.water != null && s.water < 45) bad.push('Only limited daily water supply — budget for filtration/tankers.')
  return { good: good.slice(0, 3), bad: bad.slice(0, 3) }
}

// ── Sun & Shadow Check — hands off to SunScout for exact-point solar/shadow
// analysis. AV's own data is area/pincode-level (AREA_COORDS gives a rough
// neighbourhood centroid); SunScout needs a precise lat/lon, so this card
// offers an instant area-level link plus a live address search for anyone
// who wants their exact building instead. ─────────────────────────────────
const SS_ORANGE = '#E07B00'

function SunShadowCheck({ pin, city, areaName }) {
  const [query, setQuery]             = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading]         = useState(false)
  const [picked, setPicked]           = useState(null) // { lat, lon, label }
  const debounceRef = useRef(null)

  const centroid = AREA_COORDS[pin]

  function onSearch(v) {
    setQuery(v)
    setPicked(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (v.trim().length < 3) { setSuggestions([]); return }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/geocode?q=${encodeURIComponent(v)}&city=${encodeURIComponent(city)}`)
        const d = await r.json()
        setSuggestions(d.results || [])
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }

  function selectResult(s) {
    setPicked(s)
    setQuery(s.label.split(',').slice(0, 2).join(','))
    setSuggestions([])
  }

  const exactUrl    = picked ? `https://sun-scout.com/?lat=${picked.lat}&lon=${picked.lon}` : null
  const centroidUrl = centroid ? `https://sun-scout.com/?lat=${centroid[0]}&lon=${centroid[1]}` : null

  return (
    <BPF style={{ marginTop:24, padding:'28px 30px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
        <span className="kick" style={{ fontSize:12 }}>Sheet 01b · Powered by SunScout</span>
        <span style={{ fontSize:11, padding:'3px 10px', background:SS_ORANGE+'22', color:SS_ORANGE, fontWeight:700, letterSpacing:'.06em' }}>NEW</span>
      </div>
      <h3 className="cond" style={{ fontSize:32, fontWeight:700, textTransform:'uppercase', margin:'6px 0 10px', lineHeight:1 }}>Sun &amp; Shadow Check</h3>
      <p style={{ fontSize:14.5, color:'var(--ink70)', margin:'0 0 20px', lineHeight:1.6, maxWidth:640 }}>
        Pincode data can&apos;t tell you if <strong style={{color:'var(--ink)'}}>your specific balcony</strong> gets afternoon sun.
        Search your exact building below for a real sunlight and shadow reading through the day and across seasons — or jump straight to the {areaName} area estimate.
      </p>

      {/* Instant area-level link */}
      {centroidUrl && (
        <a href={centroidUrl} target="_blank" rel="noopener noreferrer"
          style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:13, fontWeight:600, color:'var(--acc-deep)', marginBottom:22, letterSpacing:'.02em' }}>
          ☀ View {areaName}&apos;s area estimate on SunScout →
        </a>
      )}

      {/* Address search — exact building */}
      <div style={{ position:'relative', marginBottom: exactUrl ? 18 : 4 }}>
        <p className="kick" style={{ fontSize:10.5, marginBottom:8 }}>Or search your exact building</p>
        <div style={{ display:'flex', gap:10 }}>
          <input
            value={query}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search your building, society, or street…"
            style={{
              flex:1, padding:'13px 16px', background:'transparent',
              border:'1px solid var(--acc45)', color:'var(--ink)',
              fontSize:15, outline:'none', fontFamily:'Barlow,sans-serif'
            }}
          />
          {loading && <div style={{ padding:'13px 4px', color:'var(--ink55)', fontSize:13 }}>Searching…</div>}
        </div>
        {suggestions.length > 0 && (
          <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:100, background:'var(--bg)', border:'1px solid var(--acc45)', marginTop:2 }}>
            {suggestions.map((s, i) => (
              <div key={i} onMouseDown={() => selectResult(s)}
                style={{ padding:'12px 16px', cursor:'pointer', fontSize:13.5, borderTop: i ? '1px solid var(--acc35)' : 'none', color:'var(--ink)' }}
                onMouseEnter={e => e.currentTarget.style.background = SS_ORANGE+'15'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {s.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Result CTA */}
      {exactUrl && (
        <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px', border:`1px solid ${SS_ORANGE}55`, background:SS_ORANGE+'10' }}>
          <div style={{ width:42, height:42, background:SS_ORANGE, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, flexShrink:0 }}>☀️</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--ink)' }}>View shadow pattern &amp; sun reading</div>
            <div style={{ fontSize:12.5, color:'var(--ink60)', marginTop:2 }}>Opens on SunScout for this exact location</div>
          </div>
          <a href={exactUrl} target="_blank" rel="noopener noreferrer"
            style={{ background:SS_ORANGE, color:'#fff', padding:'12px 22px', fontWeight:700, fontSize:14, letterSpacing:'.02em', textDecoration:'none', whiteSpace:'nowrap' }}>
            OPEN →
          </a>
        </div>
      )}
    </BPF>
  )
}

// Small teaser bar — sits outside/before the full report gate. Just a line
// of text and a button straight to the area's centroid on SunScout, no
// search. The full building-level search experience lives in
// SunShadowCheck, inside the unlocked full report.

// Small teaser bar — sits outside/before the full report gate. Just a line
// of text and a button straight to the area's centroid on SunScout, no
// search. The full building-level search experience lives in
// SunShadowCheck, inside the unlocked full report.
function SunShadowBar({ pin, areaName }) {
  const centroid = AREA_COORDS[pin]
  if (!centroid) return null
  const url = `https://sun-scout.com/?lat=${centroid[0]}&lon=${centroid[1]}`
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap', marginTop:20, padding:'14px 20px', border:'1px solid var(--acc45)' }}>
      <span style={{ fontSize:13.5, color:'var(--ink)', display:'flex', alignItems:'center', gap:8 }}>
        ☀ <span>View shadow analysis for <strong>{areaName}</strong> — powered by SunScout</span>
      </span>
      <a href={url} target="_blank" rel="noopener noreferrer"
        style={{ background:SS_ORANGE, color:'#fff', padding:'9px 18px', fontWeight:700, fontSize:12.5, letterSpacing:'.04em', textDecoration:'none', whiteSpace:'nowrap', flexShrink:0 }}>
        OPEN IN SUNSCOUT →
      </a>
    </div>
  )
}

export default function Report({ report, allScores, ogMeta }) {
  const [persona, setPersona] = useState('Default')
  const [dark, setDark] = useState(true)
  const [shortlist, setShortlist] = useState([])
  const [unlocked, setUnlocked] = useState(false)
  const [customWeights, setCustomWeights] = useState({ ...WEIGHT_PRESETS.Default })
  const [query, setQuery] = useState(report ? (PIN_META[report.pin_code]?.name || '') : '')
  const [suggestions, setSuggestions] = useState([])
  const [searchCity, setSearchCity] = useState(report ? (report.city || cityOf(report.pin_code)) : 'Delhi NCR')
  const [fbText, setFbText] = useState('')
  const [fbStatus, setFbStatus] = useState('idle')
  const [pdfBusy, setPdfBusy] = useState(false)
  const mapEl = useRef(null)
  const sheetRef = useRef(null)
  const router = useRouter()

  // Keep the search box + city toggle in sync with whichever area is shown.
  const shownPin = report?.pin_code
  useEffect(() => {
    if (!shownPin) return
    setQuery(PIN_META[shownPin]?.name || '')
    setSearchCity(cityOf(shownPin))
    setSuggestions([])
  }, [shownPin])

  function switchCity(c) {
    setSearchCity(c)
    setSuggestions([])
    const target = CITY_DEFAULT_PIN[c]
    if (target && cityOf(shownPin) !== c) router.push(`/report/${target}`)
  }

  useEffect(() => {
    let s = []
    try { s = JSON.parse(localStorage.getItem('aslivastu_shortlist') || '[]') } catch { /* ignore */ }
    if (Array.isArray(s) && s.length) setShortlist(s)
  }, [])
  function toggleSaved(p) {
    setShortlist(prev => { const next = prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
      try { localStorage.setItem('aslivastu_shortlist', JSON.stringify(next)) } catch { /* ignore */ }
      return next })
  }
  function share() {
    const url = typeof window !== 'undefined' ? window.location.origin + '/report/' + report.pin_code : ''
    const txt = `${PIN_META[report.pin_code]?.name || report.pin_code}: NQI ${report.nqi_composite}/100 (${report.grade}) on AsliVastu`
    if (typeof navigator !== 'undefined' && navigator.share) navigator.share({ title: 'AsliVastu', text: txt, url }).catch(() => {})
    else if (typeof window !== 'undefined') window.open(`https://wa.me/?text=${encodeURIComponent(txt + ' ' + url)}`, '_blank')
  }
  async function sendFeedback() {
    if (!fbText.trim() || fbStatus === 'sending') return
    setFbStatus('sending')
    try {
      const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: fbText, area: `${PIN_META[report.pin_code]?.name || report.pin_code} (${report.pin_code})`, pin: report.pin_code, nqi: report.nqi_composite, grade: report.grade, page: 'report-v2' }) })
      if (!res.ok) throw new Error()
      setFbStatus('sent'); setFbText('')
    } catch { setFbStatus('error') }
  }
  // Full-report PDF: renders the actual styled page (multi-page A4) rather than a text summary.
  async function generatePDF() {
    if (pdfBusy) return
    setPdfBusy(true)
    const wasLocked = !unlocked
    try {
      if (wasLocked) setUnlocked(true)                    // capture the whole report
      await new Promise(r => setTimeout(r, wasLocked ? 700 : 250))  // let it render/tiles settle
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', () => !!window.jspdf)
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', () => !!window.html2canvas)
      const { jsPDF } = window.jspdf
      const node = sheetRef.current
      if (!node) throw new Error('no node')
      node.setAttribute('data-pdf', '1')                  // hides interactive-only bits via CSS
      const bg = dark ? '#151618' : '#f2f2f3'
      const canvas = await window.html2canvas(node, { scale: 2, backgroundColor: bg, useCORS: true, allowTaint: true, logging: false, windowWidth: 1280 })
      node.removeAttribute('data-pdf')

      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight()
      const m = 18, iw = pw - m * 2
      const ih = (canvas.height * iw) / canvas.width      // full image height at page width
      const pageCanvasH = Math.floor((canvas.width * (ph - m * 2)) / iw)  // px of source per page
      let sy = 0, page = 0
      while (sy < canvas.height) {
        const sliceH = Math.min(pageCanvasH, canvas.height - sy)
        const slice = document.createElement('canvas')
        slice.width = canvas.width; slice.height = sliceH
        slice.getContext('2d').drawImage(canvas, 0, sy, canvas.width, sliceH, 0, 0, canvas.width, sliceH)
        if (page) doc.addPage()
        doc.setFillColor(bg); doc.rect(0, 0, pw, ph, 'F')
        doc.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', m, m, iw, (sliceH * iw) / canvas.width)
        sy += sliceH; page++
      }
      const name = PIN_META[report.pin_code]?.name || report.pin_code
      doc.save(`AsliVastu-${String(name).replace(/\s+/g, '-')}-${report.pin_code}.pdf`)
      void ih
    } catch { /* ignore */ } finally { setPdfBusy(false) }
  }

  const pin = report?.pin_code
  const meta = report ? (PIN_META[pin] || { name: pin, area: cityOf(pin) }) : null
  const city = report?.city || (pin ? cityOf(pin) : 'Delhi NCR')

  const { nqi, grade, rows } = useMemo(() => {
    if (!report) return { nqi: null, grade: '—', rows: [] }
    const w = persona === 'Custom' ? customWeights : WEIGHT_PRESETS[persona]
    const keys = Object.keys(report.scores)
    const totalW = keys.reduce((s, k) => s + (w[k] || 0), 0) || 1
    const composite = Math.round(keys.reduce((s, k) => s + report.scores[k] * (w[k] || 0), 0) / totalW)
    const rws = keys
      .map(k => ({ k, score: report.scores[k], weight: Math.round((w[k] || 0) / totalW * 100) }))
      .sort((a, b) => b.weight - a.weight || b.score - a.score)
    return { nqi: composite, grade: gradeFor(composite), rows: rws }
  }, [report, persona, customWeights])

  const nearby = useMemo(() => {
    if (!report || !allScores) return []
    return allScores.filter(x => x.pin_code !== pin && x.nqi_composite != null)
      .sort((a, b) => Math.abs(+a.pin_code - +pin) - Math.abs(+b.pin_code - +pin)).slice(0, 4)
  }, [report, allScores, pin])

  // Real interactive map (Leaflet via CDN + CARTO tiles). Pins = current area + nearby.
  useEffect(() => {
    if (typeof window === 'undefined' || !report) return
    const center = AREA_COORDS[pin]
    if (!center || !mapEl.current) return
    let map
    const init = () => {
      const L = window.L
      if (!L || !mapEl.current || mapEl.current._leaflet_id) return
      map = L.map(mapEl.current, { zoomControl: true, attributionControl: false, scrollWheelZoom: false }).setView(center, 13)
      const tiles = dark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      L.tileLayer(tiles, { maxZoom: 19, attribution: '© OpenStreetMap © CARTO' }).addTo(map)
      const pts = [{ p: pin, nqi: report.nqi_composite, cur: true }, ...nearby.map(n => ({ p: n.pin_code, nqi: n.nqi_composite }))]
      pts.forEach(({ p, nqi, cur }) => {
        const c = AREA_COORDS[p]; if (!c) return
        const mk = L.circleMarker(c, { radius: cur ? 10 : 7, color: '#7a1f2b', weight: 2, fillColor: cur ? '#7a1f2b' : '#a75a65', fillOpacity: cur ? 0.95 : 0.55 }).addTo(map)
        mk.bindTooltip(`${PIN_META[p]?.name || p} · ${nqi}`, { direction: 'top' })
        mk.on('click', () => { window.location.href = `/report/${p}` })
      })
    }
    if (window.L) init()
    else {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link'); link.id = 'leaflet-css'; link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link)
      }
      let s = document.getElementById('leaflet-js')
      if (!s) { s = document.createElement('script'); s.id = 'leaflet-js'; s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload = init; document.body.appendChild(s) }
      else s.addEventListener('load', init)
    }
    return () => { if (map) map.remove() }
  }, [pin, report, nearby, dark, unlocked])

  if (!report) return <div style={{ padding:40, fontFamily:'system-ui' }}>No data for this pin.</div>

  const verdict = verdictFor(nqi)
  const acc = '#7a1f2b'
  const { good, bad } = highlights(report)
  const pc = report.price_context
  const inr = n => '₹' + Number(n).toLocaleString('en-IN')

  return (
    <div className={`iv${dark ? '' : ' light'}`}>
      <Head>
        <title>{ogMeta?.title || `${meta.name} — AsliVastu spec sheet`}</title>
        {ogMeta && <>
          <meta name="description" content={ogMeta.description} />
          <link rel="canonical" href={ogMeta.url} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={ogMeta.title} />
          <meta property="og:description" content={ogMeta.description} />
          <meta property="og:image" content={ogMeta.image} />
          <meta property="og:url" content={ogMeta.url} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={ogMeta.title} />
          <meta name="twitter:description" content={ogMeta.description} />
          <meta name="twitter:image" content={ogMeta.image} />
          {ogMeta.jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ogMeta.jsonLd }} />}
        </>}
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div ref={sheetRef} style={{ maxWidth:1280, margin:'0 auto', padding:'0 40px 60px' }}>

        {/* ── Header ── */}
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, padding:'22px 0 18px', borderBottom:'1px solid var(--acc50, var(--acc60))' }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:14 }}>
            <Link href="/" className="cond" style={{ fontWeight:700, fontSize:22, letterSpacing:'.04em', color:'var(--ink)' }}>ASLIVASTU</Link>
            <span className="kick">Neighbourhood intelligence · spec sheet</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <span style={{ fontSize:13, color:'var(--ink60)', letterSpacing:'.04em' }}>152 AREAS · 2 CITIES</span>
            <Link href="/compare" style={{ fontSize:13, fontWeight:600, letterSpacing:'.06em' }}>COMPARE</Link>
            <button onClick={() => setDark(!dark)} style={{ background:'var(--acc-fill)', color:'#f6f3f3', border:'none', padding:'8px 16px', fontSize:12, fontWeight:600, letterSpacing:'.06em' }}>{dark ? 'LIGHT MODE' : 'DARK MODE'}</button>
          </div>
        </header>

        {/* ── Area search + city switcher ── */}
        <div className="no-pdf" style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', marginTop:18, position:'relative', zIndex:20 }}>
          <div style={{ display:'inline-flex', border:'1px solid var(--acc45)' }}>
            {['Delhi NCR','Bangalore'].map((c, i) => (
              <button key={c} onClick={() => switchCity(c)}
                style={{ fontSize:11, fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', padding:'7px 12px', border:'none', borderLeft: i ? '1px solid var(--acc45)' : 'none', background: searchCity === c ? acc : 'transparent', color: searchCity === c ? '#fff' : 'var(--ink70)' }}>{c}</button>
            ))}
          </div>
          <div style={{ position:'relative', flex:1, minWidth:240, maxWidth:440 }}>
            <input value={query} onChange={e => { setQuery(e.target.value); setSuggestions(searchPinV2(e.target.value, searchCity)) }}
              placeholder={searchCity === 'Bangalore' ? 'Look up another area — e.g. Koramangala' : 'Look up another area — e.g. Hauz Khas'}
              style={{ width:'100%', padding:'9px 12px', border:'1px solid var(--acc35)', background:'transparent', color:'var(--ink)', fontSize:13, outline:'none' }} />
            {suggestions.length > 0 && (
              <div style={{ position:'absolute', top:'calc(100% + 2px)', left:0, right:0, background:'var(--bg)', border:'1px solid var(--acc45)', zIndex:50 }}>
                {suggestions.map(s => (
                  <Link key={s.pin} href={`/report-v2/${s.pin}`} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', fontSize:13, color:'var(--ink)', borderTop:'1px solid var(--acc35)' }}>
                    <span>{s.name}</span><span style={{ color:'var(--ink55)', fontFamily:'monospace', fontSize:11 }}>{s.pin}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Hero: 3 cards ── */}
        <div className="hero3" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:24, paddingTop:28 }}>
          {/* Identity */}
          <BPF style={{ padding:24 }}>
            <p className="kick">Sheet 01 · {meta.area} · PIN {pin}</p>
            <h1 className="cond" style={{ fontSize:54, fontWeight:700, lineHeight:.95, margin:'10px 0 8px', textTransform:'uppercase' }}>{meta.name}</h1>
            <p style={{ fontSize:13, color:'var(--ink65)', margin:0 }}>{report.dimensions_scored}/{report.dimensions_total} dimensions · scored {report.scored_at ? new Date(report.scored_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}</p>
            <div className="no-pdf" style={{ display:'flex', gap:10, marginTop:18, flexWrap:'wrap' }}>
              {(() => { const saved = shortlist.includes(pin)
                const bs = on => ({ fontSize:12, fontWeight:600, letterSpacing:'.06em', padding:'8px 12px', background:'transparent', cursor:'pointer',
                  border:`1px solid ${on ? 'var(--acc)' : 'var(--acc60)'}`, color: on ? 'var(--acc)' : 'var(--ink70)' })
                return (<>
                  <button onClick={() => toggleSaved(pin)} style={bs(saved)}>{saved ? '★ SHORTLISTED' : '☆ SHORTLIST'}</button>
                  <button onClick={generatePDF} style={bs(false)}>{pdfBusy ? '…' : 'PDF'}</button>
                  <button onClick={share} style={bs(false)}>SHARE</button>
                </>)
              })()}
            </div>
          </BPF>

          {/* Score */}
          <BPF style={{ padding:24 }}>
            <p className="kick">Composite index · {persona} weighting</p>
            <div style={{ display:'flex', alignItems:'flex-end', gap:14, margin:'8px 0 6px' }}>
              <span className="cond" style={{ fontSize:84, fontWeight:700, lineHeight:.85 }}>{nqi}</span>
              <span className="cond" style={{ fontSize:30, fontWeight:700, color:'var(--acc)', marginBottom:12 }}>{grade}</span>
            </div>
            <p style={{ fontSize:13, color:'var(--ink65)', margin:0, lineHeight:1.5 }}>NQI · weighted mean of {report.dimensions_total} dimensions — switch profile to re-weight.</p>
          </BPF>

          {/* Verdict (solid accent) */}
          <div style={{ background:acc, color:'#f6f3f3', padding:24, position:'relative' }}>
            <p className="kick" style={{ color:'rgba(246,243,243,.8)' }}>Verdict</p>
            <h2 className="cond" style={{ fontSize:34, fontWeight:700, margin:'8px 0 10px', textTransform:'uppercase' }}>{verdict.label}</h2>
            <p style={{ fontSize:13, lineHeight:1.5, margin:0, color:'rgba(246,243,243,.92)' }}>{verdict.why}</p>
          </div>
        </div>

        {/* ── Persona toggle + freshness legend ── */}
        <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap', margin:'28px 0 0' }}>
          <div style={{ display:'inline-flex', border:'1px solid var(--acc45)' }}>
            {[...Object.keys(WEIGHT_PRESETS), 'Custom'].map((p, i) => (
              <button key={p} onClick={() => setPersona(p)} style={{
                fontSize:12, fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', padding:'7px 14px', border:'none',
                borderLeft: i ? '1px solid var(--acc45)' : 'none',
                background: persona === p ? acc : 'transparent', color: persona === p ? '#fff' : 'var(--ink70)' }}>{p}</button>
            ))}
          </div>
          <span style={{ fontSize:12, color:'var(--ink65)', lineHeight:1.5 }}>
            <strong style={{ color:'var(--ink)' }}>AIR = LIVE FEED</strong> (daily) · all other channels estimated, gov. reports verified 2023–24 · rows re-rank with the selected profile
          </span>
        </div>

        {persona === 'Custom' && (
          <BPF style={{ marginTop:16, padding:'16px 20px' }}>
            <p className="kick">Custom weighting · drag to set your priorities</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'12px 24px', marginTop:14 }}>
              {['crime','infrastructure','air','power','schools','water','roads','sewerage'].map(k => (
                <div key={k}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--ink65)', marginBottom:4 }}>
                    <span style={{ textTransform:'uppercase', letterSpacing:'.04em' }}>{LABEL[k]}</span>
                    <span style={{ color:'var(--acc-deep)', fontWeight:600 }}>{customWeights[k]}</span>
                  </div>
                  <input type="range" min="0" max="50" value={customWeights[k]} onChange={e => setCustomWeights({ ...customWeights, [k]: +e.target.value })} style={{ width:'100%', accentColor:acc }} />
                </div>
              ))}
            </div>
          </BPF>
        )}

        {/* ── Dimension readout ── */}
        <BPF style={{ marginTop:24, padding:'0 24px 8px' }}>
          <p className="kick" style={{ padding:'16px 0 4px' }}>Dimension readout · weight = exact contribution to the {nqi}</p>
          {rows.map((row) => {
            const weak = row.score < 50
            const col = scoreColor(row.score)
            return (
              <div key={row.k} style={{ display:'grid', gridTemplateColumns:'200px 52px 1fr 76px', gap:14, alignItems:'start', padding:'11px 0', borderTop:'1px dashed var(--acc35)' }}>
                <div>
                  <div className="cond" style={{ fontSize:18, fontWeight:600, textTransform:'uppercase', lineHeight:1.1 }}>{LABEL[row.k]}</div>
                  <div style={{ fontSize:11, color:'var(--ink55)', marginTop:2 }}>{source(row.k, city)}</div>
                </div>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--acc-deep)', paddingTop:4 }}>{row.weight}%</div>
                <div style={{ paddingTop:2 }}>
                  <div style={{ height:8, border:'1px solid var(--acc35)', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', inset:0, width:`${row.score}%`,
                      background: weak ? undefined : col,
                      backgroundImage: weak ? `repeating-linear-gradient(45deg, ${col} 0 3px, transparent 3px 6px)` : undefined }} />
                  </div>
                  <p style={{ fontSize:12, color:'var(--ink70)', margin:'6px 0 0', lineHeight:1.45 }}>{explain(row.k, report)}</p>
                </div>
                <div className="cond" style={{ fontSize:26, fontWeight:700, textAlign:'right', color: col }}>{row.score}</div>
              </div>
            )
          })}
        </BPF>

        {/* ── Sun & Shadow teaser — free, outside the full report ── */}
        <SunShadowBar pin={pin} areaName={meta.name} />

        {/* ── Paywall / unlock gate ── */}
        {!unlocked ? (
          <BPF style={{ marginTop:24, padding:'40px 24px', textAlign:'center' }}>
            <p className="kick">Locked · Sheet 02</p>
            <h3 className="cond" style={{ fontSize:30, fontWeight:700, textTransform:'uppercase', margin:'8px 0 6px' }}>Full neighbourhood report</h3>
            <p style={{ fontSize:13, color:'var(--ink65)', margin:'0 0 22px' }}>Plan-view map, nearby comparison, inspection notes, price context &amp; commute check.</p>
            <div style={{ display:'inline-grid', gridTemplateColumns:'1fr 1fr', gap:'8px 28px', textAlign:'left', margin:'0 auto 24px', fontSize:12, color:'var(--ink70)' }}>
              {['Plan-view map + nearby pins','Area comparison table','Inspection notes (buy / avoid)','Price context & market gap','Commute reality check','Persona re-weighting'].map(i => (
                <div key={i} style={{ display:'flex', gap:8 }}><span style={{ color:'var(--acc)' }}>+</span>{i}</div>
              ))}
            </div>
            <div><button onClick={() => setUnlocked(true)} style={{ background:acc, color:'#f6f3f3', border:'none', padding:'13px 40px', fontSize:14, fontWeight:600, letterSpacing:'.06em', cursor:'pointer' }}>VIEW FULL REPORT →</button></div>
            <p style={{ fontSize:11, color:'var(--ink55)', margin:'12px 0 0', letterSpacing:'.04em' }}>Includes map, comparison, notes, price &amp; commute</p>
          </BPF>
        ) : (<>

        {/* ── Map + comparison ── */}
        <div className="hero3" style={{ display:'grid', gridTemplateColumns:'400px 1fr', gap:24, marginTop:24 }}>
          <BPF style={{ padding:20 }}>
            <p className="kick">Plan view · nearby areas</p>
            <div ref={mapEl} style={{ height:230, marginTop:12, border:'1px solid var(--acc35)', background:'var(--fill7)' }}>
              {!AREA_COORDS[pin] && <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'var(--ink55)' }}>map not available for this pin</div>}
            </div>
            <p style={{ fontSize:12, color:'var(--ink60)', margin:'10px 0 0' }}>Pins show each area&apos;s NQI; tap one to open its sheet.</p>
          </BPF>

          <BPF style={{ padding:'20px 22px' }}>
            <p className="kick">Comparison</p>
            <table style={{ width:'100%', borderCollapse:'collapse', marginTop:12, fontSize:13 }}>
              <thead>
                <tr style={{ fontSize:11, textTransform:'uppercase', color:'var(--ink55)', letterSpacing:'.06em' }}>
                  {['Area','NQI','Safety','Air','Water','Drainage'].map((h, i) => (
                    <th key={h} style={{ textAlign: i ? 'right' : 'left', padding:'0 0 8px', borderBottom:'1px solid var(--acc45)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[{ pin_code: pin, nqi_composite: report.nqi_composite, scores: report.scores, cur: true }, ...nearby].map(r => (
                  <tr key={r.pin_code} style={{ fontWeight: r.cur ? 600 : 400, color: r.cur ? 'var(--acc-deep)' : 'var(--ink)' }}>
                    <td style={{ padding:'9px 0', borderBottom:'1px dashed var(--acc35)' }}>{PIN_META[r.pin_code]?.name || r.pin_code}</td>
                    {['nqi_composite','crime','air','water','sewerage'].map((f, i) => (
                      <td key={f} style={{ textAlign:'right', padding:'9px 0', borderBottom:'1px dashed var(--acc35)' }}>{i === 0 ? r.nqi_composite : (r.scores?.[f] ?? '—')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {nearby[0] && <p style={{ fontSize:12, color:'var(--ink60)', margin:'12px 0 0' }}>{meta.name} {report.nqi_composite >= nearby[0].nqi_composite ? 'leads' : 'trails'} its nearest neighbour {PIN_META[nearby[0].pin_code]?.name || nearby[0].pin_code} on the composite index.</p>}
          </BPF>
        </div>

        {/* ── Notes + price ── */}
        <div className="hero3" style={{ display:'grid', gridTemplateColumns:'400px 1fr', gap:24, marginTop:24 }}>
          <BPF style={{ padding:20 }}>
            <p className="kick">Inspection notes</p>
            <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:9 }}>
              {good.map((g, i) => <div key={'g'+i} style={{ display:'flex', gap:9, fontSize:13, lineHeight:1.45 }}><span style={{ color:'var(--ink)', fontWeight:600 }}>✓</span><span style={{ color:'var(--ink70)' }}>{g}</span></div>)}
              {bad.map((b, i) => <div key={'b'+i} style={{ display:'flex', gap:9, fontSize:13, lineHeight:1.45 }}><span style={{ color:'var(--acc-deep)', fontWeight:600 }}>✕</span><span style={{ color:'var(--ink70)' }}>{b}</span></div>)}
              {good.length + bad.length === 0 && <span style={{ fontSize:13, color:'var(--ink60)' }}>No standout flags either way.</span>}
            </div>
          </BPF>

          <BPF style={{ padding:'20px 22px' }}>
            <p className="kick">Price context · guidance value</p>
            {pc && pc.rate_sqft ? (() => {
              const [lo, hi] = pc.rate_sqft
              const bands = ['Premium','Upper','Mid','Modest','Value']
              const ops = [1,.55,.3,.15,.07]
              const mLo = Math.round(lo * 1.2 / 100) * 100, mHi = Math.round(hi * 1.6 / 100) * 100
              const blr = city === 'Bangalore'
              return (
                <>
                  <div style={{ display:'flex', alignItems:'baseline', gap:10, margin:'8px 0 2px', flexWrap:'wrap' }}>
                    <span className="cond" style={{ fontSize:40, fontWeight:700 }}>{inr(lo)}–{inr(hi)}</span>
                    <span style={{ fontSize:13, color:'var(--ink60)' }}>per sq ft · {pc.label.toLowerCase()} band for {blr ? 'Bengaluru' : 'the NCR'}</span>
                  </div>
                  <div style={{ display:'flex', gap:5, margin:'14px 0 6px' }}>
                    {bands.map((b, i) => (
                      <div key={b} style={{ flex:1 }}>
                        <div style={{ height:8, background:acc, opacity: (i + 1) === pc.tier ? 1 : ops[i] }} />
                        <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'.04em', color: (i + 1) === pc.tier ? 'var(--acc-deep)' : 'var(--ink55)', marginTop:5, fontWeight: (i + 1) === pc.tier ? 600 : 400 }}>{b}{(i + 1) === pc.tier ? ' ▲' : ''}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize:13, color:'var(--ink70)', margin:'12px 0 0', lineHeight:1.5 }}>
                    Market prices run <strong style={{ color:'var(--ink)' }}>20–70% above</strong> the {blr ? 'guidance value' : 'circle rate'} — expect roughly <strong style={{ color:'var(--ink)' }}>{inr(mLo)}–{inr(mHi)}/sq ft</strong> in practice. Indicative government valuation, not a market quote; does not affect the score.
                  </p>
                </>
              )
            })() : <p style={{ fontSize:13, color:'var(--ink60)', marginTop:10 }}>No price data for this pin.</p>}
          </BPF>
        </div>

        {/* ── Deep-dive spec cards ── */}
        <p className="kick" style={{ margin:'28px 0 4px' }}>Detailed readings</p>
        <div style={{ display:'grid', gap:20 }}>
          <StatCard title="Crime" stats={[
            ['Total crimes', report.total_cognizable_crimes ?? '—', "Total cognizable crimes reported annually for this pin's police-station catchment, which can span a wider area than any one colony."],
            ['Safety score', (report.scores.crime ?? '—') + '/100', 'Inverse-normalized against total crimes: 250 or fewer scores 100, 650 or more scores 0, linear in between.'],
            ['Safer than', report.crime_percentile != null ? report.crime_percentile + '%' : '—', 'Percentile rank of this pin\'s crime count against other tracked areas in the same city (cities ranked separately).'],
            ['Crime tier', report.crime_tier ?? '—', 'Very Low / Low / Moderate / High / Very High, based on the percentile rank.'],
            ['Source year', '2022–23', 'Reporting year of the source crime data.'],
          ]} />
          <StatCard title="Power supply" stats={[
            ['Discom', report.discom ?? '—', 'The electricity distribution company serving this area.'],
            ['Reliability', report.reliability ?? '—', 'Qualitative reliability rating derived from outage frequency and consumer complaint data.'],
            ['Avg cut hrs', (report.avg_outage_hours ?? '—') + ' /mo', 'Average monthly power-outage hours from DISCOM reports — not live-metered.'],
            ['Score', (report.scores.power ?? '—') + '/100', 'Weighted blend of outage frequency (60%) and average outage duration (40%).'],
          ]} />
          <StatCard title="Connectivity & infrastructure" stats={[
            ['Zone', report.zone_type || '—', 'Land-use zone type — residential, mixed, commercial or industrial.'],
            ['Metro nearby', report.metro_stations_nearby ?? '—', 'Number of operational metro stations near this pin.'],
            ['Metro planned', report.metro_planned_stations ?? '—', 'Approved but not-yet-open metro stations nearby.'],
            ['Highway', report.highway_proximity || '—', 'Proximity to major highways / arterial roads.'],
            ['Smart city', report.smart_city_project ? 'Yes' : 'No', 'Whether the area falls under the Smart Cities Mission.'],
            ['Infra score', (report.infra_score_raw ?? '—') + '/100', 'Composite of metro access, highway proximity, zone type and smart-city status.'],
          ]} />
          <StatCard title="Water supply" stats={[
            ['Daily supply', (report.supply_hours ?? '—') + ' hrs', 'Average hours of piped water supply available per day.'],
            ['Quality', report.tds_level ? report.tds_level + ' TDS' : '—', 'TDS = Total Dissolved Solids. Low = ideal drinking water; High = hard water needing filtration.'],
            ['Coverage', ((report.water_coverage ?? report.coverage_pct) ?? '—') + '%', '% of households with a piped municipal water connection. Below 80% means heavy tanker/borewell reliance.'],
            ['Complaints', report.complaints_per_1000 ? report.complaints_per_1000 + '/1k' : '—', 'Water-supply complaints per 1,000 households annually. Lower is better.'],
            ['Quality score', ((report.water_quality ?? report.quality_score) ?? '—') + '/5', 'Composite 1–5 water-quality rating from TDS, complaints and supply hours.'],
          ]} />
          <StatCard title="Roads" stats={[
            ['Condition', report.road_condition || '—', 'Overall road-surface condition rating (Excellent → Very Poor).'],
            ['Potholes/km', report.pothole_density ?? '—', 'Estimated potholes per km. Below 2 = good; above 5 = poor; above 10 = dangerous.'],
            ['Connectivity', report.connectivity || '—', 'How well the area connects to arterial roads and highways.'],
            ['Authority', report.authority || '—', 'Government body responsible for road maintenance here.'],
            ['Last resurfaced', report.last_resurfaced || '—', 'Year the main roads were last resurfaced (every 5–7 years is typical).'],
            ['Quality score', ((report.road_quality ?? report.quality_score) ?? '—') + '/5', 'Composite 1–5 road-quality rating from condition and pothole density.'],
          ]} />
          <StatCard title="Drainage & sewerage" stats={[
            ['Sewer coverage', ((report.sewerage_coverage ?? report.coverage_pct) ?? '—') + '%', '% of households connected to the underground sewerage network.'],
            ['Treatment', report.treatment || '—', 'Whether sewage reaches a treatment plant — Adequate / Partial / Inadequate.'],
            ['Waterlogging', report.waterlogging_risk != null ? (report.waterlogging_risk >= 4 ? 'Low risk' : report.waterlogging_risk >= 3 ? 'Moderate' : 'High risk') : '—', 'Monsoon waterlogging risk from drainage capacity, elevation and flooding history.'],
            ['Open drains', report.open_drains === true ? 'Yes' : report.open_drains === false ? 'No' : '—', 'Whether the area has uncovered drains — a health and flooding hazard.'],
            ['Flood incidents', report.flooding_incidents_annual != null ? report.flooding_incidents_annual + '/yr' : '—', 'Significant waterlogging/flooding incidents recorded per year.'],
          ]} />
          {report.schools_list && report.schools_list.length > 0 && (
            <BPF style={{ padding:'18px 20px' }}>
              <p className="kick">Schools · {report.schools_count} CBSE mapped</p>
              <div style={{ marginTop:12 }}>
                {report.schools_list.slice(0, 8).map((s, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', gap:12, fontSize:13, padding:'8px 0', borderTop: i ? '1px dashed var(--acc35)' : 'none' }}>
                    <span style={{ color:'var(--ink)' }}>{s.name}</span>
                    <span style={{ color:'var(--ink55)', fontSize:11 }}>{s.board || 'CBSE'}</span>
                  </div>
                ))}
              </div>
            </BPF>
          )}
          <BPF style={{ padding:'18px 20px' }}>
            <p className="kick">Methodology · data sources</p>
            <div style={{ marginTop:12 }}>
              {['crime','infrastructure','air','power','schools','water','roads','sewerage'].map(k => (
                <div key={k} style={{ display:'grid', gridTemplateColumns:'170px 46px 1fr', gap:12, fontSize:12, padding:'7px 0', borderTop:'1px dashed var(--acc35)', alignItems:'baseline' }}>
                  <span className="cond" style={{ fontSize:15, fontWeight:600, textTransform:'uppercase' }}>{LABEL[k]}</span>
                  <span style={{ color:'var(--acc-deep)', fontWeight:600 }}>{WEIGHT_PRESETS.Default[k]}%</span>
                  <span style={{ color:'var(--ink65)' }}>{source(k, city)} {k === 'air' ? '· LIVE' : '· EST'}</span>
                </div>
              ))}
            </div>
          </BPF>
        </div>

        {/* ── Commute reality check ── */}
        <BPF style={{ marginTop:24, padding:'20px 22px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <p className="kick" style={{ margin:0 }}>Commute reality check</p>
            <span style={{ background:acc, color:'#f6f3f3', fontSize:10, fontWeight:600, letterSpacing:'.06em', padding:'2px 7px' }}>NEW</span>
          </div>
          <p style={{ fontSize:13, color:'var(--ink70)', margin:'10px 0 12px', lineHeight:1.5 }}>How long does it actually take to reach your office from {meta.name}? Brokers quote off-peak times — this shows peak-hour reality.</p>
          <div style={{ display:'flex', gap:10, maxWidth:560 }}>
            <input placeholder="Enter your office area or pin code…" style={{ flex:1, padding:'10px 12px', border:'1px solid var(--acc35)', background:'transparent', color:'var(--ink)', fontSize:14, outline:'none' }} />
            <button style={{ background:acc, color:'#f6f3f3', border:'none', padding:'10px 22px', fontSize:12, fontWeight:600, letterSpacing:'.06em' }}>CHECK</button>
          </div>
        </BPF>

        {/* ── Sun & Shadow Check — full search version, below Commute Reality Check ── */}
        <SunShadowCheck pin={pin} city={city} areaName={meta.name} />

        </>)}

        {/* ── About + feedback ── */}
        <div className="hero3" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginTop:32 }}>
          <BPF style={{ padding:'18px 20px' }}>
            <p className="kick">About the builder</p>
            <div style={{ display:'flex', gap:14, alignItems:'center', marginTop:12 }}>
              <img src="/IMG_6285.jpeg" alt="Gurshaan Singh Baweja" style={{ width:52, height:52, objectFit:'cover', border:'1px solid var(--acc60)' }} />
              <div>
                <div className="cond" style={{ fontSize:18, fontWeight:600 }}>Gurshaan Singh Baweja</div>
                <a href="https://linkedin.com/in/gurshaan-singh-baweja" target="_blank" rel="noreferrer" style={{ fontSize:12 }}>Connect on LinkedIn →</a>
              </div>
            </div>
            <p style={{ fontSize:12.5, color:'var(--ink70)', margin:'12px 0 0', lineHeight:1.55 }}>Buying a home in Delhi NCR or Bangalore means digging through a dozen government portals. AsliVastu puts it all in one place — real data, one score, no guesswork.</p>
          </BPF>
          <BPF className="no-pdf" style={{ padding:'18px 20px' }}>
            <p className="kick">Correction / feedback</p>
            <p style={{ fontSize:12.5, color:'var(--ink70)', margin:'10px 0 12px', lineHeight:1.5 }}>Live in {meta.name}? Think a score is off? Tell us — it goes straight to the builder.</p>
            {fbStatus === 'sent' ? (
              <p style={{ fontSize:13, color:'var(--acc-deep)', fontWeight:600 }}>✓ Thanks — feedback received.</p>
            ) : (<>
              <textarea value={fbText} onChange={e => setFbText(e.target.value)} placeholder="What&apos;s inaccurate or missing?" rows={3}
                style={{ width:'100%', padding:'10px 12px', border:'1px solid var(--acc35)', background:'transparent', color:'var(--ink)', fontSize:13, outline:'none', resize:'vertical', fontFamily:'Barlow,sans-serif' }} />
              <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:10 }}>
                <button onClick={sendFeedback} disabled={fbStatus === 'sending'} style={{ background:acc, color:'#f6f3f3', border:'none', padding:'9px 20px', fontSize:12, fontWeight:600, letterSpacing:'.06em', cursor:'pointer' }}>{fbStatus === 'sending' ? 'SENDING…' : 'SUBMIT'}</button>
                {fbStatus === 'error' && <span style={{ fontSize:12, color:'#ef4444' }}>Failed — try again.</span>}
              </div>
            </>)}
          </BPF>
        </div>

        {/* ── Footer ── */}
        <div style={{ marginTop:32, paddingTop:20, borderTop:'1px solid var(--acc35)' }}>
          <p style={{ fontSize:12, color:'var(--ink65)', lineHeight:1.6, margin:'0 0 14px', maxWidth:900 }}>
            <strong style={{ color:'var(--ink)' }}>Important notice</strong> — AsliVastu scores are data aggregations for informational and research purposes only, not real-estate, legal or financial advice. Most data is estimated from government reports last verified 2023–24; only Air Quality refreshes in real time. Do not rely solely on these scores for a purchase decision.
          </p>
          <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12, fontSize:12 }}>
            <span style={{ color:'var(--ink60)' }}>Built by Gurshaan Singh Baweja · <a href="https://linkedin.com/in/gurshaan-singh-baweja" target="_blank" rel="noreferrer">Connect on LinkedIn →</a></span>
            <span style={{ color:'var(--ink60)' }}>Live in {meta.name}? Think a score is wrong? <a href={`/report?pin=${pin}`}>FLAG IT →</a></span>
          </div>
        </div>

      </div>
    </div>
  )
}

export async function getServerSideProps({ params, req }) {
  const pin = params?.pin

  if (!pin || !/^\d{6}$/.test(pin)) {
    return { redirect: { destination: '/report', permanent: false } }
  }

  const meta = PIN_META[pin]

  if (!meta) {
    return { redirect: { destination: `/report?pin=${pin}`, permanent: false } }
  }

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers.host
    const baseUrl = `${protocol}://${host}`

    const [r1, r2] = await Promise.all([
      fetch(`${baseUrl}/api/report?pin=${pin}`),
      fetch(`${baseUrl}/api/all`),
    ])

    let initialReport = null
    let initialAllScores = []

    if (r1.ok) initialReport = await r1.json()
    if (r2.ok) initialAllScores = await r2.json()

    const score = initialReport?.nqi_composite || '—'
    const grade = initialReport?.grade || '—'
    const verdictLabel = initialReport
      ? score >= 75 ? 'Strong Buy'
        : score >= 60 ? 'Consider'
        : score >= 45 ? 'Below Average'
        : 'Avoid'
      : ''

    const scores = initialReport?.scores || {}
    const scoreSummary = Object.entries(scores)
      .map(([k, v]) => {
        const labels = { crime:'Safety', infrastructure:'Infrastructure', air:'Air Quality', power:'Power', schools:'Schools' }
        return `${labels[k]||k} ${v}/100`
      }).join(', ')

    // Rich SEO title: "Hauz Khas Neighbourhood Score — 83/100 (A) | AsliVastu Delhi NCR"
    const seoTitle = initialReport
      ? `${meta.name} Neighbourhood Score — ${score}/100 (${grade}) | AsliVastu`
      : `${meta.name} Neighbourhood Report | AsliVastu Delhi NCR`

    // Rich description targeting search queries like "Hauz Khas neighbourhood review"
    const seoDescription = initialReport
      ? `${meta.name} (${pin}) neighbourhood quality report: NQI Score ${score}/100, Grade ${grade} — ${verdictLabel}. ${scoreSummary}. Free data-backed report on AsliVastu.`
      : `Neighbourhood quality report for ${meta.name} (${pin}), ${meta.area}. Safety, air quality, infrastructure, power and water scores. Free on AsliVastu.`

    // JSON-LD structured data — helps Google understand the page for rich results
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": seoTitle,
      "description": seoDescription,
      "url": `${baseUrl}/report/${pin}`,
      "image": `${baseUrl}/api/og?pin=${pin}`,
      "publisher": {
        "@type": "Organization",
        "name": "AsliVastu",
        "url": "https://aslivastu.vercel.app",
        "logo": "https://aslivastu.vercel.app/logo.png"
      },
      ...(initialReport ? {
        "mainEntity": {
          "@type": "Place",
          "name": meta.name,
          "address": {
            "@type": "PostalAddress",
            "postalCode": pin,
            "addressRegion": meta.area,
            "addressCountry": "IN"
          },
          "additionalProperty": Object.entries(scores).map(([k, v]) => ({
            "@type": "PropertyValue",
            "name": { crime:'Safety Score', infrastructure:'Infrastructure Score', air:'Air Quality Score', power:'Power Score', schools:'Schools Score' }[k] || k,
            "value": v,
            "minValue": 0,
            "maxValue": 100
          }))
        }
      } : {})
    })

    const ogMeta = {
      title: seoTitle,
      description: seoDescription,
      image: `${baseUrl}/api/og?pin=${pin}`,
      url: `${baseUrl}/report/${pin}`,
      jsonLd,
    }

    return {
      props: { report: initialReport, allScores: initialAllScores, ogMeta },
    }
  } catch (e) {
    return {
      props: {
        report: null,
        allScores: [],
        ogMeta: {
          title: `${meta.name} — Neighbourhood Report | AsliVastu`,
          description: `Free neighbourhood quality report for ${meta.name}, ${meta.area}.`,
          image: `https://aslivastu.vercel.app/api/og?pin=${pin}`,
          url: `https://aslivastu.vercel.app/report/${pin}`,
        },
      },
    }
  }
}
