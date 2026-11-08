import type { Archive } from '../archive'

const encoder = new TextEncoder()

/** An archive backed by JSON values, keyed by path. */
export function memoryArchive(files: Record<string, unknown>): Archive {
  return {
    paths: () => Object.keys(files),
    read: async (path) => {
      if (!(path in files)) throw new Error(`No such entry: ${path}`)
      const value = files[path]
      return encoder.encode(typeof value === 'string' ? value : JSON.stringify(value))
    },
  }
}
