// Reads a zip's central directory with Blob.slice, so the archive is never
// loaded into memory whole. Supports zip64. Spec: PKWARE APPNOTE.TXT.

export interface ZipEntry {
  name: string
  method: number
  flags: number
  compressedSize: number
  size: number
  localHeaderOffset: number
}

export class ZipFormatError extends Error {
  override name = 'ZipFormatError'
}

const SIG_EOCD = 0x06054b50
const SIG_ZIP64_LOCATOR = 0x07064b50
const SIG_ZIP64_EOCD = 0x06064b50
const SIG_CENTRAL = 0x02014b50
const EOCD_MIN = 22
const MAX_COMMENT = 0xffff
const ZIP64_EXTRA_ID = 0x0001
const U16_MAX = 0xffff
const U32_MAX = 0xffffffff

export async function readBytes(blob: Blob, start: number, length: number): Promise<DataView> {
  if (start < 0 || length < 0 || start + length > blob.size) throw new ZipFormatError('Read outside the file')
  return new DataView(await blob.slice(start, start + length).arrayBuffer())
}

function u64(view: DataView, at: number): number {
  const n = view.getBigUint64(at, true)
  if (n > BigInt(Number.MAX_SAFE_INTEGER)) throw new ZipFormatError('Zip64 value too large')
  return Number(n)
}

interface DirectoryLocation {
  offset: number
  size: number
  entries: number
}

async function locateDirectory(blob: Blob): Promise<DirectoryLocation> {
  const tailLength = Math.min(blob.size, EOCD_MIN + MAX_COMMENT)
  const tailStart = blob.size - tailLength
  const tail = await readBytes(blob, tailStart, tailLength)

  let eocd = -1
  for (let i = tailLength - EOCD_MIN; i >= 0; i--) {
    if (tail.getUint32(i, true) === SIG_EOCD) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new ZipFormatError('Not a zip file')

  const entries = tail.getUint16(eocd + 10, true)
  const size = tail.getUint32(eocd + 12, true)
  const offset = tail.getUint32(eocd + 16, true)
  if (entries !== U16_MAX && size !== U32_MAX && offset !== U32_MAX) return { offset, size, entries }

  // Zip64: a locator sits right before the classic record and points at the zip64 record.
  const locatorAt = tailStart + eocd - 20
  const locator = await readBytes(blob, locatorAt, 20)
  if (locator.getUint32(0, true) !== SIG_ZIP64_LOCATOR) throw new ZipFormatError('Missing zip64 locator')
  const record = await readBytes(blob, u64(locator, 8), 56)
  if (record.getUint32(0, true) !== SIG_ZIP64_EOCD) throw new ZipFormatError('Bad zip64 record')
  return { entries: u64(record, 32), size: u64(record, 40), offset: u64(record, 48) }
}

/** Replaces 0xFFFFFFFF placeholders with values from the zip64 extra field, in spec order. */
function applyZip64Extra(view: DataView, start: number, length: number, entry: ZipEntry): void {
  let at = start
  const end = start + length
  while (at + 4 <= end) {
    const id = view.getUint16(at, true)
    const size = view.getUint16(at + 2, true)
    if (id === ZIP64_EXTRA_ID) {
      let field = at + 4
      if (entry.size === U32_MAX) {
        entry.size = u64(view, field)
        field += 8
      }
      if (entry.compressedSize === U32_MAX) {
        entry.compressedSize = u64(view, field)
        field += 8
      }
      if (entry.localHeaderOffset === U32_MAX) entry.localHeaderOffset = u64(view, field)
      return
    }
    at += 4 + size
  }
}

const utf8 = new TextDecoder()

export async function readDirectory(blob: Blob): Promise<ZipEntry[]> {
  const loc = await locateDirectory(blob)
  const view = await readBytes(blob, loc.offset, loc.size)
  const entries: ZipEntry[] = []

  let at = 0
  for (let i = 0; i < loc.entries; i++) {
    if (at + 46 > view.byteLength || view.getUint32(at, true) !== SIG_CENTRAL) {
      throw new ZipFormatError('Corrupt central directory')
    }
    const nameLength = view.getUint16(at + 28, true)
    const extraLength = view.getUint16(at + 30, true)
    const commentLength = view.getUint16(at + 32, true)
    const nameBytes = new Uint8Array(view.buffer, view.byteOffset + at + 46, nameLength)

    const entry: ZipEntry = {
      name: utf8.decode(nameBytes),
      flags: view.getUint16(at + 8, true),
      method: view.getUint16(at + 10, true),
      compressedSize: view.getUint32(at + 20, true),
      size: view.getUint32(at + 24, true),
      localHeaderOffset: view.getUint32(at + 42, true),
    }
    applyZip64Extra(view, at + 46 + nameLength, extraLength, entry)
    entries.push(entry)
    at += 46 + nameLength + extraLength + commentLength
  }
  return entries
}
