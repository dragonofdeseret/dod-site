// ──────────────────────────────────────────────────────────────────────────────
// GET /storage/pdf-files/<path>.pdf — same-origin proxy for admin-uploaded
// PDFs that live in the Supabase Storage `pdf-files` bucket.
//
// Why: the essay pages embed the PDF in an <iframe>. Safari renders a
// CROSS-origin PDF in an iframe as a column of tiny page thumbnails instead
// of fitting it to the frame; same-origin PDFs (the legacy ones in public/)
// display normally. Serving uploads through our own origin makes them
// behave like the legacy files. src/lib/file-url.ts maps stored Supabase
// URLs to this route.
//
// The upstream body is streamed straight through (no buffering, so large
// PDFs aren't subject to the serverless response-size cap), and Range /
// conditional headers are forwarded so the browser's PDF viewer can fetch
// byte ranges and revalidate.
// ──────────────────────────────────────────────────────────────────────────────

export const prerender = false

import type { APIRoute } from 'astro'
import { SUPABASE_URL } from '../../../lib/env'

// Only plain relative PDF paths inside the bucket — no traversal, no
// query tricks, no other file types.
const SAFE_PATH = /^[A-Za-z0-9._\-/]+\.pdf$/

const FORWARD_REQUEST = ['range', 'if-none-match', 'if-modified-since']
const FORWARD_RESPONSE = [
  'content-type',
  'content-length',
  'content-range',
  'accept-ranges',
  'etag',
  'last-modified',
]

export const GET: APIRoute = async ({ params, request }) => {
  const path = params.path ?? ''
  if (!SAFE_PATH.test(path) || path.split('/').includes('..')) {
    return new Response('Not found', { status: 404 })
  }

  const headers = new Headers()
  for (const h of FORWARD_REQUEST) {
    const v = request.headers.get(h)
    if (v) headers.set(h, v)
  }

  const upstream = await fetch(
    `${SUPABASE_URL}/storage/v1/object/public/pdf-files/${path}`,
    { headers },
  )

  if (upstream.status === 404 || upstream.status === 400) {
    return new Response('Not found', { status: 404 })
  }

  const out = new Headers()
  for (const h of FORWARD_RESPONSE) {
    const v = upstream.headers.get(h)
    if (v) out.set(h, v)
  }
  // Display in the viewer rather than download. Short cache: uploads can be
  // replaced in place (the uploader upserts to the same path).
  out.set('content-disposition', 'inline')
  out.set('cache-control', 'public, max-age=300, s-maxage=3600')

  return new Response(upstream.body, { status: upstream.status, headers: out })
}
