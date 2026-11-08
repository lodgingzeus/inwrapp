import { expose } from 'comlink'
import { openZip } from './archive'
import { toErrorCode } from './errors'
import { runPipeline, type ParseResult, type Progress } from './pipeline'

// Runs off the main thread. Only the finished WrappedStats (small) is sent
// back, never raw export data. Nothing here makes network requests.

const api = {
  async parse(file: Blob, onProgress: (p: Progress) => void): Promise<ParseResult> {
    try {
      return await runPipeline(await openZip(file), onProgress)
    } catch (err) {
      return { ok: false, error: toErrorCode(err) }
    }
  },
}

export type ParserApi = typeof api

expose(api)
