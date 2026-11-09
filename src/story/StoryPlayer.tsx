import { useCallback, useEffect, useMemo, useState, type CSSProperties, type PointerEvent } from 'react'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import type { WrappedStats } from '../stats/types'
import { Grain, ShapeWipe } from '../motion'
import { StoryContext } from './context'
import { useFontsReady } from './fonts'
import { ProgressBars } from './ProgressBars'
import { saveImage } from '../share/toImage'
import { slidesFor, YEAR } from './registry'
import { SlideSnapshot } from './SlideSnapshot'
import { useStoryClock } from './useStoryClock'
import { useTapHold } from './useTapHold'

interface Props {
  stats: WrappedStats
  onExit: () => void
}

// Taps on the left edge go back, everywhere else goes forward.
const BACK_ZONE = 0.3

// Controls sit on top of the tap zones, so presses must not reach them.
const stop = (e: PointerEvent) => e.stopPropagation()

type SaveState = 'idle' | 'saving' | 'saved' | 'failed'

const SAVE_LABEL: Record<SaveState, string> = { idle: 'Save', saving: 'Saving…', saved: 'Saved', failed: 'Retry' }

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
  // A save belongs to the slide it was started on; moving on resets the label (and drops the snapshot).
  const [saving, setSaving] = useState<{ index: number; state: SaveState }>({ index: -1, state: 'idle' })
  const save = saving.index === pos.index ? saving.state : 'idle'
  const paused = holding || manualPause || hidden || !fontsReady || save === 'saving'

  const slide = slides[pos.index]

  const onSnapshot = useCallback(
    async (el: HTMLElement) => {
      const index = pos.index
      try {
        const outcome = await saveImage(el, `inwrap-${YEAR}-${slide.id}.png`)
        setSaving({ index, state: outcome === 'cancelled' ? 'idle' : 'saved' })
      } catch {
        setSaving({ index, state: 'failed' })
      }
    },
    [pos.index, slide.id],
  )

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

  const context = useMemo(() => ({ paused, still: false, exit: onExit }), [paused, onExit])

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
          {/* The summary has its own Save button for the poster. */}
          {slide.id !== 'summary' && (
            <button
              type="button"
              aria-live="polite"
              className="h-8 px-1"
              onPointerDown={stop}
              onPointerUp={stop}
              onClick={() => save !== 'saving' && setSaving({ index: pos.index, state: 'saving' })}
            >
              {SAVE_LABEL[save]}
            </button>
          )}
          <button
            type="button"
            aria-label="Close story"
            className="grid h-8 w-8 place-items-center text-[20px] leading-none"
            onPointerDown={stop}
            onPointerUp={stop}
            onClick={onExit}
          >
            ×
          </button>
        </div>
      </section>
      {save === 'saving' && <SlideSnapshot key={slide.id} node={slide.node} onReady={onSnapshot} />}
    </div>
  )
}
