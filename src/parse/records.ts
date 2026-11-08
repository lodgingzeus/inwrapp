// Instagram exports use two record formats:
//   older: string_list_data / string_map_data
//   newer: label_values: [{label, value, href, vec}] with nested {title, dict} groups
// normalizeRecord turns both into one flat shape. Nested group labels are
// joined with a dot, so the account behind a liked post is "Owner.Username".

export interface NormalRecord {
  /** Epoch milliseconds, or null when the record has no timestamp. */
  timestamp: number | null
  fields: Record<string, string>
  lists: Record<string, string[]>
}

type Obj = Record<string, unknown>

export function isObject(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined
}

function seconds(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v * 1000 : null
}

function flattenLabelValues(items: unknown[], prefix: string, out: NormalRecord): void {
  for (const item of items) {
    if (!isObject(item)) continue
    const label = str(item.label)
    if (label !== undefined) {
      const key = prefix + label
      const value = str(item.value)
      if (value !== undefined && !(key in out.fields)) out.fields[key] = value
      const href = str(item.href)
      if (href !== undefined && !(`${key}.href` in out.fields)) out.fields[`${key}.href`] = href
      if (Array.isArray(item.vec)) {
        out.lists[key] = item.vec.flatMap((v) => (isObject(v) && typeof v.value === 'string' ? [v.value] : []))
      }
    } else if (Array.isArray(item.dict)) {
      const title = str(item.title)
      flattenLabelValues(item.dict, title ? `${prefix}${title}.` : prefix, out)
    }
  }
}

function readStringList(items: unknown[], out: NormalRecord): void {
  const first = items.find(isObject)
  if (!first) return
  const value = str(first.value)
  const href = str(first.href)
  if (value !== undefined) out.fields.value = value
  if (href !== undefined) out.fields.href = href
  out.timestamp ??= seconds(first.timestamp)
}

function readStringMap(map: Obj, out: NormalRecord): void {
  for (const [key, entry] of Object.entries(map)) {
    if (!isObject(entry)) continue
    const value = str(entry.value)
    if (value !== undefined) out.fields[key] = value
    out.timestamp ??= seconds(entry.timestamp)
  }
}

export function normalizeRecord(raw: unknown): NormalRecord | null {
  if (!isObject(raw)) return null
  const out: NormalRecord = { timestamp: seconds(raw.timestamp), fields: {}, lists: {} }

  const title = str(raw.title)
  if (title) out.fields.title = title
  if (Array.isArray(raw.label_values)) flattenLabelValues(raw.label_values, '', out)
  if (Array.isArray(raw.string_list_data)) readStringList(raw.string_list_data, out)
  if (isObject(raw.string_map_data)) readStringMap(raw.string_map_data, out)

  return out
}

/**
 * The list of records in a file. Files are either a bare array, an object
 * wrapping one array (e.g. {relationships_following: [...]}), or a single record.
 */
export function recordList(json: unknown): unknown[] {
  if (Array.isArray(json)) return json
  if (!isObject(json)) return []
  if ('label_values' in json || 'string_map_data' in json) return [json]
  const arrays = Object.values(json).filter(Array.isArray)
  return arrays.length === 1 ? arrays[0] : [json]
}

export function normalizeAll(json: unknown): NormalRecord[] {
  const out: NormalRecord[] = []
  for (const raw of recordList(json)) {
    const rec = normalizeRecord(raw)
    if (rec) out.push(rec)
  }
  return out
}

/** First non-empty field among the given keys. */
export function pickField(rec: NormalRecord, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = rec.fields[key]
    if (v) return v
  }
  return null
}
