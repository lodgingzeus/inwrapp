import { lazy, Suspense } from 'react'
import Landing from './screens/Landing'
import Stub from './screens/Stub'
import { useApp } from './store'

// Dev-only parser check at /#dev. The import sits behind import.meta.env.DEV,
// so it is dropped from production builds.
// The story pulls in GSAP, so it loads only when opened.
const DemoStory = lazy(() => import('./screens/DemoStory'))

const DevParse = import.meta.env.DEV ? lazy(() => import('./screens/DevParse')) : null

export default function App() {
  const screen = useApp((s) => s.screen)

  if (DevParse && window.location.hash === '#dev') {
    return (
      <Suspense>
        <DevParse />
      </Suspense>
    )
  }
  if (screen === 'dropzone') return <Stub title="Drop zone" phase="Phase 4" />
  if (screen === 'demo') {
    return (
      <Suspense>
        <DemoStory />
      </Suspense>
    )
  }
  return <Landing />
}
