import { useEffect, useRef } from 'react'
import { Analytics } from '@vercel/analytics/next'

// Site-wide custom cursor: an instant leading dot, a dashed ring that
// eases toward it, and two trailing particles that lag even further —
// same "chasing" language as the reference site. Skipped entirely on
// touch devices (no real mouse pointer to replace there).
function CustomCursor() {
  const dotRef  = useRef(null)
  const ringRef = useRef(null)
  const p1Ref   = useRef(null)
  const p2Ref   = useRef(null)

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    const pos   = { x: -100, y: -100 }
    const trail = { ring:{x:-100,y:-100}, p1:{x:-100,y:-100}, p2:{x:-100,y:-100} }
    let shown = false
    let raf

    const prevCursor = document.body.style.cursor
    document.body.style.cursor = 'none'

    function show() {
      if (shown) return
      shown = true;
      [dotRef, ringRef, p1Ref, p2Ref].forEach(r => { if (r.current) r.current.style.opacity = '1' })
    }
    function hide() {
      shown = false;
      [dotRef, ringRef, p1Ref, p2Ref].forEach(r => { if (r.current) r.current.style.opacity = '0' })
    }
    function onMove(e) {
      pos.x = e.clientX
      pos.y = e.clientY
      show()
    }
    function onDown() {
      if (ringRef.current) ringRef.current.style.width = ringRef.current.style.height = '20px'
    }
    function onUp() {
      if (ringRef.current) ringRef.current.style.width = ringRef.current.style.height = '26px'
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', hide)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)

    function tick() {
      trail.ring.x += (pos.x - trail.ring.x) * 0.4
      trail.ring.y += (pos.y - trail.ring.y) * 0.4
      trail.p1.x   += (trail.ring.x - trail.p1.x) * 0.45
      trail.p1.y   += (trail.ring.y - trail.p1.y) * 0.45
      trail.p2.x   += (trail.p1.x - trail.p2.x) * 0.45
      trail.p2.y   += (trail.p1.y - trail.p2.y) * 0.45
      if (dotRef.current)  dotRef.current.style.transform  = `translate(${pos.x - 4}px, ${pos.y - 4}px)`
      if (ringRef.current) ringRef.current.style.transform = `translate(${trail.ring.x - 13}px, ${trail.ring.y - 13}px)`
      if (p1Ref.current)   p1Ref.current.style.transform   = `translate(${trail.p1.x - 4}px, ${trail.p1.y - 4}px)`
      if (p2Ref.current)   p2Ref.current.style.transform   = `translate(${trail.p2.x - 3}px, ${trail.p2.y - 3}px)`
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', hide)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      cancelAnimationFrame(raf)
      document.body.style.cursor = prevCursor
    }
  }, [])

  const base = { position:'fixed', top:0, left:0, borderRadius:'50%', pointerEvents:'none', zIndex:9999, opacity:0, transition:'opacity 0.2s ease, width 0.15s ease, height 0.15s ease' }

  return (
    <>
      <div ref={p2Ref}   style={{ ...base, width:6,  height:6,  background:'#e2374455' }} />
      <div ref={p1Ref}   style={{ ...base, width:8,  height:8,  background:'#e2374480' }} />
      <div ref={ringRef} style={{ ...base, width:26, height:26, border:'1.5px dashed #e23744', boxSizing:'border-box' }} />
      <div ref={dotRef}  style={{ ...base, width:8,  height:8,  background:'#e23744' }} />
    </>
  )
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <style>{`
        @media (pointer: fine) {
          * { cursor: none !important; }
        }
      `}</style>
      <CustomCursor />
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
