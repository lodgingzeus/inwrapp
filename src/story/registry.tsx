import type { ComponentType, ReactNode } from 'react'
import type { WrappedStats } from '../stats/types'
import { Intro } from '../slides/Intro'
import { TotalLikes } from '../slides/TotalLikes'
import { TopPerson } from '../slides/TopPerson'

export interface Slide {
  id: string
  durationMs: number
  /** Colour of the progress bars and controls on this slide. */
  chrome: string
  node: ReactNode
}

interface SlideDef<P> {
  id: string
  durationMs: number
  chrome: string
  /** Props for the slide, or null to skip it because the export lacks the data. */
  select: (stats: WrappedStats) => P | null
  Component: ComponentType<P>
}

type AnyDef = { build: (stats: WrappedStats) => Slide | null }

function define<P extends object>({ select, Component, ...meta }: SlideDef<P>): AnyDef {
  return {
    build(stats) {
      const props = select(stats)
      return props ? { ...meta, node: <Component {...props} /> } : null
    },
  }
}

const YEAR = 2026

// Story order. A slide whose select() returns null is left out.
const SLIDES: AnyDef[] = [
  define({
    id: 'intro',
    durationMs: 5500,
    chrome: 'var(--color-lime)',
    select: (s) => ({ username: s.owner.username, year: YEAR }),
    Component: Intro,
  }),
  define({
    id: 'total-likes',
    durationMs: 7500,
    chrome: 'var(--color-ink)',
    select: ({ likes }) =>
      likes && likes.total > 0
        ? { total: likes.total, minutesPerLikeAwake: likes.minutesPerLikeAwake, window: likes.window }
        : null,
    Component: TotalLikes,
  }),
  define({
    id: 'top-person',
    durationMs: 8500,
    chrome: 'var(--color-bubblegum)',
    select: ({ messages }) => (messages?.topPeople[0] ? { person: messages.topPeople[0] } : null),
    Component: TopPerson,
  }),
]

export function slidesFor(stats: WrappedStats): Slide[] {
  return SLIDES.map((d) => d.build(stats)).filter((s): s is Slide => s !== null)
}
