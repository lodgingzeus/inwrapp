import type { TimeWindow, WrappedStats } from './types'

// Made-up stats for the demo button and for building slides without a real
// export. Every name and number here is fictional.

const DAY = 86_400_000
const YEAR_START = Date.UTC(2026, 0, 1)
const YEAR_END = Date.UTC(2026, 11, 31, 23, 59)

const year: TimeWindow = { start: YEAR_START, end: YEAR_END, days: 365 }
const lastDays = (days: number): TimeWindow => ({ start: YEAR_END - days * DAY, end: YEAR_END, days })

const LIKES = 43_870
const likesPerDay = LIKES / year.days

export const demoStats: WrappedStats = {
  version: 1,
  owner: { name: 'Demo User', username: 'demo.user' },
  likes: {
    total: LIKES,
    window: year,
    top: [
      { name: 'plantdad.archive', count: 1_204 },
      { name: 'tinyrooms', count: 988 },
      { name: 'noodle.diaries', count: 731 },
      { name: 'brutalist.birds', count: 655 },
      { name: 'slowcarclub', count: 590 },
    ],
    perDay: likesPerDay,
    minutesPerLikeAwake: (16 * 60) / likesPerDay,
    byHour: [
      310, 180, 90, 40, 20, 30, 120, 610, 1_480, 1_720, 1_650, 1_900, 2_600, 2_350, 2_100, 2_050, 2_300, 2_700, 3_100,
      3_400, 3_650, 3_900, 3_700, 2_340,
    ],
  },
  messages: {
    sent: 21_430,
    received: 24_115,
    chats: 180,
    oneToOneChats: 160,
    groupChats: 18,
    topPeople: [
      { name: 'Marisol Featherstone', sent: 3_210, received: 3_540, total: 6_750 },
      { name: 'Theo Vance', sent: 2_480, received: 2_215, total: 4_695 },
      { name: 'Priya Holloway', sent: 1_930, received: 2_060, total: 3_990 },
      { name: 'Jonah Kestrel', sent: 1_105, received: 1_380, total: 2_485 },
      { name: 'Ada Moreau', sent: 940, received: 1_010, total: 1_950 },
    ],
    byHour: [
      980, 760, 420, 150, 60, 20, 30, 140, 520, 760, 880, 940, 1_120, 1_040, 990, 1_010, 1_150, 1_300, 1_480, 1_620,
      1_810, 1_960, 2_240, 1_890,
    ],
    peakHour: 22,
    lateNight: 2_390,
    longestStreak: { name: 'Marisol Featherstone', days: 64, start: Date.UTC(2026, 5, 3), end: Date.UTC(2026, 7, 5) },
    replySpeed: {
      yoursMedianMs: 4 * 60_000,
      fastest: { name: 'Theo Vance', medianMs: 45_000, replies: 1_240 },
      slowest: { name: 'Jonah Kestrel', medianMs: 3 * 3_600_000, replies: 310 },
    },
    topEmoji: [
      { name: '😭', count: 1_880 },
      { name: '💀', count: 1_210 },
      { name: '🫶', count: 640 },
      { name: '✨', count: 420 },
      { name: '🙃', count: 300 },
    ],
    topReactions: [
      { name: '😂', count: 2_310 },
      { name: '❤️', count: 1_760 },
      { name: '😮', count: 240 },
    ],
    reelsSent: 2_140,
    topReelRecipients: [
      { name: 'Marisol Featherstone', count: 820 },
      { name: 'Theo Vance', count: 410 },
      { name: 'Priya Holloway', count: 260 },
    ],
  },
  saved: {
    total: 870,
    window: year,
    top: [
      { name: 'weeknight.recipes', count: 96 },
      { name: 'tinyrooms', count: 71 },
      { name: 'typography.daily', count: 44 },
    ],
  },
  storiesViewed: {
    total: 7_420,
    window: lastDays(30),
    top: [
      { name: 'theo.vance', count: 212 },
      { name: 'marisol.f', count: 198 },
      { name: 'noodle.diaries', count: 120 },
    ],
  },
  storyLikes: {
    total: 1_310,
    window: year,
    top: [
      { name: 'marisol.f', count: 240 },
      { name: 'theo.vance', count: 115 },
    ],
  },
  comments: {
    total: 312,
    window: year,
    top: [
      { name: 'marisol.f', count: 58 },
      { name: 'brutalist.birds', count: 21 },
      { name: 'slowcarclub', count: 17 },
    ],
  },
  videosWatched: { total: 380, window: lastDays(14), perYearEstimate: Math.round((380 / 14) * 365) },
  postsViewed: { total: 520, window: lastDays(14), perYearEstimate: Math.round((520 / 14) * 365) },
  connections: { followers: 812, following: 940, notFollowingBack: 173, recentlyUnfollowed: 12 },
  advertisers: {
    total: 6_150,
    sample: [
      'Northwind Outfitters',
      'Bluefin Mattress Co.',
      'Orbit Oat Milk',
      'Paperplane Travel',
      'Cobble & Crumb Bakery',
      'Halcyon Fitness',
      'Loop Language Labs',
      'Saltmarsh Candles',
    ],
  },
  interests: ['Houseplants', 'Interior design', 'Ramen', 'Vintage cars', 'Birdwatching', 'Typography', 'Running'],
}
