import { useRef } from 'react'
import { gsap, SplitReveal, useSceneTimeline } from '../motion'
import type { Ranked } from '../stats/types'
import { Kicker } from './parts'
import { grouped } from './fit'

export interface TopEmojiProps {
  emoji: Ranked[]
}

const TANGERINE = 'var(--color-tangerine)'
const PLUM = 'var(--color-plum)'
const BONE = 'var(--color-bone)'
const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'

export function TopEmoji({ emoji }: TopEmojiProps) {
  const scene = useRef<HTMLDivElement>(null)
  const [first, ...rest] = emoji

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    // Whole emoji are animated as single spans: splitting them by character would break graphemes.
    tl.from(q('[data-disc]'), { scale: 0, duration: 1, ease: 'elastic.out(1, 0.5)' }, 0.5)
      .from(q('[data-hero]'), { yPercent: -260, duration: 1.3, ease: 'bounce.out' }, 0.9)
      .fromTo(q('[data-hero]'), { scaleY: 0.7, scaleX: 1.2 }, { scaleY: 1, scaleX: 1, duration: 0.6, ease: 'elastic.out(1.2, 0.3)', transformOrigin: '50% 100%', immediateRender: false }, 2.1)
      .from(q('[data-small]'), { scale: 0, rotation: -40, duration: 0.5, ease: 'back.out(3)', stagger: 0.12 }, 2.7)
  })

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: TANGERINE, color: PLUM }}>
      <Kicker>Messages · emoji</Kicker>

      <SplitReveal as="p" by="words" at={0.2} className="absolute inset-x-[6cqw] top-[15cqh] text-[10.5cqw] leading-[0.95] font-extrabold tracking-[-0.04em]">
        If your year had a face, it was
      </SplitReveal>

      <div data-disc aria-hidden className="absolute left-[14cqw] top-[33cqh] h-[72cqw] w-[72cqw] rounded-full" style={{ background: PLUM }} />
      <span data-hero role="img" aria-label={first.name} className="absolute left-0 right-0 top-[35cqh] text-center text-[46cqw] leading-none" style={{ fontFamily: EMOJI_FONT }}>
        {first.name}
      </span>

      <div className="absolute inset-x-[6cqw] bottom-[8cqh]">
        <p className="font-serif text-[9cqw] leading-none italic" style={{ color: BONE }}>
          used {grouped.format(first.count)} times.
        </p>
        {rest.length > 0 && (
          <ul className="mt-[2.5cqh] flex gap-[4cqw]">
            {rest.map((e) => (
              <li key={e.name} data-small className="flex flex-col items-center">
                <span role="img" aria-label={e.name} className="text-[11cqw] leading-none" style={{ fontFamily: EMOJI_FONT }}>
                  {e.name}
                </span>
                <span className="mt-[0.6cqh] font-mono text-[3cqw] tabular-nums">{grouped.format(e.count)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
