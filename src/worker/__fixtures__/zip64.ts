// Builds a small zip that uses zip64 everywhere it can: 0xFFFFFFFF placeholders
// in the central directory with a zip64 extra field, and a zip64 end-of-central-
// directory record + locator. Entries are stored (no compression).

const enc = new TextEncoder()

class Writer {
  private bytes: number[] = []
  get length() {
    return this.bytes.length
  }
  u16(n: number) {
    this.bytes.push(n & 0xff, (n >>> 8) & 0xff)
  }
  u32(n: number) {
    this.u16(n & 0xffff)
    this.u16(Math.floor(n / 0x10000) & 0xffff)
  }
  u64(n: number) {
    this.u32(n % 0x100000000)
    this.u32(Math.floor(n / 0x100000000))
  }
  raw(data: Uint8Array) {
    for (const b of data) this.bytes.push(b)
  }
  toBytes() {
    return new Uint8Array(this.bytes)
  }
}

/** CRC-32 (IEEE), needed so other zip readers accept the fixture. */
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of data) {
    crc ^= byte
    for (let k = 0; k < 8; k++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
  }
  return (crc ^ 0xffffffff) >>> 0
}

export function buildZip64(files: Record<string, string>): Uint8Array {
  const w = new Writer()
  const central: { name: Uint8Array; data: Uint8Array; crc: number; offset: number }[] = []

  for (const [path, text] of Object.entries(files)) {
    const name = enc.encode(path)
    const data = enc.encode(text)
    const crc = crc32(data)
    const offset = w.length
    w.u32(0x04034b50)
    w.u16(45) // version needed: zip64
    w.u16(0x0800) // flags: UTF-8 names
    w.u16(0) // stored
    w.u32(0) // time + date
    w.u32(crc)
    w.u32(0xffffffff)
    w.u32(0xffffffff)
    w.u16(name.length)
    w.u16(20) // zip64 extra: id, size, 2 × u64
    w.raw(name)
    w.u16(0x0001)
    w.u16(16)
    w.u64(data.length)
    w.u64(data.length)
    w.raw(data)
    central.push({ name, data, crc, offset })
  }

  const cdStart = w.length
  for (const e of central) {
    w.u32(0x02014b50)
    w.u16(45)
    w.u16(45)
    w.u16(0x0800)
    w.u16(0)
    w.u32(0)
    w.u32(e.crc)
    w.u32(0xffffffff)
    w.u32(0xffffffff)
    w.u16(e.name.length)
    w.u16(28) // zip64 extra: id, size, 3 × u64
    w.u16(0) // comment
    w.u16(0) // disk
    w.u16(0) // internal attrs
    w.u32(0) // external attrs
    w.u32(0xffffffff)
    w.raw(e.name)
    w.u16(0x0001)
    w.u16(24)
    w.u64(e.data.length)
    w.u64(e.data.length)
    w.u64(e.offset)
  }
  const cdSize = w.length - cdStart

  const zip64EocdAt = w.length
  w.u32(0x06064b50)
  w.u64(44) // size of the rest of this record
  w.u16(45)
  w.u16(45)
  w.u32(0)
  w.u32(0)
  w.u64(central.length)
  w.u64(central.length)
  w.u64(cdSize)
  w.u64(cdStart)

  w.u32(0x07064b50)
  w.u32(0)
  w.u64(zip64EocdAt)
  w.u32(1)

  w.u32(0x06054b50)
  w.u16(0)
  w.u16(0)
  w.u16(0xffff)
  w.u16(0xffff)
  w.u32(0xffffffff)
  w.u32(0xffffffff)
  w.u16(0)

  return w.toBytes()
}
