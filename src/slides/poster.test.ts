import { describe, expect, it } from 'vitest'
import { demoStats } from '../stats/demo'
import { clip, POSTER_MAX, posterItems } from './poster'

describe('posterItems', () => {
  it('fills the poster from the demo stats, likes first', () => {
    const items = posterItems(demoStats)
    expect(items).toHaveLength(POSTER_MAX)
    expect(items[0].label).toBe('Likes')
  })

  it('is empty when the export has nothing to show', () => {
    expect(posterItems({ version: 1, owner: { name: null, username: null } })).toEqual([])
  })

  it('moves later stats up when earlier ones are missing', () => {
    const labels = posterItems({ ...demoStats, likes: undefined, messages: undefined }).map((i) => i.label)
    expect(labels).toEqual(['Saves', 'Comments', 'Followers'])
  })

  it('shows zero followers but skips a missing followers list', () => {
    const base = { version: 1 as const, owner: { name: null, username: null } }
    const conn = { followers: 0, following: 5, notFollowingBack: null, recentlyUnfollowed: null }
    expect(posterItems({ ...base, connections: conn })).toEqual([{ label: 'Followers', value: '0' }])
    expect(posterItems({ ...base, connections: { ...conn, followers: null } })).toEqual([])
  })
})

describe('clip', () => {
  it('leaves short names alone', () => {
    expect(clip('Sam')).toBe('Sam')
  })

  it('cuts long names with an ellipsis', () => {
    expect(clip('abcdefghijklmnopqrstuvwxyz', 10)).toBe('abcdefghi…')
  })

  it('never splits an emoji', () => {
    expect(clip('😂😂😂😂', 3)).toBe('😂😂…')
  })
})
