/**
 * A font size in container units (cqw) that fits `chars` characters into
 * `width` cqw, given the font's average glyph width in em. Capped at `max`.
 */
export function fitCqw(chars: number, max: number, width = 88, glyphEm = 0.6) {
  return `${Math.min(max, width / (Math.max(chars, 1) * glyphEm)).toFixed(2)}cqw`
}

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

export const formatWindow = (start: number, end: number) => `${shortDate.format(start)} → ${shortDate.format(end)}`

/** "one every 8 minutes", or seconds when it's under a minute. */
export function cadence(minutes: number) {
  if (minutes < 1) {
    const s = Math.max(1, Math.round(minutes * 60))
    return `${s} second${s === 1 ? '' : 's'}`
  }
  const m = Math.round(minutes)
  return `${m} minute${m === 1 ? '' : 's'}`
}
