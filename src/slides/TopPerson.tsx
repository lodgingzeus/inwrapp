import { useRef } from 'react'
import { CountUp, gsap, SplitReveal, Sticker, useSceneTimeline } from '../motion'
import type { PersonStats } from '../stats/types'
import { fitCqw, grouped } from './fit'

export interface TopPersonProps {
  person: PersonStats
}

const COBALT = 'var(--color-cobalt)'
const GUM = 'var(--color-bubblegum)'

function verdict({ sent, received, total }: PersonStats) {
  const lean = (sent - received) / Math.max(total, 1)
  if (lean > 0.12) return <>you did <em>most</em> of the talking.</>
  if (lean < -0.12) return <>they did <em>most</em> of the talking.</>
  return <>you two <em>never</em> ran out of things to say.</>
}

export function TopPerson({ person }: TopPersonProps) {
  const scene = useRef<HTMLDivElement>(null)
  const longestWord = Math.max(...person.name.split(/\s+/).map((w) => w.length))

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    // Drumroll: three dots bounce, then collapse into the reveal.
    tl.from(q('[data-dot]'), { scale: 0, duration: 0.3, ease: 'back.out(3)', stagger: 0.1 }, 0.9)
      .to(q('[data-dot]'), { y: '-4cqw', duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 3, stagger: 0.09 }, 1.2)
      .to(q('[data-dot]'), { scale: 0, duration: 0.25, ease: 'power3.in', stagger: 0.05 }, 2.05)
      .from(q('[data-sun]'), { yPercent: 100, duration: 1.1, ease: 'expo.out' }, 3.4)
  })

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: COBALT, color: GUM }}>
      <p className="absolute left-[6cqw] top-[9cqh] font-mono text-[3.4cqw] uppercase tracking-[0.18em]">
        Messages · your #1
      </p>

      <SplitReveal
        as="p"
        by="lines"
        at={0.2}
        className="absolute inset-x-[6cqw] top-[15cqh] text-[9cqw] leading-[1] font-bold tracking-[-0.03em]"
      >
        The person you talked to most this year:
      </SplitReveal>

      <div aria-hidden className="absolute left-[6cqw] top-[37cqh] flex gap-[3cqw]">
        {[0, 1, 2].map((i) => (
          <span key={i} data-dot className="block h-[5cqw] w-[5cqw] rounded-full" style={{ background: GUM }} />
        ))}
      </div>

      <SplitReveal
        as="h2"
        by="chars"
        at={2.3}
        stagger={0.05}
        duration={1}
        className="absolute inset-x-[6cqw] top-[33cqh] leading-[0.86] font-extrabold tracking-[-0.04em] text-white"
        style={{ fontSize: fitCqw(longestWord, 26, 88, 0.43), fontStretch: '80%' }}
      >
        {person.name}
      </SplitReveal>

      <Sticker label="#1" fill={GUM} ink={COBALT} at={3.1} size="24cqw" tilt={-10} className="right-[4cqw] top-[24cqh]" />

      <div
        data-sun
        className="absolute -left-[25cqw] -right-[25cqw] bottom-[-72cqw] h-[150cqw] rounded-full"
        style={{ background: GUM, color: COBALT }}
      >
        <div className="absolute inset-x-[31cqw] top-[12cqw]">
          <p className="flex items-baseline gap-[2cqw]">
            <CountUp
              to={person.total}
              at={3.6}
              duration={1.4}
              className="leading-none font-extrabold tracking-[-0.04em]"
              style={{ fontSize: fitCqw(grouped.format(person.total).length, 17, 58, 0.55) }}
            />
            <span className="font-serif text-[8cqw] italic">messages</span>
          </p>
          <p className="mt-[2cqw] font-mono text-[3.4cqw] uppercase tracking-[0.12em]">
            you sent {grouped.format(person.sent)} · they sent {grouped.format(person.received)}
          </p>
          <SplitReveal as="p" by="words" at={4.6} className="mt-[4cqw] font-serif text-[8.5cqw] leading-[1.02] italic [&_em]:not-italic [&_em]:font-display [&_em]:font-extrabold">
            {verdict(person)}
          </SplitReveal>
        </div>
      </div>
    </div>
  )
}
