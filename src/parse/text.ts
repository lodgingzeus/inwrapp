// Meta exports store UTF-8 bytes as Latin-1 code points ("ðŸ˜‚" instead of 😂).

const strictUtf8 = new TextDecoder('utf-8', { fatal: true })

/** True when every char fits in one byte and at least one is above ASCII. */
function looksMangled(s: string): boolean {
  let high = false
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    if (c > 0xff) return false
    if (c >= 0x80) high = true
  }
  return high
}

/** Repairs mojibake. Strings that are not mangled, or not valid UTF-8 as bytes, are returned unchanged. */
export function fixMojibake(s: string): string {
  if (!looksMangled(s)) return s
  const bytes = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i)
  try {
    return strictUtf8.decode(bytes)
  } catch {
    return s
  }
}

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
const EMOJI = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u
const NON_ASCII = /[\u0080-￿]/
const VARIATION_SELECTOR = /️/g

/** Emoji in a (repaired) string, one entry per emoji grapheme, e.g. "👍🏽" stays whole. */
export function emojiIn(s: string): string[] {
  if (!NON_ASCII.test(s)) return []
  const out: string[] = []
  for (const { segment } of graphemes.segment(s)) {
    if (EMOJI.test(segment)) out.push(segment.replace(VARIATION_SELECTOR, ''))
  }
  return out
}
