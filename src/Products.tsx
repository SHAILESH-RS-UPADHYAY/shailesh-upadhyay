import { useState } from 'react'
import { flushSync } from 'react-dom'
import { motion } from 'framer-motion'
import { products, type Status } from './data'
import { acVar, asset, EASE, spotlight } from './lib'
import { Chips, ExtLink, SectionHeader, Terminal } from './ui'
import { ProjectMark, ProjectVisual } from './visuals'

type Product = (typeof products)[number]
const KINDS = ['radar', 'router', 'wave', 'gold']
const UP_FRONT = 6
// Two files need help: Autopsy is drawn for dark backgrounds, and Inkly's is square because phones round it themselves.
const MARK_FIT: Record<string, string> = { 'autopsy.svg': 'plate', 'inkly.webp': 'rounded-[22%]' }
// On phones a row of cards swipes sideways instead of stacking, which keeps the page short.
const SWIPE = 'flex md:grid gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-pl-5 md:scroll-pl-0 -mx-5 px-5 md:mx-0 md:px-0 py-1 [scrollbar-width:none] [&>*]:w-[86%] [&>*]:shrink-0 [&>*]:snap-start md:[&>*]:w-auto'

// The product's real logo, in its own shape, with nothing drawn around it.
function Mark({ p, className }: { p: Product; className: string }) {
  if (KINDS.includes(p.mark)) return <ProjectMark kind={p.mark as 'radar'} className={className} />
  return <img src={asset(`products/logos/${p.mark}`)} alt="" width={64} height={64} loading="lazy" className={`shrink-0 object-contain ${MARK_FIT[p.mark] ?? ''} ${className}`} />
}

function StatusChip({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-1.5 shrink-0 font-geist-mono text-[0.625rem] tracking-wider uppercase text-fg/60 px-2 py-1 rounded-md border border-fg/10">
      {status === 'Live' && (
        <span className="relative flex w-1.5 h-1.5">
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
          <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </span>
      )}
      {status}
    </span>
  )
}

function Details({ p }: { p: Product }) {
  const [open, setOpen] = useState(false)
  if (!p.lines) return null
  return (
    <details className="mt-4" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="font-geist-mono text-xs tracking-wider text-fg/60 hover:text-(--ac) cursor-pointer transition-colors py-1">How it works</summary>
      {open && <Terminal className="mt-3" lines={p.lines} file={`${p.slug}.sys`} accent={p.accent} />}
    </details>
  )
}

function Links({ p }: { p: Product }) {
  return (
    <div className="flex flex-wrap gap-2 mt-5">
      {p.links.map((l) => <ExtLink key={l.href} href={l.href}>{l.label}</ExtLink>)}
      {p.deep && (
        <a href={`#deep-${p.deep}`} className="inline-flex items-center gap-1.5 font-geist-mono text-xs tracking-wider text-fg/70 px-3.5 py-2.5 md:py-1.5 rounded-lg border border-fg/15 hover:bg-fg/10 active:scale-[0.97] transition-all">
          Deep dive <span aria-hidden>↓</span>
        </a>
      )}
      {!p.links.length && !p.deep && <span className="font-geist-mono text-xs text-fg/55 px-3 py-1.5 rounded-lg border border-fg/10">Private · demo on request</span>}
    </div>
  )
}

function Card({ p }: { p: Product }) {
  const main = p.links[0]?.href
  const media = (
    <>
      {/* A small browser bar, so a screenshot reads as the running product. */}
      <span className="flex items-center gap-1.5 h-7 px-3 bg-[#0c0f0e] border-b border-white/[0.06]">
        <span className="w-2 h-2 rounded-full bg-red-500/70" />
        <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
        <span className="w-2 h-2 rounded-full bg-green-500/70" />
        {p.host && <span className="ml-2 min-w-0 truncate font-geist-mono text-[0.625rem] text-white/45">{p.host}</span>}
      </span>
      <span className="block aspect-[8/5] overflow-hidden bg-black">
        <img src={asset(`products/${p.shot}.webp`)} alt={`${p.name} running`} width={960} height={600} loading="lazy"
          className="block w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover/shot:scale-[1.04]" />
      </span>
    </>
  )
  return (
    <article id={`p-${p.slug}`} style={acVar(p.accent)} onMouseMove={spotlight}
      className="card spotlight relative flex flex-col rounded-2xl border border-fg/[0.08] hover:border-(--ac)/40 transition-colors scroll-mt-24 overflow-hidden">
      {p.shot
        ? main
          ? <a data-b-media href={main} target="_blank" rel="noopener noreferrer" className="screen group/shot block">{media}</a>
          : <div data-b-media className="screen group/shot block">{media}</div>
        : <div className="aspect-[36/25] bg-black [&>div]:aspect-auto [&>div]:h-full [&>div]:rounded-none [&>div]:border-0"><ProjectVisual kind={p.mark as 'wave'} /></div>}
      <div className="flex flex-col flex-1 p-5 md:p-6">
        <div className="flex items-center gap-3">
          <Mark p={p} className="w-10 h-10" />
          <div className="min-w-0 flex-1">
            <h3 className="font-museo text-2xl text-fg leading-tight">{p.name}</h3>
            <p className="font-geist-mono text-[0.6875rem] tracking-wide text-(--ac) mt-0.5 truncate">{p.kind}</p>
          </div>
          <StatusChip status={p.status} />
        </div>
        <p className="font-oxanium text-fg/75 mt-4 leading-relaxed flex-1 text-pretty">{p.text}</p>
        <Chips className="mt-4" items={p.stack} />
        <Links p={p} />
        <Details p={p} />
      </div>
    </article>
  )
}

function Compact({ p }: { p: Product }) {
  return (
    <article id={`p-${p.slug}`} style={acVar(p.accent)} onMouseMove={spotlight}
      className="card spotlight relative flex flex-col rounded-2xl border border-fg/[0.08] hover:border-(--ac)/40 transition-colors p-5 scroll-mt-24">
      <div className="flex items-center gap-3">
        <Mark p={p} className="w-10 h-10" />
        <div className="min-w-0">
          <h3 className="font-museo text-xl text-fg leading-tight">{p.name}</h3>
          <p className="font-geist-mono text-[0.6875rem] text-(--ac) mt-0.5 truncate">{p.kind}</p>
        </div>
      </div>
      <p className="font-oxanium text-[0.9375rem] text-fg/75 mt-4 leading-relaxed flex-1 text-pretty">{p.text}</p>
      <Links p={p} />
    </article>
  )
}

// All twenty on one ruled sheet, always on the dark surface the logos were drawn for. Phones swipe along it.
function LogoSheet({ onPick }: { onPick: (slug: string) => void }) {
  return (
    <div className="screen mb-12 md:mb-16 rounded-2xl border border-white/[0.08] overflow-x-auto [scrollbar-width:none] shadow-(--screen-shadow)">
      <nav aria-label="Jump to a product" data-b-row className="grid grid-rows-2 grid-flow-col auto-cols-[6.5rem] lg:grid-rows-none lg:grid-flow-row lg:grid-cols-10 w-max lg:w-full gap-px bg-[#181c1a]">
        {products.map((p) => (
          <a key={p.slug} href={`#p-${p.slug}`} onClick={() => onPick(p.slug)} style={acVar(p.accent)}
            className="sheet-cell group flex flex-col items-center gap-3 px-2 pt-6 pb-4 bg-[#070a09] hover:bg-[#0d1210] transition-colors">
            {p.status === 'Live' && <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-400"><span className="sr-only">Live: </span></span>}
            <Mark p={p} className="w-12 h-12 transition-transform duration-300 ease-out group-hover:scale-110" />
            <span className="font-geist-mono text-[0.625rem] leading-tight text-center text-balance text-white/60 group-hover:text-white transition-colors">{p.name}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}

export function Products() {
  const rest = products.slice(UP_FRONT)
  const [open, setOpen] = useState(() => rest.some((p) => location.hash === `#p-${p.slug}`))
  const live = products.filter((p) => p.status === 'Live').length

  // A logo can point at a card that's still packed away, or one off to the side of a phone's swipe row.
  // The page's smooth scroller handles the vertical part after this, once the card exists.
  const pick = (slug: string) => {
    flushSync(() => setOpen((o) => o || rest.some((p) => p.slug === slug)))
    const card = document.getElementById(`p-${slug}`)
    const row = card?.parentElement
    if (card && row && row.scrollWidth > row.clientWidth) {
      row.scrollBy({ left: card.getBoundingClientRect().left - row.getBoundingClientRect().left - 20, behavior: 'smooth' })
    }
  }

  const line = <div className="flex-1 h-px bg-gradient-to-r from-transparent via-acc/25 to-transparent" />
  return (
    <section id="products" className="relative py-28 md:py-40 px-5 md:px-10 border-t border-fg/[0.05]">
      <div className="max-w-7xl mx-auto">
        <SectionHeader n="03" label="PRODUCTS" title={<>Everything I&apos;ve <span className="text-gradient">shipped</span></>} />
        <p className="font-oxanium text-center text-lg text-fg/70 -mt-8 md:-mt-12 mb-10">
          {products.length} products, <span aria-hidden className="inline-block w-1.5 h-1.5 mx-0.5 align-middle rounded-full bg-emerald-400" /> {live} of them live right now. Open any of them.
        </p>
        <LogoSheet onPick={pick} />
        <div className={`${SWIPE} md:grid-cols-2 xl:grid-cols-3`}>
          {products.slice(0, UP_FRONT).map((p) => <Card key={p.slug} p={p} />)}
        </div>

        <div className="flex items-center gap-4 md:gap-5 mt-12 md:mt-16">
          {line}
          <button type="button" aria-expanded={open} aria-controls="packed-products" onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-2 font-geist-mono text-xs tracking-widest uppercase px-5 py-3.5 rounded-xl border border-acc/30 bg-acc/10 text-fg hover:bg-acc/20 active:scale-[0.97] transition-[background-color,scale] cursor-pointer whitespace-nowrap">
            {open ? 'Pack them back up' : `Unpack the other ${rest.length}`}
            <span aria-hidden className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>↓</span>
          </button>
          {line}
        </div>
        {!open && <p className="font-oxanium text-center text-fg/55 mt-4">Client sites, apps, AI tools and backends</p>}

        {open && (
          <motion.div id="packed-products" className="mt-10 md:mt-14"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>
            <div className={`${SWIPE} md:grid-cols-2 xl:grid-cols-3`}>
              {rest.filter((p) => p.shot).map((p) => <Card key={p.slug} p={p} />)}
            </div>
            <h3 className="font-museo text-3xl md:text-4xl text-fg/90 text-center mt-16 md:mt-20 mb-8 md:mb-10">Smaller builds</h3>
            <div className={`${SWIPE} md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:gap-5`}>
              {rest.filter((p) => !p.shot).map((p) => <Compact key={p.slug} p={p} />)}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
