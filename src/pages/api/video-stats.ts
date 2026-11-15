// ──────────────────────────────────────────────────────────────────────────────
// /api/video-stats — public view counts and likes for /tv videos.
//
//   GET  ?ids=a,b,c&viewer=<browser id>
//        → { available: true, counts: { a: { views, likes, liked }, … } }
//   POST { action: 'view' | 'like' | 'unlike', id, visitor }
//        → { available: true, ok, counts: { views, likes, liked } }
//
// `available: false` means the stats database isn't set up or reachable;
// the page then simply doesn't show any numbers.
//
// Only ids of public videos are accepted, so nothing can be counted for
// videos that don't exist. Counting rules live in the database (see
// lib/video-stats.ts and supabase/video-stats.sql).
// ──────────────────────────────────────────────────────────────────────────────

export const prerender = false

import type { APIRoute } from 'astro'
import { getPublicVideos } from '../../lib/video-collection'
import {
  countsFor,
  ipHash,
  recordView,
  setLike,
  StatsUnavailable,
  VISITOR_ID,
} from '../../lib/video-stats'

const MAX_IDS = 60

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

async function publicIds(): Promise<Set<string>> {
  return new Set((await getPublicVideos()).map((v) => v.data.id))
}

function addressOf(request: Request, clientAddress: () => string): string {
  try {
    const a = clientAddress()
    if (a) return a
  } catch {
    /* not provided in this environment */
  }
  return (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
}

export const GET: APIRoute = async ({ url }) => {
  const known = await publicIds()
  const ids = [...new Set((url.searchParams.get('ids') ?? '').split(','))]
    .filter((id) => known.has(id))
    .slice(0, MAX_IDS)
  const viewerParam = url.searchParams.get('viewer') ?? ''
  const viewer = VISITOR_ID.test(viewerParam) ? viewerParam : null
  try {
    return json({ available: true, counts: await countsFor(ids, viewer) })
  } catch (err) {
    if (err instanceof StatsUnavailable) return json({ available: false })
    console.error('[api/video-stats] GET', err)
    return json({ available: false })
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Only this site's own pages may count views and likes. (The site-wide
  // origin check is off for the admin's sake, see astro.config.mjs.) A
  // JSON request from another site needs the browser to ask permission
  // first, which this route never grants; other body types are refused
  // here, and browsers that say where a request came from are checked too.
  const type = (request.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
  if (type !== 'application/json') return json({ error: 'Body must be JSON.' }, 415)
  const site = request.headers.get('sec-fetch-site')
  if (site && site !== 'same-origin' && site !== 'same-site') return json({ error: 'Forbidden.' }, 403)
  let body: { action?: string; id?: string; visitor?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return json({ error: 'Body must be JSON.' }, 400)
  }
  const { action, id, visitor } = body
  if (action !== 'view' && action !== 'like' && action !== 'unlike') {
    return json({ error: 'Unknown action.' }, 400)
  }
  if (typeof visitor !== 'string' || !VISITOR_ID.test(visitor)) {
    return json({ error: 'Invalid visitor.' }, 400)
  }
  if (typeof id !== 'string' || !(await publicIds()).has(id)) {
    return json({ error: 'Unknown video.' }, 404)
  }
  try {
    const hash = ipHash(addressOf(request, clientAddress))
    const result =
      action === 'view' ? await recordView(id, visitor, hash) : await setLike(id, visitor, hash, action === 'like')
    return json({ available: true, ...result })
  } catch (err) {
    if (!(err instanceof StatsUnavailable)) console.error('[api/video-stats] POST', err)
    return json({ available: false })
  }
}
