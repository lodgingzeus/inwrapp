import { useRef } from 'react'
import { CountUp, gsap, SplitReveal, useSceneTimeline } from '../motion'
import type { EstimateStats } from '../stats/types'
import { fitCqw, grouped, windowLabel } from './fit'
import { Kicker } from './parts'

export interface WatchingProps {
  videos: EstimateStats | null
  posts: EstimateStats | null
}

const LIME = 'var(--color-lime)'
const INK = 'var(--color-ink)'

export function Watching({ videos, posts }: WatchingProps) {
  const scene = useRef<HTMLDivElement>(null)
  const hero = videos ?? posts!
  const noun = hero === videos ? 'videos' : 'posts'
  const other = hero === videos ? posts : null

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    tl.from(q('[data-clock]'), { scale: 0, duration: 0.8, ease: 'back.out(2)' }, 0.2)
      .to(q('[data-hand]'), { rotation: 720, svgOrigin: '50 50', duration: 6, ease: 'steps(48)' }, 0.6)
      .from(q('[data-estimate]'), { yPercent: 100, opacity: 0, duration: 0.8, ease: 'expo.out' }, 2.4)
  })

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: LIME, color: INK }}>
      <Kicker>Watching · {windowLabel(hero.window.days)}</Kicker>

      <svg data-clock viewBox="0 0 100 100" aria-hidden className="absolute right-[6cqw] top-[14cqh] h-[26cqw] w-[26cqw]">
        <circle cx="50" cy="50" r="44" fill={INK} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="50" y1="12" x2="50" y2="18" stroke={LIME} strokeWidth="3" strokeLinecap="round" transform={`rotate(${i * 30} 50 50)`} />
        ))}
        <line data-hand x1="50" y1="50" x2="50" y2="20" stroke={LIME} strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="50" r="4" fill={LIME} />
      </svg>

      <div className="absolute inset-x-[6cqw] top-[15cqh]">
        <SplitReveal as="p" by="words" at={0.3} className="max-w-[60cqw] font-serif text-[9cqw] leading-[1] italic">
          {`In just ${hero.window.days >= 360 ? 'one year' : `${Math.round(hero.window.days)} days`}, you watched`}
        </SplitReveal>
        <CountUp to={hero.total} at={0.8} duration={1.6} className="mt-[2cqh] block leading-[0.88] font-extrabold tracking-[-0.05em]" style={{ fontSize: fitCqw(grouped.format(hero.total).length, 34, 88, 0.5) }} />
        <p className="text-[10cqw] leading-none font-bold tracking-[-0.03em]">{noun}.</p>
      </div>

      <div data-estimate className="absolute inset-x-0 top-[57cqh] px-[6cqw] py-[3cqh]" style={{ background: INK, color: LIME }}>
        <p className="font-mono text-[3.4cqw] uppercase tracking-[0.14em]">Estimate · at this pace, for a year</p>
        <p className="mt-[1cqh] leading-[0.9] font-extrabold tracking-[-0.04em]" style={{ fontSize: fitCqw(grouped.format(hero.perYearEstimate).length + 1, 22, 88, 0.5) }}>
          ≈<CountUp to={hero.perYearEstimate} at={2.6} duration={2.4} />
        </p>
      </div>

      {other && (
        <SplitReveal as="p" by="lines" at={3.6} className="absolute inset-x-[6cqw] bottom-[8cqh] text-[7cqw] leading-[1.05] font-semibold tracking-[-0.02em]">
          {`Plus ${grouped.format(other.total)} posts viewed ${windowLabel(other.window.days)}.`}
        </SplitReveal>
      )}
    </div>
  )
}
