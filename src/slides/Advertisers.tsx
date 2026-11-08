import { useRef } from 'react'
import { gsap, Marquee, SplitReveal, useSceneTimeline } from '../motion'
import { floorNice, fitCqw } from './fit'
import { Kicker } from './parts'

export interface AdvertisersProps {
  total: number
  sample: string[]
}

const INK = 'var(--color-ink)'
const CORAL = 'var(--color-coral)'
const BONE = 'var(--color-bone)'
const ROWS = 18

/** The sample rotated by `n`, so neighbouring rows don't line up. */
const rotate = (list: string[], n: number) => list.map((_, i) => list[(i + n) % list.length])

export function Advertisers({ total, sample }: AdvertisersProps) {
  const scene = useRef<HTMLDivElement>(null)
  const label = floorNice(total)

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    tl.from(q('[data-row]'), { opacity: 0, duration: 0.4, stagger: 0.06 }, 0)
      .from(q('[data-band]'), { scaleX: 0, transformOrigin: 'left center', duration: 0.7, ease: 'expo.out' }, 1.2)
      .from(q('[data-big]'), { yPercent: 110, duration: 0.9, ease: 'expo.out' }, 1.6)
  })

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: INK, color: CORAL }}>
      {sample.length > 0 && (
        <div aria-hidden className="absolute inset-x-0 top-[13cqh] bottom-0 overflow-hidden">
          {Array.from({ length: ROWS }, (_, i) => (
            <div key={i} data-row>
              <Marquee
                items={rotate(sample, i * 3)}
                durationS={5 + (i % 3) * 1.5}
                reverse={i % 2 === 1}
                className="font-mono text-[6cqw] leading-[1.7] uppercase"
                style={{ color: BONE, opacity: 0.28 }}
              />
            </div>
          ))}
        </div>
      )}

      <Kicker>Ads · who has your data</Kicker>

      <div data-band className="absolute -inset-x-[6cqw] top-[34cqh] -rotate-[4deg] px-[12cqw] py-[3cqh]" style={{ background: CORAL, color: INK }}>
        <div className="overflow-hidden">
          <p data-big className="leading-[0.88] font-extrabold tracking-[-0.05em]" style={{ fontSize: fitCqw(label.length, 30, 82, 0.5) }}>
            {label}
          </p>
        </div>
        <p className="font-serif text-[9cqw] leading-[1] italic">companies</p>
      </div>

      <SplitReveal as="p" by="lines" at={2.6} className="absolute inset-x-0 bottom-0 px-[6cqw] pb-[9cqh] pt-[3cqh] text-[8cqw] leading-[1.02] font-bold tracking-[-0.02em]" style={{ color: BONE, background: INK }}>
        targeted ads at you using your activity or information.
      </SplitReveal>
    </div>
  )
}
