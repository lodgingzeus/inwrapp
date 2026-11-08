import { useRef } from 'react'
import { gsap, SplitReveal, useSceneTimeline } from '../motion'
import { Kicker } from './parts'

export interface InterestsProps {
  interests: string[]
}

const BUTTER = 'var(--color-butter)'
const PLUM = 'var(--color-plum)'
const MAX_TAGS = 12
/** Total characters shown, so long category names can't bury the headline. */
const MAX_CHARS = 120
const MAX_TAG_CHARS = 26
const STYLES = [
  { bg: 'var(--color-cobalt)', ink: 'var(--color-bone)' },
  { bg: PLUM, ink: BUTTER },
  { bg: 'var(--color-coral)', ink: 'var(--color-ink)' },
  { bg: 'var(--color-ink)', ink: 'var(--color-lime)' },
]
const TILTS = [-6, 4, -2, 7, -8, 3, 5, -4]
const SIZES = [8.5, 6.5, 7.5, 6, 9, 7]

export function Interests({ interests }: InterestsProps) {
  const scene = useRef<HTMLDivElement>(null)
  const tags: string[] = []
  let chars = 0
  for (const raw of interests) {
    const t = raw.length > MAX_TAG_CHARS ? `${raw.slice(0, MAX_TAG_CHARS - 1).trimEnd()}…` : raw
    if (tags.length === MAX_TAGS || (tags.length > 0 && chars + t.length > MAX_CHARS)) break
    tags.push(t)
    chars += t.length
  }

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    tl.from(q('[data-tag]'), { y: '-80cqh', rotation: () => gsap.utils.random(-50, 50), duration: 1.1, ease: 'bounce.out', stagger: 0.12 }, 1.2)
  })

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: BUTTER, color: PLUM }}>
      <Kicker>Ads · your interests, apparently</Kicker>

      <SplitReveal as="p" by="words" at={0.2} className="absolute inset-x-[6cqw] top-[15cqh] text-[11cqw] leading-[0.95] font-extrabold tracking-[-0.04em]">
        Instagram thinks
      </SplitReveal>
      <SplitReveal as="p" by="words" at={0.6} className="absolute inset-x-[6cqw] top-[26cqh] font-serif text-[13cqw] leading-[0.95] italic">
        you&rsquo;re into&hellip;
      </SplitReveal>

      <ul className="absolute inset-x-[5cqw] bottom-[16cqh] flex flex-wrap-reverse items-end gap-x-[2.5cqw] gap-y-[3.6cqw]">
        {tags.map((t, i) => {
          const s = STYLES[i % STYLES.length]
          return (
            <li
              key={i}
              data-tag
              className="max-w-full truncate rounded-full px-[4cqw] py-[1.4cqw] leading-[1.15] font-bold tracking-[-0.02em]"
              style={{ background: s.bg, color: s.ink, rotate: `${TILTS[i % TILTS.length]}deg`, fontSize: `${t.length > 16 ? 6 : SIZES[i % SIZES.length]}cqw` }}
            >
              {t}
            </li>
          )
        })}
      </ul>

      <SplitReveal as="p" by="lines" at={3.2} className="absolute inset-x-[6cqw] bottom-[7cqh] font-mono text-[3.2cqw] uppercase tracking-[0.1em]">
        From the ad categories Instagram uses to reach you. Accurate? Discuss.
      </SplitReveal>
    </div>
  )
}
