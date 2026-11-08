import { useCallback, useEffect, useMemo, useState, type CSSProperties, type PointerEvent } from 'react'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import type { WrappedStats } from '../stats/types'
import { Grain, ShapeWipe } from '../motion'
import { StoryContext } from './context'
import { useFontsReady } from './fonts'
import { ProgressBars } from './ProgressBars'
import { slidesFor } from './registry'
import { useStoryClock } from './useStoryClock'
import { useTapHold } from './useTapHold'

interface Props {
  stats: WrappedStats
  onExit: () => void
}

// Taps on the left edge go back, everywhere else goes forward.
const BACK_ZONE = 0.3

function usePageHidden() {
  const [hidden, setHidden] = useState(() => document.hidden)
  useEffect(() => {
    const update = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  return hidden
}

export default function StoryPlayer({ stats, onExit }: Props) {
  const slides = useMemo(() => slidesFor(stats), [stats])
  // `run` restarts the current slide when going back from the first one.
  const [pos, setPos] = useState({ index: 0, dir: 1, run: 0 })
  const [holding, setHolding] = useState(false)
  const [manualPause, setManualPause] = useState(false)
  const hidden = usePageHidden()
  const fontsReady = useFontsReady()
  const reduced = useReducedMotion() ?? false
  const paused = holding || manualPause || hidden || !fontsReady

  const slide = slides[pos.index]

  const step = useCallback(
    (by: 1 | -1) => {
      setManualPause(false)
      setPos((p) => {
        const next = p.index + by
        if (next >= slides.length) return p
        if (next < 0) return { ...p, dir: -1, run: p.run + 1 }
        return { index: next, dir: by, run: p.run }
      })
    },
    [slides.length],
  )

  const progress = useStoryClock(`${pos.index}:${pos.run}`, slide.durationMs, paused, () => step(1))

  const gestures = useTapHold((e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    step((e.clientX - rect.left) / rect.width < BACK_ZONE ? -1 : 1)
  }, setHolding)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === 'Escape') onExit()
      else if (e.key === ' ') setManualPause((p) => !p)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, onExit])

  const context = useMemo(() => ({ paused, exit: onExit }), [paused, onExit])

  return (
    <div className="story-backdrop">
      <section
        className="story-frame"
        aria-roledescription="story"
        aria-label={`Slide ${pos.index + 1} of ${slides.length}`}
        data-paused={paused}
        style={{ '--chrome': slide.chrome } as CSSProperties}
        {...gestures}
      >
        <StoryContext.Provider value={context}>
          {fontsReady && (
            <AnimatePresence initial={false} custom={{ dir: pos.dir, reduced }}>
              <ShapeWipe key={`${slide.id}:${pos.run}`} custom={{ dir: pos.dir, reduced }}>
                {slide.node}
              </ShapeWipe>
            </AnimatePresence>
          )}
        </StoryContext.Provider>

        <Grain />
        <ProgressBars count={slides.length} index={pos.index} progress={progress} />

        <div className="absolute inset-x-3 top-[calc(max(10px,env(safe-area-inset-top))+12px)] z-30 flex items-center justify-end gap-3 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--chrome)' }}>
          {manualPause && <span>Paused</span>}
          <button
            type="button"
            aria-label="Close story"
            className="grid h-8 w-8 place-items-center text-[20px] leading-none"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={onExit}
          >
            ×
          </button>
        </div>
      </section>
    </div>
  )
}
