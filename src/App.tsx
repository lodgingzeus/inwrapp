import { lazy, Suspense, useEffect } from 'react'
import Dropzone from './screens/Dropzone'
import Landing from './screens/Landing'
import Processing from './screens/Processing'
import { loadedStory, loadStory, useApp } from './store'

// The story pulls in GSAP, so it loads only when opened (or while parsing).
const Story = lazy(loadStory)

// Dev-only parser check at /#dev. The import sits behind import.meta.env.DEV,
// so it is dropped from production builds.
const DevParse = import.meta.env.DEV ? lazy(() => import('./screens/DevParse')) : null

export default function App() {
  const screen = useApp((s) => s.screen)
  const reset = useApp((s) => s.reset)

  // A stats-less story (a reload, for example) falls back to the landing page.
  const stats = useApp((s) => s.stats)
  useEffect(() => {
    if (screen === 'story' && !stats) reset()
  }, [screen, stats, reset])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  if (DevParse && window.location.hash === '#dev') {
    return (
      <Suspense>
        <DevParse />
      </Suspense>
    )
  }
  if (screen === 'dropzone') return <Dropzone />
  if (screen === 'processing') return <Processing />
  if (screen === 'story' || screen === 'demo') {
    // Already loaded (preloaded while parsing): render it directly, since even a
    // resolved lazy() suspends and React throttles the reveal by a few hundred ms.
    // The reference is a module export, the same object on every render.
    const Loaded = loadedStory()
    // oxlint-disable-next-line react/static-components
    if (Loaded) return <Loaded demo={screen === 'demo'} />
    return (
      <Suspense>
        <Story demo={screen === 'demo'} />
      </Suspense>
    )
  }
  return <Landing />
}
