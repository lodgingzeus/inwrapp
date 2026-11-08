import { normalizeAll, pickField, type NormalRecord } from './records'
import { fixMojibake } from './text'

/** One timestamped action, tied to the account it was about (if known). */
export interface Activity {
  ts: number
  account: string | null
}

function toActivities(records: NormalRecord[], accountKeys: string[]): Activity[] {
  const out: Activity[] = []
  for (const rec of records) {
    if (rec.timestamp === null) continue
    const account = pickField(rec, ...accountKeys)
    out.push({ ts: rec.timestamp, account: account ? fixMojibake(account) : null })
  }
  return out
}

/** liked_posts, saved_posts, stories_viewed, story_likes, videos_watched, posts_viewed. */
export function parseActivity(json: unknown): Activity[] {
  return toActivities(normalizeAll(json), ['Owner.Username', 'Username', 'Owner.Name', 'Name'])
}

/** post_comments_N: the account is the owner of the post you commented on. */
export function parseComments(json: unknown): Activity[] {
  return toActivities(normalizeAll(json), ['Media Owner'])
}
