import { describe, expect, it } from 'vitest'
import * as fx from './__fixtures__/export'
import { parseActivity, parseComments } from './activity'
import { parseNameLists } from './ads'
import { parseAccounts } from './connections'
import { mergeThreads, parseThreadFile } from './messages'
import { classify, groupPaths, looksLikeHtmlExport } from './paths'
import { parseProfile } from './profile'

describe('paths', () => {
  it('classifies export files and ignores the rest', () => {
    expect(classify('your_instagram_activity/likes/liked_posts.json')).toBe('likes')
    expect(classify('extra_root/your_instagram_activity/likes/liked_posts.json')).toBe('likes')
    expect(classify('your_instagram_activity/messages/inbox/a_1/message_2.json')).toBe('inbox')
    expect(classify('your_instagram_activity/threads/followers.json')).toBeNull()
    expect(classify('media/posts/x.jpg')).toBeNull()
  })

  it('groups and sorts paths per source', () => {
    const groups = groupPaths(Object.keys(fx.exportFiles))
    expect(groups.get('inbox')).toHaveLength(4)
    expect(groups.has('storyLikes')).toBe(false)
  })

  it('spots an HTML export', () => {
    expect(looksLikeHtmlExport(['your_instagram_activity/likes/liked_posts.html'])).toBe(true)
    expect(looksLikeHtmlExport(['random/file.html'])).toBe(false)
  })
})

describe('activity parsers', () => {
  it('reads likes with and without an owner', () => {
    const items = parseActivity(fx.likes)
    expect(items.map((i) => i.account)).toEqual(['cat.daily', 'cat.daily', 'bread.lab', null])
    expect(items[0].ts).toBe(fx.T0 + 9 * 3600_000)
  })

  it('reads comments by media owner', () => {
    expect(parseComments(fx.comments).map((c) => c.account)).toEqual(['sam.k', 'sam.k'])
  })
})

describe('parseAccounts', () => {
  it('reads followers, following (incl. URL fallback) and unfollowed', () => {
    expect(parseAccounts(fx.followers)).toEqual(['sam.k', 'jo.m'])
    expect(parseAccounts(fx.following)).toEqual(['sam.k', 'cat.daily', 'bread.lab'])
    expect(parseAccounts(fx.unfollowed)).toEqual(['old.pal'])
  })
})

describe('parseNameLists', () => {
  it('de-duplicates names across lists and repairs mojibake', () => {
    expect(parseNameLists(fx.advertisers)).toEqual(['Acme Shoes', 'Café Nova', 'Blue Kettle'])
  })
})

describe('parseProfile', () => {
  it('reads and repairs the name', () => {
    expect(parseProfile(fx.profile)).toEqual({ name: fx.OWNER, username: 'robin.vale' })
  })
})

describe('messages', () => {
  it('drops notifications, repairs names and keeps only emoji from text', () => {
    const part = parseThreadFile(fx.samPart1, 'x/inbox/samkerr_1/message_1.json')!
    expect(part.participants).toEqual(['Sám Kerr', fx.OWNER])
    expect(part.messages).toHaveLength(3)
    expect(part.messages[0].emoji).toEqual(['🌙', '🌙'])
    const attachment = part.messages[2]
    expect(attachment.reel).toBe(true)
    expect(attachment.emoji).toEqual([])
  })

  it('merges message_N files of one chat, oldest first', () => {
    const parts = [fx.samPart1, fx.samPart2, fx.joChat].map((j) => parseThreadFile(j, 'p')!)
    const threads = mergeThreads(parts)
    expect(threads).toHaveLength(2)
    const sam = threads.find((t) => t.id === 'inbox/samkerr_1')!
    expect(sam.messages).toHaveLength(6)
    expect(sam.messages.map((m) => m.ts)).toEqual([...sam.messages.map((m) => m.ts)].sort((a, b) => a - b))
  })

  it('rejects files that are not chats', () => {
    expect(parseThreadFile({ nope: true }, 'p')).toBeNull()
  })
})
