import { defineConfig } from 'vitest/config'

// Separate from the unit tests: this one reads a real export from disk.
export default defineConfig({
  test: { environment: 'node', include: ['scripts/check-export.test.ts'] },
})
