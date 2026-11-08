import { useRef } from 'react'
import { CountUp, gsap, Marquee, SplitReveal, useSceneTimeline } from '../motion'
import type { Ranked } from '../stats/types'
import { fitCqw, grouped } from './fit'
import { Kicker } from './parts'

export interface ReelsProps {
  sent: number
  topRecipient: Ranked | null
}

const GUM = 'var(--color-bubblegum)'
const COBALT = 'var(--color-cobalt)'

export function Reels({ sent, topRecipient }: ReelsProps) {
  const scene = useRef<HTMLDivElement>(null)
  const count = grouped.format(sent)

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    tl.from(q('[data-strip]'), { xPercent: (i) => (i % 2 ? 60 : -60), opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0)
      .from(q('[data-block]'), { scaleY: 0, transformOrigin: '50% 0%', duration: 0.7, ease: 'expo.out' }, 0.6)
      .from(q('[data-recipient]'), { yPercent: 80, opacity: 0, duration: 0.6, ease: 'expo.out', stagger: 0.15 }, 2.8)
  })

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: GUM, color: COBALT }}>
      <div aria-hidden className="absolute -inset-x-[10cqw] top-[44cqh] -rotate-[8deg]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} data-strip>
            <Marquee
              items={[`${count} reels`, 'sent', 'you have to see this']}
              durationS={9 + i * 2}
              reverse={i % 2 === 1}
              className="text-[11cqw] leading-[1.05] font-extrabold uppercase tracking-[-0.02em]"
              style={{ opacity: i === 1 ? 1 : 0.35 }}
            />
          </div>
        ))}
      </div>

      <Kicker>Messages · reels</Kicker>

      <div data-block className="absolute inset-x-0 top-[14cqh] px-[6cqw] pb-[3cqh] pt-[2cqh]" style={{ background: COBALT, color: GUM }}>
        <p className="font-serif text-[10cqw] leading-none italic">You sent</p>
        <CountUp to={sent} at={0.9} duration={1.8} className="block leading-[0.9] font-extrabold tracking-[-0.05em]" style={{ fontSize: fitCqw(count.length, 32, 88, 0.5) }} />
        <p className="text-[9cqw] leading-none font-bold tracking-[-0.03em]">reels into the chat.</p>
      </div>

      {topRecipient && (
        <div className="absolute inset-x-[6cqw] bottom-[8cqh]">
          <SplitReveal as="p" by="words" at={2.4} className="font-serif text-[8cqw] leading-[1] italic">
            Most of them landed with
          </SplitReveal>
          <p data-recipient className="truncate leading-[1.1] font-extrabold tracking-[-0.03em]" style={{ fontSize: fitCqw(Math.min(16, [...topRecipient.name].length), 11, 88, 0.52) }}>
            {topRecipient.name}
          </p>
          <p data-recipient className="font-mono text-[3.4cqw] uppercase tracking-[0.12em]">
            {grouped.format(topRecipient.count)} reels
          </p>
        </div>
      )}
    </div>
  )
}
