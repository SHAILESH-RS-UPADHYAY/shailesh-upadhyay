/*
  The build layer: when a visitor asks for it, the page looks like a swarm of agents is assembling it live, Figma-style.

  It only ever adds to the page. All content is in the DOM from the start, so search engines and screen readers read it
  as normal. An element is clipped until its turn and its inline clip-path is removed afterwards, which leaves it exactly
  as React rendered it. The existing animations (boot, reveal, hero, terminals) run untouched underneath. Everything
  drawn here (selection boxes, handles, tags, carets, placeholders, cursors) is on one canvas with pointer-events off.

  The order of a build, from the reference: scan, draw the box, type the text or fill the media, move on.
*/

export type Phase = 'scan' | 'build' | 'idle' | 'done'
export type Status = { phase: Phase; done: number; total: number; agents: number; seconds: number }

type Kind = 'text' | 'box' | 'media' | 'frame' | 'row'
type Rect = { left: number; top: number; right: number; bottom: number; width: number; height: number }
type Line = { x0: number; w: number; top: number; bot: number }
type Item = {
  el: HTMLElement
  kind: Kind
  label: string
  order: number
  parent: Item | null
  state: 'pending' | 'queued' | 'active' | 'done'
  t: number
  dur: number
  agent: Agent | null
  lines: Line[]
  total: number
  W: number
  caret: { x: number; top: number; bot: number } | null
  workX: number
  workY: number
  slots: HTMLElement[]
  revealed: number
}
type Agent = { x: number; y: number; vx: number; vy: number; angle: number; color: string; job: Item | null; wx: number; wy: number; nextWander: number }
type Ghost = { el: HTMLElement; t: number; color: string }
type Mark = { x: number; y: number; t: number }
type HeroFrame = { el: HTMLElement; label: string; at: number; until: number; placeholder: boolean }

const BLUE = '#3b9dff'
const TAG = '#22d3ee'
const PINK = '#fb7185'
const SLATE_A = '#5f7a95'
const SLATE_B = '#3c5269'
const COLORS = ['#34d399', '#22d3ee', '#a78bfa', '#fb7185', '#fbbf24']
const HIDDEN = 'inset(0 100% 100% 0)'
const SCAN_MS = 2600
const RING_MS = 5200

// Which elements become a layer. The first rule to match an element wins, and order here is priority.
const RULES: [string, Kind, string][] = [
  ['[data-b-row]', 'row', 'Logos'],
  ['.terminal', 'frame', 'Terminal'],
  ['[data-b-media], .screen-panel', 'media', 'Image'],
  ['.card', 'box', 'Frame'],
  ['h2, h3, h4', 'text', 'Heading'],
  ['p, dt, dd, [data-b-text]', 'text', 'Text'],
  ['ul.flex', 'box', 'Chips'],
  ['a.inline-flex', 'box', 'Link'],
]

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const easeOut = (t: number) => 1 - (1 - t) ** 3
const rectOf = (el: HTMLElement): Rect => el.getBoundingClientRect()

// The element's place in the layout, ignoring transforms. The hero portrait is mid-fall while its box is drawn.
function layoutRect(el: HTMLElement): Rect {
  let left = 0
  let top = 0
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) {
    left += n.offsetLeft
    top += n.offsetTop
  }
  left -= scrollX
  top -= scrollY
  return { left, top, right: left + el.offsetWidth, bottom: top + el.offsetHeight, width: el.offsetWidth, height: el.offsetHeight }
}

export function startBuild(canvas: HTMLCanvasElement, onStatus: (s: Status) => void) {
  const ctx = canvas.getContext('2d')
  const small = innerWidth < 768
  const weak = (navigator.hardwareConcurrency ?? 8) <= 2
  const agentCount = weak ? 0 : small ? 10 : 26
  const maxActive = small ? 4 : 9

  let items: Item[] = []
  let queue: Item[] = []
  let active: Item[] = []
  let ghosts: Ghost[] = []
  let marks: Mark[] = []
  let heroFrames: HeroFrame[] = []
  let doneCount = 0
  let buildMs = 0
  let startedAt = 0
  let lastT = 0
  let raf = 0
  let nextStart = 0
  let lastStatus = 0
  let swarm = 0
  let idleFor = 0
  let ringAt = 0
  let finished = false
  let dpr = 1

  const agents: Agent[] = Array.from({ length: agentCount }, (_, i) => ({
    x: innerWidth / 2, y: innerHeight / 2, vx: Math.cos(i * 2.4) * 9, vy: Math.sin(i * 2.4) * 9, angle: 0,
    color: COLORS[i % COLORS.length], job: null, wx: innerWidth / 2, wy: innerHeight / 2, nextWander: 0,
  }))

  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, small ? 1.5 : 2)
    canvas.width = innerWidth * dpr
    canvas.height = innerHeight * dpr
    canvas.style.width = `${innerWidth}px`
    canvas.style.height = `${innerHeight}px`
  }

  const report = (phase: Phase) => onStatus({ phase, done: doneCount, total: items.length, agents: agentCount, seconds: buildMs / 1000 })

  /* ---------- scan: find the layers ---------- */
  function scan() {
    const root = document.getElementById('main')
    if (!root) return
    const seen = new Map<HTMLElement, Item>()
    for (const [selector, kind, label] of RULES) {
      root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        if (seen.has(el) || el.closest('#home') || el.closest('[aria-hidden="true"]') || el.classList.contains('sr-only')) return
        if (kind !== 'frame' && el.closest('.terminal')) return
        if (kind !== 'media' && kind !== 'frame' && el.closest('.screen-panel, [data-b-media]')) return
        if (el.closest('[data-b-row]') && kind !== 'row') return
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height) return
        seen.set(el, {
          el, kind, label, order: 0, parent: null, state: 'pending', t: 0, dur: 300, agent: null, lines: [], total: 0, W: 0, caret: null,
          workX: 0, workY: 0, slots: kind === 'row' ? [...el.children] as HTMLElement[] : [], revealed: 0,
        })
      })
    }
    items = [...seen.values()].sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
    items.forEach((it, i) => {
      it.order = i
      for (let p = it.el.parentElement; p && p !== root; p = p.parentElement) {
        const up = seen.get(p)
        if (up) { it.parent = up; break }
      }
    })
    for (const it of items) hide(it)
  }

  function hide(it: Item) {
    if (it.kind === 'frame') return
    if (it.kind === 'row') it.slots.forEach((s) => { s.style.clipPath = HIDDEN })
    else it.el.style.clipPath = HIDDEN
    it.el.dataset.bPending = ''
  }

  function show(it: Item) {
    if (it.kind === 'row') it.slots.forEach((s) => { s.style.clipPath = '' })
    else if (it.kind !== 'frame') it.el.style.clipPath = ''
    delete it.el.dataset.bPending
  }

  /* ---------- heroes are never clipped: their own entrance plays, boxes are drawn around it ---------- */
  function scanHero() {
    const hero = document.getElementById('home')
    if (!hero) return
    const list: [string, string][] = [['[data-b-greeting]', 'Text'], ['[data-name-box]', 'Heading'], ['p', 'Text'], ['button', 'Frame'], ['a[aria-label]', 'Link']]
    let at = 450
    heroFrames = []
    for (const [selector, label] of list) {
      hero.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        if (el.closest('[data-b-portrait]') || el.closest('[aria-hidden="true"]:not([data-name-box])') || !el.offsetWidth) return
        heroFrames.push({ el, label, at, until: at + 1300, placeholder: false })
        at += 110
      })
    }
    const portrait = hero.querySelector<HTMLElement>('[data-b-portrait]')
    // The portrait lands 1.16s after mount (delay 0.55 + 45% of 1.35), so its box is there waiting for it.
    if (portrait) heroFrames.push({ el: portrait, label: 'Image', at: 300, until: 1500, placeholder: true })
  }

  /* ---------- scheduling ---------- */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const it = byEl.get(e.target)
      if (!it || it.state === 'done' || it.state === 'active') continue
      if (e.isIntersecting) {
        if (it.state === 'pending') enqueue(it)
      } else if (e.boundingClientRect.left < 0 || e.boundingClientRect.left >= document.documentElement.clientWidth) {
        finish(it) // off to the side of a phone's swipe row: nobody is watching it, and it must not hold up the finish
      } else if (it.state === 'queued') {
        if (e.boundingClientRect.bottom < 0) finish(it)
        else { it.state = 'pending'; queue = queue.filter((q) => q !== it) }
      }
    }
    wake()
  }, { rootMargin: '0px 0px -6% 0px' })
  let byEl = new Map<Element, Item>()

  function enqueue(it: Item) {
    it.state = 'queued'
    queue.push(it)
    queue.sort((a, b) => a.order - b.order)
  }

  function durationOf(it: Item) {
    switch (it.kind) {
      case 'text': return Math.max(240, Math.min(1000, (it.el.textContent?.length ?? 0) * 11))
      case 'media': return 1050
      case 'frame': return 620
      case 'row': return 170 * it.slots.length + 300
      default: return it.label === 'Link' ? 260 : 420
    }
  }

  function begin(it: Item) {
    it.state = 'active'
    it.t = 0
    it.dur = durationOf(it)
    if (it.kind === 'text') measure(it)
    active.push(it)
    const r = rectOf(it.el)
    it.workX = r.left
    it.workY = r.top
    let best: Agent | null = null
    let dist = Infinity
    for (const a of agents) {
      if (a.job) continue
      const d = (a.x - r.left) ** 2 + (a.y - r.top) ** 2
      if (d < dist) { dist = d; best = a }
    }
    if (best) { best.job = it; it.agent = best }
  }

  // Where each line of text sits, so the reveal can follow the words like typing, wrapping included.
  function measure(it: Item) {
    const box = it.el.getBoundingClientRect()
    const k = it.el.offsetWidth && box.width ? it.el.offsetWidth / box.width : 1
    const range = document.createRange()
    range.selectNodeContents(it.el)
    const rows: Line[] = []
    for (const q of range.getClientRects()) {
      if (!q.width || !q.height) continue
      const top = (q.top - box.top) * k
      const bot = (q.bottom - box.top) * k
      const x0 = (q.left - box.left) * k
      const x1 = (q.right - box.left) * k
      const row = rows.find((l) => Math.abs((l.top + l.bot) / 2 - (top + bot) / 2) < Math.min(l.bot - l.top, bot - top) * 0.6)
      if (row) {
        const end = Math.max(row.x0 + row.w, x1)
        row.x0 = Math.min(row.x0, x0)
        row.w = end - row.x0
        row.top = Math.min(row.top, top)
        row.bot = Math.max(row.bot, bot)
      } else rows.push({ x0, w: x1 - x0, top, bot })
    }
    rows.sort((a, b) => a.top - b.top)
    if (!rows.length) rows.push({ x0: 0, w: box.width * k, top: 0, bot: box.height * k })
    rows[0].top = -14
    rows[rows.length - 1].bot = box.height * k + 18
    for (let i = 1; i < rows.length; i++) rows[i].top = rows[i - 1].bot = (rows[i - 1].bot + rows[i].top) / 2
    it.lines = rows
    it.total = rows.reduce((a, l) => a + l.w, 0) || 1
    it.W = it.el.offsetWidth || box.width
  }

  function finish(it: Item) {
    if (it.state === 'done') return
    const wasActive = it.state === 'active'
    if (it.state === 'queued') queue = queue.filter((q) => q !== it)
    if (wasActive) active = active.filter((a) => a !== it)
    it.state = 'done'
    show(it)
    io.unobserve(it.el)
    doneCount++
    if (it.agent) { it.agent.job = null; it.agent = null }
    if (wasActive) {
      ghosts.push({ el: it.el, t: 0, color: it.kind === 'row' ? PINK : BLUE })
      const r = rectOf(it.el)
      if (it.kind !== 'text' && r.bottom > 0 && r.top < innerHeight) marks.push({ x: r.right, y: r.bottom, t: 0 })
    }
    if (doneCount === items.length && !finished) complete()
  }

  function complete() {
    finished = true
    ringAt = performance.now()
    report('done')
    wake()
  }

  /* ---------- drawing ---------- */
  function selection(c: CanvasRenderingContext2D, r: Rect, p: number, color: string, alpha: number, tag?: string) {
    const w = r.width * easeOut(p)
    const h = r.height * easeOut(p)
    c.globalAlpha = alpha
    c.strokeStyle = color
    c.lineWidth = 1.25
    c.strokeRect(r.left + 0.5, r.top + 0.5, w, h)
    if (p >= 1) {
      c.fillStyle = '#fff'
      c.strokeStyle = color
      c.lineWidth = 1
      for (const [x, y] of [[r.left, r.top], [r.right, r.top], [r.left, r.bottom], [r.right, r.bottom]]) {
        c.beginPath()
        c.arc(x, y, 2.8, 0, Math.PI * 2)
        c.fill()
        c.stroke()
      }
    }
    if (tag && p > 0.5 && !(small && r.width < 120)) {
      c.font = '500 10px "Geist Mono", ui-monospace, monospace'
      const tw = c.measureText(tag).width + 12
      const x = Math.min(r.right - tw, innerWidth - tw - 4)
      const y = r.bottom + 5
      c.fillStyle = color === PINK ? PINK : TAG
      roundRect(c, Math.max(r.left, x), y, tw, 16, 3)
      c.fill()
      c.fillStyle = '#04201f'
      c.fillText(tag, Math.max(r.left, x) + 6, y + 11.5)
    }
    c.globalAlpha = 1
  }

  function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    c.beginPath()
    c.roundRect(x, y, w, h, r)
  }

  function guides(c: CanvasRenderingContext2D, r: Rect, alpha: number) {
    c.globalAlpha = alpha
    c.strokeStyle = BLUE
    c.lineWidth = 1
    c.beginPath()
    c.moveTo(0, r.top + 0.5)
    c.lineTo(innerWidth, r.top + 0.5)
    c.moveTo(r.left + 0.5, 0)
    c.lineTo(r.left + 0.5, innerHeight)
    c.stroke()
    c.globalAlpha = 1
  }

  function placeholder(c: CanvasRenderingContext2D, r: Rect, fromX: number, alpha: number) {
    const x = Math.min(r.right, Math.max(r.left, fromX))
    c.globalAlpha = alpha
    const g = c.createLinearGradient(r.left, r.top, r.right, r.bottom)
    g.addColorStop(0, SLATE_A)
    g.addColorStop(1, SLATE_B)
    c.fillStyle = g
    c.fillRect(x, r.top, r.right - x, r.height)
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    if (cx > x) {
      c.strokeStyle = 'rgba(255,255,255,0.45)'
      c.lineWidth = 1.5
      c.beginPath()
      c.roundRect(cx - 13, cy - 10, 26, 20, 3)
      c.moveTo(cx - 9, cy + 7)
      c.lineTo(cx - 2, cy - 1)
      c.lineTo(cx + 3, cy + 4)
      c.lineTo(cx + 6, cy + 1)
      c.lineTo(cx + 10, cy + 7)
      c.stroke()
      c.beginPath()
      c.arc(cx + 6, cy - 4, 2, 0, Math.PI * 2)
      c.stroke()
    }
    c.globalAlpha = 1
  }

  function caret(c: CanvasRenderingContext2D, x: number, top: number, bot: number) {
    const h = Math.min(bot - top, 30)
    const y = (top + bot) / 2 - h / 2
    c.strokeStyle = '#fff'
    c.lineWidth = 1.4
    c.beginPath()
    c.moveTo(x, y + 2)
    c.lineTo(x, y + h - 2)
    c.moveTo(x - 3, y)
    c.quadraticCurveTo(x, y, x, y + 2)
    c.quadraticCurveTo(x, y, x + 3, y)
    c.moveTo(x - 3, y + h)
    c.quadraticCurveTo(x, y + h, x, y + h - 2)
    c.quadraticCurveTo(x, y + h, x + 3, y + h)
    c.stroke()
  }

  function stepItem(c: CanvasRenderingContext2D, it: Item, dt: number) {
    it.t += dt
    const r = rectOf(it.el)
    if (r.bottom < -60 || r.top > innerHeight + 200) return finish(it)
    const p = clamp01(it.t / it.dur)
    const draw = clamp01(it.t / 170)
    const number = it.agent ? String(agents.indexOf(it.agent) + 1).padStart(2, '0') : ''
    const tag = number ? `${it.label} · ${number}` : it.label
    it.workX = r.left + r.width * easeOut(draw)
    it.workY = r.top + r.height * easeOut(draw)

    if (it.kind === 'text') {
      const q = clamp01((it.t - 120) / (it.dur - 120))
      let w = q * it.total
      let i = 0
      while (i < it.lines.length - 1 && w > it.lines[i].w) { w -= it.lines[i].w; i++ }
      const l = it.lines[i]
      const x = l.x0 + Math.min(w, l.w)
      const R = it.W + 14
      if (q > 0) it.el.style.clipPath = `polygon(-14px -14px, ${R}px -14px, ${R}px ${l.top}px, ${x}px ${l.top}px, ${x}px ${l.bot}px, -14px ${l.bot}px)`
      const k = it.W ? r.width / it.W : 1
      it.workX = r.left + x * k
      it.workY = r.top + (Math.max(l.top, 0) + Math.min(l.bot, r.height / k)) * 0.5 * k
      selection(c, r, draw, BLUE, 0.95, tag)
      if (q > 0 && q < 1) caret(c, it.workX, r.top + Math.max(l.top, 0) * k, r.top + Math.min(l.bot, r.height / k) * k)
    } else if (it.kind === 'box') {
      const q = easeOut(p)
      it.el.style.clipPath = `inset(-1px ${(1 - q) * 100}% ${(1 - q) * 100}% -1px)`
      selection(c, r, draw, BLUE, 0.95, it.label === 'Frame' ? tag : undefined)
      if (it.label === 'Frame' && draw < 1) guides(c, r, 0.22)
    } else if (it.kind === 'media') {
      // Box, then the slate placeholder with its icon, then the real thing wipes in over it.
      const wipe = easeOut(clamp01((it.t - 480) / (it.dur - 480)))
      const fade = clamp01((it.t - 110) / 160)
      it.el.style.clipPath = wipe > 0 ? `inset(0 ${(1 - wipe) * 100}% 0 0)` : HIDDEN
      if (fade > 0) placeholder(c, r, r.left + r.width * wipe, fade)
      selection(c, r, draw, BLUE, 1, tag)
      if (draw < 1) guides(c, r, 0.22)
      if (wipe > 0 && wipe < 1) { it.workX = r.left + r.width * wipe; it.workY = r.top + r.height / 2 }
    } else if (it.kind === 'frame') {
      selection(c, r, draw, BLUE, 1, tag)
      if (draw < 1) guides(c, r, 0.22)
    } else {
      stepRow(c, it, p)
    }
    if (it.t >= it.dur) finish(it)
  }

  // One logo in a red frame runs along the row, stamping each slot as it passes.
  function stepRow(c: CanvasRenderingContext2D, it: Item, p: number) {
    const n = it.slots.length
    const at = p * n
    const i = Math.min(n - 1, Math.floor(at))
    for (let k = it.revealed; k <= i; k++) it.slots[k].style.clipPath = ''
    it.revealed = i + 1
    for (let k = Math.max(0, i - 3); k < i; k++) {
      const r = rectOf(it.slots[k])
      c.globalAlpha = 0.22 * (1 - (i - k) / 4)
      c.strokeStyle = PINK
      c.lineWidth = 1
      c.strokeRect(r.left - 3, r.top - 3, r.width + 6, r.height + 6)
    }
    c.globalAlpha = 1
    const a = rectOf(it.slots[i])
    const b = rectOf(it.slots[Math.min(n - 1, i + 1)])
    const f = easeOut(at - i)
    const moving: Rect = {
      left: a.left + (b.left - a.left) * f - 3, top: a.top + (b.top - a.top) * f - 3, width: a.width + 6, height: a.height + 6,
      right: 0, bottom: 0,
    }
    moving.right = moving.left + moving.width
    moving.bottom = moving.top + moving.height
    selection(c, moving, 1, PINK, 1)
    it.workX = moving.right
    it.workY = moving.top
  }

  function drawHero(c: CanvasRenderingContext2D, since: number) {
    if (since > SCAN_MS + 500) return
    const fadeAll = clamp01((SCAN_MS + 500 - since) / 500)
    const reach = easeOut(clamp01(since / 900))
    c.globalAlpha = 0.9 * fadeAll
    const top = c.createLinearGradient(0, 0, innerWidth, 0)
    top.addColorStop(0, BLUE)
    top.addColorStop(1, '#22d3ee')
    c.fillStyle = top
    c.fillRect(0, 0, innerWidth * reach, 3)
    c.fillStyle = BLUE
    c.fillRect(0, 0, 3, innerHeight * reach)
    c.globalAlpha = 0.5 * fadeAll
    c.fillStyle = BLUE
    for (let x = 40; x < innerWidth * reach; x += 40) c.fillRect(x, 3, 1, x % 200 ? 4 : 8)
    for (let y = 40; y < innerHeight * reach; y += 40) c.fillRect(3, y, y % 200 ? 4 : 8, 1)
    c.globalAlpha = 1
    for (const f of heroFrames) {
      const t = since - f.at
      if (t <= 0 || since > f.until + 260) continue
      const r = f.placeholder ? layoutRect(f.el) : rectOf(f.el)
      const out = clamp01((f.until + 260 - since) / 260)
      const draw = clamp01(t / 200)
      if (f.placeholder) {
        placeholder(c, r, r.left, clamp01(t / 180) * out * 0.9)
      }
      if (draw < 1) guides(c, r, 0.25)
      selection(c, r, draw, BLUE, out, f.label)
    }
  }

  function moveAgents(c: CanvasRenderingContext2D, dt: number, now: number) {
    const scale = dt / 16.7
    const ring = ringAt ? clamp01((now - ringAt) / RING_MS) : 0
    const word = ring ? document.querySelector<HTMLElement>('#contact h2 .text-gradient') : null
    const wr = word?.getBoundingClientRect()
    const ringVisible = wr && wr.top > 0 && wr.bottom < innerHeight
    agents.forEach((a, i) => {
      let tx: number
      let ty: number
      let k = 0.016
      if (ringVisible && wr) {
        const turn = (i / agents.length) * Math.PI * 2 + now * 0.0007
        const rad = Math.max(wr.width * 0.72, 90)
        tx = wr.left + wr.width / 2 + Math.cos(turn) * rad
        ty = wr.top + wr.height / 2 + Math.sin(turn) * rad * 0.8
      } else if (a.job) {
        tx = a.job.workX + 3
        ty = a.job.workY + 3
        k = 0.032
      } else {
        if (now > a.nextWander) {
          const work = active[i % Math.max(1, active.length)]
          a.wx = work ? work.workX + (Math.random() - 0.5) * 260 : Math.random() * innerWidth
          a.wy = work ? work.workY + (Math.random() - 0.5) * 180 : innerHeight * (0.25 + Math.random() * 0.6)
          a.nextWander = now + 500 + Math.random() * 1200
        }
        tx = a.wx
        ty = a.wy
        k = 0.006
      }
      a.vx = (a.vx + (tx - a.x) * k * scale) * 0.86 ** scale
      a.vy = (a.vy + (ty - a.y) * k * scale) * 0.86 ** scale
      a.x += a.vx * scale
      a.y += a.vy * scale
      if (Math.hypot(a.vx, a.vy) > 0.4) a.angle = Math.atan2(a.vy, a.vx) + Math.PI / 2
      c.save()
      c.globalAlpha = swarm
      c.translate(a.x, a.y)
      c.rotate(a.angle)
      c.fillStyle = a.color
      c.strokeStyle = 'rgba(0,0,0,0.45)'
      c.lineWidth = 0.8
      c.beginPath()
      c.moveTo(0, -6.5)
      c.lineTo(4.6, 5)
      c.lineTo(0, 2.6)
      c.lineTo(-4.6, 5)
      c.closePath()
      c.fill()
      c.stroke()
      c.restore()
    })
  }

  /* ---------- the loop ---------- */
  function frame(now: number) {
    raf = 0
    const dt = Math.min(50, now - lastT || 16)
    lastT = now
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, innerWidth, innerHeight)

    const since = now - startedAt
    drawHero(ctx, since)

    // Start what's due. A long queue speeds everything up, so fast scrolling never leaves people waiting on the page.
    const hurry = 1 + queue.length / 8
    if (now >= nextStart) {
      for (const it of queue) {
        if (active.length >= maxActive) break
        if (it.parent && it.parent.state !== 'done') continue
        queue = queue.filter((q) => q !== it)
        begin(it)
        nextStart = now + 70 / hurry
        break
      }
    }
    if (active.length) buildMs += dt
    for (const it of [...active]) stepItem(ctx, it, dt * hurry)

    ghosts = ghosts.filter((g) => {
      g.t += dt
      const out = 1 - g.t / 240
      if (out <= 0) return false
      const r = rectOf(g.el)
      if (r.bottom > 0 && r.top < innerHeight) selection(ctx, r, 1, g.color, out)
      return true
    })
    marks = marks.filter((m) => {
      m.t += dt
      const out = 1 - m.t / 600
      if (out <= 0) return false
      ctx.globalAlpha = out
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(m.x - 5, m.y)
      ctx.lineTo(m.x + 5, m.y)
      ctx.moveTo(m.x, m.y - 5)
      ctx.lineTo(m.x, m.y + 5)
      ctx.stroke()
      ctx.globalAlpha = 1
      return true
    })

    // The build line sits at the bottom edge whenever the page is being assembled down there.
    if (active.some((a) => rectOf(a.el).bottom > innerHeight * 0.6)) {
      const g = ctx.createLinearGradient(0, 0, innerWidth, 0)
      g.addColorStop(0, 'rgba(59,157,255,0)')
      g.addColorStop(0.5, BLUE)
      g.addColorStop(1, 'rgba(59,157,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, innerHeight - 2, innerWidth, 2)
    }

    // The swarm shows up for work, thins out when there's none, and leaves after the finale.
    const busy = active.length > 0 || queue.length > 0 || since < SCAN_MS
    idleFor = busy ? 0 : idleFor + dt
    const ringing = ringAt && now - ringAt < RING_MS
    const wanted = (busy || ringing || idleFor < 1400) ? 1 : 0
    swarm += (wanted - swarm) * Math.min(1, dt / 260)
    if (swarm > 0.01 && agents.length) moveAgents(ctx, dt, now)

    if (now - lastStatus > 160) {
      lastStatus = now
      report(finished ? 'done' : since < 1500 ? 'scan' : busy ? 'build' : 'idle')
    }
    if (busy || ringing || swarm > 0.01 || ghosts.length || marks.length || since < SCAN_MS + 500) raf = requestAnimationFrame(frame)
    else {
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      report(finished ? 'done' : 'idle')
    }
  }

  function wake() {
    if (raf) return
    lastT = performance.now()
    raf = requestAnimationFrame(frame)
  }

  /* ---------- keep it honest: nothing stays hidden from someone trying to reach it ---------- */
  function onFocus(e: FocusEvent) {
    const t = e.target as HTMLElement
    for (const it of items) if (it.state !== 'done' && it.el.contains(t)) finish(it)
  }
  function onResize() {
    size()
    for (const it of [...active]) finish(it)
    wake()
  }

  size()
  addEventListener('resize', onResize)
  document.addEventListener('focusin', onFocus)
  startedAt = performance.now()
  scan()
  scanHero()
  byEl = new Map(items.map((it) => [it.el, it]))
  for (const it of items) io.observe(it.el)
  report('scan')
  wake()

  // Stopping shows everything straight away, so it doubles as "skip".
  return function stop() {
    cancelAnimationFrame(raf)
    raf = 0
    io.disconnect()
    for (const it of items) show(it)
    ctx?.clearRect(0, 0, innerWidth, innerHeight)
    removeEventListener('resize', onResize)
    document.removeEventListener('focusin', onFocus)
  }
}
