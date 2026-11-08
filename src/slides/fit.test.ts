import { describe, expect, it } from 'vitest'
import { cadence, fitCqw, floorNice, formatDuration, formatWindow, hourLabel, plural, windowLabel } from './fit'

describe('cadence', () => {
  it('rounds to whole minutes', () => {
    expect(cadence(7.99)).toBe('8 minutes')
    expect(cadence(1.2)).toBe('1 minute')
  })
  it('switches to seconds under a minute', () => {
    expect(cadence(0.5)).toBe('30 seconds')
    expect(cadence(0.001)).toBe('1 second')
  })
})

describe('fitCqw', () => {
  it('caps at the max size and shrinks for long text', () => {
    expect(fitCqw(2, 30)).toBe('30.00cqw')
    expect(fitCqw(20, 30, 88, 0.5)).toBe('8.80cqw')
    expect(fitCqw(0, 30)).toBe('30.00cqw')
  })
})

describe('formatWindow', () => {
  it('formats a UTC date range', () => {
    expect(formatWindow(Date.UTC(2026, 0, 1), Date.UTC(2026, 11, 31))).toBe('Jan 1 → Dec 31')
  })
})

describe('formatDuration', () => {
  it('picks the largest sensible unit', () => {
    expect(formatDuration(200)).toBe('1 sec')
    expect(formatDuration(45_000)).toBe('45 sec')
    expect(formatDuration(4 * 60_000)).toBe('4 min')
    expect(formatDuration(3_600_000)).toBe('1 hr')
    expect(formatDuration(3 * 3_600_000)).toBe('3 hrs')
    expect(formatDuration(72 * 3_600_000)).toBe('3 days')
  })
})

describe('hourLabel', () => {
  it('names midnight and noon, and uses a.m./p.m. otherwise', () => {
    expect(hourLabel(0)).toBe('midnight')
    expect(hourLabel(3)).toBe('3 a.m.')
    expect(hourLabel(12)).toBe('noon')
    expect(hourLabel(22)).toBe('10 p.m.')
  })
})

describe('floorNice', () => {
  it('rounds down to two significant figures', () => {
    expect(floorNice(42)).toBe('42')
    expect(floorNice(6_150)).toBe('6,100+')
    expect(floorNice(7_500)).toBe('7,500')
    expect(floorNice(1_234_567)).toBe('1,200,000+')
  })
})

describe('plural', () => {
  it('adds an s except for one', () => {
    expect(plural(1, 'day')).toBe('1 day')
    expect(plural(1_200, 'day')).toBe('1,200 days')
  })
})

describe('windowLabel', () => {
  it('says "this year" only for a source that covers about a year', () => {
    expect(windowLabel(365)).toBe('this year')
    expect(windowLabel(30)).toBe('in the last 30 days')
    expect(windowLabel(0.4)).toBe('in the last 1 day')
  })
})
