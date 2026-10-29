// ──────────────────────────────────────────────────────────────────────────────
// Live view of the content collections for the admin.
//
// Content is baked into each deployment at build time, so between an admin
// save (a commit) and Vercel finishing the rebuild, the built copy is stale:
// a new entry is missing, a deleted one lingers, an edited title is old.
// The admin must not act on that copy — that's how a stale editor once
// silently reverted a newer save.
//
// Here the source of truth is the branch on GitHub, read cheaply:
//   1. one recursive tree listing gives every content file's path + blob SHA
//      (listContentTree — 2 API calls total);
//   2. each file's raw markdown is also bundled into this build
//      (import.meta.glob ?raw); if its git blob SHA equals the tree's, the
//      bundled text IS current and is parsed locally — no API call;
//   3. only files new or changed since the build are fetched (readFile).
// So a normal page load costs 2 API calls plus one per entry saved since the
// last deploy. If GitHub can't be reached, callers fall back to the bundle
// and say so.
// ──────────────────────────────────────────────────────────────────────────────

import { createHash } from 'node:crypto'
import yaml from 'js-yaml'
import { listContentTree, readFile } from './github-commit'

/** Raw markdown of every content file as of this build, keyed by repo path. */
const BUNDLED: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob('/src/content/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>,
  ).map(([k, v]) => [k.replace(/^\//, ''), v]),
)

export type Collection = 'art' | 'photo' | 'writing' | 'margins' | 'quotes' | 'site'

export interface LiveEntry {
  /** Repo-relative path, e.g. src/content/art/2026/2026-10-02.md */
  path: string
  /** Entry id (== filename without .md for every entry in this repo). */
  id: string
  data: Record<string, unknown>
  body: string
}

/** Git blob SHA of a file's content — what GitHub's tree listing reports. */
function blobSha(content: string): string {
  const bytes = Buffer.from(content, 'utf8')
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
}

/**
 * Split a content file into frontmatter data and markdown body. CORE_SCHEMA
 * keeps dates as strings (no YAML timestamp coercion), matching what the
 * content collections produce.
 */
export function parseContentFile(text: string): { data: Record<string, unknown>; body: string } | null {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return null
  const data = (yaml.load(m[1], { schema: yaml.CORE_SCHEMA }) ?? {}) as Record<string, unknown>
  return { data, body: m[2].replace(/^\s*\n/, '').replace(/\s+$/, '') }
}

function toEntry(path: string, text: string): LiveEntry | null {
  const parsed = parseContentFile(text)
  if (!parsed) return null
  const fileId = path.split('/').pop()!.replace(/\.md$/, '')
  return { path, id: String(parsed.data.id ?? fileId), data: parsed.data, body: parsed.body }
}

const inCollection = (path: string, col: Collection) => path.startsWith(`src/content/${col}/`)

/**
 * Entries for the given collections as they are on GitHub right now.
 * `live` is false when GitHub couldn't be reached and the build copy was
 * used instead.
 */
export async function liveEntries(
  cols: Collection[],
): Promise<{ live: boolean; byCollection: Record<string, LiveEntry[]> }> {
  const byCollection: Record<string, LiveEntry[]> = Object.fromEntries(cols.map((c) => [c, []]))
  try {
    const tree = await listContentTree()
    const wanted = [...tree].filter(([path]) => cols.some((c) => inCollection(path, c)))
    const entries = await Promise.all(
      wanted.map(async ([path, sha]) => {
        const bundled = BUNDLED[path]
        if (bundled !== undefined && blobSha(bundled) === sha) return toEntry(path, bundled)
        const fresh = await readFile(path)
        return fresh ? toEntry(path, fresh.content) : null
      }),
    )
    for (const e of entries) {
      if (!e) continue
      const col = cols.find((c) => inCollection(e.path, c))
      if (col) byCollection[col].push(e)
    }
    return { live: true, byCollection }
  } catch (err) {
    console.error('[live-content] GitHub unreachable, using build copy', err)
    for (const [path, text] of Object.entries(BUNDLED)) {
      const col = cols.find((c) => inCollection(path, c))
      if (!col) continue
      const e = toEntry(path, text)
      if (e) byCollection[col].push(e)
    }
    return { live: false, byCollection }
  }
}

/**
 * Locate an entry's file on GitHub by collection + id, including entries
 * created since the last deploy. Returns null if it doesn't exist (e.g.
 * deleted). Throws if GitHub can't be reached.
 */
export async function findEntryPath(col: Collection, id: string): Promise<string | null> {
  const tree = await listContentTree()
  for (const path of tree.keys()) {
    if (inCollection(path, col) && path.endsWith(`/${id}.md`)) return path
  }
  return null
}
