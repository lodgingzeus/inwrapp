import { create } from 'zustand'
import type { WrappedStats } from './stats/types'
import type { ExportErrorCode } from './worker/errors'
import { parseExport, type Progress } from './worker/client'

export type Screen = 'landing' | 'dropzone' | 'processing' | 'story' | 'demo'

type AppState = {
  screen: Screen
  /** Stats from the user's own export. Only ever held in memory. */
  stats: WrappedStats | null
  progress: Progress | null
  error: ExportErrorCode | null
  go: (screen: Screen) => void
  load: (file: File) => Promise<void>
  /** Drops the stats and returns to the landing page. */
  reset: () => void
}

/** Short parses still show the processing screen long enough to read. */
const MIN_PROCESSING_MS = 2200
/** The finished state stays up until the circle has flooded the frame (Processing.tsx). */
const DONE_HOLD_MS = 1200

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

type StoryModule = typeof import('./screens/Story')
let storyModule: StoryModule | null = null

// Fetch the story chunk (GSAP and the slides) while the worker parses.
export const loadStory = () =>
  import('./screens/Story').then((m) => {
    storyModule = m
    return m
  })

/** The story screen once its chunk has loaded, so App can render it without suspending. */
export const loadedStory = () => storyModule?.default ?? null

export const useApp = create<AppState>((set, get) => ({
  screen: 'landing',
  stats: null,
  progress: null,
  error: null,
  go: (screen) => set({ screen, error: null }),
  async load(file) {
    set({ screen: 'processing', progress: null, error: null, stats: null })
    const story = loadStory().catch(() => null)
    const started = performance.now()
    let result: Awaited<ReturnType<typeof parseExport>>
    try {
      result = await parseExport(file, (progress) => {
        if (get().screen === 'processing') set({ progress })
      })
    } catch {
      // A worker crash (out of memory, failed to load) rejects instead of returning a result.
      result = { ok: false, error: 'unknown' }
    }
    if (get().screen !== 'processing') return
    if (!result.ok) {
      set({ screen: 'dropzone', error: result.error, progress: null })
      return
    }
    await Promise.all([story, wait(Math.max(DONE_HOLD_MS, MIN_PROCESSING_MS - (performance.now() - started)))])
    if (get().screen !== 'processing') return
    set({ screen: 'story', stats: result.stats, progress: null })
  },
  reset: () => set({ screen: 'landing', stats: null, progress: null, error: null }),
}))
