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

/** "45 sec", "4 min", "3 hrs", "2 days": a median reply time in plain words. */
export function formatDuration(ms: number) {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${Math.max(s, 1)} sec`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min`
  const h = Math.round(m / 60)
  if (h < 48) return `${h} hr${h === 1 ? '' : 's'}`
  return `${Math.round(h / 24)} days`
}

/** 0 → "midnight", 13 → "1 p.m.". */
export function hourLabel(hour: number) {
  if (hour === 0) return 'midnight'
  if (hour === 12) return 'noon'
  return `${hour % 12} ${hour < 12 ? 'a.m.' : 'p.m.'}`
}

/** Rounds down to two significant figures, with a "+" when it rounded: 6,150 → "6,100+". */
export function floorNice(n: number) {
  if (n < 100) return String(n)
  const step = 10 ** (Math.floor(Math.log10(n)) - 1)
  const floored = Math.floor(n / step) * step
  const text = new Intl.NumberFormat('en-US').format(floored)
  return floored === n ? text : `${text}+`
}

/** "1 day" / "30 days". */
export const plural = (n: number, word: string) => `${new Intl.NumberFormat('en-US').format(n)} ${word}${n === 1 ? '' : 's'}`

/** "this year" for a source that covers about a year, otherwise "in the last 30 days". */
export const windowLabel = (days: number) => (days >= 360 ? 'this year' : `in the last ${plural(Math.max(1, Math.round(days)), 'day')}`)

export const grouped = new Intl.NumberFormat('en-US')

/** Length of the longest entry in characters, for sizing a list with fitCqw. */
export const longest = (names: string[]) => Math.max(1, ...names.map((n) => [...n].length))
