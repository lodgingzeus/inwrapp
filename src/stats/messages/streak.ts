import type { Thread } from '../../parse/messages'
import { localDay, localDayStart } from '../count'
import type { StreakStats } from '../types'
import { otherPerson } from './owner'

/** Longest run of consecutive local days with at least one message, in one chat. */
function longestRun(thread: Thread): { days: number; first: number; last: number } | null {
  const days = [...new Set(thread.messages.map((m) => localDay(m.ts)))].sort((a, b) => a - b)
  if (days.length === 0) return null

  let best = { days: 1, first: days[0], last: days[0] }
  let runStart = days[0]
  for (let i = 1; i < days.length; i++) {
    if (days[i] !== days[i - 1] + 1) runStart = days[i]
    const length = days[i] - runStart + 1
    if (length > best.days) best = { days: length, first: runStart, last: days[i] }
  }
  return best
}

/** The longest daily streak across all one-to-one chats. */
export function longestStreak(threads: Thread[], owner: string): StreakStats | null {
  let best: StreakStats | null = null
  for (const thread of threads) {
    const name = otherPerson(thread, owner)
    if (!name) continue
    const run = longestRun(thread)
    if (run && (!best || run.days > best.days)) {
      best = { name, days: run.days, start: localDayStart(run.first), end: localDayStart(run.last) }
    }
  }
  return best
}
