// ──────────────────────────────────────────────────────────────────────────────
// POST /admin/api/video-upload — start a video upload.
//
// Asks Mux for a one-off direct-upload URL and hands it to the admin's
// browser, which then sends the file straight to Mux in resumable chunks.
// The file never passes through this site, so Vercel's request-size and
// time limits don't apply to it. The Mux API token stays on the server.
//
// Auth: /admin/** middleware. The URL is single-use and tied to this site's
// origin, so it is useless anywhere else.
// ──────────────────────────────────────────────────────────────────────────────

export const prerender = false

import type { APIRoute } from 'astro'
import { muxConfigured } from '../../../lib/env'
import { createDirectUpload, MuxError, MUX_NOT_CONFIGURED } from '../../../lib/mux'

export const POST: APIRoute = async ({ request, locals, url }) => {
  if (!locals.user) return json({ error: 'Not authorized' }, 401)
  if (!muxConfigured()) return json({ error: MUX_NOT_CONFIGURED }, 503)

  let body: { title?: string } = {}
  try {
    body = (await request.json()) as typeof body
  } catch {
    /* body is optional */
  }

  // Mux only accepts the upload from this origin. Prefer the browser's own
  // Origin header (exactly what it will send to Mux); fall back to the
  // request URL.
  const origin = request.headers.get('origin') || url.origin

  try {
    const upload = await createDirectUpload({
      corsOrigin: origin,
      passthrough: typeof body.title === 'string' ? body.title.trim() : undefined,
    })
    return json({ uploadId: upload.id, uploadUrl: upload.url }, 200)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[admin/api/video-upload]', msg)
    return json({ error: msg }, err instanceof MuxError && err.status === 401 ? 502 : 500)
  }
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}
