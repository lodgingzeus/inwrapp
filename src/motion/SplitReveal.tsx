import { useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { SplitText } from './gsap'
import { useSceneTimeline } from './useSceneTimeline'

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
    const split = SplitText.create(el, {
      type: by === 'lines' ? 'lines' : `lines,${by}`,
      mask: 'lines',
      aria: 'auto',
    })
    const parts = split[by]
    tl.from(
      parts,
      {
        yPercent: 118,
        rotate: by === 'chars' ? 8 : 3,
        duration,
        ease: 'expo.out',
        stagger: stagger ?? (by === 'chars' ? 0.045 : by === 'words' ? 0.08 : 0.14),
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
