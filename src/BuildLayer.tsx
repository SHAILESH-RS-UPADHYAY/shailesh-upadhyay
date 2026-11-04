import { useEffect, useRef, useState } from 'react'
import { startBuild, type Status } from './build'

const AVATARS = ['#34d399', '#22d3ee', '#a78bfa', '#fb7185', '#fbbf24']
const pillBtn = 'px-2.5 py-1 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/30 active:scale-95 transition cursor-pointer whitespace-nowrap'

function readBuilt() {
  try { return sessionStorage.getItem('built') === '1' } catch { return false }
}

// The canvas the build is drawn on, and the status pill. `scrollTo` comes from the page's smooth scroller.
export default function BuildLayer({ scrollTo }: { scrollTo: (y: number, seconds: number) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const engine = useRef<ReturnType<typeof startBuild> | null>(null)
  const [status, setStatus] = useState<Status | null>(null)
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('nobuild')) return
    const e = startBuild(c, setStatus, readBuilt())
    engine.current = e
    return () => { e.stop(); engine.current = null }
  }, [])

  const watch = () => {
    const height = document.documentElement.scrollHeight - innerHeight
    scrollTo(height, Math.max(25, height / 420))
  }
  const replay = () => {
    scrollTo(0, 0)
    setClosed(false)
    engine.current?.replay()
  }

  const s = status
  const done = s?.phase === 'done'
  const pct = s && s.total ? s.done / s.total : 0
  const state = s?.phase === 'scan' ? 'Scanning' : s?.phase === 'build' ? 'Building' : 'Waiting'

  return (
    <>
      <canvas ref={canvas} aria-hidden className="fixed inset-0 z-[55] pointer-events-none" />
      {s && !closed && (
        <div role="status" aria-label="Page build status"
          className="screen fixed z-[56] bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 max-w-[calc(100vw-1rem)] flex items-center gap-2 md:gap-3 rounded-full border border-white/10 bg-[#080b0a]/90 backdrop-blur-md shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)] pl-3 pr-2 py-1.5 font-geist-mono text-[0.6875rem] text-white/80">
          {done ? (
            <span className="whitespace-nowrap">
              {s.skipped || !s.seconds
                ? <>Page built</>
                : <><span className="hidden sm:inline">Built by {s.agents} agents in </span><span className="sm:hidden">Built in </span>{s.seconds.toFixed(1)}s</>}
            </span>
          ) : (
            <>
              <span aria-hidden className="hidden sm:flex -space-x-1.5">
                {AVATARS.map((c) => <span key={c} className="w-3.5 h-3.5 rounded-full border border-[#080b0a]" style={{ background: c }} />)}
              </span>
              <span className="whitespace-nowrap hidden md:inline">{s.agents} agents</span>
              <span className="whitespace-nowrap tabular-nums">{s.done} / {s.total}<span className="hidden sm:inline"> layers</span></span>
              <span aria-hidden className="block w-10 md:w-16 h-[3px] rounded-full bg-white/10 overflow-hidden">
                <span className="block h-full origin-left bg-[#3b9dff] transition-transform duration-200" style={{ transform: `scaleX(${pct})` }} />
              </span>
              <span className={`whitespace-nowrap px-2 py-0.5 rounded-full border ${s.phase === 'idle' ? 'border-white/10 text-white/55' : 'border-[#3b9dff]/50 bg-[#3b9dff]/15 text-[#9ccdff]'}`}>{state}</span>
            </>
          )}
          {done
            ? <button type="button" onClick={replay} className={pillBtn}>Replay ↺</button>
            : (
              <>
                <button type="button" onClick={watch} className={`${pillBtn} hidden sm:block`}>Watch it build</button>
                <button type="button" onClick={() => engine.current?.skip()} className={pillBtn}>Skip</button>
              </>
            )}
          <button type="button" onClick={() => setClosed(true)} aria-label="Hide the build status"
            className="w-6 h-6 shrink-0 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer">✕</button>
        </div>
      )}
    </>
  )
}
