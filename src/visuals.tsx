import type { Visual } from './data'

/*
  Project dashboards. Each is a small HUD built from the real product's brand and workflow:
  RADAR   phosphor #00FF41 scope (as in its own logo), gold target lock, scan log, nightly pipeline rail
  Vettly  a railway interlocking: ranked 80K context → one track per provider (Groq 429, Gemini 200) → 7-check score
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
const STAGES: [string, string][] = [['DISCOVER', 'robots.txt'], ['INGEST', '25+ feeds'], ['VERIFY', 'link alive'], ['MATCH', '0-100'], ['VAULT', '≥ 80 kept']]
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
      <text x="189" y="74" fill="none" stroke={G} strokeOpacity="0.18" strokeWidth="3.4" strokeLinejoin="round" fontSize="27" fontWeight="600" fontFamily={MONO}>25</text>
      <text x="189" y="74" fill={G} fontSize="27" fontWeight="600" fontFamily={MONO}>25</text>
      <text x="228" y="59" fill={G} fontSize="6.2" fontFamily={MONO}>■ 12 ATS feeds</text>
      <text x="228" y="70" fill={MINT} fontSize="6.2" fontFamily={MONO}>■ boards + alerts</text>
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

/* ================= Vettly: the interlocking ================= */
// The failover router drawn as a railway interlocking: each provider is a track, each HTTP status a signal.
// The context bar packs the inputs in priority order up to the 80K budget and slices off the repos that overflow.
// The request runs out on track 1: Groq's signal goes red (429), a 1s backoff runs down, the points throw to
// track 2, Gemini's signal goes green (200) and the route lights through to the terminus, where 7 checks score the
// answer. One 9s timeline (vt-* in index.css); the resting styles are the finished run, which reduced motion shows.
const VIOLET = '#a78bfa'
const STOP = '#f87171'
const GO = '#4ade80'
const WAIT = '#fbbf24'
const IDLE = '#3f3f46'
const MUTED = '#71717a'
const BAR = { x: 14, y: 36, h: 10, perK: 3 } // the 80K budget is 240 units wide
const LIMIT = BAR.x + 80 * BAR.perK
// label, thousands of chars, fill, ink: priority 1 to 4, fading as the priority drops
const PACK: [string, number, string, string][] = [
  ['assignment', 11.2, '#ddd6fe', '#1e1338'], ['jd + stack', 10.4, '#c4b5fd', '#1e1338'],
  ['resume', 7.4, '#a78bfa', '#1e1338'], ['repos', 51, '#2a1f4d', '#ddd6fe'],
]
const SEGS = (() => {
  let x = BAR.x
  return PACK.map(([label, k, fill, ink]) => { const s = { label, fill, ink, x, w: k * BAR.perK }; x += s.w; return s })
})()
const TRACKS = ['groq', 'gemini', 'claude', 'openai'] // in failover order
const ty = (k: number) => 90 + 20 * k // track k's y; both ladders cross the tracks at 45°
const SIG = 176 // every track's signal
const TERM = { x: 284, y: 206, r: 12 } // the terminus roundel, one ring segment per check
const FEED = `M${BAR.x + 1.2} ${BAR.y + BAR.h}V${ty(0) - 8}Q${BAR.x + 1.2} ${ty(0)} ${BAR.x + 9.2} ${ty(0)}`
const EXIT = `H${TERM.x - 8}Q${TERM.x} ${ty(0)} ${TERM.x} ${ty(0) + 8}V${TERM.y - TERM.r - 1}`
const YARD = [FEED + EXIT, `M52 ${ty(0)}L112 ${ty(3)}`, `M196 ${ty(3)}L256 ${ty(0)}`, ...[1, 2, 3].map((k) => `M${52 + 20 * k} ${ty(k)}H${256 - 20 * k}`)]
const RUN_GROQ = `${FEED}H${SIG - 6}` // stops short of the red signal
const RUN_GEMINI = `${FEED}H52L72 ${ty(1)}H236L256 ${ty(0)}${EXIT}`
// notches cut the ring into 7 segments; the route arrives mid-segment at the top
const NOTCHES = Array.from({ length: 7 }, (_, k) => {
  const a = deg(-90 + (360 / 7) * (k + 0.5))
  const p = (r: number) => `${(TERM.x + r * Math.cos(a)).toFixed(2)} ${(TERM.y + r * Math.sin(a)).toFixed(2)}`
  return `M${p(TERM.r - 2.2)}L${p(TERM.r + 2.2)}`
}).join('')

function Vettly() {
  return (
    <g fontFamily={MONO}>
      <defs>
        <linearGradient id="vt-spill" gradientUnits="userSpaceOnUse" x1={LIMIT} x2="304">
          <stop offset="0" stopColor={WAIT} stopOpacity="0.45" /><stop offset="1" stopColor={WAIT} stopOpacity="0" />
        </linearGradient>
      </defs>
      <Frame title="VETTLY · PREP STUDIO" right="CTX 80K" color={VIOLET} live={VIOLET} />

      {/* the budget, empty, with its scale */}
      <text x="14" y="31" fontSize="4.4" letterSpacing="1.1"><tspan fill={VIOLET}>CONTEXT</tspan><tspan fill={MUTED}> · RANKED BY PRIORITY</tspan></text>
      <rect x={BAR.x} y={BAR.y} width={LIMIT - BAR.x} height={BAR.h} rx="1.6" fill="#0d0b16" stroke={IDLE} strokeWidth="0.6" />
      {[20, 40, 60].map((k) => (
        <g key={k}>
          <line x1={BAR.x + k * BAR.perK} y1={BAR.y + BAR.h + 1} x2={BAR.x + k * BAR.perK} y2={BAR.y + BAR.h + 3} stroke={MUTED} strokeWidth="0.5" />
          <text x={BAR.x + k * BAR.perK} y={BAR.y + BAR.h + 8} fill={MUTED} fontSize="4" textAnchor="middle">{k}K</text>
        </g>
      ))}
      <line x1={LIMIT} y1={BAR.y - 3} x2={LIMIT} y2={BAR.y + BAR.h + 3} stroke="#fafafa" strokeWidth="0.8" />
      <text x={LIMIT} y={BAR.y + BAR.h + 8} fill="#fafafa" fontSize="4" fontWeight="700" textAnchor="middle">80K</text>

      {/* the yard, unlit: the line out of the context bar, two ladders, four tracks, a signal on each */}
      <g fill="none" stroke={IDLE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {YARD.map((d) => <path key={d} d={d} />)}
      </g>
      <text x="118" y={ty(0) - 16} fontSize="4.4" letterSpacing="1.1"><tspan fill={VIOLET}>FAILOVER</tspan><tspan fill={MUTED}> ORDER</tspan></text>
      {TRACKS.map((name, k) => (
        <g key={name}>
          <text x="118" y={ty(k) - 4.6} fill="#e4e4e7" fontSize="5.6"><tspan fill={MUTED}>{k + 1} </tspan>{name}</text>
          <circle cx={SIG} cy={ty(k)} r="2.8" fill="#09090b" stroke={MUTED} strokeWidth="0.9" />
        </g>
      ))}
      <circle cx={TERM.x} cy={TERM.y} r={TERM.r - 1.4} fill="#0d0b16" />
      <circle cx={TERM.x} cy={TERM.y} r={TERM.r} fill="none" stroke={IDLE} strokeWidth="2.2" />
      <text x={TERM.x} y={TERM.y + TERM.r + 9} fill={MUTED} fontSize="4" letterSpacing="1" textAnchor="middle">7 CHECKS</text>

      <g className="vt-cycle">
        {/* pack the context; the repos run past 80K and get sliced, leaving a ghost of what was cut */}
        <g className="vt-pack">
          {SEGS.map((s, i) => (
            <g key={s.label}>
              <rect x={s.x + 0.4} y={BAR.y} width={s.w - 0.8} height={BAR.h} rx="1.2" fill={s.fill} stroke={VIOLET} strokeOpacity={i === 3 ? 0.5 : 0} strokeWidth="0.6" />
              <text x={s.x + 2.8} y={BAR.y + 6.5} fill={s.ink} fontSize="4.4" fontWeight="600">{s.label}</text>
            </g>
          ))}
          <g className="vt-spill">
            <rect x={LIMIT + 1} y={BAR.y} width={303 - LIMIT} height={BAR.h} fill="url(#vt-spill)" />
            <path d={`M${LIMIT + 1} ${BAR.y}H304M${LIMIT + 1} ${BAR.y + BAR.h}H304`} stroke="url(#vt-spill)" strokeWidth="0.6" strokeDasharray="1.6 1.4" />
          </g>
        </g>
        <text className="vt-sliced" x={(LIMIT + 304) / 2} y="31" fill={WAIT} fontSize="4.4" letterSpacing="1.1" textAnchor="middle">SLICED</text>

        {/* first try: out on track 1 to Groq, which answers 429 (its lamp pings at 34% of the run, 3.06s); the
            backoff runs down round the signal */}
        <path className="vt-run1" pathLength={1} d={RUN_GROQ} fill="none" stroke={VIOLET} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <g className="vt-stop">
          <path d={RUN_GROQ} fill="none" stroke={STOP} strokeOpacity="0.6" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx={SIG} cy={ty(0)} r="2.8" fill={STOP} />
          <circle className="vt-ping" cx={SIG} cy={ty(0)} r="2.8" fill="none" stroke={STOP} strokeWidth="0.8" style={{ animationDelay: '3.06s' }} />
          <text x={SIG + 6} y={ty(0) - 4.6} fontSize="5.6"><tspan fill={STOP} fontWeight="700">429</tspan><tspan fill={WAIT} fontSize="4.6"> backoff 1s</tspan></text>
        </g>
        <circle className="vt-wait" pathLength={1} cx={SIG} cy={ty(0)} r="5.6" fill="none" stroke={WAIT} strokeWidth="1" transform={`rotate(-90 ${SIG} ${ty(0)})`} />

        {/* the points throw to track 2: Gemini answers 200 (52.6%, 4.73s) and the route runs on to the terminus */}
        <path className="vt-run2" pathLength={1} d={RUN_GEMINI} fill="none" stroke={VIOLET} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <g className="vt-go">
          <circle cx={SIG} cy={ty(1)} r="2.8" fill={GO} />
          <circle className="vt-ping" cx={SIG} cy={ty(1)} r="2.8" fill="none" stroke={GO} strokeWidth="0.8" style={{ animationDelay: '4.73s' }} />
          <text x={SIG + 6} y={ty(1) - 4.6} fontSize="5.6"><tspan fill={GO} fontWeight="700">200</tspan><tspan fill={MUTED} fontSize="4.6"> 1.8s</tspan></text>
        </g>
        {/* the request: a short car riding the lit route */}
        <path className="vt-car1" pathLength={1} d={RUN_GROQ} fill="none" stroke="#fafafa" strokeWidth="4.6" strokeLinecap="round" strokeDasharray="0.027 2" />
        <path className="vt-car2" pathLength={1} d={RUN_GEMINI} fill="none" stroke="#fafafa" strokeWidth="4.6" strokeLinecap="round" strokeDasharray="0.012 2" />

        {/* the terminus: the ring closes check by check and the score lands */}
        <circle className="vt-ring" pathLength={1} cx={TERM.x} cy={TERM.y} r={TERM.r} fill="none" stroke={VIOLET} strokeWidth="2.2" transform={`rotate(-90 ${TERM.x} ${TERM.y})`} />
        <text className="vt-score" x={TERM.x} y={TERM.y + 3} fill="#fafafa" fontSize="8.4" fontWeight="700" textAnchor="middle">8.8</text>
        {/* the question it wrote, grounded in a real repo */}
        <text className="vt-tag" x="14" y="182" fontSize="4.4" letterSpacing="1.1"><tspan fill={VIOLET}>Q12</tspan><tspan fill={MUTED}> · PROJECT DEEP-DIVE</tspan></text>
        <text className="vt-q1" x="14" y="196" fill="#f4f4f5" fontSize="6.6" fontWeight="600">Your gold price is spot × live FX.</text>
        <text className="vt-q2" x="14" y="207" fill="#f4f4f5" fontSize="6.6" fontWeight="600">What breaks when the FX feed goes stale?</text>
        <text className="vt-meta" x="14" y="221" fontSize="4.6"><tspan fill={GO}>✓ humanized</tspan><tspan fill={MUTED}> · from simplify-money-backend</tspan></text>
      </g>
      <path d={NOTCHES} stroke="#000" strokeWidth="1.4" />
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

/* ---------- Project marks next to each project name ----------
   One idea per mark, taken from how the product works, drawn on a 24-unit grid in the project's accent:
   RADAR   a scope whose beam trails off in a crescent; each turn it finds the gold job and pings
   Vettly  the terminus ring with one check-segment missing; the V drops into the gap
   EVES    one stroke: speech decays into a waiting cursor
   A flat dark tile, the same in both themes, like the project screens. RADAR's scope always turns; the others
   play their one motion on hover. */
const MARK_COLOR: Record<Visual, string> = { radar: '#34d399', router: '#a78bfa', wave: '#22d3ee', gold: '#f59e0b' }

function Glyph({ kind }: { kind: Visual }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[62%] h-[62%]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {kind === 'radar' && (
        <>
          <defs>
            <linearGradient id="gl-beam" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="currentColor" stopOpacity="0.85" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient>
          </defs>
          <circle cx="12" cy="12" r="9.5" strokeWidth="1.2" strokeOpacity="0.45" />
          <circle cx="12" cy="12" r="5" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="1 1.6" />
          <g className="gl-sweep">
            <path d="M12 12L12 2.5A9.5 9.5 0 0 0 4.22 6.55Q7.6 9.6 12 12Z" fill="url(#gl-beam)" stroke="none" />
            <path d="M12 12V2.5" strokeWidth="1.6" />
          </g>
          <circle className="gl-ping" cx="15.8" cy="7.2" r="1.5" stroke="#facc15" strokeWidth="0.8" />
          <circle className="gl-blip" cx="15.8" cy="7.2" r="1.5" fill="#facc15" stroke="none" />
          <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
        </>
      )}
      {kind === 'router' && (
        <>
          <path pathLength={6} strokeLinecap="butt" strokeWidth="2.4" strokeDasharray="0.84 0.16" d="M15.51 4.81A8 8 0 1 1 8.49 4.81" />
          <path className="gl-v" strokeWidth="2.4" d="M8.7 3L12 9.6L15.3 3" />
        </>
      )}
      {kind === 'wave' && (
        <>
          <path className="gl-wave" pathLength={1} strokeWidth="2.1" d="M2.5 12C4 4.4 5.9 4.4 7.4 12C8.5 17.2 9.9 17.2 11 12C11.7 9.2 12.7 9.2 13.4 12H15.2" />
          <rect className="gl-cursor" x="17.2" y="6.5" width="3.2" height="11" rx="0.5" fill="currentColor" stroke="none" />
        </>
      )}
      {kind === 'gold' && (
        <>
          <circle cx="12" cy="12" r="8.5" strokeOpacity="0.6" strokeWidth="1.4" strokeDasharray="2 2.2" />
          <text x="12" y="16.6" fill="currentColor" stroke="none" fontSize="12.5" fontWeight="700" textAnchor="middle" fontFamily="Oxanium, sans-serif">₹</text>
        </>
      )}
    </svg>
  )
}

export function ProjectMark({ kind }: { kind: Visual }) {
  const c = MARK_COLOR[kind]
  return (
    <span aria-hidden className="pm grid place-items-center shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#0c0d10]"
      style={{ color: c, boxShadow: `inset 0 0 0 1px ${c}40` }}>
      <Glyph kind={kind} />
    </span>
  )
}
