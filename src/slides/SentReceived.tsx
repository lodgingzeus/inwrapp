import { useRef } from 'react'
import { CountUp, gsap, SplitReveal, useSceneTimeline } from '../motion'
import type { MessageStats } from '../stats/types'
import { fitCqw, grouped, plural } from './fit'
import { Kicker } from './parts'

export type SentReceivedProps = Pick<MessageStats, 'sent' | 'received' | 'chats'>

const TANGERINE = 'var(--color-tangerine)'
const PLUM = 'var(--color-plum)'

function verdict(sent: number, received: number) {
  const ratio = sent / Math.max(received, 1)
  if (ratio > 1.15) return <>You talk <em>more</em> than you listen.</>
  if (ratio < 0.87) return <>You&rsquo;re a <em>great</em> listener. Or a slow typist.</>
  return <>Perfectly <em>balanced</em>, as all things should be.</>
}

export function SentReceived({ sent, received, chats }: SentReceivedProps) {
  const scene = useRef<HTMLDivElement>(null)
  const digits = grouped.format(Math.max(sent, received)).length
  const numberSize = fitCqw(digits, 30, 88, 0.5)

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    tl.from(q('[data-top]'), { xPercent: -100, duration: 0.8, ease: 'expo.out' }, 0)
      .from(q('[data-bottom]'), { xPercent: 100, duration: 0.8, ease: 'expo.out' }, 0.1)
      .from(q('[data-vs]'), { scale: 0, rotation: 200, duration: 0.7, ease: 'back.out(2)' }, 2.6)
  })

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: PLUM }}>
      <div data-top className="absolute inset-x-0 top-0 h-[54cqh]" style={{ background: TANGERINE, color: PLUM, clipPath: 'polygon(0 0, 100% 0, 100% 86%, 0 100%)' }}>
        <Kicker>Messages · across {plural(chats, 'chat')}</Kicker>
        <div className="absolute inset-x-[6cqw] top-[17cqh]">
          <p className="font-serif text-[10cqw] leading-none italic">You sent</p>
          <CountUp to={sent} at={0.5} duration={2.2} className="block leading-[0.9] font-extrabold tracking-[-0.05em]" style={{ fontSize: numberSize }} />
        </div>
      </div>

      <div data-bottom className="absolute inset-x-0 bottom-0 h-[46cqh]" style={{ color: TANGERINE }}>
        <div className="absolute inset-x-[6cqw] top-[6cqh] text-right">
          <p className="font-serif text-[10cqw] leading-none italic">You got</p>
          <CountUp to={received} at={0.6} duration={2.2} className="block leading-[0.9] font-extrabold tracking-[-0.05em]" style={{ fontSize: numberSize }} />
        </div>
        <SplitReveal
          as="p"
          by="words"
          at={3}
          className="absolute inset-x-[6cqw] bottom-[8cqh] text-[7.5cqw] leading-[1.05] font-semibold tracking-[-0.02em] [&_em]:font-serif [&_em]:font-normal"
        >
          {verdict(sent, received)}
        </SplitReveal>
      </div>

      <div
        data-vs
        aria-hidden
        className="absolute left-[8cqw] top-[47cqh] grid h-[17cqw] w-[17cqw] place-items-center rounded-full font-mono text-[5cqw] font-bold"
        style={{ background: PLUM, color: TANGERINE, outline: `1cqw solid ${TANGERINE}` }}
      >
        vs
      </div>
    </div>
  )
}
