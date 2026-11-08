import { useRef } from 'react'
import { CountUp, gsap, SplitReveal, useSceneTimeline } from '../motion'
import type { StreakStats } from '../stats/types'
import { fitCqw, formatWindow, longest } from './fit'
import { Kicker } from './parts'

export interface StreakProps {
  streak: StreakStats
}

const FOREST = 'var(--color-forest)'
const MINT = 'var(--color-mint)'
const MAX_CELLS = 400

export function Streak({ streak }: StreakProps) {
  const scene = useRef<HTMLDivElement>(null)
  const cells = Math.min(streak.days, MAX_CELLS)
  // Roughly a 3:2 block whatever the length, so the calendar never runs off the slide.
  const cols = Math.max(7, Math.ceil(Math.sqrt(cells * 1.5)))
  const rows = Math.ceil(cells / cols)

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    tl.from(q('[data-cell]'), { scale: 0, opacity: 0, duration: 0.3, ease: 'back.out(3)', stagger: { amount: 2 } }, 1)
      .from(q('[data-flame]'), { yPercent: 40, scaleY: 0.2, transformOrigin: '50% 100%', duration: 0.9, ease: 'elastic.out(1, 0.4)' }, 3)
  })

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: FOREST, color: MINT }}>
      <Kicker>Messages · longest streak</Kicker>

      <div className="absolute inset-x-[6cqw] top-[15cqh]">
        <p className="flex items-baseline gap-[3cqw]">
          <CountUp to={streak.days} at={1} duration={2} className="text-[30cqw] leading-[0.85] font-extrabold tracking-[-0.05em]" />
          <span className="font-serif text-[11cqw] italic">days</span>
        </p>
        <SplitReveal as="p" by="words" at={0.3} className="mt-[1cqh] text-[8cqw] leading-[1] font-bold tracking-[-0.02em]">
          in a row, without missing one, with
        </SplitReveal>
        <SplitReveal
          as="p"
          by="chars"
          at={2.6}
          className="mt-[1cqh] leading-[0.95] font-extrabold tracking-[-0.03em] text-white"
          style={{ fontSize: fitCqw(Math.min(16, longest(streak.name.split(/\s+/))), 13, 88, 0.5), fontStretch: '85%' }}
        >
          {streak.name}
        </SplitReveal>
      </div>

      <div className="absolute inset-x-[6cqw] bottom-[8cqh]">
        <div
          aria-hidden
          className="grid gap-[0.8cqw]"
          // Capped by height too, so a 9:16 frame (shorter than a phone) keeps clear of the name above.
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, width: `min(100%, calc(28cqh * ${cols} / ${rows}))` }}
        >
          {Array.from({ length: cells }, (_, i) => (
            <span key={i} data-cell className="aspect-square rounded-[22%]" style={{ background: MINT }} />
          ))}
        </div>
        <p className="mt-[1.5cqh] flex justify-between font-mono text-[3.4cqw] uppercase tracking-[0.12em]">
          <span>{formatWindow(streak.start, streak.end)}</span>
          <span data-flame className="inline-block">no days off</span>
        </p>
      </div>
    </div>
  )
}
