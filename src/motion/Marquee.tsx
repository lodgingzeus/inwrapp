import type { CSSProperties } from 'react'

interface Props {
  items: string[]
  /** Seconds for one full loop. */
  durationS?: number
  reverse?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * An endless strip of text. Pure CSS, so the story frame's data-paused rule
 * freezes it and prefers-reduced-motion stops it.
 */
export function Marquee({ items, durationS = 16, reverse = false, className = '', style }: Props) {
  const run = `${items.join('  ·  ')}  ·  `.repeat(2)
  const trackStyle = {
    '--marquee-duration': `${durationS}s`,
    animationDirection: reverse ? 'reverse' : 'normal',
  } as CSSProperties

  return (
    <div aria-hidden className={`overflow-hidden whitespace-pre ${className}`} style={style}>
      <div className="marquee-track flex w-max" style={trackStyle}>
        <span>{run}</span>
        <span>{run}</span>
      </div>
    </div>
  )
}
