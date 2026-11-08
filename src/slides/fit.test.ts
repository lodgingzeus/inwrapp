import { describe, expect, it } from 'vitest'
import { cadence, fitCqw, formatWindow } from './fit'

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
