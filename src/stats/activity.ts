import type { Activity } from '../parse/activity'
import { hourHistogram, round, timeWindow, topCounts } from './count'
import type { ActivityStats, ConnectionStats, EstimateStats, LikeStats } from './types'

const TOP_ACCOUNTS = 10
const WAKING_MINUTES_PER_DAY = 16 * 60
const DAYS_PER_YEAR = 365

export function computeActivity(items: Activity[]): ActivityStats | undefined {
  const window = timeWindow(items.map((a) => a.ts))
  if (!window) return undefined
  return { total: items.length, window, top: topCounts(items.map((a) => a.account), TOP_ACCOUNTS) }
}

export function computeLikes(items: Activity[]): LikeStats | undefined {
  const base = computeActivity(items)
  if (!base) return undefined
  return {
    ...base,
    perDay: round(base.total / base.window.days),
    minutesPerLikeAwake: round((base.window.days * WAKING_MINUTES_PER_DAY) / base.total),
    byHour: hourHistogram(items.map((a) => a.ts)),
  }
}

/** For sources that only keep a short history (watched videos, viewed posts). */
export function computeEstimate(items: Activity[]): EstimateStats | undefined {
  const window = timeWindow(items.map((a) => a.ts))
  if (!window) return undefined
  return {
    total: items.length,
    window,
    perYearEstimate: Math.round((items.length / window.days) * DAYS_PER_YEAR),
  }
}

export function computeConnections(
  followers: string[] | undefined,
  following: string[] | undefined,
  unfollowed: string[] | undefined,
): ConnectionStats | undefined {
  if (!followers && !following && !unfollowed) return undefined

  let notFollowingBack: number | null = null
  if (followers && following) {
    const followerSet = new Set(followers.map((u) => u.toLowerCase()))
    notFollowingBack = following.filter((u) => !followerSet.has(u.toLowerCase())).length
  }

  return {
    followers: followers ? new Set(followers).size : null,
    following: following ? new Set(following).size : null,
    notFollowingBack,
    recentlyUnfollowed: unfollowed ? unfollowed.length : null,
  }
}
