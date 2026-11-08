import type { Thread } from '../../parse/messages'
import { hourHistogram, peakHour, rank, topCounts } from '../count'
import type { MessageStats, PersonStats } from '../types'
import { otherPerson } from './owner'
import { replySpeed } from './replySpeed'
import { longestStreak } from './streak'

const TOP_PEOPLE = 10
const TOP_EMOJI = 10
const LATE_NIGHT_END_HOUR = 5

function topPeople(threads: Thread[], owner: string): PersonStats[] {
  const people: PersonStats[] = []
  for (const thread of threads) {
    const name = otherPerson(thread, owner)
    if (!name) continue
    let sent = 0
    for (const m of thread.messages) if (m.sender === owner) sent++
    const total = thread.messages.length
    if (total > 0) people.push({ name, sent, received: total - sent, total })
  }
  return people.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name)).slice(0, TOP_PEOPLE)
}

function reelRecipients(threads: Thread[], owner: string): { total: number; top: MessageStats['topReelRecipients'] } {
  let total = 0
  const perPerson = new Map<string, number>()
  for (const thread of threads) {
    const name = otherPerson(thread, owner)
    for (const m of thread.messages) {
      if (!m.reel || m.sender !== owner) continue
      total++
      if (name) perPerson.set(name, (perPerson.get(name) ?? 0) + 1)
    }
  }
  return { total, top: rank(perPerson, 5) }
}

export function computeMessages(threads: Thread[], owner: string): MessageStats {
  let sent = 0
  let received = 0
  let oneToOneChats = 0
  let groupChats = 0
  const yourTimestamps: number[] = []
  const yourEmoji: string[] = []
  const yourReactions: string[] = []

  for (const thread of threads) {
    if (thread.participants.length === 2) oneToOneChats++
    else if (thread.participants.length > 2) groupChats++

    for (const m of thread.messages) {
      for (const r of m.reactions) if (r.actor === owner) yourReactions.push(r.emoji)
      if (m.sender !== owner) {
        received++
        continue
      }
      sent++
      yourTimestamps.push(m.ts)
      for (const e of m.emoji) yourEmoji.push(e)
    }
  }

  const byHour = hourHistogram(yourTimestamps)
  const reels = reelRecipients(threads, owner)

  return {
    sent,
    received,
    chats: threads.length,
    oneToOneChats,
    groupChats,
    topPeople: topPeople(threads, owner),
    byHour,
    peakHour: peakHour(byHour),
    lateNight: byHour.slice(0, LATE_NIGHT_END_HOUR).reduce((a, b) => a + b, 0),
    longestStreak: longestStreak(threads, owner),
    replySpeed: replySpeed(threads, owner),
    topEmoji: topCounts(yourEmoji, TOP_EMOJI),
    topReactions: topCounts(yourReactions, TOP_EMOJI),
    reelsSent: reels.total,
    topReelRecipients: reels.top,
  }
}
