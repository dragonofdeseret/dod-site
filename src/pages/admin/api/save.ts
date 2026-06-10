// ──────────────────────────────────────────────────────────────────────────────
// POST /admin/api/save — accept a typed entry payload, serialize to markdown,
// commit to GitHub. Vercel auto-rebuilds on push.
//
// Auth is handled by middleware (the route lives under /admin/**, so the
// auth gate ran before us). The `isNew` flag controls the commit subject
// ("Add" vs "Update").
// ──────────────────────────────────────────────────────────────────────────────

export const prerender = false

import type { APIRoute } from 'astro'
import { saveEntry, type AnyPayload } from '../../../lib/save-entry'

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Not authorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }
  let body: { payload: AnyPayload; isNew: boolean }
  try {
    body = (await request.json()) as { payload: AnyPayload; isNew: boolean }
  } catch {
    return new Response(JSON.stringify({ error: 'Body must be JSON' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }
  if (!body?.payload?.type || !body.payload.id) {
    return new Response(
      JSON.stringify({ error: 'payload.type + payload.id required' }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    )
  }
  // Server-side schema floor — if the client validator was bypassed
  // (older bundle in cache, JS disabled), we still won't commit a
  // markdown file that we know will fail Astro's content-collection
  // validation at build time and kill the next deploy.
  const p = body.payload as { type: string; image?: string; file?: string }
  if ((p.type === 'art' || p.type === 'photo') && !p.image?.trim()) {
    return new Response(
      JSON.stringify({
        error:
          'Image required for art/photo entries. Upload a file and wait for the "Upload complete" status before saving.',
      }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    )
  }
  if (p.type === 'writing' && !p.file?.trim()) {
    return new Response(
      JSON.stringify({
        error:
          'PDF required for writing entries. Upload a file and wait for the "Upload complete" status before saving.',
      }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    )
  }
  try {
    const result = await saveEntry(body.payload, Boolean(body.isNew))
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[admin save] failed', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
