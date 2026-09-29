import type { PointerEvent } from 'react'
import { motion, useSpring } from 'framer-motion'
import type { Visual } from './data'

/*
  Project dashboards. Each is a small HUD built from the real product's brand and workflow:
  RADAR   phosphor #00FF41 scope (as in its own logo), 20-source scan grid, nightly pipeline rail
  Vettly  priority context stack → failover router → scored, humanized answer
  EVES    meeting waveform → hex "eye" whose pupil is an equalizer → diarized transcript → prompts
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
const G = '#00FF41'
const MINT = '#B6FFC6'
const GOLD = '#FACC15'
const RS = { x: 96, y: 112, r: 62 }
const onScope = (a: number, r: number) => ({ x: RS.x + r * Math.cos(deg(a)), y: RS.y + r * Math.sin(deg(a)) })
const sweepDelay = (a: number) => `${(a / 360) * 4 - 4}s` // the beam crosses angle a at this point of its 4s turn
const JOBS: [number, number, string][] = [[28, 44, 'BE 72'], [118, 48, 'ML 64'], [200, 30, ''], [238, 52, 'SRE 58'], [336, 24, ''], [160, 16, '']]
const TARGET: [number, number] = [302, 44]
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
const STAGES: [string, string][] = [['DISCOVER', 'robots.txt'], ['INGEST', '20 feeds'], ['VERIFY', 'link alive'], ['MATCH', '0–100'], ['VAULT', '≥ 80 kept']]

function Radar() {
  const t = onScope(...TARGET)
  const bracket = (sx: number, sy: number) => `M${t.x + sx * 11} ${t.y + sy * 5}V${t.y + sy * 11}H${t.x + sx * 5}`
  return (
    <g>
      <defs>
        <Glow id="rd-glow" />
        <Glow id="rd-bloom" blur={3.2} />
        <radialGradient id="rd-glass">
          <stop offset="0" stopColor={G} stopOpacity="0.2" />
          <stop offset="0.7" stopColor={G} stopOpacity="0.05" />
          <stop offset="1" stopColor={G} stopOpacity="0.12" />
        </radialGradient>
        <linearGradient id="rd-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.25" stopColor="#fff" />
          <stop offset="0.75" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="rd-ticker" maskUnits="userSpaceOnUse" x="188" y="102" width="120" height="58">
          <rect x="188" y="102" width="120" height="58" fill="url(#rd-fade)" />
        </mask>
        <filter id="rd-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" /></filter>
        <linearGradient id="rd-tail" x1="0" x2="1"><stop offset="0" stopColor={G} stopOpacity="0" /><stop offset="1" stopColor={MINT} /></linearGradient>
        <linearGradient id="rd-rail" x1="0" x2="1"><stop offset="0" stopColor={G} stopOpacity="0.15" /><stop offset="0.6" stopColor={G} stopOpacity="0.6" /><stop offset="1" stopColor={GOLD} stopOpacity="0.8" /></linearGradient>
      </defs>
      <Frame title="RADAR · JOB INTELLIGENCE" right="01:30 UTC" color={G} live={G} />

      {/* the beam, then the scope drawn over it */}
      {['url(#rd-soft)', undefined].map((f) => (
        <g key={f ?? 'beam'} className="rd-spin" filter={f} opacity={f ? 0.9 : 1} style={{ transformOrigin: `${RS.x}px ${RS.y}px` }}>
          {CONE.map((s, i) => <path key={i} d={s.d} fill={G} fillOpacity={s.o} />)}
          <path d={`M${RS.x} ${RS.y}L${RS.x + RS.r} ${RS.y}`} stroke={MINT} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ))}
      {Array.from({ length: 72 }, (_, i) => {
        const major = i % 6 === 0
        const a = onScope(i * 5, major ? 64 : 66)
        const b = onScope(i * 5, 70)
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={G} strokeOpacity={major ? 0.95 : 0.35} strokeWidth={major ? 1.2 : 0.6} />
      })}
      {([[270, '000'], [0, '090'], [180, '270']] as [number, string][]).map(([a, l]) => {
        const p = onScope(a, 76)
        return <text key={l} x={p.x} y={p.y + 2} fill={MINT} fillOpacity="0.55" fontSize="5.2" textAnchor="middle" fontFamily={MONO}>{l}</text>
      })}
      <circle cx={RS.x} cy={RS.y} r={RS.r} fill="url(#rd-glass)" stroke={G} strokeOpacity="0.7" filter="url(#rd-glow)" />
      {[21, 42].map((r) => <circle key={r} cx={RS.x} cy={RS.y} r={r} fill="none" stroke={G} strokeOpacity="0.28" strokeDasharray="1.5 3" />)}
      <path d={`M${RS.x - RS.r} ${RS.y}H${RS.x + RS.r}M${RS.x} ${RS.y - RS.r}V${RS.y + RS.r}`} stroke={G} strokeOpacity="0.16" />
      {/* sonar pings rolling out from the centre */}
      {[0, 1].map((k) => <circle key={k} className="rd-sonar" cx={RS.x} cy={RS.y} r={RS.r} fill="none" stroke={G} strokeWidth="1.2" style={{ animationDelay: `${-k * 1.6}s` }} />)}
      <g filter="url(#rd-glow)">
        {JOBS.map(([a, r, label]) => {
          const p = onScope(a, r)
          return (
            <g key={`${a}-${r}`} className="rd-blip" style={{ animationDelay: sweepDelay(a) }}>
              <circle cx={p.x} cy={p.y} r="2.5" fill={G} />
              {label && <text x={p.x + 4.5} y={p.y - 3.5} fill={MINT} fontSize="5.4" fontFamily={MONO}>{label}</text>}
            </g>
          )
        })}
      </g>
      {/* the 80+ match: a gold reticle snaps onto it and a card flies out */}
      <circle className="rd-ping" cx={t.x} cy={t.y} r="3" fill="none" stroke={GOLD} strokeWidth="0.9" style={{ animationDelay: sweepDelay(TARGET[0]) }} />
      <g className="rd-blip" style={{ animationDelay: sweepDelay(TARGET[0]) }}>
        <circle cx={t.x} cy={t.y} r="3.2" fill={GOLD} filter="url(#rd-bloom)" />
      </g>
      <g className="rd-lock" style={{ animationDelay: sweepDelay(TARGET[0]), transformOrigin: `${t.x}px ${t.y}px` }} stroke={GOLD} strokeWidth="1.3" fill="none">
        <path d={bracket(-1, -1)} /><path d={bracket(1, -1)} /><path d={bracket(-1, 1)} /><path d={bracket(1, 1)} />
      </g>
      <g className="rd-card" style={{ animationDelay: sweepDelay(TARGET[0]) }}>
        <path d={`M${t.x + 6} ${t.y - 8}L${t.x + 14} ${t.y - 16}H${t.x + 20}`} fill="none" stroke={GOLD} strokeOpacity="0.8" />
        <rect x={t.x + 6} y={t.y - 42} width="58" height="24" rx="5" fill="#0a0d02" stroke={GOLD} strokeOpacity="0.8" />
        <text x={t.x + 12} y={t.y - 31.5} fill={GOLD} fontSize="7" fontWeight="700" fontFamily={MONO}>MATCH 91</text>
        <text x={t.x + 12} y={t.y - 23} fill={MINT} fontSize="5.2" fontFamily={MONO}>backend → VAULT</text>
      </g>
      <circle cx={RS.x} cy={RS.y} r="2" fill={MINT} filter="url(#rd-glow)" />

      {/* sources HUD */}
      <polygon points={plate(184, 32, 126, 150)} fill="#000d04" fillOpacity="0.85" stroke={G} strokeOpacity="0.4" />
      <text x="192" y="45" fill={MINT} fillOpacity="0.65" fontSize="5.6" letterSpacing="1.5" fontFamily={MONO}>LIVE SOURCES</text>
      <text x="191" y="76" fill={G} fontSize="27" fontWeight="600" fontFamily={MONO} filter="url(#rd-bloom)">20</text>
      <text x="230" y="61" fill={G} fontSize="6.2" fontFamily={MONO}>■ 11 ATS feeds</text>
      <text x="230" y="72" fill={MINT} fontSize="6.2" fontFamily={MONO}>■ 9 job boards</text>
      <line x1="192" y1="86" x2="302" y2="86" stroke={G} strokeOpacity="0.2" />
      <text x="192" y="97" fill={MINT} fillOpacity="0.55" fontSize="5.2" letterSpacing="1.4" fontFamily={MONO}>SCAN LOG</text>
      <circle className="rd-live" cx="298" cy="95" r="2" fill={G} />
      <g mask="url(#rd-ticker)">
        <g className="rd-ticker">
          {[...SOURCES, ...SOURCES].map((s, i) => (
            <g key={i}>
              <text x="192" y={110 + i * 10} fill={i % 20 < 11 ? G : MINT} fillOpacity="0.9" fontSize="6.4" fontFamily={MONO}>› {s}</text>
              <text x="302" y={110 + i * 10} fill={G} fontSize="6.4" textAnchor="end" fontFamily={MONO}>✓</text>
            </g>
          ))}
        </g>
      </g>
      <text x="192" y="174" fill={MINT} fillOpacity="0.75" fontSize="5.6" fontFamily={MONO}>82 companies · 54 live</text>

      {/* nightly pipeline: a comet runs the rail and lights each stage */}
      <line x1="30" y1="214" x2="294" y2="214" stroke="url(#rd-rail)" strokeWidth="1.3" />
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

/* ================= Vettly — the prism ================= */
// Context streams pour into a crystal prism; it refracts them toward four providers. Claude rate-limits
// (429, its beam breaks), Gemini answers, and the answer lands in a scored orb.
const VIOLET = '#a78bfa'
const FUCHSIA = '#e879f9'
const PROVIDERS = [
  { name: 'Claude', tag: 'primary', color: '#f0906e', y: 50 },
  { name: 'Gemini', tag: 'fallback 1', color: '#6ea8ff', y: 90 },
  { name: 'OpenAI', tag: 'fallback 2', color: '#2dd4a7', y: 130 },
  { name: 'Groq', tag: 'fast lane', color: '#ff7a59', y: 170 },
]
const STREAMS: [string, string, number][] = [['ASSIGNMENT', '#c4b5fd', 58], ['JD + STACK', '#d8b4fe', 92], ['RESUME', '#f0abfc', 126], ['GITHUB REPOS', '#f9a8d4', 160]]
const PR = { l: 132, t: 82, b: 142, tip: 184, cy: 112 }
const PRC = { x: (PR.l * 2 + PR.tip) / 3, y: PR.cy }
const GEM = 250
const ORB = { x: 206, y: 196 }
const beamOut = (y: number) => `M${PR.tip} ${PR.cy}C${PR.tip + 26} ${PR.cy} ${GEM - 36} ${y} ${GEM - 10} ${y}`

function Vettly() {
  const prism = `${PR.l},${PR.t} ${PR.l},${PR.b} ${PR.tip},${PR.cy}`
  return (
    <g>
      <defs>
        <Glow id="vt-glow" blur={2.2} />
        <Glow id="vt-bloom" blur={5} />
        {STREAMS.map(([, c], i) => (
          <linearGradient key={i} id={`vt-in-${i}`} gradientUnits="userSpaceOnUse" x1="70" y1="0" x2={PR.l} y2="0">
            <stop offset="0" stopColor={c} stopOpacity="0.15" /><stop offset="1" stopColor={c} />
          </linearGradient>
        ))}
        {PROVIDERS.map((p, i) => (
          <linearGradient key={i} id={`vt-out-${i}`} gradientUnits="userSpaceOnUse" x1={PR.tip} y1="0" x2={GEM} y2="0">
            <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor={p.color} />
          </linearGradient>
        ))}
        {PROVIDERS.map((p, i) => (
          <radialGradient key={i} id={`vt-gem-${i}`} cx="0.35" cy="0.3" r="0.9">
            <stop offset="0" stopColor="#ffffff" /><stop offset="0.45" stopColor={p.color} /><stop offset="1" stopColor={p.color} stopOpacity="0.55" />
          </radialGradient>
        ))}
        <linearGradient id="vt-f1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity="0.9" /><stop offset="1" stopColor={VIOLET} stopOpacity="0.55" /></linearGradient>
        <linearGradient id="vt-f2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={VIOLET} stopOpacity="0.75" /><stop offset="1" stopColor={FUCHSIA} stopOpacity="0.85" /></linearGradient>
        <linearGradient id="vt-f3" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor={FUCHSIA} stopOpacity="0.45" /><stop offset="1" stopColor="#ffffff" stopOpacity="0.7" /></linearGradient>
        <radialGradient id="vt-orb" cx="0.38" cy="0.32" r="0.9"><stop offset="0" stopColor="#ffffff" /><stop offset="0.45" stopColor={VIOLET} /><stop offset="1" stopColor="#86198f" /></radialGradient>
        <linearGradient id="vt-ans" gradientUnits="userSpaceOnUse" x1={GEM} y1="100" x2={ORB.x} y2={ORB.y}><stop offset="0" stopColor={PROVIDERS[1].color} /><stop offset="1" stopColor={FUCHSIA} /></linearGradient>
        <clipPath id="vt-prism"><polygon points={prism} /></clipPath>
      </defs>
      <Frame title="VETTLY · PREP STUDIO" right="CTX 80K" color={VIOLET} live={FUCHSIA} />
      <text x="14" y="38" fill="#e9d5ff" fillOpacity="0.6" fontSize="5.4" letterSpacing="1.4" fontFamily={MONO}>CONTEXT · PRIORITY</text>

      {/* context streams → prism */}
      {STREAMS.map(([label, c, y], i) => {
        const inY = PR.cy + (i - 1.5) * 10
        const d = `M70 ${y}C104 ${y} 108 ${inY} ${PR.l} ${inY}`
        return (
          <g key={label}>
            <circle cx="18" cy={y} r="3" fill={c} filter="url(#vt-glow)" />
            <text x="25" y={y + 2} fill="#f5f3ff" fontSize="5.8" fontWeight="600" fontFamily={MONO}>P{i + 1} {label}</text>
            <path d={d} fill="none" stroke={`url(#vt-in-${i})`} strokeWidth="2.6" strokeLinecap="round" />
            <path className="vt-flow" d={d} fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="3 14" style={{ animationDelay: `${-i * 0.3}s` }} />
          </g>
        )
      })}
      <text x="14" y="184" fill={FUCHSIA} fillOpacity="0.8" fontSize="5.4" fontFamily={MONO}>80,000 chars, key specs first</text>

      {/* prism → providers */}
      {PROVIDERS.map((p, i) => (
        <g key={p.name}>
          <path d={beamOut(p.y)} fill="none" stroke={`url(#vt-out-${i})`} strokeWidth="1.8" strokeOpacity="0.55" />
          <path className="vt-flow" d={beamOut(p.y)} fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1" strokeDasharray="2 12" style={{ animationDelay: `${-i * 0.25}s` }} />
        </g>
      ))}

      {/* the crystal */}
      <g className="vt-float">
        <polygon points={prism} fill={FUCHSIA} opacity="0.35" filter="url(#vt-bloom)" />
        <polygon points={`${PR.l},${PR.t} ${PR.l},${PR.b} ${PRC.x},${PRC.y}`} fill="url(#vt-f1)" />
        <polygon points={`${PR.l},${PR.t} ${PR.tip},${PR.cy} ${PRC.x},${PRC.y}`} fill="url(#vt-f2)" />
        <polygon points={`${PR.l},${PR.b} ${PR.tip},${PR.cy} ${PRC.x},${PRC.y}`} fill="url(#vt-f3)" />
        <polygon points={prism} fill="none" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="1" />
        <g clipPath="url(#vt-prism)"><rect className="vt-shine" x={PR.l - 20} y={PR.t - 10} width="7" height="80" fill="#ffffff" opacity="0.75" transform={`skewX(-18)`} /></g>
      </g>
      {[[PR.l - 6, PR.t - 4, 0], [PR.tip + 4, PR.cy - 14, 0.5], [PR.l + 18, PR.b + 8, 1], [PR.tip - 8, PR.t - 8, 1.4]].map(([x, y, d], i) => (
        <path key={i} className="vt-twinkle" d={`M${x} ${y - 4}L${x + 1} ${y - 1}L${x + 4} ${y}L${x + 1} ${y + 1}L${x} ${y + 4}L${x - 1} ${y + 1}L${x - 4} ${y}L${x - 1} ${y - 1}Z`}
          fill="#ffffff" style={{ animationDelay: `${d}s` }} />
      ))}
      <text x={PRC.x + 4} y={PR.b + 20} fill="#f5f3ff" fillOpacity="0.8" fontSize="5.4" letterSpacing="1.4" textAnchor="middle" fontFamily={MONO}>FAILOVER ROUTER</text>

      {/* providers as gems */}
      {PROVIDERS.map((p, i) => (
        <g key={p.name}>
          <circle cx={GEM} cy={p.y} r="12" fill={p.color} opacity="0.18" filter="url(#vt-bloom)" />
          <circle cx={GEM} cy={p.y} r="8.5" fill={`url(#vt-gem-${i})`} />
          <circle cx={GEM - 2.6} cy={p.y - 2.8} r="2" fill="#ffffff" opacity="0.8" />
          <text x={GEM + 14} y={p.y} fill="#f8fafc" fontSize="7.2" fontWeight="600" fontFamily={MONO}>{p.name}</text>
          <text x={GEM + 14} y={p.y + 8} fill={p.color} fontSize="5.2" fontFamily={MONO}>{p.tag}</text>
        </g>
      ))}
      {/* Claude rate-limits: its beam breaks red */}
      <g className="vt-429">
        <path d={beamOut(PROVIDERS[0].y)} fill="none" stroke="#ef4444" strokeWidth="2.4" strokeDasharray="3 3" filter="url(#vt-glow)" />
        <circle cx={GEM} cy={PROVIDERS[0].y} r="11" fill="none" stroke="#ef4444" strokeWidth="1.6" />
        <rect x={GEM - 40} y={PROVIDERS[0].y - 18} width="26" height="12" rx="6" fill="#2a0707" stroke="#ef4444" />
        <text x={GEM - 27} y={PROVIDERS[0].y - 9.7} fill="#fca5a5" fontSize="6.4" fontWeight="700" textAnchor="middle" fontFamily={MONO}>429</text>
      </g>
      {/* Gemini answers: its beam blazes */}
      <g className="vt-200">
        <path d={beamOut(PROVIDERS[1].y)} fill="none" stroke={PROVIDERS[1].color} strokeWidth="3" filter="url(#vt-bloom)" />
        <path d={beamOut(PROVIDERS[1].y)} fill="none" stroke="#ffffff" strokeWidth="1.2" />
        <circle cx={GEM} cy={PROVIDERS[1].y} r="11" fill="none" stroke="#22c55e" strokeWidth="1.6" />
        <rect x={GEM - 44} y={PROVIDERS[1].y - 18} width="30" height="12" rx="6" fill="#052e16" stroke="#22c55e" />
        <text x={GEM - 29} y={PROVIDERS[1].y - 9.7} fill="#86efac" fontSize="6.2" fontWeight="700" textAnchor="middle" fontFamily={MONO}>200 ✓</text>
      </g>

      {/* the answer lands in the scored orb */}
      <path className="vt-ans" pathLength={1} d={`M${GEM - 9} ${PROVIDERS[1].y + 4}C${GEM - 30} 120 ${GEM - 26} ${ORB.y - 10} ${ORB.x + 17} ${ORB.y}`} fill="none" stroke="url(#vt-ans)" strokeWidth="2" filter="url(#vt-glow)" />
      <circle cx={ORB.x} cy={ORB.y} r="20" fill={VIOLET} opacity="0.2" filter="url(#vt-bloom)" />
      <circle cx={ORB.x} cy={ORB.y} r="17" fill="none" stroke={VIOLET} strokeOpacity="0.2" strokeWidth="3" />
      <circle className="vt-ring" pathLength={1} cx={ORB.x} cy={ORB.y} r="17" fill="none" stroke={FUCHSIA} strokeWidth="3" strokeLinecap="round" transform={`rotate(-90 ${ORB.x} ${ORB.y})`} />
      <circle cx={ORB.x} cy={ORB.y} r="12" fill="url(#vt-orb)" />
      <text x={ORB.x} y={ORB.y + 2.6} fill="#ffffff" fontSize="7.6" fontWeight="700" textAnchor="middle" fontFamily={MONO}>8.8</text>
      <text x={ORB.x - 26} y={ORB.y - 6} fill="#f5f3ff" fontSize="5.8" fontWeight="600" textAnchor="end" fontFamily={MONO}>Q#12 SYSTEM DESIGN</text>
      <text x={ORB.x - 26} y={ORB.y + 3} fill="#86efac" fontSize="5.4" textAnchor="end" fontFamily={MONO}>humanized · 7/7 checks</text>
      <text x={ORB.x - 26} y={ORB.y + 11} fill={VIOLET} fontSize="5" textAnchor="end" fontFamily={MONO}>9 tracks · STAR · DSA</text>

      {/* the request of light: in through the prism, bounced by Claude, answered by Gemini, into the orb */}
      <circle className="vt-p1" r="3.4" cx={0} cy={0} fill="#fff" filter="url(#vt-glow)" />
      <circle className="vt-p2" r="3.4" cx={0} cy={0} fill="#fff" filter="url(#vt-glow)" />
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
  radar: { from: '#6ee7b7', via: '#10b981', to: '#0f5f56', glow: '#10b981' },
  wave: { from: '#67e8f9', via: '#6366f1', to: '#9333ea', glow: '#6366f1' },
  router: { from: '#c4b5fd', via: '#8b5cf6', to: '#db2777', glow: '#a855f7' },
  gold: { from: '#fef08a', via: '#f59e0b', to: '#b45309', glow: '#f59e0b' },
}

function Glyph({ kind }: { kind: Visual }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[64%] h-[64%]" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))' }}>
      {kind === 'radar' && (
        <>
          <circle cx="12" cy="12" r="8.5" strokeOpacity="0.55" strokeWidth="1.4" />
          <circle cx="12" cy="12" r="4.6" strokeOpacity="0.8" strokeWidth="1.4" />
          <g className="gl-spin">
            <path d="M12 12 L12 3.5 A8.5 8.5 0 0 1 19.4 7.8 Z" fill="#fff" fillOpacity="0.35" stroke="none" />
            <path d="M12 12 L19.4 7.8" strokeWidth="1.8" />
          </g>
          <circle className="gl-ping" cx="16.2" cy="15.4" r="1.4" fill="#fff" stroke="none" />
          <circle cx="12" cy="12" r="1.3" fill="#fff" stroke="none" />
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
