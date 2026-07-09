import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

const ANIM_CSS = `
* { box-sizing: border-box; }
body { margin: 0; padding: 0; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.hero-gradient-dark {
  background: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(226,55,68,0.18) 0%, transparent 70%),
              radial-gradient(ellipse 60% 40% at 80% 20%, rgba(120,20,40,0.12) 0%, transparent 60%);
}
.hero-gradient-light {
  background: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(226,55,68,0.07) 0%, transparent 65%);
}
.report-grid { display: block; }
.report-left { width: 100%; }
@media (min-width: 960px) {
  .report-wrap { max-width: 100% !important; padding: 0 40px !important; }
  .landing-wrap { max-width: 900px !important; }
  .report-grid {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 28px;
    align-items: start;
  }
  .report-left { width: auto; }
  .report-topbar { padding: 20px 0 12px !important; }
  .hero-title { font-size: 58px !important; }
  .hero-sub   { font-size: 19px !important; }
}
`

const DIM_LABEL = { crime:'Safety', infrastructure:'Infrastructure', air:'Air Quality', power:'Power', schools:'Schools' }
const DIM_ICON  = { crime:'🛡', infrastructure:'🏗', air:'🌬', power:'⚡', schools:'🎓' }
const DIM_DESC  = {
  crime:          'Delhi Police Annual Report 2022-23 · Estimated, last verified 2023',
  infrastructure: 'DDA Master Plan 2021 · DMRC Phase 4 · Estimated, last verified 2024',
  air:            'CPCB live AQI via data.gov.in · Updated daily · Live data',
  power:          'BSES / Tata Power / DHBVN annual reports · Estimated, last verified 2023',
  schools:        'CBSE affiliation database · Estimated, last verified 2023',
}

const DIM_TAG = {
  crime:          { label:'Est. 2023',  color:'#f97316' },
  infrastructure: { label:'Est. 2024',  color:'#f97316' },
  air:            { label:'Live',        color:'#22c55e' },
  power:          { label:'Est. 2023',  color:'#f97316' },
  schools:        { label:'Est. 2023',  color:'#f97316' },
}

// User-facing reweighting — lets a visitor see the score through a
// different lens than the default methodology (scoring.py WEIGHTS).
// "Custom" starts from the Default preset and the sliders let someone
// drag freely; weights are normalized to 100% at compute time rather
// than forcing sliders to interlock, so dragging one never fights you.
const WEIGHT_PRESETS = {
  Default:  { crime:30, infrastructure:25, air:20, power:15, schools:10 },
  Family:   { crime:25, infrastructure:15, air:15, power:10, schools:35 },
  Investor: { crime:15, infrastructure:35, air:10, power:25, schools:15 },
  Safety:   { crime:50, infrastructure:20, air:15, power:10, schools:5  },
}

function normalizedWeights(weights, availableKeys) {
  const total = availableKeys.reduce((s, k) => s + (weights[k] || 0), 0)
  if (!total) return {}
  const out = {}
  availableKeys.forEach(k => { out[k] = (weights[k] || 0) / total })
  return out
}

function weightedComposite(scores, weights, availableKeys) {
  const norm = normalizedWeights(weights, availableKeys)
  let sum = 0
  availableKeys.forEach(k => { sum += scores[k] * (norm[k] || 0) })
  return Math.round(sum)
}

// Mirrors scoring.py's GRADES thresholds so a recomputed score gets a
// consistent letter grade instead of just showing a bare number.
const GRADE_THRESHOLDS = [[90,'A+'],[80,'A'],[70,'B+'],[60,'B'],[50,'C+'],[40,'C'],[0,'D']]
function gradeFor(score) {
  if (score == null) return null
  for (const [min, label] of GRADE_THRESHOLDS) if (score >= min) return label
  return 'D'
}

// Minimal line-icon set replacing emoji, one per data dimension — flat
// stroke icons at 1.6px weight so they sit quietly alongside the rest of
// the UI instead of looking like a different design language.
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
    case 'connectivity':
      return <svg {...p}><circle cx="5" cy="12" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 12l10-6M7 12l10 6"/></svg>
    case 'sewerage':
      return <svg {...p}><path d="M6 4v6a6 6 0 0 0 12 0V4"/><path d="M4 20h16"/></svg>
    case 'metro':
      return <svg {...p}><rect x="5" y="4" width="14" height="12" rx="3"/><path d="M5 12h14"/><circle cx="9" cy="20" r="1.3"/><circle cx="15" cy="20" r="1.3"/></svg>
    case 'car':
      return <svg {...p}><path d="M4 16l1.4-4.8A2 2 0 0 1 7.3 9.8h9.4a2 2 0 0 1 1.9 1.4L20 16"/><rect x="3" y="16" width="18" height="4" rx="1.5"/><circle cx="7.5" cy="20" r="1.3"/><circle cx="16.5" cy="20" r="1.3"/></svg>
    case 'distance':
      return <svg {...p}><rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/></svg>
    case 'fare':
      return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M8 8h8M8 8l6 8M8 11.5h5"/></svg>
    case 'pin':
      return <svg {...p}><path d="M12 21s7-6.7 7-12a7 7 0 1 0-14 0c0 5.3 7 12 7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>
    case 'lock':
      return <svg {...p}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></svg>
    case 'sun':
      return <svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2.5v3M12 18.5v3M3.8 3.8l2.1 2.1M18.1 18.1l2.1 2.1M2.5 12h3M18.5 12h3M3.8 20.2l2.1-2.1M18.1 5.9l2.1-2.1"/></svg>
    case 'moon':
      return <svg {...p}><path d="M20 14.2A8.3 8.3 0 1 1 9.8 4a6.8 6.8 0 0 0 10.2 10.2Z"/></svg>
    case 'compare':
      return <svg {...p}><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="M16 21l4-4-4-4"/><path d="M20 17H4"/></svg>
    default:
      return null
  }
}

const PIN_META = {
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
  "110034":{ name:"Pitampura",         area:"North West Delhi" },
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
  "110091":{ name:"Mayur Vihar",       area:"East Delhi" },
  "110092":{ name:"Patparganj",        area:"East Delhi" },
  "110094":{ name:"Sonia Vihar",       area:"North East Delhi" },
  "110095":{ name:"Vivek Vihar",       area:"East Delhi" },
  "121001":{ name:"Faridabad",         area:"Haryana NCR" },
  "121002":{ name:"Faridabad NIT",     area:"Haryana NCR" },
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
  // NCR fringe — in our coverage zone but no data yet
  "122505":{ name:"Mahendragarh",      area:"Haryana NCR" },
  "122502":{ name:"Rewari",            area:"Haryana NCR" },
  "122108":{ name:"Taoru",             area:"Haryana NCR" },
  "122101":{ name:"Sohna",             area:"Haryana NCR" },
  "122103":{ name:"Gurgaon South",     area:"Haryana NCR" },
  "123001":{ name:"Jhajjar",           area:"Haryana NCR" },
  "123401":{ name:"Rewari Town",       area:"Haryana NCR" },
  "131029":{ name:"Kundli",            area:"Haryana NCR" },
  "131027":{ name:"Murthal",           area:"Haryana NCR" },
  "201102":{ name:"Loni",              area:"UP NCR" },
  "201014":{ name:"Indirapuram",       area:"UP NCR" },
  "201012":{ name:"Vasundhara",        area:"UP NCR" },
  "201016":{ name:"Crossing Republik", area:"UP NCR" },
  "201002":{ name:"Raj Nagar",         area:"UP NCR" },
  "201010":{ name:"Kaushambi",         area:"UP NCR" },
  "201206":{ name:"Muradnagar",        area:"UP NCR" },
  "245101":{ name:"Hapur",             area:"UP NCR" },
  "203001":{ name:"Bulandshahr",       area:"UP NCR" },
}

// Build reverse lookup: name/area keywords → pin code
const NAME_TO_PIN = {}
Object.entries(PIN_META).forEach(([pin, {name, area}]) => {
  const key = name.toLowerCase()
  const akey = area.toLowerCase()
  NAME_TO_PIN[key] = pin
  // also index first word
  NAME_TO_PIN[key.split(' ')[0]] = pin
  // area-level
  if (!NAME_TO_PIN[akey]) NAME_TO_PIN[akey] = pin
})

function searchPin(query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  // exact pin code
  if (/^\d{6}$/.test(q)) return [{pin: q, name: PIN_META[q]?.name || q, area: PIN_META[q]?.area || ''}]
  // fuzzy match on name + area
  return Object.entries(PIN_META)
    .filter(([pin, {name, area}]) =>
      name.toLowerCase().includes(q) || area.toLowerCase().includes(q) || pin.includes(q)
    )
    .map(([pin, {name, area}]) => ({pin, name, area}))
    .slice(0, 6)
}


const GRADE_COLOR = {
  'A+':'#22c55e','A':'#22c55e','B+':'#84cc16',
  'B':'#eab308','C+':'#f97316','C':'#ef4444','D':'#dc2626'
}

const ACCENT = '#e23744'

function getVerdict(scores, composite) {
  if (composite >= 75) return { label:"Strong buy",    color:"#22c55e", reason:"This neighborhood scores well across safety, infrastructure and environment — above NCR average on most dimensions." }
  if (composite >= 60) return { label:"Consider",      color:"#eab308", reason:"Decent overall but has some weak spots. Review each dimension carefully before deciding." }
  if (scores.crime !== undefined && scores.crime < 30)
                        return { label:"High risk",     color:"#ef4444", reason:"Safety score is significantly below NCR average. Crime rates are high for this area." }
  if (composite >= 45) return { label:"Below average", color:"#f97316", reason:"Scores below the NCR average of 68. Compare with nearby areas before committing." }
  return               { label:"Avoid",                color:"#ef4444", reason:"Multiple dimensions score poorly. Strongly recommend comparing alternatives." }
}

function getHighlights(record, scores) {
  const good = [], bad = []
  if (scores.crime >= 80)  good.push("Very low crime — one of the safer areas in Delhi NCR")
  else if (scores.crime !== undefined && scores.crime < 40) bad.push("High crime rate — significantly above NCR average")
  if (scores.infrastructure >= 70) good.push("Excellent connectivity — metro and highway access")
  else if (scores.infrastructure !== undefined && scores.infrastructure < 40) bad.push("Poor connectivity — limited metro or highway access")
  if (record.metro_planned_stations > 0) good.push(`Metro expansion coming — ${record.metro_planned_stations} station(s) approved nearby`)
  if (record.metro_stations_nearby > 0)  good.push(`${record.metro_stations_nearby} operational metro station(s) in area`)
  if (record.smart_city_project) good.push("Smart Cities Mission coverage — infrastructure investment expected")
  if (record.zone_type === "Residential") good.push("DDA residential zone — lower commercial encroachment risk")
  if (record.zone_type === "Industrial")  bad.push("Industrial zone — noise and pollution concerns")
  if (scores.air >= 80) good.push("Clean air — AQI consistently Good or Satisfactory")
  else if (scores.air !== undefined && scores.air < 50) bad.push("Poor air quality — AQI frequently in Poor range")
  if (scores.power >= 70) good.push("Reliable power supply — low outage frequency")
  else if (scores.power !== undefined && scores.power < 40) bad.push("Frequent power cuts — high outage hours reported")
  return { good, bad }
}

function TagBadge({ tag, card, border, dark, muted, text }) {
  const [show, setShow] = useState(false)
  const isLive = tag.label === 'Live'
  const tooltip = isLive
    ? 'This score uses real-time data pulled directly from government APIs (CPCB). It reflects current conditions and is refreshed daily.'
    : `This score is estimated from publicly available government reports (${tag.label.replace('Est. ','')}). It is not a live feed — data may not reflect current conditions. Always verify independently before making a property decision.`

  return (
    <span style={{ position:'relative', display:'inline-flex', alignItems:'center' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{ fontSize:9, fontWeight:700, color:tag.color, background:tag.color+'20', padding:'1px 5px', borderRadius:3, cursor:'help' }}>
        {tag.label}
      </span>
      {show && (
        <span style={{
          position:'absolute', bottom:'calc(100% + 6px)', left:0, zIndex:300,
          background: dark ? '#1e1e1e' : '#ffffff',
          border:`1px solid ${border}`,
          borderRadius:10, padding:'10px 12px',
          width:220, boxShadow:'0 8px 24px rgba(0,0,0,0.18)',
          pointerEvents:'none', display:'block',
        }}>
          <span style={{ position:'absolute', bottom:-6, left:10, width:10, height:10, background: dark?'#1e1e1e':'#ffffff', border:`1px solid ${border}`, borderTop:'none', borderLeft:'none', transform:'rotate(45deg)', display:'block' }}/>
          <span style={{ fontSize:11, fontWeight:700, color:tag.color, display:'block', marginBottom:4 }}>{isLive ? 'Live data' : 'Estimated data'}</span>
          <span style={{ fontSize:11, color: dark?'#c0c0c0':'#444', lineHeight:1.6, display:'block' }}>{tooltip}</span>
        </span>
      )}
    </span>
  )
}

function InfoBox({ label, val, tooltip, subtle, muted, text, card, border, dark }) {
  const [show, setShow] = useState(false)
  const hasTooltip = !!tooltip

  return (
    <div
      style={{ background:subtle, borderRadius:8, padding:'10px 12px', position:'relative', cursor: hasTooltip ? 'help' : 'default', transition:'background 0.15s', outline: show ? `2px solid #e23744` : 'none' }}
      onMouseEnter={() => hasTooltip && setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <p style={{ margin:0, fontSize:10, color:muted, textTransform:'uppercase', letterSpacing:'0.04em', display:'flex', alignItems:'center', gap:4 }}>
        {label}
        {hasTooltip && <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:13, height:13, background:'#e2374430', borderRadius:'50%', fontSize:9, color:'#e23744', fontWeight:700, flexShrink:0 }}>?</span>}
      </p>
      <p style={{ margin:'4px 0 0', fontSize:14, fontWeight:600, color:text }}>{val}</p>

      {show && hasTooltip && (
        <div style={{
          position:'absolute', bottom:'calc(100% + 8px)', left:0, zIndex:200,
          background: dark ? '#1e1e1e' : '#ffffff',
          border:`1px solid ${border}`,
          borderRadius:10, padding:'12px 14px',
          width:260, boxShadow:'0 8px 24px rgba(0,0,0,0.18)',
          pointerEvents:'none',
        }}>
          <div style={{ position:'absolute', bottom:-6, left:16, width:10, height:10, background: dark ? '#1e1e1e' : '#ffffff', border:`1px solid ${border}`, borderTop:'none', borderLeft:'none', transform:'rotate(45deg)' }}/>
          {tooltip.split('\n').map((line, i) => (
            line === '' ? <div key={i} style={{ height:6 }}/> :
            line.startsWith('•') ? <p key={i} style={{ margin:0, fontSize:12, color: dark?'#c0c0c0':'#444', lineHeight:1.6 }}>{line}</p> :
            <p key={i} style={{ margin:0, fontSize:12, fontWeight: i===0?600:400, color: i===0?(dark?'#f0f0f0':'#111'):(dark?'#c0c0c0':'#444'), lineHeight:1.6 }}>{line}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function SchoolRow({ s, i, dark, border, text, muted, subtle }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10,
      padding:'9px 0',
      borderBottom:`1px solid ${border}`,
    }}>
      <div style={{
        minWidth:20, height:20, borderRadius:'50%',
        background: i < 3 ? '#e23744' : subtle,
        color: i < 3 ? 'white' : muted,
        fontSize:10, fontWeight:700,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      }}>{i + 1}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:0, fontSize:12, fontWeight:600, color:text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {s.name || 'Unknown School'}
        </p>
        {s.address && (
          <p style={{ margin:'1px 0 0', fontSize:11, color:muted, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {s.address}
          </p>
        )}
      </div>
      <span style={{ fontSize:10, fontWeight:600, padding:'1px 6px', borderRadius:4, background:'#22c55e20', color:'#22c55e', flexShrink:0 }}>CBSE</span>
    </div>
  )
}

function SchoolList({ schools, dark, card, border, text, muted, subtle }) {
  const [expanded, setExpanded] = useState(false)
  const top3 = schools.slice(0, 3)
  const rest  = schools.slice(3)

  return (
    <div>
      <p style={{ margin:'0 0 4px', fontSize:11, color:muted, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>
        Nearby schools
      </p>
      {top3.map((s, i) => (
        <SchoolRow key={i} s={s} i={i} dark={dark} border={border} text={text} muted={muted} subtle={subtle} />
      ))}

      {rest.length > 0 && (
        <>
          {expanded && rest.map((s, i) => (
            <SchoolRow key={i+3} s={s} i={i+3} dark={dark} border={border} text={text} muted={muted} subtle={subtle} />
          ))}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              marginTop:8, width:'100%', padding:'7px 0',
              background:'none', border:`1px solid ${border}`,
              borderRadius:8, fontSize:12, color:muted,
              cursor:'pointer', display:'flex', alignItems:'center',
              justifyContent:'center', gap:4,
            }}
          >
            {expanded ? `▲ Show less` : `▾ Show ${rest.length} more school${rest.length > 1 ? 's' : ''}`}
          </button>
        </>
      )}
      <p style={{ margin:'8px 0 0', fontSize:10, color:muted, fontStyle:'italic' }}>
        Source: CBSE Affiliation Database · Est. 2018
      </p>
    </div>
  )
}

// ── Pin code approximate coordinates (lat, lon) ──────────────────────────────
const PIN_COORDS = {
  "110002":[28.6289,77.2410],"110003":[28.5931,77.2196],"110005":[28.6514,77.1907],
  "110006":[28.6562,77.2310],"110007":[28.6878,77.2091],"110008":[28.6415,77.1521],
  "110009":[28.7197,77.1925],"110010":[28.5986,77.1637],"110012":[28.6364,77.1522],
  "110016":[28.5494,77.2001],"110017":[28.5244,77.2167],"110018":[28.6278,77.0455],
  "110019":[28.5823,77.0559],"110020":[28.5356,77.2720],"110021":[28.5782,77.1677],
  "110022":[28.5672,77.1748],"110024":[28.5677,77.2411],"110025":[28.5362,77.2503],
  "110026":[28.6677,77.1267],"110032":[28.6469,77.3152],"110033":[28.7289,77.1628],
  "110034":[28.7045,77.1304],"110036":[28.7997,77.1498],"110037":[28.5562,77.0882],
  "110039":[28.7790,77.0394],"110040":[28.8533,77.1005],"110041":[28.6765,77.0279],
  "110042":[28.7495,77.1128],"110043":[28.6108,76.9794],"110044":[28.4748,77.2594],
  "110049":[28.5508,77.2259],"110052":[28.6916,77.1805],"110053":[28.6853,77.2879],
  "110058":[28.6218,77.0840],"110063":[28.6688,77.1094],"110065":[28.6290,77.2956],
  "110067":[28.5398,77.1674],"110068":[28.5021,77.1788],"110070":[28.5215,77.1541],
  "110073":[28.6191,77.0264],"110077":[28.5834,77.0609],"110078":[28.5924,77.0558],
  "110084":[28.7511,77.2086],"110085":[28.7152,77.1108],"110091":[28.6135,77.3155],
  "110092":[28.6302,77.2951],"110094":[28.7269,77.2682],"110095":[28.6714,77.3041],
  "121001":[28.4089,77.3178],"121002":[28.3838,77.3159],"122001":[28.4595,77.0266],
  "122002":[28.4950,77.0888],"122003":[28.4228,77.0512],"122051":[28.3591,76.9378],
  "122101":[28.3893,77.0472],"122103":[28.4027,77.0299],"122107":[31.0158,76.9914],
  "122108":[28.3312,77.0821],"122413":[28.4025,76.9942],"122502":[28.2043,76.6191],
  "122505":[28.0001,76.1447],"123001":[28.6009,76.6551],"123106":[28.2040,76.6234],
  "123401":[28.1960,76.6194],"124001":[28.9284,76.5766],"124507":[28.5271,76.9455],
  "125050":[29.5141,75.4599],"125055":[29.5353,75.0246],"131001":[28.9947,77.0151],
  "131027":[28.9672,77.0946],"131029":[28.8783,77.1034],"132103":[29.3909,76.9635],
  "135001":[30.1290,77.2819],"201001":[28.6692,77.4538],"201002":[28.6600,77.4140],
  "201010":[28.6452,77.3273],"201012":[28.6600,77.3534],"201014":[28.6412,77.3669],
  "201016":[28.6280,77.4420],"201102":[28.7494,77.2881],"201206":[28.7730,77.4930],
  "201301":[28.5706,77.3248],"201304":[28.4830,77.4170],"201309":[28.6270,77.3680],
  "203001":[28.4070,77.8490],"245101":[28.7300,77.7760],
}

// Metro connectivity — which pins are within ~2km of a metro station
const METRO_PINS = new Set([
  "110002","110003","110005","110006","110007","110009","110012","110016","110017",
  "110019","110020","110021","110022","110024","110025","110026","110032","110034",
  "110037","110041","110044","110049","110052","110058","110063","110067","110070",
  "110077","110078","110084","110085","110091","110092","110095",
  "122001","122002","122003","201001","201010","201012","201014","201301","201309",
])

// Peak hour multiplier by time of day
const PEAK_MULTIPLIER = 2.2   // Delhi peak traffic adds ~2.2x to free-flow time
const OFFPEAK_MULTIPLIER = 1.2

function InfoTooltip({ text, dark }) {
  const [show, setShow] = React.useState(false)
  return (
    <span style={{ position:'relative', display:'inline-flex', alignItems:'center' }}>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        style={{
          width:18, height:18, borderRadius:'50%',
          background: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
          color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          border:'none', cursor:'pointer', fontSize:11, fontWeight:700,
          display:'flex', alignItems:'center', justifyContent:'center',
          lineHeight:1, padding:0, fontFamily:'Georgia, serif',
        }}
      >?</button>
      {show && (
        <div style={{
          position:'absolute', bottom:'calc(100% + 8px)', left:'50%',
          transform:'translateX(-50%)',
          background: dark ? '#1e1e1e' : '#fff',
          border:`1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius:10, padding:'10px 14px',
          width:260, zIndex:200,
          boxShadow:'0 8px 24px rgba(0,0,0,0.3)',
          fontSize:12,
          color: dark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)',
          lineHeight:1.6,
          pointerEvents:'none',
        }}>
          {text}
          <div style={{
            position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)',
            width:0, height:0,
            borderLeft:'6px solid transparent',
            borderRight:'6px solid transparent',
            borderTop:`6px solid ${dark ? '#1e1e1e' : '#fff'}`,
          }}/>
        </div>
      )}
    </span>
  )
}

function CommuteChecker({ fromPin, fromName, dark }) {
  const [officeQ, setOfficeQ]       = React.useState('')
  const [suggestions, setSuggestions] = React.useState([])
  const [toPin, setToPin]           = React.useState(null)
  const [toName, setToName]         = React.useState('')
  const [result, setResult]         = React.useState(null)
  const [loading, setLoading]       = React.useState(false)
  const [focused, setFocused]       = React.useState(false)

  const bg     = dark ? '#111' : '#fff'
  const card   = dark ? '#161616' : '#f8f8f8'
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const text   = dark ? '#f0ede8' : '#111'
  const muted  = dark ? '#9a9a9a' : '#666'
  const accent = '#e23744'

  function onSearch(v) {
    setOfficeQ(v)
    setResult(null)
    if (v.trim().length < 2) { setSuggestions([]); return }
    const s = v.toLowerCase()
    const hits = Object.entries(PIN_META)
      .filter(([p, m]) => m.name.toLowerCase().includes(s) || p.includes(s))
      .slice(0, 6)
    setSuggestions(hits)
  }

  function selectOffice(pin, name) {
    setToPin(pin); setToName(name)
    setOfficeQ(name); setSuggestions([])
    computeCommute(pin, name)
  }

  function computeCommute(pin, name) {
    setLoading(true); setResult(null)
    const fromCoords = PIN_COORDS[fromPin]
    const toCoords   = PIN_COORDS[pin]
    if (!fromCoords || !toCoords) {
      setResult({ error: 'Coordinates not available for one of these areas.' })
      setLoading(false); return
    }

    // Haversine distance in km
    const R = 6371
    const dLat = (toCoords[0]-fromCoords[0]) * Math.PI/180
    const dLon = (toCoords[1]-fromCoords[1]) * Math.PI/180
    const a = Math.sin(dLat/2)**2 + Math.cos(fromCoords[0]*Math.PI/180)*Math.cos(toCoords[0]*Math.PI/180)*Math.sin(dLon/2)**2
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    // Road distance ≈ 1.3× straight-line for Delhi grid
    const roadKm = dist * 1.35

    // Free-flow speed ~35 km/h in Delhi inner, ~50 on outer
    const freeFlowSpeed = roadKm < 15 ? 30 : 40
    const freeFlowMins  = Math.round((roadKm / freeFlowSpeed) * 60)
    const peakMins      = Math.round(freeFlowMins * PEAK_MULTIPLIER)
    const offPeakMins   = Math.round(freeFlowMins * OFFPEAK_MULTIPLIER)

    // Auto cost: ₹25 base + ₹15/km, shared auto cheaper
    const autoCost = Math.round(25 + roadKm * 15)

    // Metro — check if both ends have metro
    const fromMetro = METRO_PINS.has(fromPin)
    const toMetro   = METRO_PINS.has(pin)
    const metroAvailable = fromMetro && toMetro

    // Broker claim: they typically quote Google Maps off-peak
    const brokerClaim = offPeakMins

    // Verdict
    const diff = peakMins - brokerClaim
    const verdict = diff > 30 ? 'Severely misleading' : diff > 15 ? 'Optimistic' : diff > 5 ? 'Slightly optimistic' : 'Accurate'
    const verdictColor = diff > 30 ? '#ef4444' : diff > 15 ? '#f97316' : diff > 5 ? '#eab308' : '#22c55e'

    setTimeout(() => {
      setResult({ dist: roadKm.toFixed(1), peakMins, offPeakMins, autoCost, metroAvailable, fromMetro, toMetro, brokerClaim, verdict, verdictColor, diff })
      setLoading(false)
    }, 600)
  }

  const fmt = m => m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m} min`

  return (
    <div style={{ background:card, border:`1px solid ${border}`, borderRadius:16, padding:24, marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <div style={{ width:4, height:18, background:accent, borderRadius:2 }}/>
        <p style={{ margin:0, fontSize:16, fontWeight:700, color:text, letterSpacing:'-0.2px' }}>Commute Reality Check</p>
        <span style={{ fontSize:11, padding:'3px 8px', background:accent+'22', color:accent, borderRadius:99, fontWeight:600 }}>NEW</span>
        <InfoTooltip dark={dark} text="Brokers always quote Google Maps off-peak times — usually 6am on a Sunday. This tool shows you real peak-hour commute estimates (8–10am weekdays) from this area to your office, based on Delhi traffic patterns. The difference is often 2× or more." />
      </div>
      <p style={{ margin:'0 0 14px', fontSize:15, color:dark?'rgba(255,255,255,0.75)':'rgba(0,0,0,0.7)', lineHeight:1.6 }}>
        How long does it <strong style={{color:text}}>actually</strong> take to reach your office from <strong style={{color:accent}}>{fromName}</strong>? Brokers quote off-peak times. We show you peak-hour reality.
      </p>

      {/* Office search */}
      <div style={{ position:'relative', marginBottom: result ? 16 : 0 }}>
        <div style={{ display:'flex', gap:8 }}>
          <input
            value={officeQ}
            onChange={e => onSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => { setFocused(false); setSuggestions([]) }, 150)}
            placeholder="Enter your office area or pin code…"
            style={{
              flex:1, padding:'11px 14px', background:dark?'#1a1a1a':'#fff',
              border:`1px solid ${border}`, borderRadius:10, color:text,
              fontSize:14, outline:'none', fontFamily:'inherit'
            }}
          />
          {loading && <div style={{ padding:'11px 14px', color:muted, fontSize:13 }}>Calculating…</div>}
        </div>
        {suggestions.length > 0 && focused && (
          <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:100, background:dark?'#1a1a1a':'#fff', border:`1px solid ${border}`, borderRadius:10, overflow:'hidden', marginTop:4, boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
            {suggestions.map(([p, m]) => (
              <div key={p} onMouseDown={() => selectOffice(p, m.name)}
                style={{ padding:'10px 14px', cursor:'pointer', display:'flex', justifyContent:'space-between', fontSize:13, borderBottom:`1px solid ${border}` }}
                onMouseEnter={e => e.currentTarget.style.background=accent+'15'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <span style={{color:text,fontWeight:500}}>{m.name}</span>
                <span style={{color:muted,fontSize:11,fontFamily:'monospace'}}>{p}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Result */}
      {result && !result.error && (
        <div style={{ animation:'fadeUp 0.4s ease both' }}>
          {/* Verdict banner */}
          <div style={{ background:result.verdictColor+'18', border:`1px solid ${result.verdictColor}44`, borderRadius:10, padding:'10px 14px', marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <span style={{ fontSize:12, color:muted }}>Broker's claim vs reality</span>
              <div style={{ fontSize:15, fontWeight:700, color:result.verdictColor, marginTop:2 }}>
                {result.verdict} — brokers claim {fmt(result.brokerClaim)}, reality is {fmt(result.peakMins)} in peak hours
              </div>
            </div>
          </div>

          {/* Commute cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:8, marginBottom:12 }}>
            {[
              { icon:'car',      label:'Peak hours', val:fmt(result.peakMins), sub:'8–10am / 5–8pm', color:'#ef4444' },
              { icon:'car',      label:'Off-peak', val:fmt(result.offPeakMins), sub:'What brokers quote', color:'#22c55e' },
              { icon:'distance', label:'Road distance', val:`${result.dist} km`, sub:'Approx via road', color:accent },
              { icon:'fare',     label:'Auto fare', val:`₹${result.autoCost}`, sub:'One way estimate', color:'#f97316' },
            ].map(({ icon, label, val, sub, color }) => (
              <div key={label} style={{ background:dark?'#1a1a1a':'#fff', border:`1px solid ${border}`, borderRadius:10, padding:'12px 14px' }}>
                <div style={{ marginBottom:4 }}><DimIcon name={icon} size={16} color={color} /></div>
                <div style={{ fontSize:18, fontWeight:700, color, lineHeight:1 }}>{val}</div>
                <div style={{ fontSize:11, color:muted, marginTop:3 }}>{label}</div>
                <div style={{ fontSize:10, color:muted, opacity:0.6 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Metro */}
          <div style={{ background:dark?'#1a1a1a':'#fff', border:`1px solid ${border}`, borderRadius:10, padding:'12px 14px', display:'flex', gap:12, alignItems:'center' }}>
            <DimIcon name="metro" size={20} color={accent} />
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:text }}>
                {result.metroAvailable ? 'Metro available at both ends' : !result.fromMetro ? `No metro near ${fromName}` : `No metro near ${toName}`}
              </div>
              <div style={{ fontSize:12, color:muted, marginTop:2 }}>
                {result.metroAvailable ? 'Delhi Metro is usually faster than road during peak hours' : 'You will need to rely on road transport'}
              </div>
            </div>
            <div style={{ marginLeft:'auto', fontSize:13, fontWeight:700, color:result.metroAvailable?'#22c55e':'#ef4444' }}>
              {result.metroAvailable ? '✓' : '✗'}
            </div>
          </div>

          <p style={{ fontSize:11, color:muted, marginTop:10, lineHeight:1.5 }}>
            * Peak time estimates based on Delhi traffic patterns. Road distance is approximate. Actual commute may vary with route and mode.
          </p>
        </div>
      )}
      {result?.error && <p style={{ color:'#ef4444', fontSize:13 }}>{result.error}</p>}
    </div>
  )
}

function WhatsAppShareButton({ areaName, pin, score, grade, verdict, scores }) {
  const handleShare = () => {
    const scoreLines = Object.entries(scores)
      .map(([k, v]) => `${DIM_ICON[k] || '•'} ${DIM_LABEL[k] || k}: ${v}/100`)
      .join('\n')

    const message =
`🏠 *AsliVastu Report — ${areaName} (${pin})*
NQI Score: *${score}/100 (${grade})* · ${verdict}

${scoreLines}

Full report (free): https://aslivastu.vercel.app/report/${pin}`

    const encoded = encodeURIComponent(message)
    const isMobile = /iPhone|Android/i.test(navigator.userAgent)
    const url = isMobile
      ? `whatsapp://send?text=${encoded}`
      : `https://web.whatsapp.com/send?text=${encoded}`
    window.open(url, '_blank')
  }

  return (
    <button
      onClick={handleShare}
      style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        background: '#25D366', color: '#fff', border: 'none',
        borderRadius: '8px', padding: '9px 14px', fontSize: '13px',
        fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s', flexShrink: 0,
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      Share
    </button>
  )
}

function PDFDownloadButton({ areaName, pin }) {
  const [loading, setLoading] = useState(false)

  const loadScript = (src, check) => new Promise((resolve, reject) => {
    if (check()) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })

  const handleDownload = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
          () => !!window.html2canvas
        ),
        loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
          () => !!window.jspdf
        ),
      ])

      // Auto-unlock full report if not already visible
      const unlockBtn = document.querySelector('[data-unlock="true"]')
      if (unlockBtn) {
        unlockBtn.click()
        await new Promise(r => setTimeout(r, 500))
      }

      const { jsPDF } = window.jspdf
      const fullPage = document.querySelector('.report-wrap')
      if (!fullPage) throw new Error('Report not found')

      // Expand all clipped/scrollable elements so full content is captured
      const els = fullPage.querySelectorAll('*')
      const saved = []
      els.forEach(el => {
        saved.push([el, el.style.overflow, el.style.maxHeight])
        el.style.overflow = 'visible'
        el.style.maxHeight = 'none'
      })

      const canvas = await window.html2canvas(fullPage, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#0f0f0f',
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        width: fullPage.scrollWidth,
        height: fullPage.scrollHeight,
        windowWidth: fullPage.scrollWidth,
      })

      // Restore styles
      saved.forEach(([el, ov, mh]) => {
        el.style.overflow = ov
        el.style.maxHeight = mh
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdfW = 210
      const pdfH = (canvas.height / canvas.width) * pdfW

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfW, pdfH],
      })

      doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
      doc.save(`AsliVastu-${areaName.replace(/\s+/g, '-')}-${pin}.pdf`)

    } catch (e) {
      console.error('PDF error:', e)
      alert('PDF failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        background: 'none', color: '#f0f0f0',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '8px', padding: '9px 14px', fontSize: '13px',
        fontWeight: '600', cursor: loading ? 'wait' : 'pointer',
        transition: 'all 0.2s', flexShrink: 0, opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#e23744'; e.currentTarget.style.color = '#e23744' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#f0f0f0' }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      {loading ? 'Generating…' : 'PDF'}
    </button>
  )
}


export default function Home({ initialPin, initialReport, initialAllScores, ogMeta }) {
  const [dark, setDark]           = useState(false)
  const [query, setQuery]         = useState(initialPin ? (PIN_META[initialPin]?.name || initialPin) : '')
  const [pin, setPin]             = useState(initialPin || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSugg, setShowSugg]   = useState(false)
  const [report, setReport]       = useState(initialReport || null)
  const [noData, setNoData]       = useState(null) // { pin, name, area } when area known but no data
  const [allScores, setAllScores] = useState(initialAllScores || [])
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [unlocked, setUnlocked]   = useState(false)
  const [showLanding, setShowLanding] = useState(!initialPin)
  const [weightPreset, setWeightPreset] = useState('Default')
  const [customWeights, setCustomWeights] = useState({ crime:30, infrastructure:25, air:20, power:15, schools:10 })
  const [fbText, setFbText] = useState('')
  const [fbStatus, setFbStatus] = useState('idle')
  const [fbError, setFbError] = useState('')

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setDark(mq.matches)
  }, [])

  // Auto-load from URL params (fallback for /report?pin= links) — skipped when SSR props are present
  useEffect(() => {
    if (initialPin) return // already loaded via getServerSideProps
    const params = new URLSearchParams(window.location.search)
    const pinParam = params.get('pin')
    const qParam   = params.get('q')
    if (pinParam && /^\d{6}$/.test(pinParam)) {
      const meta = PIN_META[pinParam]
      if (meta) setQuery(meta.name)
      setPin(pinParam)
      fetchReportByPin(pinParam)
    } else if (qParam) {
      setQuery(qParam)
      const results = searchPin(qParam)
      if (results.length > 0) {
        setPin(results[0].pin)
        fetchReportByPin(results[0].pin)
      }
    }
  }, []) // eslint-disable-line

  const bg     = dark ? '#0f0f0f' : '#ffffff'
  const card   = dark ? '#161616' : '#ffffff'
  const border = dark ? '#ffffff08' : '#f0f0f0'
  const text   = dark ? '#f0f0f0' : '#111111'
  const muted  = dark ? '#9a9a9a' : '#595959'
  const subtle = dark ? '#1e1e1e' : '#f7f7f7'

  function handleQueryChange(val) {
    setQuery(val)
    setError('')
    if (val.trim().length < 2) { setSuggestions([]); setShowSugg(false); return }
    const results = searchPin(val)
    setSuggestions(results)
    setShowSugg(results.length > 0)
  }

  function pickSuggestion(item) {
    setQuery(item.name)
    setPin(item.pin)
    setSuggestions([])
    setShowSugg(false)
    fetchReportByPin(item.pin)
  }

  async function fetchReport() {
    // resolve query to pin
    let resolvedPin = pin
    if (!resolvedPin || resolvedPin.length !== 6) {
      const results = searchPin(query)
      if (results.length === 0) { setError('Area not found — try a pin code or different name'); return }
      resolvedPin = results[0].pin
      setQuery(results[0].name)
      setPin(resolvedPin)
    }
    await fetchReportByPin(resolvedPin)
  }

  async function fetchReportByPin(resolvedPin) {
    setLoading(true); setError(''); setReport(null); setNoData(null); setUnlocked(false); setShowLanding(false); setShowSugg(false)
    try {
      const [r1, r2] = await Promise.all([fetch(`/api/report?pin=${resolvedPin}`), fetch(`/api/all`)])
      const data = await r1.json()
      const all  = await r2.json()
      if (!r1.ok) {
        // Area known but no data yet — show coming soon
        const meta = PIN_META[resolvedPin]
        if (meta) {
          setNoData({ pin: resolvedPin, ...meta })
        } else {
          setError('This area is outside our current Delhi NCR coverage.')
        }
        setLoading(false)
        return
      }
      setReport(data); setAllScores(all || [])
    } catch(e) { setError('Network error') }
    finally { setLoading(false) }
  }

  const meta    = report ? (PIN_META[report.pin_code] || { name: report.pin_code, area: 'Delhi NCR' }) : null
  const verdict = report ? getVerdict(report.scores, report.nqi_composite) : null
  const { good, bad } = report ? getHighlights(report, report.scores) : { good:[], bad:[] }
  const radarData = report ? Object.entries(report.scores).map(([k,v]) => ({ subject: DIM_LABEL[k]||k, score: v })) : []
  const nearby = report
    ? allScores
        .filter(r => r.pin_code !== report.pin_code && r.nqi_composite)
        .sort((a,b) => Math.abs(parseInt(a.pin_code)-parseInt(report.pin_code)) - Math.abs(parseInt(b.pin_code)-parseInt(report.pin_code)))
        .slice(0,4)
    : []

  // User-adjustable reweighting — see WEIGHT_PRESETS above.
  const availableDims  = report ? Object.keys(report.scores) : []
  const activeWeights  = weightPreset === 'Custom' ? customWeights : WEIGHT_PRESETS[weightPreset]
  const normWeights    = report ? normalizedWeights(activeWeights, availableDims) : {}
  const recomputedNqi  = report ? weightedComposite(report.scores, activeWeights, availableDims) : null
  const isDefaultWeight = weightPreset === 'Default'
  const displayedNqi   = isDefaultWeight ? report?.nqi_composite : recomputedNqi
  const displayedGrade = isDefaultWeight ? report?.grade : gradeFor(recomputedNqi)

  const sendFeedback = async () => {
    if (!fbText.trim() || fbStatus === 'sending') return
    setFbStatus('sending')
    const areaLabel = meta ? `${meta.name} (${report.pin_code})` : (report ? report.pin_code : null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fbText,
          area: areaLabel,
          pin: report ? report.pin_code : null,
          nqi: report ? report.nqi_composite : null,
          grade: report ? report.grade : null,
          page: 'report',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setFbStatus('sent')
      setFbText('')
    } catch (err) {
      setFbError(err.message || 'Something went wrong')
      setFbStatus('error')
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:bg, color:text, fontFamily:'"Inter",-apple-system,sans-serif', transition:'background 0.2s' }}>
      <style>{ANIM_CSS}</style>

      {/* ── Server-side SEO tags ── */}
      {ogMeta && (
        <Head>
          <title>{ogMeta.title}</title>
          <meta name="description" content={ogMeta.description} />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={ogMeta.url} />

          {/* OG */}
          <meta property="og:title" content={ogMeta.title} />
          <meta property="og:description" content={ogMeta.description} />
          <meta property="og:image" content={ogMeta.image} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:url" content={ogMeta.url} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="AsliVastu" />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={ogMeta.title} />
          <meta name="twitter:description" content={ogMeta.description} />
          <meta name="twitter:image" content={ogMeta.image} />

          {/* JSON-LD structured data */}
          {ogMeta.jsonLd && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: ogMeta.jsonLd }}
            />
          )}
        </Head>
      )}

      {/* ── Nav ── */}
      <nav style={{ borderBottom:`1px solid ${dark ? '#ffffff0f' : '#f0f0f0'}`, padding:'0 24px', height:68, display:'flex', alignItems:'center', justifyContent:'space-between', background: dark ? '#111111' : '#ffffff', position:'sticky', top:0, zIndex:100 }}>
        <a href="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none' }}>
          <img src="/logo.png" alt="AsliVastu" style={{ width:48, height:48, objectFit:'contain', borderRadius:8 }} />
          <div>
            <div style={{ fontWeight:800, fontSize:20, letterSpacing:'-0.4px', color:text, lineHeight:1 }}>AsliVastu</div>
            <div style={{ fontSize:11, color:ACCENT, fontWeight:500, marginTop:3 }}>Your Neighbourhood, By the numbers</div>
          </div>
        </a>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:12, color:muted }}>68 areas</span>
          <a href="/compare" style={{ fontSize:13, fontWeight:600, color:'white', textDecoration:'none', padding:'8px 16px', background:ACCENT, borderRadius:8, display:'flex', alignItems:'center', gap:6 }}><DimIcon name="compare" size={14} color="white" /> Compare areas</a>
          <button onClick={() => setDark(!dark)} style={{ background:'none', border:`1px solid ${border}`, borderRadius:6, padding:'4px 10px', fontSize:12, cursor:'pointer', color:muted, display:'flex', alignItems:'center', gap:5 }}>
            <DimIcon name={dark ? 'sun' : 'moon'} size={13} color={muted} /> {dark ? 'Light' : 'Dark'}
          </button>
        </div>
      </nav>

      {/* ── Landing ── */}
      {showLanding && !report && (
        <div style={{ position:'relative', overflow:'hidden' }}>
          {/* Gradient blob behind hero */}
          <div style={{
            position:'absolute', top:0, left:0, right:0, height:'520px',
            background: dark
              ? 'radial-gradient(ellipse 90% 70% at 15% 5%, #9b1c2e88 0%, #5a0d1d44 40%, transparent 70%), radial-gradient(ellipse 70% 60% at 85% 15%, #e2374435 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 50% 0%, #ff000018 0%, transparent 60%)'
              : 'radial-gradient(ellipse 80% 60% at 50% 0%, #ffe4e6 0%, #fff0f0 40%, transparent 70%), radial-gradient(ellipse 40% 30% at 85% 10%, #fecdd3 0%, transparent 50%)',
            pointerEvents:'none', zIndex:0,
          }}/>
          <div className="landing-wrap" style={{ position:'relative', zIndex:1, maxWidth:720, margin:'0 auto', padding:'80px 24px 48px', isolation:'isolate' }}>

          <div style={{ animation:'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.05s both', marginBottom:12 }}>
            <span style={{ fontSize:12, fontWeight:600, color:ACCENT, letterSpacing:'0.08em', textTransform:'uppercase' }}>
              Delhi NCR · 67 Neighbourhoods Scored
            </span>
          </div>

          <h1 className="hero-title" style={{ animation:'fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.15s both', fontSize:'clamp(28px,5vw,50px)', fontWeight:800, lineHeight:1.1, letterSpacing:'-1.5px', margin:'0 0 20px', color:text }}>
            Before you buy a home,<br/>
            <span style={{ color:ACCENT }}>know the neighbourhood.</span>
          </h1>

          <p style={{ animation:'fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.25s both', fontSize:17, color:muted, margin:'0 0 12px', lineHeight:1.7, maxWidth:540 }}>
            You research everything before buying a house — price, vastu, builder reputation. But what about the <strong style={{color:text}}>neighbourhood itself?</strong>
          </p>

          <p style={{ animation:'fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.28s both', fontSize:15, color:muted, margin:'0 0 32px', lineHeight:1.7, maxWidth:540 }}>
            AsliVastu gives you a data-backed score for any Delhi NCR area — covering safety, air quality, water supply, road condition, power reliability, and more. Type your area name or pin code and see the full picture.
          </p>

          {/* Search */}
          <div style={{ animation:'fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.35s both', position:'relative', marginBottom:14, maxWidth:500, zIndex:50 }}>
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ position:'relative', flex:1 }}>
                <input
                  value={query}
                  onChange={e => handleQueryChange(e.target.value)}
                  onKeyDown={e => { if(e.key==='Enter') fetchReport(); if(e.key==='Escape') setShowSugg(false) }}
                  onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                  onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                  placeholder="Area name or pin code — e.g. Hauz Khas, Rohini"
                  style={{ width:'100%', padding:'14px 16px', background:card, border:`1.5px solid ${border}`, borderRadius:10, fontSize:15, color:text, outline:'none', boxSizing:'border-box' }}
                />
                {showSugg && suggestions.length > 0 && (
                  <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:card, border:`1px solid ${border}`, borderRadius:10, zIndex:999, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.28)' }}>
                    {suggestions.map(s => (
                      <div key={s.pin} onMouseDown={() => pickSuggestion(s)}
                        style={{ padding:'10px 16px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${border}` }}
                        onMouseEnter={e => e.currentTarget.style.background = subtle}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div>
                          <span style={{ fontSize:14, fontWeight:500, color:text }}>{s.name}</span>
                          <span style={{ fontSize:12, color:muted, marginLeft:8 }}>{s.area}</span>
                        </div>
                        <span style={{ fontSize:12, color:muted, fontFamily:'monospace' }}>{s.pin}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={fetchReport} disabled={loading}
                style={{ padding:'14px 24px', background:ACCENT, color:'white', border:'none', borderRadius:10, fontSize:15, cursor:'pointer', fontWeight:700, whiteSpace:'nowrap', opacity:loading?0.7:1, flexShrink:0 }}>
                {loading ? '...' : 'Check →'}
              </button>
            </div>
          </div>

          {error && <p style={{ color:'#ef4444', fontSize:13, margin:'0 0 12px' }}>{error}</p>}

          <div style={{ animation:'fadeIn 0.6s ease 0.5s both', display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
            {[['110016','Hauz Khas'],['110070','Vasant Kunj'],['122001','Gurugram'],['110033','Jahangirpuri'],['110085','Rohini'],['201301','Noida']].map(([p,name]) => (
              <button key={p} onClick={() => { setQuery(name); setPin(p); fetchReportByPin(p) }}
                style={{ padding:'6px 14px', background:'none', border:`1px solid ${border}`, borderRadius:20, fontSize:12, cursor:'pointer', color:muted }}>
                {name}
              </button>
            ))}
          </div>

          <div style={{ animation:'fadeIn 0.6s ease 0.55s both', marginBottom:48 }}>
            <a href="/compare" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 20px', background:'none', border:`1.5px solid ${ACCENT}`, borderRadius:10, fontSize:13, fontWeight:600, color:ACCENT, textDecoration:'none' }}>
              <DimIcon name="compare" size={15} color={ACCENT} /> Compare two areas side by side →
            </a>
          </div>

          {/* What we score */}
          <div style={{ animation:'fadeIn 0.6s ease 0.6s both', marginBottom:48 }}>
            <p style={{ fontSize:12, fontWeight:600, color:muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>What we score</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10 }}>
              {[
                { key:'crime',          label:'Safety',         desc:'Crime rate per area from Delhi Police data' },
                { key:'air',            label:'Air Quality',     desc:'Live AQI from CPCB monitoring stations' },
                { key:'power',          label:'Power Supply',    desc:'Outage hours from BSES, Tata Power, DHBVN' },
                { key:'water',          label:'Water Supply',    desc:'Daily supply hours and TDS quality rating' },
                { key:'roads',          label:'Road Condition',  desc:'Pothole density and last resurfacing year' },
                { key:'infrastructure', label:'Infrastructure',  desc:'Metro access, highway proximity, zone type' },
              ].map(f => (
                <div key={f.label} style={{ padding:'14px', background:card, border:`1px solid ${border}`, borderRadius:12 }}>
                  <div style={{ marginBottom:8 }}><DimIcon name={f.key} size={20} color={ACCENT} /></div>
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:4, color:text }}>{f.label}</div>
                  <div style={{ fontSize:11, color:muted, lineHeight:1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div style={{ animation:'fadeIn 0.6s ease 0.7s both', marginBottom:48 }}>
            <p style={{ fontSize:12, fontWeight:600, color:muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>How it works</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:10 }}>
              {[
                { step:'1', title:'Enter your area', desc:'Type a neighbourhood name or 6-digit pin code' },
                { step:'2', title:'See free preview', desc:'Safety, infrastructure and air quality scores instantly' },
                { step:'3', title:'Unlock full report', desc:'Water, roads, sewerage, comparison and deep analysis for ₹199' },
              ].map(f => (
                <div key={f.step} style={{ padding:'16px', background:card, border:`1px solid ${border}`, borderRadius:12, display:'flex', gap:12, alignItems:'flex-start' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:ACCENT, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, flexShrink:0 }}>{f.step}</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13, color:text, marginBottom:4 }}>{f.title}</div>
                    <div style={{ fontSize:12, color:muted, lineHeight:1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust bar */}
          <div style={{ animation:'fadeIn 0.6s ease 0.8s both', padding:'16px 20px', background:card, border:`1px solid ${border}`, borderRadius:12, display:'flex', flexWrap:'wrap', gap:20, alignItems:'center', justifyContent:'center', marginBottom:16 }}>
            {[
              { val:'67', label:'areas covered' },
              { val:'8', label:'data dimensions' },
              { val:'Live', label:'AQI data' },
              { val:'₹199', label:'full report' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:800, color:ACCENT }}>{s.val}</div>
                <div style={{ fontSize:11, color:muted }}>{s.label}</div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* ── Report ── */}
      {!showLanding && (
        <div className="report-wrap" style={{ maxWidth:1200, margin:'0 auto', padding:'24px 16px 80px' }}>

          {/* Back + search */}
          <div className="report-topbar" style={{ display:'flex', gap:8, marginBottom:20, alignItems:'center' }}>
            <button onClick={() => { window.location.href = '/' }}
              style={{ background:'none', border:`1px solid ${border}`, borderRadius:8, padding:'8px 12px', fontSize:13, cursor:'pointer', color:muted, flexShrink:0 }}>
              ← Back
            </button>
            <div style={{ position:'relative', flex:1 }}>
              <input value={query}
                onChange={e => handleQueryChange(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter') fetchReport(); if(e.key==='Escape') setShowSugg(false) }}
                onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                placeholder="Area name or pin code"
                style={{ width:'100%', padding:'8px 14px', background:card, border:`1px solid ${border}`, borderRadius:8, fontSize:14, color:text, outline:'none', boxSizing:'border-box' }} />
              {showSugg && suggestions.length > 0 && (
                <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:card, border:`1px solid ${border}`, borderRadius:10, zIndex:100, overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,0.12)' }}>
                  {suggestions.map(s => (
                    <div key={s.pin} onMouseDown={() => pickSuggestion(s)}
                      style={{ padding:'10px 16px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = subtle}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <span style={{ fontSize:13, fontWeight:500, color:text }}>{s.name}</span>
                        <span style={{ fontSize:11, color:muted, marginLeft:8 }}>{s.area}</span>
                      </div>
                      <span style={{ fontSize:11, color:muted, fontFamily:'monospace' }}>{s.pin}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={fetchReport} disabled={loading}
              style={{ padding:'8px 16px', background:ACCENT, color:'white', border:'none', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:600, flexShrink:0 }}>
              {loading ? '...' : 'Go'}
            </button>
          </div>

          {loading && (
            <div style={{ textAlign:'center', padding:'60px 0', color:muted }}>
              <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
              <p style={{ fontSize:14 }}>Loading report...</p>
            </div>
          )}

          {error && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:10, padding:'12px 16px', color:'#dc2626', fontSize:14 }}>{error}</div>}

          {noData && !report && (
            <div style={{ background:card, border:`1px solid ${border}`, borderRadius:16, padding:32, textAlign:'center', marginBottom:12 }}>
              <div style={{ width:56, height:56, background:ACCENT+'15', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}><DimIcon name="pin" size={26} color={ACCENT} /></div>
              <p style={{ margin:'0 0 4px', fontSize:12, color:muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>{noData.area}</p>
              <h2 style={{ margin:'0 0 8px', fontSize:24, fontWeight:800, color:text }}>{noData.name}</h2>
              <p style={{ margin:'0 0 4px', fontSize:13, color:muted }}>Pin {noData.pin}</p>

              <div style={{ margin:'20px auto', padding:'16px 20px', background: dark?'#1a1a1a':'#f9fafb', border:`1px solid ${border}`, borderRadius:12, maxWidth:360 }}>
                <p style={{ margin:'0 0 6px', fontSize:14, fontWeight:600, color:text }}>Data coming soon</p>
                <p style={{ margin:0, fontSize:13, color:muted, lineHeight:1.6 }}>
                  We don't have neighborhood quality data for {noData.name} yet. We're expanding our coverage across Delhi NCR and will add this area soon.
                </p>
              </div>

              <div style={{ margin:'0 auto 20px', maxWidth:360 }}>
                <p style={{ fontSize:13, color:muted, marginBottom:10 }}>Get notified when {noData.name} data is available:</p>
                <div style={{ display:'flex', gap:8 }}>
                  <input
                    placeholder="your@email.com"
                    style={{ flex:1, padding:'10px 14px', background:card, border:`1px solid ${border}`, borderRadius:8, fontSize:13, color:text, outline:'none' }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.target.value.includes('@')) {
                        e.target.value = ''
                        e.target.placeholder = 'Thanks! We will notify you.'
                        e.target.disabled = true
                      }
                    }}
                  />
                  <button
                    style={{ padding:'10px 16px', background:ACCENT, color:'white', border:'none', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:600, whiteSpace:'nowrap' }}
                    onClick={e => {
                      const input = e.currentTarget.previousSibling
                      if (input.value.includes('@')) {
                        input.value = ''
                        input.placeholder = 'Thanks! We will notify you.'
                        input.disabled = true
                      }
                    }}
                  >
                    Notify me
                  </button>
                </div>
              </div>

              <p style={{ fontSize:12, color:muted }}>
                Currently covering <strong style={{color:text}}>67 areas</strong> across Delhi, Gurugram, Noida and Faridabad.
              </p>
            </div>
          )}

          {report && (
            <>
              <div className="report-grid">

                {/* ── LEFT COLUMN ── */}
                <div className="report-left">

                  {/* Hero card */}
                  <div style={{ position:'relative', zIndex:1, background:card, border:`1px solid ${border}`, borderRadius:16, padding:24, marginBottom:12, overflow:'hidden' }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT}88 50%, transparent 100%)`, borderRadius:'16px 16px 0 0' }}/>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, marginTop:8 }}>
                      <div>
                        <p style={{ margin:0, fontSize:13, color:muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>{meta.area}</p>
                        <h2 style={{ margin:'4px 0 0', fontSize:34, fontWeight:800, letterSpacing:'-0.5px', color:text }}>{meta.name}</h2>
                        <p style={{ margin:'4px 0 0', fontSize:14, color:muted }}>Pin {report.pin_code} · {report.dimensions_scored} of 5 dimensions</p>
                      </div>
                      <div style={{ textAlign:'center', background:GRADE_COLOR[displayedGrade]+'18', borderRadius:12, padding:'12px 16px', minWidth:80, boxShadow:`0 0 20px ${GRADE_COLOR[displayedGrade]}30` }}>
                        <div style={{ fontSize:46, fontWeight:900, color:GRADE_COLOR[displayedGrade], lineHeight:1, letterSpacing:'-1px' }}>{displayedNqi}</div>
                        <div style={{ fontSize:18, fontWeight:700, color:GRADE_COLOR[displayedGrade] }}>{displayedGrade}</div>
                        <div style={{ fontSize:10, color:muted, marginTop:2 }}>{isDefaultWeight ? 'NQI Score' : `Your score · ${weightPreset}`}</div>
                      </div>
                    </div>
                    <div style={{ padding:'12px 14px', background:verdict.color+'15', borderLeft:`3px solid ${verdict.color}`, borderRadius:'0 8px 8px 0' }}>
                      <span style={{ fontWeight:700, color:verdict.color, fontSize:16 }}>{verdict.label}</span>
                      <p style={{ margin:'6px 0 0', fontSize:15, color:text, lineHeight:1.6 }}>{verdict.reason}</p>
                    </div>
                  </div>

                  {/* Radar — Dimension overview */}
                  {radarData.length > 1 && (
                    <div style={{ background:card, border:`1px solid ${border}`, borderRadius:16, padding:'20px 16px', marginBottom:12, marginTop:49 }}>
                      <p style={{ margin:'0 0 12px', fontSize:14, fontWeight:600, color:text, display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ display:'inline-block', width:3, height:14, background:ACCENT, borderRadius:2 }}/>
                        Dimension overview
                      </p>
                      <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke={border} />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize:12, fill:muted }} />
                          <Radar dataKey="score" stroke={ACCENT} fill={ACCENT} fillOpacity={0.15} strokeWidth={2} />
                          <Tooltip contentStyle={{ background:card, border:`1px solid ${border}`, borderRadius:8, fontSize:12 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div>

                  {/* Neighbourhood Report heading */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, paddingBottom:14, borderBottom:`1px solid ${border}` }}>
                    <span style={{ display:'inline-block', width:3, height:20, background:ACCENT, borderRadius:2 }}/>
                    <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:text, letterSpacing:'-0.3px' }}>Neighbourhood Report</h2>
                    <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:12, color:muted }}>{meta?.name} · {report?.pin_code}</span>
                      <PDFDownloadButton
                        areaName={meta?.name}
                        pin={report?.pin_code}
                      />
                      <WhatsAppShareButton
                        areaName={meta?.name}
                        pin={report?.pin_code}
                        score={report?.nqi_composite}
                        grade={report?.grade}
                        verdict={verdict?.label}
                        scores={report?.scores || {}}
                      />
                    </div>
                  </div>
                <div style={{ background:card, border:`1px solid ${border}`, borderRadius:16, padding:20, marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, marginBottom:14 }}>
                    <p style={{ margin:0, fontSize:16, fontWeight:600, color:text, display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ display:'inline-block', width:3, height:16, background:ACCENT, borderRadius:2 }}/>
                      Score breakdown
                    </p>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {[...Object.keys(WEIGHT_PRESETS), 'Custom'].map(name => (
                        <button key={name} onClick={() => setWeightPreset(name)} style={{
                          fontSize:11, fontWeight:600, padding:'5px 11px', borderRadius:100, cursor:'pointer',
                          border:`1px solid ${weightPreset===name ? ACCENT : border}`,
                          background: weightPreset===name ? ACCENT+'1a' : 'transparent',
                          color: weightPreset===name ? ACCENT : muted,
                        }}>{name}</button>
                      ))}
                    </div>
                  </div>

                  {isDefaultWeight ? (
                    <p style={{ margin:'0 0 20px', fontSize:12, color:muted, lineHeight:1.5 }}>
                      The {report.nqi_composite ?? '—'} NQI is a weighted average of the dimensions below — the % next to each
                      one is exactly how much it counts.
                      {report.dimensions_scored != null && report.dimensions_total != null && report.dimensions_scored < report.dimensions_total && (
                        <> Only {report.dimensions_scored} of {report.dimensions_total} had data for this pin, so the rest were rescaled to still add up to 100%.</>
                      )}
                    </p>
                  ) : (
                    <div style={{ margin:'0 0 20px', padding:'14px', background:subtle, borderRadius:10 }}>
                      <p style={{ margin:'0 0 8px', fontSize:12, color:muted, lineHeight:1.5 }}>
                        {weightPreset === 'Custom'
                          ? 'Drag to set your own priorities — the weights below adjust automatically to stay at 100%.'
                          : `Same underlying data, recalculated using the "${weightPreset}" weighting.`}
                      </p>
                      <p style={{ margin:0 }}>
                        <span style={{ fontSize:24, fontWeight:800, color:text }}>{recomputedNqi}</span>
                        <span style={{ fontSize:12, color:muted, fontWeight:400 }}>/100 for you</span>
                        <span style={{ fontSize:11, color:muted, fontWeight:400, marginLeft:10 }}>official score: {report.nqi_composite}</span>
                      </p>
                      {weightPreset === 'Custom' && (
                        <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:12 }}>
                          {availableDims.map(k => (
                            <div key={k}>
                              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:muted, marginBottom:4 }}>
                                <span>{DIM_LABEL[k]}</span>
                                <span style={{ color:text, fontWeight:600 }}>{Math.round((normWeights[k]||0)*100)}%</span>
                              </div>
                              <input
                                type="range" min="0" max="100" step="1"
                                value={customWeights[k] ?? 0}
                                onChange={e => setCustomWeights({ ...customWeights, [k]: Number(e.target.value) })}
                                style={{ width:'100%', accentColor:ACCENT }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {Object.entries(report.scores).map(([k,v]) => {
                    const c = v>=80?'#22c55e':v>=60?'#84cc16':v>=40?'#f97316':'#ef4444'
                    const baseW    = report.weights_base?.[k]
                    const appliedW = report.weights_applied?.[k]
                    const reweighted = baseW !== undefined && appliedW !== undefined && Math.abs(appliedW - baseW) > 0.001
                    const shownWeight = isDefaultWeight ? appliedW : normWeights[k]
                    return (
                      <div key={k} style={{ marginBottom:20 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, flexWrap:'wrap', gap:6 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                            <DimIcon name={k} size={18} color={ACCENT} />
                            <span style={{ fontSize:16, fontWeight:600, color:text }}>{DIM_LABEL[k]}</span>
                            {DIM_TAG[k] && <TagBadge tag={DIM_TAG[k]} card={card} border={border} dark={dark} muted={muted} text={text} />}
                            {shownWeight !== undefined && (
                              <span style={{ fontSize:11, fontWeight:600, color:muted, background:subtle, padding:'3px 9px', borderRadius:7, whiteSpace:'nowrap' }}>
                                {isDefaultWeight && reweighted && (
                                  <span style={{ textDecoration:'line-through', opacity:0.55, marginRight:4 }}>
                                    {Math.round(baseW * 100)}%
                                  </span>
                                )}
                                {Math.round(shownWeight * 100)}% weight
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize:18, fontWeight:800, color:c }}>{v}<span style={{ fontSize:13, color:muted, fontWeight:400 }}>/100</span></span>
                        </div>
                        <div style={{ background:subtle, borderRadius:99, height:8, overflow:'hidden' }}>
                          <div style={{ width:v+'%', height:'100%', background:c, borderRadius:99, transition:'width 0.8s ease' }}/>
                        </div>
                        <p style={{ fontSize:12, color:muted, margin:'6px 0 0', lineHeight:1.5 }}>{DIM_DESC[k]}</p>
                        {k === 'crime' && report.crime_percentile != null && (
                          <p style={{ fontSize:12, color:muted, margin:'4px 0 0', lineHeight:1.5 }}>
                            {report.total_cognizable_crimes} total crimes reported — safer than <strong style={{color:text}}>{report.crime_percentile}%</strong> of tracked areas ({report.crime_tier} tier).
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

              </div>{/* end right column */}
              </div>{/* end report-grid */}

              {/* Paywall — full width, below fold */}
                {!unlocked ? (
                  <div style={{ marginTop:80, marginBottom:12 }}>
                    <div style={{ background:card, border:`2px dashed ${border}`, borderRadius:16, padding:40, textAlign:'center', maxWidth:600, margin:'0 auto' }}>
                      <div style={{ width:44, height:44, background:subtle, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}><DimIcon name="lock" size={20} color={muted} /></div>
                      <h3 style={{ margin:'0 0 6px', fontSize:18, fontWeight:700, color:text }}>Full neighbourhood report</h3>
                      <p style={{ margin:'0 0 20px', color:muted, fontSize:13 }}>Deep dive into safety, infrastructure, water, roads, sewerage and more</p>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:24, textAlign:'left', maxWidth:360, margin:'0 auto 24px' }}>
                        {["Highlights & risk flags","Buy / Consider / Avoid","Crime deep-dive","Infrastructure details","Compare 4 nearby areas","Data methodology"].map(item => (
                          <div key={item} style={{ display:'flex', gap:6, fontSize:12, color:muted, alignItems:'flex-start' }}>
                            <span style={{ color:'#22c55e', fontWeight:700 }}>✓</span>{item}
                          </div>
                        ))}
                      </div>
                      <div style={{ display:'flex', justifyContent:'center' }}>
                        <button onClick={() => setUnlocked(true)} data-unlock="true"
                          style={{ background:ACCENT, color:'white', border:'none', padding:'13px 40px', borderRadius:10, fontSize:15, cursor:'pointer', fontWeight:700, boxShadow:`0 4px 24px ${ACCENT}55` }}>
                          View full report →
                        </button>
                      </div>
                      <p style={{ margin:'10px 0 0', fontSize:11, color:muted }}>Includes water, roads, sewerage, comparison & methodology</p>
                    </div>
                  </div>
                ) : (
                  <>
                  {/* Highlights */}
                  {(good.length > 0 || bad.length > 0) && (
                    <div style={{ background:card, border:`1px solid ${border}`, borderRadius:16, padding:20, marginBottom:12 }}>
                      <p style={{ margin:'0 0 14px', fontSize:13, fontWeight:600, color:text, display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ display:'inline-block', width:3, height:14, background:ACCENT, borderRadius:2 }}/>
                        Highlights & risks
                      </p>
                      {good.map((h,i) => (
                        <div key={i} style={{ display:'flex', gap:8, marginBottom:8, fontSize:13 }}>
                          <span style={{ color:'#22c55e', fontWeight:700 }}>✓</span>
                          <span style={{ color:text, lineHeight:1.4 }}>{h}</span>
                        </div>
                      ))}
                      {bad.map((r,i) => (
                        <div key={i} style={{ display:'flex', gap:8, marginBottom:8, fontSize:13 }}>
                          <span style={{ color:'#ef4444', fontWeight:700 }}>✗</span>
                          <span style={{ color:text, lineHeight:1.4 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Crime */}
                  <div style={{ background:card, border:`1px solid ${border}`, borderRadius:16, padding:20, marginBottom:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'0 0 14px' }}>
                      <DimIcon name="crime" size={16} color={ACCENT} />
                      <span style={{ fontSize:15, fontWeight:800, color:text, letterSpacing:'-0.3px', fontFamily:'Georgia, serif' }}>Crime</span>
                      <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${ACCENT}60, transparent)` }}/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                      {[
                        ['Total crimes', report.total_cognizable_crimes ?? '—', 'Total cognizable crimes reported annually for this pin\'s police station catchment — IPC offences serious enough that police can arrest without a warrant. The catchment can span a wider area than any one street or colony.\n\nSource: Delhi Police Annual Report 2022-23.'],
                        ['Safety score', (report.scores.crime ?? '—') + '/100', 'Inverse-normalized against total cognizable crimes: 250 or fewer scores 100, 650 or more scores 0, linear in between.'],
                        ['Safer than', report.crime_percentile != null ? report.crime_percentile + '% of areas' : '—', 'Percentile rank of this pin\'s raw crime count against all 86 other tracked areas. A tied count gets no credit either way.\n\nThis is a relative ranking, not a true per-capita rate — it doesn\'t yet account for how many people live in each catchment.'],
                        ['Crime tier', report.crime_tier ?? '—', 'Very Low / Low / Moderate / High / Very High, based on percentile rank:\n\n• 80%+ = Very Low\n• 60-79% = Low\n• 40-59% = Moderate\n• 20-39% = High\n• Below 20% = Very High'],
                        ['Source year', '2022-23', null],
                      ].map(([label, val, tooltip]) => (
                        <InfoBox key={label} label={label} val={String(val)} tooltip={tooltip} subtle={subtle} muted={muted} text={text} card={card} border={border} dark={dark} />
                      ))}
                    </div>
                  </div>

                  {/* Power */}
                  <div style={{ background:card, border:`1px solid ${border}`, borderRadius:16, padding:20, marginBottom:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'0 0 14px' }}>
                      <DimIcon name="power" size={16} color={ACCENT} />
                      <span style={{ fontSize:15, fontWeight:800, color:text, letterSpacing:'-0.3px', fontFamily:'Georgia, serif' }}>Power supply</span>
                      <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${ACCENT}60, transparent)` }}/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                      {[
                        ['Discom', report.discom ?? '—', 'The electricity distribution company serving this area — BSES Rajdhani, BSES Yamuna, Tata Power, or DHBVN in Haryana NCR.'],
                        ['Reliability', report.reliability ?? '—', 'Qualitative reliability rating derived from outage frequency and consumer complaint data in DISCOM annual reports.'],
                        ['Avg cut hrs', (report.avg_outage_hours ?? '—') + ' hrs/mo', 'Average monthly power outage duration in hours, based on DISCOM annual reports and consumer complaint data — not live-metered.'],
                        ['Score', (report.scores.power ?? '—') + '/100', 'Weighted blend of outage frequency (60% of this dimension) and average outage duration (40%).'],
                      ].map(([label, val, tooltip]) => (
                        <InfoBox key={label} label={label} val={String(val)} tooltip={tooltip} subtle={subtle} muted={muted} text={text} card={card} border={border} dark={dark} />
                      ))}
                    </div>
                  </div>

                  {/* Infrastructure */}
                  <div style={{ background:card, border:`1px solid ${border}`, borderRadius:16, padding:20, marginBottom:12 }}>
                    <p style={{ margin:'0 0 14px', fontSize:16, fontWeight:700, color:text, display:'flex', alignItems:'center', gap:10, letterSpacing:'-0.2px' }}>
                      <span style={{ display:'inline-block', width:4, height:18, background:ACCENT, borderRadius:2 }}/>
                      Infrastructure details
                    </p>

                    {/* Connectivity */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'0 0 14px' }}>
                      <DimIcon name="connectivity" size={16} color={ACCENT} />
                      <span style={{ fontSize:15, fontWeight:800, color:text, letterSpacing:'-0.3px', fontFamily:'Georgia, serif' }}>Connectivity</span>
                      <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${ACCENT}60, transparent)` }}/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:20 }}>
                      {[
                        ['Zone', report.zone_type||'—', null],
                        ['Metro nearby', report.metro_stations_nearby??'—', null],
                        ['Metro planned', report.metro_planned_stations??'—', null],
                        ['Highway', report.highway_proximity||'—', null],
                        ['Smart City', report.smart_city_project?'Yes':'No', null],
                        ['Infra score', (report.infra_score_raw||'—')+'/100', 'The infrastructure score (0–100) is calculated from 5 factors:\n\n• Zone type: Residential zones score highest (25 pts)\n• Metro access: Each operational station nearby adds 12 pts (max 24)\n• Planned metro: Approved stations add 6 pts\n• Highway proximity: High = 20 pts, Medium = 12, Low = 5\n• Smart Cities Mission coverage: +10 pts\n\nAll components are capped at 100.'],
                      ].map(([label, val, tooltip]) => (
                        <InfoBox key={label} label={label} val={String(val)} tooltip={tooltip} subtle={subtle} muted={muted} text={text} card={card} border={border} dark={dark} />
                      ))}
                    </div>

                    {/* Water */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0 14px' }}>
                      <DimIcon name="water" size={16} color={ACCENT} />
                      <span style={{ fontSize:15, fontWeight:800, color:text, letterSpacing:'-0.3px', fontFamily:'Georgia, serif' }}>Water supply</span>
                      <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${ACCENT}60, transparent)` }}/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:20 }}>
                      {[
                        ['Daily supply', (report.supply_hours??'—')+' hrs', 'Average number of hours per day that piped water supply is available. Delhi target is 24 hrs. Most areas receive 6–20 hrs depending on zone.'],
                        ['Quality', report.tds_level ? report.tds_level+' TDS' : '—', 'TDS stands for Total Dissolved Solids — the amount of minerals, salts and metals dissolved in water.\n\n• Low TDS (below 300 mg/L): Ideal drinking water\n• Medium TDS (300–600 mg/L): Acceptable, may taste slightly hard\n• High TDS (600–900 mg/L): Hard water, can cause scaling and health concerns\n• Very High TDS (above 900 mg/L): Not recommended for drinking without filtration\n\nDelhi groundwater often has high TDS due to industrial run-off.'],
                        ['Coverage', (report.coverage_pct??'—')+'%', 'Percentage of households in this area with a piped water connection from the municipal supply. Areas below 80% rely heavily on tankers or groundwater.'],
                        ['Authority', report.source||'—', null],
                        ['Complaints', report.complaints_per_1000 ? report.complaints_per_1000+'/1000' : '—', 'Number of water supply complaints filed per 1,000 households annually with DJB (Delhi Jal Board) or local municipal body. Lower is better.'],
                        ['Quality score', (report.quality_score??'—')+'/5', 'Composite water quality score (1–5) based on TDS levels, complaint density, and supply hours. 5 = excellent (NDMC zones), 1 = poor (peripheral areas with groundwater dependence).'],
                      ].map(([label, val, tooltip]) => (
                        <InfoBox key={label} label={label} val={String(val)} tooltip={tooltip} subtle={subtle} muted={muted} text={text} card={card} border={border} dark={dark} />
                      ))}
                    </div>

                    {/* Roads */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0 14px' }}>
                      <DimIcon name="roads" size={16} color={ACCENT} />
                      <span style={{ fontSize:15, fontWeight:800, color:text, letterSpacing:'-0.3px', fontFamily:'Georgia, serif' }}>Road quality</span>
                      <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${ACCENT}60, transparent)` }}/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:20 }}>
                      {[
                        ['Condition', report.road_condition||'—', 'Overall road surface condition rating:\n\n• Excellent: Smooth, no potholes, recently resurfaced\n• Good: Minor wear, few potholes\n• Average: Visible deterioration, moderate potholes\n• Poor: Significant damage, frequent potholes\n• Very Poor: Severely damaged, hazardous conditions'],
                        ['Potholes/km', report.pothole_density??'—', 'Estimated number of potholes per kilometre of road. Based on MCD road survey data and citizen complaint density.\n\n• Below 2/km: Good condition\n• 2–5/km: Average\n• Above 5/km: Poor\n• Above 10/km: Very poor, dangerous for vehicles'],
                        ['Connectivity', report.connectivity||'—', 'Road network connectivity rating for the area — how well it connects to major arterial roads, highways and neighbouring areas.\n\n• High: Multiple entry/exit points, arterial road access\n• Medium: Limited connections, some bottlenecks\n• Low: Single access road or poor internal network'],
                        ['Authority', report.authority||'—', 'The government body responsible for road maintenance in this area. NDMC and PWD roads are generally better maintained than MCD roads due to higher budgets.'],
                        ['Last resurfaced', report.last_resurfaced??'—', 'Year when the main roads in this area were last resurfaced or significantly repaired. Roads are typically due for resurfacing every 5–7 years.'],
                        ['Quality score', (report.quality_score??'—')+'/5', 'Road quality score (1–5) based on pothole density, last resurfacing year, and official condition ratings from MCD and PWD surveys.'],
                      ].map(([label, val, tooltip]) => (
                        <InfoBox key={label} label={label} val={String(val)} tooltip={tooltip} subtle={subtle} muted={muted} text={text} card={card} border={border} dark={dark} />
                      ))}
                    </div>

                    {/* Sewerage */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0 14px' }}>
                      <DimIcon name="sewerage" size={16} color={ACCENT} />
                      <span style={{ fontSize:15, fontWeight:800, color:text, letterSpacing:'-0.3px', fontFamily:'Georgia, serif' }}>Sewerage & drainage</span>
                      <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${ACCENT}60, transparent)` }}/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                      {[
                        ['Sewer coverage', (report.coverage_pct??'—')+'%', 'Percentage of households connected to the underground sewerage network. Areas below 70% rely on septic tanks or open drains which can contaminate groundwater.'],
                        ['Treatment', report.treatment||'—', 'Whether sewage from this area reaches a Sewage Treatment Plant (STP) before discharge:\n\n• Adequate: Full STP treatment\n• Partial: Some sewage treated, some bypasses\n• Inadequate: Sewage largely untreated, discharged directly\n\nUntreated sewage is a major cause of groundwater contamination in Delhi.'],
                        ['Waterlogging risk', report.waterlogging_risk ? (6-report.waterlogging_risk)+'/5 risk' : '—', 'Risk of waterlogging during heavy monsoon rains (1 = highest risk, 5 = lowest). Based on drainage network capacity, historical flooding records, and area elevation. Low-lying areas near drains are most at risk.'],
                        ['Open drains', report.open_drains===true?'Yes':report.open_drains===false?'No':'—', 'Whether the area has open (uncovered) drains. Open drains are a health hazard — they breed mosquitoes, emit foul odour, and overflow during monsoons causing waterlogging.'],
                        ['Flood incidents', report.flooding_incidents_annual!=null ? report.flooding_incidents_annual+'/year' : '—', 'Average number of significant waterlogging or flooding incidents recorded per year in this area. Based on DDMA (Delhi Disaster Management Authority) and civic complaint data.'],
                        ['Overall risk', report.waterlogging_risk>=4?'Low':report.waterlogging_risk>=3?'Medium':'High', 'Overall drainage and flooding risk classification for the area during monsoon season (June–September).'],
                      ].map(([label, val, tooltip]) => (
                        <InfoBox key={label} label={label} val={String(val)} tooltip={tooltip} subtle={subtle} muted={muted} text={text} card={card} border={border} dark={dark} />
                      ))}
                    </div>
                  </div>

                  {/* Schools & Education */}
                  {(report.schools_count > 0) && (
                    <div style={{ background:card, border:`1px solid ${border}`, borderRadius:16, padding:20, marginBottom:12 }}>

                      {/* Header */}
                      <div style={{ display:'flex', alignItems:'center', gap:12, margin:'0 0 16px' }}>
                        <DimIcon name="schools" size={16} color={ACCENT} />
                        <span style={{ fontSize:15, fontWeight:800, color:text, letterSpacing:'-0.3px', fontFamily:'Georgia, serif' }}>Schools & Education</span>
                        <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${ACCENT}60, transparent)` }}/>
                      </div>

                      {/* Summary stats */}
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
                        {[
                          ['Schools nearby', report.schools_count ?? '—', 'Total CBSE-affiliated schools found in or near this pin code. Based on CBSE affiliation database (2018 data — school count in established NCR areas is stable).'],
                          ['CBSE schools', report.schools_cbse ?? '—', 'Number of schools with active CBSE affiliation. CBSE is the national board — generally preferred by homebuyers for transferability and curriculum consistency.'],
                          ['Avg pass %', report.schools_avg_pass != null ? `${report.schools_avg_pass}%` : 'N/A', 'Average Class 10 / Class 12 pass percentage across schools in this area where result data is available. N/A means pass data was not in this dataset.'],
                        ].map(([label, val, tooltip]) => (
                          <InfoBox key={label} label={label} val={String(val)} tooltip={tooltip} subtle={subtle} muted={muted} text={text} card={card} border={border} dark={dark} />
                        ))}
                      </div>

                      {/* School list */}
                      {Array.isArray(report.schools_list) && report.schools_list.length > 0 && (
                        <SchoolList schools={report.schools_list} dark={dark} card={card} border={border} text={text} muted={muted} subtle={subtle} />
                      )}
                    </div>
                  )}

                  {/* Nearby */}
                  {nearby.length > 0 && (
                    <div style={{ background:card, border:`1px solid ${border}`, borderRadius:16, padding:20, marginBottom:12 }}>
                      <p style={{ margin:'0 0 14px', fontSize:16, fontWeight:700, color:text, display:'flex', alignItems:'center', gap:10, letterSpacing:'-0.2px' }}>
                        <span style={{ display:'inline-block', width:4, height:18, background:ACCENT, borderRadius:2 }}/>
                        Compare nearby areas
                      </p>
                      {[report,...nearby].map(r => {
                        const m = PIN_META[r.pin_code]||{name:r.pin_code}
                        const isMain = r.pin_code === report.pin_code
                        const gc = GRADE_COLOR[r.grade]||'#888'
                        return (
                          <div key={r.pin_code} style={{ display:'flex', alignItems:'center', padding:'10px 0', borderBottom:`1px solid ${border}` }}>
                            <div style={{ width:4, height:36, borderRadius:2, background:isMain?ACCENT:'transparent', marginRight:12, flexShrink:0 }}/>
                            <div style={{ flex:1 }}>
                              <span style={{ fontSize:13, fontWeight:isMain?700:400, color:text }}>{m.name}</span>
                              {isMain && <span style={{ fontSize:10, background:ACCENT, color:'white', padding:'1px 6px', borderRadius:4, marginLeft:6, fontWeight:600 }}>THIS AREA</span>}
                              <p style={{ margin:'2px 0 0', fontSize:11, color:muted }}>{r.pin_code}</p>
                            </div>
                            <div style={{ textAlign:'right' }}>
                              <div style={{ fontSize:18, fontWeight:800, color:gc }}>{r.nqi_composite}</div>
                              <div style={{ fontSize:11, color:gc, fontWeight:600 }}>{r.grade}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Commute Reality Check */}
                  <CommuteChecker fromPin={report.pin_code} fromName={meta.name} dark={dark} />

                  {/* Methodology */}
                  <div style={{ background:card, border:`1px solid ${border}`, borderRadius:16, padding:20, marginBottom:12 }}>
                    <p style={{ margin:'0 0 12px', fontSize:16, fontWeight:700, color:text, display:'flex', alignItems:'center', gap:10, letterSpacing:'-0.2px' }}>
                      <span style={{ display:'inline-block', width:4, height:18, background:ACCENT, borderRadius:2 }}/>
                      Methodology & data sources
                    </p>
                    <div style={{ fontSize:12, color:muted, lineHeight:1.9 }}>
                      <p style={{ margin:'0 0 6px' }}>
                        <strong style={{color:text}}>Safety 30%</strong>
                        <span style={{ marginLeft:8, fontSize:10, background:'#f97316'+'20', color:'#f97316', padding:'1px 6px', borderRadius:4, fontWeight:600 }}>ESTIMATED</span>
                        <br/>Delhi Police Annual Report 2022-23. Cognizable IPC crimes per station, normalized 250–650 range. Last verified 2023.
                      </p>
                      <p style={{ margin:'0 0 6px' }}>
                        <strong style={{color:text}}>Infrastructure 25%</strong>
                        <span style={{ marginLeft:8, fontSize:10, background:'#f97316'+'20', color:'#f97316', padding:'1px 6px', borderRadius:4, fontWeight:600 }}>ESTIMATED</span>
                        <br/>DDA Master Plan 2021, DMRC Phase 4 station data, NHAI highway proximity, Smart Cities Mission. Last verified 2024.
                      </p>
                      <p style={{ margin:'0 0 6px' }}>
                        <strong style={{color:text}}>Air Quality 20%</strong>
                        <span style={{ marginLeft:8, fontSize:10, background:'#22c55e'+'25', color:'#22c55e', padding:'1px 6px', borderRadius:4, fontWeight:600 }}>LIVE</span>
                        <br/>CPCB real-time AQI via data.gov.in. PM2.5 and PM10 daily averages. Refreshed daily from government sensors.
                      </p>
                      <p style={{ margin:'0 0 6px' }}>
                        <strong style={{color:text}}>Power 15%</strong>
                        <span style={{ marginLeft:8, fontSize:10, background:'#f97316'+'20', color:'#f97316', padding:'1px 6px', borderRadius:4, fontWeight:600 }}>ESTIMATED</span>
                        <br/>BSES Rajdhani, BSES Yamuna, Tata Power and DHBVN annual reports. Outage frequency and monthly cut hours. Last verified 2023.
                      </p>
                      <p style={{ margin:'0 0 6px' }}>
                        <strong style={{color:text}}>Water, Roads, Sewerage</strong>
                        <span style={{ marginLeft:8, fontSize:10, background:'#f97316'+'20', color:'#f97316', padding:'1px 6px', borderRadius:4, fontWeight:600 }}>ESTIMATED</span>
                        <br/>DJB annual reports, MCD road surveys, PWD data. Shown in full report only. Last verified 2023–24.
                      </p>
                      <p style={{ margin:0 }}>
                        <strong style={{color:text}}>Schools 10%</strong>
                        <span style={{ marginLeft:8, fontSize:10, background:'#f97316'+'20', color:'#f97316', padding:'1px 6px', borderRadius:4, fontWeight:600 }}>ESTIMATED</span>
                        <br/>CBSE affiliation database. School density and pass percentage where available. Last verified 2023.
                      </p>
                    </div>

                    {/* Legal disclaimer box */}
                    <div style={{ marginTop:16, padding:'12px 14px', background: dark?'#1f1a0a':'#fffbeb', border:`1px solid ${dark?'#92400e44':'#fcd34d'}`, borderRadius:10 }}>
                      <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:600, color: dark?'#fbbf24':'#92400e' }}>Data disclaimer</p>
                      <p style={{ margin:0, fontSize:11, color: dark?'#d97706':'#b45309', lineHeight:1.7 }}>
                        Scores marked ESTIMATED are derived from publicly available government reports and municipal data, not real-time APIs. Data may not reflect current conditions. AsliVastu does not guarantee accuracy and is not liable for decisions made based on these scores. Always verify critical data independently before making a property purchase decision. Only Air Quality data is refreshed in real time.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Disclaimer — always shown */}
              <div style={{ margin:'40px 0 0', padding:'14px 16px', background: dark?'#1a1a1a':'#f9fafb', border:`1px solid ${border}`, borderRadius:12 }}>
                <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:600, color:muted }}>Important notice</p>
                <p style={{ margin:0, fontSize:11, color:muted, lineHeight:1.7 }}>
                  AsliVastu scores are data aggregations for informational and research purposes only. They do not constitute real estate, legal, or financial advice. Most data is estimated from government reports last verified in 2023–24 and may not reflect current conditions. Only Air Quality scores are updated in real time. Do not rely solely on these scores for property purchase decisions. AsliVastu and its creators accept no liability for losses arising from use of this information.
                </p>
                <p style={{ margin:'8px 0 0', fontSize:11, color:muted }}>
                  Scored {report && new Date(report.scored_at).toLocaleDateString('en-IN')} · {report && report.dimensions_scored} of 5 dimensions available
                </p>
              </div>

              {/* About the builder */}
              <div style={{ margin:'16px 0 0', padding:'20px 18px', background:card, border:`1px solid ${border}`, borderRadius:12, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                <img src="/IMG_6285.jpeg" alt="Gurshaan Singh Baweja" style={{
                  width:52, height:52, borderRadius:'50%', flexShrink:0,
                  objectFit:'cover', border:`2px solid ${ACCENT}66`,
                }} />
                <div style={{ flex:1, minWidth:200 }}>
                  <p style={{ margin:'0 0 2px', fontSize:13, fontWeight:700, color:text }}>Built by Gurshaan Singh Baweja</p>
                  <p style={{ margin:0, fontSize:12, color:muted, lineHeight:1.6 }}>
                    Tired of digging through a dozen government portals to check if a neighbourhood is actually safe, breathable and well-connected — so I built AsliVastu to put it all in one score.
                  </p>
                </div>
                <a href="https://www.linkedin.com/in/gurshaan-singh-baweja" target="_blank" rel="noopener noreferrer"
                  style={{ flexShrink:0, display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#0A66C2', color:'#fff', borderRadius:100, fontSize:12, fontWeight:600, textDecoration:'none' }}>
                  Connect on LinkedIn →
                </a>
              </div>

              {/* Correction / feedback channel for this specific pin — addresses
                  residents having no way to flag inaccurate or outdated data. */}
              <div style={{ margin:'12px 0 0', padding:'16px 18px', background:card, border:`1px solid ${border}`, borderRadius:12 }}>
                <p style={{ margin:'0 0 2px', fontSize:13, fontWeight:700, color:text }}>
                  Live in {meta ? meta.name : 'this area'}? Think this score is wrong?
                </p>
                <p style={{ margin:'0 0 10px', fontSize:12, color:muted, lineHeight:1.6 }}>
                  Flag outdated or inaccurate data, or add local context — it goes straight to me, not a black box.
                </p>
                <textarea
                  value={fbText} onChange={e => setFbText(e.target.value)}
                  placeholder={`What's inaccurate or missing for pin ${report.pin_code}?`}
                  rows={3}
                  style={{ width:'100%', boxSizing:'border-box', padding:'10px 12px', marginBottom:10, borderRadius:8, border:`1px solid ${border}`, background:subtle, color:text, fontSize:13, fontFamily:'inherit', resize:'vertical' }}
                />
                <button
                  onClick={sendFeedback}
                  disabled={!fbText.trim() || fbStatus === 'sending'}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px',
                    background: fbText.trim() ? ACCENT : subtle,
                    color: fbText.trim() ? '#fff' : muted, border:'none', borderRadius:100,
                    fontSize:12, fontWeight:600, cursor: fbText.trim() ? 'pointer' : 'default', opacity: fbStatus === 'sending' ? 0.7 : 1,
                  }}>
                  {fbStatus === 'sending' ? 'Sending…' : 'Send feedback on this pin →'}
                </button>
                {fbStatus === 'sent' && (
                  <p style={{ margin:'8px 0 0', fontSize:12, color:'#22c55e' }}>Thanks — got it.</p>
                )}
                {fbStatus === 'error' && (
                  <p style={{ margin:'8px 0 0', fontSize:12, color:'#ef4444' }}>{fbError || 'Could not send that — try again in a bit.'}</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
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
      props: { initialPin: pin, initialReport, initialAllScores, ogMeta },
    }
  } catch (e) {
    return {
      props: {
        initialPin: pin,
        initialReport: null,
        initialAllScores: [],
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
