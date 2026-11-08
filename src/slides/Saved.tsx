import { useRef } from 'react'
import { CountUp, gsap, SplitReveal, useSceneTimeline } from '../motion'
import type { Ranked } from '../stats/types'
import { fitCqw, grouped, windowLabel } from './fit'
import { Kicker } from './parts'

export interface SavedProps {
  total: number
  days: number
  top: Ranked[]
}

const OXBLOOD = 'var(--color-oxblood)'
const BUTTER = 'var(--color-butter)'
// A pile: each card drops a little lower than the last, so the strip with its account stays visible.
const CARDS = [
  { bg: 'var(--color-bone)', ink: 'var(--color-ink)', tilt: -4, left: 6 },
  { bg: 'var(--color-coral)', ink: 'var(--color-ink)', tilt: 3, left: 11 },
  { bg: 'var(--color-butter)', ink: 'var(--color-oxblood)', tilt: -1.5, left: 8 },
]

export function Saved({ total, days, top }: SavedProps) {
  const scene = useRef<HTMLDivElement>(null)
  // Three cards always drop; the top saved accounts are written on them when there are any.
  const cards = CARDS.map((c, i) => ({ ...c, account: top[i] ?? null }))

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    tl.from(q('[data-card]'), { y: '-90cqh', rotation: (i) => (i % 2 ? 40 : -40), duration: 1, ease: 'bounce.out', stagger: 0.35 }, 1.4)
  })

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: OXBLOOD, color: BUTTER }}>
      <Kicker>Saved · {windowLabel(days)}</Kicker>

      <div className="absolute inset-x-[6cqw] top-[15cqh]">
        <SplitReveal as="p" by="words" at={0.2} className="text-[10cqw] leading-[0.95] font-extrabold tracking-[-0.04em]">
          You saved
        </SplitReveal>
        <CountUp to={total} at={0.4} duration={1.6} className="block leading-[0.88] font-extrabold tracking-[-0.05em]" style={{ fontSize: fitCqw(grouped.format(total).length, 34, 88, 0.5) }} />
        <SplitReveal as="p" by="words" at={1} className="font-serif text-[10cqw] leading-[1] italic">
          posts for later.
        </SplitReveal>
      </div>

      <div className="absolute inset-x-0 top-[50cqh] h-[34cqh]">
        {cards.map((c, i) => (
          <div
            key={i}
            data-card
            className="absolute flex h-[22cqh] w-[82cqw] items-start gap-[3cqw] rounded-[3cqw] px-[4cqw] py-[2.4cqw]"
            style={{ top: `${i * 7}cqh`, left: `${c.left}cqw`, background: c.bg, color: c.ink, rotate: `${c.tilt}deg`, zIndex: i }}
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-[7cqw] w-[7cqw] shrink-0">
              <path d="M6 3h12v18l-6-4.5L6 21z" fill="currentColor" />
            </svg>
            {c.account && (
              <div className="flex min-w-0 flex-1 items-baseline justify-between gap-[3cqw]">
                <p className="truncate text-[6cqw] leading-[1.1] font-bold tracking-[-0.02em]">@{c.account.name}</p>
                <p className="shrink-0 font-mono text-[3cqw] uppercase">{grouped.format(c.account.count)}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <SplitReveal as="p" by="words" at={3} className="absolute inset-x-[6cqw] bottom-[7cqh] font-mono text-[3.6cqw] uppercase tracking-[0.12em]">
        Later is coming. Any day now.
      </SplitReveal>
    </div>
  )
}
