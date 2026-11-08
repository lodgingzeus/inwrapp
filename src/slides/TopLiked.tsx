import { useRef } from 'react'
import { gsap, SplitReveal, Sticker, useSceneTimeline } from '../motion'
import type { Ranked } from '../stats/types'
import { fitCqw, grouped, longest } from './fit'
import { Kicker } from './parts'

export interface TopLikedProps {
  top: Ranked[]
}

const LIME = 'var(--color-lime)'
const INK = 'var(--color-ink)'
const CORAL = 'var(--color-coral)'

export function TopLiked({ top }: TopLikedProps) {
  const scene = useRef<HTMLDivElement>(null)
  const [first, ...rest] = top
  const restSize = fitCqw(Math.min(20, longest(rest.map((r) => `@${r.name}`))), 9, 66, 0.52)

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    // Usernames slam in one at a time from the bottom of the list, #1 last.
    tl.from(
      q('[data-row]'),
      { scale: 1.7, opacity: 0, rotation: () => gsap.utils.random(-9, 9), duration: 0.45, ease: 'back.out(2.2)', stagger: { each: 0.42, from: 'end' } },
      1.1,
    ).from(q('[data-bar]'), { scaleX: 0, transformOrigin: 'left center', duration: 0.6, ease: 'expo.out' }, 1.1 + rest.length * 0.42)
  })

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: LIME, color: INK }}>
      <Kicker>Likes · most double-tapped</Kicker>

      <SplitReveal as="p" by="lines" at={0.2} className="absolute inset-x-[6cqw] top-[15cqh] text-[9.5cqw] leading-[1] font-bold tracking-[-0.03em]">
        The accounts your thumb <em className="font-serif font-normal italic">couldn&rsquo;t</em> leave alone.
      </SplitReveal>

      <ol className="absolute inset-x-[6cqw] top-[38cqh] flex flex-col gap-[1.6cqh]">
        <li data-row className="relative">
          <div data-bar aria-hidden className="absolute -inset-x-[3cqw] -inset-y-[1cqh] -rotate-[2deg]" style={{ background: INK }} />
          <div className="relative flex items-baseline gap-[3cqw]" style={{ color: LIME }}>
            <span className="font-mono text-[4cqw]">01</span>
            <span
              className="min-w-0 truncate leading-[1.1] font-extrabold tracking-[-0.03em]"
              style={{ fontSize: fitCqw(Math.min(18, [...first.name].length + 1), 12, 64, 0.52), fontStretch: '85%' }}
            >
              @{first.name}
            </span>
          </div>
          <p className="relative mt-[0.4cqh] pl-[8cqw] font-mono text-[3.4cqw] uppercase tracking-[0.1em]" style={{ color: LIME }}>
            {grouped.format(first.count)} likes
          </p>
        </li>
        {rest.map((r, i) => (
          <li key={r.name} data-row className="flex items-baseline gap-[3cqw] border-b-[0.5cqw] pb-[1cqh]" style={{ borderColor: INK }}>
            <span className="font-mono text-[4cqw]">{String(i + 2).padStart(2, '0')}</span>
            <span className="min-w-0 flex-1 truncate leading-[1.1] font-bold tracking-[-0.02em]" style={{ fontSize: restSize }}>
              @{r.name}
            </span>
            <span className="font-mono text-[3.4cqw] tabular-nums">{grouped.format(r.count)}</span>
          </li>
        ))}
      </ol>

      <Sticker
        label="obsessed"
        fill={CORAL}
        ink={INK}
        at={1.4 + rest.length * 0.42}
        size="25cqw"
        tilt={12}
        className="right-[3cqw] top-[29cqh]"
      />
    </div>
  )
}
