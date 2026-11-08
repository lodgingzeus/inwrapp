import { describe, expect, it } from 'vitest'
import { localDay, localDayStart, median, peakHour, timeWindow, topCounts } from './count'

const DAY = 86_400_000

describe('count helpers', () => {
  it('ranks by count, then name, skipping nulls', () => {
    expect(topCounts(['b', 'a', null, 'b', 'a', 'c'], 2)).toEqual([
      { name: 'a', count: 2 },
      { name: 'b', count: 2 },
    ])
  })

  it('finds the busiest hour', () => {
    expect(peakHour([0, 3, 1, 3])).toBe(1)
  })

  it('gives a window of at least one day', () => {
    expect(timeWindow([])).toBeNull()
    expect(timeWindow([5, 5])?.days).toBe(1)
    expect(timeWindow([0, 3 * DAY])).toEqual({ start: 0, end: 3 * DAY, days: 3 })
  })

  it('numbers local days consecutively and round-trips day starts', () => {
    const t = Date.UTC(2025, 0, 1, 15)
    expect(localDay(t + DAY) - localDay(t)).toBe(1)
    expect(localDay(localDayStart(localDay(t)))).toBe(localDay(t))
  })

  it('takes medians', () => {
    expect(median([])).toBeNull()
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 2, 3])).toBe(2.5)
  })
})
