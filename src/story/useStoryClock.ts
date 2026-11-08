import { useEffect, useRef } from 'react'
import { useMotionValue, type MotionValue } from 'motion/react'

// A long frame gap (tab in background, debugger) must not skip a slide.
const MAX_FRAME_MS = 100

/**
 * One clock drives both the progress bar and auto-advance, so they can't drift
 * apart. Restarts whenever `slideKey` changes; stops counting while paused.
 */
export function useStoryClock(
  slideKey: string,
  durationMs: number,
  paused: boolean,
  onComplete: () => void,
): MotionValue<number> {
  const progress = useMotionValue(0)
  const pausedRef = useRef(paused)
  const completeRef = useRef(onComplete)

  useEffect(() => {
    pausedRef.current = paused
    completeRef.current = onComplete
  })

  useEffect(() => {
    let elapsed = 0
    let last = performance.now()
    let frame = 0
    progress.set(0)

    const tick = (now: number) => {
      const dt = Math.min(now - last, MAX_FRAME_MS)
      last = now
      if (!pausedRef.current) {
        elapsed += dt
        progress.set(Math.min(1, elapsed / durationMs))
        if (elapsed >= durationMs) {
          completeRef.current()
          return
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [slideKey, durationMs, progress])

  return progress
}
