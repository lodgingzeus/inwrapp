import { parseActivity, parseComments } from '../parse/activity'
import { parseNameLists } from '../parse/ads'
import { parseAccounts } from '../parse/connections'
import { parseThreadFile, type ThreadPart } from '../parse/messages'
import { groupPaths, looksLikeHtmlExport, type SourceKey } from '../parse/paths'
import { parseProfile } from '../parse/profile'
import { computeStats, type ParsedExport } from '../stats/compute'
import type { WrappedStats } from '../stats/types'
import { readJson, type Archive } from './archive'
import { ExportError, toErrorCode, type ExportErrorCode } from './errors'

export type Stage = 'index' | SourceKey | 'stats' | 'done'

/** Real progress from real work. `count` is how many records a stage found. */
export interface Progress {
  stage: Stage
  /** Files read so far / files to read. */
  done: number
  total: number
  count?: number
}

export type ParseResult = { ok: true; stats: WrappedStats } | { ok: false; error: ExportErrorCode }

type ListField = Exclude<keyof ParsedExport, 'profile' | 'threadParts'>

/** Sources that are parsed into a flat list, in the order they are read. */
const LIST_SOURCES: [SourceKey, ListField, (json: unknown) => unknown[]][] = [
  ['likes', 'likes', parseActivity],
  ['saved', 'saved', parseActivity],
  ['storiesViewed', 'storiesViewed', parseActivity],
  ['storyLikes', 'storyLikes', parseActivity],
  ['comments', 'comments', parseComments],
  ['videosWatched', 'videosWatched', parseActivity],
  ['postsViewed', 'postsViewed', parseActivity],
  ['followers', 'followers', parseAccounts],
  ['following', 'following', parseAccounts],
  ['unfollowed', 'unfollowed', parseAccounts],
  ['advertisers', 'advertisers', parseNameLists],
  ['interests', 'interests', parseNameLists],
]

/** The table above pairs each field with its parser, so the element type always matches. */
function setList(parsed: ParsedExport, field: ListField, items: unknown[]): void {
  ;(parsed as Record<ListField, unknown[]>)[field] = items
}

async function collect(archive: Archive, onProgress: (p: Progress) => void): Promise<ParsedExport> {
  const allPaths = archive.paths()
  const groups = groupPaths(allPaths)
  if (groups.size === 0) throw new ExportError(looksLikeHtmlExport(allPaths) ? 'html-export' : 'not-instagram')

  let total = 0
  for (const list of groups.values()) total += list.length
  let done = 0
  const report = (stage: Stage, count?: number) => onProgress({ stage, done, total, count })

  const parsed: ParsedExport = {}

  // Files are read one at a time and reduced to compact records straight away,
  // so only one raw file is ever held in memory.
  for (const path of groups.get('profile') ?? []) {
    report('profile')
    parsed.profile = parseProfile(await readJson(archive, path))
    done++
  }

  for (const [key, field, parse] of LIST_SOURCES) {
    const paths = groups.get(key)
    if (!paths) continue
    report(key)
    const items: unknown[] = []
    for (const path of paths) {
      for (const item of parse(await readJson(archive, path))) items.push(item)
      done++
    }
    setList(parsed, field, items)
    report(key, items.length)
  }

  const inbox = groups.get('inbox') ?? []
  const parts: ThreadPart[] = []
  for (const path of inbox) {
    const part = parseThreadFile(await readJson(archive, path), path)
    if (part) parts.push(part)
    done++
    report('inbox', parts.length)
  }
  if (inbox.length > 0) parsed.threadParts = parts

  return parsed
}

export async function runPipeline(archive: Archive, onProgress: (p: Progress) => void = () => {}): Promise<ParseResult> {
  try {
    onProgress({ stage: 'index', done: 0, total: 0 })
    const parsed = await collect(archive, onProgress)
    const last = { done: 1, total: 1 }
    onProgress({ stage: 'stats', ...last })
    const stats = computeStats(parsed)
    onProgress({ stage: 'done', ...last })
    return { ok: true, stats }
  } catch (err) {
    return { ok: false, error: toErrorCode(err) }
  }
}
