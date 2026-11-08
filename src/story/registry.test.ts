import { describe, expect, it } from 'vitest'
import { demoStats } from '../stats/demo'
import { slidesFor } from './registry'

describe('slidesFor', () => {
  it('includes every Phase 2 slide for the demo stats', () => {
    expect(slidesFor(demoStats).map((s) => s.id)).toEqual(['intro', 'total-likes', 'top-person'])
  })

  it('skips slides whose data is missing', () => {
    const { likes: _likes, messages: _messages, ...rest } = demoStats
    expect(slidesFor(rest).map((s) => s.id)).toEqual(['intro'])
  })

  it('skips the #1 person slide when there are no one-to-one chats', () => {
    const stats = { ...demoStats, messages: { ...demoStats.messages!, topPeople: [] } }
    expect(slidesFor(stats).map((s) => s.id)).toEqual(['intro', 'total-likes'])
  })
})
