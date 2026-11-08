import type { Thread } from '../../parse/messages'

/**
 * Messages only carry display names, so "you" is the name that appears in
 * nearly every chat. The profile name wins when it is a participant at all,
 * which settles exports with very few chats.
 */
export function detectOwner(threads: Thread[], profileName: string | null): string | null {
  const counts = new Map<string, number>()
  for (const t of threads) for (const p of new Set(t.participants)) counts.set(p, (counts.get(p) ?? 0) + 1)

  if (profileName && counts.has(profileName)) return profileName

  let best: string | null = null
  let bestCount = 0
  for (const [name, count] of counts) {
    if (count > bestCount) {
      best = name
      bestCount = count
    }
  }
  return best
}

/** The other person in a one-to-one chat, or null for groups and solo chats. */
export function otherPerson(thread: Thread, owner: string): string | null {
  if (thread.participants.length !== 2) return null
  return thread.participants.find((p) => p !== owner) ?? null
}
