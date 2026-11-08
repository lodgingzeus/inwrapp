import { describe, expect, it } from 'vitest'
import type { Progress } from '../worker/pipeline'
import { counted, initialView, reduceProgress } from './progressCopy'

const run = (events: Progress[]) => events.reduce(reduceProgress, initialView)
const at = (stage: Progress['stage'], count?: number): Progress => ({ stage, done: 0, total: 3, count })

describe('reduceProgress', () => {
  it('says what it is reading before the count exists, then the count', () => {
    expect(run([at('index'), at('likes')])).toMatchObject({ headline: 'Reading every like…', found: null })
    expect(run([at('index'), at('likes'), at('likes', 1234)]).found).toBe('1,234 likes')
  })

  it('logs finished stages with their counts, oldest first', () => {
    const view = run([at('index'), at('profile'), at('likes'), at('likes', 2), at('saved'), at('saved', 1), at('inbox', 4)])
    expect(view.log.map((l) => l.text)).toEqual(['Finding out who you are', '2 likes', '1 save'])
    expect(view.found).toBe('4 chat files')
  })

  it('ends on the done line', () => {
    const view = run([at('index'), at('stats'), at('done')])
    expect(view.headline).toBe('Your year is ready.')
    expect(view.log.map((l) => l.stage)).toEqual(['stats'])
  })
})

describe('counted', () => {
  it('has no count line for stages without records', () => {
    expect(counted('profile', 1)).toBeNull()
    expect(counted('stats', 1)).toBeNull()
  })
})
