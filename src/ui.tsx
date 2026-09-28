import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, animate, inView as onInView, motion, useReducedMotion } from 'framer-motion'
import { accentHex, type Accent, type Visual } from './data'
import { acVar, asset, EASE, useReveal } from './lib'

export function SectionHeader({ n, label, title }: { n: string; label: string; title: ReactNode }) {
  return (
    <div className="mb-14 md:mb-20">
      <div className="flex items-center gap-5 mb-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-acc/25 to-transparent" />
        <span className="font-geist-mono text-sm md:text-base text-acc/70 tracking-[0.25em] whitespace-nowrap">
          {n} / {label}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-acc/25 to-transparent" />
      </div>
      <motion.h2
        className="font-museo text-center text-[2.4rem] md:text-[3.6rem] lg:text-[4.4rem] leading-[1] tracking-tight text-fg/90 text-balance"
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: EASE }}>
        {title}
      </motion.h2>
    </div>
  )
}

export function Chips({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((s) => (
        <li key={s} className="font-geist-mono text-[11px] md:text-xs text-fg/70 px-2.5 py-1 rounded-md border border-fg/10 bg-fg/[0.03]">
          {s}
        </li>
      ))}
    </ul>
  )
}

export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-geist-mono text-xs tracking-wider text-(--ac) px-3 py-1.5 rounded-lg border border-(--ac)/30 bg-(--ac)/5 hover:bg-(--ac)/15 active:scale-[0.97] transition-all">
      {children} <span aria-hidden>↗</span>
    </a>
  )
}

/* ====== TERMINAL — each box glitches, then types itself out whenever it scrolls into view ====== */
function lineClass(l: string) {
  if (l.startsWith('$ ')) return 'text-(--ac)'
  if (l.startsWith('# ')) return 'text-(--ac)/75'
  if (l.startsWith('→ ')) return 'text-white/85 pl-[2ch] -indent-[2ch]'
  if (l.startsWith('  ')) return 'text-white/55 pl-[calc(1rem+2ch)] -indent-[2ch]' // hanging indent for wrapped detail lines
  return 'text-white/65'
}

const CHARS_PER_TICK = 2
const TICK_MS = 26

export function Terminal({ lines, file, accent, className = '' }: {
  lines: string[]; file: string; accent: Accent; className?: string
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const running = useRef(false)
  const starts = useMemo(() => {
    const s = [0]
    for (let i = 1; i < lines.length; i++) s.push(s[i - 1] + lines[i - 1].length + 1)
    return s
  }, [lines])
  const total = starts[starts.length - 1] + lines[lines.length - 1].length
  const [phase, setPhase] = useState<'idle' | 'glitch' | 'typing'>('idle')
  const [n, setN] = useState(0)
  const started = phase === 'typing'
  const done = started && n >= total

  // Start when 30% of the box is on screen; reset once it has fully left, so it replays on every visit.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let t = 0
    const keepWatching = () => {} // returning a function keeps inView observing; returning nothing makes it one-shot
    const stopEnter = onInView(el, () => {
      if (running.current) return keepWatching
      running.current = true
      if (reduce) { setPhase('typing'); setN(total); return keepWatching }
      setPhase('glitch')
      t = window.setTimeout(() => setPhase('typing'), 650)
      return keepWatching
    }, { amount: 0.3 })
    const stopLeave = onInView(el, () => () => {
      clearTimeout(t)
      running.current = false
      setPhase('idle')
      setN(0)
    })
    return () => { clearTimeout(t); stopEnter(); stopLeave() }
  }, [reduce, total])

  useEffect(() => {
    if (!started || n >= total) return
    const t = setTimeout(() => setN((v) => Math.min(v + CHARS_PER_TICK, total)), TICK_MS)
    return () => clearTimeout(t)
  }, [started, n, total])

  const glitching = phase === 'glitch'
  return (
    <div ref={ref} style={acVar(accent)}
      data-done={done || undefined}
      className={`terminal screen relative rounded-2xl border border-(--ac)/25 bg-[#070a09] overflow-hidden text-left transition-shadow duration-700 ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 font-geist-mono text-xs text-white/45 truncate">{file}</span>
        <span className="ml-auto font-geist-mono text-[10px] tracking-widest text-(--ac)/80">
          {done ? 'READY' : started ? 'STREAMING' : glitching ? 'DECRYPTING' : 'STANDBY'}
        </span>
      </div>
      <div className="relative p-5 md:p-6 font-geist-mono text-[12.5px] md:text-sm leading-relaxed">
        {lines.map((l, i) => {
          const shown = started ? Math.max(0, Math.min(l.length, n - starts[i])) : 0
          const cursorHere = started && !done && n >= starts[i] && n <= starts[i] + l.length
          return (
            <div key={i} className={`whitespace-pre-wrap break-words ${lineClass(l)}`}>
              {l.startsWith('→ ') && shown > 0 ? <><span className="text-(--ac)">→</span>{l.slice(1, shown)}</> : l.slice(0, shown)}
              {cursorHere && <span className="inline-block w-2 h-4 -mb-0.5 bg-(--ac) animate-pulse" />}
              {/* Untyped text stays in the layout (no jumping) and stays readable for screen readers and search engines. */}
              <span className="opacity-0">{l.slice(shown)}</span>
            </div>
          )
        })}
        <AnimatePresence>
          {glitching && (
            <motion.div className="absolute inset-0 flex items-center justify-center bg-black/80"
              initial={{ opacity: 0 }} exit={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.4, 1, 0.6, 1], x: [0, -4, 4, -2, 2, 0] }} transition={{ duration: 0.5 }}>
              <span className="font-geist-mono text-(--ac) tracking-widest text-sm">ACCESSING DATA<span className="animate-pulse">█</span></span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ====== COUNT-UP NUMBER ====== */
export function CountUp({ to, dec = 0, prefix = '', suffix = '' }: { to: number; dec?: number; prefix?: string; suffix?: string }) {
  const [ref, inView] = useReveal<HTMLSpanElement>(0.6)
  const reduce = useReducedMotion()
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration: reduce ? 0 : 1.6, ease: EASE, onUpdate: setV })
    return () => c.stop()
  }, [inView, to, reduce])
  return <span ref={ref} className="tabular-nums">{prefix}{v.toFixed(dec)}{suffix}</span>
}

/* ====== MATRIX RAIN — hero backdrop, canvas only, pauses off-screen ====== */
export function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const glyphs = 'アイウエオカキクケコサシスセソ01{}<>/$#=+*ラリルレロ'
    const size = 16
    let drops: number[] = []
    let raf = 0
    let last = 0
    const resize = () => {
      c.width = c.offsetWidth
      c.height = c.offsetHeight
      drops = Array.from({ length: Math.ceil(c.width / size) }, () => Math.random() * -60)
    }
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw)
      if (t - last < 55 || c.getBoundingClientRect().bottom < 0) return
      last = t
      const css = getComputedStyle(c)
      const acc = css.getPropertyValue('--acc')
      const cyan = css.getPropertyValue('--cyan')
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.fillRect(0, 0, c.width, c.height)
      ctx.globalCompositeOperation = 'source-over'
      ctx.font = `${size - 2}px "Geist Mono", monospace`
      drops.forEach((y, i) => {
        ctx.fillStyle = i % 7 === 0 ? cyan : acc
        ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], i * size, y * size)
        drops[i] = y * size > c.height && Math.random() > 0.975 ? 0 : y + 1
      })
    }
    resize()
    addEventListener('resize', resize)
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize) }
  }, [])
  return (
    <canvas ref={ref} aria-hidden className="rain absolute inset-0 w-full h-full pointer-events-none"
      style={{ maskImage: 'radial-gradient(ellipse at 70% 40%, black 10%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at 70% 40%, black 10%, transparent 70%)' }} />
  )
}

/* ====== PROJECT VISUALS — small animated "hacker" illustrations, one per project ====== */
export function ProjectVisual({ kind, accent }: { kind: Visual; accent: Accent }) {
  const c = accentHex[accent]
  return (
    <div className="screen screen-panel relative aspect-[16/10] rounded-2xl border border-fg/10 bg-black overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />
      <div className="absolute inset-0 scanlines" />
      <svg viewBox="0 0 320 200" className="absolute inset-0 w-full h-full">
        {kind === 'radar' && (
          <g transform="translate(160 100)">
            {[30, 55, 80].map((r) => <circle key={r} r={r} fill="none" stroke={c} strokeOpacity="0.25" />)}
            <line x1="-90" x2="90" stroke={c} strokeOpacity="0.15" />
            <line y1="-90" y2="90" stroke={c} strokeOpacity="0.15" />
            <defs>
              <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={c} stopOpacity="0" />
                <stop offset="1" stopColor={c} stopOpacity="0.55" />
              </linearGradient>
            </defs>
            <path d="M0 0 L80 0 A80 80 0 0 0 56.6 -56.6 Z" fill="url(#sweep)">
              {/* SMIL rotates around the local origin (the radar centre); CSS transform-origin on SVG is unreliable */}
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite" />
            </path>
            {[[34, -40], [-52, 22], [18, 58], [-24, -62], [62, 30]].map(([x, y], i) => (
              <motion.circle key={i} cx={x} cy={y} r="3.5" fill={c}
                animate={{ opacity: [0.15, 1, 0.15], scale: [0.8, 1.3, 0.8] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }} />
            ))}
            <text x="-150" y="-80" fill={c} fillOpacity="0.6" fontSize="9" fontFamily="Geist Mono">SCAN 20 FEEDS</text>
            <text x="92" y="88" fill={c} fillOpacity="0.6" fontSize="9" fontFamily="Geist Mono">MATCH ≥ 80</text>
          </g>
        )}
        {kind === 'router' && (
          <g>
            {[['Claude', 50], ['Gemini', 110], ['OpenAI', 170]].map(([label, x], i) => (
              <g key={label}>
                <path d={`M160 40 L${x} 140`} stroke={c} strokeOpacity="0.3" strokeDasharray="4 4" fill="none" />
                <rect x={Number(x) - 26} y="140" width="52" height="24" rx="6" fill="black" stroke={c} strokeOpacity={i === 1 ? 0.9 : 0.35} />
                <text x={x} y="156" fill={c} fontSize="9" textAnchor="middle" fontFamily="Geist Mono">{label}</text>
              </g>
            ))}
            <path d="M160 40 L270 140" stroke={c} strokeOpacity="0.3" strokeDasharray="4 4" fill="none" />
            <rect x="244" y="140" width="52" height="24" rx="6" fill="black" stroke={c} strokeOpacity="0.35" />
            <text x="270" y="156" fill={c} fontSize="9" textAnchor="middle" fontFamily="Geist Mono">Groq</text>
            <rect x="120" y="22" width="80" height="26" rx="6" fill="black" stroke={c} />
            <text x="160" y="39" fill={c} fontSize="10" textAnchor="middle" fontFamily="Geist Mono">ROUTER</text>
            <motion.circle r="4" fill={c} cx={0} cy={0} initial={{ x: 160, y: 48 }}
              animate={{ x: [160, 50, 50, 160, 110, 110, 160], y: [48, 140, 140, 48, 140, 140, 48], opacity: [1, 1, 0.2, 1, 1, 1, 1] }}
              transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.25, 0.35, 0.45, 0.7, 0.85, 1] }} />
            <motion.text x="18" y="190" fill={c} fontSize="9" fontFamily="Geist Mono"
              animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.28, 0.32, 0.5, 0.55] }}>
              429 → failover
            </motion.text>
          </g>
        )}
        {kind === 'wave' && (
          <g>
            {Array.from({ length: 44 }, (_, i) => (
              <motion.rect key={i} x={20 + i * 6.4} y={56} width="3" height={80} rx="1.5" fill={c} fillOpacity={0.35 + (i % 5) * 0.12}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                initial={{ scaleY: 0.1 }} animate={{ scaleY: [0.1, 1 - ((i * 37) % 30) / 40, 0.1] }}
                transition={{ duration: 1 + (i % 4) * 0.25, repeat: Infinity, ease: 'easeInOut', delay: (i % 9) * 0.08 }} />
            ))}
            <text x="20" y="30" fill={c} fillOpacity="0.8" fontSize="10" fontFamily="Geist Mono">● REC 01:47:22</text>
            <text x="20" y="178" fill={c} fillOpacity="0.55" fontSize="9" fontFamily="Geist Mono">[01:47:18] S2: toh cache layer pehle ship karo…</text>
          </g>
        )}
        {kind === 'gold' && (
          <g>
            <motion.path d="M20 150 L60 138 L95 145 L130 110 L165 120 L200 86 L235 96 L270 58 L300 64" fill="none" stroke={c} strokeWidth="2"
              initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }} transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.7, 1] }} />
            <path d="M20 150 L60 138 L95 145 L130 110 L165 120 L200 86 L235 96 L270 58 L300 64 L300 180 L20 180 Z" fill={c} fillOpacity="0.07" />
            <text x="20" y="32" fill={c} fontSize="11" fontFamily="Geist Mono">XAU/INR  24K · per gram</text>
            <text x="20" y="50" fill={c} fillOpacity="0.55" fontSize="9" fontFamily="Geist Mono">spot × FX + duty + GST</text>
            <motion.text x="232" y="36" fill={c} fontSize="10" fontFamily="Geist Mono"
              animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.6, repeat: Infinity }}>▲ LIVE</motion.text>
          </g>
        )}
      </svg>
    </div>
  )
}

/* ====== RESUME — thumbnail that pops on hover and opens full-size on click ====== */
export function ResumeCard() {
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="card group relative z-20 flex items-center gap-5 rounded-2xl border border-fg/10 pl-3 pr-7 py-3 text-left hover:border-acc/40 transition-colors cursor-pointer">
        {/* Outer span owns the hover "peek" (CSS), inner img owns the open/close morph (layoutId). */}
        <span className="relative z-20 block w-14 md:w-16 origin-bottom-left transition-transform duration-500 ease-out group-hover:scale-[3.2] group-hover:-rotate-2">
          <motion.img layoutId="resume" src={asset('resume.webp')} alt="" width={1489} height={2105}
            className="block w-full h-auto rounded-md shadow-lg group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
            style={{ visibility: open ? 'hidden' : 'visible' }} />
        </span>
        <span>
          <span className="block font-oxanium text-base md:text-lg font-semibold text-fg/90">View resume</span>
          <span className="block font-geist-mono text-[11px] text-fg/50 mt-1 tracking-wider">1 page · updated Sep 2026</span>
        </span>
      </button>

      {/* Portal: the hero's transformed wrappers would otherwise trap the dialog under the navbar. */}
      {createPortal(<AnimatePresence>
        {open && (
          <motion.div role="dialog" aria-modal="true" aria-label="Resume" data-lenis-prevent
            className="fixed inset-0 z-[60] flex flex-col items-center bg-bg/85 backdrop-blur-md overflow-y-auto p-4 md:p-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <div className="sticky top-0 z-10 w-full max-w-4xl flex flex-wrap items-center justify-end gap-3 mb-4" onClick={(e) => e.stopPropagation()}>
              <a href={asset('resume.pdf')} download="Shailesh_Upadhyay_Resume.pdf"
                className="font-oxanium text-sm font-medium px-5 py-2.5 rounded-xl bg-acc text-bg hover:opacity-90 active:scale-[0.97] transition">
                Download PDF
              </a>
              <a href={asset('resume.pdf')} target="_blank" rel="noopener noreferrer"
                className="font-oxanium text-sm px-5 py-2.5 rounded-xl border border-fg/15 text-fg/85 hover:bg-fg/10 transition">
                Open in new tab
              </a>
              <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Close resume"
                className="w-11 h-11 rounded-xl border border-fg/15 text-fg/85 hover:bg-fg/10 transition cursor-pointer">✕</button>
            </div>
            <motion.img layoutId="resume" src={asset('resume.webp')} alt="Resume of Shailesh Upadhyay, AI Backend Engineer"
              width={1489} height={2105} onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl h-auto rounded-lg shadow-[0_0_80px_rgba(52,211,153,0.15)]"
              transition={{ duration: 0.5, ease: EASE }} />
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </>
  )
}

/* ====== MAIL PICKER — choose where to write from: Gmail / Outlook / Yahoo compose, the default app, or copy ====== */
const SUBJECT = encodeURIComponent('Hello Shailesh')
const composers = (to: string) => [
  { label: 'Gmail', sub: 'new compose in your browser', mark: 'G', color: '#ea4335', href: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${SUBJECT}` },
  { label: 'Outlook', sub: 'outlook.com compose', mark: 'O', color: '#2f7bd8', href: `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${SUBJECT}` },
  { label: 'Yahoo Mail', sub: 'yahoo compose', mark: 'Y', color: '#7b3fe4', href: `https://compose.mail.yahoo.com/?to=${to}&subject=${SUBJECT}` },
  { label: 'Mail app', sub: 'your default mail client', mark: '@', color: '#34d399', href: `mailto:${to}?subject=${SUBJECT}` },
]

export function MailPicker({ email, label, side = 'up', className, children }: {
  email: string; label: string; side?: 'up' | 'down'; className: string; children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    root.current?.querySelector<HTMLElement>('[role=menuitem]')?.focus()
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('pointerdown', onDown)
    addEventListener('keydown', onKey)
    return () => { removeEventListener('pointerdown', onDown); removeEventListener('keydown', onKey) }
  }, [open])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* clipboard blocked: the compose links still work */ }
  }

  return (
    <div ref={root} className="relative inline-flex">
      <button type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={`cursor-pointer ${className}`}>
        {children}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="menu" aria-label="Write an email with"
            className={`screen absolute z-40 left-1/2 -translate-x-1/2 w-[18.5rem] rounded-2xl border border-emerald-400/25 bg-[#070a09]/95 backdrop-blur-xl p-2 text-left shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7),0_0_40px_-14px_#34d399] ${side === 'up' ? 'bottom-full mb-3 origin-bottom' : 'top-full mt-3 origin-top'}`}
            initial={{ opacity: 0, scale: 0.92, y: side === 'up' ? 10 : -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: side === 'up' ? 6 : -6 }}
            transition={{ duration: 0.25, ease: EASE }}>
            <p className="px-3 pt-2 pb-2.5 font-geist-mono text-[11px] text-white/50 border-b border-white/[0.07] mb-1">
              <span className="text-emerald-400">$</span> compose --to shailesh<span className="text-emerald-400 animate-pulse">█</span>
            </p>
            <motion.ul initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } } }}>
              {composers(email).map((c) => (
                <motion.li key={c.label} variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}>
                  <a role="menuitem" href={c.href} target={c.href.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer" onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.06] focus-visible:bg-white/[0.06] outline-none transition-colors">
                    <span className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-oxanium font-bold text-sm text-white transition-transform group-hover:scale-110 group-hover:-rotate-6"
                      style={{ background: c.color, boxShadow: `0 0 18px -4px ${c.color}` }}>{c.mark}</span>
                    <span className="min-w-0">
                      <span className="block font-oxanium text-[15px] text-white/90">{c.label}</span>
                      <span className="block font-geist-mono text-[10.5px] text-white/45">{c.sub}</span>
                    </span>
                    <span aria-hidden className="ml-auto text-white/30 group-hover:text-emerald-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">↗</span>
                  </a>
                </motion.li>
              ))}
              <motion.li variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="mt-1 pt-1 border-t border-white/[0.07]">
                <button role="menuitem" type="button" onClick={copy}
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.06] focus-visible:bg-white/[0.06] outline-none transition-colors cursor-pointer">
                  <span className="font-geist-mono text-[11px] text-white/60 truncate">{email}</span>
                  <span aria-live="polite" className="font-geist-mono text-[10px] tracking-widest text-emerald-400 shrink-0">{copied ? 'COPIED ✓' : 'COPY'}</span>
                </button>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
