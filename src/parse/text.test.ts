import { describe, expect, it } from 'vitest'
import { mangle } from './__fixtures__/export'
import { emojiIn, fixMojibake } from './text'

describe('fixMojibake', () => {
  it('repairs UTF-8 stored as Latin-1', () => {
    expect(fixMojibake(mangle('Café 😂'))).toBe('Café 😂')
  })

  it('leaves plain ASCII and proper Unicode alone', () => {
    expect(fixMojibake('hello')).toBe('hello')
    expect(fixMojibake('Café 😂')).toBe('Café 😂')
  })

  it('leaves genuine Latin-1 text that is not valid UTF-8 alone', () => {
    expect(fixMojibake('café')).toBe('café')
  })
})

describe('emojiIn', () => {
  it('returns one entry per emoji grapheme', () => {
    expect(emojiIn('hi 😂😂 ok')).toEqual(['😂', '😂'])
  })

  it('keeps skin tones and flags whole', () => {
    expect(emojiIn('👍🏽 🇮🇳')).toEqual(['👍🏽', '🇮🇳'])
  })

  it('treats ❤️ and ❤ as the same emoji', () => {
    expect(emojiIn('❤️❤')).toEqual(['❤', '❤'])
  })

  it('ignores text without emoji', () => {
    expect(emojiIn('plain words, café')).toEqual([])
  })
})
