import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { AnimatePresence, MotionConfig, motion, useScroll } from 'framer-motion'
import Lenis from 'lenis'
import Intro from './Intro'
import BuildLayer from './BuildLayer'
import { Products } from './Products'
import { education, experience, greetings, marquee, profile, projects, skills, stats, whoami, type Accent } from './data'
import { acVar, asset, EASE, spotlight } from './lib'
import { Chips, CountUp, ExtLink, MailPicker, MatrixRain, ResumeCard, SectionHeader, Terminal } from './ui'
import { ProjectMark, ProjectVisual } from './visuals'

const NAV = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'products', label: 'Products' },
  { id: 'projects', label: 'Deep dives' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
]
const SPY = ['home', ...NAV.map((n) => n.id), 'contact']

/* ====== ICONS ====== */
type IconName = 'github' | 'linkedin' | 'mail' | 'file' | 'phone' | 'chat' | 'copy' | 'clock'
const STROKE_ICONS: Partial<Record<IconName, ReactNode>> = {
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  file: <><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
  phone: <path d="M5 3.5h3.6l1.8 4.6-2.3 1.4a11.5 11.5 0 0 0 6.4 6.4l1.4-2.3 4.6 1.8V19a1.9 1.9 0 0 1-2 1.9A16.5 16.5 0 0 1 3.1 5.5 1.9 1.9 0 0 1 5 3.5z" />,
  chat: <><path d="M20.5 11.6a8.4 8.4 0 0 1-12.3 7.4L3.5 20.5l1.5-4.6a8.4 8.4 0 1 1 15.5-4.3z" /><path d="M8.5 10.5h7M8.5 13.5h4.5" /></>,
  copy: <><rect x="8.5" y="8.5" width="12" height="12" rx="2.5" /><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
}

function Icon({ name, className = 'w-5 h-5' }: { name: IconName; className?: string }) {
  if (STROKE_ICONS[name])
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {STROKE_ICONS[name]}
      </svg>
    )
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d={name === 'github'
        ? 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z'
        : 'M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z'} />
    </svg>
  )
}

/* ====== BLACKHOLE REVEAL ====== */
function BlackholeOverlay({ onDone }: { onDone: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-[65] pointer-events-none"
      initial={{ background: 'radial-gradient(circle at center, transparent 0%, black 100%)' }}
      animate={{ background: 'radial-gradient(circle at center, transparent 100%, black 100%)' }}
      transition={{ duration: 0.9, ease: 'easeInOut' }} onAnimationComplete={onDone} />
  )
}

function Float({ children, delay = 0, y = 6 }: { children: ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div animate={{ y: [0, -y, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}>
      {children}
    </motion.div>
  )
}

function Rise({ d = 0, children, className }: { d?: number; children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.35 + d }}>
      {children}
    </motion.div>
  )
}

/* ====== THEME — <html data-theme> is set before paint by index.html, from localStorage or the OS ====== */
// Day/night switch: a sky with clouds and a sun by day; slide it and the sun becomes a cratered moon over a
// starry night. The new theme spreads from the switch as a circle (View Transitions API; instant elsewhere).
function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? 'dark')
  const dark = theme === 'dark'
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])

  const flip = (e: MouseEvent<HTMLButtonElement>) => {
    const next = dark ? 'light' : 'dark'
    try { localStorage.setItem('theme', next) } catch { /* private mode: theme just won't persist */ }
    const apply = () => {
      document.documentElement.dataset.theme = next
      flushSync(() => setTheme(next))
    }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (typeof document.startViewTransition !== 'function' || reduce) return apply()
    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2, y = r.top + r.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    document.startViewTransition(apply).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
  }

  return (
    <button type="button" role="switch" aria-checked={dark} aria-label="Dark mode" onClick={flip} title={dark ? 'Switch to day' : 'Switch to night'}
      className="group relative w-16 h-8 shrink-0 rounded-full overflow-hidden cursor-pointer border border-fg/15 shadow-[inset_0_2px_6px_rgba(0,0,0,0.25)] active:scale-95 transition-transform">
      {/* day sky */}
      <motion.span aria-hidden className="absolute inset-0 bg-gradient-to-br from-sky-300 via-sky-400 to-amber-200" animate={{ opacity: dark ? 0 : 1 }} transition={{ duration: 0.5 }} />
      <motion.span aria-hidden className="absolute inset-0" animate={{ x: dark ? 18 : 0, opacity: dark ? 0 : 1 }} transition={{ duration: 0.5 }}>
        <span className="absolute left-2 bottom-1.5 w-4 h-2 rounded-full bg-white/90" />
        <span className="absolute left-4 bottom-2.5 w-3 h-2.5 rounded-full bg-white/90" />
        <span className="absolute left-7 bottom-1 w-3 h-1.5 rounded-full bg-white/70" />
      </motion.span>
      {/* night sky */}
      <motion.span aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#0b1026] via-[#1e1b4b] to-[#312e81]" animate={{ opacity: dark ? 1 : 0 }} transition={{ duration: 0.5 }} />
      <motion.span aria-hidden className="absolute inset-0" animate={{ opacity: dark ? 1 : 0, y: dark ? 0 : 8 }} transition={{ duration: 0.5 }}>
        {[['left-2.5 top-2', 0], ['left-5 top-4.5', 0.6], ['left-8 top-1.5', 1.1], ['left-3.5 top-5.5', 1.6]].map(([pos, d]) => (
          <span key={pos} className={`absolute ${pos} w-[3px] h-[3px] rounded-full bg-white animate-pulse`} style={{ animationDelay: `${d}s` }} />
        ))}
      </motion.span>
      {/* the knob: sun by day, moon by night */}
      <motion.span aria-hidden className="absolute top-[3px] left-[3px] w-6 h-6 rounded-full"
        animate={{ x: dark ? 32 : 0, rotate: dark ? 360 : 0 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }}>
        <motion.span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fef9c3,#facc15_55%,#f59e0b)] shadow-[0_0_14px_3px_rgba(250,204,21,0.65)]"
          animate={{ opacity: dark ? 0 : 1, scale: dark ? 0.6 : 1 }} transition={{ duration: 0.35 }} />
        <motion.span className="absolute -inset-1.5 theme-rays" animate={{ opacity: dark ? 0 : 1 }} transition={{ duration: 0.3 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="absolute left-1/2 top-1/2 w-[2px] h-[5px] -ml-px rounded-full bg-amber-200/90" style={{ transform: `rotate(${i * 45}deg) translateY(-15px)` }} />
          ))}
        </motion.span>
        <motion.span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff,#e2e8f0_60%,#94a3b8)] shadow-[0_0_14px_2px_rgba(199,210,254,0.55)]"
          animate={{ opacity: dark ? 1 : 0, scale: dark ? 1 : 0.6 }} transition={{ duration: 0.35 }}>
          <span className="absolute left-[5px] top-[6px] w-[6px] h-[6px] rounded-full bg-slate-400/60" />
          <span className="absolute right-[5px] bottom-[5px] w-[4px] h-[4px] rounded-full bg-slate-400/55" />
          <span className="absolute right-[7px] top-[4px] w-[3px] h-[3px] rounded-full bg-slate-400/50" />
        </motion.span>
      </motion.span>
    </button>
  )
}

/* ====== NAVBAR — scroll-spy, progress bar, mobile menu ====== */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' })
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [ids])
  return active
}

function Navbar() {
  const active = useActiveSection(SPY)
  const [menu, setMenu] = useState(false)
  const { scrollYProgress } = useScroll()
  return (
    <motion.header className="fixed top-0 inset-x-0 z-50 bg-bg/75 backdrop-blur-xl border-b border-fg/[0.06]"
      initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}>
      <nav aria-label="Primary" className="relative mx-auto max-w-7xl h-18 md:h-20 px-5 md:px-10 flex items-center justify-between">
        <a href="#home" className="font-museo text-2xl md:text-[1.9rem] font-bold tracking-wider text-gradient" aria-label="Shailesh Upadhyay, home">
          SHAILESH
        </a>
        <ul className="hidden xl:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {NAV.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} aria-current={active === l.id ? 'true' : undefined}
                className={`relative block px-4 py-2 rounded-xl font-oxanium text-[0.9375rem] tracking-wide transition-colors ${active === l.id ? 'text-fg' : 'text-fg/60 hover:text-fg'}`}>
                {active === l.id && (
                  <motion.span layoutId="navPill" className="absolute inset-0 rounded-xl border border-acc/25 bg-gradient-to-br from-acc/15 to-cyan-400/5"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
                <span className="relative">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <a href="#contact" aria-current={active === 'contact' ? 'true' : undefined}
            className={`hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-oxanium text-[0.9375rem] font-medium text-fg border bg-gradient-to-br from-acc/20 to-cyan-400/10 hover:from-acc/30 hover:shadow-[0_0_30px_-8px_var(--acc)] active:scale-[0.97] transition-all ${active === 'contact' ? 'border-acc/70 shadow-[0_0_30px_-6px_var(--acc)]' : 'border-acc/30'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-acc animate-pulse" /> Let's talk
          </a>
          <button type="button" className="xl:hidden w-11 h-11 rounded-xl border border-fg/15 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
            aria-label="Menu" aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu((m) => !m)}>
            <span className={`block w-5 h-px bg-fg transition-transform ${menu ? 'translate-y-[3.5px] rotate-45' : ''}`} />
            <span className={`block w-5 h-px bg-fg transition-transform ${menu ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {menu && (
          <motion.ul id="mobile-menu" className="xl:hidden border-t border-fg/[0.06] px-5 py-3 bg-bg/95"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            {[...NAV, { id: 'contact', label: 'Contact' }].map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={() => setMenu(false)}
                  className={`block py-3 font-oxanium text-lg ${active === l.id ? 'text-acc' : 'text-fg/80'}`}>{l.label}</a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      <motion.div className="absolute bottom-0 inset-x-0 h-[2px] origin-left bg-gradient-to-r from-acc via-cyan-400 to-violet-400" style={{ scaleX: scrollYProgress }} />
    </motion.header>
  )
}

/* ====== HERO ====== */
// Scales a hero name down (never up) until it fits the column. Re-fits on resize and when web fonts load.
function fitToBox(el: HTMLSpanElement | null) {
  const box = el?.closest<HTMLElement>('[data-name-box]')
  if (!el || !box) return
  const fit = () => {
    const s = Math.min(1, (box.clientWidth * 0.97) / el.offsetWidth) // 3% slack: some scripts' glyphs overhang their advance width
    el.style.transform = s < 1 ? `scale(${s})` : ''
  }
  fit()
  const ro = new ResizeObserver(fit)
  ro.observe(box)
  ro.observe(el)
  return () => ro.disconnect()
}

function Hero() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % greetings.length), 2600)
    return () => clearInterval(t)
  }, [])
  const g = greetings[i]
  const socials = [
    { href: profile.github, label: 'GitHub', icon: 'github' as const },
    { href: profile.linkedin, label: 'LinkedIn', icon: 'linkedin' as const },
  ]
  const iconBtn = 'card w-12 h-12 rounded-xl border border-fg/10 flex items-center justify-center text-fg/70 hover:text-acc hover:border-acc/40 hover:-translate-y-0.5 active:scale-95 transition-all'

  return (
    <section id="home" className="relative min-h-[100dvh] overflow-hidden flex items-center">
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(to right, var(--grid) 1px, transparent 1px), linear-gradient(to bottom, var(--grid) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div className="absolute inset-0 pointer-events-none bg-bg" style={{
        maskImage: 'radial-gradient(ellipse at center, transparent 20%, black)', WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 20%, black)',
      }} />
      <div aria-hidden className="aurora">
        <span className="left-[58%] top-[6%] w-[32vw] h-[32vw] bg-violet-200" />
        <span className="left-[74%] top-[48%] w-[24vw] h-[24vw] bg-rose-200" style={{ animationDelay: '-6s' }} />
        <span className="left-[2%] top-[50%] w-[24vw] h-[24vw] bg-cyan-200" style={{ animationDelay: '-11s' }} />
        <span className="left-[28%] top-[-14%] w-[20vw] h-[20vw] bg-amber-100" style={{ animationDelay: '-3s' }} />
        <span className="left-[44%] top-[40%] w-[14vw] h-[14vw] bg-emerald-200" style={{ animationDelay: '-8s' }} />
      </div>
      <MatrixRain />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-10 pt-28 sm:pt-32 pb-36 lg:pt-28 grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-14 lg:gap-16">
        <div className="flex flex-col gap-6 md:gap-7">
          <Rise>
            <AnimatePresence mode="wait">
              <motion.div key={i} aria-hidden data-b-greeting className="flex flex-wrap items-center gap-3 min-h-9"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3, ease: EASE }}>
                <span className="font-oxanium text-xl md:text-2xl text-fg/65">{g.hi}</span>
                <span className="font-geist-mono text-[0.625rem] md:text-[0.6875rem] tracking-widest px-2 py-1 rounded-md border border-acc/30 bg-acc/10 text-acc">
                  {g.code} · {g.lang}
                </span>
              </motion.div>
            </AnimatePresence>
          </Rise>
          <Rise d={0.1}>
            <Float y={4}>
              <h1 className="font-museo leading-none tracking-tight">
                <span className="sr-only">Shailesh Upadhyay</span>
                <span aria-hidden data-name-box className="relative block text-[3.3rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[6.3rem]">
                  <span className="invisible block py-[0.08em]">SHAILESH</span>
                  <AnimatePresence mode="wait">
                    {/* Scanner wipe: clip-path reveal plus a glowing bar riding the edge. The extra padding gives tall
                        scripts (Tamil, Malayalam, Devanagari) room, since gradient-clipped text only paints inside its box. */}
                    <motion.span key={i} className="absolute left-0 top-0 w-max"
                      exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.3, ease: EASE }}>
                      <span ref={fitToBox} className="relative block origin-left">
                      <motion.span className="block -mt-[0.2em] py-[0.28em] -mx-[0.08em] px-[0.08em] text-gradient whitespace-nowrap"
                        initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={{ duration: 0.8, ease: EASE }}>
                        {g.name}
                      </motion.span>
                      <motion.span className="absolute top-[0.05em] bottom-[0.05em] w-[3px] rounded-full bg-acc" style={{ boxShadow: '0 0 18px 3px var(--acc)' }}
                        initial={{ left: '0%', opacity: 0 }} animate={{ left: '100%', opacity: [0, 1, 1, 0] }} transition={{ duration: 0.8, ease: EASE }} />
                      </span>
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span aria-hidden className="surname block text-[2rem] md:text-[2.9rem] lg:text-[3.4rem] text-fg/30 mt-1">{profile.last}</span>
              </h1>
            </Float>
          </Rise>
          <Rise d={0.2}>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-geist-mono text-sm md:text-base text-acc px-3 py-1.5 rounded-lg border border-acc/30 bg-acc/10">
                {profile.role}
              </span>
              {profile.focus.map((f) => <span key={f} className="font-oxanium text-sm md:text-base text-fg/60"><span className="text-acc/60">/</span> {f}</span>)}
            </p>
          </Rise>
          <Rise d={0.3}>
            <p className="font-oxanium text-lg md:text-xl text-fg/85 leading-relaxed max-w-xl text-pretty">
              {profile.tagline} <span className="text-fg/65">Right now I&apos;m building AgentHub with a US team at {profile.current}.</span>
            </p>
          </Rise>
          <Rise d={0.4} className="flex flex-wrap items-center gap-4 mt-2">
            <ResumeCard />
            <div className="flex gap-3">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className={iconBtn}>
                  <Icon name={s.icon} />
                </a>
              ))}
              <MailPicker email={profile.email} label="Email me" className={iconBtn}><Icon name="mail" /></MailPicker>
            </div>
          </Rise>
        </div>

        {/* Portrait — slides in, then keeps bouncing */}
        {/* Portrait — drops in from above the screen on a spring (lands with one soft bounce and a slight
            wobble), a glow spreads on the "floor" at impact, then the idle bounce takes over. */}
        <motion.div data-b-portrait className="relative mx-auto w-full max-w-[20.625rem] md:max-w-[23.75rem] lg:max-w-[25.625rem]"
          initial={{ y: '-120vh', rotate: -6 }}
          animate={{ y: ['-120vh', '0vh', '-6vh', '0vh', '-1.6vh', '0vh'], rotate: [-6, 0, 1.6, 0, -0.5, 0] }}
          transition={{
            // gravity in (ease-in), then two decaying bounces — starts once the reveal has cleared this side of the screen
            duration: 1.35, delay: 0.55, times: [0, 0.45, 0.61, 0.76, 0.88, 1],
            ease: ['easeIn', 'easeOut', 'easeIn', 'easeOut', 'easeIn'],
          }}>
          <motion.div aria-hidden className="absolute left-1/2 -bottom-8 w-[85%] h-12 -translate-x-1/2 rounded-[50%] bg-acc/50 blur-2xl pointer-events-none"
            initial={{ scaleX: 0.2, opacity: 0 }} animate={{ scaleX: [0.2, 1.6, 1], opacity: [0, 0.95, 0.3] }}
            transition={{ duration: 1.1, delay: 0.55 + 1.35 * 0.45, times: [0, 0.28, 1], ease: 'easeOut' }} />
          <motion.div animate={{ y: [0, -22, 0, -7, 0] }}
            transition={{ duration: 2.4, times: [0, 0.38, 0.66, 0.83, 1], ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.5, delay: 2.2 }}>
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-700 blur-md"
                style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.3), rgba(34,211,238,0.2), rgba(167,139,250,0.2), rgba(251,113,133,0.15))' }} />
              <div className="relative rounded-3xl overflow-hidden border border-fg/10 bg-bg/40">
                <img src={asset('profile.webp')} alt="Portrait of Shailesh Upadhyay" width={1024} height={1536} fetchPriority="high"
                  className="block w-full h-auto" style={{ filter: 'grayscale(15%) contrast(1.05) brightness(0.96)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              {(['top-3 left-3 border-t-2 border-l-2 rounded-tl-lg border-acc', 'top-3 right-3 border-t-2 border-r-2 rounded-tr-lg border-cyan-400',
                'bottom-3 left-3 border-b-2 border-l-2 rounded-bl-lg border-violet-400', 'bottom-3 right-3 border-b-2 border-r-2 rounded-br-lg border-rose-400']).map((c) => (
                <div key={c} className={`absolute w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity ${c}`} />
              ))}
              <div className="screen-panel absolute -top-4 left-6 flex items-center gap-2 rounded-full border border-(--emerald)/25 bg-(--chip) backdrop-blur px-3.5 py-1.5 font-geist-mono text-[0.6875rem] text-fg/85">
                <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" /><span className="relative w-2 h-2 rounded-full bg-emerald-400" /></span>
                Currently @ {profile.current}
              </div>
              <div className="screen-panel absolute -bottom-4 -right-3 rounded-xl border border-fg/10 bg-(--chip) backdrop-blur px-4 py-2 font-geist-mono text-[0.6875rem] tracking-widest">
                <span className="text-gradient">AI ENGINEER</span>
              </div>
              <div className="screen-panel hidden md:block absolute top-[58%] -left-16 rounded-xl border border-(--emerald)/25 bg-(--chip) backdrop-blur px-4 py-3 font-geist-mono text-[0.6875rem] leading-relaxed">
                <div className="text-(--emerald)">$ curl -N /v1/chat/stream</div>
                <div className="text-fg/65">p95 <span className="text-fg/65 line-through">1.2s</span> → <span className="text-(--emerald)">660ms</span> ✓</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 inset-x-0 z-10 border-t border-fg/[0.06] bg-bg/70 py-4 overflow-hidden" aria-hidden>
        <div className="flex w-max animate-marquee">
          {[...marquee, ...marquee].map((t, k) => (
            <span key={k} className="flex items-center gap-8 pr-8 font-geist-mono text-xs md:text-sm tracking-[0.2em] text-fg/45 uppercase">
              {t}<span className="text-acc/60 text-[0.5rem]">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ====== ABOUT ====== */
function About() {
  return (
    <section id="about" className="relative py-28 md:py-40 px-5 md:px-10">
      <div className="max-w-6xl mx-auto">
        <SectionHeader n="01" label="ABOUT" title={<>I build <span className="text-acc/80">systems</span> that think.</>} />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-10 lg:gap-14 items-start">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease: EASE }}>
            <p className="font-oxanium text-lg md:text-xl text-fg/75 leading-relaxed text-pretty">{profile.summary}</p>
            <dl className="mt-10 grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="card flex flex-col-reverse rounded-2xl border border-fg/[0.08] p-5 md:p-6 hover:border-acc/30 transition-colors">
                  <dt className="font-oxanium text-sm text-fg/60 mt-2 leading-snug">{s.label}</dt>
                  <dd className="font-museo text-3xl md:text-4xl text-gradient"><CountUp to={s.to} dec={s.dec} prefix={s.prefix} suffix={s.suffix} /></dd>
                </div>
              ))}
            </dl>
          </motion.div>
          <Terminal lines={whoami} file="~/whoami.sh" accent="emerald" />
        </div>
      </div>
    </section>
  )
}

/* ====== EXPERIENCE — timeline that draws itself as you scroll ====== */
function Experience() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  return (
    <section id="experience" className="relative py-28 md:py-40 px-5 md:px-10 border-t border-fg/[0.05]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader n="02" label="EXPERIENCE" title="Where I've shipped" />
        <div ref={ref} className="relative">
          <div className="absolute left-[7px] md:left-[14.25rem] top-2 bottom-2 w-px bg-fg/10" />
          <motion.div className="absolute left-[7px] md:left-[14.25rem] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-acc via-violet-400 to-rose-400"
            style={{ scaleY: scrollYProgress }} />
          <ol className="space-y-16 md:space-y-20">
            {experience.map((e) => (
              <motion.li key={e.role} style={acVar(e.accent)} className="relative grid grid-cols-1 md:grid-cols-[12.5rem_minmax(0,1fr)] gap-3 md:gap-14 pl-9 md:pl-0"
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease: EASE }}>
                <span className="absolute left-0 md:left-[calc(14.25rem-7px)] top-1.5 w-[15px] h-[15px] rounded-full border-2 border-(--ac) bg-bg shadow-[0_0_16px_var(--ac)]" />
                <p className="font-geist-mono text-sm text-(--ac) md:text-right md:pt-1.5">{e.period}</p>
                <div className="min-w-0">
                  <h3 className="font-museo text-2xl md:text-3xl text-fg/95">{e.role}</h3>
                  <p className="font-oxanium text-base md:text-lg text-fg/65 mt-1.5">
                    <span className="text-fg/90">{e.org}</span> — {e.note}
                  </p>
                  {e.links.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">{e.links.map((l) => <ExtLink key={l.href} href={l.href}>{l.label}</ExtLink>)}</div>
                  )}
                  <Terminal className="mt-5" lines={e.lines} file={e.file} accent={e.accent} />
                  <Chips className="mt-4" items={e.stack} />
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ====== PROJECTS ====== */
function Private() {
  return <span className="font-geist-mono text-xs text-fg/65 px-3 py-1.5 rounded-lg border border-fg/10">Private repo · demo on request</span>
}

function Projects() {
  return (
    <section id="projects" className="relative py-28 md:py-40 px-5 md:px-10 border-t border-fg/[0.05]">
      <div className="max-w-7xl mx-auto">
        <SectionHeader n="04" label="DEEP DIVES" title="How the big ones work" />
        <div className="space-y-24 md:space-y-32">
          {projects.map((p, i) => (
            <motion.article key={p.name} id={`deep-${p.name.split('.')[0].split(' ')[0].toLowerCase()}`} style={acVar(p.accent)} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start scroll-mt-36"
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease: EASE }}>
              <div className={i % 2 ? 'lg:order-2' : ''}>
                <ProjectVisual kind={p.visual} />
                <p className="mt-7 font-geist-mono text-xs tracking-[0.2em] uppercase text-(--ac)">{p.kind}</p>
                <h3 className="flex items-center gap-4 font-museo text-4xl md:text-5xl text-fg mt-3">
                  <ProjectMark kind={p.visual} /> {p.name}
                </h3>
                <p className="font-oxanium text-lg text-fg/75 mt-3 leading-relaxed text-pretty">{p.pitch}</p>
                <dl className="flex flex-wrap gap-x-10 gap-y-4 mt-6">
                  {p.metrics.map((m) => (
                    <div key={m.l} className="flex flex-col-reverse">
                      <dt className="font-oxanium text-xs text-fg/65 mt-1">{m.l}</dt>
                      <dd className="font-museo text-2xl md:text-3xl text-(--ac)">{m.v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-wrap gap-2 mt-7">
                  {p.links.length ? p.links.map((l) => <ExtLink key={l.href} href={l.href}>{l.label}</ExtLink>) : <Private />}
                </div>
              </div>
              <div className={i % 2 ? 'lg:order-1' : ''}>
                <Terminal lines={p.lines} file={p.file} accent={p.accent} />
                <Chips className="mt-4" items={p.stack} />
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  )
}

/* ====== SKILLS ====== */
function Skills() {
  return (
    <section id="skills" className="relative py-28 md:py-40 px-5 md:px-10 border-t border-fg/[0.05]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader n="05" label="SKILLS" title="The toolbelt" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skills.map((s) => (
            <div key={s.title} className="flex flex-col">
              <div className="flex items-baseline justify-between gap-4 mb-3 px-1">
                <h3 className="font-museo text-xl md:text-2xl text-fg/90">{s.title}</h3>
                <span className="font-oxanium text-sm text-fg/65 text-right">{s.sub}</span>
              </div>
              <Terminal className="flex-1" lines={s.lines} file={s.file} accent={s.accent} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ====== EDUCATION ====== */
function Education() {
  return (
    <section id="education" className="relative py-28 md:py-40 px-5 md:px-10 border-t border-fg/[0.05]">
      <div className="max-w-5xl mx-auto">
        <SectionHeader n="06" label="EDUCATION" title="Foundations" />
        <motion.div className="card relative overflow-hidden rounded-3xl border border-fg/[0.08] p-8 md:p-12"
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, ease: EASE }}>
          <span aria-hidden className="absolute -right-4 -bottom-10 font-museo text-[9rem] md:text-[13rem] leading-none text-transparent select-none"
            style={{ WebkitTextStroke: '1.5px color-mix(in srgb, var(--acc) 40%, transparent)' }}>'26</span>
          <div className="relative">
            <p className="font-geist-mono text-sm text-acc">{education.period}</p>
            <h3 className="font-museo text-3xl md:text-4xl text-fg mt-3">{education.degree}</h3>
            <p className="font-oxanium text-lg text-fg/70 mt-2">{education.spec} · <span className="text-fg/90">{education.school}</span></p>
            <p className="font-oxanium text-sm text-fg/65 mt-8 mb-3">Relevant coursework</p>
            <Chips items={education.coursework} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ====== CONTACT ====== */
// Live local time in India, for visitors in other time zones.
function IndiaTime() {
  const fmt = () => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date())
  const [now, setNow] = useState(fmt)
  useEffect(() => {
    const t = setInterval(() => setNow(fmt()), 20000)
    return () => clearInterval(t)
  }, [])
  return <>{now}</>
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard blocked: the other actions still work */ }
  }
  return (
    <button type="button" onClick={copy} aria-label={label} aria-live="polite"
      className="inline-flex items-center gap-2 font-geist-mono text-xs tracking-widest px-4 py-3 rounded-xl border border-fg/15 text-fg/80 hover:bg-fg/10 hover:text-fg active:scale-[0.97] transition cursor-pointer">
      <Icon name="copy" className="w-4 h-4" /> {copied ? 'COPIED ✓' : 'COPY'}
    </button>
  )
}

const actionBtn = 'inline-flex items-center gap-2 font-geist-mono text-xs tracking-widest px-4 py-3 rounded-xl border border-(--ac)/40 bg-(--ac)/10 text-fg hover:bg-(--ac)/20 hover:shadow-[0_0_28px_-8px_var(--ac)] active:scale-[0.97] transition-all cursor-pointer'

function ContactCard({ accent, icon, label, value, children }: { accent: Accent; icon: IconName; label: string; value: string; children: ReactNode }) {
  return (
    <motion.div style={acVar(accent)} onMouseMove={spotlight}
      className="card spotlight relative flex flex-col gap-4 rounded-3xl border border-fg/[0.08] hover:border-(--ac)/40 has-[[aria-expanded=true]]:z-30 p-5 md:p-6 text-left transition-colors"
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASE }}>
      <div className="flex items-center gap-4">
        <span className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-(--ac) border border-(--ac)/30 bg-(--ac)/10 shadow-[0_0_30px_-10px_var(--ac)]">
          <Icon name={icon} className="w-5 h-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-geist-mono text-[0.6875rem] tracking-[0.2em] uppercase text-(--ac)">{label}</span>
          <span className="hidden sm:block font-oxanium text-lg xl:text-xl text-fg/95 break-all mt-0.5">{value}</span>
        </span>
      </div>
      <span className="sm:hidden font-oxanium text-base min-[400px]:text-lg text-fg/95 break-all -mt-1">{value}</span>
      <div className="flex flex-wrap gap-2.5">{children}</div>
    </motion.div>
  )
}

function Contact() {
  const cards = [
    { label: 'GitHub', sub: '@SHAILESH-RS-UPADHYAY', href: profile.github, icon: 'github' as const },
    { label: 'LinkedIn', sub: 'Shailesh Upadhyay', href: profile.linkedin, icon: 'linkedin' as const },
    { label: 'Resume', sub: 'PDF · 1 page', href: asset('resume.pdf?v=20261106'), icon: 'file' as const },
  ]
  return (
    <section id="contact" className="relative min-h-[calc(100dvh-4.5rem)] md:min-h-[calc(100dvh-5rem)] flex items-center py-16 md:py-20 px-5 md:px-10 border-t border-fg/[0.05] overflow-hidden">
      <div aria-hidden className="aurora">
        <span className="left-[8%] top-[15%] w-[30vw] h-[30vw] bg-emerald-200" />
        <span className="left-[58%] top-[30%] w-[26vw] h-[26vw] bg-violet-200" style={{ animationDelay: '-7s' }} />
      </div>
      <div aria-hidden className="absolute left-1/2 lg:left-[27%] top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {[0, 1, 2].map((k) => (
          <motion.div key={k} className="absolute left-1/2 top-1/2 w-[32.5rem] h-[32.5rem] -ml-[16.25rem] -mt-[16.25rem] rounded-full border border-acc/20"
            animate={{ scale: [0.3, 1.4], opacity: [0.6, 0] }} transition={{ duration: 4.5, repeat: Infinity, delay: k * 1.5, ease: 'easeOut' }} />
        ))}
      </div>
      <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-10 lg:gap-14 items-center">
        <motion.div className="text-center lg:text-left"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE }}>
          <p className="font-geist-mono text-sm md:text-base text-acc/95 tracking-[0.25em]">07 / CONTACT</p>
          <h2 className="font-museo text-[2.5rem] md:text-[3.4rem] xl:text-[3.9rem] leading-[1.04] tracking-tight mt-5 text-fg/90 text-balance">
            Let's build something that <span className="text-gradient">ships.</span>
          </h2>
          <p className="font-oxanium text-lg text-fg/70 mt-5 max-w-md mx-auto lg:mx-0 text-pretty">
            Working on AI backends, LLM pipelines or a product that needs both? Write, call or message me.
          </p>
          <p className="mt-6 flex flex-col items-center lg:items-start gap-2 font-geist-mono text-xs tracking-wider text-fg/60">
            <span className="inline-flex items-center gap-2"><span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-acc animate-ping" /><span className="relative w-2 h-2 rounded-full bg-acc" /></span>Open to conversations</span>
            <span className="inline-flex items-center gap-2"><Icon name="clock" className="w-3.5 h-3.5" /> <IndiaTime /> in India (IST, UTC+5:30)</span>
          </p>
        </motion.div>

        <div className="flex flex-col gap-4">
          <ContactCard accent="emerald" icon="mail" label="Email" value={profile.email}>
            <MailPicker email={profile.email} label={`Write to ${profile.email}`} side="down" className={actionBtn}>
              <Icon name="mail" className="w-4 h-4" /> WRITE
            </MailPicker>
            <CopyButton value={profile.email} label="Copy email address" />
          </ContactCard>
          <ContactCard accent="cyan" icon="phone" label="Phone · WhatsApp" value={profile.phone}>
            <a href={profile.phoneHref} className={actionBtn}><Icon name="phone" className="w-4 h-4" /> CALL</a>
            <a href={profile.whatsapp} target="_blank" rel="noopener noreferrer" className={actionBtn}><Icon name="chat" className="w-4 h-4" /> WHATSAPP</a>
            <CopyButton value={profile.phone} label="Copy phone number" />
          </ContactCard>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            {cards.map((c) => (
              <li key={c.label}>
                <a href={c.href} target="_blank" rel="noopener noreferrer" onMouseMove={spotlight} style={acVar('emerald')}
                  className="card spotlight group relative flex items-center gap-3 rounded-2xl border border-fg/[0.08] p-4 hover:border-acc/40 transition-colors">
                  <span className="w-10 h-10 shrink-0 rounded-xl border border-fg/10 flex items-center justify-center text-fg/75 group-hover:text-acc transition-colors">
                    <Icon name={c.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-oxanium font-semibold text-fg/90">{c.label}</span>
                    <span className="block font-geist-mono text-[0.6875rem] text-fg/65 truncate">{c.sub}</span>
                  </span>
                  <span aria-hidden className="ml-auto text-fg/40 group-hover:text-acc group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-fg/[0.06] px-5 md:px-10 py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 font-geist-mono text-xs text-fg/65">
        <span>© 2026 Shailesh Upadhyay · Based in {profile.location}</span>
        <a href="#home" className="py-2 hover:text-acc transition-colors">Back to top ↑</a>
      </div>
    </footer>
  )
}

/* ====== APP ====== */
export default function App() {
  const [ready, setReady] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [intro, setIntro] = useState(!ready)
  const open = useCallback(() => setReady(true), [])
  const done = useCallback(() => setIntro(false), [])
  const [revealed, setRevealed] = useState(false)
  const lenis = useRef<Lenis | null>(null)
  useEffect(() => {
    if (!ready) return
    const l = new Lenis({ autoRaf: true, anchors: true }) // offset comes from section[id] scroll-margin-top
    lenis.current = l
    // The page only exists once the intro ends, so the browser couldn't honour a link like /#products on its own.
    if (location.hash) l.scrollTo(location.hash, { immediate: true })
    return () => { l.destroy(); lenis.current = null }
  }, [ready])
  const scrollTo = (y: number, seconds: number) =>
    lenis.current?.scrollTo(y, seconds ? { duration: seconds, easing: (t) => t } : { immediate: true })
  return (
    <MotionConfig reducedMotion="user">
      {intro && <Intro onOpen={open} onDone={done} />}
      {ready && (
        <>
          <a href="#main" className="skip-link">Skip to content</a>
          {!revealed && <BlackholeOverlay onDone={() => setRevealed(true)} />}
          <BuildLayer scrollTo={scrollTo} />
          <Navbar />
          <main id="main">
            <Hero />
            <About />
            <Experience />
            <Products />
            <Projects />
            <Skills />
            <Education />
            <Contact />
          </main>
          <Footer />
        </>
      )}
    </MotionConfig>
  )
}
