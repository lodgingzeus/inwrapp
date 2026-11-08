import { demoStats } from '../stats/demo'
import StoryPlayer from '../story/StoryPlayer'
import { useApp } from '../store'

export default function DemoStory() {
  const go = useApp((s) => s.go)
  return <StoryPlayer stats={demoStats} onExit={() => go('landing')} />
}
