// Runs the real parser pipeline on a real export, outside the browser.
//
//   REAL_EXPORT=/path/to/instagram-export.zip npm run check:export
//
// Prints counts only: never names, usernames or message text, so the output
// is safe to paste into an issue. Skipped when REAL_EXPORT is not set.

import { openAsBlob } from 'node:fs'
import { expect, it } from 'vitest'
import { openZip } from '../src/worker/archive'
import { runPipeline } from '../src/worker/pipeline'

const path = process.env.REAL_EXPORT

it.skipIf(!path)('parses a real export', async () => {
  const started = performance.now()
  const result = await runPipeline(await openZip(await openAsBlob(path!)))
  expect(result.ok).toBe(true)
  if (!result.ok) return
  const s = result.stats
  const m = s.messages

  const counts = {
    seconds: Math.round((performance.now() - started) / 100) / 10,
    ownerDetected: s.owner.name !== null,
    likes: s.likes?.total,
    likesWindowDays: s.likes && Math.round(s.likes.window.days),
    minutesPerLikeAwake: s.likes?.minutesPerLikeAwake,
    saved: s.saved?.total,
    storiesViewed: s.storiesViewed?.total,
    storiesViewedWindowDays: s.storiesViewed && Math.round(s.storiesViewed.window.days),
    storyLikes: s.storyLikes?.total,
    comments: s.comments?.total,
    videosWatched: s.videosWatched?.total,
    postsViewed: s.postsViewed?.total,
    followers: s.connections?.followers,
    following: s.connections?.following,
    notFollowingBack: s.connections?.notFollowingBack,
    recentlyUnfollowed: s.connections?.recentlyUnfollowed,
    advertisers: s.advertisers?.total,
    interests: s.interests?.length,
    chats: m?.chats,
    oneToOneChats: m?.oneToOneChats,
    groupChats: m?.groupChats,
    sent: m?.sent,
    received: m?.received,
    topChatTotal: m?.topPeople[0]?.total,
    reelsSent: m?.reelsSent,
    peakHour: m?.peakHour,
    longestStreakDays: m?.longestStreak?.days,
    emojiKinds: m?.topEmoji.length,
  }
  console.table(counts)

  // Ranked lists drive the "top accounts" slides; an empty list means account extraction broke.
  const ranked = { likes: s.likes, saved: s.saved, storiesViewed: s.storiesViewed, storyLikes: s.storyLikes, comments: s.comments }
  console.table(
    Object.fromEntries(
      Object.entries(ranked).map(([key, stat]) => [key, { topLength: stat?.top.length, topCount: stat?.top[0]?.count }]),
    ),
  )
}, 300_000)
