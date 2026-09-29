import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, animate, inView as onInView, motion, useReducedMotion } from 'framer-motion'
import type { Accent } from './data'
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
        <li key={s} className="font-geist-mono text-[0.6875rem] md:text-xs text-fg/70 px-2.5 py-1 rounded-md border border-fg/10 bg-fg/[0.03]">
          {s}
        </li>
      ))}
    </ul>
  )
}

export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-geist-mono text-xs tracking-wider text-(--ac) px-3.5 py-2.5 md:py-1.5 rounded-lg border border-(--ac)/30 bg-(--ac)/5 hover:bg-(--ac)/15 active:scale-[0.97] transition-all">
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
        <span className="ml-2 min-w-0 font-geist-mono text-xs text-white/45 truncate">{file}</span>
        <span className="ml-auto shrink-0 font-geist-mono text-[0.6875rem] tracking-widest text-(--ac)/80">
          {done ? 'READY' : started ? 'STREAMING' : glitching ? 'DECRYPTING' : 'STANDBY'}
        </span>
      </div>
      <div className="relative p-5 md:p-6 font-geist-mono text-[0.78125rem] md:text-sm leading-relaxed">
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
    let prev: string[] = []
    let raf = 0
    let last = 0
    const resize = () => {
      c.width = c.offsetWidth
      c.height = c.offsetHeight
      drops = Array.from({ length: Math.ceil(c.width / size) }, () => Math.random() * -60)
      prev = drops.map(() => '')
    }
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw)
      if (t - last < 55 || c.getBoundingClientRect().bottom < 0) return
      last = t
      const css = getComputedStyle(c)
      const trail = ctx.createLinearGradient(0, 0, c.width, 0)
      ;(['--emerald', '--cyan', '--violet', '--rose'] as const).forEach((v, k) => trail.addColorStop(k / 3, css.getPropertyValue(v)))
      const head = css.getPropertyValue('--rain-head')
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.fillRect(0, 0, c.width, c.height)
      ctx.globalCompositeOperation = 'source-over'
      ctx.font = `${size - 1}px "Geist Mono", monospace`
      drops.forEach((y, i) => {
        // the glyph that was the head last tick becomes trail colour; the new head is drawn bright
        if (prev[i]) {
          ctx.fillStyle = trail
          ctx.fillText(prev[i], i * size, (y - 1) * size)
        }
        const g = glyphs[(Math.random() * glyphs.length) | 0]
        ctx.fillStyle = head
        ctx.fillText(g, i * size, y * size)
        prev[i] = g
        if (y * size > c.height && Math.random() > 0.975) { drops[i] = 0; prev[i] = '' } else drops[i] = y + 1
      })
    }
    resize()
    addEventListener('resize', resize)
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize) }
  }, [])
  return (
    <canvas ref={ref} aria-hidden className="rain absolute inset-0 w-full h-full pointer-events-none"
      style={{ maskImage: 'radial-gradient(ellipse 75% 85% at 62% 45%, black 30%, transparent 90%)', WebkitMaskImage: 'radial-gradient(ellipse 75% 85% at 62% 45%, black 30%, transparent 90%)' }} />
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
          <span className="block font-geist-mono text-[0.6875rem] text-fg/50 mt-1 tracking-wider">1 page · updated Sep 2026</span>
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

export function MailPicker({ email, label, side: prefer = 'up', className, children }: {
  email: string; label: string; side?: 'up' | 'down'; className: string; children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [side, setSide] = useState(prefer)
  const [sheet, setSheet] = useState(false)
  const [copied, setCopied] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const menu = useRef<HTMLDivElement>(null)

  // Popover beside the button when there is room; on small or short screens (phones, landscape) a bottom
  // sheet instead, which always fits. The popover opens toward whichever side has more space.
  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const above = r.top, below = innerHeight - r.bottom, need = 350
    setSheet(innerWidth < 640 || (above < need && below < need))
    setSide(prefer === 'up' ? (above >= need || above >= below ? 'up' : 'down') : (below >= need || below >= above ? 'down' : 'up'))
    setOpen((o) => !o)
  }

  useEffect(() => {
    if (!open) return
    menu.current?.querySelector<HTMLElement>('[role=menuitem]')?.focus()
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!root.current?.contains(t) && !menu.current?.contains(t)) setOpen(false)
    }
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

  const panel = (
          <motion.div ref={menu} role="menu" aria-label="Write an email with"
            className={`screen z-[80] rounded-2xl border border-emerald-400/25 bg-[#070a09]/95 backdrop-blur-xl p-2 text-left shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7),0_0_40px_-14px_#34d399] ${sheet
              ? 'fixed inset-x-3 bottom-3 mx-auto max-w-sm pb-[max(0.5rem,env(safe-area-inset-bottom))]'
              : `absolute left-1/2 -translate-x-1/2 w-[min(18.5rem,calc(100vw-2rem))] ${side === 'up' ? 'bottom-full mb-3 origin-bottom' : 'top-full mt-3 origin-top'}`}`}
            initial={sheet ? { opacity: 0, y: 60 } : { opacity: 0, scale: 0.92, y: side === 'up' ? 10 : -10 }}
            animate={sheet ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={sheet ? { opacity: 0, y: 60 } : { opacity: 0, scale: 0.95, y: side === 'up' ? 6 : -6 }}
            transition={{ duration: sheet ? 0.32 : 0.25, ease: EASE }}>
            {sheet && <span aria-hidden className="block mx-auto mt-0.5 mb-2 w-10 h-1 rounded-full bg-white/20" />}
            <p className="px-3 pt-2 pb-2.5 font-geist-mono text-[0.6875rem] text-white/50 border-b border-white/[0.07] mb-1">
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
                      <span className="block font-oxanium text-[0.9375rem] text-white/90">{c.label}</span>
                      <span className="block font-geist-mono text-[0.65625rem] text-white/45">{c.sub}</span>
                    </span>
                    <span aria-hidden className="ml-auto text-white/30 group-hover:text-emerald-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">↗</span>
                  </a>
                </motion.li>
              ))}
              <motion.li variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="mt-1 pt-1 border-t border-white/[0.07]">
                <button role="menuitem" type="button" onClick={copy}
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.06] focus-visible:bg-white/[0.06] outline-none transition-colors cursor-pointer">
                  <span className="font-geist-mono text-[0.6875rem] text-white/60 truncate">{email}</span>
                  <span aria-live="polite" className="font-geist-mono text-[0.625rem] tracking-widest text-emerald-400 shrink-0">{copied ? 'COPIED ✓' : 'COPY'}</span>
                </button>
              </motion.li>
            </motion.ul>
          </motion.div>
  )

  return (
    <div ref={root} className="relative inline-flex">
      <button type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={toggle} className={`cursor-pointer ${className}`}>
        {children}
      </button>
      {sheet
        ? createPortal(
          <AnimatePresence>
            {open && <motion.div key="scrim" className="fixed inset-0 z-[79] bg-black/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />}
            {open && panel}
          </AnimatePresence>, document.body)
        : <AnimatePresence>{open && panel}</AnimatePresence>}
    </div>
  )
}
