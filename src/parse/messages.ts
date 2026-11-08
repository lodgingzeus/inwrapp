import { isObject } from './records'
import { isNotification, isPlaceholder } from './systemLines'
import { emojiIn, fixMojibake } from './text'

// Message text is reduced to what the stats need (emoji, reel shares) while
// parsing, so no typed words are kept in memory after a file is read.

export interface Reaction {
  emoji: string
  actor: string
}

export interface Message {
  sender: string
  ts: number
  emoji: string[]
  reel: boolean
  reactions: Reaction[]
}

/** One message_N.json file. */
export interface ThreadPart {
  id: string
  title: string
  participants: string[]
  messages: Message[]
}

/** A whole chat: all its message_N.json files merged, messages oldest first. */
export type Thread = ThreadPart

const REEL = /instagram\.com\/reels?\//

function parseReactions(raw: unknown): Reaction[] {
  if (!Array.isArray(raw)) return []
  const out: Reaction[] = []
  for (const r of raw) {
    if (isObject(r) && typeof r.reaction === 'string' && typeof r.actor === 'string') {
      out.push({ emoji: emojiIn(fixMojibake(r.reaction)).join('') || fixMojibake(r.reaction), actor: fixMojibake(r.actor) })
    }
  }
  return out
}

function parseMessage(raw: unknown): Message | null {
  if (!isObject(raw) || typeof raw.sender_name !== 'string' || typeof raw.timestamp_ms !== 'number') return null

  const text = typeof raw.content === 'string' ? fixMojibake(raw.content) : null
  if (text !== null && isNotification(text)) return null

  const link = isObject(raw.share) && typeof raw.share.link === 'string' ? raw.share.link : ''
  return {
    sender: fixMojibake(raw.sender_name),
    ts: raw.timestamp_ms,
    emoji: text !== null && !isPlaceholder(text) ? emojiIn(text) : [],
    reel: REEL.test(link),
    reactions: parseReactions(raw.reactions),
  }
}

/** Chat folder, e.g. ".../inbox/sam_123/message_1.json" → "sam_123". */
function chatIdFromPath(path: string): string {
  const parts = path.split('/')
  return parts[parts.length - 2] ?? path
}

export function parseThreadFile(json: unknown, path: string): ThreadPart | null {
  if (!isObject(json) || !Array.isArray(json.messages)) return null

  const participants = Array.isArray(json.participants)
    ? json.participants.flatMap((p) => (isObject(p) && typeof p.name === 'string' ? [fixMojibake(p.name)] : []))
    : []

  const messages: Message[] = []
  for (const raw of json.messages) {
    const msg = parseMessage(raw)
    if (msg) messages.push(msg)
  }

  return {
    id: typeof json.thread_path === 'string' ? json.thread_path : chatIdFromPath(path),
    title: typeof json.title === 'string' ? fixMojibake(json.title) : '',
    participants,
    messages,
  }
}

/** Merges message_1.json, message_2.json, … of the same chat and sorts oldest first. */
export function mergeThreads(parts: ThreadPart[]): Thread[] {
  const byId = new Map<string, Thread>()
  for (const part of parts) {
    const existing = byId.get(part.id)
    if (existing) {
      for (const m of part.messages) existing.messages.push(m)
      for (const p of part.participants) if (!existing.participants.includes(p)) existing.participants.push(p)
    } else {
      byId.set(part.id, { ...part, participants: [...part.participants], messages: [...part.messages] })
    }
  }
  for (const thread of byId.values()) thread.messages.sort((a, b) => a.ts - b.ts)
  return [...byId.values()]
}
