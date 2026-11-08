import { useRef } from 'react'
import { CountUp, gsap, SplitReveal, useSceneTimeline } from '../motion'
import type { Ranked } from '../stats/types'
import { fitCqw, grouped, windowLabel } from './fit'
import { Kicker } from './parts'

export interface CommentsProps {
  total: number
  days: number
  top: Ranked[]
}

const SKY = 'var(--color-sky)'
const INK = 'var(--color-ink)'
const BUBBLES = [
  { bg: 'var(--color-coral)', ink: INK, pos: 'left-[6cqw] top-[56cqh]', tilt: -5, tail: 'left-[10%]' },
  { bg: 'var(--color-bone)', ink: INK, pos: 'right-[6cqw] top-[67cqh]', tilt: 4, tail: 'right-[12%]' },
  { bg: INK, ink: SKY, pos: 'left-[12cqw] top-[78cqh]', tilt: -2, tail: 'left-[16%]' },
]

export function Comments({ total, days, top }: CommentsProps) {
  const scene = useRef<HTMLDivElement>(null)
  const shown = top.slice(0, BUBBLES.length)

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    tl.from(q('[data-main]'), { scale: 0, rotation: -12, transformOrigin: '20% 100%', duration: 0.8, ease: 'back.out(2.5)' }, 0.3).from(
      q('[data-bubble]'),
      { scale: 0, transformOrigin: '30% 100%', duration: 0.5, ease: 'back.out(3.5)', stagger: 0.3 },
      2,
    )
  })

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: SKY, color: INK }}>
      <Kicker>Comments · {windowLabel(days)}</Kicker>

      <div data-main className="absolute left-[6cqw] right-[10cqw] top-[15cqh] rounded-[7cqw] px-[6cqw] py-[4cqw]" style={{ background: INK, color: SKY }}>
        <CountUp to={total} at={0.6} duration={1.6} className="block leading-[0.9] font-extrabold tracking-[-0.05em]" style={{ fontSize: fitCqw(grouped.format(total).length, 28, 72, 0.5) }} />
        <p className="font-serif text-[9cqw] leading-none italic">comments left.</p>
        <span aria-hidden className="absolute -bottom-[3cqw] left-[12cqw] h-[8cqw] w-[8cqw] rotate-45" style={{ background: INK }} />
      </div>

      {shown.length > 0 && (
        <SplitReveal as="p" by="words" at={1.5} className="absolute inset-x-[6cqw] top-[46cqh] text-[7cqw] leading-[1] font-bold tracking-[-0.02em]">
          Your favourite comment sections:
        </SplitReveal>
      )}

      {shown.map((r, i) => {
        const b = BUBBLES[i]
        return (
          <div key={r.name} data-bubble className={`absolute max-w-[78cqw] rounded-[5cqw] px-[5cqw] py-[2.5cqw] ${b.pos}`} style={{ background: b.bg, color: b.ink, rotate: `${b.tilt}deg` }}>
            <p className="truncate text-[6.5cqw] leading-[1.1] font-extrabold tracking-[-0.02em]">@{r.name}</p>
            <p className="font-mono text-[3cqw] uppercase">{grouped.format(r.count)} comments</p>
            <span aria-hidden className={`absolute -bottom-[2cqw] h-[5cqw] w-[5cqw] rotate-45 ${b.tail}`} style={{ background: b.bg }} />
          </div>
        )
      })}
    </div>
  )
}
