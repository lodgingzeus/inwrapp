import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Grain } from '../motion/Grain'
import { useApp } from '../store'
import { initialView, reduceProgress } from './progressCopy'

const LIME = 'var(--color-lime)'
const INK = 'var(--color-ink)'

const ease = [0.16, 1, 0.3, 1] as const

/** Reduces every progress event, including ones React would batch away between renders. */
function useProcessingView() {
  const [view, setView] = useState(() => {
    const p = useApp.getState().progress
    return p ? reduceProgress(initialView, p) : initialView
  })
  useEffect(
    () =>
      useApp.subscribe((state, prev) => {
        if (state.progress && state.progress !== prev.progress) {
          const p = state.progress
          setView((v) => reduceProgress(v, p))
        }
      }),
    [],
  )
  return view
}

export default function Processing() {
  const view = useProcessingView()
  const still = useReducedMotion() ?? false
  const done = view.stage === 'done'
  const rise = still ? { opacity: 0 } : { opacity: 0, y: '60%' }

  return (
    <div className="story-backdrop">
      <section
        className="story-frame cursor-default"
        aria-label="Reading your export"
        style={{ background: INK, color: LIME }}
      >
        {/* Hero: the ring keeps turning while the worker works, then floods the frame. */}
        <motion.div
          aria-hidden
          className="absolute rounded-full"
          style={{ width: '62cqh', height: '62cqh', right: '-30cqh', top: '-14cqh', background: LIME }}
          initial={still ? false : { scale: 0 }}
          animate={{ scale: done ? 4.2 : 1 }}
          transition={
            still ? { duration: 0 } : done ? { duration: 1, ease: [0.7, 0, 0.2, 1] } : { type: 'spring', stiffness: 70, damping: 14 }
          }
        />
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          className="spin-mid absolute"
          style={{ width: '30cqh', height: '30cqh', left: '-9cqh', top: '50cqh' }}
        >
          <circle cx="50" cy="50" r="44" fill="none" stroke={LIME} strokeWidth="5" strokeDasharray="38 14" />
        </svg>

        {/* Difference blending keeps the text readable over the circle, and inverts it when the circle floods. */}
        <div className="absolute inset-0 mix-blend-difference" style={{ color: LIME }}>
          <p className="absolute left-[6cqw] top-[9cqh] font-mono text-[3.4cqw] uppercase tracking-[0.18em]">
            inwrap · on this device
          </p>

          <div className="absolute inset-x-[6cqw] top-[30cqh]" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.h1
                key={view.headline}
                className="text-[11.5cqw] leading-[0.95] font-extrabold tracking-[-0.03em] text-balance"
                initial={rise}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                {view.headline}
              </motion.h1>
            </AnimatePresence>
            <AnimatePresence mode="wait" initial={false}>
              {view.found && (
                <motion.p
                  key={view.found}
                  className="mt-[2cqh] font-serif text-[9cqw] leading-[1] italic"
                  initial={rise}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                >
                  {view.found}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <ol className="absolute inset-x-[6cqw] bottom-[13cqh] flex flex-col gap-[1.2cqh] font-mono text-[3.4cqw] uppercase tracking-[0.08em]">
            {view.log.slice(-6).map((line) => (
              <motion.li
                key={line.stage}
                initial={still ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease }}
                className="truncate"
              >
                — {line.text}
              </motion.li>
            ))}
          </ol>

          <p className="absolute inset-x-[6cqw] bottom-[6cqh] font-mono text-[3cqw] uppercase tracking-[0.18em]">
            Nothing leaves this tab.
          </p>
        </div>
        <Grain />
      </section>
    </div>
  )
}
