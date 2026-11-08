import Landing from './screens/Landing'
import Stub from './screens/Stub'
import { useApp } from './store'

export default function App() {
  const screen = useApp((s) => s.screen)

  if (screen === 'dropzone') return <Stub title="Drop zone" phase="Phase 4" />
  if (screen === 'demo') return <Stub title="Demo story" phase="Phase 2" />
  return <Landing />
}
