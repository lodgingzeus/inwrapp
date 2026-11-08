import { describe, expect, it } from 'vitest'
import { advertisers, comments, followers, following, likes } from './__fixtures__/export'
import { normalizeAll, normalizeRecord, pickField, recordList } from './records'

describe('normalizeRecord', () => {
  it('flattens label_values and nested Owner groups', () => {
    const rec = normalizeRecord(likes[0])!
    expect(rec.timestamp).toBe(likes[0].timestamp * 1000)
    expect(rec.fields['Owner.Username']).toBe('cat.daily')
    expect(rec.fields.Caption).toBe('a caption')
    expect(rec.fields['URL.href']).toBe('https://www.instagram.com/p/x')
  })

  it('reads string_map_data with its Time timestamp', () => {
    const rec = normalizeRecord(comments[0])!
    expect(rec.fields['Media Owner']).toBe('sam.k')
    expect(rec.timestamp).toBe(comments[0].string_map_data.Time.timestamp * 1000)
  })

  it('reads string_list_data', () => {
    const rec = normalizeRecord(followers[0])!
    expect(rec.fields.value).toBe('sam.k')
    expect(rec.fields.href).toBe('https://www.instagram.com/sam.k')
  })

  it('collects vec lists', () => {
    const [rec] = normalizeAll(advertisers)
    expect(rec.lists['Advertisers you visited']).toEqual(['Acme Shoes', 'Blue Kettle'])
    expect(rec.lists['Empty list']).toEqual([])
  })

  it('returns null for non-objects', () => {
    expect(normalizeRecord(null)).toBeNull()
    expect(normalizeRecord('x')).toBeNull()
  })
})

describe('recordList', () => {
  it('handles bare arrays, wrapped arrays and single records', () => {
    expect(recordList(likes)).toHaveLength(4)
    expect(recordList(following)).toHaveLength(3)
    expect(recordList(advertisers)).toHaveLength(1)
    expect(recordList(42)).toEqual([])
  })
})

describe('pickField', () => {
  it('returns the first non-empty field', () => {
    const rec = normalizeRecord(following.relationships_following[2])!
    expect(pickField(rec, 'title', 'href')).toBe('https://www.instagram.com/_u/bread.lab')
    expect(pickField(rec, 'missing')).toBeNull()
  })
})
