import { createContext, useContext } from 'react'

export interface StoryState {
  /** True while the user holds, presses space, or the tab is hidden. Slides freeze their timelines. */
  paused: boolean
  /** Closes the story (the summary's "Start over"). */
  exit: () => void
}

export const StoryContext = createContext<StoryState>({ paused: false, exit: () => {} })

export const useStory = () => useContext(StoryContext)
