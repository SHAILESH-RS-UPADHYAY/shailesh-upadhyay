import { useCallback, useEffect, useRef, useState } from 'react'
import type { Status } from './build'

const RESULT_MS = 7000
const TAB = 'screen fixed z-[56] top-1/2 -translate-y-1/2 right-0 print:hidden flex flex-col items-center gap-2.5 w-7 py-3 rounded-l-xl border border-r-0 border-white/10 bg-[#080b0a]/90 backdrop-blur-md font-geist-mono text-[0.625rem] tracking-[0.2em] uppercase text-white/65'
const VERTICAL = '[writing-mode:vertical-rl] whitespace-nowrap'

function Cursor() {
  return (
    <svg aria-hidden viewBox="-6 -8 12 15" fill="#3b9dff" className="w-3 h-3.5 shrink-0 -rotate-[30deg]">
      <path d="M0 -6.5L4.6 5L0 2.6L-4.6 5Z" />
    </svg>
  )
}

// The page never builds by itself. This small tab, closed against the right edge, is the only way to start it,
// and the engine isn't even downloaded until someone clicks. `scrollTo` comes from the page's smooth scroller.
export default function BuildLayer({ scrollTo }: { scrollTo: (y: number, seconds: number) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const stopBuild = useRef<(() => void) | null>(null)
  const descent = useRef(0)
  const [status, setStatus] = useState<Status | null>(null)
  const [reduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)

  const end = useCallback(() => {
    clearTimeout(descent.current)
    stopBuild.current?.()
    stopBuild.current = null
    setStatus(null)
  }, [])

  const watch = async () => {
    const { startBuild } = await import('./build')
    if (!canvas.current || stopBuild.current) return
    scrollTo(0, 0)
    stopBuild.current = startBuild(canvas.current, setStatus)
    // A moment on the hero, then down the page at reading pace.
    descent.current = window.setTimeout(() => {
      const height = document.documentElement.scrollHeight - innerHeight
      scrollTo(height, Math.max(25, height / 420))
    }, 1800)
  }
  const stop = () => {
    end()
    scrollTo(scrollY, 0)
  }

  const done = status?.phase === 'done'
  useEffect(() => {
    if (!done) return
    const t = setTimeout(end, RESULT_MS)
    return () => clearTimeout(t)
  }, [done, end])
  useEffect(() => end, [end])

  if (reduced) return null
  return (
    <>
      <canvas ref={canvas} aria-hidden hidden={!status} className="fixed inset-0 z-[55] pointer-events-none" />
      {!status && (
        <button type="button" onClick={watch} aria-label="Watch this page build itself" title="Watch this page build itself"
          className={`${TAB} cursor-pointer hover:w-8 hover:text-white active:scale-95 transition-[width,color,scale] before:absolute before:inset-y-0 before:right-0 before:w-10 before:content-['']`}>
          <Cursor />
          <span className={VERTICAL}>Build</span>
        </button>
      )}
      {status && !done && (
        <div className={TAB}>
          <Cursor />
          <span className={`${VERTICAL} tabular-nums tracking-normal`}>{status.done} / {status.total}</span>
          <span aria-hidden className="block w-[3px] h-14 rounded-full bg-white/10 overflow-hidden">
            <span className="block w-full h-full origin-top bg-[#3b9dff] transition-transform duration-200" style={{ transform: `scaleY(${status.total ? status.done / status.total : 0})` }} />
          </span>
          <button type="button" onClick={stop} aria-label="Stop the build" title="Stop"
            className="relative w-6 h-6 -my-1 grid place-items-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer before:absolute before:-inset-2 before:content-['']">✕</button>
        </div>
      )}
      {done && (
        <div role="status" className={TAB}>
          <Cursor />
          <span className={`${VERTICAL} normal-case tracking-normal`}>{status.agents ? `${status.agents} agents · ` : ''}{status.seconds.toFixed(1)}s</span>
        </div>
      )}
    </>
  )
}
