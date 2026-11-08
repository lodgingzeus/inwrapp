import { inflateSync } from 'fflate'
import { readBytes, ZipFormatError, type ZipEntry } from './directory'

const SIG_LOCAL = 0x04034b50
const METHOD_STORED = 0
const METHOD_DEFLATE = 8
const FLAG_ENCRYPTED = 0x1

/** Hard cap per entry. Guards against zip bombs; no real JSON file in an export comes close. */
export const MAX_ENTRY_BYTES = 1024 * 1024 * 1024

export class EncryptedZipError extends Error {
  override name = 'EncryptedZipError'
}

export class EntryTooLargeError extends Error {
  override name = 'EntryTooLargeError'
}

/** Decompresses one entry. Only stored and deflate entries are supported. */
export async function readEntry(blob: Blob, entry: ZipEntry, maxBytes = MAX_ENTRY_BYTES): Promise<Uint8Array> {
  if (entry.flags & FLAG_ENCRYPTED) throw new EncryptedZipError(entry.name)
  if (entry.size > maxBytes || entry.compressedSize > maxBytes) throw new EntryTooLargeError(entry.name)

  // The local header's name and extra lengths can differ from the central directory's.
  const header = await readBytes(blob, entry.localHeaderOffset, 30)
  if (header.getUint32(0, true) !== SIG_LOCAL) throw new ZipFormatError(`Bad local header: ${entry.name}`)
  const dataStart = entry.localHeaderOffset + 30 + header.getUint16(26, true) + header.getUint16(28, true)

  const raw = new Uint8Array((await readBytes(blob, dataStart, entry.compressedSize)).buffer)

  let data: Uint8Array
  if (entry.method === METHOD_STORED) data = raw
  else if (entry.method === METHOD_DEFLATE) data = inflateSync(raw, { out: new Uint8Array(entry.size) })
  else throw new ZipFormatError(`Unsupported compression method ${entry.method}: ${entry.name}`)

  if (data.length !== entry.size) throw new ZipFormatError(`Size mismatch: ${entry.name}`)
  return data
}
