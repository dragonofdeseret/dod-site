// ──────────────────────────────────────────────────────────────────────────────
// GET /admin/api/video-status?uploadId=… — where is an uploaded video up to?
//
// The editor polls this after the browser finishes sending a file to Mux.
// One response shape covers the whole journey:
//
//   { state: 'waiting' }                      Mux hasn't registered the file yet
//   { state: 'processing', assetId }          Mux is preparing it for playback
//   { state: 'ready', assetId, playbackId,    playable — safe to save the entry
//     durationSec, aspectRatio }
//   { state: 'failed', error }                Mux couldn't use the file
//
// Auth: /admin/** middleware.
// ──────────────────────────────────────────────────────────────────────────────

export const prerender = false

import type { APIRoute } from 'astro'
import { muxConfigured } from '../../../lib/env'
import { getAsset, getUpload, MUX_ID, MUX_NOT_CONFIGURED } from '../../../lib/mux'

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.user) return json({ error: 'Not authorized' }, 401)
  if (!muxConfigured()) return json({ error: MUX_NOT_CONFIGURED }, 503)

  const uploadId = url.searchParams.get('uploadId') ?? ''
  if (!MUX_ID.test(uploadId)) return json({ error: 'Missing or invalid "uploadId".' }, 400)

  try {
    const upload = await getUpload(uploadId)
    if (!upload.assetId) {
      if (['errored', 'cancelled', 'timed_out'].includes(upload.status)) {
        return json(
          { state: 'failed', error: upload.error ?? `The upload ${upload.status.replace('_', ' ')} at Mux.` },
          200,
        )
      }
      return json({ state: 'waiting' }, 200)
    }

    const asset = await getAsset(upload.assetId)
    if (asset.status === 'errored') {
      return json(
        { state: 'failed', error: asset.error ?? "Mux couldn't process this file. Try exporting it as an MP4 and uploading again." },
        200,
      )
    }
    if (asset.status !== 'ready' || !asset.playbackId) {
      return json({ state: 'processing', assetId: asset.id }, 200)
    }
    return json(
      {
        state: 'ready',
        assetId: asset.id,
        playbackId: asset.playbackId,
        durationSec: asset.durationSec,
        aspectRatio: asset.aspectRatio,
      },
      200,
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[admin/api/video-status]', msg)
    return json({ error: msg }, 502)
  }
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}
