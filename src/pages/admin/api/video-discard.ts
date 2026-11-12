// ──────────────────────────────────────────────────────────────────────────────
// POST /admin/api/video-discard { uploadId } — throw away an upload that was
// never saved.
//
// The editor calls this when an upload is superseded by another file, fails,
// or the page is left before saving. Without it the file would sit at Mux,
// attached to nothing and invisible in the admin, accruing storage charges.
//
// It takes the UPLOAD id this editor was given, not an asset id, so it can
// only ever reach a file that came from an upload started here. And it will
// not remove a file that a saved entry plays: if the save did go through
// (say its response was lost), the video is kept.
//
// Auth: /admin/** middleware.
// ──────────────────────────────────────────────────────────────────────────────

export const prerender = false

import type { APIRoute } from 'astro'
import { muxConfigured } from '../../../lib/env'
import { videoAssetInUse } from '../../../lib/live-content'
import { cancelUpload, deleteAsset, getUpload, MUX_ID, MUX_NOT_CONFIGURED } from '../../../lib/mux'

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Not authorized' }, 401)
  if (!muxConfigured()) return json({ error: MUX_NOT_CONFIGURED }, 503)

  let body: { uploadId?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return json({ error: 'Body must be JSON.' }, 400)
  }
  const uploadId = String(body.uploadId ?? '')
  if (!MUX_ID.test(uploadId)) return json({ error: 'Missing or invalid "uploadId".' }, 400)

  try {
    let upload = await getUpload(uploadId)
    if (!upload.assetId) {
      // Not turned into a video yet: call the upload off so it never is.
      if (await cancelUpload(uploadId)) return json({ ok: true, outcome: 'cancelled' }, 200)
      // Couldn't cancel — it may have just completed. Look once more.
      upload = await getUpload(uploadId)
      if (!upload.assetId) return json({ ok: true, outcome: 'nothing-to-remove' }, 200)
    }
    if ((await videoAssetInUse(upload.assetId)) !== 'no') {
      return json({ ok: true, outcome: 'kept' }, 200)
    }
    await deleteAsset(upload.assetId)
    return json({ ok: true, outcome: 'deleted' }, 200)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[admin/api/video-discard]', msg)
    return json({ error: msg }, 502)
  }
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}
