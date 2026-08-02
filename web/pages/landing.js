import { useEffect, useRef, useState } from 'react'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --accent: #e23744;
    --bg: #080808;
    --text: #f0ede8;
    --muted: #555;
    --card: #111;
    --border: rgba(255,255,255,0.06);
  }

  html { scroll-behavior: auto; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
  }

  ::selection { background: var(--accent); color: white; }
  ::-webkit-scrollbar { width: 2px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--accent); }

  /* ── Progress bar ── */
  .progress {
    position: fixed; top: 0; left: 0;
    height: 2px; background: var(--accent);
    z-index: 200; transform-origin: left;
    transform: scaleX(0);
  }

  /* ── Nav ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 48px;
  }
  .nav-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px; letter-spacing: 2px;
    color: var(--text); text-decoration: none;
  }
  .nav-logo span { color: var(--accent); }
  .nav-cta {
    font-size: 13px; font-weight: 500;
    color: var(--text); text-decoration: none;
    border: 1px solid rgba(255,255,255,0.12);
    padding: 10px 22px; border-radius: 100px;
    transition: all 0.3s;
    backdrop-filter: blur(10px);
    background: rgba(255,255,255,0.03);
  }
  .nav-cta:hover { background: var(--accent); border-color: var(--accent); }

  /* ── HERO ── */
  .hero {
    height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    padding: 0 6vw;
    gap: 40px;
    position: relative;
    overflow: hidden;
  }

  .hero-left { position: relative; z-index: 2; }

  .hero-eyebrow {
    font-size: 11px; font-weight: 500;
    letter-spacing: 0.3em; text-transform: uppercase;
    color: var(--accent); margin-bottom: 28px;
    opacity: 0; transform: translateY(16px);
  }

  .hero-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(60px, 7vw, 108px);
    line-height: 0.92; letter-spacing: -0.01em;
    color: var(--text); margin-bottom: 28px;
    opacity: 0; transform: translateY(40px) perspective(600px) rotateX(10deg);
    transform-origin: bottom center;
  }

  .hero-title em {
    font-style: normal;
    color: transparent;
    -webkit-text-stroke: 1.5px rgba(240,237,232,0.25);
  }

  .hero-sub {
    font-size: 17px; font-weight: 300;
    color: #666; line-height: 1.75;
    max-width: 420px; margin-bottom: 40px;
    opacity: 0; transform: translateY(16px);
  }

  .hero-search {
    display: flex; max-width: 420px;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 100px; overflow: hidden;
    backdrop-filter: blur(20px);
    background: rgba(255,255,255,0.03);
    opacity: 0; transform: translateY(16px);
  }
  .hero-search input {
    flex: 1; background: transparent; border: none; outline: none;
    padding: 15px 22px; font-size: 14px;
    color: var(--text); font-family: 'DM Sans', sans-serif;
  }
  .hero-search input::placeholder { color: #444; }
  .hero-search button {
    background: var(--accent); border: none;
    padding: 15px 24px; color: white;
    font-size: 13px; font-weight: 500; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    border-radius: 0 100px 100px 0;
    white-space: nowrap; transition: opacity 0.2s;
  }
  .hero-search button:hover { opacity: 0.85; }

  /* ── 3D Card container ── */
  .hero-right {
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 2;
    perspective: 1200px;
    transform-style: preserve-3d;
  }

  .card-scene {
    width: 340px; height: 210px;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.1s ease-out;
  }

  /* The actual card */
  .holo-card {
    width: 100%; height: 100%;
    border-radius: 20px;
    position: relative;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%);
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.08),
      0 32px 80px rgba(0,0,0,0.8),
      0 0 60px rgba(226,55,68,0.15),
      inset 0 1px 0 rgba(255,255,255,0.1);
    overflow: hidden;
    transform-style: preserve-3d;
  }

  /* Holographic shimmer layer */
  .holo-shimmer {
    position: absolute; inset: 0;
    border-radius: 20px;
    background: linear-gradient(
      115deg,
      transparent 0%,
      rgba(255,255,255,0.03) 30%,
      rgba(226,55,68,0.08) 40%,
      rgba(255,200,100,0.06) 50%,
      rgba(100,200,255,0.06) 60%,
      rgba(255,255,255,0.03) 70%,
      transparent 100%
    );
    mix-blend-mode: screen;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .card-scene:hover .holo-shimmer { opacity: 1; }

  /* Glare sweep */
  .holo-glare {
    position: absolute; inset: -50%;
    background: radial-gradient(
      ellipse at var(--mx, 50%) var(--my, 50%),
      rgba(255,255,255,0.12) 0%,
      transparent 60%
    );
    pointer-events: none;
    border-radius: 20px;
    mix-blend-mode: screen;
  }

  /* Card content */
  .card-content {
    position: relative; z-index: 2;
    padding: 24px 28px; height: 100%;
    display: flex; flex-direction: column;
    justify-content: space-between;
  }

  .card-top {
    display: flex; justify-content: space-between; align-items: flex-start;
  }

  .card-brand {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px; letter-spacing: 3px;
    color: rgba(255,255,255,0.3);
  }

  .card-chip {
    width: 32px; height: 24px;
    background: linear-gradient(135deg, #d4a855, #f0c87a, #b8902a);
    border-radius: 5px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    position: relative; overflow: hidden;
  }
  .card-chip::after {
    content: '';
    position: absolute; inset: 0;
    background: repeating-linear-gradient(
      0deg, transparent, transparent 4px,
      rgba(0,0,0,0.15) 4px, rgba(0,0,0,0.15) 5px
    );
  }

  .card-mid {
    display: flex; flex-direction: column; gap: 2px;
  }

  .card-area {
    font-size: 10px; letter-spacing: 0.15em;
    text-transform: uppercase; color: rgba(255,255,255,0.35);
  }

  .card-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 30px; letter-spacing: 1px;
    color: rgba(255,255,255,0.9);
    line-height: 1;
  }

  .card-bottom {
    display: flex; justify-content: space-between; align-items: flex-end;
  }

  .card-score-block { display: flex; flex-direction: column; gap: 2px; }

  .card-score-label {
    font-size: 9px; letter-spacing: 0.2em;
    text-transform: uppercase; color: rgba(255,255,255,0.3);
  }

  .card-score-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 52px; line-height: 1; letter-spacing: -1px;
    color: #22c55e;
    text-shadow: 0 0 20px rgba(34,197,94,0.5);
  }

  .card-grade {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px; color: #22c55e;
    opacity: 0.7; margin-left: 4px;
  }

  .card-verdict {
    text-align: right;
  }

  .card-verdict-label {
    font-size: 9px; letter-spacing: 0.15em;
    text-transform: uppercase; color: rgba(255,255,255,0.3);
    display: block; margin-bottom: 4px;
  }

  .card-verdict-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px; letter-spacing: 1px;
    color: #22c55e;
  }

  /* Mini dimension dots */
  .card-dims {
    display: flex; gap: 6px; align-items: center;
  }

  .card-dim-dot {
    width: 6px; height: 6px; border-radius: 50%;
  }

  /* Glow rings behind card */
  .card-glow {
    position: absolute;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(226,55,68,0.12) 0%, transparent 65%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    animation: glowPulse 4s ease-in-out infinite;
  }

  @keyframes glowPulse {
    0%, 100% { opacity: 0.6; transform: translate(-50%,-50%) scale(1); }
    50% { opacity: 1; transform: translate(-50%,-50%) scale(1.1); }
  }

  /* Floating particles around card */
  .card-particle {
    position: absolute;
    width: 3px; height: 3px;
    border-radius: 50%;
    background: var(--accent);
    pointer-events: none;
    animation: floatParticle var(--dur, 4s) ease-in-out infinite var(--delay, 0s);
    opacity: 0;
  }

  @keyframes floatParticle {
    0%   { opacity: 0; transform: translate(0, 0) scale(1); }
    20%  { opacity: 0.8; }
    80%  { opacity: 0.4; }
    100% { opacity: 0; transform: translate(var(--tx, 20px), var(--ty, -40px)) scale(0.3); }
  }

  /* Scroll hint */
  .scroll-hint {
    position: absolute; bottom: 40px; left: 50%;
    transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    opacity: 0;
    animation: fadeIn 1s ease 2.8s forwards;
  }
  @keyframes fadeIn { to { opacity: 0.35; } }
  .scroll-line {
    width: 1px; height: 48px;
    background: linear-gradient(to bottom, transparent, var(--accent));
    animation: linePulse 2s ease-in-out infinite;
  }
  @keyframes linePulse {
    0%,100% { opacity: 0.4; transform: scaleY(1); }
    50%      { opacity: 1;   transform: scaleY(1.2); }
  }

  /* ── Background grid ── */
  .bg-grid {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
  }

  /* ── Noise ── */
  .noise {
    position: fixed; inset: 0; z-index: 50; pointer-events: none;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 200px;
  }

  /* ── PROBLEM ── */
  .problem {
    min-height: 100vh; display: flex; align-items: center;
    justify-content: center; padding: 120px 6vw;
    position: relative; z-index: 1;
  }
  .problem-inner { max-width: 900px; width: 100%; }
  .problem-label {
    font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--accent); margin-bottom: 48px; opacity: 0;
  }
  .problem-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(42px, 6vw, 84px); line-height: 1.05; color: var(--text);
  }
  .problem-word {
    display: inline-block; opacity: 0;
    transform: translateY(40px); margin-right: 0.22em;
  }
  .problem-word.accent { color: var(--accent); }
  .problem-word.faded  { color: #2a2a2a; }
  .problem-body {
    margin-top: 48px; font-size: 17px; font-weight: 300;
    color: #555; line-height: 1.85; max-width: 560px;
    opacity: 0; transform: translateY(20px);
  }
  .problem-body strong { color: var(--text); font-weight: 500; }

  /* ── DIMENSIONS ── */
  .dimensions {
    min-height: 100vh; padding: 120px 6vw;
    display: flex; flex-direction: column; align-items: center;
    position: relative; z-index: 1;
  }
  .section-label {
    font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--accent); margin-bottom: 20px;
    opacity: 0; transform: translateY(16px);
  }
  .section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 6vw, 80px);
    text-align: center; margin-bottom: 72px;
    opacity: 0; transform: translateY(24px);
  }
  .dim-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1px; max-width: 960px; width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.04);
    border-radius: 24px; overflow: hidden;
  }
  .dim-card {
    background: #080808; padding: 36px 28px;
    position: relative; overflow: hidden;
    opacity: 0; transform: translateY(40px) rotateX(18deg) scale(0.96);
    transform-origin: bottom center;
    transition: background 0.3s;
    cursor: default;
  }
  .dim-card::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at 0 0, rgba(226,55,68,0.07) 0%, transparent 70%);
    opacity: 0; transition: opacity 0.4s;
  }
  .dim-card:hover::before { opacity: 1; }
  .dim-card:hover { background: #0d0d0d; }
  .dim-num {
    font-size: 10px; letter-spacing: 0.2em;
    color: #252525; margin-bottom: 20px;
    font-family: 'Bebas Neue', sans-serif;
  }
  .dim-icon { font-size: 28px; margin-bottom: 14px; display: block; }
  .dim-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px; letter-spacing: 1px;
    color: var(--text); margin-bottom: 8px;
  }
  .dim-desc { font-size: 13px; font-weight: 300; color: #444; line-height: 1.6; }
  .dim-weight {
    position: absolute; bottom: 24px; right: 24px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 40px; color: var(--accent); opacity: 0.1; line-height: 1;
  }

  /* ── DEMO ── */
  .demo {
    min-height: 100vh; display: flex;
    align-items: center; padding: 120px 6vw;
    gap: 80px; position: relative; z-index: 1;
  }
  .demo-left { flex: 1; max-width: 480px; opacity: 0; transform: translateX(-40px); }
  .demo-right { flex: 1; max-width: 380px; opacity: 0; transform: translateX(40px); }
  .demo-label {
    font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--accent); margin-bottom: 20px;
  }
  .demo-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 5vw, 72px); line-height: 1; margin-bottom: 24px;
  }
  .demo-body {
    font-size: 16px; font-weight: 300; color: #555;
    line-height: 1.85; margin-bottom: 36px;
  }
  .demo-body strong { color: var(--text); font-weight: 500; }
  .demo-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 28px; background: var(--accent); color: white;
    border-radius: 100px; text-decoration: none;
    font-size: 14px; font-weight: 500; transition: opacity 0.2s;
  }
  .demo-btn:hover { opacity: 0.85; }
  .demo-card {
    background: #0e0e0e;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px; padding: 28px;
    position: relative; overflow: hidden;
  }
  .demo-card::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--accent), transparent);
  }
  .demo-area { font-size: 11px; color: #333; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 3px; }
  .demo-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 38px; letter-spacing: 1px; color: var(--text); margin-bottom: 20px;
  }
  .score-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 4px; }
  .score-num {
    font-family: 'Bebas Neue', sans-serif; font-size: 80px;
    line-height: 1; color: #22c55e; letter-spacing: -2px;
  }
  .score-grade { font-family: 'Bebas Neue', sans-serif; font-size: 44px; color: #22c55e; opacity: 0.7; }
  .score-lbl { font-size: 11px; color: #333; margin-bottom: 20px; letter-spacing: 0.05em; }
  .verdict-strip {
    padding: 10px 14px; border-left: 2px solid #22c55e;
    background: rgba(34,197,94,0.07); border-radius: 0 8px 8px 0; margin-bottom: 20px;
  }
  .verdict-name { font-weight: 600; color: #22c55e; font-size: 14px; display: block; margin-bottom: 3px; }
  .verdict-why { font-size: 12px; color: #444; line-height: 1.5; }
  .bars { display: flex; flex-direction: column; gap: 10px; }
  .bar-row { display: flex; align-items: center; gap: 10px; }
  .bar-lbl { font-size: 11px; color: #333; width: 72px; flex-shrink: 0; }
  .bar-track { flex: 1; height: 2px; background: #1a1a1a; border-radius: 99px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 99px; width: 0%; transition: width 1.2s cubic-bezier(0.16,1,0.3,1); }
  .bar-val { font-size: 11px; color: #333; width: 26px; text-align: right; }

  /* ── CTA ── */
  .cta-section {
    min-height: 100vh; display: flex; align-items: center;
    justify-content: center; text-align: center;
    padding: 120px 6vw; position: relative; z-index: 1; overflow: hidden;
  }
  .cta-glow {
    position: absolute; width: 700px; height: 700px; border-radius: 50%;
    background: radial-gradient(ellipse, rgba(226,55,68,0.1) 0%, transparent 70%);
    top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none;
    animation: glowPulse 5s ease-in-out infinite;
  }
  .cta-inner { position: relative; z-index: 1; opacity: 0; transform: translateY(40px); }
  .cta-pre {
    font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase;
    color: var(--accent); margin-bottom: 28px;
  }
  .cta-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(60px, 10vw, 130px); line-height: 0.92; margin-bottom: 48px;
  }
  .cta-title em {
    font-style: normal; color: transparent;
    -webkit-text-stroke: 1px rgba(240,237,232,0.18);
  }
  .cta-search {
    display: flex; max-width: 480px; width: 100%; margin: 0 auto 40px;
    border: 1px solid rgba(255,255,255,0.08); border-radius: 100px;
    overflow: hidden; background: rgba(255,255,255,0.02); backdrop-filter: blur(20px);
  }
  .cta-search input {
    flex: 1; background: transparent; border: none; outline: none;
    padding: 17px 26px; font-size: 15px;
    color: var(--text); font-family: 'DM Sans', sans-serif;
  }
  .cta-search input::placeholder { color: #333; }
  .cta-search button {
    background: var(--accent); border: none; padding: 17px 28px;
    color: white; font-size: 14px; font-weight: 500; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    border-radius: 0 100px 100px 0; transition: opacity 0.2s;
  }
  .cta-search button:hover { opacity: 0.85; }
  .cta-stats { display: flex; gap: 48px; justify-content: center; align-items: center; }
  .cta-stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 34px; color: var(--accent); display: block; }
  .cta-stat-lbl { font-size: 11px; color: #333; letter-spacing: 0.05em; }
  .cta-div { width: 1px; height: 36px; background: rgba(255,255,255,0.06); }

  /* ── Footer ── */
  .footer {
    padding: 36px 6vw; border-top: 1px solid rgba(255,255,255,0.04);
    display: flex; justify-content: space-between; align-items: center;
    position: relative; z-index: 1;
  }
  .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 2px; color: #222; }
  .footer-note { font-size: 12px; color: #222; }
`

const DIMS = [
  { icon:'🛡', name:'Safety',         desc:'Crime rate per station from Delhi Police Annual Report', weight:'30%', num:'01' },
  { icon:'🏗', name:'Infrastructure', desc:'Metro access, highway proximity, Smart City coverage',   weight:'25%', num:'02' },
  { icon:'🌬', name:'Air Quality',    desc:'Live AQI from CPCB monitoring stations. Updated daily.', weight:'20%', num:'03' },
  { icon:'⚡', name:'Power',          desc:'Outage frequency and hours from BSES, Tata, DHBVN',      weight:'15%', num:'04' },
  { icon:'🎓', name:'Schools',        desc:'CBSE school density near pin code. 2018 dataset.',       weight:'10%', num:'05' },
  { icon:'💧', name:'Water & Roads',  desc:'DJB supply hours, TDS levels, MCD road condition',       weight:'+',   num:'06' },
]

const DEMO_BARS = [
  { label:'Safety',  val:85, color:'#22c55e' },
  { label:'Infra',   val:45, color:'#84cc16' },
  { label:'Air',     val:100,color:'#22c55e' },
  { label:'Power',   val:78, color:'#22c55e' },
  { label:'Schools', val:96, color:'#22c55e' },
]

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  top:   `${20 + Math.random() * 60}%`,
  left:  `${10 + Math.random() * 80}%`,
  dur:   `${3 + Math.random() * 4}s`,
  delay: `${Math.random() * 4}s`,
  tx:    `${(Math.random() - 0.5) * 60}px`,
  ty:    `${-20 - Math.random() * 60}px`,
}))

export default function Landing() {
  const progressRef   = useRef(null)
  const heroEyebrow   = useRef(null)
  const heroTitle     = useRef(null)
  const heroSub       = useRef(null)
  const heroSearch    = useRef(null)
  const heroRight     = useRef(null)
  const cardScene     = useRef(null)
  const glareRef      = useRef(null)
  const shimmerRef    = useRef(null)
  const trailCanvas   = useRef(null)
  const spinDone      = useRef(false)
  const isoCanvas     = useRef(null)
  const [scoreNum, setScoreNum]     = useState(0)
  const [barsActive, setBarsActive] = useState(false)
  const [heroQ, setHeroQ]           = useState('')
  const [ctaQ, setCtaQ]             = useState('')

  const go = (q) => {
    if (q.trim()) window.location.href = `/?q=${encodeURIComponent(q.trim())}`
    else window.location.href = '/'
  }

  // ── Particle trail ──
  useEffect(() => {
    const canvas = trailCanvas.current
    if (!canvas) return
    const ctx2d = canvas.getContext('2d')
    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const dots = []
    let animId

    const spawn = () => {
      const scene = cardScene.current
      if (!scene) return
      const rect  = scene.getBoundingClientRect()
      const cRect = canvas.getBoundingClientRect()
      const cx = rect.left - cRect.left + rect.width  / 2
      const cy = rect.top  - cRect.top  + rect.height / 2

      for (let i = 0; i < 4; i++) {
        const angle  = Math.random() * Math.PI * 2
        const radius = rect.width * (0.28 + Math.random() * 0.32)
        dots.push({
          x:     cx + Math.cos(angle) * radius,
          y:     cy + Math.sin(angle) * radius * 0.55,
          vx:    (Math.random() - 0.5) * 0.5,
          vy:    -0.2 - Math.random() * 0.5,
          r:     0.8 + Math.random() * 1.6,
          life:  0.7 + Math.random() * 0.3,
          decay: 0.01 + Math.random() * 0.008,
        })
      }
    }

    const draw = () => {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = dots.length - 1; i >= 0; i--) {
        const d = dots[i]
        d.life -= d.decay
        d.x   += d.vx
        d.y   += d.vy
        d.vy  *= 0.98
        if (d.life <= 0) { dots.splice(i, 1); continue }

        const g = ctx2d.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 5)
        g.addColorStop(0,   `rgba(255,255,255,${(d.life * 0.85).toFixed(2)})`)
        g.addColorStop(0.35,`rgba(255,230,230,${(d.life * 0.25).toFixed(2)})`)
        g.addColorStop(1,   `rgba(255,255,255,0)`)
        ctx2d.fillStyle = g
        ctx2d.beginPath()
        ctx2d.arc(d.x, d.y, d.r * 5, 0, Math.PI * 2)
        ctx2d.fill()
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    window.__spawnTrailOrb = spawn

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      delete window.__spawnTrailOrb
    }
  }, [])

  // ── 3D card mouse tracking + idle float ──
  useEffect(() => {
    const scene = cardScene.current
    const glare = glareRef.current
    if (!scene) return

    let raf
    let tx = 0, ty = 0, cx = 0, cy = 0
    let t = 0
    let isSpinning = true
    window.__cardSpinDone = () => { isSpinning = false }

    const onMove = (e) => {
      if (isSpinning) return
      const rect = scene.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      tx = ((y - rect.height / 2) / (rect.height / 2)) * 20
      ty = ((x - rect.width  / 2) / (rect.width  / 2)) * -26
      if (glare) {
        glare.style.setProperty('--mx', `${(x / rect.width  * 100)}%`)
        glare.style.setProperty('--my', `${(y / rect.height * 100)}%`)
      }
    }

    const onLeave = () => { if (!isSpinning) { tx = 0; ty = 0 } }

    const loop = () => {
      if (!isSpinning) {
        cx += (tx - cx) * 0.07
        cy += (ty - cy) * 0.07
        if (Math.abs(tx) < 0.5 && Math.abs(ty) < 0.5) {
          t += 0.003
          const rx = Math.sin(t)        * 18
          const ry = Math.cos(t * 0.55) * 24
          const tz = Math.sin(t * 0.8)  * 22
          scene.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(${tz}px)`
        } else {
          scene.style.transform = `rotateX(${cx}deg) rotateY(${cy}deg)`
        }
      }
      raf = requestAnimationFrame(loop)
    }

    scene.addEventListener('mousemove', onMove)
    scene.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      scene.removeEventListener('mousemove', onMove)
      scene.removeEventListener('mouseleave', onLeave)
      delete window.__cardSpinDone
    }
  }, [])

  // ── Isometric neighbourhood Three.js scene ──
  useEffect(() => {
    const canvas = isoCanvas.current
    if (!canvas) return
    let renderer, animId
    let t = 0

    const init = async () => {
      const THREE = await import('three')

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      renderer.setSize(520, 520)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.1

      const scene = new THREE.Scene()

      // Orthographic isometric camera
      const d = 8
      const camera = new THREE.OrthographicCamera(-d, d, d, -d, 0.1, 200)
      camera.position.set(10, 10, 10)
      camera.lookAt(0, 0, 0)

      // Lighting
      scene.add(new THREE.AmbientLight(0xfff0e0, 0.6))
      const sun = new THREE.DirectionalLight(0xffffff, 1.3)
      sun.position.set(8, 16, 8)
      sun.castShadow = true
      sun.shadow.mapSize.set(2048, 2048)
      sun.shadow.camera.left = -12; sun.shadow.camera.right = 12
      sun.shadow.camera.top  =  12; sun.shadow.camera.bottom = -12
      sun.shadow.camera.near = 1;   sun.shadow.camera.far = 60
      sun.shadow.bias = -0.001
      scene.add(sun)
      const fill = new THREE.DirectionalLight(0x88aaff, 0.35)
      fill.position.set(-8, 6, -6); scene.add(fill)

      // ── Helpers ──
      const M = (color, rough=0.82, metal=0) =>
        new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })

      const box = (w, h, d, color, x, y, z, rough=0.82, metal=0) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(color, rough, metal))
        m.position.set(x, y, z)
        m.castShadow = true; m.receiveShadow = true
        scene.add(m); return m
      }

      const cyl = (rt, rb, h, segs, color, x, y, z, rough=0.7, metal=0) => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), M(color, rough, metal))
        m.position.set(x, y, z)
        m.castShadow = true; m.receiveShadow = true
        scene.add(m); return m
      }

      // ═══════════════════════════════════════
      // LAYOUT (top-down view, Y is up)
      //   Block is 12x12 units centered at 0,0
      //   Quadrants:
      //   TL(-3,-3) TR(+3,-3) BR(+3,+3) BL(-3,+3)
      //   Roads: X-axis (z=0) and Z-axis (x=0)
      // ═══════════════════════════════════════

      // Ground
      box(12, 0.4, 12, 0x5a9e6a, 0, -0.2, 0, 0.9)   // grass
      box(12, 0.7, 12, 0x8b6545, 0, -0.75, 0, 0.95)  // dirt 1
      box(12, 0.5, 12, 0x5c4232, 0, -1.25, 0, 0.95)  // dirt 2

      // Roads
      box(12, 0.06, 1.6, 0x2e2e2e, 0, 0.03, 0, 0.99) // horizontal
      box(1.6, 0.06, 12, 0x2e2e2e, 0, 0.03, 0, 0.99) // vertical
      // Kerbs
      ;[-0.82, 0.82].forEach(s => {
        box(12, 0.07, 0.1, 0xaaaaaa, 0, 0.035, s, 0.8)
        box(0.1, 0.07, 12, 0xaaaaaa, s, 0.035, 0, 0.8)
      })
      // Centre line dashes
      for (let i = -4.5; i <= 4.5; i += 1.6) {
        if (Math.abs(i) < 0.9) continue
        box(0.8, 0.07, 0.08, 0xffffff, i, 0.065, 0, 0.9)
        box(0.08, 0.07, 0.8, 0xffffff, 0, 0.065, i, 0.9)
      }

      // ── HOUSE — bottom-left quadrant ──
      // Foundation
      box(2.2, 0.15, 2.2, 0xc8b89a, -3.2, 0.075, 3.2, 0.9)
      // Walls
      box(2.0, 1.4, 2.0, 0xf2e4cc, -3.2, 0.87, 3.2, 0.82)
      // Roof
      const roofGeo = new THREE.ConeGeometry(1.55, 0.85, 4)
      const roofM = new THREE.Mesh(roofGeo, M(0xc0392b, 0.75))
      roofM.rotation.y = Math.PI/4; roofM.position.set(-3.2, 2.0, 3.2)
      roofM.castShadow = true; scene.add(roofM)
      // Chimney
      box(0.24, 0.6, 0.24, 0xaa8866, -2.7, 2.2, 2.7, 0.9)
      box(0.3, 0.07, 0.3, 0x887755, -2.7, 2.55, 2.7, 0.9)
      // Door
      box(0.28, 0.5, 0.05, 0x7a4f2e, -3.2, 0.35, 2.22, 0.85)
      // Windows
      ;[-3.55, -2.85].forEach(wx => {
        box(0.38, 0.32, 0.05, 0xc8ecff, wx, 0.9, 2.23, 0.1, 0.1)
        box(0.04, 0.32, 0.05, 0xdddddd, wx, 0.9, 2.23, 0.5)
        box(0.38, 0.04, 0.05, 0xdddddd, wx, 0.9, 2.23, 0.5)
      })
      // Garden fence
      for (let fi = -4.0; fi <= -2.3; fi += 0.4) {
        box(0.06, 0.3, 0.06, 0xddccaa, fi, 0.18, 1.95, 0.8)
      }
      box(1.8, 0.05, 0.06, 0xddccaa, -3.15, 0.33, 1.95, 0.8)

      // ── HOSPITAL — top-left quadrant ──
      box(2.4, 0.15, 2.2, 0xd0d5da, -3.2, 0.075, -3.2, 0.8)
      box(2.2, 1.9, 2.0, 0xeef2f6, -3.2, 1.1, -3.2, 0.7)
      box(2.3, 0.18, 2.1, 0x2980b9, -3.2, 2.09, -3.2, 0.5, 0.2)
      box(2.2, 0.1, 2.0, 0xdce8f0, -3.2, 2.23, -3.2, 0.8)
      // Red cross on roof
      box(0.14, 0.06, 0.6, 0xe23744, -3.2, 2.35, -3.2)
      box(0.6, 0.06, 0.14, 0xe23744, -3.2, 2.35, -3.2)
      // Windows
      ;[-3.6, -3.2, -2.8].forEach(wx => {
        box(0.32, 0.32, 0.05, 0xb8d8f0, wx, 0.85, -2.22, 0.1)
        box(0.32, 0.32, 0.05, 0xb8d8f0, wx, 1.45, -2.22, 0.1)
      })

      // ── SCHOOL — top-right quadrant ──
      box(2.4, 0.15, 2.0, 0xd4941a, 3.2, 0.075, -3.2, 0.85)
      box(2.2, 1.7, 1.8, 0xf0a820, 3.2, 0.975, -3.2, 0.75)
      box(2.3, 0.18, 1.9, 0xa06810, 3.2, 1.89, -3.2, 0.6)
      box(2.2, 0.1, 1.8, 0xe8d080, 3.2, 2.04, -3.2, 0.8)
      // Windows
      ;[2.7, 3.2, 3.7].forEach(wx => {
        box(0.36, 0.36, 0.05, 0xc8ecff, wx, 0.8, -2.32, 0.1)
        box(0.36, 0.36, 0.05, 0xc8ecff, wx, 1.3, -2.32, 0.1)
      })
      // Flagpole
      box(0.04, 1.0, 0.04, 0x888888, 4.2, 2.6, -4.1, 0.5, 0.5)
      box(0.42, 0.2, 0.03, 0xe23744, 4.42, 2.95, -4.1, 0.6)

      // ── APARTMENT — bottom-right quadrant ──
      box(2.2, 0.15, 2.2, 0xb0a090, 3.2, 0.075, 3.2, 0.85)
      box(2.0, 2.8, 2.0, 0xd5cbbf, 3.2, 1.55, 3.2, 0.78)
      box(2.1, 0.18, 2.1, 0x8899b0, 3.2, 3.05, 3.2, 0.5, 0.2)
      box(2.0, 0.1, 2.0, 0xcdd5de, 3.2, 3.2, 3.2, 0.8)
      // Windows grid
      for (let fl = 0; fl < 3; fl++) {
        ;[2.8, 3.2, 3.6].forEach(wx => {
          box(0.3, 0.28, 0.05, 0xaaddee, wx, 0.7 + fl*0.9, 2.22, 0.1)
        })
        // Balcony slab
        box(2.0, 0.05, 0.25, 0xb0b8c0, 3.2, 0.52 + fl*0.9, 2.35, 0.7)
      }

      // ── POWER TOWER — near centre-right, beside vertical road ──
      const tMat = M(0x99aabc, 0.5, 0.5)
      const tower = (x, z) => {
        const g = new THREE.Group()
        // 4 legs
        ;[[-0.22,-0.22],[0.22,-0.22],[-0.22,0.22],[0.22,0.22]].forEach(([lx,lz]) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.055, 2.2, 0.055), tMat)
          leg.position.set(lx, 1.1, lz)
          leg.rotation.z = lx < 0 ? 0.07 : -0.07
          leg.rotation.x = lz < 0 ? 0.07 : -0.07
          g.add(leg)
        })
        ;[0.4, 0.9, 1.5, 2.1].forEach(y => {
          const sc = 1 - y*0.1
          const bx = new THREE.Mesh(new THREE.BoxGeometry(0.55*sc, 0.04, 0.04), tMat)
          bx.position.set(0, y, 0); g.add(bx)
          const bz = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.55*sc), tMat)
          bz.position.set(0, y, 0); g.add(bz)
        })
        // Top arm
        const arm = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.04), tMat)
        arm.position.set(0, 2.2, 0); g.add(arm)
        ;[-0.45, 0, 0.45].forEach(ax => {
          const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 5), M(0xddddcc, 0.7))
          ins.position.set(ax, 2.15, 0); g.add(ins)
        })
        g.position.set(x, 0, z); scene.add(g)
        return g
      }
      tower(4.8, -3.5)
      tower(4.8,  3.5)

      // Power lines connecting towers
      const lineMat = new THREE.LineBasicMaterial({ color: 0x556677 })
      ;[-0.35, 0, 0.35].forEach(ax => {
        const pts = [
          new THREE.Vector3(4.8+ax, 2.22, -3.5),
          new THREE.Vector3(4.8+ax, 2.08,  0.0),
          new THREE.Vector3(4.8+ax, 2.22,  3.5),
        ]
        const curve = new THREE.CatmullRomCurve3(pts)
        const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(24))
        scene.add(new THREE.Line(geo, lineMat))
      })

      // ── WATER — front-right corner flowing off edge ──
      // Pool on grass
      box(2.0, 0.06, 1.6, 0x4a6a88, 4.2, 0.03, 4.8, 0.7)  // pool floor
      // Stone rim (3 sides, open at z=+6 edge)
      box(2.2, 0.18, 0.1, 0x7a8898, 4.2, 0.09, 3.92, 0.7)  // back rim
      box(0.1, 0.18, 1.6, 0x7a8898, 3.12, 0.09, 4.8, 0.7)  // left rim
      box(0.1, 0.18, 1.6, 0x7a8898, 5.28, 0.09, 4.8, 0.7)  // right rim

      // Water surface — flat, no vertex morphing
      const wSurfGeo = new THREE.PlaneGeometry(1.96, 1.56, 1, 1)
      const wSurfMat = new THREE.MeshStandardMaterial({
        color: 0x1e90ff, roughness: 0.05, metalness: 0.55,
        transparent: true, opacity: 0.88,
      })
      const wSurf = new THREE.Mesh(wSurfGeo, wSurfMat)
      wSurf.rotation.x = -Math.PI / 2
      wSurf.position.set(4.2, 0.16, 4.8)
      scene.add(wSurf)

      // Waterfall — pure particle cascade falling off block edge
      const wfN = 80
      const wfArr  = new Float32Array(wfN * 3)
      const wfVY   = []  // fall speed per particle
      const wfPhase = [] // stagger start
      for (let i = 0; i < wfN; i++) {
        wfArr[i*3]   = 3.3 + Math.random() * 1.8   // X spread across pool width
        wfArr[i*3+1] = 0.16 - Math.random() * 1.8  // Y: start at water surface, fall down
        wfArr[i*3+2] = 6.02 + Math.random() * 0.12 // Z: just past block edge
        wfVY.push(0.04 + Math.random() * 0.04)
        wfPhase.push(Math.random() * 100)
      }
      const wfGeo = new THREE.BufferGeometry()
      wfGeo.setAttribute('position', new THREE.BufferAttribute(wfArr, 3))
      // Two layers: fine mist + chunky drops
      const wfMat1 = new THREE.PointsMaterial({ color: 0x88ccff, size: 0.07, transparent: true, opacity: 0.65, sizeAttenuation: true })
      const wfMat2 = new THREE.PointsMaterial({ color: 0xaaddff, size: 0.14, transparent: true, opacity: 0.4,  sizeAttenuation: true })
      scene.add(new THREE.Points(wfGeo, wfMat1))

      const wfGeo2 = new THREE.BufferGeometry()
      const wfArr2 = new Float32Array(wfN * 3)
      wfArr.forEach((v,i) => { wfArr2[i] = v })
      wfGeo2.setAttribute('position', new THREE.BufferAttribute(wfArr2, 3))
      scene.add(new THREE.Points(wfGeo2, wfMat2))

      // Splash at base
      const splashN = 24
      const splashArr = new Float32Array(splashN * 3)
      const splashVX  = [], splashVY2 = []
      for (let i = 0; i < splashN; i++) {
        splashArr[i*3]   = 3.3 + Math.random() * 1.8
        splashArr[i*3+1] = -1.55
        splashArr[i*3+2] = 6.05 + Math.random() * 0.5
        splashVX.push((Math.random()-0.5) * 0.012)
        splashVY2.push(0.01 + Math.random() * 0.02)
      }
      const splashGeo = new THREE.BufferGeometry()
      splashGeo.setAttribute('position', new THREE.BufferAttribute(splashArr, 3))
      scene.add(new THREE.Points(splashGeo,
        new THREE.PointsMaterial({ color: 0xcceeff, size: 0.09, transparent: true, opacity: 0.6, sizeAttenuation: true })
      ))

      // ── Trees ──
      const tree = (x, z, h=0.9, r=0.4, col=0x2d8a4e) => {
        cyl(0.065, 0.09, h*0.42, 6, 0x6b4223, x, h*0.21, z)
        const f1 = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), M(col, 0.85))
        f1.position.set(x, h*0.42+h*0.28, z); f1.castShadow = true; scene.add(f1)
        const f2 = new THREE.Mesh(new THREE.ConeGeometry(r*0.62, h*0.55, 7), M(col, 0.85))
        f2.position.set(x, h*0.42+h*0.72, z); f2.castShadow = true; scene.add(f2)
      }
      tree(-1.4, 4.5, 1.0, 0.42, 0x268a40)
      tree(-4.5, 1.5, 1.1, 0.46, 0x226e35)
      tree( 1.2, 4.8, 0.8, 0.36, 0x2d8a4e)
      tree(-4.8, -1.2, 1.2, 0.48, 0x226e35)
      tree( 1.0, -4.5, 0.9, 0.40, 0x2d8a4e)
      tree(-1.5, -4.8, 0.85, 0.38, 0x268a40)
      tree( 5.5, 1.5, 0.75, 0.32, 0x2d8a4e)
      tree(-5.2, 4.2, 0.9, 0.40, 0x226e35)

      // Bushes
      const bush = (x, z) => {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.26, 7, 5), M(0x3a8a40, 0.88))
        b.scale.y = 0.6; b.position.set(x, 0.16, z); b.castShadow = true; scene.add(b)
      }
      bush(-1.2, 2.3); bush(-4.5, -4.2); bush(4.8, -1.5); bush(2.2, -4.5)

      // ── Cars ──
      const car = (bodyCol, roofCol) => {
        const g = new THREE.Group()
        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.18, 0.42), M(bodyCol, 0.3, 0.3))
        body.position.y = 0.12; g.add(body)
        // Cabin
        const cab = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.17, 0.36), M(roofCol, 0.35))
        cab.position.set(-0.04, 0.275, 0); g.add(cab)
        // Windshields
        const wsMat = M(0xaaddff, 0.05, 0.8)
        ;[0.17, -0.24].forEach(wx => {
          const ws = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.13, 0.3), wsMat)
          ws.position.set(wx, 0.275, 0); g.add(ws)
        })
        // Wheels
        const wGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.07, 8)
        const wMat = M(0x1a1a1a, 0.95)
        ;[[-0.24,-0.17],[-0.24,0.17],[0.24,-0.17],[0.24,0.17]].forEach(([wx,wz]) => {
          const wh = new THREE.Mesh(wGeo, wMat)
          wh.rotation.x = Math.PI/2; wh.position.set(wx, 0.09, wz); g.add(wh)
        })
        g.castShadow = true; scene.add(g); return g
      }
      const car1 = car(0xd63031, 0xb02020)  // red
      const car2 = car(0x2980b9, 0x1a6090)  // blue
      const car3 = car(0xf0a020, 0xc07010)  // yellow
      const car4 = car(0x27ae60, 0x1a7a40)  // green

      // ── People ──
      const person = (col) => {
        const g = new THREE.Group()
        const legMat = M(0x334466, 0.9)
        ;[-0.05, 0.05].forEach(lx => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.16, 0.065), legMat)
          leg.position.set(lx, 0.08, 0); g.add(leg)
        })
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.2, 0.11), M(col, 0.85))
        torso.position.y = 0.26; g.add(torso)
        ;[-0.11, 0.11].forEach(ax => {
          const arm = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.16, 0.065), M(col, 0.85))
          arm.position.set(ax, 0.25, 0); g.add(arm)
        })
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.085, 6, 5), M(0xf5c8a0, 0.85))
        head.position.y = 0.44; g.add(head)
        g.castShadow = true; scene.add(g); return g
      }
      const people = [
        { m: person(0x3a5fd5), x: -4.5, z: -1.5, ph: 0,   r: 0.35 },
        { m: person(0xe05020), x:  4.2, z: -3.5, ph: 1.8, r: 0.32 },
        { m: person(0x20a060), x: -1.0, z:  3.5, ph: 3.0, r: 0.3  },
        { m: person(0x9b59b6), x: -3.8, z:  1.8, ph: 0.9, r: 0.3  },
      ]

      // ── Clouds ──
      const cloud = (x, y, z, s=1) => {
        const g = new THREE.Group()
        const cMat = M(0xffffff, 1.0)
        ;[[0,0,0,1],[0.7,0,0,0.7],[-0.6,0,0,0.65],[0.25,0.38,0,0.6],[-0.15,0.35,0,0.55]].forEach(([px,py,pz,pr]) => {
          const p = new THREE.Mesh(new THREE.SphereGeometry(pr*s, 7, 5), cMat)
          p.position.set(px*s, py*s, pz*s); g.add(p)
        })
        g.position.set(x, y, z); scene.add(g); return g
      }
      const clouds = [
        cloud(-4, 5.5, -3, 0.6),
        cloud( 3, 6.0, -5, 0.5),
        cloud( 5, 5.2,  0, 0.55),
        cloud(-1, 5.8,  4, 0.45),
        cloud( 1, 5.0, -1, 0.4),
      ]

      // ── Sparks on towers ──
      const sparkN = 36
      const sparkArr = new Float32Array(sparkN * 3)
      const sparkLife = new Float32Array(sparkN)
      const towerZs = [-3.5, 3.5, -3.5]
      for (let i = 0; i < sparkN; i++) {
        sparkLife[i] = Math.random()
        sparkArr[i*3]   = 4.5 + Math.random() * 0.7
        sparkArr[i*3+1] = 1.5 + Math.random() * 1.5
        sparkArr[i*3+2] = towerZs[i % 3] + (Math.random()-0.5)*0.4
      }
      const sparkGeo = new THREE.BufferGeometry()
      sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkArr, 3))
      const sparkMat = new THREE.PointsMaterial({ color: 0xffd700, size: 0.065, transparent: true, opacity: 0.9, sizeAttenuation: true })
      scene.add(new THREE.Points(sparkGeo, sparkMat))

      // ── Smoke ──
      const smokeN = 18
      const smokeArr = new Float32Array(smokeN * 3)
      const smokeVY  = []
      for (let i = 0; i < smokeN; i++) {
        smokeArr[i*3]   = -0.3 + (Math.random()-0.5)*0.2
        smokeArr[i*3+1] = 1.5 + Math.random()*2
        smokeArr[i*3+2] = -0.3 + (Math.random()-0.5)*0.2
        smokeVY.push(0.007 + Math.random()*0.005)
      }
      const smokeGeo = new THREE.BufferGeometry()
      smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokeArr, 3))
      const smokeMat = new THREE.PointsMaterial({ color: 0xaabbcc, size: 0.22, transparent: true, opacity: 0.22, sizeAttenuation: true })
      scene.add(new THREE.Points(smokeGeo, smokeMat))

      // ── Rotation ──
      let rotY = 0.5
      let drag = false, prevX = 0
      canvas.addEventListener('mousedown', e => { drag = true; prevX = e.clientX })
      window.addEventListener('mouseup',   () => { drag = false })
      window.addEventListener('mousemove', e => {
        if (!drag) return
        rotY += (e.clientX - prevX) * 0.008; prevX = e.clientX
      })

      // ── Animate ──
      const animate = () => {
        animId = requestAnimationFrame(animate)
        t += 0.016
        if (!drag) rotY += 0.0022
        scene.rotation.y = rotY

        // Cars — continuous loop along roads
        const spd = 4.5
        car1.position.set(-6 + ((t*1.6)%12), 0.09, 0.58)
        car1.rotation.y = 0
        car2.position.set(0.58, 0.09, 6 - ((t*1.3+3)%12))
        car2.rotation.y = -Math.PI/2
        car3.position.set(6 - ((t*1.4+6)%12), 0.09, -0.58)
        car3.rotation.y = Math.PI
        car4.position.set(-0.58, 0.09, -6 + ((t*1.1+1.5)%12))
        car4.rotation.y = Math.PI/2

        // People wander
        people.forEach(p => {
          const a = t*0.28 + p.ph
          const bob = Math.abs(Math.sin(t*4+p.ph))*0.035
          p.m.position.set(p.x + Math.cos(a)*p.r, bob, p.z + Math.sin(a)*p.r)
          p.m.rotation.y = -a
        })

        // Water surface shimmer
        wSurfMat.opacity = 0.82 + Math.sin(t*2)*0.06

        // Waterfall particles — fall down, reset at top
        const wfp1 = wfGeo.attributes.position.array
        const wfp2 = wfGeo2.attributes.position.array
        for (let i = 0; i < wfN; i++) {
          wfp1[i*3+1] -= wfVY[i]
          wfp2[i*3+1] -= wfVY[i] * 0.85
          // Slight horizontal drift for natural look
          wfp1[i*3]   += Math.sin(t*3 + wfPhase[i]) * 0.002
          wfp2[i*3]   += Math.sin(t*2.5 + wfPhase[i]+1) * 0.002
          // Reset when below block base
          if (wfp1[i*3+1] < -1.6) {
            wfp1[i*3]   = 3.3 + Math.random()*1.8
            wfp1[i*3+1] = 0.14
            wfp1[i*3+2] = 6.02 + Math.random()*0.1
            wfp2[i*3]   = wfp1[i*3]
            wfp2[i*3+1] = 0.14
            wfp2[i*3+2] = wfp1[i*3+2]
          }
        }
        wfGeo.attributes.position.needsUpdate = true
        wfGeo2.attributes.position.needsUpdate = true
        wfMat1.opacity = 0.55 + Math.sin(t*4)*0.1
        wfMat2.opacity = 0.32 + Math.sin(t*3)*0.08

        // Splash at base
        const sp = splashGeo.attributes.position.array
        for (let i = 0; i < splashN; i++) {
          sp[i*3]   += splashVX[i]
          sp[i*3+1] += splashVY2[i]
          splashVY2[i] -= 0.001  // gravity
          if (sp[i*3+1] < -1.62 || sp[i*3+1] > -1.3) {
            sp[i*3]      = 3.3 + Math.random()*1.8
            sp[i*3+1]    = -1.55
            sp[i*3+2]    = 6.05 + Math.random()*0.5
            splashVX[i]  = (Math.random()-0.5)*0.012
            splashVY2[i] = 0.01 + Math.random()*0.02
          }
        }
        splashGeo.attributes.position.needsUpdate = true

        // Clouds drift
        clouds.forEach((c, ci) => {
          c.position.x += 0.0018 * (ci%2===0?1:-1)
          if (c.position.x >  9) c.position.x = -9
          if (c.position.x < -9) c.position.x =  9
        })

        // Sparks
        const sk = sparkGeo.attributes.position.array
        for (let i = 0; i < sparkN; i++) {
          sparkLife[i] -= 0.04
          sk[i*3+1] += 0.018
          if (sparkLife[i] <= 0 || sk[i*3+1] > 3.2) {
            sparkLife[i] = 0.6 + Math.random()*0.4
            sk[i*3]   = 4.5 + Math.random()*0.7
            sk[i*3+1] = 1.5 + Math.random()*0.3
            sk[i*3+2] = towerZs[i%3] + (Math.random()-0.5)*0.4
          }
        }
        sparkGeo.attributes.position.needsUpdate = true
        sparkMat.opacity = 0.5 + Math.sin(t*9)*0.4

        // Smoke
        const sm = smokeGeo.attributes.position.array
        for (let i = 0; i < smokeN; i++) {
          sm[i*3+1] += smokeVY[i]
          sm[i*3]   += (Math.random()-0.5)*0.003
          if (sm[i*3+1] > 5.5) {
            sm[i*3]   = -0.3 + (Math.random()-0.5)*0.2
            sm[i*3+1] = 1.5
            sm[i*3+2] = -0.3 + (Math.random()-0.5)*0.2
          }
        }
        smokeGeo.attributes.position.needsUpdate = true

        renderer.render(scene, camera)
      }
      animate()
    }

    init()
    return () => { cancelAnimationFrame(animId); if (renderer) renderer.dispose() }
  }, [])


  // ── GSAP animations ──
  useEffect(() => {
    let ctx
    const init = async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        gsap.to(progressRef.current, {
          scaleX: 1, ease: 'none',
          scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: true }
        })

        const tl = gsap.timeline({ delay: 0.2 })
        tl.to(heroEyebrow.current,  { opacity:1, y:0, duration:0.6, ease:'power3.out' })
          .to(heroTitle.current,    { opacity:1, y:0, rotateX:0, duration:0.9, ease:'power3.out' }, '-=0.3')
          .to(heroSub.current,      { opacity:1, y:0, duration:0.6, ease:'power3.out' }, '-=0.4')
          .to(heroSearch.current,   { opacity:1, y:0, duration:0.6, ease:'power3.out' }, '-=0.3')
          .fromTo(heroRight.current,
            { opacity:0, y:30, scale:0.95 },
            { opacity:1, y:0,  scale:1, duration:1.1, ease:'power3.out' },
            '-=0.5'
          )

        gsap.to('.problem-label', { opacity:1, duration:0.6, scrollTrigger:{ trigger:'.problem', start:'top 75%' } })
        gsap.to('.problem-word',  { opacity:1, y:0, duration:0.5, stagger:0.04, ease:'power3.out', scrollTrigger:{ trigger:'.problem-text', start:'top 80%' } })
        gsap.to('.problem-body',  { opacity:1, y:0, duration:0.8, scrollTrigger:{ trigger:'.problem-body', start:'top 85%' } })

        gsap.to('.section-label', { opacity:1, y:0, duration:0.5, scrollTrigger:{ trigger:'.dimensions', start:'top 75%' } })
        gsap.to('.section-title', { opacity:1, y:0, duration:0.7, scrollTrigger:{ trigger:'.section-title', start:'top 80%' } })
        gsap.to('.dim-card',      { opacity:1, y:0, rotateX:0, scale:1, duration:0.7, stagger:0.07, ease:'power3.out', scrollTrigger:{ trigger:'.dim-grid', start:'top 80%' } })

        gsap.to('.demo-left',  { opacity:1, x:0, duration:0.9, ease:'power3.out', scrollTrigger:{ trigger:'.demo', start:'top 70%' } })
        gsap.to('.demo-right', {
          opacity:1, x:0, duration:0.9, ease:'power3.out',
          scrollTrigger:{
            trigger:'.demo', start:'top 70%',
            onEnter: () => {
              setBarsActive(true)
              let n = 0
              const iv = setInterval(() => {
                n += 2; setScoreNum(Math.min(n, 83))
                if (n >= 83) clearInterval(iv)
              }, 18)
            }
          }
        })

        gsap.to('.cta-inner', { opacity:1, y:0, duration:1, ease:'power3.out', scrollTrigger:{ trigger:'.cta-section', start:'top 70%' } })
      })
    }
    init()
    return () => { if (ctx) ctx.revert() }
  }, [])

  const words = "You research the builder. The price. The vastu. But what about the street outside?".split(' ')

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="noise" />
      <div className="bg-grid" />
      <div className="progress" ref={progressRef} />

      <nav className="nav">
        <a href="/" className="nav-logo">Asli<span>Vastu</span></a>
        <a href="/" className="nav-cta">Get your report →</a>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <p className="hero-eyebrow" ref={heroEyebrow}>India · Neighbourhood Intelligence</p>
          <h1 className="hero-title" ref={heroTitle}>
            Know Your<br/><em>Neighbourhood.</em>
          </h1>
          <p className="hero-sub" ref={heroSub}>
            Data-backed scores for every area — before you sign the papers.
            Crime, air, power, water, schools. One number.
          </p>
          <div className="hero-search" ref={heroSearch}>
            <input
              placeholder="Area name or pin code…"
              value={heroQ}
              onChange={e => setHeroQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && go(heroQ)}
            />
            <button onClick={() => go(heroQ)}>Check →</button>
          </div>
        </div>

        <div className="hero-right" ref={heroRight} style={{ position:'relative' }}>
          <canvas ref={isoCanvas} style={{ width: '520px', height: '520px' }} />
        </div>

        <div className="scroll-hint">
          <div className="scroll-line" />
          <span style={{ fontSize:10, letterSpacing:'0.2em', color:'rgba(255,255,255,0.5)', textTransform:'uppercase' }}>Scroll</span>
        </div>
      </section>

      <section className="problem">
        <div className="problem-inner">
          <p className="problem-label">The problem</p>
          <h2 className="problem-text">
            {words.map((w, i) => (
              <span key={i} className={`problem-word${
                w==='street'||w==='outside?'?' accent':
                w==='builder.'||w==='price.'||w==='vastu.'?' faded':''
              }`}>{w}</span>
            ))}
          </h2>
          <p className="problem-body">
            Homebuyers spend months researching builders, floor plans and loan rates —
            but almost nothing on the <strong>neighbourhood itself.</strong> Crime rates.
            Air quality. Power cuts. Water supply. Road condition.
            <br/><br/>
            AsliVastu scores every area <strong>0–100 across 8 dimensions</strong>,
            using government data most people never think to check.
          </p>
        </div>
      </section>

      <section className="dimensions">
        <p className="section-label">What we measure</p>
        <h2 className="section-title">8 dimensions.<br/>One score.</h2>
        <div className="dim-grid">
          {DIMS.map((d, i) => (
            <div key={i} className="dim-card">
              <p className="dim-num">{d.num}</p>
              <span className="dim-icon">{d.icon}</span>
              <p className="dim-name">{d.name}</p>
              <p className="dim-desc">{d.desc}</p>
              <p className="dim-weight">{d.weight}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="demo">
        <div className="demo-left">
          <p className="demo-label">Live example</p>
          <h2 className="demo-title">See it in<br/>action.</h2>
          <p className="demo-body">
            Every report gives you a composite <strong>NQI score</strong>, a buy/avoid
            verdict, and a full breakdown — with source data clearly shown.
            <br/><br/>
            No guesswork. No broker spin. <strong>Numbers from government records.</strong>
          </p>
          <a href="/?pin=110016" className="demo-btn">See Hauz Khas report →</a>
        </div>

        <div className="demo-right">
          <div className="demo-card">
            <p className="demo-area">South Delhi</p>
            <p className="demo-name">Hauz Khas</p>
            <div className="score-row">
              <span className="score-num">{scoreNum}</span>
              <span className="score-grade">A</span>
            </div>
            <p className="score-lbl">NQI Score · 5 of 5 dimensions</p>
            <div className="verdict-strip">
              <span className="verdict-name">Strong buy</span>
              <span className="verdict-why">Scores well across safety, infrastructure and environment.</span>
            </div>
            <div className="bars">
              {DEMO_BARS.map((b, i) => (
                <div key={i} className="bar-row">
                  <span className="bar-lbl">{b.label}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{
                      width: barsActive ? `${b.val}%` : '0%',
                      background: b.color,
                      transitionDelay: `${i * 0.1}s`
                    }} />
                  </div>
                  <span className="bar-val">{barsActive ? b.val : 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-glow" />
        <div className="cta-inner">
          <p className="cta-pre">Free · No signup · Instant</p>
          <h2 className="cta-title">Your area.<br/><em>By the numbers.</em></h2>
          <div className="cta-search">
            <input
              placeholder="Area name or pin code…"
              value={ctaQ}
              onChange={e => setCtaQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && go(ctaQ)}
            />
            <button onClick={() => go(ctaQ)}>Get report →</button>
          </div>
          <div className="cta-stats">
            {[['67','areas covered'],['8','dimensions'],['Live','AQI data'],['Free','always']].map(([v,l],i,arr) => (
              <>
                <div key={v}>
                  <span className="cta-stat-val">{v}</span>
                  <span className="cta-stat-lbl">{l}</span>
                </div>
                {i < arr.length-1 && <div key={`d${i}`} className="cta-div" />}
              </>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <span className="footer-logo">ASLIVASTU</span>
        <span className="footer-note">Data from government sources · Not financial advice</span>
      </footer>
    </>
  )
}
