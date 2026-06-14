// ──────────────────────────────────────────────────────────────────────────────
// Save-entry orchestration. Takes a typed payload from the admin form,
// serializes to markdown, commits to git. Each collection has its own
// shape function below; the API route dispatches by collection name.
//
// Important: this writes ONLY to git. Media files (images, PDFs) are
// uploaded separately from the browser directly to Supabase Storage —
// the payload here just carries the resulting public URL.
// ──────────────────────────────────────────────────────────────────────────────

import { commitFile } from './github-commit'
import { serializeMarkdown, type SerializeInput } from './markdown-serialize'

export type Collection = 'art' | 'photo' | 'writing' | 'margins' | 'quotes'

export interface ArtOrPhotoPayload {
  id: string
  type: 'art' | 'photo'
  title: string
  date: string
  year: number
  image: string // cover (== images[0]); also written for back-compat with single-image consumers
  images?: string[] // full ordered gallery; only emitted when there's more than one
  sideNoteTitle?: string
  sideNote?: string
  tags?: string[]
  // Commerce — opt-in per piece. forSale=true + at least one print entry
  // gates the public "Buy a print" UI. priceCents is the integer Stripe
  // amount; the admin form takes dollars and converts.
  forSale?: boolean
  prints?: Array<{ size: '8x10' | '11x14' | '16x20' | '24x30'; priceCents: number }>
  hidden?: boolean
}

export interface WritingPayload {
  id: string
  type: 'writing'
  title: string
  date: string
  year: number
  file: string
  sections?: string[]
  tags?: string[]
  hidden?: boolean
}

export interface MarginsPayload {
  id: string
  type: 'margins'
  title: string
  date: string
  year: number
  detail?: string
  marginsTags?: string[]
  body: string
}

export interface QuotesPayload {
  id: string
  type: 'quotes'
  author?: string
  source?: string
  body: string
}

export interface SitePayload {
  id: string
  type: 'site'
  title: string
  body: string
}

export type AnyPayload =
  | ArtOrPhotoPayload
  | WritingPayload
  | MarginsPayload
  | QuotesPayload
  | SitePayload

/** Build the repo path for the markdown file given an entry. Quotes
 *  and site entries are flat; everything else gets year-bucketed. */
function pathFor(p: AnyPayload): string {
  if (p.type === 'quotes') return `src/content/quotes/${p.id}.md`
  if (p.type === 'site')   return `src/content/site/${p.id}.md`
  return `src/content/${p.type}/${p.year}/${p.id}.md`
}

function build(p: AnyPayload): SerializeInput {
  switch (p.type) {
    case 'art':
    case 'photo':
      return {
        fields: [
          { key: 'id',            kind: 'string', value: p.id },
          { key: 'type',          kind: 'string', value: p.type },
          { key: 'title',         kind: 'string', value: p.title },
          { key: 'date',          kind: 'string', value: p.date },
          { key: 'year',          kind: 'number', value: p.year },
          { key: 'image',         kind: 'string', value: p.image },
          { key: 'images',        kind: 'array',  value: p.images && p.images.length > 1 ? p.images : undefined },
          { key: 'sideNoteTitle', kind: 'string', value: p.sideNoteTitle },
          { key: 'sideNote',      kind: 'block',  value: p.sideNote },
          { key: 'tags',          kind: 'array',  value: p.tags },
          { key: 'forSale',       kind: 'bool',   value: p.forSale },
          { key: 'prints',        kind: 'json',   value: p.prints },
          { key: 'hidden',        kind: 'bool',   value: p.hidden },
        ],
      }
    case 'writing':
      return {
        fields: [
          { key: 'id',       kind: 'string', value: p.id },
          { key: 'type',     kind: 'string', value: p.type },
          { key: 'title',    kind: 'string', value: p.title },
          { key: 'date',     kind: 'string', value: p.date },
          { key: 'year',     kind: 'number', value: p.year },
          { key: 'file',     kind: 'string', value: p.file },
          { key: 'sections', kind: 'array',  value: p.sections },
          { key: 'tags',     kind: 'array',  value: p.tags },
          { key: 'hidden',   kind: 'bool',   value: p.hidden },
        ],
      }
    case 'margins':
      return {
        fields: [
          { key: 'id',           kind: 'string', value: p.id },
          { key: 'type',         kind: 'string', value: p.type },
          { key: 'title',        kind: 'string', value: p.title },
          { key: 'date',         kind: 'string', value: p.date },
          { key: 'year',         kind: 'number', value: p.year },
          { key: 'detail',       kind: 'string', value: p.detail },
          { key: 'marginsTags',  kind: 'array',  value: p.marginsTags },
        ],
        body: p.body,
      }
    case 'quotes':
      return {
        fields: [
          { key: 'id',     kind: 'string', value: p.id },
          { key: 'type',   kind: 'string', value: p.type },
          { key: 'author', kind: 'string', value: p.author },
          { key: 'source', kind: 'string', value: p.source },
        ],
        body: p.body,
      }
    case 'site':
      return {
        fields: [
          { key: 'id',    kind: 'string', value: p.id },
          { key: 'title', kind: 'string', value: p.title },
        ],
        body: p.body,
      }
  }
}

export async function saveEntry(p: AnyPayload, isNew: boolean): Promise<{
  path: string
  commitSha: string
}> {
  const path = pathFor(p)
  const md = serializeMarkdown(build(p))
  const message = `${isNew ? 'Add' : 'Update'} ${p.type}: ${
    'title' in p && p.title ? p.title : p.id
  }`
  const { commitSha } = await commitFile({ path, content: md, message })
  return { path, commitSha }
}
