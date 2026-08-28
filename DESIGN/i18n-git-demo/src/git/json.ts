export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export function isFlatStringMap(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((item) => typeof item === 'string')
}

export function flattenJson(value: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  if (!isRecord(value)) {
    if (prefix) out[prefix] = value == null ? '' : String(value)
    return out
  }
  for (const [key, nested] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (isRecord(nested)) Object.assign(out, flattenJson(nested, path))
    else out[path] = nested == null ? '' : String(nested)
  }
  return out
}

export function unflattenJson(flat: Record<string, string>): Record<string, unknown> {
  const root: Record<string, unknown> = {}
  for (const [path, text] of Object.entries(flat)) {
    const parts = path.split('.').filter(Boolean)
    if (parts.length === 0) continue
    let cursor: Record<string, unknown> = root
    for (let i = 0; i < parts.length - 1; i += 1) {
      const part = parts[i]
      const next = cursor[part]
      if (!isRecord(next)) cursor[part] = {}
      cursor = cursor[part] as Record<string, unknown>
    }
    cursor[parts[parts.length - 1]] = text
  }
  return root
}

export function parseLocaleJson(raw: string): {
  flat: Record<string, string>
  nested: boolean
} {
  const parsed: unknown = JSON.parse(raw)
  if (isFlatStringMap(parsed)) return { flat: { ...parsed }, nested: false }
  return { flat: flattenJson(parsed), nested: true }
}

export function serializeLocaleJson(flat: Record<string, string>, nested: boolean): string {
  const data = nested ? unflattenJson(flat) : flat
  return `${JSON.stringify(data, null, 2)}\n`
}

export function localeFromPath(filepath: string): string {
  const name = filepath.split('/').pop() ?? filepath
  return name.replace(/\.json$/i, '')
}

export function isLocaleJsonPath(filepath: string): boolean {
  return /(^|\/)(locales|locale|i18n|lang)\//i.test(filepath) && /\.json$/i.test(filepath)
}
