import type { Thread } from '../../parse/messages'
import { median } from '../count'
import type { MessageStats, ReplySpeed } from '../types'
import { otherPerson } from './owner'

/** Gaps longer than this are a new conversation, not a reply. */
const MAX_GAP_MS = 12 * 60 * 60 * 1000
/** People with fewer replies than this are left out of fastest/slowest. */
const MIN_REPLIES = 20

/**
 * A reply is a message whose sender differs from the previous message's
 * sender in a one-to-one chat. Its speed is the gap between the two.
 */
export function replySpeed(threads: Thread[], owner: string): MessageStats['replySpeed'] {
  const yours: number[] = []
  const people: ReplySpeed[] = []

  for (const thread of threads) {
    const name = otherPerson(thread, owner)
    if (!name) continue
    const theirs: number[] = []
    const msgs = thread.messages
    for (let i = 1; i < msgs.length; i++) {
      if (msgs[i].sender === msgs[i - 1].sender) continue
      const gap = msgs[i].ts - msgs[i - 1].ts
      if (gap < 0 || gap > MAX_GAP_MS) continue
      if (msgs[i].sender === owner) yours.push(gap)
      else theirs.push(gap)
    }
    const medianMs = median(theirs)
    if (medianMs !== null && theirs.length >= MIN_REPLIES) people.push({ name, medianMs, replies: theirs.length })
  }

  people.sort((a, b) => a.medianMs - b.medianMs)
  return {
    yoursMedianMs: median(yours),
    fastest: people[0] ?? null,
    slowest: people.length > 1 ? people[people.length - 1] : null,
  }
}
