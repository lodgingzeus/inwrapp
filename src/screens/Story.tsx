import { demoStats } from '../stats/demo'
import StoryPlayer from '../story/StoryPlayer'
import { useApp } from '../store'

/** The story for the user's own stats, or the fictional demo stats. */
export default function Story({ demo }: { demo: boolean }) {
  const stats = useApp((s) => s.stats)
  const reset = useApp((s) => s.reset)
  const data = demo ? demoStats : stats
  if (!data) return null
  return <StoryPlayer stats={data} onExit={reset} />
}
