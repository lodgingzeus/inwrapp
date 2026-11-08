import { createContext, useContext } from 'react'

export interface StoryState {
  /** True while the user holds, presses space, or the tab is hidden. Slides freeze their timelines. */
  paused: boolean
}

export const StoryContext = createContext<StoryState>({ paused: false })

export const useStory = () => useContext(StoryContext)
