import { useRef } from 'react'
import { gsap, SplitReveal, useSceneTimeline } from '../motion'
import { grouped, hourLabel } from './fit'
import { Kicker } from './parts'

export interface NightOwlProps {
  byHour: number[]
  peakHour: number
  lateNight: number
}

const PLUM = 'var(--color-plum)'
const TANGERINE = 'var(--color-tangerine)'
const BONE = 'var(--color-bone)'

function title(hour: number) {
  if (hour >= 22 || hour < 5) return 'Night owl.'
  if (hour < 11) return 'Early bird.'
  if (hour < 17) return 'Daytime texter.'
  return 'After-hours talker.'
}

const C = 100
const INNER = 34
const SPAN = 58

/** Point on the dial for an hour (midnight at the top) at radius r. */
function at(hour: number, r: number) {
  const a = (hour / 24) * Math.PI * 2 - Math.PI / 2
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) }
}

export function NightOwl({ byHour, peakHour, lateNight }: NightOwlProps) {
  const scene = useRef<HTMLDivElement>(null)
  const max = Math.max(...byHour, 1)

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    tl.from(q('[data-spoke]'), { strokeDashoffset: 1, duration: 0.7, ease: 'expo.out', stagger: 0.05 }, 0.5)
      .from(q('[data-hand]'), { rotation: -360, svgOrigin: `${C} ${C}`, duration: 1.6, ease: 'power4.out' }, 1.6)
      .from(q('[data-peak]'), { scale: 0, svgOrigin: `${C} ${C}`, duration: 0.5, ease: 'back.out(3)' }, 3)
  })

  const tip = at(peakHour, INNER + SPAN + 6)

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: PLUM, color: TANGERINE }}>
      <Kicker>Messages · when you text</Kicker>

      <SplitReveal as="h2" by="chars" at={0.2} className="absolute inset-x-[6cqw] top-[14cqh] text-[16cqw] leading-[0.9] font-extrabold tracking-[-0.04em]" style={{ fontStretch: '80%' }}>
        {title(peakHour)}
      </SplitReveal>

      <svg viewBox="0 0 200 200" aria-hidden className="absolute left-1/2 top-[25cqh] w-[96cqw] -translate-x-1/2">
        <circle cx={C} cy={C} r={INNER - 6} fill="none" stroke={TANGERINE} strokeWidth="1" strokeDasharray="2 3" />
        {byHour.map((n, h) => {
          const a = at(h, INNER)
          const b = at(h, INNER + Math.max(3, (n / max) * SPAN))
          return (
            <line
              key={h}
              data-spoke
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              pathLength={1}
              strokeDasharray="1"
              stroke={h === peakHour ? BONE : TANGERINE}
              strokeWidth={h === peakHour ? 7 : 5}
              strokeLinecap="round"
            />
          )
        })}
        {[0, 6, 12, 18].map((h) => {
          const p = at(h, INNER - 14)
          return (
            <text key={h} x={p.x} y={p.y + 2.5} textAnchor="middle" fontSize="7" fill={TANGERINE} className="font-mono">
              {h === 0 ? '12a' : h === 12 ? '12p' : h < 12 ? `${h}a` : `${h - 12}p`}
            </text>
          )
        })}
        <g data-hand>
          <line x1={C} y1={C} x2={at(peakHour, INNER - 4).x} y2={at(peakHour, INNER - 4).y} stroke={BONE} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={C} cy={C} r="3.5" fill={BONE} />
        </g>
        <circle data-peak cx={tip.x} cy={tip.y} r="4" fill={BONE} />
      </svg>

      <div className="absolute inset-x-[6cqw] bottom-[8cqh]">
        <SplitReveal as="p" by="words" at={2.9} className="font-serif text-[9cqw] leading-[1] italic" style={{ color: BONE }}>
          Your busiest hour was
        </SplitReveal>
        <SplitReveal as="p" by="chars" at={3.2} className="text-[15cqw] leading-[0.95] font-extrabold tracking-[-0.04em]">
          {hourLabel(peakHour)}
        </SplitReveal>
        {lateNight > 0 && (
          <SplitReveal as="p" by="lines" at={3.9} className="mt-[1.5cqh] font-mono text-[3.4cqw] uppercase tracking-[0.1em]">
            {grouped.format(lateNight)} messages sent between midnight and 5 a.m.
          </SplitReveal>
        )}
      </div>
    </div>
  )
}
