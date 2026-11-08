import { normalizeAll } from './records'
import { fixMojibake } from './text'

/**
 * Every name in every `vec` list of the file, de-duplicated. Used for
 * advertisers_using_your_activity_or_information (several lists of advertiser
 * names) and other_categories_used_to_reach_you (interest categories).
 */
export function parseNameLists(json: unknown): string[] {
  const names = new Set<string>()
  for (const rec of normalizeAll(json)) {
    for (const list of Object.values(rec.lists)) {
      for (const name of list) {
        const clean = fixMojibake(name).trim()
        if (clean) names.add(clean)
      }
    }
  }
  return [...names]
}
