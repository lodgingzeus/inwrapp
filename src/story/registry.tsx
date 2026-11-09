import type { ComponentType, ReactNode } from 'react'
import type { WrappedStats } from '../stats/types'
import { Intro } from '../slides/Intro'
import { TotalLikes } from '../slides/TotalLikes'
import { TopPerson } from '../slides/TopPerson'
import { TopLiked } from '../slides/TopLiked'
import { SentReceived } from '../slides/SentReceived'
import { TopPeople } from '../slides/TopPeople'
import { NightOwl } from '../slides/NightOwl'
import { Streak } from '../slides/Streak'
import { ReplySpeed } from '../slides/ReplySpeed'
import { TopEmoji } from '../slides/TopEmoji'
import { Reels } from '../slides/Reels'
import { Saved } from '../slides/Saved'
import { Stories } from '../slides/Stories'
import { Comments } from '../slides/Comments'
import { Watching } from '../slides/Watching'
import { Followers } from '../slides/Followers'
import { Advertisers } from '../slides/Advertisers'
import { Interests } from '../slides/Interests'
import { posterItems } from '../slides/poster'
import { Summary } from '../slides/Summary'

export interface Slide {
  id: string
  durationMs: number
  /** Colour of the progress bars and controls on this slide. */
  chrome: string
  node: ReactNode
}

interface SlideDef<P> {
  id: string
  durationMs: number
  chrome: string
  /** Props for the slide, or null to skip it because the export lacks the data. */
  select: (stats: WrappedStats) => P | null
  Component: ComponentType<P>
}

type AnyDef = { build: (stats: WrappedStats) => Slide | null }

function define<P extends object>({ select, Component, ...meta }: SlideDef<P>): AnyDef {
  return {
    build(stats) {
      const props = select(stats)
      return props ? { ...meta, node: <Component {...props} /> } : null
    },
  }
}

export const YEAR = 2026

const has = <T extends { total: number }>(a: T | undefined): T | null => (a && a.total > 0 ? a : null)

// Story order. A slide whose select() returns null is left out.
const SLIDES: AnyDef[] = [
  define({
    id: 'intro',
    durationMs: 5500,
    chrome: 'var(--color-lime)',
    select: (s) => ({ username: s.owner.username, year: YEAR }),
    Component: Intro,
  }),
  define({
    id: 'total-likes',
    durationMs: 7500,
    chrome: 'var(--color-ink)',
    select: ({ likes }) =>
      likes && likes.total > 0
        ? { total: likes.total, minutesPerLikeAwake: likes.minutesPerLikeAwake, window: likes.window }
        : null,
    Component: TotalLikes,
  }),
  define({
    id: 'top-liked',
    durationMs: 7000,
    chrome: 'var(--color-ink)',
    select: ({ likes }) => (likes?.top.length ? { top: likes.top.slice(0, 5) } : null),
    Component: TopLiked,
  }),
  define({
    id: 'sent-received',
    durationMs: 7000,
    chrome: 'var(--color-plum)',
    select: ({ messages: m }) =>
      m && m.sent + m.received > 0 ? { sent: m.sent, received: m.received, chats: m.chats } : null,
    Component: SentReceived,
  }),
  define({
    id: 'top-person',
    durationMs: 8500,
    chrome: 'var(--color-bubblegum)',
    select: ({ messages }) => (messages?.topPeople[0] ? { person: messages.topPeople[0] } : null),
    Component: TopPerson,
  }),
  define({
    id: 'top-people',
    durationMs: 7000,
    chrome: 'var(--color-ink)',
    // One person is already the #1 slide; a list needs at least two.
    select: ({ messages }) => (messages && messages.topPeople.length >= 2 ? { people: messages.topPeople.slice(0, 5) } : null),
    Component: TopPeople,
  }),
  define({
    id: 'night-owl',
    durationMs: 7500,
    chrome: 'var(--color-tangerine)',
    select: ({ messages }) =>
      messages && messages.byHour.some((n) => n > 0)
        ? { byHour: messages.byHour, peakHour: messages.peakHour, lateNight: messages.lateNight }
        : null,
    Component: NightOwl,
  }),
  define({
    id: 'streak',
    durationMs: 7000,
    chrome: 'var(--color-mint)',
    select: ({ messages }) => {
      const streak = messages?.longestStreak
      return streak && streak.days >= 2 ? { streak } : null
    },
    Component: Streak,
  }),
  define({
    id: 'reply-speed',
    durationMs: 7500,
    chrome: 'var(--color-ink)',
    select: ({ messages }) => {
      if (!messages) return null
      const { fastest, slowest, yoursMedianMs } = messages.replySpeed
      // With one replier, fastest and slowest are the same person: show them once.
      const slow = slowest && slowest.name !== fastest?.name ? slowest : null
      return fastest || slow ? { fastest, slowest: slow, yoursMedianMs } : null
    },
    Component: ReplySpeed,
  }),
  define({
    id: 'emoji',
    durationMs: 6500,
    chrome: 'var(--color-plum)',
    select: ({ messages }) => (messages?.topEmoji.length ? { emoji: messages.topEmoji.slice(0, 5) } : null),
    Component: TopEmoji,
  }),
  define({
    id: 'reels',
    durationMs: 6500,
    chrome: 'var(--color-cobalt)',
    select: ({ messages }) =>
      messages && messages.reelsSent > 0
        ? { sent: messages.reelsSent, topRecipient: messages.topReelRecipients[0] ?? null }
        : null,
    Component: Reels,
  }),
  define({
    id: 'saved',
    durationMs: 6500,
    chrome: 'var(--color-butter)',
    select: (s) => {
      const saved = has(s.saved)
      return saved ? { total: saved.total, days: saved.window.days, top: saved.top.slice(0, 3) } : null
    },
    Component: Saved,
  }),
  define({
    id: 'stories',
    durationMs: 7000,
    chrome: 'var(--color-bone)',
    select: (s) => {
      const viewed = has(s.storiesViewed)
      const liked = has(s.storyLikes)
      if (!viewed && !liked) return null
      return {
        viewed: viewed && { total: viewed.total, window: viewed.window },
        liked: liked && { total: liked.total, window: liked.window },
        mostWatched: viewed?.top[0]?.name ?? null,
      }
    },
    Component: Stories,
  }),
  define({
    id: 'comments',
    durationMs: 6500,
    chrome: 'var(--color-ink)',
    select: (s) => {
      const c = has(s.comments)
      return c ? { total: c.total, days: c.window.days, top: c.top } : null
    },
    Component: Comments,
  }),
  define({
    id: 'watching',
    durationMs: 7500,
    chrome: 'var(--color-ink)',
    select: (s) => {
      const videos = has(s.videosWatched)
      const posts = has(s.postsViewed)
      return videos || posts ? { videos, posts } : null
    },
    Component: Watching,
  }),
  define({
    id: 'followers',
    durationMs: 7000,
    chrome: 'var(--color-forest)',
    select: ({ connections: c }) =>
      c && (c.followers !== null || c.following !== null) ? c : null,
    Component: Followers,
  }),
  define({
    id: 'advertisers',
    durationMs: 6500,
    chrome: 'var(--color-coral)',
    select: ({ advertisers }) =>
      advertisers && advertisers.total > 0 ? { total: advertisers.total, sample: advertisers.sample.slice(0, 40) } : null,
    Component: Advertisers,
  }),
  define({
    id: 'interests',
    durationMs: 6500,
    chrome: 'var(--color-plum)',
    select: ({ interests }) => (interests?.length ? { interests } : null),
    Component: Interests,
  }),
  define({
    id: 'summary',
    durationMs: 9000,
    chrome: 'var(--color-lime)',
    select: (s) => {
      const items = posterItems(s)
      return items.length > 0 ? { items, username: s.owner.username, year: YEAR } : null
    },
    Component: Summary,
  }),
]

export function slidesFor(stats: WrappedStats): Slide[] {
  return SLIDES.map((d) => d.build(stats)).filter((s): s is Slide => s !== null)
}
