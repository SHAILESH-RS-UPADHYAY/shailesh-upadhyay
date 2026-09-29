import type { PointerEvent } from 'react'
import { motion, useSpring } from 'framer-motion'
import type { Visual } from './data'

/*
  Project dashboards. Each is a small HUD built from the real product's brand and workflow:
  RADAR   phosphor #00FF41 scope (as in its own logo), 20-source scan grid, nightly pipeline rail
  Vettly  priority context stack → failover router → scored, humanized answer
  EVES    meeting waveform → hex "eye" whose pupil is an equalizer → diarized transcript → prompts
  Styling borrows from the cyberpunk-ui skill: chamfered plates, barcode accents, neon glow.
  Looping motion is CSS (index.css, "project visuals") or framer keyframes, and stops under reduced motion.
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

// Fade in at `start` (fraction of the loop), hold, fade out together at the end.
const seq = (start: number, dur = 7, from = 0) => ({
  initial: { opacity: from },
  animate: { opacity: [from, from, 1, 1, from] },
  transition: { duration: dur, repeat: Infinity, times: [0, start, start + 0.04, 0.93, 1], ease: 'easeOut' as const },
})

/* ================= RADAR ================= */
const G = '#00FF41'
const MINT = '#B6FFC6'
const GOLD = '#FACC15'
const RS = { x: 88, y: 100, r: 56 }
const onScope = (a: number, r: number) => ({ x: RS.x + r * Math.cos(deg(a)), y: RS.y + r * Math.sin(deg(a)) })
const sweepDelay = (a: number) => `${(a / 360) * 4 - 4}s` // the beam crosses angle a at this point of its 4s turn
const JOBS: [number, number, string][] = [[28, 40, 'BE 72'], [120, 44, 'ML 64'], [200, 28, ''], [236, 46, 'SRE 58'], [334, 22, ''], [160, 14, '']]
const TARGET: [number, number] = [300, 40]
const SOURCES = [
  'Greenhouse', 'Lever', 'Ashby', 'Workable', 'SmartRecruiters', 'Recruitee', 'Personio', 'Breezy HR', 'Teamtailor', 'Workday',
  'Amazon Jobs', 'Hacker News', 'Remotive', 'Remote OK', 'Arbeitnow', 'Himalayas', 'Jobicy', 'The Muse', 'Adzuna', 'Jooble',
]
const STAGES: [string, string][] = [['DISCOVER', 'robots.txt'], ['INGEST', '20 feeds'], ['VERIFY', 'link alive'], ['MATCH', '0–100'], ['VAULT', '≥ 80 kept']]

function Radar() {
  const t = onScope(...TARGET)
  return (
    <g>
      <defs>
        <Glow id="rd-glow" />
        <radialGradient id="rd-glass">
          <stop offset="0" stopColor={G} stopOpacity="0.14" />
          <stop offset="1" stopColor={G} stopOpacity="0.02" />
        </radialGradient>
        <linearGradient id="rd-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.3" stopColor="#fff" />
          <stop offset="0.7" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="rd-ticker" maskUnits="userSpaceOnUse" x="176" y="100" width="130" height="44">
          <rect x="176" y="100" width="130" height="44" fill="url(#rd-fade)" />
        </mask>
      </defs>
      <Frame title="RADAR · JOB INTELLIGENCE" right="01:30 UTC" color={G} live={G} />

      {/* scope (the smooth beam itself is the .rd-cone HTML layer underneath) */}
      {Array.from({ length: 72 }, (_, i) => {
        const major = i % 6 === 0
        const a = onScope(i * 5, major ? 58 : 60)
        const b = onScope(i * 5, 63)
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={G} strokeOpacity={major ? 0.9 : 0.35} strokeWidth={major ? 1.1 : 0.6} />
      })}
      {([[270, '000'], [0, '090'], [90, '180'], [180, '270']] as [number, string][]).map(([a, l]) => {
        const p = onScope(a, 69)
        return <text key={l} x={p.x} y={p.y + 2} fill={MINT} fillOpacity="0.55" fontSize="5.2" textAnchor="middle" fontFamily={MONO}>{l}</text>
      })}
      <circle cx={RS.x} cy={RS.y} r={RS.r} fill="url(#rd-glass)" stroke={G} strokeOpacity="0.6" />
      {[19, 38].map((r) => <circle key={r} cx={RS.x} cy={RS.y} r={r} fill="none" stroke={G} strokeOpacity="0.25" strokeDasharray="1.5 3" />)}
      <line x1={RS.x - RS.r} y1={RS.y} x2={RS.x + RS.r} y2={RS.y} stroke={G} strokeOpacity="0.14" />
      <line x1={RS.x} y1={RS.y - RS.r} x2={RS.x} y2={RS.y + RS.r} stroke={G} strokeOpacity="0.14" />
      <g filter="url(#rd-glow)">
        {JOBS.map(([a, r, label]) => {
          const p = onScope(a, r)
          return (
            <g key={`${a}-${r}`} className="rd-blip" style={{ animationDelay: sweepDelay(a) }}>
              <circle cx={p.x} cy={p.y} r="2.4" fill={G} />
              {label && <text x={p.x + 4.5} y={p.y - 3.5} fill={MINT} fontSize="5.4" fontFamily={MONO}>{label}</text>}
            </g>
          )
        })}
        <circle className="rd-ping" cx={t.x} cy={t.y} r="3" fill="none" stroke={GOLD} strokeWidth="0.8" style={{ animationDelay: sweepDelay(TARGET[0]) }} />
        <g className="rd-blip" style={{ animationDelay: sweepDelay(TARGET[0]) }}>
          <circle cx={t.x} cy={t.y} r="3" fill={GOLD} />
          <text x={t.x + 5} y={t.y - 4} fill={GOLD} fontSize="6" fontWeight="600" fontFamily={MONO}>91 → VAULT</text>
        </g>
      </g>
      <circle cx={RS.x} cy={RS.y} r="1.8" fill={MINT} />

      {/* source HUD */}
      <polygon points={plate(168, 30, 142, 136)} fill="#000d04" fillOpacity="0.8" stroke={G} strokeOpacity="0.35" />
      <text x="176" y="42" fill={MINT} fillOpacity="0.6" fontSize="5.8" letterSpacing="1.4" fontFamily={MONO}>LIVE SOURCES</text>
      <text x="176" y="68" fill={G} fontSize="25" fontWeight="600" fontFamily={MONO} filter="url(#rd-glow)">20</text>
      <text x="212" y="55" fill={G} fontSize="6.4" fontFamily={MONO}>■ 11 ATS feeds</text>
      <text x="212" y="65" fill={MINT} fontSize="6.4" fontFamily={MONO}>■ 9 job boards</text>
      {SOURCES.map((_, i) => (
        <rect key={i} className="rd-cell" x={176 + (i % 10) * 13} y={74 + Math.floor(i / 10) * 11} width="10" height="8" rx="1.5"
          fill={i < 11 ? G : MINT} style={{ animationDelay: `${i * 0.18}s` }} />
      ))}
      <g mask="url(#rd-ticker)">
        <g className="rd-ticker">
          {[...SOURCES, ...SOURCES].map((s, i) => (
            <text key={i} x="176" y={108 + i * 10} fill={i % 20 < 11 ? G : MINT} fillOpacity="0.85" fontSize="6.6" fontFamily={MONO}>
              {i % 20 < 11 ? 'ATS  ' : 'BRD  '}{s}
            </text>
          ))}
        </g>
      </g>
      <text x="176" y="158" fill={MINT} fillOpacity="0.75" fontSize="6" fontFamily={MONO}>82 companies · 54 scraped live</text>

      {/* nightly pipeline rail */}
      <line x1="30" y1="204" x2="294" y2="204" stroke={G} strokeOpacity="0.3" strokeDasharray="2 3" />
      {STAGES.map(([name, detail], k) => {
        const x = 30 + k * 66
        return (
          <g key={name}>
            <text x={x} y="190" fill={k === 4 ? GOLD : MINT} fontSize="6" fontWeight="600" letterSpacing="0.8" textAnchor="middle" fontFamily={MONO}>{name}</text>
            <rect x={x - 5} y="199" width="10" height="10" transform={`rotate(45 ${x} 204)`} fill="#000d04" stroke={k === 4 ? GOLD : G} />
            <rect className="rd-flash" x={x - 5} y="199" width="10" height="10" transform={`rotate(45 ${x} 204)`} fill={k === 4 ? GOLD : G}
              filter="url(#rd-glow)" style={{ animationDelay: `${k * 0.8}s` }} />
            <text x={x} y="222" fill={MINT} fillOpacity="0.6" fontSize="5.4" textAnchor="middle" fontFamily={MONO}>{detail}</text>
          </g>
        )
      })}
      <circle className="rd-packet" cx="30" cy="204" r="2.6" fill="#fff" filter="url(#rd-glow)" />
    </g>
  )
}

/* ================= Vettly ================= */
const VIOLET = '#a78bfa'
const FUCHSIA = '#e879f9'
const PROVIDERS = [
  { name: 'Claude', tag: 'primary', color: '#e07a5f', y: 32 },
  { name: 'Gemini', tag: 'fallback 1', color: '#5b8def', y: 58 },
  { name: 'OpenAI', tag: 'fallback 2', color: '#10a37f', y: 84 },
  { name: 'Groq', tag: 'fast lane', color: '#f55036', y: 110 },
]
const CORE = { x: 160, y: 86 }
const LOOP = { duration: 5.6, repeat: Infinity, ease: 'easeInOut' } as const
const flash = (times: number[]) => ({ initial: { opacity: 0 }, animate: { opacity: [0, 0, 1, 1, 0, 0] }, transition: { ...LOOP, times } })
const TRACKS = ['DSA', 'SYSTEM', 'DEEP-DIVE', 'BEHAVIOR', 'TECH', 'SITUATION', 'HR', 'GENERAL', 'TAKE-HOME']

function Vettly() {
  return (
    <g>
      <defs>
        <Glow id="vt-glow" blur={2.2} />
        <linearGradient id="vt-card" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={VIOLET} /><stop offset="1" stopColor={FUCHSIA} /></linearGradient>
        <radialGradient id="vt-core" cx="40%" cy="35%"><stop offset="0" stopColor="#fff" /><stop offset="0.45" stopColor={VIOLET} /><stop offset="1" stopColor="#86198f" /></radialGradient>
      </defs>
      <Frame title="VETTLY · PREP STUDIO" right="CTX 80K" color={VIOLET} live={FUCHSIA} />

      {/* priority context stack */}
      <text x="14" y="36" fill="#e9d5ff" fillOpacity="0.7" fontSize="5.8" letterSpacing="1.2" fontFamily={MONO}>CONTEXT STACK · PRIORITY</text>
      {['ASSIGNMENT', 'JD + STACK', 'RESUME', 'GITHUB REPOS'].map((l, i) => {
        const y = 42 + i * 22
        return (
          <g key={l} className="vt-card" style={{ animationDelay: `${i * 0.22}s` }}>
            <polygon points={`20,${y} 104,${y} 98,${y + 16} 14,${y + 16}`} fill="url(#vt-card)" fillOpacity={0.8 - i * 0.14} stroke={VIOLET} strokeOpacity="0.7" />
            <text x="22" y={y + 11} fill="#fff" fontSize="6.4" fontWeight="600" fontFamily={MONO}>P{i + 1}  {l}</text>
          </g>
        )
      })}
      <text x="14" y="140" fill={FUCHSIA} fontSize="6" fontFamily={MONO}>= 80,000 chars, key specs first</text>

      {/* router core */}
      <path d={`M104 ${CORE.y} L${CORE.x - 15} ${CORE.y}`} stroke={VIOLET} strokeOpacity="0.5" strokeDasharray="3 3" />
      {PROVIDERS.map((p) => (
        <path key={p.name} d={`M${CORE.x + 15} ${CORE.y} C 196 ${CORE.y}, 196 ${p.y + 11}, 218 ${p.y + 11}`} fill="none" stroke={p.color} strokeOpacity="0.45" strokeDasharray="3 3" />
      ))}
      <g className="spin-rev" style={{ transformOrigin: `${CORE.x}px ${CORE.y}px` }}>
        <circle cx={CORE.x} cy={CORE.y} r="33" fill="none" stroke={VIOLET} strokeOpacity="0.3" strokeDasharray="1 4" />
      </g>
      <g className="spin-orbit" style={{ transformOrigin: `${CORE.x}px ${CORE.y}px` }}>
        <circle cx={CORE.x} cy={CORE.y} r="24" fill="none" stroke={FUCHSIA} strokeOpacity="0.35" />
        {PROVIDERS.map((p, i) => {
          const q = { x: CORE.x + 24 * Math.cos(deg(i * 90)), y: CORE.y + 24 * Math.sin(deg(i * 90)) }
          return <circle key={p.name} cx={q.x} cy={q.y} r="2.6" fill={p.color} filter="url(#vt-glow)" />
        })}
      </g>
      <g className="vt-hub"><circle cx={CORE.x} cy={CORE.y} r="13" fill="url(#vt-core)" filter="url(#vt-glow)" /></g>
      <text x={CORE.x} y="126" fill="#f5f3ff" fillOpacity="0.8" fontSize="5.8" letterSpacing="1.2" textAnchor="middle" fontFamily={MONO}>FAILOVER ROUTER</text>
      <text x={CORE.x} y="135" fill={VIOLET} fillOpacity="0.8" fontSize="5.2" textAnchor="middle" fontFamily={MONO}>backoff on 429 / 529</text>

      {/* providers */}
      {PROVIDERS.map((p) => (
        <g key={p.name}>
          <polygon points={plate(218, p.y, 92, 22, 5)} fill="#0a0a12" stroke={p.color} strokeOpacity="0.65" />
          <circle cx="227" cy={p.y + 11} r="3" fill={p.color} filter="url(#vt-glow)" />
          <text x="234" y={p.y + 10} fill="#f5f5f5" fontSize="7" fontFamily={MONO}>{p.name}</text>
          <text x="234" y={p.y + 18} fill={p.color} fontSize="5.2" fontFamily={MONO}>{p.tag}</text>
        </g>
      ))}
      <motion.g {...flash([0, 0.22, 0.25, 0.36, 0.4, 1])}>
        <polygon points={plate(218, 32, 92, 22, 5)} fill="#ef4444" fillOpacity="0.12" stroke="#ef4444" strokeWidth="1.5" />
        <text x="305" y="46" fill="#fca5a5" fontSize="7" fontWeight="600" textAnchor="end" fontFamily={MONO}>429</text>
      </motion.g>
      <motion.g {...flash([0, 0.55, 0.58, 0.72, 0.76, 1])}>
        <polygon points={plate(218, 58, 92, 22, 5)} fill="#22c55e" fillOpacity="0.12" stroke="#22c55e" strokeWidth="1.5" />
        <text x="305" y="72" fill="#86efac" fontSize="7" fontWeight="600" textAnchor="end" fontFamily={MONO}>200 ✓</text>
      </motion.g>

      {/* output: scored, humanized answer */}
      <polygon points={plate(12, 150, 296, 80, 8)} fill="#0d0718" fillOpacity="0.9" stroke="url(#vt-card)" strokeOpacity="0.8" />
      <circle cx="42" cy="190" r="19" fill="none" stroke={VIOLET} strokeOpacity="0.18" strokeWidth="4" />
      <motion.circle cx="42" cy="190" r="19" fill="none" stroke="url(#vt-card)" strokeWidth="4" strokeLinecap="round" transform="rotate(-90 42 190)"
        initial={{ pathLength: 0 }} animate={{ pathLength: [0, 0, 0.88, 0.88, 0] }} transition={{ ...LOOP, times: [0, 0.84, 0.94, 0.98, 1] }} />
      <text x="42" y="192" fill="#fff" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily={MONO}>8.8</text>
      <text x="42" y="200" fill={VIOLET} fontSize="5" textAnchor="middle" fontFamily={MONO}>/ 10</text>
      <text x="70" y="167" fill="#fff" fontSize="6.8" fontWeight="600" fontFamily={MONO}>Q#12 · SYSTEM DESIGN</text>
      <text x="70" y="178" fill="#e9d5ff" fillOpacity="0.75" fontSize="5.8" fontFamily={MONO}>“Explain RADAR's match score.”</text>
      <text x="70" y="190" fill="#86efac" fontSize="5.6" fontFamily={MONO}>humanized · 7 checks passed</text>
      {[10, 13, 9, 12, 14, 11, 12].map((h, j) => (
        <rect key={j} className="vt-bar" x={70 + j * 8} y={222 - h} width="5" height={h} rx="1.5" fill="url(#vt-card)" style={{ animationDelay: `${j * 0.06}s` }} />
      ))}
      <text x="132" y="221" fill={VIOLET} fillOpacity="0.8" fontSize="5" fontFamily={MONO}>naturalness · metrics · flow…</text>
      {TRACKS.map((tr, i) => (
        <g key={tr} className="vt-track" style={{ animationDelay: `${i * 0.5}s` }}>
          <rect x={194 + (i % 3) * 37} y={158 + Math.floor(i / 3) * 14} width="34" height="10" rx="5" fill="none" stroke={FUCHSIA} strokeOpacity="0.8" />
          <text x={211 + (i % 3) * 37} y={165 + Math.floor(i / 3) * 14} fill="#f5d0fe" fontSize="4.6" textAnchor="middle" fontFamily={MONO}>{tr}</text>
        </g>
      ))}

      {/* the request */}
      <motion.circle r="4.2" cx={0} cy={0} fill="#fff" filter="url(#vt-glow)"
        initial={{ x: 104, y: CORE.y, opacity: 0 }}
        animate={{
          x: [104, CORE.x, 218, 218, CORE.x, 218, 218, CORE.x, 42, 42],
          y: [CORE.y, CORE.y, 43, 43, CORE.y, 69, 69, CORE.y, 168, 168],
          opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        }}
        transition={{ ...LOOP, times: [0, 0.12, 0.24, 0.34, 0.44, 0.56, 0.66, 0.76, 0.86, 1] }} />
    </g>
  )
}

/* ================= EVES ================= */
const CY = '#22d3ee'
const GR = '#7ee787'
const PU = '#c678dd'
const EYE = { x: 70, y: 146 }
const HEX = (r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = deg(-90 + i * 60)
    return `${(EYE.x + r * Math.cos(a)).toFixed(1)},${(EYE.y + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
const ALMOND = `M${EYE.x - 31} ${EYE.y} Q${EYE.x} ${EYE.y - 29} ${EYE.x + 31} ${EYE.y} Q${EYE.x} ${EYE.y + 29} ${EYE.x - 31} ${EYE.y} Z`
const WAVE = Array.from({ length: 79 }, (_, i) => 3 + 16 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11)) + (i % 7 === 0 ? 4 : 0))
const MARKERS: [number, string, string][] = [[92, 'DECISION', GR], [170, 'RULED OUT', '#f43f5e'], [248, 'ACTION ITEM', CY]]
const LINES: [string, string, string][] = [
  ['S1', "let's cache at the edge first", CY],
  ['S2', 'haan, cache layer pehle ship karo', PU],
  ['S1', 'Redis, 5-min TTL. Owner: me', CY],
]
const OUTPUTS = ['MAIN GOAL', 'DECISIONS', 'CODEX PROMPT', 'CLAUDE CODE']

function Eves() {
  return (
    <g>
      <defs>
        <Glow id="ev-glow" />
        <linearGradient id="ev-grad" gradientUnits="userSpaceOnUse" x1="14" y1="0" x2="306" y2="0">
          <stop offset="0" stopColor={CY} /><stop offset="0.52" stopColor={GR} /><stop offset="1" stopColor={PU} />
        </linearGradient>
        <linearGradient id="ev-hexgrad" gradientUnits="userSpaceOnUse" x1="30" y1="104" x2="110" y2="188">
          <stop offset="0" stopColor={CY} /><stop offset="0.52" stopColor={GR} /><stop offset="1" stopColor={PU} />
        </linearGradient>
        <clipPath id="ev-hex"><polygon points={HEX(42)} /></clipPath>
        <clipPath id="ev-almond"><path d={ALMOND} /></clipPath>
      </defs>
      <Frame title="EVES · MEETING INTEL" right="REC 01:47:22" color={CY} live="#f43f5e" />

      {/* the meeting, as a waveform with a playhead and what was decided where */}
      {WAVE.map((h, i) => <rect key={i} x={14 + i * 3.7} y={42 - h / 2} width="2" height={h} rx="1" fill="url(#ev-grad)" fillOpacity="0.9" />)}
      <g className="ev-playhead">
        <line x1="14" y1="28" x2="14" y2="56" stroke="#fff" strokeWidth="1.2" filter="url(#ev-glow)" />
        <path d="M11 27 L17 27 L14 31 Z" fill="#fff" />
      </g>
      {MARKERS.map(([x, l, c]) => (
        <g key={l}>
          <rect x={x - 3} y="57" width="6" height="6" transform={`rotate(45 ${x} 60)`} fill={c} filter="url(#ev-glow)" />
          <text x={x} y="72" fill={c} fontSize="5.4" letterSpacing="0.6" textAnchor="middle" fontFamily={MONO}>{l}</text>
        </g>
      ))}

      {/* the sigil: hex eye, equalizer iris, blinks */}
      <polygon points={HEX(42)} fill="#05070a" />
      <g clipPath="url(#ev-hex)">
        <rect className="ev-scan" x="20" y="104" width="100" height="2" fill={GR} style={{ ['--scan-d' as string]: '84px' }} />
      </g>
      <polygon points={HEX(42)} fill="none" stroke="url(#ev-hexgrad)" strokeWidth="1.8" filter="url(#ev-glow)" />
      <g className="spin-orbit" style={{ transformOrigin: `${EYE.x}px ${EYE.y}px` }}>
        <circle cx={EYE.x} cy={EYE.y - 49} r="2.2" fill={GR} filter="url(#ev-glow)" />
      </g>
      <g className="ev-lid" style={{ transformOrigin: `${EYE.x}px ${EYE.y}px` }}>
        <g clipPath="url(#ev-almond)">
          {Array.from({ length: 30 }, (_, i) => (
            <g key={i} transform={`rotate(${i * 12} ${EYE.x} ${EYE.y})`}>
              <rect className="ev-eq" x={EYE.x - 0.9} y={EYE.y - 8 - 14} width="1.8" height="14" rx="0.9" fill="url(#ev-hexgrad)"
                style={{ animationDelay: `${-((i * 7) % 11) / 10}s`, animationDuration: `${0.6 + (i % 5) * 0.14}s` }} />
            </g>
          ))}
        </g>
        <path d={ALMOND} fill="none" stroke="url(#ev-hexgrad)" strokeWidth="1.5" />
        <circle cx={EYE.x} cy={EYE.y} r="6.5" fill="#05070a" stroke={GR} strokeOpacity="0.8" />
        <circle className="ev-pupil" cx={EYE.x} cy={EYE.y} r="2.6" fill={GR} />
      </g>

      {/* live diarized transcript */}
      <polygon points={plate(124, 82, 186, 84)} fill="#0b0f14" fillOpacity="0.9" stroke={CY} strokeOpacity="0.35" />
      <text x="132" y="94" fill={CY} fillOpacity="0.75" fontSize="5.6" letterSpacing="1.2" fontFamily={MONO}>LIVE TRANSCRIPT · DIARIZED · HI ↔ EN</text>
      {LINES.map(([s, text, c], k) => (
        <motion.g key={k} {...seq(0.02 + k * 0.15)}>
          <rect x="132" y={101 + k * 17} width="15" height="10" rx="3" fill={c} fillOpacity="0.18" stroke={c} strokeOpacity="0.7" />
          <text x="139.5" y={108 + k * 17} fill={c} fontSize="5.8" fontWeight="600" textAnchor="middle" fontFamily={MONO}>{s}</text>
          <text x="152" y={108.5 + k * 17} fill="#e6edf3" fontSize="6.4" fontFamily={MONO}>{text}</text>
        </motion.g>
      ))}
      <motion.text x="132" y="160" fill={GR} fontSize="6" fontFamily={MONO} {...seq(0.82)}>✓ prompt copied → Claude Code</motion.text>

      {/* what the brain produces */}
      <text x="124" y="184" fill="#e6edf3" fillOpacity="0.6" fontSize="5.6" letterSpacing="1.2" fontFamily={MONO}>BRAIN → GROQ · GEMINI · OPENAI</text>
      {OUTPUTS.map((o, i) => (
        <motion.g key={o} {...seq(0.45 + i * 0.09, 7, 0.28)}>
          <polygon points={plate(124 + (i % 2) * 94, 192 + Math.floor(i / 2) * 19, 88, 14, 4)} fill="#05070a" stroke="url(#ev-grad)" />
          <text x={168 + (i % 2) * 94} y={201.5 + Math.floor(i / 2) * 19} fill="#e6edf3" fontSize="6" textAnchor="middle" fontFamily={MONO}>✓ {o}</text>
        </motion.g>
      ))}
      <text x="14" y="206" fill={CY} fillOpacity="0.8" fontSize="5.6" fontFamily={MONO}>nova-3 · multi</text>
      <text x="14" y="216" fill={GR} fillOpacity="0.8" fontSize="5.6" fontFamily={MONO}>2h+ meetings</text>
      <text x="14" y="226" fill={PU} fillOpacity="0.85" fontSize="5.6" fontFamily={MONO}>100% local</text>
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
      <motion.path d={PRICE} fill="none" stroke={AU} strokeWidth="2" filter="url(#au-glow)"
        initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }} transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.7, 1] }} />
      <text x="22" y="36" fill={AU} fontSize="7" fontFamily={MONO}>24K GOLD · ₹ per gram</text>
      <motion.text x="300" y="36" fill={ROSE} fontSize="7" fontWeight="600" textAnchor="end" fontFamily={MONO}
        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.6, repeat: Infinity }}>▲ LIVE</motion.text>

      {/* the conversation */}
      <polygon points={plate(12, 146, 178, 84)} fill="#120d02" fillOpacity="0.9" stroke={AU} strokeOpacity="0.35" />
      <motion.g {...seq(0.02)}>
        <rect x="70" y="154" width="112" height="16" rx="8" fill={AU} fillOpacity="0.16" stroke={AU} strokeOpacity="0.6" />
        <text x="126" y="164.5" fill="#fef3c7" fontSize="6" textAnchor="middle" fontFamily={MONO}>I want to invest ₹5000 in gold</text>
      </motion.g>
      <motion.g {...seq(0.22)}>
        <rect x="20" y="176" width="130" height="16" rx="8" fill="#fff" fillOpacity="0.06" stroke="#fff" strokeOpacity="0.25" />
        <text x="85" y="186.5" fill="#f5f5f4" fontSize="6" textAnchor="middle" fontFamily={MONO}>Today's 24K rate is live. Buy now?</text>
      </motion.g>
      <motion.g {...seq(0.42)}>
        <rect x="20" y="200" width="92" height="14" rx="4" fill={ROSE} fillOpacity="0.15" stroke={ROSE} />
        <text x="66" y="209.5" fill="#fecdd3" fontSize="6" textAnchor="middle" fontFamily={MONO}>wants_to_buy: true</text>
      </motion.g>

      {/* the price engine */}
      <polygon points={plate(198, 146, 110, 84)} fill="#120d02" fillOpacity="0.9" stroke={AU} strokeOpacity="0.35" />
      <text x="206" y="158" fill={AU} fillOpacity="0.75" fontSize="5.6" letterSpacing="1.2" fontFamily={MONO}>PRICE ENGINE</text>
      {['spot  USD / oz', '× FX  USD → INR', '+ duty + GST', '= ₹ per gram'].map((l, i) => (
        <motion.text key={l} x="206" y={172 + i * 14} fill={i === 3 ? AU : '#fef3c7'} fontSize="6.4" fontWeight={i === 3 ? 700 : 400} fontFamily={MONO}
          {...seq(0.5 + i * 0.1, 7, 0.3)}>{l}</motion.text>
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
      {kind === 'radar' && <div className="rd-cone" style={{ left: `${((RS.x - RS.r) / 320) * 100}%`, top: `${((RS.y - RS.r) / 240) * 100}%`, width: `${(RS.r * 2 / 320) * 100}%`, height: `${(RS.r * 2 / 240) * 100}%` }} />}
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

function Glyph({ kind, tint }: { kind: Visual; tint: string }) {
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
        <g className="gl-blink">
          <path d="M2.8 12 Q12 3.8 21.2 12 Q12 20.2 2.8 12 Z" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="3.6" fill="#fff" stroke="none" />
          <circle className="gl-look" cx="12" cy="12" r="1.6" fill={tint} stroke="none" />
        </g>
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
          <Glyph kind={kind} tint={m.to} />
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
