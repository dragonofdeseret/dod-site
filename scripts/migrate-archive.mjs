#!/usr/bin/env node
// ──────────────────────────────────────────────────────────────────────────────
// migrate-archive.mjs — one-shot import of the legacy archive.js into Astro
// content collections.
//
// The legacy site stored everything as a single `archive` JS object literal
// (292 entries spanning 2014–2026). Decap CMS + Astro content collections want
// one markdown file per entry, grouped by collection (type). This script
// executes the legacy archive.js in a sandboxed vm context, grabs the
// normalized array, and emits one .md file per entry under
// src/content/<type>/<year>/<id>.md with appropriate frontmatter.
//
// Per-type body shape:
//   • art / photo  → frontmatter only; the rendered "side note" HTML
//                    lives in the body as raw HTML inside the frontmatter
//                    `sideNote` field (preserves the legacy shape).
//   • writing      → frontmatter only; body is the linked PDF path.
//   • margins      → the excerpt text is in the body; metadata in frontmatter.
//   • quotes       → the quote is in the body; author + source in frontmatter.
//
// Run with:
//   npm run migrate
//
// Idempotent — re-running rewrites the markdown files in place. Safe to use
// during the build-out as I tweak frontmatter shapes.
//
// USAGE NOTES
//   • The legacy archive.js path is read from --src. Defaults to the sibling
//     christophershenefelt-site/archive.js. Override for testing.
//   • Output goes to --out, defaulting to ./src/content/. Each collection
//     gets a subdir; existing files are overwritten.
//   • Counts are reported at the end. Cross-check against the legacy site:
//     135 art, 93 photo, 33 writing, 27 margins, 4 quotes (May 2026).
// ──────────────────────────────────────────────────────────────────────────────

import fs from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

// ── CLI args ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
function arg(name, fallback) {
  const i = args.indexOf(name)
  if (i === -1) return fallback
  return args[i + 1] ?? fallback
}

const srcPath = path.resolve(
  arg(
    '--src',
    path.resolve(projectRoot, '..', 'christophershenefelt-site', 'archive.js'),
  ),
)
const outRoot = path.resolve(arg('--out', path.join(projectRoot, 'src', 'content')))

// ── Load + execute archive.js in a sandbox ─────────────────────────────────
//
// The legacy file does `const archive = normalizeArchive([...])` at module
// top level. We can't directly `import` it (no exports), so we read the
// source text, append a global capture line, and execute in a vm context.
// Sandbox isolates from our script's globals.

console.log(`[migrate] reading ${srcPath}`)
const rawSource = await fs.readFile(srcPath, 'utf8')

// The legacy normalizeArchive() OVERWRITES `item.image` with the -1600
// variant path (e.g. images/art/2026/2026-05-03.webp →
// images/art/2026/2026-05-03-1600.webp) so the static site can ship
// the right responsive variant. For migration we want the SOURCE image
// path — Astro's Image component will derive its own variants at build
// time. Neutralize the wrapper by replacing it with the identity
// function before executing the file.
const source = rawSource.replace(
  /function\s+normalizeArchive\s*\([^)]*\)\s*\{[\s\S]*?\n\}/,
  'function normalizeArchive(items) { return items; }',
)

const sandbox = {
  console, // surface any console.log from the legacy file
}
vm.createContext(sandbox)

// Capture line — after the file's `const archive = ...` runs, expose it.
const captureLine = `\n;globalThis.__archive = archive;`
vm.runInContext(source + captureLine, sandbox, {
  filename: 'archive.js',
})

const entries = sandbox.__archive
if (!Array.isArray(entries)) {
  throw new Error('archive.js did not produce an `archive` array')
}
console.log(`[migrate] loaded ${entries.length} entries`)

// ── Sanity counts ──────────────────────────────────────────────────────────

const byType = entries.reduce((acc, e) => {
  const t = e.type ?? 'unknown'
  acc[t] = (acc[t] ?? 0) + 1
  return acc
}, {})
console.log('[migrate] entries by type:', byType)

// ── Helpers ────────────────────────────────────────────────────────────────

/** YAML-safe scalar quoting. Wraps in double quotes and escapes embedded
 *  double quotes + backslashes. Keeps Unicode intact. Sufficient for
 *  titles, ids, tags. */
function yamlString(value) {
  if (value === null || value === undefined) return '""'
  const str = String(value)
  return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

/** YAML array of strings. */
function yamlArray(values) {
  if (!values || values.length === 0) return '[]'
  return `[${values.map(yamlString).join(', ')}]`
}

/** Derive year from a date string when not provided explicitly. */
function deriveYear(entry) {
  if (entry.year) return entry.year
  if (entry.date) {
    const y = new Date(entry.date).getUTCFullYear()
    if (Number.isFinite(y)) return y
  }
  return 'undated'
}

/** Slug for the output filename. Uses the entry's id when present (most
 *  legacy ids are already date-like, e.g. "2026-05-03_2"). Falls back to
 *  date + index when missing. */
function slugFor(entry, index) {
  if (entry.id) return entry.id.replace(/[^a-zA-Z0-9_-]/g, '_')
  if (entry.date) return `${entry.date}_${index}`
  return `entry_${index}`
}

// ── Per-type frontmatter writers ───────────────────────────────────────────

function frontmatterArtOrPhoto(entry) {
  const lines = [
    `id: ${yamlString(entry.id)}`,
    `type: ${yamlString(entry.type)}`,
    `title: ${yamlString(entry.title ?? '')}`,
    `date: ${yamlString(entry.date ?? '')}`,
    `year: ${deriveYear(entry)}`,
    // The legacy `image` field is the path to the source-resolution image
    // (e.g. images/art/2026/2026-05-03.webp). Astro's Image component
    // takes that and generates responsive variants at build time — no
    // more pre-baked -120/-240/-800/etc. We keep the legacy path here so
    // the migration is lossless; the Astro layer resolves it.
    `image: ${yamlString(entry.image ?? '')}`,
  ]
  if (entry.sideNoteTitle) lines.push(`sideNoteTitle: ${yamlString(entry.sideNoteTitle)}`)
  if (entry.sideNote) {
    // sideNote is HTML in the legacy data. Preserve as a YAML block scalar
    // so multi-line HTML survives intact. The `|` indicator + 2-space
    // indent is YAML's literal block style — newlines are preserved.
    lines.push('sideNote: |')
    const body = String(entry.sideNote).trim()
    for (const ln of body.split('\n')) lines.push(`  ${ln}`)
  }
  if (Array.isArray(entry.tags) && entry.tags.length > 0) {
    lines.push(`tags: ${yamlArray(entry.tags)}`)
  }
  if (Array.isArray(entry.sections) && entry.sections.length > 0) {
    lines.push(`sections: ${yamlArray(entry.sections)}`)
  }
  return lines.join('\n')
}

function frontmatterWriting(entry) {
  const lines = [
    `id: ${yamlString(entry.id)}`,
    `type: ${yamlString(entry.type)}`,
    `title: ${yamlString(entry.title ?? '')}`,
    `date: ${yamlString(entry.date ?? '')}`,
    `year: ${deriveYear(entry)}`,
    `file: ${yamlString(entry.file ?? '')}`,
  ]
  if (Array.isArray(entry.sections) && entry.sections.length > 0) {
    lines.push(`sections: ${yamlArray(entry.sections)}`)
  }
  if (Array.isArray(entry.tags) && entry.tags.length > 0) {
    lines.push(`tags: ${yamlArray(entry.tags)}`)
  }
  return lines.join('\n')
}

function frontmatterMargins(entry) {
  const lines = [
    `id: ${yamlString(entry.id)}`,
    `type: ${yamlString(entry.type)}`,
    `title: ${yamlString(entry.title ?? '')}`,
    `date: ${yamlString(entry.date ?? '')}`,
    `year: ${deriveYear(entry)}`,
  ]
  if (entry.detail) lines.push(`detail: ${yamlString(entry.detail)}`)
  if (Array.isArray(entry.marginsTags) && entry.marginsTags.length > 0) {
    lines.push(`marginsTags: ${yamlArray(entry.marginsTags)}`)
  }
  return lines.join('\n')
}

function frontmatterQuotes(entry) {
  const lines = [
    `id: ${yamlString(entry.id)}`,
    `type: ${yamlString(entry.type)}`,
  ]
  if (entry.author) lines.push(`author: ${yamlString(entry.author)}`)
  if (entry.source) lines.push(`source: ${yamlString(entry.source)}`)
  // Quotes have no date in the legacy data; we don't fabricate one.
  return lines.join('\n')
}

// ── Per-type body writers ──────────────────────────────────────────────────

function bodyArtOrPhoto(_entry) {
  // sideNote (HTML) lives in frontmatter for art/photo; body stays empty.
  // The Astro page layer renders sideNote with set:html.
  return ''
}

function bodyWriting(_entry) {
  // Writing entries are PDFs hosted at /pdf/. The body could later carry
  // an editorial intro; for now we leave it empty and the page layer
  // shows just title + link.
  return ''
}

function bodyMargins(entry) {
  return (entry.text ?? '').trim()
}

function bodyQuotes(entry) {
  return (entry.text ?? '').trim()
}

// ── Emit ───────────────────────────────────────────────────────────────────

const writers = {
  art: { fm: frontmatterArtOrPhoto, body: bodyArtOrPhoto, dir: 'art' },
  photo: { fm: frontmatterArtOrPhoto, body: bodyArtOrPhoto, dir: 'photo' },
  writing: { fm: frontmatterWriting, body: bodyWriting, dir: 'writing' },
  margins: { fm: frontmatterMargins, body: bodyMargins, dir: 'margins' },
  quotes: { fm: frontmatterQuotes, body: bodyQuotes, dir: 'quotes' },
}

const written = { art: 0, photo: 0, writing: 0, margins: 0, quotes: 0, skipped: 0 }
const skippedEntries = []

let i = -1
for (const entry of entries) {
  i++
  const w = writers[entry.type]
  if (!w) {
    written.skipped++
    skippedEntries.push({ index: i, id: entry.id, type: entry.type })
    continue
  }

  const year = String(deriveYear(entry))
  const slug = slugFor(entry, i)

  // Quotes don't have a year, so they all land in a flat quotes/ dir.
  // Everything else gets year-bucketed for filesystem legibility.
  const targetDir =
    entry.type === 'quotes'
      ? path.join(outRoot, w.dir)
      : path.join(outRoot, w.dir, year)
  await fs.mkdir(targetDir, { recursive: true })

  const fm = w.fm(entry)
  const body = w.body(entry)
  const md = `---\n${fm}\n---\n${body ? `\n${body}\n` : ''}`

  const filename = `${slug}.md`
  await fs.writeFile(path.join(targetDir, filename), md, 'utf8')
  written[entry.type] = (written[entry.type] ?? 0) + 1
}

console.log('[migrate] wrote:')
for (const [k, v] of Object.entries(written)) {
  console.log(`  ${k.padEnd(8)} ${v}`)
}
if (skippedEntries.length > 0) {
  console.warn('[migrate] skipped entries (no writer for type):')
  for (const s of skippedEntries) console.warn('  ', s)
}
console.log(`[migrate] output → ${outRoot}`)
