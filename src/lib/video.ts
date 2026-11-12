// ──────────────────────────────────────────────────────────────────────────────
// Small helpers for /tv — Mux image URLs and duration formatting. Pure
// functions with no secrets: everything here works from the public
// playback ID alone, so it's safe in pages and in the browser.
// ──────────────────────────────────────────────────────────────────────────────

/**
 * A still image from a video, served by Mux's image CDN.
 *   • `width` (+ optional `height`): pixel size; with both set the frame is
 *     cropped to fit rather than squashed.
 *   • `time`: which second of the video to grab (Mux defaults to the middle).
 */
export function muxThumb(
  playbackId: string,
  opts: { width?: number; height?: number; time?: number; format?: 'webp' | 'jpg' | 'png' } = {},
): string {
  const params = new URLSearchParams()
  if (opts.width) params.set('width', String(Math.round(opts.width)))
  if (opts.height) params.set('height', String(Math.round(opts.height)))
  if (opts.width && opts.height) params.set('fit_mode', 'smartcrop')
  if (typeof opts.time === 'number' && opts.time >= 0) params.set('time', String(opts.time))
  const qs = params.toString()
  return `https://image.mux.com/${encodeURIComponent(playbackId)}/thumbnail.${opts.format ?? 'webp'}${qs ? `?${qs}` : ''}`
}

/** 75 → "1:15", 3725 → "1:02:05". Empty string when unknown. */
export function formatDuration(seconds: number | undefined | null): string {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) return ''
  const s = Math.round(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`
}

/** "16:9" → "16 / 9" for the CSS aspect-ratio property; 16 / 9 when unknown. */
export function cssAspectRatio(ratio: string | undefined | null): string {
  const m = String(ratio ?? '').match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/)
  return m && Number(m[1]) > 0 && Number(m[2]) > 0 ? `${m[1]} / ${m[2]}` : '16 / 9'
}

/** "PT1H2M5S" — ISO 8601 duration, for structured data. */
export function isoDuration(seconds: number | undefined | null): string | undefined {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return undefined
  const s = Math.round(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${sec || (!h && !m) ? `${sec}S` : ''}`
}
