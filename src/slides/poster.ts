import type { WrappedStats } from '../stats/types'
import { grouped, hourLabel, plural } from './fit'

export interface PosterItem {
  label: string
  value: string
}

/** The poster has room for one hero stat and a 2×2 grid. */
export const POSTER_MAX = 5
const NAME_MAX = 18

/** Cuts a name to NAME_MAX characters, never splitting an emoji or surrogate pair. */
export function clip(name: string, max = NAME_MAX) {
  const chars = [...name]
  return chars.length > max ? `${chars.slice(0, max - 1).join('').trimEnd()}…` : name
}

/** The headline stats for the summary poster, best first, skipping anything the export lacks. */
export function posterItems(s: WrappedStats): PosterItem[] {
  const m = s.messages
  const candidates: (PosterItem | null)[] = [
    s.likes && s.likes.total > 0 ? { label: 'Likes', value: grouped.format(s.likes.total) } : null,
    m && m.sent + m.received > 0 ? { label: 'Messages', value: grouped.format(m.sent + m.received) } : null,
    m?.topPeople[0] ? { label: 'My #1 person', value: clip(m.topPeople[0].name) } : null,
    m && m.byHour.some((n) => n > 0) ? { label: 'Peak hour', value: hourLabel(m.peakHour) } : null,
    m?.topEmoji[0] ? { label: 'Top emoji', value: m.topEmoji[0].name } : null,
    m?.longestStreak && m.longestStreak.days >= 2
      ? { label: 'Longest streak', value: plural(m.longestStreak.days, 'day') }
      : null,
    s.saved && s.saved.total > 0 ? { label: 'Saves', value: grouped.format(s.saved.total) } : null,
    s.comments && s.comments.total > 0 ? { label: 'Comments', value: grouped.format(s.comments.total) } : null,
    s.connections?.followers != null ? { label: 'Followers', value: grouped.format(s.connections.followers) } : null,
  ]
  return candidates.filter((c): c is PosterItem => c !== null).slice(0, POSTER_MAX)
}
