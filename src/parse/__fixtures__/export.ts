// A tiny synthetic Instagram export. All names and messages are made up.
// Shapes mirror the real export: both record formats, nested "Owner" groups,
// mojibake text, a chat split across two files, a group chat and system lines.

/** Encodes text the way Meta does: UTF-8 bytes stored as Latin-1 code points. */
export function mangle(s: string): string {
  return Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join('')
}

export const OWNER = 'Robin Vale'
export const DAY = 86_400_000
/** 2025-03-10 00:00 UTC */
export const T0 = Date.UTC(2025, 2, 10)

const sec = (ms: number) => Math.floor(ms / 1000)

function owned(ts: number, username: string | null) {
  const owner = username
    ? [
        {
          dict: [
            {
              dict: [
                { label: 'URL', value: '' },
                { label: 'Name', value: `${username} name` },
                { label: 'Username', value: username },
              ],
              title: '',
            },
          ],
          title: 'Owner',
        },
      ]
    : []
  return {
    timestamp: sec(ts),
    media: [],
    label_values: [
      { label: 'URL', value: 'https://www.instagram.com/p/x', href: 'https://www.instagram.com/p/x' },
      { label: 'Caption', value: 'a caption' },
      { dict: [], title: 'Hashtags' },
      ...owner,
    ],
    fbid: '1',
  }
}

export const likes = [
  owned(T0 + 9 * 3600_000, 'cat.daily'),
  owned(T0 + DAY + 9 * 3600_000, 'cat.daily'),
  owned(T0 + 2 * DAY + 21 * 3600_000, 'bread.lab'),
  owned(T0 + 3 * DAY + 9 * 3600_000, null),
]

export const saved = [owned(T0, 'bread.lab'), owned(T0 + DAY, 'bread.lab'), owned(T0 + 2 * DAY, 'cat.daily')]

export const storiesViewed = [owned(T0, 'sam.k'), owned(T0 + 3600_000, 'sam.k')]

export const comments = [
  { media_list_data: [{ uri: '' }], string_map_data: { Comment: { value: 'nice' }, 'Media Owner': { value: 'sam.k' }, Time: { timestamp: sec(T0) } } },
  { media_list_data: [{ uri: '' }], string_map_data: { 'Media Owner': { value: 'sam.k' }, Time: { timestamp: sec(T0 + DAY) } } },
]

export const videosWatched = [
  { timestamp: sec(T0), media: [], label_values: [{ label: 'Brand partner', vec: [] }, { label: 'URL', value: 'u' }], fbid: '1' },
  { timestamp: sec(T0 + 2 * DAY), media: [], label_values: [{ label: 'URL', value: 'u' }], fbid: '2' },
]

export const followers = [
  { title: '', media_list_data: [], string_list_data: [{ href: 'https://www.instagram.com/sam.k', value: 'sam.k', timestamp: sec(T0) }] },
  { title: '', media_list_data: [], string_list_data: [{ href: 'https://www.instagram.com/jo.m', value: 'jo.m', timestamp: sec(T0) }] },
]

export const following = {
  relationships_following: [
    { title: 'sam.k', string_list_data: [{ href: 'https://www.instagram.com/_u/sam.k', timestamp: sec(T0) }] },
    { title: 'cat.daily', string_list_data: [{ href: 'https://www.instagram.com/_u/cat.daily', timestamp: sec(T0) }] },
    { title: '', string_list_data: [{ href: 'https://www.instagram.com/_u/bread.lab', timestamp: sec(T0) }] },
  ],
}

export const unfollowed = [
  {
    timestamp: sec(T0),
    media: [],
    label_values: [
      { label: 'URL', value: 'https://www.instagram.com/old.pal' },
      { label: 'Name', value: 'Old Pal' },
      { label: 'Username', value: 'old.pal' },
    ],
    fbid: '1',
  },
]

export const advertisers = {
  media: [],
  label_values: [
    { label: 'Advertisers with a list', vec: [{ value: 'Acme Shoes' }, { value: mangle('Café Nova') }] },
    { label: 'Advertisers you visited', vec: [{ value: 'Acme Shoes' }, { value: 'Blue Kettle' }] },
    { label: 'Empty list', vec: [] },
  ],
  fbid: '1',
}

export const interests = { media: [], label_values: [{ label: 'Name', vec: [{ value: 'Houseplants' }, { value: 'Jazz' }] }], fbid: '1' }

export const profile = {
  profile_user: [
    {
      title: '',
      string_map_data: {
        Username: { href: '', value: 'robin.vale', timestamp: 0 },
        Name: { href: '', value: mangle(OWNER), timestamp: 0 },
      },
    },
  ],
}

// ── Messages ─────────────────────────────────────────────

const SAM = mangle('Sám Kerr')
const JO = 'Jo Marsh'

type RawMsg = Record<string, unknown>
const msg = (sender: string, ts: number, extra: RawMsg = {}): RawMsg => ({
  sender_name: sender,
  timestamp_ms: ts,
  is_geoblocked_for_viewer: false,
  ...extra,
})

/** Sam chat, part 1 (newest first, like the real export). Days 0–2 and reply gaps. */
export const samPart1 = {
  participants: [{ name: SAM }, { name: mangle(OWNER) }],
  title: SAM,
  thread_path: 'inbox/samkerr_1',
  messages: [
    msg(SAM, T0 + 2 * DAY + 60_000, { content: 'Reacted ' + mangle('❤️') + ' to your message ' }),
    msg(mangle(OWNER), T0 + 2 * DAY, { content: mangle('night 🌙🌙') }),
    msg(SAM, T0 + DAY + 120_000, { content: 'ok' }),
    msg(mangle(OWNER), T0 + DAY, {
      content: `${mangle(OWNER)} sent an attachment.`,
      share: { link: 'https://www.instagram.com/reel/abc/' },
    }),
  ],
}

/** Sam chat, part 2 (older messages). */
export const samPart2 = {
  participants: [{ name: SAM }, { name: mangle(OWNER) }],
  title: SAM,
  thread_path: 'inbox/samkerr_1',
  messages: [
    msg(SAM, T0 + 60_000, {
      content: mangle('haha 😂'),
      reactions: [{ reaction: mangle('😂'), actor: mangle(OWNER) }],
    }),
    msg(mangle(OWNER), T0 + 2 * 3600_000, { content: mangle('morning 😂👍🏽') }),
    msg(mangle(OWNER), T0, { content: 'hi' }),
  ],
}

export const joChat = {
  participants: [{ name: JO }, { name: mangle(OWNER) }],
  title: JO,
  thread_path: 'inbox/jomarsh_2',
  messages: [
    msg(JO, T0 + 5 * DAY + 3600_000, { content: 'Liked a message' }),
    msg(mangle(OWNER), T0 + 5 * DAY, { content: 'see this', share: { link: 'https://www.instagram.com/reel/def/' } }),
  ],
}

export const groupChat = {
  participants: [{ name: JO }, { name: SAM }, { name: mangle(OWNER) }],
  title: 'Book club',
  thread_path: 'inbox/bookclub_3',
  messages: [msg(JO, T0 + 3 * DAY, { content: 'chapter 4?' }), msg(mangle(OWNER), T0 + 3 * DAY - 60_000, { content: 'yes' })],
}

const A = 'your_instagram_activity'

/** The fixture as archive paths → JSON, like the inside of the zip. */
export const exportFiles: Record<string, unknown> = {
  'personal_information/personal_information/personal_information.json': profile,
  [`${A}/likes/liked_posts.json`]: likes,
  [`${A}/saved/saved_posts.json`]: saved,
  [`${A}/story_interactions/stories_viewed.json`]: storiesViewed,
  [`${A}/comments/post_comments_1.json`]: comments,
  'ads_information/ads_and_topics/videos_watched.json': videosWatched,
  'connections/followers_and_following/followers_1.json': followers,
  'connections/followers_and_following/following.json': following,
  'connections/followers_and_following/recently_unfollowed_profiles.json': unfollowed,
  'ads_information/instagram_ads_and_businesses/advertisers_using_your_activity_or_information.json': advertisers,
  'ads_information/instagram_ads_and_businesses/other_categories_used_to_reach_you.json': interests,
  [`${A}/messages/inbox/samkerr_1/message_1.json`]: samPart1,
  [`${A}/messages/inbox/samkerr_1/message_2.json`]: samPart2,
  [`${A}/messages/inbox/jomarsh_2/message_1.json`]: joChat,
  [`${A}/messages/inbox/bookclub_3/message_1.json`]: groupChat,
  // ignored: media and unrelated files
  [`${A}/media/posts_1.json`]: [],
  'media/posts/202503/photo.jpg': 'not json',
}
