import type { Ranked, TimeWindow } from './types'

const DAY_MS = 86_400_000

/** Most frequent values, ties broken alphabetically so results are stable. */
export function topCounts(values: Iterable<string | null>, limit: number): Ranked[] {
  const counts = new Map<string, number>()
  for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1)
  return rank(counts, limit)
}

export function rank(counts: Map<string, number>, limit: number): Ranked[] {
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit)
}

/** Count per local hour of day, index 0–23. */
export function hourHistogram(timestamps: Iterable<number>): number[] {
  const hours = new Array<number>(24).fill(0)
  for (const ts of timestamps) hours[new Date(ts).getHours()]++
  return hours
}

export function peakHour(hours: number[]): number {
  let best = 0
  for (let h = 1; h < hours.length; h++) if (hours[h] > hours[best]) best = h
  return best
}

/** Span of the timestamps, at least one day so per-day rates stay finite. */
export function timeWindow(timestamps: Iterable<number>): TimeWindow | null {
  let start = Infinity
  let end = -Infinity
  for (const ts of timestamps) {
    if (ts < start) start = ts
    if (ts > end) end = ts
  }
  if (start === Infinity) return null
  return { start, end, days: Math.max(1, (end - start) / DAY_MS) }
}

/** Local calendar day number, so consecutive days differ by exactly 1. */
export function localDay(ts: number): number {
  const offsetMs = new Date(ts).getTimezoneOffset() * 60_000
  return Math.floor((ts - offsetMs) / DAY_MS)
}

export function localDayStart(day: number): number {
  const utc = day * DAY_MS
  return utc + new Date(utc).getTimezoneOffset() * 60_000
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = sorted.length >> 1
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function round(n: number, digits = 1): number {
  const f = 10 ** digits
  return Math.round(n * f) / f
}
