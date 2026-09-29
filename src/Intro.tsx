import { useEffect, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion'

/*
  Intro — a "neural boot" sequence, ~3.4s, skippable.
  1. A neural net flies in (3D camera), each connection reaching from neuron to neuron with a spark at its tip;
     a synapse flares as it lands. Then thought-waves sweep the layers and packets race along the edges.
     Behind it: a far constellation layer and drifting bokeh for depth. Continuous motion is CSS (index.css, "intro").
  2. A greeting decodes in the four scripts the hero name cycles through.
  3. "Hi, Welcome" assembles letter by letter, flying in from the network.
  4. The whole scene zooms out and the page's blackhole reveal takes over.
*/

// Brand palette (same as the site): emerald, cyan, violet, rose, amber. Each neuron gets its own.
const COLORS = ['#34d399', '#22d3ee', '#a78bfa', '#fb7185', '#f59e0b']
const GREETINGS = ['Hello', 'नमस्ते', 'こんにちは', '안녕하세요']
const GLYPHS = 'アカサタナハマヤラワ01<>/{}#$%&*+='
const WELCOME = 'Hi, Welcome'
const BOOT = [
  'mounting /home/shailesh',
  'llm router online · claude gemini groq',
  'warming vector index · 1024-d',
  'async workers ×8 ready',
  'tensorrt engine · <15ms',
  'all systems nominal',
]

const W = 1000
const H = 560
const LAYERS = [3, 5, 6, 5, 3]
const NODES = LAYERS.flatMap((n, li) =>
  Array.from({ length: n }, (_, k) => ({ x: 110 + li * ((W - 220) / (LAYERS.length - 1)), y: H / 2 + (k - (n - 1) / 2) * 78, li })),
)
const EDGES = NODES.flatMap((a) => NODES.filter((b) => b.li === a.li + 1).map((b) => [a, b] as const))
const PACKETS = EDGES.filter((_, i) => i % 3 === 1)
// Deterministic "random" in (-1, 1): letter offsets, star field, bokeh.
const rand = (i: number, s: number) => Math.sin(i * 12.9898 + s * 78.233) * 43758.5453 % 1
const abs = (i: number, s: number) => Math.abs(rand(i, s))
const NODE_COLOR = NODES.map((_, i) => COLORS[Math.floor(abs(i, 20) * 5) % 5])
const nodeIndex = new Map(NODES.map((n, i) => [n, i]))
// Neurons appear at random in the first 0.3s; connections then join in random order over ~0.9s.
const NODE_POP = NODES.map((_, i) => abs(i, 22) * 0.3)
const EDGE_AT = EDGES.map(([a], i) => Math.max(NODE_POP[nodeIndex.get(a)!] + 0.05, 0.18 + abs(i, 21) * 0.85))
const LAND = 0.32 // a connection takes this long to reach its target
// A neuron flares the moment its first connection lands (input neurons: when they first send).
const NODE_FLARE = NODES.map((n, ni) => {
  const lands = EDGES.flatMap(([a, b], i) => (b === n ? [EDGE_AT[i] + LAND] : a === n ? [EDGE_AT[i]] : []))
  return Math.min(...lands, NODE_POP[ni] + 0.3)
})
// After that, synapses and neurons keep firing at random, like a live brain.
const FIRE_AT = (i: number, s: number) => 1.15 + abs(i, s) * 1.6
const FIRE_FOR = (i: number, s: number) => 1.1 + abs(i, s + 1) * 1.0
// Far layer: a faint constellation, each star joined to its two nearest neighbours.
const STARS = Array.from({ length: 46 }, (_, i) => ({ x: (rand(i, 5) * 0.5 + 0.5) * W, y: (rand(i, 6) * 0.5 + 0.5) * H }))
const STAR_LINKS = STARS.flatMap((a, i) =>
  STARS.map((b, j) => [j, (a.x - b.x) ** 2 + (a.y - b.y) ** 2] as const).filter(([j]) => j > i).sort((p, q) => p[1] - q[1]).slice(0, 2).map(([j]) => [a, STARS[j]] as const),
)
const BOKEH = Array.from({ length: 22 }, (_, i) => ({
  left: `${(rand(i, 7) * 0.5 + 0.5) * 100}%`, top: `${(rand(i, 8) * 0.5 + 0.5) * 100}%`,
  size: 4 + Math.abs(rand(i, 9)) * 14, color: COLORS[i % 5], dur: 7 + Math.abs(rand(i, 10)) * 6, delay: -Math.abs(rand(i, 11)) * 8,
}))

function Scramble({ text }: { text: string }) {
  const [out, setOut] = useState('')
  useEffect(() => {
    const chars = [...text]
    let step = 0
    const id = setInterval(() => {
      step++
      const done = Math.min(chars.length, Math.floor(step / 2))
      setOut(chars.slice(0, done).join('') + chars.slice(done).map(() => GLYPHS[(Math.random() * GLYPHS.length) | 0]).join(''))
      if (done === chars.length) clearInterval(id)
    }, 28)
    return () => clearInterval(id)
  }, [text])
  return <>{out}</>
}

export default function Intro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'boot' | 'welcome' | 'exit'>('boot')
  const [g, setG] = useState(0)
  const [log, setLog] = useState(0)
  const pct = useMotionValue(0)
  const pctText = useTransform(pct, (v) => `${String(Math.round(v)).padStart(3, '0')}%`)

  useEffect(() => {
    const timers = [
      ...GREETINGS.map((_, i) => setTimeout(() => setG(i), i * 340)),
      ...BOOT.map((_, i) => setTimeout(() => setLog(i + 1), 150 + i * 240)),
      setTimeout(() => setPhase('welcome'), 1450),
      setTimeout(() => setPhase('exit'), 3000),
      setTimeout(onDone, 3450),
    ]
    const counter = animate(pct, 100, { duration: 2.9, ease: [0.3, 0, 0.2, 1] })
    const skip = () => onDone()
    addEventListener('keydown', skip)
    addEventListener('pointerdown', skip)
    return () => {
      timers.forEach(clearTimeout)
      counter.stop()
      removeEventListener('keydown', skip)
      removeEventListener('pointerdown', skip)
    }
  }, [onDone, pct])

  return (
    <motion.div className="fixed inset-0 z-[70] bg-black text-white overflow-hidden select-none cursor-pointer" role="status" aria-label="Loading portfolio"
      animate={phase === 'exit' ? { opacity: 0, scale: 1.15 } : { opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: 'easeIn' }}>
      {/* deep-space backdrop: nebula glows + grid */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 55%, #06100c 0%, #020403 55%, #000 100%)' }} />
      <div className="intro-nebula absolute left-1/2 top-1/2 w-[95vmax] h-[95vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
        style={{ background: 'conic-gradient(from 0deg, rgba(52,211,153,0.16), rgba(34,211,238,0.1), rgba(167,139,250,0.12), rgba(251,113,133,0.08), rgba(52,211,153,0.16))' }} />
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
      }} />

      {/* far layer: constellation, drifting slower than the net (parallax depth) */}
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="intro-far absolute inset-0 w-full h-full" aria-hidden>
        {STAR_LINKS.map(([a, b], i) => <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#a7f3d0" strokeOpacity={0.1} strokeWidth={0.6} />)}
        {STARS.map((p, i) => <circle key={i} className="intro-twinkle" cx={p.x} cy={p.y} r={1 + (i % 3) * 0.5} fill={i % 4 ? '#e6fff4' : '#34d399'} style={{ animationDelay: `${-(i % 7) * 0.4}s` }} />)}
      </svg>
      {BOKEH.map((b, i) => (
        <span key={i} aria-hidden className="intro-bokeh absolute rounded-full" style={{
          left: b.left, top: b.top, width: b.size, height: b.size, background: b.color, boxShadow: `0 0 ${b.size * 2}px ${b.color}`,
          animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`,
        }} />
      ))}

      {/* the neural network, flown in by a 3D camera */}
      <div className="absolute inset-0 [perspective:1100px]">
        <motion.div className="absolute inset-0"
          initial={{ rotateX: 22, rotateY: -16, scale: 1.18, opacity: 0 }}
          animate={phase === 'boot' ? { rotateX: 5, rotateY: 5, scale: 1, opacity: 1 } : { rotateX: 0, rotateY: 0, scale: 1.08, opacity: 0.32 }}
          transition={{ duration: phase === 'boot' ? 1.5 : 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden>
            <defs>
              {EDGES.map(([a, b], i) => (
                <linearGradient key={i} id={`syn-${i}`} gradientUnits="userSpaceOnUse" x1={a.x} y1={a.y} x2={b.x} y2={b.y}>
                  <stop offset="0" stopColor={NODE_COLOR[nodeIndex.get(a)!]} /><stop offset="1" stopColor={NODE_COLOR[nodeIndex.get(b)!]} />
                </linearGradient>
              ))}
              {COLORS.map((c, li) => (
                <radialGradient key={li} id={`pearl-${li}`} cx="0.35" cy="0.3" r="0.8">
                  <stop offset="0" stopColor="#ffffff" /><stop offset="0.45" stopColor={c} /><stop offset="1" stopColor={c} stopOpacity="0.6" />
                </radialGradient>
              ))}
            </defs>
            {/* connections join in random order: each draws from one neuron to another, a spark riding its tip */}
            {EDGES.map(([a, b], i) => (
              <line key={i} className="syn-edge" x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={`url(#syn-${i})`} strokeWidth={1.1} pathLength={1}
                style={{ animationDelay: `${EDGE_AT[i]}s` }} />
            ))}
            {EDGES.map(([a, b], i) => (
              <circle key={i} className="syn-spark" cx={a.x} cy={a.y} r={2.3} fill="#fff"
                style={{ ['--dx' as string]: `${b.x - a.x}px`, ['--dy' as string]: `${b.y - a.y}px`, animationDelay: `${EDGE_AT[i]}s`, filter: `drop-shadow(0 0 4px ${NODE_COLOR[nodeIndex.get(b)!]})` }} />
            ))}
            {/* then synapses fire at random */}
            {EDGES.map(([a, b], i) => (
              <line key={i} className="syn-wave" x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={`url(#syn-${i})`} strokeWidth={1.8}
                style={{ animationDelay: `${FIRE_AT(i, 23)}s`, animationDuration: `${FIRE_FOR(i, 23)}s` }} />
            ))}
            {PACKETS.map(([a, b], i) => (
              <g key={i} className="syn-packet" style={{ ['--dx' as string]: `${b.x - a.x}px`, ['--dy' as string]: `${b.y - a.y}px`, animationDelay: `${1 + abs(i, 25) * 0.8}s`, animationDuration: `${0.4 + abs(i, 26) * 0.3}s` }}>
                <circle cx={a.x} cy={a.y} r={5} fill={NODE_COLOR[nodeIndex.get(b)!]} opacity={0.4} />
                <circle cx={a.x} cy={a.y} r={2} fill="#fff" />
              </g>
            ))}
            {/* neurons: pearl core, halo that flares when a connection lands, orbit ring, fires with the wave */}
            {NODES.map((n, i) => (
              <g key={i} className="syn-node" style={{ animationDelay: `${NODE_POP[i]}s` }}>
                <circle className="syn-orbit" cx={n.x} cy={n.y} r={17} fill="none" stroke="#ffffff" strokeOpacity={0.28} strokeWidth={0.8} strokeDasharray="2 5"
                  style={{ animationDuration: `${5 + (i % 3)}s` }} />
                <circle className="syn-flare" cx={n.x} cy={n.y} r={11} fill="none" stroke={NODE_COLOR[i]} strokeWidth={1.5}
                  style={{ animationDelay: `${NODE_FLARE[i]}s` }} />
                <circle className="syn-fire" cx={n.x} cy={n.y} r={10} fill={NODE_COLOR[i]}
                  style={{ animationDelay: `${FIRE_AT(i, 27)}s`, animationDuration: `${FIRE_FOR(i, 27)}s` }} />
                <circle cx={n.x} cy={n.y} r={5.8} fill={`url(#pearl-${COLORS.indexOf(NODE_COLOR[i])})`} style={{ filter: `drop-shadow(0 0 8px ${NODE_COLOR[i]})` }} />
              </g>
            ))}
          </svg>
        </motion.div>
      </div>

      {/* HUD frame */}
      <div className="absolute inset-0 p-5 md:p-8 font-geist-mono text-[0.625rem] md:text-xs tracking-widest pointer-events-none">
        <motion.div className="absolute top-5 left-5 md:top-8 md:left-8 text-white/55" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          SHAILESH.OS <span className="text-emerald-400">//</span> BOOT
        </motion.div>
        <motion.div className="absolute top-5 right-5 md:top-8 md:right-8 text-white/40" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }} transition={{ delay: 0.4, duration: 1 }}>
          <span className="sm:hidden">TAP TO SKIP</span><span className="hidden sm:inline">CLICK OR PRESS ANY KEY TO SKIP</span>
        </motion.div>
        <ul className="absolute bottom-5 left-5 right-5 md:bottom-8 md:left-8 md:right-auto space-y-1 normal-case tracking-normal">
          {BOOT.slice(0, log).map((l) => (
            <motion.li key={l} className="text-white/55 truncate" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              <span className="text-emerald-400">[ OK ]</span> {l}
            </motion.li>
          ))}
        </ul>
        <div className="absolute top-12 right-5 sm:top-auto sm:bottom-8 md:right-8 flex flex-col items-end gap-2">
          <div className="flex items-end gap-[2px] h-8">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="w-[2px] rounded-full" style={{
                height: '4px', backgroundColor: COLORS[i % 5], animation: 'loadingBar 1s ease-in-out infinite', animationDelay: `${i * 0.04}s`,
              }} />
            ))}
          </div>
          <motion.span className="font-geist-mono text-2xl md:text-4xl text-white/85 tabular-nums">{pctText}</motion.span>
        </div>
      </div>

      {/* center stage */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {phase === 'boot' ? (
            <motion.p key={g} className="font-oxanium text-3xl md:text-5xl tracking-[0.15em] text-white/90"
              style={{ textShadow: '0 0 24px rgba(52,211,153,0.5)' }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.12 }}>
              <Scramble text={GREETINGS[g]} />
            </motion.p>
          ) : (
            <motion.div key="welcome" className="relative flex flex-col items-center gap-6 px-5 py-6 sm:px-8 md:px-14 md:py-10 [perspective:900px]"
              initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* spatial glass panel: frosted, rim-lit, tilts up into place */}
              <motion.div aria-hidden className="absolute -inset-x-2 -inset-y-1 sm:-inset-x-6 md:-inset-x-10 md:-inset-y-4 rounded-[2rem] border border-white/15 bg-white/[0.05] backdrop-blur-2xl"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -20px 40px rgba(52,211,153,0.06), 0 40px 120px -30px rgba(52,211,153,0.4), 0 0 0 1px rgba(52,211,153,0.08)' }}
                initial={{ opacity: 0, rotateX: 28, y: 40, scale: 0.9 }} animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                <span className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                <span className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/[0.10] to-transparent" style={{ maskImage: 'linear-gradient(to bottom, black, transparent 45%)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 45%)' }} />
              </motion.div>
              {/* corner brackets close in around the words */}
              {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((c, i) => (
                <motion.span key={c} className={`absolute w-6 h-6 md:w-8 md:h-8 ${c}`} style={{ borderColor: COLORS[i] }}
                  initial={{ opacity: 0, x: i % 2 ? 40 : -40, y: i < 2 ? -30 : 30 }} animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} />
              ))}
              <div className="relative text-[clamp(2rem,10.5vw,6rem)] font-oxanium font-bold tracking-wide sm:tracking-wider whitespace-nowrap" style={{ filter: 'drop-shadow(0 0 22px rgba(52,211,153,0.3))' }}>
                {WELCOME.split('').map((ch, i) => (
                  <motion.span key={i} className="inline-block"
                    initial={{ opacity: 0, x: rand(i, 1) * 600, y: rand(i, 2) * 320, rotate: rand(i, 3) * 180, scale: 0.2 }}
                    animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 110, damping: 13, delay: i * 0.04 }}
                    style={{
                      background: `linear-gradient(135deg, ${COLORS[i % 5]}, ${COLORS[(i + 1) % 5]})`,
                      WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                    }}>
                    {ch === ' ' ? ' ' : ch}
                  </motion.span>
                ))}
                {/* light sweep once the letters land */}
                <motion.span aria-hidden className="absolute inset-y-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent mix-blend-overlay"
                  initial={{ left: '-30%' }} animate={{ left: '120%' }} transition={{ duration: 0.8, delay: 0.85, ease: 'easeInOut' }} />
              </div>
              <motion.div className="relative h-px w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }} />
              <motion.p className="relative font-geist-mono text-sm tracking-wider text-white/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <span className="text-emerald-400">&gt;</span> initializing portfolio<span className="text-emerald-400 animate-pulse">█</span>
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="absolute inset-0 scanlines opacity-60" />
    </motion.div>
  )
}
