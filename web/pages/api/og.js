import { ImageResponse } from '@vercel/og'
import { PIN_META } from '../../lib/pinMeta'

export const config = { runtime: 'edge' }

const GRADE_COLOR = {
  'A+': '#22c55e', 'A': '#22c55e', 'B+': '#84cc16',
  'B': '#eab308', 'C+': '#f97316', 'C': '#ef4444', 'D': '#dc2626'
}

const DIM_LABEL = { crime: 'Safety', infrastructure: 'Infrastructure', air: 'Air Quality', power: 'Power', schools: 'Schools' }
const DIM_ICON  = { crime: '🛡', infrastructure: '🏗', air: '🌬', power: '⚡', schools: '🎓' }

function getVerdict(composite) {
  if (composite >= 75) return { label: 'Strong Buy ✅', color: '#22c55e' }
  if (composite >= 60) return { label: 'Consider 🟡', color: '#eab308' }
  if (composite >= 45) return { label: 'Below Average ⚠️', color: '#f97316' }
  return { label: 'Avoid ❌', color: '#ef4444' }
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url)
  const pin = searchParams.get('pin')

  if (!pin) {
    return new Response('Missing pin', { status: 400 })
  }

  // Fetch report data
  let report = null
  try {
    const baseUrl = req.url.replace(/\/api\/og.*/, '')
    const res = await fetch(`${baseUrl}/api/report?pin=${pin}`)
    if (res.ok) report = await res.json()
  } catch (e) {
    // fallback to static render
  }

  const meta = PIN_META[pin] || { name: pin, area: 'Delhi NCR' }
  const scores = report?.scores || {}
  const composite = report?.nqi_composite || 0
  const grade = report?.grade || '—'
  const gradeColor = GRADE_COLOR[grade] || '#888'
  const verdict = getVerdict(composite)

  const dimEntries = Object.entries(scores).slice(0, 5)

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0f0f0f',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Red glow top */}
        <div style={{
          position: 'absolute', top: '-80px', left: '50%',
          transform: 'translateX(-50%)',
          width: '800px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(226,55,68,0.22) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Grid lines background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          display: 'flex',
        }} />

        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'linear-gradient(90deg, #e23744 0%, #e2374488 50%, transparent 100%)',
          display: 'flex',
        }} />

        {/* Main content */}
        <div style={{ display: 'flex', flex: 1, padding: '48px 56px', gap: '48px', position: 'relative' }}>

          {/* LEFT: area + score */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

            {/* Logo row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
              <div style={{
                width: '36px', height: '36px',
                background: '#e23744',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
              }}>🏠</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.3px' }}>AsliVastu</span>
                <span style={{ fontSize: '11px', color: '#e23744', marginTop: '1px' }}>Neighbourhood Intelligence</span>
              </div>
            </div>

            {/* Area label */}
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{meta.area}</span>
            </div>

            {/* Area name */}
            <div style={{ display: 'flex', marginBottom: '16px' }}>
              <span style={{ fontSize: '64px', fontWeight: 900, color: '#f0f0f0', letterSpacing: '-2px', lineHeight: 1 }}>{meta.name}</span>
            </div>

            {/* Pin */}
            <div style={{ display: 'flex', marginBottom: '28px' }}>
              <span style={{ fontSize: '16px', color: '#555', fontFamily: 'monospace' }}>Pin {pin}</span>
            </div>

            {/* Verdict pill */}
            <div style={{
              display: 'flex', alignItems: 'center',
              padding: '10px 18px',
              background: verdict.color + '18',
              border: `1px solid ${verdict.color}44`,
              borderLeft: `3px solid ${verdict.color}`,
              borderRadius: '8px',
              marginBottom: '32px',
              width: 'fit-content',
            }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: verdict.color }}>{verdict.label}</span>
            </div>

            {/* Bottom tag */}
            <div style={{ display: 'flex', marginTop: 'auto' }}>
              <span style={{ fontSize: '13px', color: '#333' }}>aslivastu.vercel.app · Free neighbourhood report</span>
            </div>
          </div>

          {/* RIGHT: score card + bars */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '380px', gap: '16px' }}>

            {/* Score card */}
            <div style={{
              background: '#161616',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px',
              padding: '28px 32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: `linear-gradient(90deg, ${gradeColor}, transparent)`,
                display: 'flex',
              }} />

              <div style={{ display: 'flex', fontSize: '13px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>NQI Score</div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '96px', fontWeight: 900, color: gradeColor, lineHeight: 1, letterSpacing: '-4px' }}>{composite}</span>
                <span style={{ fontSize: '48px', fontWeight: 700, color: gradeColor, opacity: 0.6 }}>{grade}</span>
              </div>

              <div style={{ display: 'flex', fontSize: '13px', color: '#555' }}>out of 100</div>
            </div>

            {/* Score bars */}
            <div style={{
              background: '#161616',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              {dimEntries.map(([key, val]) => {
                const barColor = val >= 80 ? '#22c55e' : val >= 60 ? '#84cc16' : val >= 40 ? '#f97316' : '#ef4444'
                return (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#aaa', display: 'flex', gap: '6px' }}>
                        {DIM_ICON[key]} {DIM_LABEL[key] || key}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: barColor }}>{val}/100</span>
                    </div>
                    <div style={{ height: '6px', background: '#1e1e1e', borderRadius: '99px', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${val}%`, height: '100%', background: barColor, borderRadius: '99px', display: 'flex' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
