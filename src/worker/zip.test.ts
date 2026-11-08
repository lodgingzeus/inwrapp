import { zipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { buildZip64 } from './__fixtures__/zip64'
import { openZip } from './archive'
import { readDirectory, ZipFormatError } from './zip/directory'
import { EncryptedZipError, EntryTooLargeError, readEntry } from './zip/entry'

const enc = new TextEncoder()
const dec = new TextDecoder()

function blobOf(bytes: Uint8Array): Blob {
  return new Blob([bytes as Uint8Array<ArrayBuffer>])
}

function sampleZip(): Uint8Array {
  return zipSync({
    'stored/a.json': [enc.encode('{"a":1}'), { level: 0 }],
    'deflated/b.json': [enc.encode(JSON.stringify({ b: 'x'.repeat(5000) })), { level: 9 }],
    'media/photo.jpg': [new Uint8Array(64), { level: 0 }],
    'folder/': new Uint8Array(0),
  })
}

describe('zip reader', () => {
  it('lists entries and reads stored and deflated files', async () => {
    const archive = await openZip(blobOf(sampleZip()))
    expect(archive.paths().sort()).toEqual(['deflated/b.json', 'media/photo.jpg', 'stored/a.json'])
    expect(dec.decode(await archive.read('stored/a.json'))).toBe('{"a":1}')
    expect(JSON.parse(dec.decode(await archive.read('deflated/b.json'))).b).toHaveLength(5000)
  })

  it('reads zip64 archives', async () => {
    const archive = await openZip(blobOf(buildZip64({ 'x/one.json': '[1]', 'x/two.json': '{"ok":true}' })))
    expect(archive.paths()).toEqual(['x/one.json', 'x/two.json'])
    expect(dec.decode(await archive.read('x/two.json'))).toBe('{"ok":true}')
  })

  it('rejects files that are not zips', async () => {
    await expect(readDirectory(blobOf(enc.encode('just some text, not a zip')))).rejects.toBeInstanceOf(ZipFormatError)
  })

  it('refuses entries over the size cap', async () => {
    const blob = blobOf(sampleZip())
    const entry = (await readDirectory(blob)).find((e) => e.name === 'deflated/b.json')!
    await expect(readEntry(blob, entry, 100)).rejects.toBeInstanceOf(EntryTooLargeError)
  })

  it('refuses encrypted entries', async () => {
    const blob = blobOf(sampleZip())
    const entry = (await readDirectory(blob)).find((e) => e.name === 'stored/a.json')!
    await expect(readEntry(blob, { ...entry, flags: entry.flags | 1 })).rejects.toBeInstanceOf(EncryptedZipError)
  })

  it('detects a declared size that does not match the data', async () => {
    const blob = blobOf(sampleZip())
    const entry = (await readDirectory(blob)).find((e) => e.name === 'stored/a.json')!
    await expect(readEntry(blob, { ...entry, size: entry.size + 1 })).rejects.toBeInstanceOf(ZipFormatError)
  })
})
