import { describe, expect, it } from 'vitest'
import { demoStats } from '../stats/demo'
import type { WrappedStats } from '../stats/types'
import { slidesFor } from './registry'

const ALL = [
  'intro',
  'total-likes',
  'top-liked',
  'sent-received',
  'top-person',
  'top-people',
  'night-owl',
  'streak',
  'reply-speed',
  'emoji',
  'reels',
  'saved',
  'stories',
  'comments',
  'watching',
  'followers',
  'advertisers',
  'interests',
]

const ids = (stats: WrappedStats) => slidesFor(stats).map((s) => s.id)
const without = (...drop: string[]) => ALL.filter((id) => !drop.includes(id))
const withMessages = (patch: Partial<NonNullable<WrappedStats['messages']>>): WrappedStats => ({
  ...demoStats,
  messages: { ...demoStats.messages!, ...patch },
})

describe('slidesFor', () => {
  it('includes every slide, in order, for the demo stats', () => {
    expect(ids(demoStats)).toEqual(ALL)
  })

  it('keeps only the intro when every section is missing', () => {
    expect(ids({ version: 1, owner: { name: null, username: null } })).toEqual(['intro'])
  })

  it('skips the likes slides without likes, and the top-liked slide without top accounts', () => {
    const { likes: _likes, ...rest } = demoStats
    expect(ids(rest)).toEqual(without('total-likes', 'top-liked'))
    expect(ids({ ...demoStats, likes: { ...demoStats.likes!, top: [] } })).toEqual(without('top-liked'))
  })

  it('skips every message slide without messages', () => {
    const { messages: _m, ...rest } = demoStats
    expect(ids(rest)).toEqual(
      without('sent-received', 'top-person', 'top-people', 'night-owl', 'streak', 'reply-speed', 'emoji', 'reels'),
    )
  })

  it('skips the people slides without one-to-one chats, and the list with only one person', () => {
    expect(ids(withMessages({ topPeople: [] }))).toEqual(without('top-person', 'top-people'))
    expect(ids(withMessages({ topPeople: demoStats.messages!.topPeople.slice(0, 1) }))).toEqual(without('top-people'))
  })

  it('skips message slides whose own data is empty', () => {
    expect(ids(withMessages({ longestStreak: null }))).toEqual(without('streak'))
    expect(ids(withMessages({ topEmoji: [] }))).toEqual(without('emoji'))
    expect(ids(withMessages({ reelsSent: 0 }))).toEqual(without('reels'))
    expect(ids(withMessages({ byHour: Array(24).fill(0) }))).toEqual(without('night-owl'))
    expect(ids(withMessages({ replySpeed: { yoursMedianMs: null, fastest: null, slowest: null } }))).toEqual(
      without('reply-speed'),
    )
  })

  it('shows the same replier once when they are both fastest and slowest', () => {
    const only = { name: 'Solo Friend', medianMs: 60_000, replies: 10 }
    const slide = slidesFor(withMessages({ replySpeed: { yoursMedianMs: null, fastest: only, slowest: only } })).find(
      (s) => s.id === 'reply-speed',
    )
    expect((slide!.node as { props: Record<string, unknown> }).props).toMatchObject({ fastest: only, slowest: null })
  })

  it('keeps the stories and watching slides when only one of their two sources is present', () => {
    const { storiesViewed: _sv, videosWatched: _vw, ...rest } = demoStats
    expect(ids(rest)).toEqual(ALL)
    const { storiesViewed: _a, storyLikes: _b, videosWatched: _c, postsViewed: _d, ...none } = demoStats
    expect(ids(none)).toEqual(without('stories', 'watching'))
  })

  it('keeps the followers slide with one list, and drops it when both are missing', () => {
    const one = { followers: 10, following: null, notFollowingBack: null, recentlyUnfollowed: null }
    expect(ids({ ...demoStats, connections: one })).toEqual(ALL)
    expect(ids({ ...demoStats, connections: { ...one, followers: null } })).toEqual(without('followers'))
  })

  it('skips the rest when their sections are empty', () => {
    expect(ids({ ...demoStats, saved: { ...demoStats.saved!, total: 0 } })).toEqual(without('saved'))
    expect(ids({ ...demoStats, comments: { ...demoStats.comments!, total: 0 } })).toEqual(without('comments'))
    expect(ids({ ...demoStats, advertisers: { total: 0, sample: [] } })).toEqual(without('advertisers'))
    expect(ids({ ...demoStats, interests: [] })).toEqual(without('interests'))
  })
})
