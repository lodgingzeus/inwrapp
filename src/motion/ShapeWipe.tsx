import type { ReactNode } from 'react'
import { motion, type Variants } from 'motion/react'

export interface WipeCustom {
  /** 1 = forward (wipe from the right edge), -1 = back (from the left). */
  dir: number
  reduced: boolean
}

const ease = [0.76, 0, 0.24, 1] as const
const at = (dir: number) => (dir > 0 ? '100% 50%' : '0% 50%')

const variants: Variants = {
  enter: ({ dir, reduced }: WipeCustom) =>
    reduced ? { opacity: 0, zIndex: 2 } : { clipPath: `circle(0% at ${at(dir)})`, zIndex: 2 },
  center: ({ dir, reduced }: WipeCustom) =>
    reduced
      ? { opacity: 1, zIndex: 2, transition: { duration: 0.35 } }
      : {
          clipPath: `circle(150% at ${at(dir)})`,
          zIndex: 2,
          transition: { duration: 0.75, ease },
          transitionEnd: { clipPath: 'none' },
        },
  exit: ({ reduced }: WipeCustom) =>
    reduced
      ? { opacity: 0, zIndex: 1, transition: { duration: 0.35 } }
      : { filter: 'brightness(0.55)', scale: 0.96, zIndex: 1, transition: { duration: 0.75, ease } },
}

/**
 * Slide transition: the incoming slide is revealed by a circle that grows from
 * the edge the user tapped, over the outgoing slide. Crossfade under reduced motion.
 * Must be the direct, keyed child of AnimatePresence.
 */
export function ShapeWipe({ custom, children }: { custom: WipeCustom; children: ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0"
      custom={custom}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}
