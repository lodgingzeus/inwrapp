// Files are matched by path pattern, not by full hard-coded path, so a zip that
// was re-packed with an extra top-level folder still works.

export const SOURCES = {
  profile: /personal_information\/personal_information\.json$/,
  likes: /likes\/liked_posts\.json$/,
  saved: /saved\/saved_posts\.json$/,
  storiesViewed: /story_interactions\/stories_viewed\.json$/,
  storyLikes: /story_interactions\/story_likes\.json$/,
  comments: /comments\/post_comments(_\d+)?\.json$/,
  videosWatched: /ads_and_topics\/videos_watched\.json$/,
  postsViewed: /ads_and_topics\/posts_viewed\.json$/,
  followers: /followers_and_following\/followers(_\d+)?\.json$/,
  following: /followers_and_following\/following(_\d+)?\.json$/,
  unfollowed: /followers_and_following\/recently_unfollowed_profiles\.json$/,
  advertisers: /advertisers_using_your_activity_or_information\.json$/,
  interests: /other_categories_used_to_reach_you\.json$/,
  inbox: /messages\/inbox\/[^/]+\/message_\d+\.json$/,
} as const satisfies Record<string, RegExp>

export type SourceKey = keyof typeof SOURCES

const KEYS = Object.keys(SOURCES) as SourceKey[]

export function classify(path: string): SourceKey | null {
  for (const key of KEYS) if (SOURCES[key].test(path)) return key
  return null
}

/** Groups the archive paths we need by source; everything else is ignored. */
export function groupPaths(paths: Iterable<string>): Map<SourceKey, string[]> {
  const groups = new Map<SourceKey, string[]>()
  for (const path of paths) {
    const key = classify(path)
    if (!key) continue
    const list = groups.get(key) ?? []
    list.push(path)
    groups.set(key, list)
  }
  for (const list of groups.values()) list.sort()
  return groups
}

const INSTAGRAM_HTML = /(your_instagram_activity|personal_information|connections)\/.+\.html$/

/** The user picked HTML instead of JSON when requesting the export. */
export function looksLikeHtmlExport(paths: Iterable<string>): boolean {
  for (const path of paths) if (INSTAGRAM_HTML.test(path)) return true
  return false
}
