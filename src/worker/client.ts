import { proxy, wrap } from 'comlink'
import type { ParserApi } from './parser.worker'
import type { ParseResult, Progress } from './pipeline'

export type { ParseResult, Progress }

/** Parses an export zip in a Web Worker. Call once per file; the worker is closed afterwards. */
export async function parseExport(file: File, onProgress: (p: Progress) => void): Promise<ParseResult> {
  const worker = new Worker(new URL('./parser.worker.ts', import.meta.url), { type: 'module' })
  try {
    return await wrap<ParserApi>(worker).parse(file, proxy(onProgress))
  } finally {
    worker.terminate()
  }
}
