// ──────────────────────────────────────────────────────────────────────────────
// The public videos, newest first — one place for /tv, the watch pages and
// the sidebar's "TV" link to read them.
//
// Why not call getCollection('video') directly: while there are no videos
// the collection's folder doesn't exist, and Astro logs a "collection does
// not exist or is empty" warning on every such call. The sidebar is on
// every page, so that would be hundreds of identical lines per build. The
// file listing below is known at build time, so with no video files we
// simply don't ask.
// ──────────────────────────────────────────────────────────────────────────────

import { getCollection, type CollectionEntry } from 'astro:content'
import { publicOnly, sortByDateDesc } from './sort-group'

// Paths only — nothing is loaded through this.
const VIDEO_FILES = Object.keys(import.meta.glob('/src/content/video/**/*.md'))

export async function getPublicVideos(): Promise<CollectionEntry<'video'>[]> {
  if (VIDEO_FILES.length === 0) return []
  return sortByDateDesc(publicOnly(await getCollection('video')))
}
