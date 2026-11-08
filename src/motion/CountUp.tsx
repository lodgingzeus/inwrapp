import { useRef, type CSSProperties } from 'react'
import { useSceneTimeline } from './useSceneTimeline'

const grouped = new Intl.NumberFormat('en-US')

interface Props {
  to: number
  /** Seconds after the slide mounts. */
  at?: number
  duration?: number
  format?: (n: number) => string
  className?: string
  style?: CSSProperties
}

/** A number that counts up with easing. Renders the final value for reduced motion and screen readers. */
export function CountUp({ to, at = 0, duration = 1.8, format = grouped.format, className = '', style }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useSceneTimeline(ref, (tl, el) => {
    // Write to React's own text node so React never loses track of it.
    const text = el.firstChild
    if (!text) return
    const value = { n: 0 }
    const render = () => {
      text.nodeValue = format(Math.round(value.n))
    }
    render()
    tl.to(value, { n: to, duration, ease: 'expo.out', onUpdate: render }, at)
  })

  return (
    <span ref={ref} aria-label={format(to)} className={`tabular-nums ${className}`} style={style}>
      {format(to)}
    </span>
  )
}
