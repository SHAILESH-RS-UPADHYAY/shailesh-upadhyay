import { useRef, type CSSProperties, type MouseEvent } from 'react'
import { useInView } from 'framer-motion'
import type { Accent } from './data'

export const EASE = [0.16, 1, 0.3, 1] as const
export const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`
// --ac follows the theme (darker accents in light mode); inside .screen elements it stays neon.
export const acVar = (a: Accent) => ({ '--ac': `var(--${a})` }) as CSSProperties

// Border glow that follows the cursor: sets the position .spotlight reads.
export function spotlight(e: MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

/* Fires once when the element scrolls into view. Sections use it to open all their terminals together. */
export function useReveal<T extends Element>(amount = 0.15) {
  const ref = useRef<T>(null)
  const inView = useInView(ref, { once: true, amount })
  return [ref, inView] as const
}
