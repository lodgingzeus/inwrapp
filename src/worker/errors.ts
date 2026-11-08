import { ZipFormatError } from './zip/directory'
import { EncryptedZipError, EntryTooLargeError } from './zip/entry'

export type ExportErrorCode =
  | 'not-a-zip' // not a readable zip at all
  | 'not-instagram' // a zip, but nothing we recognise
  | 'html-export' // an Instagram export in HTML format instead of JSON
  | 'encrypted'
  | 'too-large'
  | 'unknown'

export class ExportError extends Error {
  override name = 'ExportError'
  readonly code: ExportErrorCode
  constructor(code: ExportErrorCode) {
    super(code)
    this.code = code
  }
}

/** Maps any thrown value to a code. Never carries file contents across the worker boundary. */
export function toErrorCode(err: unknown): ExportErrorCode {
  if (err instanceof ExportError) return err.code
  if (err instanceof ZipFormatError) return 'not-a-zip'
  if (err instanceof EncryptedZipError) return 'encrypted'
  if (err instanceof EntryTooLargeError) return 'too-large'
  return 'unknown'
}
