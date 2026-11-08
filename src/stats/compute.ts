import type { Activity } from '../parse/activity'
import { mergeThreads, type ThreadPart } from '../parse/messages'
import type { Profile } from '../parse/profile'
import { computeActivity, computeConnections, computeEstimate, computeLikes } from './activity'
import { computeMessages } from './messages'
import { detectOwner } from './messages/owner'
import type { WrappedStats } from './types'

const ADVERTISER_SAMPLE = 60

/** Everything the parsers extracted. A missing field means the file was not in the export. */
export interface ParsedExport {
  profile?: Profile
  likes?: Activity[]
  saved?: Activity[]
  storiesViewed?: Activity[]
  storyLikes?: Activity[]
  comments?: Activity[]
  videosWatched?: Activity[]
  postsViewed?: Activity[]
  followers?: string[]
  following?: string[]
  unfollowed?: string[]
  advertisers?: string[]
  interests?: string[]
  threadParts?: ThreadPart[]
}

function nonEmpty<T>(list: T[] | undefined): T[] | undefined {
  return list && list.length > 0 ? list : undefined
}

export function computeStats(parsed: ParsedExport): WrappedStats {
  const threads = mergeThreads(parsed.threadParts ?? [])
  const owner = detectOwner(threads, parsed.profile?.name ?? null)
  const advertisers = nonEmpty(parsed.advertisers)

  return {
    version: 1,
    owner: { name: owner ?? parsed.profile?.name ?? null, username: parsed.profile?.username ?? null },
    likes: computeLikes(parsed.likes ?? []),
    messages: owner && threads.length > 0 ? computeMessages(threads, owner) : undefined,
    saved: computeActivity(parsed.saved ?? []),
    storiesViewed: computeActivity(parsed.storiesViewed ?? []),
    storyLikes: computeActivity(parsed.storyLikes ?? []),
    comments: computeActivity(parsed.comments ?? []),
    videosWatched: computeEstimate(parsed.videosWatched ?? []),
    postsViewed: computeEstimate(parsed.postsViewed ?? []),
    connections: computeConnections(parsed.followers, parsed.following, parsed.unfollowed),
    advertisers: advertisers && { total: advertisers.length, sample: advertisers.slice(0, ADVERTISER_SAMPLE) },
    interests: nonEmpty(parsed.interests),
  }
}
