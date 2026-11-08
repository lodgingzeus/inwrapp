import { proxy, wrap } from 'comlink'
import type { ParserApi } from './parser.worker'
import type { ParseResult, Progress } from './pipeline'

export type { ParseResult, Progress }

/**
 * Parses an export zip in a Web Worker. Call once per file; the worker is closed afterwards.
 * Rejects if the worker itself fails (it didn't load, or ran out of memory), which comlink
 * alone would never report.
 */
export async function parseExport(file: File, onProgress: (p: Progress) => void): Promise<ParseResult> {
  const worker = new Worker(new URL('./parser.worker.ts', import.meta.url), { type: 'module' })
  const failed = new Promise<never>((_, reject) => {
    worker.addEventListener('error', () => reject(new Error('worker failed')))
    worker.addEventListener('messageerror', () => reject(new Error('worker message failed')))
  })
  try {
    return await Promise.race([wrap<ParserApi>(worker).parse(file, proxy(onProgress)), failed])
  } finally {
    worker.terminate()
  }
}
