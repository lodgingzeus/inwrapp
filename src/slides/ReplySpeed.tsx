import { useRef } from 'react'
import { gsap, SplitReveal, useSceneTimeline } from '../motion'
import type { ReplySpeed as Speed } from '../stats/types'
import { fitCqw, formatDuration, longest } from './fit'
import { Kicker } from './parts'

export interface ReplySpeedProps {
  fastest: Speed | null
  slowest: Speed | null
  yoursMedianMs: number | null
}

const BUTTER = 'var(--color-butter)'
const INK = 'var(--color-ink)'
const CORAL = 'var(--color-coral)'

function Lane({ who, tag, color, kind }: { who: Speed; tag: string; color: string; kind: 'fast' | 'slow' }) {
  return (
    <div className="mt-[4cqh]">
      <p className="font-mono text-[3.4cqw] uppercase tracking-[0.14em]">{tag}</p>
      <p className="truncate leading-[1.05] font-extrabold tracking-[-0.03em]" style={{ fontSize: fitCqw(Math.min(18, longest([who.name])), 10, 88, 0.5) }}>
        {who.name}
      </p>
      <div data-lane className="relative mt-[1.2cqh] h-[11cqw] border-b-[0.6cqw] border-dashed" style={{ borderColor: INK }}>
        <div data-runner={kind} className="absolute bottom-[1cqw] left-0 h-[9cqw] w-[9cqw] rounded-full" style={{ background: color }}>
          <span className="absolute left-[55%] top-[30%] h-[1.6cqw] w-[1.6cqw] rounded-full" style={{ background: kind === 'fast' ? BUTTER : INK }} />
        </div>
        <span
          aria-hidden
          className="absolute bottom-0 right-0 h-full w-[2.4cqw]"
          style={{ background: `repeating-linear-gradient(${INK} 0 1.2cqw, transparent 1.2cqw 2.4cqw)` }}
        />
      </div>
      <p className="mt-[1cqh] font-serif text-[8cqw] leading-none italic">
        replies in {kind === 'slow' ? 'about ' : ''}
        <span className="font-display font-extrabold not-italic">{formatDuration(who.medianMs)}</span>
      </p>
    </div>
  )
}

export function ReplySpeed({ fastest, slowest, yoursMedianMs }: ReplySpeedProps) {
  const scene = useRef<HTMLDivElement>(null)

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    const travel = (runner: Element) => {
      const lane = runner.parentElement!
      // Stop just short of the finish post.
      return lane.clientWidth - (runner as HTMLElement).offsetWidth * 1.4
    }
    // The fast one sprints to the line; the slow one barely leaves the start.
    tl.to(q('[data-runner=fast]'), { x: (_, t) => travel(t), duration: 1.1, ease: 'power3.in' }, 1.4)
      .to(q('[data-runner=fast]'), { rotation: 360, duration: 0.5, ease: 'back.out(2)' }, 2.5)
      .to(q('[data-runner=slow]'), { x: (_, t) => travel(t) * 0.22, duration: 5, ease: 'none' }, 1.4)
  })

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: BUTTER, color: INK }}>
      <Kicker>Messages · reply speed</Kicker>

      <div className="absolute inset-x-[6cqw] top-[15cqh]">
        <SplitReveal as="p" by="words" at={0.2} className="text-[11cqw] leading-[0.95] font-extrabold tracking-[-0.04em]">
          On your marks.
        </SplitReveal>
        {fastest && <Lane who={fastest} tag="Fastest replier" color={INK} kind="fast" />}
        {slowest && <Lane who={slowest} tag="Leaves you on read" color={CORAL} kind="slow" />}
      </div>

      {yoursMedianMs !== null && (
        <SplitReveal as="p" by="lines" at={3} className="absolute inset-x-[6cqw] bottom-[8cqh] font-mono text-[3.6cqw] uppercase tracking-[0.1em]">
          And you? You usually reply in {formatDuration(yoursMedianMs)}.
        </SplitReveal>
      )}
    </div>
  )
}
