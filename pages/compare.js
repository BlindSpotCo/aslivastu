import { useState } from 'react'
import Link from 'next/link'

const PIN_META = {
  "110001":{ name:"Connaught Place",   area:"Central Delhi" },
  "110002":{ name:"ITO",               area:"Central Delhi" },
  "110003":{ name:"Lodhi Road",        area:"South Delhi" },
  "110005":{ name:"Karol Bagh",        area:"Central Delhi" },
  "110006":{ name:"Chandni Chowk",     area:"Old Delhi" },
  "110007":{ name:"Delhi University",  area:"North Delhi" },
  "110008":{ name:"Shadipur",          area:"West Delhi" },
  "110009":{ name:"Model Town",        area:"North Delhi" },
  "110010":{ name:"Cantonment",        area:"South Delhi" },
  "110012":{ name:"Pusa",              area:"Central Delhi" },
  "110016":{ name:"Hauz Khas",         area:"South Delhi" },
  "110017":{ name:"Saket",             area:"South Delhi" },
  "110018":{ name:"Vikaspuri",         area:"West Delhi" },
  "110019":{ name:"Dwarka Sec 6",      area:"South West Delhi" },
  "110020":{ name:"Okhla",             area:"South East Delhi" },
  "110021":{ name:"Moti Bagh",         area:"South Delhi" },
  "110022":{ name:"R.K. Puram",        area:"South West Delhi" },
  "110024":{ name:"Lajpat Nagar",      area:"South Delhi" },
  "110025":{ name:"Mathura Road",      area:"South Delhi" },
  "110026":{ name:"Punjabi Bagh",      area:"West Delhi" },
  "110032":{ name:"Anand Vihar",       area:"East Delhi" },
  "110033":{ name:"Jahangirpuri",      area:"North West Delhi" },
  "110036":{ name:"Alipur",            area:"North Delhi" },
  "110037":{ name:"Aerocity",          area:"South West Delhi" },
  "110039":{ name:"Bawana",            area:"North Delhi" },
  "110040":{ name:"Narela",            area:"North Delhi" },
  "110041":{ name:"Mundka",            area:"West Delhi" },
  "110042":{ name:"DTU",               area:"North West Delhi" },
  "110043":{ name:"Najafgarh",         area:"South West Delhi" },
  "110044":{ name:"Tughlakabad",       area:"South Delhi" },
  "110049":{ name:"Sirifort",          area:"South Delhi" },
  "110052":{ name:"Ashok Vihar",       area:"North Delhi" },
  "110053":{ name:"Maujpur",           area:"North East Delhi" },
  "110058":{ name:"Janakpuri",         area:"West Delhi" },
  "110063":{ name:"Paschim Vihar",     area:"West Delhi" },
  "110065":{ name:"Nehru Nagar",       area:"East Delhi" },
  "110067":{ name:"JNU Area",          area:"South Delhi" },
  "110068":{ name:"Maidan Garhi",      area:"South Delhi" },
  "110070":{ name:"Vasant Kunj",       area:"South West Delhi" },
  "110073":{ name:"Jaffarpur",         area:"West Delhi" },
  "110077":{ name:"Dwarka Sec 8",      area:"South West Delhi" },
  "110078":{ name:"Dwarka",            area:"South West Delhi" },
  "110084":{ name:"Burari",            area:"North Delhi" },
  "110085":{ name:"Rohini",            area:"North West Delhi" },
  "110092":{ name:"Patparganj",        area:"East Delhi" },
  "110094":{ name:"Sonia Vihar",       area:"North East Delhi" },
  "110095":{ name:"Vivek Vihar",       area:"East Delhi" },
  "121001":{ name:"Faridabad",         area:"Haryana NCR" },
  "121002":{ name:"Faridabad NIT",     area:"Haryana NCR" },
  "121102":{ name:"Palwal",            area:"Haryana NCR" },
  "122001":{ name:"Gurugram",          area:"Haryana NCR" },
  "122002":{ name:"Cyber City",        area:"Gurugram" },
  "122003":{ name:"Gurugram Sec 55",   area:"Gurugram" },
  "122051":{ name:"Manesar",           area:"Gurugram" },
  "122107":{ name:"Nuh",               area:"Haryana NCR" },
  "122413":{ name:"Panchgaon",         area:"Gurugram" },
  "123106":{ name:"Dharuhera",         area:"Haryana NCR" },
  "124001":{ name:"Rohtak",            area:"Haryana NCR" },
  "124507":{ name:"Bahadurgarh",       area:"Haryana NCR" },
  "125050":{ name:"Fatehabad",         area:"Haryana NCR" },
  "125055":{ name:"Sirsa",             area:"Haryana NCR" },
  "131001":{ name:"Sonipat",           area:"Haryana NCR" },
  "132103":{ name:"Panipat",           area:"Haryana NCR" },
  "135001":{ name:"Yamuna Nagar",      area:"Haryana NCR" },
  "201001":{ name:"Ghaziabad",         area:"UP NCR" },
  "201301":{ name:"Noida Sec 1",       area:"UP NCR" },
  "201304":{ name:"Noida Sec 137",     area:"UP NCR" },
  "201309":{ name:"Noida Sec 62",      area:"UP NCR" },
}

const DIM_LABEL = { crime:'Safety', infrastructure:'Infrastructure', air:'Air Quality', power:'Power', schools:'Schools', water:'Water Supply', roads:'Roads', sewerage:'Drainage & Sewerage' }
const GRADE_COLOR = { 'A+':'#22c55e','A':'#22c55e','B+':'#84cc16','B':'#eab308','C+':'#f97316','C':'#ef4444','D':'#dc2626' }
const ACCENT = '#e23744'

// Minimal line-icon set replacing emoji, one per data dimension — flat
// stroke icons at 1.6px weight so they match the rest of the site's
// restrained aesthetic instead of looking like a different design language.
function DimIcon({ name, size = 18, color = 'currentColor', strokeWidth = 1.6 }) {
  const p = { width:size, height:size, viewBox:'0 0 24 24', fill:'none', stroke:color, strokeWidth, strokeLinecap:'round', strokeLinejoin:'round' }
  switch (name) {
    case 'crime':
    case 'safety':
      return <svg {...p}><path d="M12 2.5 19 5.5V11c0 5-3 8.5-7 10-4-1.5-7-5-7-10V5.5L12 2.5Z"/><path d="M9 12l2 2 4-4"/></svg>
    case 'infrastructure':
      return <svg {...p}><rect x="3" y="10" width="5" height="11"/><rect x="10" y="5" width="5" height="16"/><rect x="17" y="13" width="4" height="8"/></svg>
    case 'air':
      return <svg {...p}><path d="M3 8h10.5a2.5 2.5 0 1 0-2.1-3.9"/><path d="M3 12.5h13a2.8 2.8 0 1 1-2.4 4.3"/><path d="M3 17h7.5a2 2 0 1 1-1.7 3.1"/></svg>
    case 'power':
      return <svg {...p}><path d="M13 2 5 14h6l-1 8 8-12h-6l1-8Z"/></svg>
    case 'schools':
      return <svg {...p}><path d="M2 9 12 4l10 5-10 5L2 9Z"/><path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5"/><path d="M22 9v6"/></svg>
    case 'water':
      return <svg {...p}><path d="M12 3c4 5 7 8.7 7 12.2A7 7 0 1 1 5 15.2C5 11.7 8 8 12 3Z"/></svg>
    case 'roads':
      return <svg {...p}><path d="M7 3 3 21"/><path d="M17 3l4 18"/><path d="M12 5v3"/><path d="M12 11v3"/><path d="M12 17v3"/></svg>
    case 'sewerage':
      return <svg {...p}><path d="M6 4v6a6 6 0 0 0 12 0V4"/><path d="M4 20h16"/></svg>
    case 'sun':
      return <svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2.5v3M12 18.5v3M3.8 3.8l2.1 2.1M18.1 18.1l2.1 2.1M2.5 12h3M18.5 12h3M3.8 20.2l2.1-2.1M18.1 5.9l2.1-2.1"/></svg>
    case 'moon':
      return <svg {...p}><path d="M20 14.2A8.3 8.3 0 1 1 9.8 4a6.8 6.8 0 0 0 10.2 10.2Z"/></svg>
    case 'trophy':
      return <svg {...p}><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 5H5a3 3 0 0 0 3 5"/><path d="M16 5h3a3 3 0 0 1-3 5"/><path d="M10 13v3h4v-3"/><path d="M8 20h8"/><path d="M12 16v4"/></svg>
    case 'tie':
      return <svg {...p}><line x1="5" y1="9" x2="19" y2="9"/><line x1="5" y1="15" x2="19" y2="15"/></svg>
    case 'compare':
      return <svg {...p}><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="M16 21l4-4-4-4"/><path d="M20 17H4"/></svg>
    default:
      return null
  }
}

function scoreColor(v) {
  if (v >= 80) return '#22c55e'
  if (v >= 60) return '#84cc16'
  if (v >= 40) return '#f97316'
  return '#ef4444'
}

function searchPin(query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  if (/^\d{6}$/.test(q)) return [{ pin: q, name: PIN_META[q]?.name || q, area: PIN_META[q]?.area || '' }]
  return Object.entries(PIN_META)
    .filter(([pin, { name, area }]) =>
      name.toLowerCase().includes(q) || area.toLowerCase().includes(q) || pin.includes(q)
    )
    .map(([pin, { name, area }]) => ({ pin, name, area }))
    .slice(0, 6)
}

function SearchBox({ label, value, onChange, onSelect, suggestions, showSugg, onFocus, onBlur, card, border, text, muted, subtle, dark }) {
  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Area name or pin code"
        style={{ width: '100%', padding: '12px 14px', background: card, border: `1.5px solid ${border}`, borderRadius: 10, fontSize: 14, color: text, outline: 'none', boxSizing: 'border-box' }}
      />
      {showSugg && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: card, border: `1px solid ${border}`, borderRadius: 10, zIndex: 999, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          {suggestions.map(s => (
            <div key={s.pin} onMouseDown={() => onSelect(s)}
              style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${border}` }}
              onMouseEnter={e => e.currentTarget.style.background = subtle}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <span style={{ fontSize: 13, fontWeight: 500, color: text }}>{s.name}</span>
                <span style={{ fontSize: 11, color: muted, marginLeft: 8 }}>{s.area}</span>
              </div>
              <span style={{ fontSize: 11, color: muted, fontFamily: 'monospace' }}>{s.pin}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Compare() {
  const [dark, setDark] = useState(true)
  const [qA, setQA] = useState('')
  const [qB, setQB] = useState('')
  const [suggA, setSuggA] = useState([])
  const [suggB, setSuggB] = useState([])
  const [showA, setShowA] = useState(false)
  const [showB, setShowB] = useState(false)
  const [reportA, setReportA] = useState(null)
  const [reportB, setReportB] = useState(null)
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)

  const bg     = dark ? '#0f0f0f' : '#ffffff'
  const card   = dark ? '#1a1a1a' : '#ffffff'
  const border = dark ? '#2a2a2a' : '#ebebeb'
  const text   = dark ? '#f0f0f0' : '#111111'
  const muted  = dark ? '#9a9a9a' : '#595959'
  const subtle = dark ? '#222222' : '#f5f5f5'

  function handleChange(val, side) {
    if (side === 'A') { setQA(val); setSuggA(val.length >= 2 ? searchPin(val) : []); setShowA(true) }
    else              { setQB(val); setSuggB(val.length >= 2 ? searchPin(val) : []); setShowB(true) }
  }

  async function fetchFor(pin, side) {
    const setLoading = side === 'A' ? setLoadingA : setLoadingB
    const setReport  = side === 'A' ? setReportA  : setReportB
    setLoading(true)
    try {
      const r = await fetch(`/api/report?pin=${pin}`)
      const data = await r.json()
      if (r.ok) setReport(data)
      else setReport({ error: data.error, pin_code: pin })
    } catch(e) { setReport({ error: 'Network error', pin_code: pin }) }
    finally { setLoading(false) }
  }

  function pickA(s) { setQA(s.name); setSuggA([]); setShowA(false); fetchFor(s.pin, 'A') }
  function pickB(s) { setQB(s.name); setSuggB([]); setShowB(false); fetchFor(s.pin, 'B') }

  const dims = ['crime', 'infrastructure', 'air', 'power', 'schools', 'water', 'roads', 'sewerage']
  const allDims = reportA && reportB
    ? dims.filter(d => reportA.scores?.[d] !== undefined || reportB.scores?.[d] !== undefined)
    : []

  function winner(dim) {
    const a = reportA?.scores?.[dim]
    const b = reportB?.scores?.[dim]
    if (a === undefined || b === undefined) return null
    if (a > b) return 'A'
    if (b > a) return 'B'
    return 'tie'
  }

  function overallWinner() {
    if (!reportA?.nqi_composite || !reportB?.nqi_composite) return null
    if (reportA.nqi_composite > reportB.nqi_composite) return 'A'
    if (reportB.nqi_composite > reportA.nqi_composite) return 'B'
    return 'tie'
  }

  const metaA = reportA ? (PIN_META[reportA.pin_code] || { name: reportA.pin_code, area: '' }) : null
  const metaB = reportB ? (PIN_META[reportB.pin_code] || { name: reportB.pin_code, area: '' }) : null
  const ow = overallWinner()

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: '"Inter",-apple-system,sans-serif' }}>

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${border}`, padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: card, position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <img src="/logo.png" alt="AsliVastu" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 8 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.4px', color: text, lineHeight: 1 }}>AsliVastu</div>
            <div style={{ fontSize: 10, color: ACCENT, fontWeight: 500, marginTop: 2 }}>Your Neighbourhood, By the numbers</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: 13, color: muted, textDecoration: 'none' }}>← Back to search</Link>
          <button onClick={() => setDark(!dark)} style={{ background: 'none', border: `1px solid ${border}`, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: muted, display:'flex', alignItems:'center', gap:5 }}>
            <DimIcon name={dark ? 'sun' : 'moon'} size={13} color={muted} /> {dark ? 'Light' : 'Dark'}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: text }}>Compare areas</h1>
          <p style={{ margin: 0, fontSize: 14, color: muted }}>Pick two Delhi NCR neighbourhoods to compare side by side</p>
        </div>

        {/* Search row */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28, alignItems: 'flex-start' }}>
          <SearchBox label="Area A" value={qA} onChange={v => handleChange(v,'A')} onSelect={pickA}
            suggestions={suggA} showSugg={showA} onFocus={() => setShowA(true)} onBlur={() => setTimeout(() => setShowA(false), 150)}
            card={card} border={border} text={text} muted={muted} subtle={subtle} dark={dark} />

          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 12, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: subtle, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: muted }}>vs</div>
          </div>

          <SearchBox label="Area B" value={qB} onChange={v => handleChange(v,'B')} onSelect={pickB}
            suggestions={suggB} showSugg={showB} onFocus={() => setShowB(true)} onBlur={() => setTimeout(() => setShowB(false), 150)}
            card={card} border={border} text={text} muted={muted} subtle={subtle} dark={dark} />
        </div>

        {/* Loading states */}
        {(loadingA || loadingB) && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: muted, fontSize: 14 }}>Loading reports...</div>
        )}

        {/* Comparison table */}
        {reportA && reportB && !loadingA && !loadingB && (
          <>
            {/* Overall winner banner */}
            {ow && (
              <div style={{ background: ow === 'tie' ? subtle : (ow === 'A' ? '#22c55e15' : '#3b82f615'), border: `1px solid ${ow === 'tie' ? border : (ow === 'A' ? '#22c55e40' : '#3b82f640')}`, borderRadius: 14, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div><DimIcon name={ow === 'tie' ? 'tie' : 'trophy'} size={24} color={ow === 'tie' ? muted : '#22c55e'} /></div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: text }}>
                    {ow === 'tie' ? 'Both areas are equally matched'
                      : `${ow === 'A' ? metaA.name : metaB.name} wins overall`}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: muted }}>
                    {ow === 'tie'
                      ? `Both score ${reportA.nqi_composite}/100`
                      : `NQI ${ow === 'A' ? reportA.nqi_composite : reportB.nqi_composite} vs ${ow === 'A' ? reportB.nqi_composite : reportA.nqi_composite} — ${Math.abs(reportA.nqi_composite - reportB.nqi_composite)} point difference`}
                  </p>
                </div>
              </div>
            )}

            {/* NQI header cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, marginBottom: 12, alignItems: 'stretch' }}>
              {[['A', reportA, metaA], ['B', reportB, metaB]].map(([side, rpt, meta], idx) => (
                <>
                  {idx === 1 && <div/>}
                  <div key={side} style={{ background: card, border: `2px solid ${ow === side ? ACCENT : border}`, borderRadius: 14, padding: 20, position: 'relative', overflow: 'hidden' }}>
                    {ow === side && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: ACCENT }}/>}
                    <p style={{ margin: '0 0 2px', fontSize: 11, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{meta.area}</p>
                    <h3 style={{ margin: '0 0 2px', fontSize: 18, fontWeight: 800, color: text, letterSpacing: '-0.3px' }}>{meta.name}</h3>
                    <p style={{ margin: '0 0 14px', fontSize: 12, color: muted }}>Pin {rpt.pin_code}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 40, fontWeight: 900, color: GRADE_COLOR[rpt.grade] || text, lineHeight: 1 }}>{rpt.nqi_composite}</span>
                      <span style={{ fontSize: 18, fontWeight: 700, color: GRADE_COLOR[rpt.grade] || text }}>{rpt.grade}</span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: muted }}>NQI Score</p>
                  </div>
                </>
              ))}
            </div>

            {/* Dimension by dimension */}
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', background: subtle, padding: '10px 20px', borderBottom: `1px solid ${border}` }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: text }}>{metaA.name}</span>
                <span style={{ fontSize: 11, color: muted, textAlign: 'center', minWidth: 80 }}>Dimension</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: text, textAlign: 'right' }}>{metaB.name}</span>
              </div>

              {allDims.map((dim, i) => {
                const a = reportA.scores?.[dim]
                const b = reportB.scores?.[dim]
                const w = winner(dim)
                return (
                  <div key={dim} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '14px 20px', borderBottom: i < allDims.length - 1 ? `1px solid ${border}` : 'none', alignItems: 'center' }}>

                    {/* A score */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, maxWidth: 120 }}>
                        <div style={{ background: subtle, borderRadius: 99, height: 6, overflow: 'hidden', marginBottom: 4 }}>
                          <div style={{ width: (a || 0) + '%', height: '100%', background: a !== undefined ? scoreColor(a) : '#ccc', borderRadius: 99, transition: 'width 0.6s ease' }}/>
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 800, color: a !== undefined ? scoreColor(a) : muted }}>
                          {a !== undefined ? a : '—'}
                        </span>
                        {w === 'A' && a !== undefined && <span style={{ marginLeft: 6, fontSize: 10, background: '#22c55e20', color: '#22c55e', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>BETTER</span>}
                      </div>
                    </div>

                    {/* Dimension label */}
                    <div style={{ textAlign: 'center', minWidth: 80 }}>
                      <div><DimIcon name={dim} size={16} color={ACCENT} /></div>
                      <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{DIM_LABEL[dim]}</div>
                    </div>

                    {/* B score */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexDirection: 'row-reverse' }}>
                      <div style={{ flex: 1, maxWidth: 120, textAlign: 'right' }}>
                        <div style={{ background: subtle, borderRadius: 99, height: 6, overflow: 'hidden', marginBottom: 4 }}>
                          <div style={{ width: (b || 0) + '%', height: '100%', background: b !== undefined ? scoreColor(b) : '#ccc', borderRadius: 99, transition: 'width 0.6s ease', marginLeft: 'auto' }}/>
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 800, color: b !== undefined ? scoreColor(b) : muted }}>
                          {b !== undefined ? b : '—'}
                        </span>
                        {w === 'B' && b !== undefined && <span style={{ marginLeft: 6, fontSize: 10, background: '#22c55e20', color: '#22c55e', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>BETTER</span>}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Monsoon waterlogging — surfaced explicitly (Issue #8). Field is
                  inverted: 5 = safest, 1 = high flood risk. */}
              {(reportA.waterlogging_risk != null || reportB.waterlogging_risk != null) && (() => {
                const lvl = wl => wl == null ? '—' : wl >= 5 ? 'Very low' : wl >= 4 ? 'Low' : wl >= 3 ? 'Moderate' : wl >= 2 ? 'High' : 'Very high'
                const col = wl => wl == null ? muted : wl >= 4 ? '#22c55e' : wl >= 3 ? '#eab308' : '#ef4444'
                const a = reportA.waterlogging_risk, b = reportB.waterlogging_risk
                const w = (a == null || b == null) ? null : (a > b ? 'A' : b > a ? 'B' : 'tie')
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '14px 20px', borderTop: `1px solid ${border}`, alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 15, fontWeight: 800, color: col(a) }}>{lvl(a)} risk</span>
                      {w === 'A' && <span style={{ marginLeft: 6, fontSize: 10, background: '#22c55e20', color: '#22c55e', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>SAFER</span>}
                    </div>
                    <div style={{ textAlign: 'center', minWidth: 80 }}>
                      <div><DimIcon name="water" size={16} color={ACCENT} /></div>
                      <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>Waterlogging</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {w === 'B' && <span style={{ marginRight: 6, fontSize: 10, background: '#22c55e20', color: '#22c55e', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>SAFER</span>}
                      <span style={{ fontSize: 15, fontWeight: 800, color: col(b) }}>{lvl(b)} risk</span>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Summary text */}
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: text }}>Summary</p>
              <div style={{ fontSize: 13, color: muted, lineHeight: 1.8 }}>
                {allDims.map(dim => {
                  const a = reportA.scores?.[dim]
                  const b = reportB.scores?.[dim]
                  const w = winner(dim)
                  if (!a && !b) return null
                  return (
                    <p key={dim} style={{ margin: '0 0 4px' }}>
                      <strong style={{ color: text }}>{DIM_LABEL[dim]}:</strong>{' '}
                      {w === 'tie' ? `Both areas score equally (${a}/100)` :
                       w === 'A' ? `${metaA.name} is better (${a} vs ${b ?? '—'})` :
                       `${metaB.name} is better (${b} vs ${a ?? '—'})`}
                    </p>
                  )
                })}
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[[reportA, metaA], [reportB, metaB]].map(([rpt, meta]) => (
                <Link key={rpt.pin_code} href={`/report?pin=${rpt.pin_code}`}
                  style={{ display: 'block', padding: '12px 16px', background: ACCENT, color: 'white', borderRadius: 10, textDecoration: 'none', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
                  Full report: {meta.name} →
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!reportA && !reportB && !loadingA && !loadingB && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: muted }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom: 12 }}><DimIcon name="compare" size={36} color={muted} /></div>
            <p style={{ fontSize: 15, fontWeight: 600, color: text, marginBottom: 6 }}>Pick two areas to compare</p>
            <p style={{ fontSize: 13 }}>Search for any two Delhi NCR neighbourhoods above</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
              {[['Hauz Khas','110016','Rohini','110085'],['Vasant Kunj','110070','Dwarka','110078'],['Gurugram','122001','Noida','201301']].map(([n1,p1,n2,p2]) => (
                <button key={p1} onClick={() => { setQA(n1); setQB(n2); fetchFor(p1,'A'); fetchFor(p2,'B') }}
                  style={{ padding: '6px 14px', background: 'none', border: `1px solid ${border}`, borderRadius: 20, fontSize: 12, cursor: 'pointer', color: muted }}>
                  {n1} vs {n2}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
