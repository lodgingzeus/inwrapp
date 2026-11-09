import { useEffect, useRef, type RefObject } from 'react'
import { useReducedMotion } from 'motion/react'
import { gsap, useGSAP } from './gsap'
import { useStory } from '../story/context'

export type SceneBuild = (tl: gsap.core.Timeline, el: HTMLElement) => void | (() => void)

/**
 * Builds a GSAP timeline for one element inside a slide. Positions are seconds
 * from the moment the slide mounts. The timeline follows the story's pause
 * state, and jumps straight to its end state under prefers-reduced-motion.
 */
export function useSceneTimeline(scope: RefObject<HTMLElement | null>, build: SceneBuild) {
  const { paused, still } = useStory()
  // A still render (saving a slide as an image) shows the end state, like reduced motion.
  const reduced = (useReducedMotion() ?? false) || still
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const pausedRef = useRef(paused)

  useGSAP(
    () => {
      const el = scope.current
      if (!el) return
      const tl = gsap.timeline({ paused: true })
      const cleanup = build(tl, el)
      tlRef.current = tl
      if (reduced) tl.progress(1)
      else if (!pausedRef.current) tl.play()
      return () => {
        tlRef.current = null
        cleanup?.()
      }
    },
    { scope, dependencies: [reduced] },
  )

  useEffect(() => {
    pausedRef.current = paused
    const tl = tlRef.current
    if (tl && !reduced) tl.paused(paused)
  }, [paused, reduced])
}
