import { useRef } from 'react'
import { CountUp, gsap, SplitReveal, Sticker, useSceneTimeline } from '../motion'
import type { LikeStats } from '../stats/types'
import { cadence, fitCqw, formatWindow } from './fit'

export type TotalLikesProps = Pick<LikeStats, 'total' | 'minutesPerLikeAwake' | 'window'>

const CORAL = 'var(--color-coral)'
const BONE = 'var(--color-bone)'
const INK = 'var(--color-ink)'

export function TotalLikes({ total, minutesPerLikeAwake, window }: TotalLikesProps) {
  const scene = useRef<HTMLDivElement>(null)
  const digits = new Intl.NumberFormat('en-US').format(total).length

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    tl.from(q('[data-number]'), { fontStretch: '75%', fontWeight: 300, duration: 1.9, ease: 'expo.out' }, 0.6)
      .fromTo(
        q('[data-number]'),
        { scaleY: 1.25, scaleX: 0.86 },
        {
          scaleY: 1,
          scaleX: 1,
          duration: 0.9,
          ease: 'elastic.out(1.1, 0.35)',
          transformOrigin: '0% 100%',
          immediateRender: false,
        },
        2.15,
      )
      .from(q('[data-band]'), { yPercent: 120, rotation: 0, duration: 0.9, ease: 'expo.out' }, 2.5)
  })

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: CORAL, color: INK }}>
      <p className="absolute left-[6cqw] top-[9cqh] font-mono text-[3.4cqw] uppercase tracking-[0.18em]">
        01 · Likes · {formatWindow(window.start, window.end)}
      </p>

      <div className="absolute inset-x-[6cqw] top-[19cqh]">
        <SplitReveal as="p" by="words" at={0.2} className="text-[11cqw] leading-[0.95] font-bold tracking-[-0.03em]">
          You double-tapped
        </SplitReveal>
        <div
          data-number
          className="mt-[2cqh] leading-[0.82] font-extrabold tracking-[-0.05em]"
          style={{ fontSize: fitCqw(digits, 36, 88, 0.47) }}
        >
          <CountUp to={total} at={0.6} duration={1.9} />
        </div>
        <SplitReveal
          as="p"
          by="words"
          at={1.6}
          className="mt-[1cqh] font-serif text-[13cqw] leading-[1] italic"
          style={{ color: BONE }}
        >
          posts.
        </SplitReveal>
      </div>

      <Sticker label="tap tap" fill={INK} ink={CORAL} at={2.3} size="27cqw" tilt={14} className="right-[5cqw] top-[49cqh]" />

      <div
        data-band
        className="absolute -left-[8cqw] -right-[8cqw] bottom-[-6cqh] h-[36cqh] -rotate-[7deg] px-[14cqw] pt-[6cqh]"
        style={{ background: BONE }}
      >
        <SplitReveal as="p" by="lines" at={2.9} className="text-[9.6cqw] leading-[1.02] font-semibold tracking-[-0.02em]">
          That&rsquo;s one every{' '}
          <em className="font-serif font-normal whitespace-nowrap italic" style={{ color: CORAL }}>
            {cadence(minutesPerLikeAwake)}
          </em>{' '}
          you were awake.
        </SplitReveal>
      </div>
    </div>
  )
}
