import { useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { SplitText } from './gsap'
import { useSceneTimeline } from './useSceneTimeline'

const COMBINING = /\p{M}/u

interface Props {
  children: ReactNode
  as?: ElementType
  by?: 'lines' | 'words' | 'chars'
  /** Seconds after the slide mounts. */
  at?: number
  stagger?: number
  duration?: number
  className?: string
  style?: CSSProperties
}

/** Text that rises into view line by line, word by word or letter by letter, clipped by a line mask. */
export function SplitReveal({
  children,
  as: Tag = 'p',
  by = 'words',
  at = 0,
  stagger,
  duration = 0.9,
  className,
  style,
}: Props) {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(ref, (tl, el) => {
    // Splitting by character breaks clusters held together by combining marks (Devanagari conjuncts,
    // emoji variation selectors), so such text reveals word by word instead.
    const unit = by === 'chars' && COMBINING.test(el.textContent ?? '') ? 'words' : by
    const split = SplitText.create(el, {
      type: unit === 'lines' ? 'lines' : `lines,${unit}`,
      mask: 'lines',
      aria: 'auto',
    })
    const parts = split[unit]
    tl.from(
      parts,
      {
        yPercent: 118,
        rotate: unit === 'chars' ? 8 : 3,
        duration,
        ease: 'expo.out',
        stagger: stagger ?? (unit === 'chars' ? 0.045 : unit === 'words' ? 0.08 : 0.14),
      },
      at,
    )
    return () => split.revert()
  })

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  )
}
