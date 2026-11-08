import { motion, type MotionValue } from 'motion/react'

interface Props {
  count: number
  index: number
  progress: MotionValue<number>
}

/** One bar per slide. Colour comes from the frame's --chrome variable, set per slide. */
export function ProgressBars({ count, index, progress }: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex gap-1.5 px-3 pt-[max(10px,env(safe-area-inset-top))]">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="h-[3px] flex-1 overflow-hidden rounded-full"
          style={{ background: 'color-mix(in srgb, var(--chrome) 28%, transparent)' }}
        >
          {i === index ? (
            <motion.div className="h-full origin-left" style={{ scaleX: progress, background: 'var(--chrome)' }} />
          ) : (
            <div className="h-full" style={{ background: i < index ? 'var(--chrome)' : 'transparent' }} />
          )}
        </div>
      ))}
    </div>
  )
}
