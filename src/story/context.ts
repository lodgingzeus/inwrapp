import { createContext, useContext } from 'react'

export interface StoryState {
  /** True while the user holds, presses space, or the tab is hidden. Slides freeze their timelines. */
  paused: boolean
  /** Render every timeline at its end state at once (the off-screen copy used to save a slide). */
  still: boolean
  /** Closes the story (the summary's "Start over"). */
  exit: () => void
}

export const StoryContext = createContext<StoryState>({ paused: false, still: false, exit: () => {} })

export const useStory = () => useContext(StoryContext)
