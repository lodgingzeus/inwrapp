import { readDirectory, type ZipEntry } from './zip/directory'
import { readEntry } from './zip/entry'

/** What the pipeline needs from an export. Lets tests use plain in-memory fixtures. */
export interface Archive {
  paths(): string[]
  read(path: string): Promise<Uint8Array>
}

export async function openZip(blob: Blob): Promise<Archive> {
  const entries = new Map<string, ZipEntry>()
  for (const entry of await readDirectory(blob)) {
    if (!entry.name.endsWith('/')) entries.set(entry.name, entry)
  }
  return {
    paths: () => [...entries.keys()],
    read: async (path) => {
      const entry = entries.get(path)
      if (!entry) throw new Error(`No such entry: ${path}`)
      return readEntry(blob, entry)
    },
  }
}

const decoder = new TextDecoder()

export async function readJson(archive: Archive, path: string): Promise<unknown> {
  return JSON.parse(decoder.decode(await archive.read(path)))
}
