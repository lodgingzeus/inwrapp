import { create } from 'zustand'

export type Screen = 'landing' | 'dropzone' | 'demo'

type AppState = {
  screen: Screen
  go: (screen: Screen) => void
}

export const useApp = create<AppState>((set) => ({
  screen: 'landing',
  go: (screen) => set({ screen }),
}))
