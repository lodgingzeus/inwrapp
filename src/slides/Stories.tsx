import { useRef } from 'react'
import { CountUp, gsap, SplitReveal, useSceneTimeline } from '../motion'
import type { ActivityStats } from '../stats/types'
import { fitCqw, grouped, windowLabel } from './fit'
import { Kicker } from './parts'

type Source = Pick<ActivityStats, 'total' | 'window'>

export interface StoriesProps {
  viewed: Source | null
  liked: Source | null
  mostWatched: string | null
}

const INK = 'var(--color-ink)'
const RINGS = [
  { r: 46, color: 'var(--color-bubblegum)', dash: '18 6', width: 3, cls: 'spin-slow' },
  { r: 36, color: 'var(--color-tangerine)', dash: '10 5', width: 3, cls: 'spin-mid' },
  { r: 26, color: 'var(--color-lime)', dash: '4 4', width: 3, cls: 'spin-slow' },
]

export function Stories({ viewed, liked, mostWatched }: StoriesProps) {
  const scene = useRef<HTMLDivElement>(null)
  // Story views and story likes cover different windows, so each states its own.
  const hero = viewed ?? liked!
  const heroIsViews = hero === viewed

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    tl.from(q('[data-ring]'), { scale: 0.3, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.15 }, 0.3)
  })

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: INK, color: 'var(--color-bone)' }}>
      <Kicker>Stories</Kicker>

      <div aria-hidden className="absolute left-1/2 top-[13cqh] h-[92cqw] w-[92cqw] -translate-x-1/2">
        {RINGS.map((ring, i) => (
          <div key={ring.r} data-ring className="absolute inset-0">
            <svg viewBox="0 0 100 100" className={`${ring.cls} h-full w-full`} style={{ animationDirection: i === 1 ? 'reverse' : 'normal' }}>
              <circle cx="50" cy="50" r={ring.r} fill="none" stroke={ring.color} strokeWidth={ring.width} strokeDasharray={ring.dash} strokeLinecap="round" />
            </svg>
          </div>
        ))}
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <CountUp to={hero.total} at={0.8} duration={2} className="block leading-[0.9] font-extrabold tracking-[-0.05em]" style={{ fontSize: fitCqw(grouped.format(hero.total).length, 17, 44, 0.5) }} />
            <p className="font-serif text-[6cqw] italic">{heroIsViews ? 'stories watched' : 'stories liked'}</p>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-[6cqw] bottom-[8cqh]">
        <SplitReveal as="p" by="lines" at={2.4} className="text-[8.5cqw] leading-[1] font-bold tracking-[-0.03em]">
          {heroIsViews ? `That’s ${windowLabel(hero.window.days)} alone.` : `That’s how many stories got a like from you ${windowLabel(hero.window.days)}.`}
        </SplitReveal>
        {heroIsViews && liked && (
          <SplitReveal as="p" by="lines" at={3} className="mt-[1.5cqh] font-serif text-[7cqw] leading-[1.05] italic" style={{ color: 'var(--color-bubblegum)' }}>
            {`And you liked ${grouped.format(liked.total)} stories ${windowLabel(liked.window.days)}.`}
          </SplitReveal>
        )}
        {mostWatched && (
          <SplitReveal as="p" by="lines" at={3.6} className="mt-[1.5cqh] font-mono text-[3.4cqw] uppercase tracking-[0.1em]">
            {`Watched most: @${mostWatched}`}
          </SplitReveal>
        )}
      </div>
    </div>
  )
}
