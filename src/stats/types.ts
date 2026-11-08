// WrappedStats is the only thing the UI consumes. Every section is optional:
// a missing section means the export did not contain that data, and the
// matching slide is skipped.

export interface Ranked {
  name: string
  count: number
}

/** Time span covered by a data source. Timestamps are epoch milliseconds. */
export interface TimeWindow {
  start: number
  end: number
  days: number
}

/** Generic "you did X this many times, mostly with these accounts". */
export interface ActivityStats {
  total: number
  window: TimeWindow
  top: Ranked[]
}

export interface LikeStats extends ActivityStats {
  perDay: number
  /** Minutes between likes, counting 16 waking hours a day. */
  minutesPerLikeAwake: number
  /** Likes per local hour of day, index 0–23. */
  byHour: number[]
}

/** A source that only covers a short window, scaled to a year. */
export interface EstimateStats {
  total: number
  window: TimeWindow
  /** Clearly an estimate: total / window.days × 365. */
  perYearEstimate: number
}

export interface PersonStats {
  name: string
  sent: number
  received: number
  total: number
}

export interface StreakStats {
  name: string
  days: number
  start: number
  end: number
}

export interface ReplySpeed {
  name: string
  medianMs: number
  replies: number
}

export interface MessageStats {
  sent: number
  received: number
  chats: number
  oneToOneChats: number
  groupChats: number
  /** Ranked by total messages, one-to-one chats only. */
  topPeople: PersonStats[]
  /** Messages you sent per local hour of day, index 0–23. */
  byHour: number[]
  peakHour: number
  /** Messages you sent between midnight and 5 a.m. */
  lateNight: number
  longestStreak: StreakStats | null
  replySpeed: {
    yoursMedianMs: number | null
    fastest: ReplySpeed | null
    slowest: ReplySpeed | null
  }
  topEmoji: Ranked[]
  topReactions: Ranked[]
  reelsSent: number
  topReelRecipients: Ranked[]
}

export interface ConnectionStats {
  followers: number | null
  following: number | null
  /** Accounts you follow that do not follow you back. Null if either list is missing. */
  notFollowingBack: number | null
  recentlyUnfollowed: number | null
}

export interface AdvertiserStats {
  total: number
  sample: string[]
}

export interface WrappedStats {
  version: 1
  owner: { name: string | null; username: string | null }
  likes?: LikeStats
  messages?: MessageStats
  saved?: ActivityStats
  storiesViewed?: ActivityStats
  storyLikes?: ActivityStats
  comments?: ActivityStats
  videosWatched?: EstimateStats
  postsViewed?: EstimateStats
  connections?: ConnectionStats
  advertisers?: AdvertiserStats
  interests?: string[]
}
