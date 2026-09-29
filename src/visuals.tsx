import type { PointerEvent } from 'react'
import { motion, useSpring } from 'framer-motion'
import type { Visual } from './data'

/*
  Project dashboards. Each is a small HUD built from the real product's brand and workflow:
  RADAR   phosphor #00FF41 scope (as in its own logo), gold target lock, scan log, nightly pipeline rail
  Vettly  context streams → crystal prism → 4-provider failover router → scored, humanized answer
  EVES    live capture → mission brief that writes itself → neon prompt pills (as in the app)
  Styling borrows from the cyberpunk-ui skill: chamfered plates, barcode accents, neon glow.
  All motion is CSS (index.css, "project visuals"): the SVGs are self-contained, so the README cards are rendered
  straight from them. It stops under reduced motion.
*/

const MONO = 'Geist Mono, monospace'
const deg = (d: number) => (d * Math.PI) / 180

// Plate with the top-right and bottom-left corners cut off.
const plate = (x: number, y: number, w: number, h: number, c = 7) =>
  `${x},${y} ${x + w - c},${y} ${x + w},${y + c} ${x + w},${y + h} ${x + c},${y + h} ${x},${y + h - c}`

const BARCODE = (() => {
  const out: [number, number][] = []
  let x = 0
  for (const b of [2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1]) { out.push([x, b * 0.8]); x += b * 0.8 + 1 }
  return out
})()

function Frame({ title, right, color, live }: { title: string; right: string; color: string; live: string }) {
  const corner = (d: string) => <path d={d} fill="none" stroke={color} strokeOpacity="0.8" strokeWidth="1.3" />
  return (
    <g>
      {corner('M4 16 V4 H16')}{corner('M304 4 H316 V16')}{corner('M4 224 V236 H16')}{corner('M316 224 V236 H304')}
      <text x="14" y="16" fill={color} fontSize="7.5" fontWeight="600" letterSpacing="1.8" fontFamily={MONO}>{title}</text>
      <g transform="translate(200 9)" fill={color} fillOpacity="0.55">
        {BARCODE.map(([x, w]) => <rect key={x} x={x} y="0" width={w} height="7" />)}
      </g>
      <circle className="rd-live" cx="240" cy="12.5" r="2.3" fill={live} />
      <text x="306" y="16" fill={color} fillOpacity="0.85" fontSize="6.8" textAnchor="end" fontFamily={MONO}>{right}</text>
      <line x1="14" y1="22" x2="306" y2="22" stroke={color} strokeOpacity="0.2" />
    </g>
  )
}

function Glow({ id, blur = 1.6 }: { id: string; blur?: number }) {
  return (
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={blur} result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  )
}

/* ================= RADAR ================= */
// A precision instrument: brushed-steel 24h bezel (the nightly run marked in gold at 01:30), a lume chapter ring the
// beam lights as it passes, phosphor returns, a gold hub under a glass dome. Lock readout and sources pane are glass.
const G = '#00FF41'
const MINT = '#B6FFC6'
const GOLD = '#FACC15'
const RS = { x: 92, y: 110, r: 64 } // scope; the dial face is r 66, the bezel runs from 66 to 78
const onScope = (a: number, r: number) => ({ x: RS.x + r * Math.cos(deg(a)), y: RS.y + r * Math.sin(deg(a)) })
const sweepDelay = (a: number) => `${(a / 360) * 4 - 4}s` // the beam crosses angle a at this point of its 4s turn
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) } // stable noise
const arc = (r: number, a0: number, a1: number, sweep = 1) => {
  const p = onScope(a0, r)
  const q = onScope(a1, r)
  return `M${p.x.toFixed(2)} ${p.y.toFixed(2)}A${r} ${r} 0 0 ${sweep} ${q.x.toFixed(2)} ${q.y.toFixed(2)}`
}
const JOBS: [number, number, string][] = [[340, 50, 'BE 72'], [250, 52, 'SRE 58'], [100, 20, ''], [325, 40, ''], [178, 24, '']]
const RETURNS: [number, number, number, number][] = [[185, 20, 58, 2.2], [300, 18, 58, 2], [350, 14, 36, 1.6], [120, 16, 24, 1.6], [15, 10, 56, 1.8]]
// Three 80+ matches. Each turn of the beam locks the next one (a 12s, three-turn cycle), so the readout travels round
// the scope instead of repeating in one spot. card = where its readout sits, relative to the target.
const LOCKS = [
  { a: 35, r: 36, card: [-60, 9], match: 91, role: 'Backend Eng', via: 'Greenhouse' },
  { a: 160, r: 42, card: [6, 10], match: 87, role: 'ML Engineer', via: 'Lever' },
  { a: 215, r: 46, card: [10, -8], match: 84, role: 'Platform SRE', via: 'Ashby' },
]
const lockDelay = (a: number, k: number) => `${a / 90 - 12 + k * 4}s` // the beam reaches angle a on turn k
const CARD = { w: 54, h: 25 }
const SOURCES = [
  'Greenhouse', 'Lever', 'Ashby', 'Workable', 'SmartRecruiters', 'Recruitee', 'Personio', 'Breezy HR', 'Teamtailor', 'Workday',
  'Amazon Jobs', 'Hacker News', 'Remotive', 'Remote OK', 'Arbeitnow', 'Himalayas', 'Jobicy', 'The Muse', 'Adzuna', 'Jooble',
]
// The beam: thin slices whose opacity ramps up toward the leading edge (at 0°), approximating a conic gradient.
const CONE = Array.from({ length: 38 }, (_, i) => {
  const a0 = -76 + i * 2
  const p0 = onScope(a0, RS.r)
  const p1 = onScope(a0 + 2, RS.r)
  const t = (i + 1) / 38
  return { d: `M${RS.x} ${RS.y}L${p0.x.toFixed(2)} ${p0.y.toFixed(2)}A${RS.r} ${RS.r} 0 0 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}Z`, o: +(0.02 + 0.34 * t ** 2.4).toFixed(3) }
})
// phosphor dust caught in the beam, densest and brightest at the leading edge
const DUST = Array.from({ length: 34 }, (_, i) => {
  const a = -70 * rnd(i) ** 2
  const p = onScope(a, 8 + 55 * rnd(i + 50))
  return { x: +p.x.toFixed(2), y: +p.y.toFixed(2), r: +(0.35 + 0.45 * rnd(i + 90)).toFixed(2), o: +(0.95 * (1 + a / 76)).toFixed(2) }
})
// 24h bezel: a tick every half hour, skipping the numerals (00, 06, 18) and the engraving at the bottom
const BEZEL = Array.from({ length: 48 }, (_, i) => ({ a: i * 7.5 - 90, hour: i % 2 === 0, run: i === 3 }))
  .filter(({ a }) => ![-90, 0, 180].includes(a) && !(a > 50 && a < 130))
const FLOAT = Array.from({ length: 12 }, (_, i) => ({ x: 12 + 296 * rnd(i + 200), y: 40 + 150 * rnd(i + 300), r: 0.4 + 0.5 * rnd(i + 400), d: 7 + 6 * rnd(i + 500) }))
const STAGES: [string, string][] = [['DISCOVER', 'robots.txt'], ['INGEST', '20 feeds'], ['VERIFY', 'link alive'], ['MATCH', '0-100'], ['VAULT', '≥ 80 kept']]
const PANE = plate(182, 30, 124, 148)
const CHAPTER = Array.from({ length: 72 }, (_, i) => i * 5) // dial ticks every 5°, majors every 30°

function Lock({ a, r, card: [dx, dy], match, role, via, k }: (typeof LOCKS)[number] & { k: number }) {
  const t = onScope(a, r)
  const delay = lockDelay(a, k)
  const x = t.x + dx
  const y = t.y + dy
  // leader: from just outside the target to the nearest point of its readout
  const nx = Math.min(Math.max(t.x, x), x + CARD.w)
  const ny = Math.min(Math.max(t.y, y), y + CARD.h)
  const u = 6 / Math.hypot(nx - t.x, ny - t.y)
  const bracket = (sx: number, sy: number) => `M${t.x + sx * 11} ${t.y + sy * 5}V${t.y + sy * 11}H${t.x + sx * 5}`
  return (
    <g>
      <circle className="rd-ping" cx={t.x} cy={t.y} r="3" fill="none" stroke={GOLD} strokeWidth="0.9" style={{ animationDelay: delay }} />
      <g className="rd-blip" style={{ animationDelay: sweepDelay(a) }}>
        <circle cx={t.x} cy={t.y} r="3.2" fill={GOLD} filter="url(#rd-bloom)" />
      </g>
      <g className="rd-lock" style={{ animationDelay: delay, transformOrigin: `${t.x}px ${t.y}px` }} stroke={GOLD} fill="none">
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => <path key={`${sx}${sy}`} d={bracket(sx, sy)} strokeWidth="1.3" />)}
        <circle className="rd-reticle" cx={t.x} cy={t.y} r="7.5" strokeWidth="0.8" strokeDasharray="4 2.2" />
      </g>
      <g className="rd-card" style={{ animationDelay: delay }}>
        <path d={`M${t.x + (nx - t.x) * u} ${t.y + (ny - t.y) * u}L${nx} ${ny}`} stroke={GOLD} strokeOpacity="0.8" strokeWidth="0.7" />
        <rect x={x} y={y} width={CARD.w} height={CARD.h} rx="3.5" fill="#0d0c02" fillOpacity="0.78" stroke={GOLD} strokeOpacity="0.7" strokeWidth="0.6" />
        <rect x={x + 4} y={y} width="36" height="0.6" fill="url(#rd-edge)" />
        <g className="rd-type" style={{ animationDelay: delay }}>
          <text x={x + 5} y={y + 8.5} fill={GOLD} fontSize="6.4" fontWeight="700" fontFamily={MONO} filter="url(#rd-glow)">MATCH {match}</text>
          <text x={x + 5} y={y + 15.5} fill={MINT} fontSize="4.8" fontFamily={MONO}>{role}</text>
          <text x={x + 5} y={y + 21.5} fill={GOLD} fillOpacity="0.85" fontSize="4.4" fontFamily={MONO}>{via} → VAULT</text>
        </g>
      </g>
    </g>
  )
}

function Radar() {
  return (
    <g>
      <defs>
        <Glow id="rd-glow" />
        <Glow id="rd-bloom" blur={3.2} />
        <filter id="rd-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" /></filter>
        {/* static glows are gradients, not blur filters: the spinning beam repaints this area every frame */}
        <radialGradient id="rd-shadow"><stop offset="0.86" stopColor="#000" stopOpacity="0.85" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        <radialGradient id="rd-haze"><stop offset="0" stopColor={G} stopOpacity="0.16" /><stop offset="1" stopColor={G} stopOpacity="0" /></radialGradient>
        <radialGradient id="rd-face" cx="0.45" cy="0.4">
          <stop offset="0" stopColor="#07301a" /><stop offset="0.65" stopColor="#03160b" /><stop offset="1" stopColor="#010703" />
        </radialGradient>
        {/* brushed steel: dark and light bands, a second pass for the specular streak */}
        <linearGradient id="rd-steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1b211e" /><stop offset="0.16" stopColor="#7c8883" /><stop offset="0.34" stopColor="#161b19" />
          <stop offset="0.52" stopColor="#3b4541" /><stop offset="0.7" stopColor="#c4ccc8" /><stop offset="0.84" stopColor="#1c2320" /><stop offset="1" stopColor="#4d5853" />
        </linearGradient>
        <linearGradient id="rd-streak" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.3" stopColor="#fff" stopOpacity="0" /><stop offset="0.48" stopColor="#fff" stopOpacity="0.35" /><stop offset="0.66" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="rd-gold" cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff8d6" /><stop offset="0.4" stopColor="#f5c542" /><stop offset="1" stopColor="#7a5300" />
        </radialGradient>
        <radialGradient id="rd-dome" cx="0.3" cy="0.2" r="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity="0.13" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rd-pane" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={G} stopOpacity="0.12" /><stop offset="0.45" stopColor="#001a08" stopOpacity="0.82" /><stop offset="1" stopColor="#000d04" stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id="rd-edge" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#eafff0" stopOpacity="0.75" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="rd-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.25" stopColor="#fff" />
          <stop offset="0.75" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="rd-ticker" maskUnits="userSpaceOnUse" x="186" y="100" width="120" height="58">
          <rect x="186" y="100" width="120" height="58" fill="url(#rd-fade)" />
        </mask>
        <clipPath id="rd-pane-clip"><polygon points={PANE} /></clipPath>
        <path id="rd-engrave" d={arc(74.6, 128, 52, 0)} />
        <linearGradient id="rd-tail" x1="0" x2="1"><stop offset="0" stopColor={G} stopOpacity="0" /><stop offset="1" stopColor={MINT} /></linearGradient>
        <linearGradient id="rd-rail" x1="0" x2="1"><stop offset="0" stopColor={G} stopOpacity="0.15" /><stop offset="0.6" stopColor={G} stopOpacity="0.6" /><stop offset="1" stopColor={GOLD} stopOpacity="0.8" /></linearGradient>
      </defs>

      {/* ambient: green haze breathing behind the scope, phosphor dust drifting up */}
      <circle className="rd-haze" cx={RS.x} cy={RS.y} r="104" fill="url(#rd-haze)" />
      {FLOAT.map((f, i) => (
        <circle key={i} className="rd-dust" cx={f.x} cy={f.y} r={f.r} fill={MINT} style={{ animationDuration: `${f.d}s`, animationDelay: `${-f.d * rnd(i + 600)}s` }} />
      ))}
      <Frame title="RADAR · JOB INTELLIGENCE" right="01:30 UTC" color={G} live={G} />

      {/* bezel: brushed steel, 24h scale, the 01:30 run in gold, engraved */}
      <circle cx={RS.x} cy={RS.y + 2} r="84" fill="url(#rd-shadow)" />
      <circle cx={RS.x} cy={RS.y} r="72" fill="none" stroke="url(#rd-steel)" strokeWidth="12" />
      <circle cx={RS.x} cy={RS.y} r="72" fill="none" stroke="url(#rd-streak)" strokeWidth="12" />
      <circle cx={RS.x} cy={RS.y} r="77.8" fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="0.5" />
      <circle cx={RS.x} cy={RS.y} r="66.2" fill="none" stroke="#000" strokeOpacity="0.8" strokeWidth="0.8" />
      {BEZEL.map(({ a, hour, run }) => {
        const p = onScope(a, run ? 67.5 : hour ? 68.8 : 70.4)
        const q = onScope(a, run ? 77 : hour ? 75.4 : 73.8)
        return <line key={a} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={run ? GOLD : MINT} strokeOpacity={run ? 1 : hour ? 0.8 : 0.45} strokeWidth={run ? 1.6 : hour ? 1 : 0.6} filter={run ? 'url(#rd-glow)' : undefined} />
      })}
      {([[-90, '00'], [0, '06'], [180, '18']] as [number, string][]).map(([a, l]) => {
        const p = onScope(a, 72)
        return <text key={l} x={p.x} y={p.y + 2} fill={MINT} fillOpacity="0.9" fontSize="5.8" fontWeight="600" textAnchor="middle" fontFamily={MONO}>{l}</text>
      })}
      <text fill="#000" fillOpacity="0.7" fontSize="4.6" fontWeight="700" letterSpacing="1.3" fontFamily={MONO} transform="translate(0 0.45)">
        <textPath href="#rd-engrave" startOffset="50%" textAnchor="middle">PRECISION SCAN</textPath>
      </text>
      <text fill="#dfe6e2" fillOpacity="0.7" fontSize="4.6" fontWeight="700" letterSpacing="1.3" fontFamily={MONO}>
        <textPath href="#rd-engrave" startOffset="50%" textAnchor="middle">PRECISION SCAN</textPath>
      </text>

      {/* dial face under glass */}
      <circle cx={RS.x} cy={RS.y} r="66" fill="url(#rd-face)" />
      {CHAPTER.map((a) => {
        const major = a % 30 === 0
        const p = onScope(a, major ? 57 : 60)
        const q = onScope(a, 63)
        // every third tick lights up as the beam passes; animating all 72 costs frames for little gain
        const lit = a % 15 === 0
        return <line key={a} className={lit ? 'rd-tick' : undefined} opacity={lit ? undefined : 0.35} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={major ? MINT : G} strokeOpacity={major ? 1 : 0.7} strokeWidth={major ? 1.2 : 0.55} style={lit ? { animationDelay: sweepDelay(a) } : undefined} />
      })}
      <circle cx={RS.x} cy={RS.y} r="42" fill="none" stroke={G} strokeOpacity="0.12" strokeWidth="3" />
      <circle cx={RS.x} cy={RS.y} r="42" fill="none" stroke={G} strokeOpacity="0.6" strokeWidth="0.8" />
      <circle cx={RS.x} cy={RS.y} r="21" fill="none" stroke={G} strokeOpacity="0.28" strokeDasharray="1.5 3" />
      <path d={`M${RS.x - RS.r} ${RS.y}H${RS.x + RS.r}M${RS.x} ${RS.y - RS.r}V${RS.y + RS.r}`} stroke={G} strokeOpacity="0.14" />

      {/* the beam: a laser edge that flares where it meets the bezel, dust glittering in its wake */}
      <g className="rd-spin" style={{ transformOrigin: `${RS.x}px ${RS.y}px` }}>
        <g filter="url(#rd-soft)" opacity="0.9">{CONE.map((s, i) => <path key={i} d={s.d} fill={G} fillOpacity={s.o} />)}</g>
        {CONE.map((s, i) => <path key={i} d={s.d} fill={G} fillOpacity={s.o} />)}
        {DUST.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={MINT} fillOpacity={d.o} />)}
        <g filter="url(#rd-bloom)">
          <path d={arc(67.4, -12, 3)} fill="none" stroke={G} strokeOpacity="0.55" strokeWidth="2.4" />
          <path d={`M${RS.x} ${RS.y}L${RS.x + RS.r} ${RS.y}`} stroke={G} strokeWidth="5" />
          <circle cx={RS.x + RS.r} cy={RS.y} r="2.2" fill="#eafff0" />
        </g>
        <path d={`M${RS.x} ${RS.y}L${RS.x + RS.r} ${RS.y}`} stroke="#d8ffe0" strokeWidth="1.3" strokeLinecap="round" />
      </g>
      {[0, 1].map((k) => <circle key={k} className="rd-sonar" cx={RS.x} cy={RS.y} r={RS.r} fill="none" stroke={G} strokeWidth="1.2" style={{ animationDelay: `${-k * 1.6}s` }} />)}

      {/* returns: arc-shaped smears and scored jobs, lit by the beam, then fading like phosphor (halo = a wide faint copy) */}
      {RETURNS.map(([a, span, r, w]) => (
        <g key={a} className="rd-blip" fill="none" stroke={G} strokeLinecap="round" style={{ animationDelay: sweepDelay(a) }}>
          <path d={arc(r, a, a + span)} strokeOpacity="0.22" strokeWidth={w + 3} />
          <path d={arc(r, a, a + span)} strokeWidth={w} />
        </g>
      ))}
      {JOBS.map(([a, r, label]) => {
        const p = onScope(a, r)
        const right = Math.cos(deg(a)) > 0
        return (
          <g key={`${a}-${r}`} className="rd-blip" style={{ animationDelay: sweepDelay(a) }}>
            <circle cx={p.x} cy={p.y} r="4.2" fill={G} fillOpacity="0.22" />
            <circle cx={p.x} cy={p.y} r="2.4" fill={G} />
            {label && <text x={p.x + (right ? -4.5 : 4.5)} y={p.y - 3.5} fill={MINT} fontSize="5.2" textAnchor={right ? 'end' : 'start'} fontFamily={MONO}>{label}</text>}
          </g>
        )
      })}

      {/* the 80+ matches: a gold reticle spins in, brackets snap, the readout types itself */}
      {LOCKS.map((l, k) => <Lock key={l.a} {...l} k={k} />)}

      {/* glass dome + gold hub */}
      <circle cx={RS.x} cy={RS.y} r="66" fill="url(#rd-dome)" />
      <path d={arc(63.6, 196, 246)} fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
      <circle cx={RS.x} cy={RS.y + 0.8} r="6.4" fill="#000" fillOpacity="0.55" />
      <circle cx={RS.x} cy={RS.y} r="5.2" fill="url(#rd-gold)" stroke="#4a3500" strokeWidth="0.5" />
      <ellipse cx={RS.x - 1.6} cy={RS.y - 2} rx="1.8" ry="1" fill="#fff" fillOpacity="0.75" />

      {/* sources: stacked glass panes, a light sweep crossing the top one */}
      {[2, 1].map((k) => <polygon key={k} points={PANE} transform={`translate(${k * 2} ${k * 3})`} fill="#000d04" fillOpacity="0.5" stroke={G} strokeOpacity={0.24 - k * 0.07} />)}
      <polygon points={PANE} fill="url(#rd-pane)" stroke={G} strokeOpacity="0.45" />
      <rect x="186" y="29.9" width="110" height="0.8" fill="url(#rd-edge)" />
      <g clipPath="url(#rd-pane-clip)"><rect className="rd-sheen" x="80" y="20" width="16" height="170" fill="#eafff0" fillOpacity="0.07" transform="skewX(-22)" /></g>
      <path d="M186 40V34H192M302 168V174H296" fill="none" stroke={MINT} strokeOpacity="0.6" strokeWidth="0.8" />
      <text x="190" y="43" fill={MINT} fillOpacity="0.65" fontSize="5.6" letterSpacing="1.5" fontFamily={MONO}>LIVE SOURCES</text>
      <text x="189" y="74" fill="none" stroke={G} strokeOpacity="0.18" strokeWidth="3.4" strokeLinejoin="round" fontSize="27" fontWeight="600" fontFamily={MONO}>20</text>
      <text x="189" y="74" fill={G} fontSize="27" fontWeight="600" fontFamily={MONO}>20</text>
      <text x="228" y="59" fill={G} fontSize="6.2" fontFamily={MONO}>■ 11 ATS feeds</text>
      <text x="228" y="70" fill={MINT} fontSize="6.2" fontFamily={MONO}>■ 9 job boards</text>
      <line x1="190" y1="84" x2="298" y2="84" stroke={G} strokeOpacity="0.2" />
      <text x="190" y="95" fill={MINT} fillOpacity="0.55" fontSize="5.2" letterSpacing="1.4" fontFamily={MONO}>SCAN LOG</text>
      <circle className="rd-live" cx="294" cy="93" r="2" fill={G} />
      <g mask="url(#rd-ticker)">
        <g className="rd-ticker">
          {[...SOURCES, ...SOURCES].map((s, i) => (
            <g key={i}>
              <text x="190" y={108 + i * 10} fill={i % 20 < 11 ? G : MINT} fillOpacity="0.9" fontSize="6.4" fontFamily={MONO}>› {s}</text>
              <text x="298" y={108 + i * 10} fill={G} fontSize="6.4" textAnchor="end" fontFamily={MONO}>✓</text>
            </g>
          ))}
        </g>
      </g>
      <text x="190" y="171" fill={MINT} fillOpacity="0.75" fontSize="5.6" fontFamily={MONO}>82 companies · 54 live</text>

      {/* nightly pipeline: a comet runs the glass rail and lights each stage */}
      <rect x="24" y="211.2" width="276" height="5.6" rx="2.8" fill={G} fillOpacity="0.05" stroke={G} strokeOpacity="0.22" strokeWidth="0.5" />
      {/* gradients on a flat line don't paint (zero-height bounding box), so hairlines are thin rects */}
      <rect x="30" y="213.35" width="264" height="1.3" fill="url(#rd-rail)" />
      {STAGES.map(([name, detail], k) => {
        const x = 30 + k * 66
        const c = k === 4 ? GOLD : G
        return (
          <g key={name}>
            <text x={x} y="203" fill={k === 4 ? GOLD : MINT} fontSize="6" fontWeight="600" letterSpacing="0.8" textAnchor="middle" fontFamily={MONO}>{name}</text>
            <rect x={x - 5} y="209" width="10" height="10" transform={`rotate(45 ${x} 214)`} fill="#000d04" stroke={c} />
            <rect className="rd-flash" x={x - 5} y="209" width="10" height="10" transform={`rotate(45 ${x} 214)`} fill={c} filter="url(#rd-bloom)" style={{ animationDelay: `${k * 0.8}s` }} />
            <text x={x} y="231" fill={MINT} fillOpacity="0.6" fontSize="5.4" textAnchor="middle" fontFamily={MONO}>{detail}</text>
          </g>
        )
      })}
      <g className="rd-packet">
        <rect x="2" y="212.5" width="28" height="3" rx="1.5" fill="url(#rd-tail)" />
        <circle cx="30" cy="214" r="2.8" fill="#fff" filter="url(#rd-glow)" />
      </g>
    </g>
  )
}

/* ================= Vettly: the liquid-glass lab ================= */
// Context sits in four glass flasks (priority P1 to P4). Glowing liquid runs through glass tubes into a crystal
// failover router, which tries the providers in order: Groq rate-limits (429, its line runs red), Gemini answers
// (200), and the answer fills a glass score orb. Glass is layered gradients, not filters: a faint body, a bright
// fresnel rim, a specular streak, and coloured caustics where light lands on the table.
const VIOLET = '#a78bfa'
const FUCHSIA = '#e879f9'
const FLOOR = 178 // the table's back edge
const FLASKS: [string, string, number][] = [['ASSIGNMENT', '#60a5fa', 22], ['JD + STACK', '#a78bfa', 50], ['RESUME', '#4ade80', 78], ['REPOS', '#fb923c', 106]]
const FL = { cy: 160, r: 11.5, neck: 138, lvl: 155 } // body centre, radius, neck top, liquid level
const ripple = (x0: number, y: number, bottom: number) => `M${x0} ${y}${' q3 -1.1 6 0 t6 0'.repeat(9)}V${bottom}H${x0}Z` // 12-unit period
const CR = { x: 170, y: 92, r: 28 } // the crystal
const pt = (a: number, r: number, c: { x: number; y: number } = CR) => [+(c.x + r * Math.cos(deg(a))).toFixed(2), +(c.y + r * Math.sin(deg(a))).toFixed(2)]
// icosahedron seen down a 3-fold axis: a centre triangle, three faces on its edges, six around the rim
const TRI = [-90, 30, 150].map((a) => pt(a, 13))
const H = [0, 1, 2, 3, 4, 5].map((k) => pt(-90 + 60 * k, CR.r))
const FACE_PTS = [
  [TRI[0], H[0], H[1]], [TRI[0], TRI[1], H[1]], [TRI[1], H[1], H[2]], [TRI[1], H[2], H[3]], [TRI[1], TRI[2], H[3]],
  [TRI[2], H[3], H[4]], [TRI[2], H[4], H[5]], [TRI[2], TRI[0], H[5]], [TRI[0], H[5], H[0]], [TRI[0], TRI[1], TRI[2]],
]
const FACES = FACE_PTS.map((f) => f.map((p) => p.join(',')).join(' '))
const FACE_FILL = ['vt-fa', 'vt-fc', 'vt-fb', 'vt-fd', 'vt-fe', 'vt-fb', 'vt-fa', 'vt-fd', 'vt-fc', 'vt-fa']
const FACE_FLASH = ['#ffffff', '#a5f3fc', '#f5d0fe']
const RIM = H.map((p) => p.join(',')).join(' ')
// circuit traces etched into six outer facets: in from a corner, a turn toward the far edge, a pad at each end
const lerp = (p: number[], q: number[], t: number) => [+(p[0] + (q[0] - p[0]) * t).toFixed(2), +(p[1] + (q[1] - p[1]) * t).toFixed(2)]
const TRACES = [0, 2, 3, 5, 6, 8].map((i) => {
  const [A, B, C] = FACE_PTS[i]
  const c = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3]
  const p1 = lerp(B, c, 0.3)
  const p2 = lerp(B, c, 0.85)
  const p3 = lerp(p2, lerp(A, C, 0.5), 0.6)
  return { d: `M${p1}L${p2}L${p3}`, pads: [p1, p3] }
})
const inY = (i: number) => [80, 88, 96, 104][i] // where each context tube enters the crystal
const tubeIn = (x: number, i: number) => `M${x + 2.6} 142C${x + 12} ${142 - [74, 62, 50, 38][i]} 126 ${inY(i)} ${CR.x - 24} ${inY(i)}`
const PX = 234 // provider column
const PROVIDERS = [
  { name: 'Groq', tag: 'primary', color: '#ff7a45', y: 50 },
  { name: 'Gemini', tag: 'fallback 1', color: '#6ea8ff', y: 92 },
  { name: 'Claude', tag: 'fallback 2', color: '#e8916b', y: 134 },
  { name: 'OpenAI', tag: 'fallback 3', color: '#34d399', y: 176 },
]
const tubeOut = (i: number) => {
  const y0 = 82 + i * 7
  const y1 = PROVIDERS[i].y
  return `M${CR.x + 24} ${y0}C${CR.x + 36} ${y0} ${PX - 24} ${y1} ${PX - 12} ${y1}`
}
const SO = { x: 180, y: 212, r: 14 } // the score orb
const ANSWER = `M${PX - 12} ${PROVIDERS[1].y + 6}C206 128 214 176 ${SO.x + 11} ${SO.y - 12}`
const sparkle = (x: number, y: number, s = 4) => `M${x} ${y - s}L${x + s / 4} ${y - s / 4}L${x + s} ${y}L${x + s / 4} ${y + s / 4}L${x} ${y + s}L${x - s / 4} ${y + s / 4}L${x - s} ${y}L${x - s / 4} ${y - s / 4}Z`
// the router's code, token by token: [text, colour]
const KW = '#c4b5fd'
const FN = '#7dd3fc'
const ID = '#ede9fe'
const CODE: [number, [string, string][]][] = [
  [0, [['ctx', ID], [' = ', '#a1a1aa'], ['rank', FN], ['(jd, resume, repos)', ID]]],
  [0, [['for', KW], [' llm ', ID], ['in', KW], [' (groq, gemini, claude, openai):', ID]]],
  [4, [['try', KW], [': ', '#a1a1aa'], ['return', KW], [' llm', FN], ['(ctx[:', ID], ['80_000', '#fcd34d'], ['])', ID]]],
  [4, [['except', KW], [' RateLimit: ', ID], ['backoff', FN], ['()', ID]]],
]
// OpenAI's white die: a dodecahedron, front pentagon and the five faces around it, lit from the top left
const DIE = (() => {
  const o = { x: 0, y: 0 }
  const P = [0, 1, 2, 3, 4].map((k) => pt(-90 + 72 * k, 4.6, o))
  const R = [0, 1, 2, 3, 4].map((k) => pt(-90 + 72 * k, 8, o))
  const Q = [0, 1, 2, 3, 4].map((k) => pt(-54 + 72 * k, 9.6, o))
  const side = [0, 1, 2, 3, 4].map((k) => [P[k], R[k], Q[k], R[(k + 1) % 5], P[(k + 1) % 5]].join(' '))
  return { front: P.join(' '), side, shade: ['#e2e8f0', '#b8c2d0', '#8a96a8', '#c7d0dc', '#ffffff'] }
})()
const VASE = 'M-3.6 -10C-2.2 -9 -2.2 -7 -2.4 -6C-7 -4 -8.6 -1 -8.2 2C-7.8 6 -5.6 8.4 -4 9L-4.6 10.6H4.6L4 9C5.6 8.4 7.8 6 8.2 2C8.6 -1 7 -4 2.4 -6C2.2 -7 2.2 -9 3.6 -10Z'

function ProviderObject({ i }: { i: number }) {
  if (i === 0) // Groq, the fast lane: a rocket, flame flickering
    return (
      <g transform="rotate(32)">
        <path className="vt-flame" d="M-2.2 6.4Q0 15 2.2 6.4Z" fill="url(#vt-flame)" />
        <path d="M-4.2 1L-7.6 7.2L-3.9 5.6ZM4.2 1L7.6 7.2L3.9 5.6Z" fill="#ea580c" />
        <path d="M0 -11C4.2 -7.4 4.7 -1.4 4.2 5.4H-4.2C-4.7 -1.4 -4.2 -7.4 0 -11Z" fill="url(#vt-steel)" />
        <path d="M0 -11C2.3 -9.1 3.2 -7.6 3.5 -6.4H-3.5C-3.2 -7.6 -2.3 -9.1 0 -11Z" fill="#f97316" />
        <rect x="-2.7" y="5.4" width="5.4" height="1.4" rx="0.4" fill="#475569" />
        <circle cx="0" cy="-1.6" r="2" fill="#0f172a" stroke="#e2e8f0" strokeWidth="0.6" />
        <circle cx="0" cy="-1.6" r="1.2" fill="#fb923c" fillOpacity="0.45" />
        <circle cx="-0.6" cy="-2.2" r="0.55" fill="#fff" />
        <path d="M-2.7 -6.2C-3.3 -2.4 -3.3 1 -2.9 4.6" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.6" strokeLinecap="round" />
      </g>
    )
  if (i === 1) // Gemini: a starry vase with a gold crescent
    return (
      <g>
        <path d={VASE} fill="url(#vt-navy)" />
        <circle cx="1" cy="1.6" r="3.6" fill="#fcd34d" mask="url(#vt-moon)" />
        {[[-4.6, -1.8, 1.3], [-3, 5.2, 1], [4.4, -2.6, 0.9], [5.2, 4.4, 1.1], [-0.6, -4.4, 0.8]].map(([x, y, s]) => (
          <path key={`${x}${y}`} d={sparkle(x, y, s)} fill="#fde68a" />
        ))}
        <ellipse cx="0" cy="-10" rx="3.6" ry="0.9" fill="#1e3a8a" stroke="#93c5fd" strokeOpacity="0.6" strokeWidth="0.5" />
        <path d="M-6.4 -1.6C-7 1.4 -6.2 4.6 -4.4 6.6" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" strokeLinecap="round" />
      </g>
    )
  if (i === 2) // Claude: a sandstone sphinx, looking back toward the router
    return (
      <g>
        <rect x="-11" y="5.6" width="22" height="3.4" rx="0.6" fill="url(#vt-sand2)" />
        <path d="M10.4 5.6C10.9 2.4 9.8 -0.3 7.2 -0.8C3.6 -1.4 0.4 -1.2 -2.2 -0.6L-3.6 2.6L-10.6 3.4C-11.4 4 -11.2 5.6 -10.2 5.6Z" fill="url(#vt-sand)" />
        <path d="M-6.4 -8.4C-4.2 -10 -1.8 -8.8 -1.6 -6.4L-0.4 -0.4H-5.2L-5.6 -3.4Z" fill="url(#vt-sand)" />
        <path d="M-5.2 -7.6L-1.9 -6.8M-5.3 -5.6L-1.6 -4.8M-5.3 -3.6L-1.2 -2.8M-5.1 -1.6L-0.8 -1.2" stroke="#8a5a24" strokeOpacity="0.6" strokeWidth="0.45" />
        <path d="M-6.4 -8.2L-8.2 -7.2L-8.4 -5.6L-9.3 -4.7L-8.4 -4.2L-8.3 -3L-6.4 -2.3L-5.5 -3.4Z" fill="#f6dca4" />
        <circle cx="-7.3" cy="-5.9" r="0.45" fill="#5c3a12" />
        <path d="M9.6 1.6C8.6 -0.2 5 -0.6 1 -0.6" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.6" strokeLinecap="round" />
      </g>
    )
  return ( // OpenAI: a white die
    <g>
      {DIE.side.map((f, k) => <polygon key={k} points={f} fill={DIE.shade[k]} stroke="#64748b" strokeOpacity="0.45" strokeWidth="0.3" strokeLinejoin="round" />)}
      <polygon points={DIE.front} fill="#f8fafc" stroke="#64748b" strokeOpacity="0.45" strokeWidth="0.3" strokeLinejoin="round" />
      <circle cx="0" cy="0" r="1.9" fill="none" stroke="#94a3b8" strokeWidth="0.45" />
      <path d="M-5.4 -5.6L-2.2 -8.2" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" />
    </g>
  )
}

// A glass tube with liquid in it: wall, dark bore, the liquid itself, soft swells of light riding it, a specular line.
function GlassTube({ d, color, w, delay }: { d: string; color: string; w: number; delay: number }) {
  const flow = { animationDelay: `${delay}s` }
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke="#fff" strokeOpacity="0.16" strokeWidth={w} />
      <path d={d} stroke="#0d0620" strokeOpacity="0.5" strokeWidth={w - 1.4} />
      <path d={d} stroke={color} strokeOpacity="0.75" strokeWidth={w - 2.4} />
      <path className="vt-flow" d={d} stroke={color} strokeWidth={w - 1.2} strokeDasharray="7 27" filter="url(#vt-bloom)" style={flow} />
      <path className="vt-flow" d={d} stroke="#fff" strokeOpacity="0.85" strokeWidth={w - 3.8} strokeDasharray="5 29" style={flow} />
      <path d={d} stroke="#fff" strokeOpacity="0.55" strokeWidth="0.5" transform="translate(-0.4 -1.1)" />
    </g>
  )
}

function Vettly() {
  return (
    <g>
      <defs>
        <Glow id="vt-glow" blur={1.6} />
        <Glow id="vt-bloom" blur={4.5} />
        <linearGradient id="vt-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#26124d" /><stop offset="0.55" stopColor="#1b0d38" /><stop offset="1" stopColor="#0f0822" /></linearGradient>
        {([['vt-b1', '#8b5cf6', 0.5], ['vt-b2', '#3b82f6', 0.3], ['vt-b3', '#d946ef', 0.26], ['vt-b4', '#fb923c', 0.12]] as [string, string, number][]).map(([id, c, o]) => (
          <radialGradient key={id} id={id}><stop offset="0" stopColor={c} stopOpacity={o} /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient>
        ))}
        <linearGradient id="vt-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.07" /><stop offset="0.12" stopColor="#fff" stopOpacity="0.025" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></linearGradient>
        <linearGradient id="vt-horizon" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.32" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        {/* glass: body, fresnel rim, frosted panel, specular */}
        <linearGradient id="vt-gb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0.2" /><stop offset="0.22" stopColor="#fff" stopOpacity="0.04" /><stop offset="0.75" stopColor="#fff" stopOpacity="0.02" /><stop offset="1" stopColor="#fff" stopOpacity="0.14" /></linearGradient>
        <linearGradient id="vt-gr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.95" /><stop offset="0.45" stopColor="#fff" stopOpacity="0.22" /><stop offset="1" stopColor="#fff" stopOpacity="0.55" /></linearGradient>
        <linearGradient id="vt-frost" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.16" /><stop offset="1" stopColor="#fff" stopOpacity="0.04" /></linearGradient>
        <linearGradient id="vt-brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff0c2" /><stop offset="0.3" stopColor="#e0b04a" /><stop offset="0.7" stopColor="#8f6415" /><stop offset="1" stopColor="#4a320a" /></linearGradient>
        <linearGradient id="vt-parch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbf3df" /><stop offset="1" stopColor="#e3cd9c" /></linearGradient>
        {FLASKS.map(([, c, x], i) => (
          <g key={i}>
            <linearGradient id={`vt-lq-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.7" /><stop offset="0.14" stopColor={c} /><stop offset="1" stopColor={c} stopOpacity="0.55" /></linearGradient>
            <clipPath id={`vt-fl-${i}`}><circle cx={x} cy={FL.cy} r={FL.r - 0.8} /></clipPath>
          </g>
        ))}
        {/* crystal facets, each tinted by a different liquid */}
        <linearGradient id="vt-fa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.6" /><stop offset="1" stopColor="#fff" stopOpacity="0.08" /></linearGradient>
        <linearGradient id="vt-fb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c4b5fd" stopOpacity="0.6" /><stop offset="1" stopColor="#fff" stopOpacity="0.1" /></linearGradient>
        <linearGradient id="vt-fc" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#93c5fd" stopOpacity="0.5" /><stop offset="1" stopColor={VIOLET} stopOpacity="0.15" /></linearGradient>
        <linearGradient id="vt-fd" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#f9a8d4" stopOpacity="0.5" /><stop offset="1" stopColor="#fff" stopOpacity="0.08" /></linearGradient>
        <linearGradient id="vt-fe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5eead4" stopOpacity="0.4" /><stop offset="1" stopColor={VIOLET} stopOpacity="0.12" /></linearGradient>
        <radialGradient id="vt-heart"><stop offset="0" stopColor="#fff" stopOpacity="0.9" /><stop offset="0.35" stopColor={FUCHSIA} stopOpacity="0.7" /><stop offset="1" stopColor={VIOLET} stopOpacity="0" /></radialGradient>
        <linearGradient id="vt-prism" x1="0" x2="1">
          {['#f87171', '#fbbf24', '#4ade80', '#22d3ee', '#818cf8', '#e879f9'].map((c, k) => <stop key={c} offset={k / 5} stopColor={c} />)}
        </linearGradient>
        <clipPath id="vt-crystal"><polygon points={RIM} /></clipPath>
        {/* provider materials */}
        <linearGradient id="vt-steel" x1="0" x2="1"><stop offset="0" stopColor="#64748b" /><stop offset="0.3" stopColor="#f8fafc" /><stop offset="0.55" stopColor="#cbd5e1" /><stop offset="1" stopColor="#334155" /></linearGradient>
        <linearGradient id="vt-flame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff7c2" /><stop offset="0.4" stopColor="#fb923c" /><stop offset="1" stopColor="#f97316" stopOpacity="0" /></linearGradient>
        <radialGradient id="vt-navy" cx="0.35" cy="0.35" r="0.8"><stop offset="0" stopColor="#4c6fe0" /><stop offset="0.45" stopColor="#1e3a8a" /><stop offset="1" stopColor="#0b1033" /></radialGradient>
        <mask id="vt-moon"><circle cx="1" cy="1.6" r="3.6" fill="#fff" /><circle cx="2.7" cy="0.5" r="3" fill="#000" /></mask>
        <linearGradient id="vt-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fde9b8" /><stop offset="0.5" stopColor="#e0b36a" /><stop offset="1" stopColor="#a8773a" /></linearGradient>
        <linearGradient id="vt-sand2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9a860" /><stop offset="1" stopColor="#6e4a1c" /></linearGradient>
        {PROVIDERS.map((p, i) => (
          <radialGradient key={i} id={`vt-pool-${i}`}><stop offset="0" stopColor={p.color} stopOpacity="0.55" /><stop offset="1" stopColor={p.color} stopOpacity="0" /></radialGradient>
        ))}
        <radialGradient id="vt-vdisc" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#ddd6fe" /><stop offset="0.5" stopColor="#8b5cf6" /><stop offset="1" stopColor="#6d28d9" /></radialGradient>
        {/* the score orb */}
        <radialGradient id="vt-orbglass" cx="0.5" cy="0.45" r="0.55"><stop offset="0" stopColor="#1e0b3d" stopOpacity="0.55" /><stop offset="0.8" stopColor="#4c1d95" stopOpacity="0.35" /><stop offset="1" stopColor="#f5d0fe" stopOpacity="0.4" /></radialGradient>
        <linearGradient id="vt-orbliq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f5d0fe" /><stop offset="0.12" stopColor={FUCHSIA} /><stop offset="1" stopColor="#6d28d9" /></linearGradient>
        <clipPath id="vt-orb"><circle cx={SO.x} cy={SO.y} r={SO.r - 0.8} /></clipPath>
        <linearGradient id="vt-ringg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#7c3aed" /><stop offset="0.55" stopColor={FUCHSIA} /><stop offset="1" stopColor="#f9a8d4" /></linearGradient>
        <linearGradient id="vt-ans" gradientUnits="userSpaceOnUse" x1={PX} y1={PROVIDERS[1].y} x2={SO.x} y2={SO.y}><stop offset="0" stopColor={PROVIDERS[1].color} /><stop offset="1" stopColor={FUCHSIA} /></linearGradient>
      </defs>

      {/* the room: violet light, a glossy table */}
      <rect width="320" height="240" fill="url(#vt-bg)" />
      <circle cx={CR.x} cy={CR.y} r="105" fill="url(#vt-b1)" />
      <circle cx="40" cy="110" r="80" fill="url(#vt-b2)" />
      <circle cx="290" cy="30" r="80" fill="url(#vt-b3)" />
      <circle cx="110" cy="205" r="60" fill="url(#vt-b4)" />
      <rect y={FLOOR} width="320" height={240 - FLOOR} fill="url(#vt-table)" />
      <rect y={FLOOR - 0.3} width="320" height="0.6" fill="url(#vt-horizon)" />

      {/* brand + context budget */}
      <rect x="10" y="9" width="86" height="15" rx="7.5" fill="url(#vt-frost)" stroke="url(#vt-gr)" strokeWidth="0.6" />
      <circle cx="18" cy="16.5" r="5" fill="url(#vt-vdisc)" />
      <path d="M15.8 14.5L18 18.7L20.2 14.5" fill="none" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      <text x="26" y="19" fill="#fff" fontSize="6.6" fontWeight="700" fontFamily={MONO}>Vettly</text>
      <text x="52" y="18.6" fill="#ddd6fe" fillOpacity="0.7" fontSize="3.8" letterSpacing="0.8" fontFamily={MONO}>PREP STUDIO</text>
      <rect x="272" y="9" width="38" height="15" rx="7.5" fill="url(#vt-frost)" stroke="url(#vt-gr)" strokeWidth="0.6" />
      <text x="291" y="18.6" fill="#f5d0fe" fontSize="5.2" fontWeight="700" textAnchor="middle" fontFamily={MONO}>CTX 80K</text>

      {/* the router's code on a frosted pane, rewriting itself */}
      <rect x="11" y="32" width="118" height="42" rx="6" fill="#000" fillOpacity="0.3" filter="url(#vt-glow)" />
      <rect x="10" y="30" width="118" height="42" rx="6" fill="url(#vt-frost)" stroke="url(#vt-gr)" strokeWidth="0.6" />
      <text x="16" y="38" fill={KW} fillOpacity="0.85" fontSize="4.2" fontFamily={MONO}>vettly/main.py</text>
      <line x1="16" y1="41" x2="122" y2="41" stroke="#fff" strokeOpacity="0.12" strokeWidth="0.5" />
      {CODE.map(([indent, tokens], k) => (
        <text key={k} className="vt-code" x={16 + indent * 2.52} y={48 + k * 6.5} fontSize="4.2" fontFamily={MONO} style={{ animationDelay: `${k * 0.55}s` }}>
          {tokens.map(([t, c], j) => <tspan key={j} fill={c}>{t}</tspan>)}
        </text>
      ))}

      {/* context tubes: flask necks → router */}
      {FLASKS.map(([label, c, x], i) => <GlassTube key={label} d={tubeIn(x, i)} color={c} w={5.6} delay={-i * 0.3} />)}

      {/* the flasks: brass stand, glass, liquid that sloshes, bubbles and glitter, a parchment label */}
      {FLASKS.map(([label, c, x], i) => {
        const join = FL.cy - Math.sqrt(FL.r ** 2 - 2.6 ** 2)
        const glass = `M${x - 2.6} ${FL.neck}V${join.toFixed(2)}A${FL.r} ${FL.r} 0 1 0 ${x + 2.6} ${join.toFixed(2)}V${FL.neck}Z`
        return (
          <g key={label}>
            <ellipse cx={x} cy={FLOOR + 5} rx="12" ry="2" fill={c} opacity="0.6" filter="url(#vt-glow)" />
            <circle cx={x} cy={FL.cy} r="16" fill={c} opacity="0.16" filter="url(#vt-bloom)" />
            <path d={`M${x - 9.5} ${FL.cy + 12.5}V${FL.cy + 18}A9.5 2 0 0 0 ${x + 9.5} ${FL.cy + 18}V${FL.cy + 12.5}Z`} fill="url(#vt-brass)" />
            <path d={`M${x - 7} ${FL.cy + 13.6}V${FL.cy + 18.6}`} stroke="#fff" strokeOpacity="0.45" strokeWidth="0.7" />
            <ellipse cx={x} cy={FL.cy + 12.5} rx="9.5" ry="2" fill="#f5d68a" stroke="#fff7dc" strokeOpacity="0.8" strokeWidth="0.3" />
            <ellipse cx={x} cy={FL.cy + 12.5} rx="6" ry="1.1" fill="#8f6415" fillOpacity="0.45" />
            <path d={glass} fill="url(#vt-gb)" />
            <g clipPath={`url(#vt-fl-${i})`}>
              <g className="vt-slosh" style={{ transformOrigin: `${x}px ${FL.lvl}px`, animationDelay: `${-i * 0.8}s` }}>
                <path className="vt-wave" d={ripple(x - 24, FL.lvl, FL.cy + 14)} fill={`url(#vt-lq-${i})`} style={{ animationDelay: `${-i * 0.5}s` }} />
              </g>
              {[[-4, 1.8, 0], [1, 2.3, 0.7], [5, 2, 1.3]].map(([dx, dur, dl]) => (
                <circle key={dx} className="vt-bubble" cx={x + dx} cy={FL.cy + 8} r={dx === 1 ? 1.1 : 0.7} fill="#fff" style={{ animationDuration: `${dur}s`, animationDelay: `${-dl - i * 0.3}s` }} />
              ))}
              {[[-5, 4, 0.2], [4, 7, 0.9], [-1, 9, 1.5]].map(([dx, dy, dl]) => (
                <path key={dx} className="vt-twinkle" d={sparkle(x + dx, FL.cy + dy, 1.3)} fill="#fff" style={{ animationDelay: `${dl + i * 0.2}s` }} />
              ))}
            </g>
            <path d={glass} fill="none" stroke="url(#vt-gr)" strokeWidth="0.7" />
            <path d={`M${x - 8.4} ${FL.cy - 2.4}A9.2 9.2 0 0 1 ${x - 3.2} ${FL.cy - 8.7}`} fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="1.1" strokeLinecap="round" />
            <circle cx={x + 5.6} cy={FL.cy - 5.4} r="0.8" fill="#fff" fillOpacity="0.9" />
            <line x1={x - 1.4} y1={FL.neck + 1} x2={x - 1.4} y2={join - 1} stroke="#fff" strokeOpacity="0.45" strokeWidth="0.5" />
            <rect x={x - 3.6} y={FL.neck - 2} width="7.2" height="2.2" rx="1.1" fill="url(#vt-gb)" stroke="url(#vt-gr)" strokeWidth="0.5" />
            <circle cx={x} cy={FL.neck - 5} r="3" fill="url(#vt-gb)" stroke="url(#vt-gr)" strokeWidth="0.5" />
            <circle cx={x - 1} cy={FL.neck - 6} r="0.8" fill="#fff" fillOpacity="0.85" />
            <rect x={x - 6.5} y={FL.cy + 1} width="13" height="7" rx="1.4" fill="url(#vt-parch)" stroke="#a07a3c" strokeWidth="0.35" />
            <text x={x} y={FL.cy + 6.2} fill="#4a2c0a" fontSize="4.6" fontWeight="700" textAnchor="middle" fontFamily={MONO}>P{i + 1}</text>
            <text x={x} y={FLOOR + 11} fill="#ede9fe" fillOpacity="0.75" fontSize="4.2" textAnchor="middle" fontFamily={MONO}>{label}</text>
          </g>
        )
      })}

      {/* router → providers */}
      {PROVIDERS.map((p, i) => <GlassTube key={p.name} d={tubeOut(i)} color={p.color} w={4.4} delay={-i * 0.25} />)}

      {/* the crystal: clear, iridescent, circuit-etched; light runs round its facets and splits into a spectrum below */}
      <ellipse className="vt-spectrum" cx={CR.x} cy={FLOOR + 8} rx="26" ry="2.4" fill="url(#vt-prism)" filter="url(#vt-bloom)" />
      <circle className="vt-core" cx={CR.x} cy={CR.y} r="24" fill="url(#vt-heart)" />
      <g className="vt-float">
        {FACES.map((f, i) => <polygon key={i} points={f} fill={`url(#${FACE_FILL[i]})`} />)}
        {FACES.map((f, i) => (
          <polygon key={i} className="vt-facet" points={f} fill={FACE_FLASH[i % 3]} style={{ animationDelay: `${i * 0.28}s` }} />
        ))}
        <g stroke="#fff" strokeOpacity="0.4" strokeWidth="0.3" fill="none">
          {TRACES.map((t, i) => <path key={i} d={t.d} />)}
        </g>
        {TRACES.flatMap((t, i) => t.pads.map((p, j) => <circle key={`${i}${j}`} cx={p[0]} cy={p[1]} r="0.55" fill="#fff" fillOpacity="0.6" />))}
        {FACES.map((f, i) => <polygon key={i} points={f} fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="0.45" strokeLinejoin="round" />)}
        <polygon points={RIM} fill="none" stroke="#67e8f9" strokeOpacity="0.55" strokeWidth="0.7" strokeLinejoin="round" transform="translate(-0.8 0)" />
        <polygon points={RIM} fill="none" stroke="#f472b6" strokeOpacity="0.55" strokeWidth="0.7" strokeLinejoin="round" transform="translate(0.8 0)" />
        <polygon points={RIM} fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="0.8" strokeLinejoin="round" />
        <polygon className="vt-flash" points={RIM} fill="#fff" />
        <g clipPath="url(#vt-crystal)"><rect className="vt-shine" x={CR.x - 76} y={CR.y - 40} width="7" height="80" fill="#fff" opacity="0.6" transform="skewX(-18)" /></g>
        {(['FAILOVER', 'ROUTER'] as const).map((w, k) => (
          <g key={w} fontSize="4.4" fontWeight="700" letterSpacing="0.7" textAnchor="middle" fontFamily={MONO}>
            <text x={CR.x + 0.3} y={CR.y + 0.6 + k * 5.6} fill="#2e1065" fillOpacity="0.7">{w}</text>
            <text x={CR.x} y={CR.y + k * 5.6} fill="#fff">{w}</text>
          </g>
        ))}
      </g>
      {[[CR.x - 34, CR.y - 26, 0, 4], [CR.x + 30, CR.y - 30, 0.5, 3.4], [CR.x - 26, CR.y + 30, 1, 3], [CR.x + 36, CR.y + 20, 1.4, 3.4], [SO.x + 22, SO.y - 8, 0.8, 2.6]].map(([x, y, d, s], i) => (
        <path key={i} className="vt-twinkle" d={sparkle(x, y, s)} fill="#fff" style={{ animationDelay: `${d}s` }} />
      ))}

      {/* providers, in failover order, each on its own glass pedestal */}
      {PROVIDERS.map((p, i) => (
        <g key={p.name}>
          <ellipse cx={PX} cy={p.y + 14} rx="16" ry="4" fill={`url(#vt-pool-${i})`} />
          <ellipse cx={PX} cy={p.y + 13} rx="11" ry="2.6" fill="url(#vt-gb)" stroke="url(#vt-gr)" strokeWidth="0.5" />
          <g className="vt-bob" style={{ animationDelay: `${-i * 0.9}s` }}>
            <g transform={`translate(${PX} ${p.y})`}>
              <g className={i === 0 ? 'vt-shake' : undefined}><ProviderObject i={i} /></g>
            </g>
          </g>
          <text x={PX + 16} y={p.y} fill="#f8fafc" fontSize="6.4" fontWeight="700" fontFamily={MONO}>{p.name}</text>
          <text x={PX + 16} y={p.y + 7} fill={p.color} fontSize="4.6" fontFamily={MONO}>{p.tag}</text>
        </g>
      ))}
      {/* Groq rate-limits: its line runs red, the rocket shudders */}
      <g className="vt-429">
        <path d={tubeOut(0)} fill="none" stroke="#ef4444" strokeWidth="2.2" strokeDasharray="3 3" filter="url(#vt-glow)" />
        <circle cx={PX} cy={PROVIDERS[0].y} r="13" fill="none" stroke="#ef4444" strokeWidth="1.2" />
        <rect x={PX + 38} y={PROVIDERS[0].y - 8} width="24" height="10" rx="5" fill="#2a0707" fillOpacity="0.9" stroke="#ef4444" />
        <text x={PX + 50} y={PROVIDERS[0].y - 1.2} fill="#fca5a5" fontSize="5.8" fontWeight="700" textAnchor="middle" fontFamily={MONO}>429</text>
      </g>
      {/* Gemini answers: its line blazes */}
      <g className="vt-200">
        <path d={tubeOut(1)} fill="none" stroke={PROVIDERS[1].color} strokeWidth="3" filter="url(#vt-bloom)" />
        <path d={tubeOut(1)} fill="none" stroke="#fff" strokeWidth="1" />
        <circle cx={PX} cy={PROVIDERS[1].y} r="13" fill="none" stroke="#22c55e" strokeWidth="1.2" />
        <rect x={PX + 44} y={PROVIDERS[1].y - 8} width="28" height="10" rx="5" fill="#052e16" fillOpacity="0.9" stroke="#22c55e" />
        <text x={PX + 58} y={PROVIDERS[1].y - 1.2} fill="#86efac" fontSize="5.6" fontWeight="700" textAnchor="middle" fontFamily={MONO}>200 ✓</text>
      </g>

      {/* the answer pours into a glass orb: it fills to the score, the ring closes, the score pops */}
      <path className="vt-ans" pathLength={1} d={ANSWER} fill="none" stroke="url(#vt-ans)" strokeWidth="2" filter="url(#vt-glow)" />
      <ellipse cx={SO.x} cy={SO.y + 16} rx="16" ry="2.6" fill={FUCHSIA} opacity="0.45" filter="url(#vt-glow)" />
      <circle cx={SO.x} cy={SO.y} r={SO.r} fill="url(#vt-orbglass)" />
      <g clipPath="url(#vt-orb)">
        <g className="vt-fill">
          <path className="vt-wave" d={ripple(SO.x - SO.r - 12, SO.y - SO.r + 3.4, SO.y + SO.r + 2)} fill="url(#vt-orbliq)" />
        </g>
      </g>
      <circle cx={SO.x} cy={SO.y} r={SO.r} fill="none" stroke="url(#vt-gr)" strokeWidth="0.8" />
      <circle cx={SO.x} cy={SO.y} r={SO.r + 2.6} fill="none" stroke={VIOLET} strokeOpacity="0.2" strokeWidth="1.4" />
      <circle className="vt-ring" pathLength={1} cx={SO.x} cy={SO.y} r={SO.r + 2.6} fill="none" stroke="url(#vt-ringg)" strokeWidth="1.4" strokeLinecap="round" transform={`rotate(-90 ${SO.x} ${SO.y})`} />
      <g className="vt-pop">
        <text x={SO.x + 0.4} y={SO.y + 3} fill="#2e1065" fillOpacity="0.6" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily={MONO}>8.8</text>
        <text x={SO.x} y={SO.y + 2.6} fill="#fff" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily={MONO}>8.8</text>
        <text x={SO.x} y={SO.y + 8.4} fill="#fff" fillOpacity="0.85" fontSize="3.4" letterSpacing="0.8" textAnchor="middle" fontFamily={MONO}>SCORE</text>
      </g>
      <ellipse cx={SO.x - 5} cy={SO.y - 8.6} rx="5.6" ry="2.2" fill="#fff" fillOpacity="0.35" transform={`rotate(-28 ${SO.x - 5} ${SO.y - 8.6})`} />
      <text x={SO.x - 22} y={SO.y - 6} fill="#f5f3ff" fontSize="5.4" fontWeight="700" textAnchor="end" fontFamily={MONO}>Q#12 SYSTEM DESIGN</text>
      <text x={SO.x - 22} y={SO.y + 2} fill="#86efac" fontSize="4.8" textAnchor="end" fontFamily={MONO}>humanized, 7/7 checks</text>
      <text x={SO.x - 22} y={SO.y + 9} fill="#c4b5fd" fontSize="4.6" textAnchor="end" fontFamily={MONO}>9 tracks: STAR, DSA</text>

      {/* the request of light: in through the router, bounced by Groq, answered by Gemini, into the orb */}
      <circle className="vt-p1" r="3" cx={0} cy={0} fill="#fff" filter="url(#vt-glow)" />
      <circle className="vt-p2" r="3" cx={0} cy={0} fill="#fff" filter="url(#vt-glow)" />
    </g>
  )
}

/* ================= EVES — mission brief ================= */
// Mirrors the app itself: a mission brief that writes itself from the call, then the neon prompt pills.
const CY = '#22d3ee'
const GR = '#7ee787'
const PU = '#c678dd'
const PILL_ICONS: Record<string, string> = {
  target: 'M4 0.8a3.2 3.2 0 1 1 0 6.4a3.2 3.2 0 1 1 0-6.4M4 3a1 1 0 1 1 0 2a1 1 0 1 1 0-2',
  build: 'M1 2.2h6M1 5.8h6M2.6 1v2.4M5.4 4.6V7',
  term: 'M1 1.8l2.4 2.2L1 6.2M4.4 6.4H7',
  spark: 'M4 0.6v6.8M0.6 4h6.8M1.6 1.6l4.8 4.8M6.4 1.6l-4.8 4.8',
  cursor: 'M1.2 1.2l5.6 2.3-2.4.8-.9 2.5z',
  layout: 'M0.8 0.8h6.4v6.4H0.8zM0.8 3h6.4M3 3v4.2',
  list: 'M0.8 1.6h.8M2.6 1.6h4.6M0.8 4h.8M2.6 4h4.6M0.8 6.4h.8M2.6 6.4h4.6',
  shield: 'M4 0.6l3 1.2v2.3c0 1.8-1.3 3-3 3.4-1.7-.4-3-1.6-3-3.4V1.8z',
}
const PILLS: [string, string, string][] = [
  ['MAIN GOAL', '#fbbf24', 'target'], ['HOW TO BUILD', '#4ade80', 'build'], ['CODEX PROMPT', '#22d3ee', 'term'], ['CLAUDE CODE', '#fb923c', 'spark'],
  ['CURSOR PROMPT', '#60a5fa', 'cursor'], ['FRONTEND', '#c084fc', 'layout'], ['ACTION PLAN', '#f472b6', 'list'], ['RISKS & Qs', '#f87171', 'shield'],
]
const BRIEF_CHIPS: [string, string][] = [['2 decisions', CY], ['3 action items', GR], ['1 open question', '#fbbf24'], ['1 concern', '#fb7185'], ['planning · focused', PU]]
const MINI_WAVE = Array.from({ length: 24 }, (_, i) => 3 + 8 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.31)))

const CHIPS = (() => {
  const out: { t: string; c: string; x: number; w: number }[] = []
  let x = 22
  for (const [t, c] of BRIEF_CHIPS) {
    const w = t.length * 3.12 + 10
    out.push({ t, c, x, w })
    x += w + 4
  }
  return out
})()

function Eves() {
  return (
    <g>
      <defs>
        <Glow id="ev-glow" blur={1.8} />
        <Glow id="ev-bloom" blur={4} />
        <linearGradient id="ev-edge" x1="0" x2="1"><stop offset="0" stopColor={CY} stopOpacity="0" /><stop offset="0.5" stopColor={CY} stopOpacity="0.9" /><stop offset="1" stopColor={CY} stopOpacity="0" /></linearGradient>
        <linearGradient id="ev-sweep" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <clipPath id="ev-pills">
          {PILLS.map((_, i) => <rect key={i} x={14 + (i % 4) * 74} y={144 + Math.floor(i / 4) * 28} width="70" height="22" rx="11" />)}
        </clipPath>
      </defs>
      <Frame title="EVES · MEETING INTEL" right="REC 01:47:22" color={CY} live="#f43f5e" />

      {/* status bar: live capture, the brain in use, the path format for the coding agent */}
      {MINI_WAVE.map((h, i) => (
        <rect key={i} className="ev-eqc" x={14 + i * 3.6} y={38 - h / 2} width="2" height={h} rx="1" fill={i < 12 ? CY : GR}
          style={{ animationDelay: `${-((i * 7) % 11) / 10}s`, animationDuration: `${0.55 + (i % 4) * 0.15}s` }} />
      ))}
      <rect x="112" y="31" width="122" height="14" rx="7" fill={GR} fillOpacity="0.07" stroke={GR} strokeOpacity="0.5" />
      <circle className="rd-live" cx="120" cy="38" r="2" fill={GR} />
      <text x="126" y="40" fill={GR} fontSize="5.8" fontFamily={MONO}>GROQ · openai/gpt-oss-120b</text>
      <rect x="244" y="31" width="62" height="14" rx="5" fill="none" stroke="#fff" strokeOpacity="0.15" />
      <rect x="246" y="33" width="29" height="10" rx="3" fill={CY} fillOpacity="0.2" />
      <text x="260.5" y="40" fill={CY} fontSize="5.6" fontWeight="700" textAnchor="middle" fontFamily={MONO}>WSL</text>
      <text x="290" y="40" fill="#fff" fillOpacity="0.45" fontSize="5.6" textAnchor="middle" fontFamily={MONO}>WIN</text>

      {/* mission brief: the main goal types itself out of the meeting */}
      <rect x="14" y="52" width="292" height="80" rx="8" fill="#0b1117" stroke={CY} strokeOpacity="0.32" />
      <rect x="40" y="52" width="240" height="1" fill="url(#ev-edge)" />
      <circle className="rd-live" cx="24" cy="64" r="2.2" fill={GR} filter="url(#ev-glow)" />
      <text x="30" y="66" fill={GR} fontSize="5.6" letterSpacing="1.4" fontFamily={MONO}>MISSION BRIEF // MAIN GOAL</text>
      <text className="ev-type" x="22" y="84" fill="#ffffff" fontSize="7.6" fontWeight="700" fontFamily={MONO}>Ship the cache layer first, then open senior access.</text>
      <text className="ev-sub" x="22" y="97" fill="#ffffff" fillOpacity="0.55" fontSize="5.8" fontFamily={MONO}>Redis, 5-min TTL · owners and deadlines pulled from the call</text>
      {CHIPS.map((c, i) => (
        <g key={c.t} className="ev-chip" style={{ animationDelay: `${2.9 + i * 0.12}s` }}>
          <rect x={c.x} y="108" width={c.w} height="13" rx="6.5" fill={c.c} fillOpacity="0.1" stroke={c.c} strokeOpacity="0.6" />
          <text x={c.x + c.w / 2} y="116.8" fill={c.c} fontSize="5.2" textAnchor="middle" fontFamily={MONO}>{c.t}</text>
        </g>
      ))}

      {/* the prompt pills, flickering on like neon */}
      {PILLS.map(([label, c, icon], i) => {
        const x = 14 + (i % 4) * 74
        const y = 144 + Math.floor(i / 4) * 28
        return (
          <g key={label} className="ev-neon" style={{ animationDelay: `${3.4 + i * 0.16}s` }}>
            <rect x={x} y={y} width="70" height="22" rx="11" fill={c} opacity="0.22" filter="url(#ev-bloom)" />
            <rect x={x} y={y} width="70" height="22" rx="11" fill="#07090c" stroke={c} strokeOpacity="0.8" />
            <g transform={`translate(${x + 8} ${y + 7})`} fill="none" stroke={c} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round">
              <path d={PILL_ICONS[icon]} />
            </g>
            <text x={x + 20} y={y + 13.6} fill={c} fontSize="5.3" fontWeight="700" letterSpacing="0.5" fontFamily={MONO}>{label}</text>
          </g>
        )
      })}
      {/* one gets pressed */}
      <rect className="ev-press" x={14 + 3 * 74} y="144" width="70" height="22" rx="11" fill="#fb923c" fillOpacity="0.35" stroke="#fed7aa" strokeWidth="1.2" filter="url(#ev-glow)" />
      <g clipPath="url(#ev-pills)"><rect className="ev-sweep" x="-60" y="140" width="40" height="64" fill="url(#ev-sweep)" transform="skewX(-20)" /></g>
      <g className="ev-toast">
        <rect x="96" y="204" width="128" height="17" rx="8.5" fill="#06140c" stroke={GR} strokeOpacity="0.7" />
        <text x="160" y="215" fill={GR} fontSize="5.8" textAnchor="middle" fontFamily={MONO}>✓ prompt copied → Claude Code</text>
      </g>
      <text x="14" y="229" fill={CY} fillOpacity="0.8" fontSize="5.2" fontFamily={MONO}>nova-3 · hi ↔ en</text>
      <text x="306" y="229" fill={PU} fillOpacity="0.85" fontSize="5.2" textAnchor="end" fontFamily={MONO}>100% local</text>
    </g>
  )
}

/* ================= Simplify Money ================= */
const AU = '#fbbf24'
const ROSE = '#fb7185'
const PRICE = 'M22 118 L56 108 L86 114 L118 88 L150 96 L182 70 L214 78 L246 50 L282 56 L300 44'

function Gold() {
  return (
    <g>
      <defs>
        <Glow id="au-glow" />
        <linearGradient id="au-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={AU} stopOpacity="0.3" /><stop offset="1" stopColor={AU} stopOpacity="0" /></linearGradient>
      </defs>
      <Frame title="SIMPLIFY MONEY · GOLD DESK" right="XAU / INR" color={AU} live={ROSE} />
      {[40, 70, 100, 130].map((y) => <line key={y} x1="22" y1={y} x2="300" y2={y} stroke={AU} strokeOpacity="0.08" />)}
      <path d={`${PRICE} L300 136 L22 136 Z`} fill="url(#au-area)" />
      <path className="au-draw" pathLength={1} d={PRICE} fill="none" stroke={AU} strokeWidth="2" filter="url(#au-glow)" />
      <text x="22" y="36" fill={AU} fontSize="7" fontFamily={MONO}>24K GOLD · ₹ per gram</text>
      <text className="au-live" x="300" y="36" fill={ROSE} fontSize="7" fontWeight="600" textAnchor="end" fontFamily={MONO}>▲ LIVE</text>

      {/* the conversation */}
      <polygon points={plate(12, 146, 178, 84)} fill="#120d02" fillOpacity="0.9" stroke={AU} strokeOpacity="0.35" />
      <g className="au-s0">
        <rect x="70" y="154" width="112" height="16" rx="8" fill={AU} fillOpacity="0.16" stroke={AU} strokeOpacity="0.6" />
        <text x="126" y="164.5" fill="#fef3c7" fontSize="6" textAnchor="middle" fontFamily={MONO}>I want to invest ₹5000 in gold</text>
      </g>
      <g className="au-s1">
        <rect x="20" y="176" width="130" height="16" rx="8" fill="#fff" fillOpacity="0.06" stroke="#fff" strokeOpacity="0.25" />
        <text x="85" y="186.5" fill="#f5f5f4" fontSize="6" textAnchor="middle" fontFamily={MONO}>Today's 24K rate is live. Buy now?</text>
      </g>
      <g className="au-s2">
        <rect x="20" y="200" width="92" height="14" rx="4" fill={ROSE} fillOpacity="0.15" stroke={ROSE} />
        <text x="66" y="209.5" fill="#fecdd3" fontSize="6" textAnchor="middle" fontFamily={MONO}>wants_to_buy: true</text>
      </g>

      {/* the price engine */}
      <polygon points={plate(198, 146, 110, 84)} fill="#120d02" fillOpacity="0.9" stroke={AU} strokeOpacity="0.35" />
      <text x="206" y="158" fill={AU} fillOpacity="0.75" fontSize="5.6" letterSpacing="1.2" fontFamily={MONO}>PRICE ENGINE</text>
      {['spot  USD / oz', '× FX  USD → INR', '+ duty + GST', '= ₹ per gram'].map((l, i) => (
        <text key={l} className={`au-p${i}`} x="206" y={172 + i * 14} fill={i === 3 ? AU : '#fef3c7'} fontSize="6.4" fontWeight={i === 3 ? 700 : 400} fontFamily={MONO}>{l}</text>
      ))}
    </g>
  )
}

export function ProjectVisual({ kind }: { kind: Visual }) {
  return (
    <div className="screen screen-panel relative aspect-[4/3] rounded-2xl border border-fg/10 bg-black overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />
      {/* RADAR's beam: a smooth conic gradient, positioned exactly under the SVG scope */}
      <div className="absolute inset-0 scanlines" />
      <svg viewBox="0 0 320 240" className="absolute inset-0 w-full h-full">
        {kind === 'radar' && <Radar />}
        {kind === 'router' && <Vettly />}
        {kind === 'wave' && <Eves />}
        {kind === 'gold' && <Gold />}
      </svg>
    </div>
  )
}

/* ---------- Spatial logo marks next to each project name ----------
   visionOS-style: a glass disc built from depth layers (gradient base, floating white glyph, specular
   highlight, rim light) over a coloured shadow. It floats idly and tilts in 3D toward the cursor,
   each layer at its own depth. Saturated disc + white glyph reads the same on light and dark pages. */
const MARKS: Record<Visual, { from: string; via: string; to: string; glow: string }> = {
  radar: { from: '#6ee7b7', via: '#059669', to: '#064e3b', glow: '#10b981' },
  wave: { from: '#67e8f9', via: '#6366f1', to: '#9333ea', glow: '#6366f1' },
  router: { from: '#c4b5fd', via: '#8b5cf6', to: '#db2777', glow: '#a855f7' },
  gold: { from: '#fef08a', via: '#f59e0b', to: '#b45309', glow: '#f59e0b' },
}

// RADAR's mark: the 12 dial ticks as two paths, the 3-hour majors and the rest
const DIAL_TICKS = [true, false].map((major) => Array.from({ length: 12 }, (_, k) => k)
  .filter((k) => (k % 3 === 0) === major)
  .map((k) => {
    const c = Math.cos(deg(k * 30))
    const s = Math.sin(deg(k * 30))
    const r0 = major ? 6.2 : 7.2
    return `M${(12 + r0 * c).toFixed(2)} ${(12 + r0 * s).toFixed(2)}L${(12 + 8.6 * c).toFixed(2)} ${(12 + 8.6 * s).toFixed(2)}`
  }).join(''))

function Glyph({ kind }: { kind: Visual }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[64%] h-[64%]" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))' }}>
      {kind === 'radar' && (
        <>
          {/* the instrument dial: hour ticks, a sweep, a gold hub */}
          <circle cx="12" cy="12" r="9.4" strokeOpacity="0.45" strokeWidth="0.9" />
          <path d={DIAL_TICKS[0]} strokeWidth="1.5" />
          <path d={DIAL_TICKS[1]} strokeOpacity="0.65" strokeWidth="0.9" />
          <g className="gl-spin">
            <path d="M12 12 L12 3.5 A8.5 8.5 0 0 1 19.4 7.8 Z" fill="#fff" fillOpacity="0.35" stroke="none" />
            <path d="M12 12 L19.4 7.8" strokeWidth="1.8" />
          </g>
          <circle className="gl-ping" cx="16.2" cy="15.4" r="1.4" fill="#fff" stroke="none" />
          <circle cx="12" cy="12" r="2.5" fill="#facc15" stroke="#fff" strokeWidth="0.6" />
        </>
      )}
      {kind === 'wave' && (
        <>
          {/* the meeting (live waveform) becomes a prompt */}
          {[[3.2, 7], [6.8, 13], [10.4, 9]].map(([x, h], i) => (
            <rect key={i} className="gl-eq" x={x - 1.3} y={12 - h / 2} width="2.6" height={h} rx="1.3" fill="#fff" stroke="none" style={{ animationDelay: `${-i * 0.27}s` }} />
          ))}
          <path d="M14 7 L19 12 L14 17" strokeWidth="2.6" />
          <path className="rd-live" d="M18.8 18.6 H22.2" strokeWidth="2.4" />
        </>
      )}
      {kind === 'router' && (
        <>
          <path d="M5.5 6.5 L12 18 L18.5 6.5" strokeWidth="2.4" />
          {[[5.5, 6.5], [18.5, 6.5], [12, 18]].map(([x, y], i) => (
            <circle key={i} className="gl-node" cx={x} cy={y} r="2.1" fill="#fff" stroke="none" style={{ animationDelay: `${i * 0.35}s` }} />
          ))}
        </>
      )}
      {kind === 'gold' && (
        <>
          <circle cx="12" cy="12" r="8.5" strokeOpacity="0.6" strokeWidth="1.4" strokeDasharray="2 2.2" />
          <text x="12" y="16.6" fill="#fff" stroke="none" fontSize="12.5" fontWeight="700" textAnchor="middle" fontFamily="Oxanium, sans-serif">₹</text>
        </>
      )}
    </svg>
  )
}

export function ProjectMark({ kind }: { kind: Visual }) {
  const m = MARKS[kind]
  const rx = useSpring(0, { stiffness: 220, damping: 16 })
  const ry = useSpring(0, { stiffness: 220, damping: 16 })
  const tilt = (e: PointerEvent<HTMLSpanElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 36)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 36)
  }
  const reset = () => { rx.set(0); ry.set(0) }
  return (
    <span aria-hidden className="mark-float inline-block shrink-0 p-1.5 -m-1.5 [perspective:360px]" onPointerMove={tilt} onPointerLeave={reset}>
      <motion.span className="relative block w-14 h-14 md:w-16 md:h-16 [transform-style:preserve-3d]" style={{ rotateX: rx, rotateY: ry }}
        whileHover={{ scale: 1.08 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
        {/* coloured floating shadow */}
        <span className="absolute left-2 right-2 -bottom-2.5 h-4 rounded-full blur-md opacity-70" style={{ background: m.glow, transform: 'translateZ(-24px)' }} />
        {/* gradient base with depth shading */}
        <span className="absolute inset-0 rounded-full" style={{
          background: `radial-gradient(130% 130% at 28% 18%, ${m.from} 0%, ${m.via} 45%, ${m.to} 100%)`,
          boxShadow: `inset 0 1.5px 1px rgba(255,255,255,0.55), inset 0 -8px 14px rgba(0,0,0,0.28), 0 10px 26px -10px ${m.glow}`,
        }} />
        {/* floating glyph */}
        <span className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateZ(16px)' }}>
          <Glyph kind={kind} />
        </span>
        {/* glass: specular highlight + rim light */}
        <span className="absolute inset-0 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(55% 40% at 34% 16%, rgba(255,255,255,0.7), rgba(255,255,255,0) 70%)',
          transform: 'translateZ(22px)', mixBlendMode: 'soft-light',
        }} />
        <span className="absolute inset-0 rounded-full pointer-events-none" style={{
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35), inset 0 0 12px rgba(255,255,255,0.12)', transform: 'translateZ(22px)',
        }} />
      </motion.span>
    </span>
  )
}
