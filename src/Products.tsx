import { useState } from 'react'
import { products, type Status } from './data'
import { acVar, asset, spotlight } from './lib'
import { Chips, ExtLink, SectionHeader, Terminal } from './ui'
import { ProjectMark, ProjectVisual } from './visuals'

type Product = (typeof products)[number]
const KINDS = ['radar', 'router', 'wave', 'gold']

// The project's own mark in the same flat dark tile as the deep dives, so the whole row reads as one family.
function Mark({ p, small = false }: { p: Product; small?: boolean }) {
  if (KINDS.includes(p.mark)) return <ProjectMark kind={p.mark as 'radar'} small={small} />
  const box = small ? 'w-11 h-11 rounded-xl' : 'w-14 h-14 md:w-16 md:h-16 rounded-2xl'
  return (
    <span aria-hidden className={`grid place-items-center shrink-0 bg-[#0c0d10] ${box}`} style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--ac) 25%, transparent)' }}>
      <img src={asset(`products/logos/${p.mark}`)} alt="" width={40} height={40} loading="lazy" className="w-[62%] h-[62%] object-contain" />
    </span>
  )
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
          <Mark p={p} small />
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
        <Mark p={p} small />
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

export function Products() {
  const withScreens = products.filter((p) => p.shot || KINDS.includes(p.mark))
  const engines = products.filter((p) => !withScreens.includes(p))
  const live = products.filter((p) => p.status === 'Live').length
  return (
    <section id="products" className="relative py-28 md:py-40 px-5 md:px-10 border-t border-fg/[0.05]">
      <div className="max-w-7xl mx-auto">
        <SectionHeader n="03" label="PRODUCTS" title={<>Everything I&apos;ve <span className="text-gradient">shipped</span></>} />
        <p className="font-oxanium text-center text-lg text-fg/70 -mt-8 md:-mt-12 mb-10">
          {products.length} products, {live} of them live right now. Open any of them.
        </p>
        <nav aria-label="Jump to a product" data-b-row className="flex flex-wrap justify-center gap-2.5 mb-14 md:mb-20">
          {products.map((p) => (
            <a key={p.slug} href={`#p-${p.slug}`} title={p.name} aria-label={p.name} style={acVar(p.accent)} className="block hover:-translate-y-0.5 transition-transform">
              <Mark p={p} small />
            </a>
          ))}
        </nav>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
          {withScreens.map((p) => <Card key={p.slug} p={p} />)}
        </div>
        <h3 className="font-museo text-3xl md:text-4xl text-fg/90 text-center mt-24 mb-10">Smaller builds</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {engines.map((p) => <Compact key={p.slug} p={p} />)}
        </div>
      </div>
    </section>
  )
}
