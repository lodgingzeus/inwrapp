import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Grain } from '../motion'
import { STORY_H, STORY_W } from '../share/toImage'
import { StoryContext, type StoryState } from './context'

const STILL: StoryState = { paused: true, still: true, exit: () => {} }

interface Props {
  node: ReactNode
  /** Called once the copy has laid out at its end state. */
  onReady: (el: HTMLElement) => void
}

/**
 * A second, off-screen copy of a slide at exactly 1080×1920, with every timeline
 * at its end state. The on-screen slide may be mid-animation and is sized to the
 * phone, so this copy is what gets saved.
 */
export function SlideSnapshot({ node, onReady }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Two frames: one for the timelines and SplitText to run, one for layout to settle.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (ref.current) onReady(ref.current)
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [onReady])

  return createPortal(
    <div aria-hidden className="pointer-events-none fixed top-0 left-[-10000px]">
      <div ref={ref} className="relative overflow-hidden" style={{ width: STORY_W, height: STORY_H, containerType: 'size' }}>
        <StoryContext.Provider value={STILL}>{node}</StoryContext.Provider>
        <Grain />
      </div>
    </div>,
    document.body,
  )
}
