// ──────────────────────────────────────────────────────────────────────────────
// POST /admin/api/delete — remove a markdown file from the repo. Single
// commit per delete. Doesn't touch any media in Supabase Storage — orphan
// cleanup is a separate concern (a periodic sweep across the buckets vs.
// referenced URLs in markdown).
//
// Videos are the exception: the file lives at Mux and is billed by the
// minute stored, so deleting a video entry also deletes its Mux asset —
// unless another entry still plays that same file. The entry is removed
// first; if the file then can't be removed (or checked) the response says
// so and names the asset to remove by hand.
// ──────────────────────────────────────────────────────────────────────────────

export const prerender = false

import type { APIRoute } from 'astro'
import { deleteFile, readFile } from '../../../lib/github-commit'
import { parseContentFile, videoAssetInUse } from '../../../lib/live-content'
import { muxConfigured } from '../../../lib/env'
import { deleteAsset, MUX_ID } from '../../../lib/mux'
import { SAFE_ID } from '../../../lib/save-entry'

const COLLECTIONS = ['art', 'photo', 'writing', 'margins', 'quotes', 'video'] as const

interface Body {
  collection: (typeof COLLECTIONS)[number]
  id: string
  year?: number
  /** The exact file the editor loaded. Preferred over collection+year+id:
   *  the year field may have been edited without saving, and if an entry
   *  somehow exists under two years this deletes the one that was open. */
  basePath?: string
}


function pathFor(b: Body): string {
  if (!COLLECTIONS.includes(b.collection)) throw new Error(`Unknown collection "${b.collection}"`)
  if (!b.id || typeof b.id !== 'string') throw new Error('Invalid id')
  if (typeof b.basePath === 'string' && b.basePath) {
    // Must be this entry's own file: this collection, this id, flat or
    // under a four-digit year folder. Nothing else can be named this way.
    const own = new RegExp(`^src/content/${b.collection}/(?:\\d{4}/)?[^/]+\\.md$`)
    if (!own.test(b.basePath) || !b.basePath.endsWith(`/${b.id}.md`) || b.basePath.includes('..')) {
      throw new Error('Invalid basePath')
    }
    return b.basePath
  }
  // No known file: the path is built from the id, so the id must not be
  // able to step outside the collection's folder.
  if (!SAFE_ID.test(b.id)) throw new Error('Invalid id')
  if (b.collection === 'quotes') return `src/content/quotes/${b.id}.md`
  const year = Number(b.year)
  if (!Number.isInteger(year) || year < 1000 || year > 9999) {
    throw new Error('year required for non-quote collections')
  }
  return `src/content/${b.collection}/${year}/${b.id}.md`
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Not authorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return new Response(JSON.stringify({ error: 'Body must be JSON' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }
  try {
    const path = pathFor(body)

    // Video: find the Mux asset this entry points at before the entry goes.
    let muxAssetId: string | undefined
    if (body.collection === 'video') {
      const current = await readFile(path)
      const id = current ? parseContentFile(current.content)?.data.muxAssetId : undefined
      if (typeof id === 'string' && MUX_ID.test(id)) muxAssetId = id
    }

    const { commitSha } = await deleteFile({
      path,
      message: `Delete ${body.collection}: ${body.id}`,
    })

    let warning: string | undefined
    if (muxAssetId) {
      try {
        // Never remove a file another entry still plays (e.g. a duplicate
        // of this entry under another year).
        const inUse = await videoAssetInUse(muxAssetId, path)
        if (inUse === 'unknown') throw new Error("couldn't check whether another entry uses this video")
        if (inUse === 'no') {
          if (!muxConfigured()) throw new Error('Mux is not configured')
          await deleteAsset(muxAssetId)
        }
      } catch (err) {
        console.error('[admin delete] Mux asset not deleted', muxAssetId, err)
        warning = `The entry was deleted, but the video file is still stored at Mux. If no other entry uses it, remove asset ${muxAssetId} in the Mux dashboard to stop storage charges.`
      }
    }

    return new Response(JSON.stringify({ ok: true, path, commitSha, warning }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[admin delete] failed', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
