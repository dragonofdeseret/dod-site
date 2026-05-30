// ──────────────────────────────────────────────────────────────────────────────
// Content collections — one per archive type.
//
// Maps the legacy archive.js shape into typed Zod schemas. Frontmatter on
// each markdown file gets validated at build time; missing required fields
// fail the build with a precise message, which is far better than the
// silent-undefined-array-element behavior the legacy archive.js had.
//
// Reading from the collection in pages:
//
//   import { getCollection } from 'astro:content'
//   const art = await getCollection('art')
//
// `art` is an array of `{ id, slug, data: <typed frontmatter>, body, render }`.
// Sort + filter + paginate from there in the page itself.
// ──────────────────────────────────────────────────────────────────────────────

import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

// Shared field shapes. Most collections want date + year + a tag list; the
// types differ on which fields are required and on body vs frontmatter for
// the body-bearing content.

const artOrPhoto = z.object({
  id: z.string(),
  type: z.enum(['art', 'photo']),
  title: z.string(),
  date: z.string(), // ISO date; kept as string so frontmatter doesn't
  // need YAML date typing tricks. Parsed in the page layer when sorting.
  year: z.number(),
  // Path RELATIVE TO public/, e.g. "images/art/2026/2026-05-03.webp".
  // The Image component resolves this against public/; build-time Sharp
  // produces the responsive variants we used to pre-bake.
  image: z.string(),
  sideNoteTitle: z.string().optional(),
  sideNote: z.string().optional(), // HTML string; rendered with set:html
  tags: z.array(z.string()).optional(),
  sections: z.array(z.string()).optional(),
})

const writing = z.object({
  id: z.string(),
  type: z.literal('writing'),
  title: z.string(),
  date: z.string(),
  year: z.number(),
  // PDF path relative to public/, e.g. "pdf/HotEG.pdf".
  file: z.string(),
  sections: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

const margins = z.object({
  id: z.string(),
  type: z.literal('margins'),
  title: z.string(),
  date: z.string(),
  year: z.number(),
  detail: z.string().optional(),
  marginsTags: z.array(z.string()).optional(),
})

const quotes = z.object({
  id: z.string(),
  type: z.literal('quotes'),
  author: z.string().optional(),
  source: z.string().optional(),
})

// Single-entry "site" content — pages whose entire shape is one editable
// document. /now is the only one for now; future additions (an "about"
// blurb, the homepage voice paragraph) can land here.
const site = z.object({
  id: z.string(),
  title: z.string(),
})

export const collections = {
  art: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/art' }),
    schema: artOrPhoto,
  }),
  photo: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/photo' }),
    schema: artOrPhoto,
  }),
  writing: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
    schema: writing,
  }),
  margins: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/margins' }),
    schema: margins,
  }),
  quotes: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/quotes' }),
    schema: quotes,
  }),
  site: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/site' }),
    schema: site,
  }),
}
