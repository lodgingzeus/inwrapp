import { useRef } from 'react'
import { gsap, SplitReveal, useSceneTimeline } from '../motion'
import type { PersonStats } from '../stats/types'
import { fitCqw, grouped, longest } from './fit'
import { Kicker } from './parts'

export interface TopPeopleProps {
  people: PersonStats[]
}

const BONE = 'var(--color-bone)'
const INK = 'var(--color-ink)'
const COBALT = 'var(--color-cobalt)'

export function TopPeople({ people }: TopPeopleProps) {
  const scene = useRef<HTMLDivElement>(null)
  const max = people[0].total
  const nameSize = fitCqw(Math.min(20, longest(people.map((p) => p.name))), 8.5, 62, 0.52)

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    tl.from(q('[data-row]'), { yPercent: 60, opacity: 0, duration: 0.6, ease: 'expo.out', stagger: 0.16 }, 1)
      .from(q('[data-bar]'), { scaleX: 0, transformOrigin: 'left center', duration: 1.1, ease: 'expo.out', stagger: 0.16 }, 1.3)
      .from(q('[data-blob]'), { scale: 0, rotation: -60, duration: 1.2, ease: 'elastic.out(1, 0.5)' }, 0.1)
  })

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: BONE, color: INK }}>
      <svg data-blob aria-hidden viewBox="0 0 100 100" className="absolute -right-[18cqw] -top-[10cqw] h-[62cqw] w-[62cqw]">
        <path d="M50 4c17 0 38 9 43 27s-4 33-11 47-22 20-36 18S14 88 8 72 0 38 12 22 33 4 50 4Z" fill={COBALT} />
      </svg>

      <Kicker>Messages · your top {people.length}</Kicker>

      <SplitReveal as="p" by="words" at={0.25} className="absolute inset-x-[6cqw] top-[15cqh] text-[13cqw] leading-[0.92] font-extrabold tracking-[-0.04em]">
        Your inner
      </SplitReveal>
      <SplitReveal as="p" by="chars" at={0.55} className="absolute inset-x-[6cqw] top-[26cqh] font-serif text-[18cqw] leading-[0.9] italic" style={{ color: COBALT }}>
        circle.
      </SplitReveal>

      <ol className="absolute inset-x-[6cqw] bottom-[9cqh] flex flex-col gap-[2.6cqh]">
        {people.map((p, i) => (
          <li key={p.name} data-row>
            <div className="flex items-baseline justify-between gap-[3cqw]">
              <span className="min-w-0 truncate leading-[1.1] font-bold tracking-[-0.02em]" style={{ fontSize: nameSize }}>
                <span className="mr-[2cqw] font-mono text-[3.6cqw] font-normal">{i + 1}</span>
                {p.name}
              </span>
              <span className="shrink-0 font-mono text-[3.4cqw] tabular-nums">{grouped.format(p.total)}</span>
            </div>
            <div
              data-bar
              className="mt-[0.8cqh] h-[2.4cqw] rounded-full"
              style={{ width: `${Math.max(6, (p.total / max) * 100)}%`, background: i === 0 ? COBALT : INK }}
            />
          </li>
        ))}
      </ol>
    </div>
  )
}
