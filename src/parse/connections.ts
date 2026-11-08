import { normalizeAll, pickField } from './records'
import { fixMojibake } from './text'

const PROFILE_URL = /instagram\.com\/(?:_u\/)?([^/?#]+)/

function usernameFromUrl(url: string | null): string | null {
  return url?.match(PROFILE_URL)?.[1] ?? null
}

/**
 * Usernames from followers_N, following and recently_unfollowed_profiles.
 * Each file keeps the username somewhere different: string_list_data value,
 * the record title, or a Username label. The profile URL is the fallback.
 */
export function parseAccounts(json: unknown): string[] {
  const out: string[] = []
  for (const rec of normalizeAll(json)) {
    const name =
      pickField(rec, 'Username', 'value', 'title') ?? usernameFromUrl(pickField(rec, 'href', 'URL', 'URL.href'))
    if (name) out.push(fixMojibake(name))
  }
  return out
}
