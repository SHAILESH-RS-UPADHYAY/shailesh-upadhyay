import { useEffect, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion'

/*
  Intro — a "neural boot" sequence, ~3.4s, skippable.
  1. A small neural net draws itself; data packets start flowing between layers.
  2. A greeting decodes in the four scripts the hero name cycles through.
  3. "Hi, Welcome" assembles letter by letter, flying in from the network.
  4. The whole scene zooms out and the page's blackhole reveal takes over.
*/

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
const PACKETS = EDGES.filter((_, i) => i % 7 === 3)
// Deterministic "random" start offsets for the flying letters.
const rand = (i: number, s: number) => Math.sin(i * 12.9898 + s * 78.233) * 43758.5453 % 1

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
      {/* backdrop: grid + center glow + scanlines */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
      }} />
      <motion.div className="absolute left-1/2 top-1/2 w-[70vmin] h-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.18), rgba(167,139,250,0.08) 50%, transparent 70%)' }}
        animate={{ scale: [0.8, 1.1, 0.95] }} transition={{ duration: 3, ease: 'easeInOut' }} />

      {/* neural network */}
      <motion.svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden
        animate={{ opacity: phase === 'boot' ? 0.9 : 0.3, scale: phase === 'boot' ? 1 : 1.08 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
        {EDGES.map(([a, b], i) => (
          <motion.line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={COLORS[a.li]} strokeWidth={0.8}
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.28 }}
            transition={{ duration: 0.45, delay: 0.1 + a.li * 0.2 + (i % 6) * 0.02, ease: 'easeOut' }} />
        ))}
        {PACKETS.map(([a, b], i) => (
          <motion.circle key={i} r={2.6} fill="#fff" cx={0} cy={0} initial={{ x: a.x, y: a.y, opacity: 0 }}
            animate={{ x: [a.x, b.x], y: [a.y, b.y], opacity: [0, 1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.5, delay: 0.7 + (i % 8) * 0.12, ease: 'easeInOut' }} />
        ))}
        {NODES.map((n, i) => (
          <g key={i}>
            <motion.circle cx={n.x} cy={n.y} r={13} fill="none" stroke={COLORS[n.li]} strokeOpacity={0.5}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.4, 1], opacity: [0, 0.8, 0.25] }}
              transition={{ duration: 0.7, delay: n.li * 0.2 + 0.1 }} style={{ transformOrigin: `${n.x}px ${n.y}px` }} />
            <motion.circle cx={n.x} cy={n.y} r={5} fill={COLORS[n.li]}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 12, delay: n.li * 0.2 }}
              style={{ transformOrigin: `${n.x}px ${n.y}px`, filter: `drop-shadow(0 0 6px ${COLORS[n.li]})` }} />
          </g>
        ))}
      </motion.svg>

      {/* HUD frame */}
      <div className="absolute inset-0 p-5 md:p-8 font-geist-mono text-[10px] md:text-xs tracking-widest pointer-events-none">
        <motion.div className="absolute top-5 left-5 md:top-8 md:left-8 text-white/55" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          SHAILESH.OS <span className="text-emerald-400">//</span> BOOT
        </motion.div>
        <motion.div className="absolute top-5 right-5 md:top-8 md:right-8 text-white/40" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }} transition={{ delay: 0.4, duration: 1 }}>
          CLICK OR PRESS ANY KEY TO SKIP
        </motion.div>
        <ul className="absolute bottom-5 left-5 md:bottom-8 md:left-8 space-y-1 normal-case tracking-normal">
          {BOOT.slice(0, log).map((l) => (
            <motion.li key={l} className="text-white/55" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              <span className="text-emerald-400">[ OK ]</span> {l}
            </motion.li>
          ))}
        </ul>
        <div className="absolute bottom-5 right-5 md:bottom-8 md:right-8 flex flex-col items-end gap-2">
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
            <motion.div key="welcome" className="relative flex flex-col items-center gap-6 px-8 py-6 md:px-14 md:py-10"
              initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* corner brackets close in around the words */}
              {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((c, i) => (
                <motion.span key={c} className={`absolute w-6 h-6 md:w-8 md:h-8 ${c}`} style={{ borderColor: COLORS[i] }}
                  initial={{ opacity: 0, x: i % 2 ? 40 : -40, y: i < 2 ? -30 : 30 }} animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} />
              ))}
              <div className="relative text-5xl sm:text-6xl md:text-8xl font-oxanium font-bold tracking-wider whitespace-nowrap">
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
              <motion.div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }} />
              <motion.p className="font-geist-mono text-sm tracking-wider text-white/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
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
