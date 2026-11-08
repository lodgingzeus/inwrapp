import { useRef } from 'react'
import { gsap, SplitReveal, useSceneTimeline } from '../motion'
import type { ConnectionStats } from '../stats/types'
import { Kicker } from './parts'
import { grouped } from './fit'

export type FollowersProps = ConnectionStats

const MINT = 'var(--color-mint)'
const FOREST = 'var(--color-forest)'
const BONE = 'var(--color-bone)'

function tilt(followers: number, following: number) {
  // Positive tips the right (following) end down.
  const lean = (following - followers) / Math.max(followers, following, 1)
  return Math.max(-14, Math.min(14, lean * 40))
}

function Seesaw({ followers, following }: { followers: number; following: number }) {
  const angle = tilt(followers, following)
  const r = (n: number) => 7 + 9 * Math.sqrt(n / Math.max(followers, following, 1))
  return (
    <svg viewBox="0 0 200 110" aria-hidden className="w-full">
      <path d="M100 66 L82 104 H118 Z" fill={FOREST} />
      <g data-plank data-angle={angle}>
        <rect x="8" y="60" width="184" height="7" rx="3.5" fill={FOREST} />
        <circle cx={28} cy={60 - r(followers)} r={r(followers)} fill={BONE} />
        <circle cx={172} cy={60 - r(following)} r={r(following)} fill={FOREST} />
      </g>
    </svg>
  )
}

export function Followers({ followers, following, notFollowingBack, recentlyUnfollowed }: FollowersProps) {
  const scene = useRef<HTMLDivElement>(null)
  const both = followers !== null && following !== null

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    const plank = q('[data-plank]')[0]
    if (plank) {
      const angle = Number(plank.getAttribute('data-angle'))
      // Wobble level first, then tip to the heavier side.
      tl.fromTo(plank, { rotation: -angle }, { rotation: angle, svgOrigin: '100 64', duration: 1.8, ease: 'elastic.out(1, 0.3)' }, 1.2)
    }
    tl.from(q('[data-stat]'), { yPercent: 60, opacity: 0, duration: 0.6, ease: 'expo.out', stagger: 0.15 }, 0.4)
  })

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: MINT, color: FOREST }}>
      <Kicker>Followers</Kicker>

      <SplitReveal as="p" by="words" at={0.2} className="absolute inset-x-[6cqw] top-[15cqh] text-[11cqw] leading-[0.95] font-extrabold tracking-[-0.04em]">
        The balance of power.
      </SplitReveal>

      <div className="absolute inset-x-[6cqw] top-[30cqh] flex justify-between">
        {followers !== null && (
          <div data-stat>
            <p className="text-[15cqw] leading-none font-extrabold tracking-[-0.04em] tabular-nums">{grouped.format(followers)}</p>
            <p className="font-serif text-[7cqw] italic">follow you</p>
          </div>
        )}
        {following !== null && (
          <div data-stat className="text-right">
            <p className="text-[15cqw] leading-none font-extrabold tracking-[-0.04em] tabular-nums">{grouped.format(following)}</p>
            <p className="font-serif text-[7cqw] italic">you follow</p>
          </div>
        )}
      </div>

      {both && (
        <div className="absolute inset-x-[4cqw] top-[44cqh]">
          <Seesaw followers={followers} following={following} />
        </div>
      )}

      <div className="absolute inset-x-[6cqw] bottom-[8cqh] flex flex-col gap-[2cqh]">
        {notFollowingBack !== null && notFollowingBack > 0 && (
          <SplitReveal as="p" by="lines" at={3} className="text-[7.5cqw] leading-[1.02] font-bold tracking-[-0.02em]">
            <span className="font-serif font-normal italic">{grouped.format(notFollowingBack)}</span> people you follow don&rsquo;t follow you back.
          </SplitReveal>
        )}
        {recentlyUnfollowed !== null && recentlyUnfollowed > 0 && (
          <SplitReveal as="p" by="lines" at={3.6} className="font-mono text-[3.4cqw] uppercase tracking-[0.1em]">
            {`And you recently unfollowed ${grouped.format(recentlyUnfollowed)}. No hard feelings.`}
          </SplitReveal>
        )}
      </div>
    </div>
  )
}
