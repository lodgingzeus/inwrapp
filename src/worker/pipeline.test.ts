import { describe, expect, it } from 'vitest'
import { DAY, exportFiles, OWNER, T0 } from '../parse/__fixtures__/export'
import type { WrappedStats } from '../stats/types'
import { memoryArchive } from './__fixtures__/memoryArchive'
import { runPipeline, type Progress } from './pipeline'

async function statsFor(files: Record<string, unknown>): Promise<WrappedStats> {
  const result = await runPipeline(memoryArchive(files))
  if (!result.ok) throw new Error(result.error)
  return result.stats
}

describe('runPipeline on the synthetic export', () => {
  it('detects the owner from chats and the profile', async () => {
    const stats = await statsFor(exportFiles)
    expect(stats.owner).toEqual({ name: OWNER, username: 'robin.vale' })
  })

  it('computes message stats', async () => {
    const m = (await statsFor(exportFiles)).messages!
    expect(m).toMatchObject({ sent: 6, received: 3, chats: 3, oneToOneChats: 2, groupChats: 1 })
    expect(m.topPeople[0]).toEqual({ name: 'Sám Kerr', sent: 4, received: 2, total: 6 })
    expect(m.topPeople).toHaveLength(2)
    expect(m.peakHour).toBe(0)
    expect(m.byHour[23]).toBe(1)
    expect(m.lateNight).toBe(5)
    expect(m.longestStreak).toEqual({ name: 'Sám Kerr', days: 3, start: T0, end: T0 + 2 * DAY })
    expect(m.replySpeed.yoursMedianMs).toBe(2 * 3600_000 - 60_000)
    expect(m.replySpeed.fastest).toBeNull() // too few replies to rank anyone
    expect(m.topEmoji[0]).toEqual({ name: '🌙', count: 2 })
    expect(m.topEmoji.map((e) => e.name).sort()).toEqual(['👍🏽', '😂', '🌙'].sort())
    expect(m.topReactions).toEqual([{ name: '😂', count: 1 }])
    expect(m.reelsSent).toBe(2)
    expect(m.topReelRecipients).toEqual([
      { name: 'Jo Marsh', count: 1 },
      { name: 'Sám Kerr', count: 1 },
    ])
  })

  it('computes likes, saves, stories, comments and watch estimates', async () => {
    const s = await statsFor(exportFiles)
    expect(s.likes).toMatchObject({ total: 4, perDay: 1.3, minutesPerLikeAwake: 720 })
    expect(s.likes!.top).toEqual([
      { name: 'cat.daily', count: 2 },
      { name: 'bread.lab', count: 1 },
    ])
    expect(s.likes!.byHour[9]).toBe(3)
    expect(s.saved!.top[0]).toEqual({ name: 'bread.lab', count: 2 })
    expect(s.storiesViewed).toMatchObject({ total: 2, window: { days: 1 } })
    expect(s.comments!.top).toEqual([{ name: 'sam.k', count: 2 }])
    expect(s.videosWatched).toMatchObject({ total: 2, perYearEstimate: 365 })
  })

  it('computes connections, advertisers and interests', async () => {
    const s = await statsFor(exportFiles)
    expect(s.connections).toEqual({ followers: 2, following: 3, notFollowingBack: 2, recentlyUnfollowed: 1 })
    expect(s.advertisers).toEqual({ total: 3, sample: ['Acme Shoes', 'Café Nova', 'Blue Kettle'] })
    expect(s.interests).toEqual(['Houseplants', 'Jazz'])
  })

  it('leaves out sections whose files are missing', async () => {
    const s = await statsFor(exportFiles)
    expect(s.storyLikes).toBeUndefined()
    expect(s.postsViewed).toBeUndefined()

    const likesOnly = Object.fromEntries(Object.entries(exportFiles).filter(([p]) => p.includes('liked_posts')))
    const small = await statsFor(likesOnly)
    expect(small.likes?.total).toBe(4)
    expect(small.messages).toBeUndefined()
    expect(small.connections).toBeUndefined()
    expect(small.owner).toEqual({ name: null, username: null })
  })

  it('reports real progress for every file', async () => {
    const seen: Progress[] = []
    await runPipeline(memoryArchive(exportFiles), (p) => seen.push(p))
    expect(seen[0].stage).toBe('index')
    expect(seen.at(-1)?.stage).toBe('done')
    const likes = seen.find((p) => p.stage === 'likes' && p.count !== undefined)
    expect(likes?.count).toBe(4)
    const lastInbox = seen.filter((p) => p.stage === 'inbox').at(-1)!
    expect(lastInbox.done).toBe(lastInbox.total)
  })
})

describe('runPipeline errors', () => {
  it('rejects a zip with nothing from Instagram', async () => {
    expect(await runPipeline(memoryArchive({ 'notes.txt': 'hi' }))).toEqual({ ok: false, error: 'not-instagram' })
  })

  it('spots an HTML export', async () => {
    const html = { 'your_instagram_activity/likes/liked_posts.html': '<html>' }
    expect(await runPipeline(memoryArchive(html))).toEqual({ ok: false, error: 'html-export' })
  })

  it('reports broken JSON as unknown without throwing', async () => {
    const broken = { 'your_instagram_activity/likes/liked_posts.json': '{not json' }
    expect(await runPipeline(memoryArchive(broken))).toEqual({ ok: false, error: 'unknown' })
  })
})
