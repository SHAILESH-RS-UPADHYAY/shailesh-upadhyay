import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'

/* ====== LOADING SCREEN — Multi-Color Gradient ====== */
function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'bars' | 'welcome' | 'done'>('bars')
  const gradientColors = ['#34d399', '#22d3ee', '#a78bfa', '#fb7185', '#f59e0b']
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('welcome'), 1000)
    const t2 = setTimeout(() => setPhase('done'), 2800)
    const t3 = setTimeout(onDone, 3600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])
  if (phase === 'done') return null
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black overflow-hidden">
      {phase === 'bars' && (
        <div className="flex items-end gap-[2px] h-16">
          {Array.from({ length: 40 }).map((_, i) => {
            const delay = i * 0.04
            const color = gradientColors[i % gradientColors.length]
            return (
              <div key={i} className="w-[2px] rounded-full" style={{
                height: '4px', backgroundColor: color,
                animation: 'loadingBar 1s ease-in-out infinite',
                animationDelay: `${delay}s`,
                transformOrigin: 'bottom',
              }} />
            )
          })}
        </div>
      )}
      {phase === 'welcome' && (
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative">
            <div className="text-5xl md:text-6xl lg:text-7xl font-oxanium font-bold tracking-widest">
              {'Hi, Welcome'.split('').map((ch, i) => {
                const color = gradientColors[i % gradientColors.length]
                return (
                  <motion.span key={i} className="inline-block"
                    initial={{ opacity: 0, y: 50, rotateX: -90, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                    transition={{ delay: i * 0.07, duration: 0.6, type: 'spring', stiffness: 180 }}
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${gradientColors[(i + 1) % gradientColors.length]})`,
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      filter: `drop-shadow(0 0 12px ${color}60)`,
                      whiteSpace: ch === ' ' ? 'pre' : 'normal'
                    }}>
                    {ch === ' ' ? '\u00A0' : ch}
                  </motion.span>
                )
              })}
            </div>
            <motion.div className="absolute -inset-6 rounded-3xl"
              animate={{
                boxShadow: [
                  '0 0 40px rgba(52,211,153,0.12), 0 0 80px rgba(34,211,238,0.06)',
                  '0 0 40px rgba(167,139,250,0.12), 0 0 80px rgba(251,113,133,0.06)',
                  '0 0 40px rgba(52,211,153,0.12), 0 0 80px rgba(34,211,238,0.06)',
                ]
              }}
              transition={{ duration: 2.5, repeat: Infinity }} />
          </div>
          <motion.div className="font-geist-mono text-sm tracking-wider"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
            <span className="text-emerald-400/40">{'>'}</span>{' '}
            <span className="text-white/25">initializing portfolio</span>
            <motion.span className="text-emerald-400/60" animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }}>█</motion.span>
          </motion.div>
        </div>
      )}
    </div>
  )
}

/* ====== BLACKHOLE OVERLAY ====== */
function BlackholeOverlay({ revealed, onRevealed }: { revealed: boolean; onRevealed?: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-[9999] pointer-events-none" initial={false}
      animate={{ background: revealed ? 'radial-gradient(circle at center, transparent 100%, black 100%)' : 'radial-gradient(circle at center, transparent 0%, black 100%)' }}
      transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.3 }}
      onAnimationComplete={() => revealed && onRevealed?.()} />
  )
}

/* ====== FLOATING WRAPPER ====== */
function Float({ children, delay = 0, intensity = 6 }: { children: React.ReactNode; delay?: number; intensity?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -intensity, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {children}
    </motion.div>
  )
}

/* ====== NAVBAR — Full-width Professional Layout ====== */
function Navbar({ visible }: { visible: boolean }) {
  const links = [
    { label: 'Home', href: '#home' },
    { label: 'Experience', href: '#experience' },
    { label: 'Projects', href: '#projects' },
    { label: 'Skills', href: '#skills' },
  ]
  const [active, setActive] = useState('home')
  return (
    <motion.nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/[0.05]"
      initial={{ y: -100, opacity: 0 }} animate={visible ? { y: 0, opacity: 1 } : {}} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1.5 }}>
      <div className="relative w-full px-8 md:px-12 lg:px-16 py-4 flex items-center justify-between">
        {/* Brand */}
        <a href="#home" onClick={(e) => { e.preventDefault(); setActive('home'); document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' }) }}
          className="font-museo text-2xl font-bold tracking-wider relative z-10">
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SHAILESH
          </span>
        </a>

        {/* Absolutely Centered Links */}
        <div className="hidden lg:flex items-center gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {links.map((l) => (
            <a key={l.label} href={l.href} onClick={(e) => {
              e.preventDefault(); setActive(l.label.toLowerCase())
              document.querySelector(l.href)?.scrollIntoView({ behavior: 'smooth' })
            }}>
              <motion.div
                className={`relative px-5 py-2 rounded-lg font-oxanium text-sm tracking-wide transition-all duration-300 ${
                  active === l.label.toLowerCase()
                    ? 'text-white font-medium'
                    : 'text-white/40 hover:text-white/70'
                }`}
                whileHover={{ scale: 1.04 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {active === l.label.toLowerCase() && (
                  <motion.div className="absolute inset-0 rounded-lg" layoutId="navBg"
                    style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(34,211,238,0.06))', border: '1px solid rgba(52,211,153,0.12)' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{l.label}</span>
              </motion.div>
            </a>
          ))}
        </div>

        {/* Contact CTA */}
        <a href="#connect" className="relative z-10" onClick={(e) => { e.preventDefault(); setActive('contact'); document.querySelector('#connect')?.scrollIntoView({ behavior: 'smooth' }) }}>
          <motion.button
            className="relative px-7 py-2.5 rounded-xl font-oxanium text-sm font-medium tracking-wide text-white overflow-hidden cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{
              background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(34,211,238,0.1))',
              border: '1px solid rgba(52,211,153,0.2)',
            }}
          >
            Contact
          </motion.button>
        </a>
      </div>
    </motion.nav>
  )
}

/* ====== GLITCH CARD ====== */
function GlitchCard({ title, subtitle, icon, lines, accent = 'emerald', onRevealed }: {
  title: string; subtitle: string; icon: string; lines: string[]; accent?: 'emerald' | 'cyan' | 'amber' | 'rose'; onRevealed?: () => void
}) {
  const [state, setState] = useState<'idle' | 'glitching' | 'typing' | 'revealed'>('idle')
  const [typedLines, setTypedLines] = useState<string[]>([])
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const accentMap = {
    emerald: { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/[0.04]', glow: 'rgba(52,211,153,0.15)' },
    cyan: { text: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/[0.04]', glow: 'rgba(34,211,238,0.15)' },
    amber: { text: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/[0.04]', glow: 'rgba(251,191,36,0.15)' },
    rose: { text: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/[0.04]', glow: 'rgba(251,113,133,0.15)' },
  }
  const ac = accentMap[accent]
  const fullText = lines.join('\n')
  function startReveal() {
    if (state !== 'idle') return
    setState('glitching')
    setTimeout(() => {
      setState('typing'); setTypedLines([])
      let charIdx = 0
      typingRef.current = setInterval(() => {
        if (charIdx >= fullText.length) { clearInterval(typingRef.current!); setState('revealed'); onRevealed?.(); return }
        const ch = fullText[charIdx]; charIdx++
        if (ch === '\n') { setTypedLines(prev => [...prev, '']) }
        else { setTypedLines(prev => { const c = [...prev]; if (!c.length) c.push(''); c[c.length - 1] += ch; return c }) }
      }, 18)
    }, 600)
  }
  useEffect(() => { return () => { if (typingRef.current) clearInterval(typingRef.current) } }, [])
  return (
    <motion.div className={`relative cursor-pointer select-none ${state === 'idle' ? 'hover:border-white/20' : ''}`}
      onClick={startReveal} whileHover={state === 'idle' ? { scale: 1.015 } : {}} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
      <AnimatePresence>
        {state === 'idle' && (
          <motion.div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 md:p-8 transition-colors duration-500 w-full"
            initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 text-left w-full">
              <div className="flex-1 min-w-0">
                {icon && <div className="text-4xl md:text-5xl text-white/10 mb-4">{icon}</div>}
                <h3 className="font-museo text-xl md:text-2xl font-bold text-white/80 mb-2 truncate whitespace-normal">{title}</h3>
                <p className="font-oxanium text-sm md:text-base text-white/30 whitespace-normal">{subtitle}</p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                <span className={`font-geist-mono text-[10px] tracking-widest uppercase ${ac.text}`}>CLICK TO REVEAL</span>
                <div className={`w-8 h-8 rounded-full border ${ac.border} flex items-center justify-center`}>
                  <span className={`${ac.text} text-sm`}>→</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {state === 'glitching' && (
        <motion.div className="bg-black border border-emerald-500/30 rounded-2xl p-6 md:p-8 w-full"
          animate={{ x: [0, -4, 4, -2, 2, 0], opacity: [1, 0.3, 1, 0.5, 1, 1] }} transition={{ duration: 0.5, ease: 'linear' }}>
          <div className="font-geist-mono text-emerald-400/80 text-lg">ACCESSING DATA...
            <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>█</motion.span>
          </div>
        </motion.div>
      )}
      {(state === 'typing' || state === 'revealed') && (
        <motion.div className="bg-black border border-emerald-500/30 rounded-2xl p-6 md:p-8 w-full text-left"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" /><div className="w-3 h-3 rounded-full bg-yellow-500/60" /><div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="font-geist-mono text-xs text-white/20 ml-2">{title.toLowerCase().replace(/\s+/g, '-')}.data</span>
          </div>
          <div className="font-geist-mono text-sm md:text-base space-y-2 min-h-[120px]">
            {typedLines.map((line, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-emerald-500/40 shrink-0">{i === 0 ? '$' : ' '}</span>
                <span className="text-white/60">{line}</span>
              </div>
            ))}
            {state === 'typing' && (
              <div className="flex gap-3"><span className="text-emerald-500/40 shrink-0">$</span>
                <motion.span className="text-emerald-400" animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }}>█</motion.span>
              </div>
            )}
          </div>
          {state === 'revealed' && (
            <motion.button className={`mt-8 px-5 py-2 rounded-lg text-xs font-geist-mono tracking-widest border ${ac.border} ${ac.text} hover:bg-white/5 transition-colors`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              onClick={(e) => { e.stopPropagation(); setState('idle'); setTypedLines([]) }}>
              [ CLOSE ]
            </motion.button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

/* ====== SECTION HEADER ====== */
function SectionHeader({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center justify-center gap-5 mb-12">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" />
      <span className="font-geist-mono text-base text-emerald-400/50 tracking-widest whitespace-nowrap">{number} — {label}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" />
    </div>
  )
}

/* ====== HERO — Complete Redesign ====== */
const languageNames: Record<number, string> = {
  0: 'EN', 1: 'HI', 2: 'JP', 3: 'KO', 4: 'EN', 5: 'HI',
}

function HeroSection() {
  const languages = ['SHAILESH', 'शैलेश', 'シャーリーシュ', '샤일레시', 'SHAILESH', 'शाइलेश']
  const [langIdx, setLangIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setLangIdx(prev => (prev + 1) % languages.length), 2200)
    return () => clearInterval(interval)
  }, [])

  const gradientStyle = useMemo(() => ({
    background: 'linear-gradient(135deg, #34d399 0%, #22d3ee 30%, #a78bfa 60%, #fb7185 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }), [])

  return (
    <section id="home" className="relative min-h-screen overflow-hidden flex items-center">
      {/* Grid overlay — matching DIVFLIX style */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(to right, rgba(38,38,38,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(38,38,38,0.6) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
      {/* Center vignette */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black" style={{
        maskImage: 'radial-gradient(ellipse at center, transparent 20%, black)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 20%, black)',
      }} />

      <div className="relative z-10 w-full px-8 md:px-12 lg:px-16 py-32">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

          {/* Left: Greeting + Name + Bio + Resume + Contact */}
          <div className="flex-1 flex flex-col gap-6">

            {/* "Hi, I'm" greeting */}
            <motion.div
              className="font-oxanium text-lg md:text-xl lg:text-2xl text-white/40 tracking-wide"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
            >
              Hi, I'm
            </motion.div>

            {/* Name with cycling languages + superscript label */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
            >
              <Float delay={0} intensity={4}>
                <div className="relative inline-block">
                  <div className="font-museo text-[3.5rem] md:text-[5rem] lg:text-[6.5rem] leading-[0.9] tracking-tight">
                    <AnimatePresence mode="wait">
                      <motion.span key={langIdx}
                        initial={{ opacity: 0, y: 40, filter: 'blur(10px)', scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                        exit={{ opacity: 0, y: -40, filter: 'blur(10px)', scale: 0.9 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="block"
                        style={gradientStyle}
                      >
                        {languages[langIdx]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  {/* Superscript language label */}
                  <motion.div
                    className="absolute -top-1 -right-6 md:-right-8 font-geist-mono text-[8px] md:text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded-md"
                    style={{
                      background: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(34,211,238,0.2))',
                      border: '1px solid rgba(52,211,153,0.25)',
                      color: '#34d399',
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {languageNames[langIdx]}
                  </motion.div>
                  {/* "UPADHYAY" below */}
                  <div className="font-museo text-[2rem] md:text-[2.8rem] lg:text-[3.5rem] leading-[0.9] tracking-tight text-white/20 mt-1">
                    UPADHYAY
                  </div>
                </div>
              </Float>
            </motion.div>

            {/* Bio text */}
            <motion.p
              className="font-oxanium text-sm md:text-base lg:text-[15px] text-white/35 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1.1 }}
            >
              CS grad with an AI/ML background who loves building things that don't break at 3 AM. Backend systems, CI/CD pipelines, and automating everything I can get my hands on — that's my thing. Curious about AI research, comfortable with Python, SQL, Linux, and cloud. I ship stuff that works.
            </motion.p>

            {/* Resume Box */}
            <Float delay={0.4} intensity={5}>
              <motion.a
                href="https://drive.google.com/file/d/1Xsp7-PNJrwxLjrFg5ZQTvgmGEn6PRcM8/view?usp=sharing" target="_blank" rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl px-8 py-5 hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(52,211,153,0.06)]"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1.4 }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/[0.04] via-cyan-500/[0.04] to-purple-500/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors duration-300">
                  <svg className="w-5 h-5 text-white/50 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <div className="font-oxanium text-base font-semibold text-white/60 group-hover:text-white/80 transition-colors">View Resume</div>
                  <div className="font-geist-mono text-[10px] text-white/20 mt-0.5 tracking-wider">OPEN IN DRIVE ↗</div>
                </div>
                <div className="relative z-10 ml-4 text-white/20 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300">→</div>
              </motion.a>
            </Float>


          </div>

          {/* Right: Profile Picture — slides from right */}
          <motion.div
            className="relative lg:w-[360px] xl:w-[400px] shrink-0"
            initial={{ opacity: 0, x: 150 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1.0 }}
          >
            <Float delay={0.2} intensity={7}>
              <div className="relative group">
                {/* Multi-color outer glow */}
                <div className="absolute -inset-1 rounded-3xl opacity-50 group-hover:opacity-90 transition-opacity duration-700" style={{
                  background: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(34,211,238,0.15), rgba(167,139,250,0.15), rgba(251,113,133,0.1))',
                  filter: 'blur(12px)'
                }} />
                <div className="absolute -inset-3 rounded-3xl opacity-25 group-hover:opacity-50 transition-opacity duration-700" style={{
                  background: 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(167,139,250,0.1))',
                  filter: 'blur(24px)'
                }} />

                {/* Main image box */}
                <div className="relative bg-black/40 border border-white/[0.08] rounded-3xl overflow-hidden group-hover:border-white/15 transition-colors duration-500">
                  <img src={`${import.meta.env.BASE_URL}profile.png`} alt="Shailesh Upadhyay" className="w-full h-auto object-cover object-top"
                    style={{ filter: 'grayscale(20%) contrast(1.05) brightness(0.95)' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* Corner accents */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={{ borderColor: '#34d399' }} />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={{ borderColor: '#22d3ee' }} />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={{ borderColor: '#a78bfa' }} />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 rounded-br-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={{ borderColor: '#fb7185' }} />

                {/* Floating badge */}
                <motion.div
                  className="absolute -bottom-3 -right-3 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                >
                  <span className="font-geist-mono text-[10px] tracking-wider" style={{
                    background: 'linear-gradient(135deg, #34d399, #22d3ee)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                  }}>ML ENGINEER</span>
                </motion.div>
              </div>
            </Float>
          </motion.div>
        </div>
      </div>



      {/* Bottom left info */}
      <div className="absolute bottom-6 left-6 font-geist-mono text-[10px] text-white/12 tracking-widest">
        <div>BASED IN INDIA</div>
        <div>2026</div>
      </div>
    </section>
  )
}

/* ====== ABOUT — Centered Layout ====== */
function AboutSection() {
  return (
    <section id="about" className="relative py-48 px-6 md:px-20 lg:px-32 text-center">
      <div className="max-w-5xl mx-auto">
        <SectionHeader number="02" label="ABOUT" />
        <motion.div className="text-center" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <h2 className="font-museo text-[3rem] md:text-[4.5rem] lg:text-[6rem] leading-[0.9] tracking-tight mb-8">
            I build<br /><span className="text-emerald-400/70">systems</span><br />that think.
          </h2>
          <p className="font-oxanium text-xl md:text-2xl text-white/50 leading-relaxed max-w-2xl mx-auto mb-12">
            ML Engineer who thinks in Python, dreams in neural networks, and believes the best AI isn't the most complex — it's the one that actually ships.
          </p>
        </motion.div>
        <motion.div className="space-y-6 max-w-2xl mx-auto" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
          <div className="bg-black/60 border border-white/10 rounded-xl overflow-hidden text-left">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 font-geist-mono text-[11px] text-white/25">whoami</span>
            </div>
            <div className="p-5 font-geist-mono text-sm space-y-1.5">
              <div className="flex gap-2"><span className="text-emerald-500/60">$</span><span className="text-white/70">cat /etc/resume</span></div>
              <div className="pl-4 text-white/40">{'>'} ML Engineer @ FAR Labs / Dizzaract</div>
              <div className="pl-4 text-white/40">{'>'} Digital Twin · LSTM · PPO · ONNX/TensorRT</div>
              <div className="pl-4 text-white/40">{'>'} Python 95% · C++ 60% · Git 75%</div>
              <div className="pl-4 text-emerald-400/50">{'>'} "Perceive. Design. Build."</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ value: '12+', label: 'Projects' }, { value: '8', label: 'Models Trained' }, { value: '<15ms', label: 'Inference Time' }, { value: 'PY/JS/TS', label: 'Languages' }].map((s) => (
              <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 text-center">
                <div className="font-museo text-3xl md:text-4xl text-emerald-400/70">{s.value}</div>
                <div className="font-geist-mono text-xs text-white/25 mt-2 tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ====== SEQUENTIAL REVEAL CARDS ====== */
function SequentialCards<T extends { title: string; subtitle: string; icon: string; lines: string[]; accent: 'emerald' | 'cyan' | 'amber' | 'rose' }>({
  items, cols = 1
}: {
  items: T[]; cols?: 1 | 2 | 3
}) {
  const [revealed, setRevealed] = useState(0)

  return (
    <div className={`grid grid-cols-1 ${cols === 2 ? 'md:grid-cols-2' : ''} ${cols === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-6 md:gap-8 w-full`}>
      {items.map((item, i) => (
        <AnimatePresence key={item.title}>
          {i <= revealed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: i === revealed ? 0 : 0 }}>
              <GlitchCard {...item} onRevealed={() => {
                if (i === revealed && revealed < items.length - 1) {
                  setRevealed(prev => prev + 1)
                }
              }} />
            </motion.div>
          )}
        </AnimatePresence>
      ))}
    </div>
  )
}

/* ====== EXPERIENCE ====== */
const experienceData = [
  {
    title: 'ML Engineer', subtitle: 'FAR Labs / Dizzaract · Feb 2026 – Mar 2026', icon: '', accent: 'emerald' as const, lines: [
      'ROLE: ML Engineer — Player Behavior Cloning', '', 'DESIGNED 4 SUB-MODELS:',
      '  → Aim LSTM         — Predicts target acquisition patterns', '  → Movement Transformer — Clones navigation & positioning',
      '  → Tactical MLP     — Decision-making under pressure', '  → Style Discriminator — Validates twin realism', '',
      'TRAINED IDM to pseudo-label 500+ hours of gameplay data', 'PPO fine-tuning for adaptive in-game behavior',
      'ONNX/TensorRT export achieving <15ms inference', 'Style discriminator <58% accuracy — near-indistinguishable digital twin', '',
      'STACK: PyTorch · LSTM · Transformer · PPO · ONNX · TensorRT',
    ]},
  {
    title: 'Data Analytics Intern', subtitle: 'Labmentix · Nov 2025 – Dec 2025', icon: '', accent: 'cyan' as const, lines: [
      'ROLE: Data Analytics Intern — Pipeline Optimization', '', 'KEY ACHIEVEMENTS:',
      '  → Processed 10,000+ rows using Python/Pandas', '  → Improved data quality by 35%',
      '  → Automated 5 reporting workflows — saved 8 hrs/week', '  → Optimized ETL pipelines — reduced latency by 40%', '',
      'STACK: Python · Pandas · ETL · SQL',
    ]},
  {
    title: 'AI Developer', subtitle: 'LÜQ · 2025', icon: '', accent: 'rose' as const, lines: [
      'ROLE: Freelance AI Developer — Emotion Engine', '', 'KEY ACHIEVEMENTS:',
      '  → Built custom sentiment engine detecting 7 emotional states', '  → Custom NLP pipeline with transformer backbone',
      '  → Real-time inference for conversational agents', '  → Shipped from concept to prototype in rapid cycles', '',
      'STACK: Python · NLP · Transformers · FastAPI',
    ]},
]

function ExperienceSection() {
  return (
    <section id="experience" className="relative py-32 md:py-48 px-6 md:px-12 lg:px-24 border-t border-white/[0.04] text-center flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
        <SectionHeader number="03" label="EXPERIENCE" />
        <p className="font-oxanium text-lg text-white/30 mb-12 max-w-xl mx-auto">Unlock each role one at a time.</p>
        <SequentialCards items={experienceData} cols={3} />
      </div>
    </section>
  )
}

/* ====== EDUCATION — Centered ====== */
function EducationSection() {
  return (
    <section className="relative py-32 md:py-48 px-6 md:px-12 lg:px-24 border-t border-white/[0.04] text-center flex flex-col items-center">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        <SectionHeader number="04" label="EDUCATION" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl mx-auto">
          <motion.div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 md:p-10 hover:border-white/15 transition-colors duration-500"
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}>
            <div className="font-geist-mono text-xs text-emerald-400/50 tracking-widest mb-3">2022 – 2026</div>
            <h3 className="font-oxanium text-xl md:text-2xl font-bold text-white/80 mb-2">B.Tech Computer Science</h3>
            <p className="font-oxanium text-base text-white/40">Specialization in Machine Learning & AI</p>
          </motion.div>
          <motion.div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 md:p-10 hover:border-white/15 transition-colors duration-500"
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.34, 1.56, 0.64, 1] }}>
            <div className="font-geist-mono text-xs text-cyan-400/50 tracking-widest mb-3">CERTIFICATIONS</div>
            <h3 className="font-oxanium text-xl md:text-2xl font-bold text-white/80 mb-2">Deep Learning Specialization</h3>
            <p className="font-oxanium text-base text-white/40">Andrew Ng · Coursera</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ====== SKILLS ====== */
const skillData = [
  { title: 'Deep Learning', subtitle: 'Neural Network Architectures', icon: '⟁', accent: 'emerald' as const, lines: [
    'LSTM / GRU — Sequence modeling for player behavior cloning', 'Transformers — Attention-based architectures',
    'CNNs — Image recognition and feature extraction', 'GANs — Style discriminators for digital twin validation',
    '500+ hours of gameplay data processed and labeled', 'Sub-15ms inference latency via TensorRT optimization',
  ]},
  { title: 'Languages', subtitle: 'Core Tech Stack', icon: '{}', accent: 'cyan' as const, lines: [
    'Python  — 95% — Primary language for ML/AI development', 'C++     — 60% — Performance-critical model inference',
    'SQL     — 75% — Data querying and pipeline management', 'TypeScript — 70% — Full-stack prototyping & APIs',
    'Bash    — 70% — Automation scripts and deployment',
  ]},
  { title: 'Frameworks', subtitle: 'Tools & Libraries', icon: '', accent: 'amber' as const, lines: [
    'PyTorch   — Core framework for model development', 'ONNX      — Model export and cross-platform deployment',
    'TensorRT  — GPU-accelerated inference optimization', 'Pandas    — Data manipulation and analysis',
    'FastAPI   — High-performance API development', 'Ray       — Distributed reinforcement learning',
  ]},
  { title: 'Domains', subtitle: 'Areas of Expertise', icon: '◎', accent: 'rose' as const, lines: [
    'Digital Twin   — Player behavior cloning & simulation', 'Reinforcement Learning — PPO agents for adaptive AI',
    'NLP / Emotion AI — 7-state sentiment detection', 'Data Engineering — ETL pipelines, 40% latency reduction',
    'MLOps — Model monitoring, versioning, deployment',
  ]},
]

function SkillsSection() {
  return (
    <section id="skills" className="relative py-32 md:py-48 px-6 md:px-12 lg:px-24 border-t border-white/[0.04] text-center flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        <SectionHeader number="05" label="SKILLS" />
        <p className="font-oxanium text-lg text-white/30 mb-12 max-w-xl mx-auto">Master a skill to unlock the next one.</p>
        <SequentialCards items={skillData} cols={2} />
      </div>
    </section>
  )
}

/* ====== PROJECTS ====== */
const projectData = [
  { title: 'Digital Twin Agent', subtitle: 'Game AI — FAR Labs / Dizzaract', icon: '', accent: 'emerald' as const, lines: [
    'PROJECT: Player Behavior Cloning — Digital Twin Agent', '', 'DESIGNED 4 SUB-MODELS:',
    '  → Aim LSTM         — Predicts target acquisition patterns', '  → Movement Trans.  — Clones navigation & positioning',
    '  → Tactical MLP     — Decision-making under pressure', '  → Style Discrim.   — Validates twin realism', '',
    'TRAINED IDM to pseudo-label 500+ hours of gameplay data', 'PPO fine-tuning for adaptive in-game behavior',
    'ONNX/TensorRT export achieving <15ms inference', 'Style discriminator <58% accuracy — near-indistinguishable', '',
    'STACK: PyTorch · LSTM · Transformer · PPO · TensorRT',
  ]},
  { title: 'AutoFlow', subtitle: 'Workflow Automation Engine', icon: '', accent: 'cyan' as const, lines: [
    'PROJECT: AutoFlow — Automated Data Pipeline', '', 'BUILT end-to-end automation for data processing',
    '  → Ingest → Clean → Transform → Load → Report', '',
    'PROCESSED 10,000+ rows with 35% quality improvement', 'AUTOMATED 5 reporting workflows — saved 8 hrs/week',
    'OPTIMIZED ETL pipelines — 40% latency reduction', '', 'STACK: Python · Pandas · SQL · ETL · Airflow',
  ]},
  { title: 'RADAR Sim', subtitle: 'Sensor Simulation & Tracking', icon: '', accent: 'amber' as const, lines: [
    'PROJECT: RADAR — Sensor Simulation System', '', 'BUILT real-time RADAR simulation environment',
    '  → Object detection and tracking algorithms', '  → Signal processing pipeline',
    '  → Multi-target tracking with Kalman filters', '',
    'ACHIEVED real-time performance with optimized C++ backend', 'INTEGRATED with Python ML layer for classification', '',
    'STACK: C++ · Python · Kalman Filter · Signal Processing',
  ]},
  { title: 'Emotion Engine', subtitle: 'NLP — LÜQ Japan Client', icon: '', accent: 'rose' as const, lines: [
    'PROJECT: Emotion Engine — Sentiment Analysis', '', 'BUILT custom sentiment engine for Japanese client at LÜQ',
    '  → Detects 7 emotional states from text input', '  → Custom NLP pipeline with transformer backbone',
    '  → Real-time inference for conversational agents', '',
    'SHIPPED from concept to prototype in rapid cycles', 'DEPLOYED with FastAPI backend for production use', '',
    'STACK: Python · Transformers · FastAPI · NLP',
  ]},
]

function ProjectsSection() {
  return (
    <section id="projects" className="relative py-32 md:py-48 px-6 md:px-12 lg:px-24 border-t border-white/[0.04] text-center flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        <SectionHeader number="06" label="PROJECTS" />
        <p className="font-oxanium text-lg text-white/30 mb-12 max-w-xl mx-auto">Click any project to reveal full details.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projectData.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}>
              <GlitchCard {...p} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ====== CONNECT — Clean & Aligned ====== */
function ConnectSection() {
  return (
    <section id="connect" className="relative py-40 px-6 md:px-20 lg:px-32 border-t border-white/[0.05] text-center">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="font-geist-mono text-[10px] md:text-xs text-emerald-400/40 mb-5 tracking-[0.2em] uppercase">READY TO BUILD?</div>
          <h2 className="font-museo text-[2.5rem] md:text-[3.5rem] leading-tight tracking-tight mb-8">
            Let's <span className="text-emerald-400/50">connect</span>
          </h2>
          <a href="mailto:shaileshrsupdhyay@gmail.com" className="inline-block font-oxanium text-base md:text-lg text-white/35 hover:text-white transition-colors duration-300 border-b border-white/10 hover:border-white/30 pb-0.5">
            shaileshrsupdhyay@gmail.com
          </a>
          <div className="flex items-center justify-center gap-6 mt-10">
            <a href="https://github.com/SHAILESH-RS-UPADHYAY" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-geist-mono text-xs tracking-widest text-white/20 hover:text-emerald-400 transition-colors duration-300 uppercase">
              <span className="w-5 h-5 rounded border border-white/10 flex items-center justify-center text-[10px]">&lt;/&gt;</span>
              GitHub
            </a>
            <span className="text-white/8 text-[10px]">·</span>
            <a href="https://linkedin.com/in/shailesh-upadhyay-6a112624a" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-geist-mono text-xs tracking-widest text-white/20 hover:text-emerald-400 transition-colors duration-300 uppercase">
              <span className="w-5 h-5 rounded border border-white/10 flex items-center justify-center text-[10px]">in</span>
              LinkedIn
            </a>
          </div>
          <div className="font-geist-mono text-[9px] text-white/8 tracking-[0.2em] mt-16">SHAILESH UPADHYAY · 2026</div>
        </motion.div>
      </div>
    </section>
  )
}

/* ====== MAIN APP ====== */
export default function App() {
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [blackholeDone, setBlackholeDone] = useState(false)
  const lenisRef = useRef<Lenis | null>(null)
  useEffect(() => {
    if (!loading) {
      document.body.style.overflow = ''
      const t = setTimeout(() => {
        setLoaded(true)
        const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 1 })
        lenisRef.current = lenis
        function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf) }
        requestAnimationFrame(raf)
      }, 500)
      return () => clearTimeout(t)
    } else { document.body.style.overflow = 'hidden' }
  }, [loading])
  useEffect(() => { return () => { lenisRef.current?.destroy() } }, [])
  return (
    <>
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}
      <div style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.5s' }}>
        {!blackholeDone && <BlackholeOverlay revealed={loaded} onRevealed={() => setBlackholeDone(true)} />}
        <Navbar visible={blackholeDone} />
        <main>
          <HeroSection />
          <AboutSection />
          <ExperienceSection />
          <EducationSection />
          <SkillsSection />
          <ProjectsSection />
          <ConnectSection />
        </main>
      </div>
    </>
  )
}
