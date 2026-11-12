// ──────────────────────────────────────────────────────────────────────────────
// Mux Video — the small slice of the API the admin needs for /tv.
//
// The video files never pass through this site. The flow is:
//   1. createDirectUpload() asks Mux for a one-off upload URL;
//   2. the admin's browser sends the file straight to that URL (resumable,
//      chunked — see scripts/admin-editor.ts);
//   3. getUpload() / getAsset() are polled until Mux has turned the upload
//      into a playable asset with a public playback ID;
//   4. that playback ID is saved in the entry's frontmatter. Public pages
//      only ever use the playback ID — no API calls, no secrets.
//
// Plain fetch with HTTP Basic auth (token id : token secret); no SDK, so
// nothing extra ends up in the serverless bundle. Server-only: the token
// secret must never reach the browser.
// ──────────────────────────────────────────────────────────────────────────────

import { getMuxTokenId, getMuxTokenSecret } from './env'

const API = 'https://api.mux.com/video/v1'
const TIMEOUT_MS = 10_000

/** Mux IDs (uploads, assets, playback IDs) are plain alphanumerics. Checked
 *  before an ID is placed in a URL so a crafted value can't change the path. */
export const MUX_ID = /^[A-Za-z0-9]{1,255}$/

/** Shown in the admin when the two Mux values haven't been added yet. */
export const MUX_NOT_CONFIGURED =
  "Video uploads aren't set up yet. Add MUX_TOKEN_ID and MUX_TOKEN_SECRET in Vercel → Settings → Environment Variables, then redeploy."

export class MuxError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'MuxError'
    this.status = status
  }
}

async function mux<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T | null> {
  const auth = Buffer.from(`${getMuxTokenId()}:${getMuxTokenSecret()}`).toString('base64')
  let res: Response
  try {
    res = await fetch(`${API}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        authorization: `Basic ${auth}`,
        ...(init.body !== undefined ? { 'content-type': 'application/json' } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (err) {
    throw new MuxError(`Couldn't reach Mux (${err instanceof Error ? err.message : String(err)}).`, 0)
  }
  if (res.status === 204) return null
  let payload: { data?: T; error?: { type?: string; messages?: string[] } } | null = null
  try {
    payload = (await res.json()) as typeof payload
  } catch {
    /* non-JSON body — handled below via res.ok */
  }
  if (!res.ok) {
    const detail = payload?.error?.messages?.join('; ')
    if (res.status === 401) {
      throw new MuxError(
        'Mux rejected the API token. Check MUX_TOKEN_ID and MUX_TOKEN_SECRET in Vercel, then redeploy.',
        401,
      )
    }
    throw new MuxError(detail ? `Mux: ${detail}` : `Mux returned HTTP ${res.status}.`, res.status)
  }
  return payload?.data ?? null
}

/** A one-off URL the browser can upload a video file to. The asset it becomes
 *  is public and uses Mux's "basic" quality tier (no encoding charge). */
export async function createDirectUpload(opts: {
  /** Origin of the page doing the upload — Mux only accepts the file from it. */
  corsOrigin: string
  /** Free-text label stored on the asset, visible in the Mux dashboard. */
  passthrough?: string
}): Promise<{ id: string; url: string }> {
  const data = await mux<{ id: string; url: string }>('/uploads', {
    method: 'POST',
    body: {
      cors_origin: opts.corsOrigin,
      // How long the upload URL stays valid. Mux's default is one hour, which
      // a large file on a slow connection — or an upload paused by a dropped
      // connection or a sleeping laptop — can outlast. 24 hours (max is 7 days).
      timeout: 86_400,
      new_asset_settings: {
        playback_policies: ['public'],
        video_quality: 'basic',
        ...(opts.passthrough ? { passthrough: opts.passthrough.slice(0, 255) } : {}),
      },
    },
  })
  if (!data?.id || !data.url) throw new MuxError('Mux did not return an upload URL.', 502)
  return { id: data.id, url: data.url }
}

export interface UploadState {
  /** waiting | asset_created | errored | cancelled | timed_out */
  status: string
  assetId?: string
  error?: string
}

export async function getUpload(id: string): Promise<UploadState> {
  const data = await mux<{ status: string; asset_id?: string; error?: { type?: string; message?: string } }>(
    `/uploads/${id}`,
  )
  if (!data) throw new MuxError('Upload not found at Mux.', 404)
  return { status: data.status, assetId: data.asset_id, error: data.error?.message }
}

/** Call off an upload that hasn't completed, so no asset is created from
 *  it. Mux only allows this while the upload is still `waiting`; any other
 *  state is reported as `false` rather than thrown. */
export async function cancelUpload(id: string): Promise<boolean> {
  try {
    await mux(`/uploads/${id}/cancel`, { method: 'PUT' })
    return true
  } catch (err) {
    if (err instanceof MuxError && err.status >= 400 && err.status < 500 && err.status !== 401) return false
    throw err
  }
}

export interface AssetState {
  id: string
  /** preparing | ready | errored */
  status: string
  playbackId?: string
  durationSec?: number
  aspectRatio?: string
  error?: string
}

export async function getAsset(id: string): Promise<AssetState> {
  const data = await mux<{
    id: string
    status: string
    duration?: number
    aspect_ratio?: string
    playback_ids?: Array<{ id: string; policy: string }>
    errors?: { type?: string; messages?: string[] }
  }>(`/assets/${id}`)
  if (!data) throw new MuxError('Video not found at Mux.', 404)
  return {
    id: data.id,
    status: data.status,
    playbackId: data.playback_ids?.find((p) => p.policy === 'public')?.id,
    durationSec: typeof data.duration === 'number' ? Math.round(data.duration) : undefined,
    aspectRatio: data.aspect_ratio,
    error: data.errors?.messages?.join('; '),
  }
}

/** Permanently remove a video from Mux. Already-gone counts as done. */
export async function deleteAsset(id: string): Promise<void> {
  try {
    await mux(`/assets/${id}`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof MuxError && err.status === 404) return
    throw err
  }
}
