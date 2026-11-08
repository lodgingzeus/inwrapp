import { useRef } from 'react'
import { gsap, Marquee, SplitReveal, useSceneTimeline } from '../motion'

export interface IntroProps {
  username: string | null
  year: number
}

const LIME = 'var(--color-lime)'
const INK = 'var(--color-ink)'

export function Intro({ username, year }: IntroProps) {
  const shapes = useRef<HTMLDivElement>(null)

  useSceneTimeline(shapes, (tl, el) => {
    const q = gsap.utils.selector(el)
    tl.from(q('[data-circle]'), { scale: 0, duration: 1.2, ease: 'elastic.out(1, 0.55)' }, 0.1)
      .from(q('[data-ring]'), { scale: 0.2, rotation: -90, opacity: 0, duration: 1, ease: 'expo.out' }, 0.3)
      .from(
        q('[data-stripe]'),
        { scaleX: 0, transformOrigin: 'left center', duration: 0.8, ease: 'expo.out', stagger: 0.08 },
        0.45,
      )
      .from(q('[data-band]'), { xPercent: 110, duration: 0.9, ease: 'expo.out' }, 2.1)
  })

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: INK, color: LIME }}>
      <div ref={shapes} aria-hidden className="absolute inset-0">
        <div
          data-circle
          className="absolute rounded-full"
          style={{ width: '38cqh', height: '38cqh', right: '-14cqh', top: '17cqh', background: LIME }}
        />
        <div
          data-ring
          className="absolute rounded-full border-[1.2cqw]"
          style={{ width: '20cqh', height: '20cqh', left: '-6cqh', top: '13cqh', borderColor: LIME }}
        />
        <div className="absolute flex flex-col gap-[2.4cqw]" style={{ left: '6cqw', top: '56cqh', width: '60cqw' }}>
          {[100, 72, 46].map((w) => (
            <div key={w} data-stripe className="h-[2.2cqw]" style={{ width: `${w}%`, background: LIME }} />
          ))}
        </div>
        <div
          data-band
          className="absolute -left-[5cqw] -right-[5cqw] -rotate-[5deg] py-[2.2cqw]"
          style={{ bottom: '5cqh', background: LIME, color: INK }}
        >
          <Marquee
            durationS={14}
            className="font-mono text-[4.2cqw] font-medium uppercase"
            items={['every like', 'every save', 'every 3 a.m. message', `${year} on the grid`]}
          />
        </div>
      </div>

      <p className="absolute left-[6cqw] top-[9cqh] font-mono text-[3.4cqw] uppercase tracking-[0.18em]">
        {username ? `@${username}` : 'you'} — {year}
      </p>

      <SplitReveal
        as="h1"
        by="chars"
        at={0.55}
        className="absolute left-[5cqw] top-[33cqh] text-[33cqw] leading-[0.9] font-extrabold tracking-[-0.02em] mix-blend-difference"
        style={{ fontStretch: '78%' }}
      >
        inwrap
      </SplitReveal>

      <div className="absolute inset-x-[6cqw] bottom-[17cqh]">
        <SplitReveal as="p" by="words" at={1.3} className="text-[14cqw] leading-[0.95] font-bold tracking-[-0.03em]">
          Your year,
        </SplitReveal>
        <SplitReveal
          as="p"
          by="chars"
          at={1.6}
          stagger={0.035}
          className="font-serif text-[19cqw] leading-[1] italic"
          style={{ color: 'var(--color-bone)' }}
        >
          unfiltered.
        </SplitReveal>
      </div>
    </div>
  )
}
