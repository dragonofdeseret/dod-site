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

/** Where custom video thumbnails are stored: bucket + folder prefix. */
export const POSTER_BUCKET = 'art-images'
export const POSTER_FOLDER = 'tv'

/**
 * Is this a thumbnail URL the admin uploader could have produced — an https
 * address of a file under the posters folder of our public storage bucket,
 * with nothing in it that could break out of an HTML attribute or a CSS
 * url()? Anything else is ignored and the Mux still is used instead.
 */
export function isPosterUrl(url: unknown): url is string {
  return (
    typeof url === 'string' &&
    new RegExp(
      `^https://[A-Za-z0-9.-]+/storage/v1/object/public/${POSTER_BUCKET}/${POSTER_FOLDER}/[A-Za-z0-9._/-]+$`,
    ).test(url) &&
    !url.includes('..')
  )
}

type StillSource = {
  playbackId: string
  thumbnailTime?: number
  poster?: string
  posterThumb?: string
}

/**
 * The image that stands for a video, in the size a given spot needs:
 *   'card'   — small, 16:9, for the cards on /tv (pass the pixel width)
 *   'poster' — large, for the player frame before playback starts
 *   'share'  — 1200×630 JPEG for link previews
 * A custom uploaded thumbnail wins everywhere; otherwise it's a frame from
 * the video, served by Mux (at `thumbnailTime` if one was chosen).
 */
export function videoStill(v: StillSource, kind: 'card' | 'poster' | 'share', width = 480): string {
  if (isPosterUrl(v.poster)) {
    if (kind === 'card' && width <= 960 && isPosterUrl(v.posterThumb)) return v.posterThumb
    return v.poster
  }
  const time = v.thumbnailTime
  if (kind === 'card') return muxThumb(v.playbackId, { width, height: Math.round((width * 9) / 16), time })
  if (kind === 'share') return muxThumb(v.playbackId, { width: 1200, height: 630, time, format: 'jpg' })
  return muxThumb(v.playbackId, { width: 1280, time })
}
