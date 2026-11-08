import type { SourceKey } from '../parse/paths'
import type { Progress, Stage } from '../worker/pipeline'

// Copy for the processing screen. Every line comes from a real pipeline stage;
// counts appear only once the worker has reported them.

const grouped = new Intl.NumberFormat('en-US')

/** What the app is doing while a stage runs. */
const DOING: Record<Stage, string> = {
  index: 'Opening the zip',
  profile: 'Finding out who you are',
  likes: 'Reading every like',
  saved: 'Flipping through your saves',
  storiesViewed: 'Counting the stories you watched',
  storyLikes: 'Counting your story likes',
  comments: 'Finding your comments',
  videosWatched: 'Counting the videos you watched',
  postsViewed: 'Counting the posts you scrolled past',
  followers: 'Counting your followers',
  following: 'Checking who you follow',
  unfollowed: 'Checking recent unfollows',
  advertisers: 'Listing the advertisers with your data',
  interests: 'Finding out what Instagram thinks you like',
  inbox: 'Counting your 3 a.m. messages',
  stats: 'Doing the maths',
  done: 'Your year is ready',
}

/** Singular and plural nouns for a stage's count. */
const NOUN: Partial<Record<SourceKey, [string, string]>> = {
  likes: ['like', 'likes'],
  saved: ['save', 'saves'],
  storiesViewed: ['story viewed', 'stories viewed'],
  storyLikes: ['story like', 'story likes'],
  comments: ['comment', 'comments'],
  videosWatched: ['video watched', 'videos watched'],
  postsViewed: ['post viewed', 'posts viewed'],
  followers: ['follower', 'followers'],
  following: ['account you follow', 'accounts you follow'],
  unfollowed: ['recent unfollow', 'recent unfollows'],
  advertisers: ['advertiser', 'advertisers'],
  interests: ['interest category', 'interest categories'],
  // The inbox count is chat files read, not messages.
  inbox: ['chat file', 'chat files'],
}

export function counted(stage: Stage, count: number): string | null {
  const noun = NOUN[stage as SourceKey]
  if (!noun) return null
  return `${grouped.format(count)} ${noun[count === 1 ? 0 : 1]}`
}

export interface LogLine {
  stage: Stage
  text: string
}

export interface ProcessingView {
  stage: Stage
  /** The big line: what is happening now. */
  headline: string
  /** The count found so far for the current stage, if the worker has sent one. */
  found: string | null
  /** Finished stages, oldest first. */
  log: LogLine[]
}

export const initialView: ProcessingView = { stage: 'index', headline: `${DOING.index}…`, found: null, log: [] }

/** Folds one progress event into the view. */
export function reduceProgress(view: ProcessingView, p: Progress): ProcessingView {
  const found = p.count === undefined ? null : counted(p.stage, p.count)
  if (p.stage === view.stage) return { ...view, found: found ?? view.found }

  // A new stage started: the previous one goes into the log.
  const log = [...view.log]
  if (view.stage !== 'index') log.push({ stage: view.stage, text: view.found ?? DOING[view.stage] })
  const headline = p.stage === 'done' ? `${DOING.done}.` : `${DOING[p.stage]}…`
  return { stage: p.stage, headline, found, log }
}
