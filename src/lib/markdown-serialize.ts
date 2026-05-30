// ──────────────────────────────────────────────────────────────────────────────
// Serialize an admin form payload back into the legacy migrate-archive.mjs
// markdown shape, so files written by the admin look identical to those
// produced by the one-shot migration (and are round-trippable through
// either path).
//
// The YAML scalar quoting is intentionally minimal — same shape the
// migration script emits. Multi-line strings use the `|` block-literal
// style. Arrays of strings use inline `["a", "b"]`. Anything else falls
// back to JSON.stringify which is YAML-safe for scalars + objects.
// ──────────────────────────────────────────────────────────────────────────────

function yamlString(value: unknown): string {
  if (value === null || value === undefined) return '""'
  const s = String(value)
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function yamlArrayInline(values: string[] | undefined): string | null {
  if (!values || values.length === 0) return null
  return `[${values.map(yamlString).join(', ')}]`
}

function yamlBlockScalar(value: string | undefined): string[] | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return ['|', ...trimmed.split('\n').map((ln) => `  ${ln}`)]
}

export interface SerializeInput {
  /** Ordered list of frontmatter fields. Order matters for diff legibility. */
  fields: Array<
    | { key: string; kind: 'string'; value?: string | null }
    | { key: string; kind: 'number'; value?: number | null }
    | { key: string; kind: 'array';  value?: string[] }
    | { key: string; kind: 'block';  value?: string | null } // multiline string (HTML body, etc.)
  >
  /** Optional markdown body (renders after the closing `---`). */
  body?: string
}

export function serializeMarkdown(input: SerializeInput): string {
  const lines: string[] = ['---']
  for (const field of input.fields) {
    if (field.kind === 'array') {
      const arr = yamlArrayInline(field.value)
      if (arr) lines.push(`${field.key}: ${arr}`)
      continue
    }
    if (field.kind === 'block') {
      const block = yamlBlockScalar(field.value ?? undefined)
      if (block) {
        lines.push(`${field.key}: ${block[0]}`)
        for (let i = 1; i < block.length; i++) lines.push(block[i]!)
      }
      continue
    }
    if (field.kind === 'number') {
      if (field.value !== null && field.value !== undefined) {
        lines.push(`${field.key}: ${field.value}`)
      }
      continue
    }
    // string
    if (field.value !== null && field.value !== undefined && field.value !== '') {
      lines.push(`${field.key}: ${yamlString(field.value)}`)
    }
  }
  lines.push('---')
  const body = (input.body ?? '').trim()
  return body ? `${lines.join('\n')}\n\n${body}\n` : `${lines.join('\n')}\n`
}
