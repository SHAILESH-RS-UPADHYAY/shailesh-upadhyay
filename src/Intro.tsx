import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion'
import NetWorker from './introNet.worker?worker&inline'

/*
  Intro: a "neural boot", about four seconds, skippable.
  1. Neurons on a ring join up thread by thread and the threads settle around a dark centre (introNet.ts). A greeting
     decodes inside it, in the four scripts the hero name cycles through, and each one sends a ripple through the threads.
  2. The centre widens and "Hi, Welcome" assembles inside it, letter by letter, flying in from the network.
  3. The centre opens all the way and the page is behind it, already running its own reveal.
*/

// The site's heading gradient (--grad), read as a ramp, so these letters lead straight into the hero's name.
const RAMP = [[0, 52, 211, 153], [0.3, 52, 211, 153], [1, 255, 255, 255]] as const
const rampAt = (x: number) => {
  const k = RAMP.findIndex((s) => s[0] >= x)
  const [a, b] = k <= 0 ? [RAMP[0], RAMP[0]] : [RAMP[k - 1], RAMP[k]]
  const f = b[0] === a[0] ? 0 : (x - a[0]) / (b[0] - a[0])
  return `rgb(${[1, 2, 3].map((c) => Math.round(a[c] + (b[c] - a[c]) * f)).join(',')})`
}
const GREETING_MS = 500
const WELCOME_MS = 2150
const PAGE_MS = 3400
const OPEN_MS = 3750
const OPENING_MS = 640
const GREETINGS = ['Hello', 'नमस्ते', 'こんにちは', '안녕하세요']
const GLYPHS = 'アカサタナハマヤラワ01<>/{}#$%&*+='
const WELCOME = 'Hi, Welcome'
const BOOT = [
  'mounting /home/shailesh',
  'llm router online · claude gemini groq',
  'warming vector index · 1024-d',
  'async workers ×8 ready',
  // 'tensorrt engine · <15ms', // hidden with FAR Labs
  'all systems nominal',
]

// Deterministic "random" in (-1, 1) for the letters' starting points.
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

// onOpen mounts the page behind the closed ring, onDone removes this layer once the page is fully showing.
export default function Intro({ onOpen, onDone }: { onOpen: () => void; onDone: () => void }) {
  const [phase, setPhase] = useState<'boot' | 'welcome' | 'exit'>('boot')
  const [g, setG] = useState(0)
  const [log, setLog] = useState(0)
  const [hole, setHole] = useState(false)
  const host = useRef<HTMLDivElement>(null)
  const pct = useMotionValue(0)
  const pctText = useTransform(pct, (v) => `${String(Math.round(v)).padStart(3, '0')}%`)

  useEffect(() => {
    // A fresh canvas per run: once a canvas is handed to a worker it can't be taken back.
    const canvas = document.createElement('canvas')
    canvas.className = 'absolute inset-0 w-full h-full'
    host.current?.append(canvas)
    const size = () => ({ w: innerWidth, h: innerHeight, dpr: devicePixelRatio })
    // Without a worker canvas or WebGL2 the words still play on a plain dark background.
    let drawing = 'transferControlToOffscreen' in canvas
    const worker = drawing ? new NetWorker() : null
    if (worker) {
      const offscreen = canvas.transferControlToOffscreen()
      worker.onmessage = () => { drawing = false }
      worker.postMessage({ canvas: offscreen, ...size() }, [offscreen])
    }
    const onResize = () => worker?.postMessage({ type: 'resize', ...size() })
    const onLook = (e: PointerEvent) => worker?.postMessage({ type: 'look', x: e.clientX / innerWidth - 0.5, y: e.clientY / innerHeight - 0.5 })
    addEventListener('resize', onResize)
    addEventListener('pointermove', onLook, { passive: true })
    const timers = [
      ...GREETINGS.map((_, i) => setTimeout(() => { setG(i); worker?.postMessage({ type: 'ripple' }) }, i * GREETING_MS)),
      ...BOOT.map((_, i) => setTimeout(() => setLog(i + 1), 150 + i * 300)),
      setTimeout(() => { setPhase('welcome'); worker?.postMessage({ type: 'welcome' }) }, WELCOME_MS),
      // The page mounts behind the closed circle. That's heavy work, and it can't touch the network in its worker.
      setTimeout(() => flushSync(onOpen), PAGE_MS),
      setTimeout(() => {
        const open = () => {
          setPhase('exit')
          setHole(drawing)
          worker?.postMessage({ type: 'open' })
          timers.push(setTimeout(onDone, drawing ? OPENING_MS : 450))
        }
        // Two frames, so the page has painted before anyone can see it.
        requestAnimationFrame(() => requestAnimationFrame(open))
      }, OPEN_MS),
    ]
    const counter = animate(pct, 100, { duration: OPEN_MS / 1000, ease: [0.3, 0, 0.2, 1] })
    const skip = () => { flushSync(onOpen); onDone() }
    addEventListener('keydown', skip)
    addEventListener('pointerdown', skip)
    return () => {
      timers.forEach(clearTimeout)
      counter.stop()
      worker?.terminate()
      canvas.remove()
      removeEventListener('resize', onResize)
      removeEventListener('pointermove', onLook)
      removeEventListener('keydown', skip)
      removeEventListener('pointerdown', skip)
    }
  }, [onOpen, onDone, pct])

  return (
    <motion.div className={`fixed inset-0 z-[70] text-white overflow-hidden select-none ${hole ? 'pointer-events-none' : 'bg-[#040605] cursor-pointer'}`} role="status" aria-label="Loading portfolio"
      animate={{ opacity: phase === 'exit' && !hole ? 0 : 1 }} transition={{ duration: 0.45, ease: 'easeIn' }}>
      <div ref={host} aria-hidden className="absolute inset-0" />

      {/* HUD frame */}
      <motion.div animate={{ opacity: phase === 'exit' ? 0 : 1 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
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
                height: '4px', backgroundColor: '#34d399', animation: 'loadingBar 1s ease-in-out infinite', animationDelay: `${i * 0.04}s`,
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
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.12 }}>
              <Scramble text={GREETINGS[g]} />
            </motion.p>
          ) : (
            <motion.div key="welcome" className="relative flex flex-col items-center gap-6 px-5 py-6 sm:px-8 md:px-14 md:py-10 [perspective:900px]"
              initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="relative text-[clamp(2rem,8.5vw,5rem)] font-oxanium font-bold tracking-wide sm:tracking-wider whitespace-nowrap">
                {WELCOME.split('').map((ch, i) => (
                  <motion.span key={i} className="inline-block"
                    initial={{ opacity: 0, x: rand(i, 1) * 600, y: rand(i, 2) * 320, rotate: rand(i, 3) * 180, scale: 0.2 }}
                    animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 110, damping: 13, delay: i * 0.04 }}
                    style={{
                      background: `linear-gradient(135deg, ${rampAt(i / WELCOME.length)}, ${rampAt((i + 1) / WELCOME.length)})`,
                      WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                    }}>
                    {ch === ' ' ? ' ' : ch}
                  </motion.span>
                ))}
                {/* light sweep once the letters land */}
                <motion.span aria-hidden className="absolute inset-y-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent mix-blend-overlay"
                  initial={{ left: '-30%', opacity: 0 }} animate={{ left: '120%', opacity: [0, 1, 1, 0] }} transition={{ duration: 0.8, delay: 0.85, ease: 'easeInOut' }} />
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
      </motion.div>
    </motion.div>
  )
}
