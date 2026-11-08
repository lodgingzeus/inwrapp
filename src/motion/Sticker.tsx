import { useRef, type CSSProperties } from 'react'
import { useSceneTimeline } from './useSceneTimeline'

function starPath(points: number, outer: number, inner: number) {
  const step = Math.PI / points
  let d = ''
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = i * step - Math.PI / 2
    d += `${i === 0 ? 'M' : 'L'}${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`
  }
  return `${d}Z`
}

const STAR = starPath(14, 50, 42)

interface Props {
  label: string
  fill: string
  ink: string
  /** Seconds after the slide mounts. */
  at?: number
  /** Any CSS length; container units (cqw) keep it in scale with the slide. */
  size?: string
  tilt?: number
  className?: string
  style?: CSSProperties
}

/** A spiky badge that slaps onto the slide with an overshoot, then spins slowly. */
export function Sticker({ label, fill, ink, at = 0, size = '26cqw', tilt = -12, className = '', style }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useSceneTimeline(ref, (tl, el) => {
    tl.from(el, { scale: 0, rotation: -140, duration: 0.75, ease: 'back.out(2.4)' }, at)
  })

  return (
    <div ref={ref} className={`absolute ${className}`} style={{ width: size, height: size, rotate: `${tilt}deg`, ...style }}>
      <svg viewBox="0 0 100 100" className="spin-slow absolute inset-0 h-full w-full" aria-hidden>
        <path d={STAR} fill={fill} />
      </svg>
      <span
        className="absolute inset-0 grid place-items-center text-center leading-[0.85] font-extrabold uppercase"
        style={{ color: ink, fontSize: `calc(${size} * 0.2)`, fontStretch: '80%' }}
      >
        {label}
      </span>
    </div>
  )
}
