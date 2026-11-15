// ──────────────────────────────────────────────────────────────────────────────
// Admin editor client — handles three things:
//
//   1. Slug helper: as the user types into #title, auto-fill #id with a
//      slugified version (unless the user has already touched #id).
//   2. Media upload: when the user picks a file in #media-file, upload
//      directly to the appropriate Supabase Storage bucket and put the
//      resulting public URL into the hidden #media-url field.
//   3. Form submit: serialize the form into the payload shape the
//      /admin/api/save endpoint expects, POST it, redirect on success.
//
// All wiring is driven by data-attributes on the form so this single
// script handles every collection's editor.
// ──────────────────────────────────────────────────────────────────────────────

import { formatDuration, isPosterUrl, muxThumb } from '../lib/video'
import { sendToMux, UploadFailed } from './mux-upload'

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface FormContext {
  form: HTMLFormElement
  collection: 'art' | 'photo' | 'writing' | 'margins' | 'quotes' | 'video' | 'site'
  isNew: boolean
}

function readForm(ctx: FormContext): Record<string, unknown> {
  const fd = new FormData(ctx.form)
  const get = (k: string) => String(fd.get(k) ?? '').trim()
  const getOptional = (k: string) => {
    const v = get(k)
    return v ? v : undefined
  }
  const getArray = (k: string): string[] | undefined => {
    const v = get(k)
    if (!v) return undefined
    return v.split(',').map((s) => s.trim()).filter(Boolean)
  }
  const getNumber = (k: string): number | undefined => {
    const v = get(k)
    if (!v) return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  const getCheckboxes = (k: string): string[] => {
    return fd.getAll(k).map((v) => String(v))
  }

  // Walk the prints-editor rows in DOM order. Each row contributes one
  // { size, priceCents } object. Skip rows with blank/zero prices so
  // empty rows don't end up in frontmatter.
  const readPrints = (): Array<{ size: string; priceCents: number }> => {
    const rows = ctx.form.querySelectorAll<HTMLElement>('[data-prints-row]')
    const out: Array<{ size: string; priceCents: number }> = []
    rows.forEach((row) => {
      const size = (row.querySelector<HTMLSelectElement>('[data-prints-size]')?.value ?? '').trim()
      const dollars = Number(row.querySelector<HTMLInputElement>('[data-prints-price]')?.value ?? '0')
      if (!size || !Number.isFinite(dollars) || dollars <= 0) return
      out.push({ size, priceCents: Math.round(dollars * 100) })
    })
    return out
  }

  const readHidden = () =>
    !!ctx.form.querySelector<HTMLInputElement>('input[name="hidden"]')?.checked

  // Parse the hidden `images` JSON field (rewritten by the admin script
  // whenever the user adds, removes, or reorders an image). Returns the
  // ordered list; empty array if the field is missing or invalid.
  const readImages = (): string[] => {
    const raw = ctx.form.querySelector<HTMLInputElement>('input[name="images"]')?.value ?? ''
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : []
    } catch {
      return []
    }
  }

  switch (ctx.collection) {
    case 'art':
    case 'photo': {
      const forSale = !!ctx.form.querySelector<HTMLInputElement>('[data-prints-toggle]')?.checked
      const images = readImages()
      return {
        id: get('id'),
        type: ctx.collection,
        title: get('title'),
        date: get('date'),
        year: getNumber('year'),
        // `image` is the cover (= images[0]) for back-compat with code
        // that reads only the single field; `images` carries the full
        // ordered gallery for the multi-image case.
        image: images[0] ?? get('image'),
        images: images.length > 0 ? images : undefined,
        sideNoteTitle: getOptional('sideNoteTitle'),
        sideNote: getOptional('sideNote'),
        tags: getArray('tags'),
        forSale,
        prints: forSale ? readPrints() : undefined,
        hidden: readHidden(),
      }
    }
    case 'writing':
      return {
        id: get('id'),
        type: 'writing',
        title: get('title'),
        date: get('date'),
        year: getNumber('year'),
        file: get('file'),
        sections: getCheckboxes('sections'),
        tags: getArray('tags'),
        hidden: readHidden(),
      }
    case 'margins':
      return {
        id: get('id'),
        type: 'margins',
        title: get('title'),
        date: get('date'),
        year: getNumber('year'),
        detail: getOptional('detail'),
        marginsTags: getArray('marginsTags'),
        body: get('body'),
      }
    case 'quotes':
      return {
        id: get('id'),
        type: 'quotes',
        author: getOptional('author'),
        source: getOptional('source'),
        body: get('body'),
      }
    case 'video':
      return {
        id: get('id'),
        type: 'video',
        title: get('title'),
        date: get('date'),
        year: getNumber('year'),
        series: getOptional('series'),
        tags: getArray('tags'),
        muxAssetId: get('muxAssetId'),
        playbackId: get('playbackId'),
        durationSec: getNumber('durationSec'),
        aspectRatio: getOptional('aspectRatio'),
        thumbnailTime: getNumber('thumbnailTime'),
        poster: getOptional('poster'),
        posterThumb: getOptional('posterThumb'),
        essay: getOptional('essay'),
        hidden: readHidden(),
        body: get('body'),
      }
    case 'site':
      return {
        id: get('id') || 'now',
        type: 'site',
        title: get('title'),
        body: get('body'),
      }
  }
}

function setStatus(text: string, kind: 'info' | 'error' | 'success' = 'info'): void {
  const el = document.getElementById('save-status')
  if (!el) return
  el.className = `admin-flash admin-flash--${kind}`
  el.textContent = text
  el.style.display = text ? 'block' : 'none'
}

/**
 * Downscale an image client-side before upload. Preserves aspect ratio.
 *
 * Skipped for:
 *   • non-image files (PDFs etc — pass through as-is)
 *   • SVG (vectors don't need raster downscale)
 *   • animated GIF (re-encoding would flatten the animation)
 *   • images already under maxWidth
 *
 * PNGs with photographic content get re-encoded as JPEG to shrink size
 * dramatically; PNGs that look like art (have transparency) stay PNG.
 * Uses HTMLCanvasElement.toBlob — same primitive every browser ships,
 * no external library needed.
 */
async function maybeResizeImage(file: File, maxWidth = 2000): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file

  // Load the image into an off-DOM <img> so we can read its natural size.
  const url = URL.createObjectURL(file)
  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = () => reject(new Error('Could not decode image'))
    i.src = url
  }).finally(() => {
    // Cleanup happens on resolve and reject; revokeObjectURL is idempotent.
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }) as HTMLImageElement

  if (img.naturalWidth <= maxWidth) return file

  const ratio = maxWidth / img.naturalWidth
  const targetW = maxWidth
  const targetH = Math.round(img.naturalHeight * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  // High-quality bicubic-ish smoothing.
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, targetW, targetH)

  // For photos/JPEGs use JPEG at 85% quality (great visual / small size).
  // Preserve PNG (alpha channel) and WebP.
  const outType =
    file.type === 'image/jpeg' || file.type === 'image/jpg'
      ? 'image/jpeg'
      : file.type === 'image/webp'
      ? 'image/webp'
      : file.type === 'image/png'
      ? 'image/png'
      : 'image/jpeg'
  const quality = outType === 'image/png' ? undefined : 0.85

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, outType, quality),
  )
  if (!blob) return file

  // Match the file extension to the output MIME so Supabase serves it correctly.
  const baseName = file.name.replace(/\.[^.]+$/, '')
  const ext =
    outType === 'image/jpeg' ? '.jpg'
      : outType === 'image/webp' ? '.webp'
      : outType === 'image/png' ? '.png'
      : '.jpg'

  return new File([blob], baseName + ext, {
    type: outType,
    lastModified: file.lastModified,
  })
}

/**
 * Convert an Apple HEIC/HEIF photo (the iPhone camera default) to JPEG.
 *
 * Only Safari can decode HEIC natively, so in every other browser the
 * canvas resize step silently no-ops and we'd upload a raw .heic that
 * renders as a broken image everywhere on the public site. We detect
 * HEIC by MIME type OR extension (some browsers report an empty type for
 * .heic) and decode it with heic2any (libheif compiled for the browser),
 * imported on demand so it never bloats the initial admin bundle.
 *
 * Throws a friendly error on failure so the caller aborts the upload
 * instead of committing an unusable file.
 */
type Report = (text: string, kind?: 'info' | 'error' | 'success') => void

async function maybeConvertHeic(file: File, report: Report = setStatus): Promise<File> {
  const isHeic =
    /image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)
  if (!isHeic) return file

  report('Converting HEIC photo to JPEG…', 'info')
  try {
    const mod = await import('heic2any')
    const heic2any = (mod.default ?? mod) as (options: {
      blob: Blob
      toType?: string
      quality?: number
    }) => Promise<Blob | Blob[]>
    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    })
    const blob = Array.isArray(converted) ? converted[0] : converted
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo'
    return new File([blob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    })
  } catch (err) {
    console.error('[admin-editor] HEIC conversion failed', err)
    throw new Error(
      'Could not convert this HEIC photo. Re-save or export it as JPEG, then upload again.',
    )
  }
}

/**
 * Turn any image the browser can open into a JPEG no wider than `maxWidth`,
 * for a video thumbnail. Unlike maybeResizeImage this ALWAYS re-encodes: a
 * thumbnail is fetched on every visit to /tv, so a multi-megabyte PNG, an
 * animated GIF or a format other browsers can't show must never be stored
 * as-is. Throws (with a message fit to show) if the file can't be opened.
 */
async function encodePoster(file: File, maxWidth: number): Promise<File> {
  const url = URL.createObjectURL(file)
  let img: HTMLImageElement
  try {
    img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('undecodable'))
      i.src = url
    })
  } catch {
    URL.revokeObjectURL(url)
    throw new Error('this browser can’t open that image. Use a JPEG or PNG')
  }
  try {
    if (!img.naturalWidth || !img.naturalHeight) {
      throw new Error('that image has no size. Use a JPEG or PNG')
    }
    const scale = Math.min(1, maxWidth / img.naturalWidth)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('the image couldn’t be prepared in this browser')
    // JPEG has no transparency: put see-through areas on black, like the
    // player frame behind it.
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86))
    if (!blob) throw new Error('the image couldn’t be prepared in this browser')
    return new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' })
  } finally {
    URL.revokeObjectURL(url)
  }
}

// Vercel Hobby plan caps serverless function request bodies at 4.5MB.
// Files under this comfortably proxy through /admin/api/upload (faster,
// single round-trip). Anything bigger goes browser → Supabase Storage
// directly via a signed upload URL minted by /admin/api/upload-url
// (two round-trips but unbounded size, useful for large PDFs etc).
const PROXY_LIMIT_BYTES = 4_000_000 // ~4MB — leaves headroom for multipart overhead

async function uploadMedia(rawFile: File, bucket: string, year: string, id: string): Promise<string> {
  setStatus('Preparing file…', 'info')
  // 1. HEIC/HEIF (iPhone default) → JPEG. Must happen before anything
  //    else: browsers outside Safari can't decode HEIC, so the resize
  //    step would no-op and we'd upload a raw .heic that won't render.
  //    If conversion fails this throws — we abort rather than upload an
  //    unusable file.
  let file = await maybeConvertHeic(rawFile)
  // 2. Downscale oversized images. No-op for PDFs, GIFs, SVGs, and images
  //    already under the max width. A resize failure here is non-fatal —
  //    fall through with the (already HEIC-converted) file.
  try {
    file = await maybeResizeImage(file)
  } catch (err) {
    console.warn('[admin-editor] resize failed, using original', err)
  }
  // Path scheme: <year>/<id><ext>. Year-bucketed so big collections stay
  // legible in the Supabase Storage dashboard.
  const dot = file.name.lastIndexOf('.')
  const ext = dot === -1 ? '' : file.name.slice(dot).toLowerCase()
  const path = `${year}/${id}${ext}`
  const sizeKb = Math.round(file.size / 1024)
  setStatus(`Uploading ${file.name} (${sizeKb} KB)…`, 'info')

  try {
    const publicUrl = file.size > PROXY_LIMIT_BYTES
      ? await uploadViaSignedUrl(file, bucket, path)
      : await uploadViaProxy(file, bucket, path)
    setStatus('Upload complete.', 'success')
    return publicUrl
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    setStatus(`Upload failed: ${msg}`, 'error')
    throw err
  }
}

/**
 * Small/medium files — proxy through our Vercel function. Server uses
 * the service-role Supabase client (auth via the same middleware that
 * gated this admin page) so RLS doesn't matter. One round-trip.
 */
async function uploadViaProxy(file: File, bucket: string, path: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', bucket)
  formData.append('path', path)

  let res: Response
  try {
    res = await fetch('/admin/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    })
  } catch (err) {
    throw new Error(`network: ${err instanceof Error ? err.message : String(err)}`)
  }

  let payload: { url?: string; error?: string }
  try {
    payload = (await res.json()) as { url?: string; error?: string }
  } catch {
    throw new Error(`Server returned a non-JSON response (HTTP ${res.status}).`)
  }
  if (!res.ok || !payload.url) {
    throw new Error(payload.error ?? `Upload failed with HTTP ${res.status}.`)
  }
  return payload.url
}

/**
 * Large files — ask our server for a signed upload URL, then PUT the
 * file straight to Supabase Storage. Two round-trips but no Vercel
 * body limit applies. Used for files over PROXY_LIMIT_BYTES (~4MB).
 */
async function uploadViaSignedUrl(
  file: File,
  bucket: string,
  path: string,
  report: Report = setStatus,
): Promise<string> {
  report(`Preparing direct upload for ${Math.round(file.size / 1024)} KB file…`, 'info')

  let urlRes: Response
  try {
    urlRes = await fetch('/admin/api/upload-url', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bucket, path }),
      credentials: 'same-origin',
    })
  } catch (err) {
    throw new Error(`network requesting signed URL: ${err instanceof Error ? err.message : String(err)}`)
  }
  let urlPayload: { signedUrl?: string; publicUrl?: string; error?: string }
  try {
    urlPayload = (await urlRes.json()) as typeof urlPayload
  } catch {
    throw new Error(`Server returned a non-JSON response getting signed URL (HTTP ${urlRes.status}).`)
  }
  if (!urlRes.ok || !urlPayload.signedUrl || !urlPayload.publicUrl) {
    throw new Error(urlPayload.error ?? `Could not get signed URL (HTTP ${urlRes.status}).`)
  }

  report(`Uploading ${file.name} direct to storage…`, 'info')
  let putRes: Response
  try {
    putRes = await fetch(urlPayload.signedUrl, {
      method: 'PUT',
      headers: {
        'content-type': file.type || 'application/octet-stream',
        'x-upsert': 'true',
        'cache-control': '31536000',
      },
      body: file,
    })
  } catch (err) {
    throw new Error(`network uploading to storage: ${err instanceof Error ? err.message : String(err)}`)
  }
  if (!putRes.ok) {
    const text = await putRes.text().catch(() => '')
    throw new Error(`Storage rejected the upload (HTTP ${putRes.status}): ${text.slice(0, 200)}`)
  }

  return urlPayload.publicUrl
}

function init(): void {
  const form = document.getElementById('admin-editor-form') as HTMLFormElement | null
  if (!form) return
  const collection = form.dataset.collection as FormContext['collection']
  const isNew = form.dataset.isNew === 'true'

  // ── 1. Slug auto-fill ──────────────────────────────────────────────
  const titleEl = form.querySelector<HTMLInputElement>('input[name="title"]')
  const idEl = form.querySelector<HTMLInputElement>('input[name="id"]')
  const dateEl = form.querySelector<HTMLInputElement>('input[name="date"]')
  const yearEl = form.querySelector<HTMLInputElement>('input[name="year"]')

  let idTouched = !isNew
  idEl?.addEventListener('input', () => {
    idTouched = true
  })

  // For art/photo/margins: derive id from date when present, otherwise
  // from title. For quotes/writing: from title only (no date on quotes).
  function autofillId() {
    if (idTouched || !idEl) return
    const date = dateEl?.value
    const title = titleEl?.value ?? ''
    if (collection === 'art' || collection === 'photo' || collection === 'margins') {
      idEl.value = date || slugify(title)
    } else {
      idEl.value = slugify(title)
    }
  }
  titleEl?.addEventListener('input', autofillId)
  dateEl?.addEventListener('input', autofillId)

  // Auto-fill year from date.
  dateEl?.addEventListener('change', () => {
    if (!yearEl) return
    const y = Number((dateEl.value ?? '').slice(0, 4))
    if (Number.isFinite(y)) yearEl.value = String(y)
  })

  // ── 2. Media upload ────────────────────────────────────────────────
  const mediaFileEl = form.querySelector<HTMLInputElement>('input[name="media-file"]')
  const bucket = form.dataset.mediaBucket
  // NOTE: the template emits `data-multi-file` as a BARE attribute, so
  // `dataset.multiFile` is the empty string "" — which is falsy. The old
  // `!!dataset.multiFile` check was therefore always false and silently
  // routed every art/photo upload down the single-file (PDF) path, which
  // discarded the image URL. hasAttribute() is correct regardless of value.
  const isMulti = !!mediaFileEl && mediaFileEl.hasAttribute('data-multi-file')

  // Single-file flow (writing PDFs): bound to the hidden #file input.
  const fileUrlEl = form.querySelector<HTMLInputElement>('input[name="file"]')
  const mediaPreview = form.querySelector<HTMLImageElement>('#media-preview')

  // Multi-file flow (art + photo): an in-memory URL array is the source
  // of truth (declared below as `imageUrls`); the thumbnail grid and the
  // hidden `image` (cover) + `images` (JSON array) fields are rendered
  // from it on every change.

  const uploadStatus = form.querySelector<HTMLElement>('[data-upload-status]')
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]')
  // 'note' = an informational message that, unlike 'uploading', doesn't
  // lock the Save button.
  function setUploadStatus(text: string, state: 'uploading' | 'success' | 'error' | 'idle' | 'note'): void {
    if (uploadStatus) {
      uploadStatus.textContent = text
      uploadStatus.dataset.state = state
      uploadStatus.hidden = !text
    }
    if (submitBtn) {
      const lock = state === 'uploading'
      submitBtn.disabled = lock
      submitBtn.textContent = lock
        ? 'Uploading… please wait'
        : (isNew ? 'Publish' : 'Save changes')
    }
  }

  // ── Multi-image state (source of truth) ────────────────────────────
  // The attached image URLs live in this in-memory array — NOT read back
  // out of the DOM. We render the grid and (re-querying live) write the
  // hidden `image` + `images` fields from it after every change, so a
  // successful upload always reaches the form even if an element
  // reference captured at init is stale or the grid lookup misbehaves.
  let imageUrls: string[] = (() => {
    const raw = form.querySelector<HTMLInputElement>('input[name="images"]')?.value ?? ''
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const list = parsed.filter((s): s is string => typeof s === 'string' && !!s)
        if (list.length) return list
      }
    } catch {
      /* fall through to the single cover field */
    }
    const cover = form.querySelector<HTMLInputElement>('input[name="image"]')?.value.trim()
    return cover ? [cover] : []
  })()

  // Write the hidden fields from state. Re-queried live every call so it
  // never depends on a reference captured at init.
  function writeImageHidden(): void {
    const cover = form.querySelector<HTMLInputElement>('input[name="image"]')
    const imagesJson = form.querySelector<HTMLInputElement>('input[name="images"]')
    if (cover) cover.value = imageUrls[0] ?? ''
    if (imagesJson) imagesJson.value = JSON.stringify(imageUrls)
  }

  // Render the thumbnail grid + inline status FROM the state array. Kept
  // named syncHiddenFromGrid for the existing call sites, but it now
  // renders from `imageUrls` rather than reading the DOM.
  function syncHiddenFromGrid(): void {
    writeImageHidden()
    const grid = form.querySelector<HTMLElement>('[data-image-grid]')
    if (grid) {
      grid.innerHTML = imageUrls
        .map((url, i) => {
          const safe = url.startsWith('http') ? url : `/${url}`
          const label = i === 0 ? 'Cover' : `#${i + 1}`
          return `<div class="image-grid__row" data-image-row data-url="${url}">
            <img src="${safe}" alt="image ${i + 1}" class="image-grid__thumb" />
            <div class="image-grid__meta">
              <span class="image-grid__label">${label}</span>
              <div class="image-grid__controls">
                <button type="button" class="image-grid__btn" data-image-up aria-label="Move up">↑</button>
                <button type="button" class="image-grid__btn" data-image-down aria-label="Move down">↓</button>
                <button type="button" class="image-grid__btn image-grid__btn--danger" data-image-remove aria-label="Remove">×</button>
              </div>
            </div>
          </div>`
        })
        .join('')
    }
    const status = form.querySelector<HTMLElement>('[data-upload-status]')
    if (status && status.dataset.state !== 'uploading') {
      if (imageUrls.length === 0) {
        status.textContent = ''
        status.dataset.state = 'idle'
        status.hidden = true
      } else {
        status.textContent = `✓ ${imageUrls.length} image${imageUrls.length === 1 ? '' : 's'} ready`
        status.dataset.state = 'success'
        status.hidden = false
      }
    }
  }

  function appendImageRow(url: string): void {
    if (!url) return
    imageUrls.push(url)
    syncHiddenFromGrid()
  }

  // Reorder / remove via event delegation on the FORM (always present, so
  // this works regardless of when the grid is rendered). Operates on the
  // state array by the clicked row's index, then re-renders.
  form.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const row = target.closest<HTMLElement>('[data-image-row]')
    if (!row) return
    const grid = form.querySelector<HTMLElement>('[data-image-grid]')
    if (!grid) return
    const idx = Array.from(grid.querySelectorAll<HTMLElement>('[data-image-row]')).indexOf(row)
    if (idx < 0) return
    if (target.matches('[data-image-up]') && idx > 0) {
      ;[imageUrls[idx - 1], imageUrls[idx]] = [imageUrls[idx], imageUrls[idx - 1]]
      syncHiddenFromGrid()
    } else if (target.matches('[data-image-down]') && idx < imageUrls.length - 1) {
      ;[imageUrls[idx + 1], imageUrls[idx]] = [imageUrls[idx], imageUrls[idx + 1]]
      syncHiddenFromGrid()
    } else if (target.matches('[data-image-remove]')) {
      imageUrls.splice(idx, 1)
      syncHiddenFromGrid()
    }
  })

  if (mediaFileEl && bucket) {
    mediaFileEl.addEventListener('change', async () => {
      const files = Array.from(mediaFileEl.files ?? [])
      if (files.length === 0) return
      const year = yearEl?.value || String(new Date().getFullYear())
      const baseId = idEl?.value || slugify(files[0].name.replace(/\.[^.]+$/, ''))

      try {
        if (isMulti) {
          // Multi-photo: upload each file sequentially, pushing each
          // successful URL into the state array. Subsequent files get a
          // numeric suffix so paths don't collide in the Storage bucket.
          for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const slot = imageUrls.length // grows as each upload succeeds
            // Cover (slot 0) keeps the base id; subsequent uploads get
            // -2, -3, … so the year/<id>.<ext> paths stay unique.
            const id = slot === 0 ? baseId : `${baseId}-${slot + 1}`
            setUploadStatus(`Uploading ${file.name} (${i + 1} / ${files.length})…`, 'uploading')
            const url = await uploadMedia(file, bucket, year, id)
            appendImageRow(url)
          }
          // Reset the file input so the same files can be re-picked.
          mediaFileEl.value = ''
          setUploadStatus('', 'success')
          syncHiddenFromGrid() // refresh status text now that state is 'success'
        } else {
          // Single-file flow (writing PDFs).
          const file = files[0]
          setUploadStatus(`Uploading ${file.name}…`, 'uploading')
          const url = await uploadMedia(file, bucket, year, baseId)
          if (fileUrlEl) fileUrlEl.value = url
          if (mediaPreview && /\.(jpe?g|png|webp|gif|avif)$/i.test(url)) {
            mediaPreview.src = url
            mediaPreview.style.display = 'block'
          }
          const kind = file.type.startsWith('application/pdf') ? 'PDF ready' : 'File ready'
          setUploadStatus(`✓ ${kind}`, 'success')
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setUploadStatus(`✗ Upload failed: ${msg}`, 'error')
      }
    })
  }

  // ── 2b. Video upload (→ Mux) ───────────────────────────────────────
  // Videos don't go to Supabase Storage. The server asks Mux for a one-off
  // upload URL, the browser sends the file there piece by piece straight
  // from disk (scripts/mux-upload.ts), and then we poll until Mux has made
  // it playable. Only then are the hidden muxAssetId / playbackId fields
  // filled in — until that moment they hold the entry's saved video (or
  // nothing, for a new one), so an unfinished upload never leaves the form
  // half-updated.
  //
  // Long videos take a long time to send, so nothing here assumes the page
  // survives the whole upload. Every upload is remembered in this browser
  // (localStorage) along with how much of it Mux has confirmed. If the page
  // is reloaded, closed, or the laptop sleeps:
  //   • not fully sent yet → choosing the same file again carries on from
  //     the last confirmed byte (Mux keeps the upload open for 24 hours);
  //   • fully sent → reopening this editor picks it up by itself.
  const videoFileEl = form.querySelector<HTMLInputElement>('input[name="video-file"]')
  const progressEl = form.querySelector<HTMLElement>('[data-upload-progress]')
  const progressBar = form.querySelector<HTMLElement>('[data-upload-progress-bar]')
  const VIDEO_FIELDS = ['muxAssetId', 'playbackId', 'durationSec', 'aspectRatio'] as const
  const videoField = (name: string) => form.querySelector<HTMLInputElement>(`input[name="${name}"]`)
  const setVideoField = (name: string, value: string) => {
    const el = videoField(name)
    if (el) el.value = value
  }
  const videoPreview = form.querySelector<HTMLImageElement>('[data-video-preview]')

  // The video this entry had when the page loaded (what is saved on the
  // site). The form falls back to it whenever an unsaved upload is dropped.
  const savedVideo = {
    fields: Object.fromEntries(VIDEO_FIELDS.map((n) => [n, videoField(n)?.value ?? ''])) as Record<string, string>,
    previewSrc: videoPreview?.getAttribute('src') ?? '',
    thumbnailTime: videoField('thumbnailTime')?.value ?? '',
  }
  // "Still image at" as it stood when the first not-yet-saved file was
  // picked (null = no unsaved upload in play). Whatever happens to that
  // field while a replacement is being uploaded is about the replacement; if
  // the replacement is dropped, the field goes back to this.
  let stillBeforeUpload: string | null = null
  function showSavedVideo(): void {
    for (const n of VIDEO_FIELDS) setVideoField(n, savedVideo.fields[n])
    if (stillBeforeUpload !== null) {
      setVideoField('thumbnailTime', stillBeforeUpload)
      stillBeforeUpload = null
    }
    if (videoPreview) {
      if (savedVideo.previewSrc) videoPreview.src = savedVideo.previewSrc
      videoPreview.hidden = !savedVideo.fields.playbackId
    }
  }

  let videoBusy = false // an upload is being sent or processed
  let videoRun = 0 // bumps on every file pick; older runs see it and stop
  let activeUpload: { abort: () => void } | null = null
  // The upload this page is handling that isn't part of a saved entry yet.
  // Replaced by a different file → discarded at Mux.
  let pendingUploadId: string | null = null
  // A save is on its way to the server. Its upload is no longer "pending"
  // (it is about to become part of a saved entry), and until the answer is
  // back nothing may discard it or swap the file.
  let saving = false

  // ── The remembered upload ──────────────────────────────────────────
  // One per editor: the new-video editor, or a given existing entry —
  // identified by its id, which is known even when GitHub couldn't be
  // reached and doesn't change when the entry moves to another year. `url`
  // is the Mux upload address: only usable for this one upload, and only
  // until Mux closes it after 24 hours.
  interface UploadRecord {
    uploadId: string
    url: string
    name: string
    size: number
    lastModified: number
    /** Bytes Mux has confirmed as stored. */
    stored: number
    startedAt: number
  }
  const entryKey = isNew ? 'new' : form.dataset.entryId ? `id:${form.dataset.entryId}` : ''
  const RECORD_KEY = entryKey ? `dod:video-upload:${collection}:${entryKey}` : ''
  // An unfinished upload is closed by Mux 24 hours after it was created;
  // a little under that, it is treated as gone. (A FINISHED upload never
  // expires — its video stays at Mux until it is used or discarded.)
  const RECORD_MAX_AGE_MS = 23 * 60 * 60_000
  const isUrl = (s: string) => {
    try {
      new URL(s)
      return true
    } catch {
      return false
    }
  }
  function readRecord(): UploadRecord | null {
    if (!RECORD_KEY) return null
    try {
      const r = JSON.parse(localStorage.getItem(RECORD_KEY) ?? 'null') as UploadRecord | null
      if (
        !r ||
        typeof r.uploadId !== 'string' ||
        !/^[A-Za-z0-9]+$/.test(r.uploadId) ||
        typeof r.url !== 'string' ||
        !isUrl(r.url) ||
        typeof r.size !== 'number' ||
        typeof r.stored !== 'number' ||
        typeof r.startedAt !== 'number'
      ) {
        return null
      }
      return r
    } catch {
      return null
    }
  }
  function writeRecord(r: UploadRecord | null): void {
    if (!RECORD_KEY) return
    try {
      if (r) localStorage.setItem(RECORD_KEY, JSON.stringify(r))
      else localStorage.removeItem(RECORD_KEY)
    } catch {
      /* private browsing or storage full: the upload just can't be resumed */
    }
  }
  const isSameFile = (r: UploadRecord, f: File) =>
    r.name === f.name && r.size === f.size && r.lastModified === f.lastModified
  const isFresh = (r: UploadRecord) => Date.now() - r.startedAt < RECORD_MAX_AGE_MS

  const pct = (part: number, whole: number) => (whole > 0 ? Math.floor((part / whole) * 100) : 0)
  const fmtBytes = (n: number) =>
    n >= 1e9 ? `${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)} GB` : `${Math.max(1, Math.round(n / 1e6))} MB`
  const fmtMinutes = (ms: number) => {
    const m = Math.max(1, Math.round(ms / 60_000))
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`
  }

  // ── Keep the computer awake while a video is uploading ─────────────
  // An hour-long upload outlasts most sleep timers. A screen wake lock
  // holds off sleep while this tab is in front (the browser drops it when
  // the tab is hidden; it's taken again when the tab comes back).
  type WakeLockHandle = EventTarget & { release: () => Promise<void> }
  let wakeLock: WakeLockHandle | null = null
  async function holdAwake(): Promise<void> {
    const api = (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<WakeLockHandle> } }).wakeLock
    if (!api || wakeLock || document.visibilityState !== 'visible') return
    try {
      const lock = await api.request('screen')
      if (!videoBusy) {
        void lock.release().catch(() => {})
        return
      }
      wakeLock = lock
      lock.addEventListener('release', () => {
        if (wakeLock === lock) wakeLock = null
      })
    } catch {
      /* not allowed right now (e.g. low battery); uploading works anyway */
    }
  }
  function letSleep(): void {
    const lock = wakeLock
    wakeLock = null
    void lock?.release().catch(() => {})
  }
  function setBusy(busy: boolean): void {
    videoBusy = busy
    if (busy) void holdAwake()
    else letSleep()
  }
  document.addEventListener('visibilitychange', () => {
    if (videoBusy && document.visibilityState === 'visible') void holdAwake()
  })

  function setProgress(percent: number | null): void {
    if (!progressEl || !progressBar) return
    progressEl.hidden = percent === null
    if (percent !== null) progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`
  }

  /** Tell the server to remove an unsaved upload. Best effort; `keepalive`
   *  lets it finish even while the page is being left. The server refuses
   *  to remove a video that a saved entry uses. */
  function discardUpload(uploadId: string): void {
    void fetch('/admin/api/video-discard', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ uploadId }),
      credentials: 'same-origin',
      keepalive: true,
    }).catch(() => {
      /* nothing useful to do; the file can be removed in the Mux dashboard */
    })
  }

  // Leaving now would interrupt an upload, or leave a finished one unsaved
  // — make the browser ask first. (If the page is left anyway, nothing is
  // lost: the upload is remembered, see above.)
  window.addEventListener('beforeunload', (e) => {
    if (!videoBusy && !pendingUploadId) return
    e.preventDefault()
    e.returnValue = ''
  })
  window.addEventListener('pagehide', () => {
    if (!activeUpload && !videoBusy) return
    // Stop sending; the remembered upload carries on from here next time.
    activeUpload?.abort()
    activeUpload = null
    videoRun++
    setBusy(false)
  })
  // Brought back by the Back button with an upload interrupted mid-way:
  // start over from a clean page, which picks the upload back up.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && readRecord()) window.location.reload()
  })

  const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

  async function fetchJson<T>(input: string, init?: RequestInit): Promise<{ res: Response; data: T }> {
    const res = await fetch(input, { credentials: 'same-origin', ...init })
    let data: T
    try {
      data = (await res.json()) as T
    } catch {
      throw new Error(`Server returned a non-JSON response (HTTP ${res.status}).`)
    }
    return { res, data }
  }

  interface VideoStatus {
    state?: 'waiting' | 'processing' | 'ready' | 'failed'
    assetId?: string
    playbackId?: string
    durationSec?: number
    aspectRatio?: string
    inUse?: boolean
    error?: string
  }
  async function videoStatus(uploadId: string, checkUse = false): Promise<VideoStatus> {
    const { res, data } = await fetchJson<VideoStatus>(
      `/admin/api/video-status?uploadId=${encodeURIComponent(uploadId)}${checkUse ? '&checkUse=1' : ''}`,
    )
    if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
    return data
  }

  /** The processing wait gave up asking; the upload itself is fine. */
  class StatusUnavailable extends Error {}

  /**
   * One upload run: send `file` (fresh, or continuing the remembered upload
   * of the same file), then wait for Mux to finish processing. With
   * `pickUp`, the remembered upload is already fully at Mux: just wait.
   */
  async function runUpload(source: { file: File } | { pickUp: UploadRecord }): Promise<void> {
    if (!videoFileEl) return
    const file = 'file' in source ? source.file : null
    // A newer run supersedes whatever came before it.
    const run = ++videoRun
    activeUpload?.abort()
    activeUpload = null
    const current = () => run === videoRun

    // Carry on with the remembered upload if this is the same file (or a
    // pick-up); anything else remembered is replaced, so discard it.
    const remembered = readRecord()
    let record: UploadRecord | null =
      'pickUp' in source
        ? source.pickUp
        : remembered && file && isSameFile(remembered, file)
          ? remembered
          : null
    if (remembered && !record) {
      discardUpload(remembered.uploadId)
      writeRecord(null)
    }
    if (pendingUploadId && pendingUploadId !== record?.uploadId) discardUpload(pendingUploadId)
    pendingUploadId = null

    showSavedVideo()
    stillBeforeUpload = videoField('thumbnailTime')?.value ?? ''
    const hadVideo = !!savedVideo.fields.playbackId
    const name = file?.name ?? record?.name ?? 'the video'

    setBusy(true)
    setStatus('', 'info')
    setProgress(record ? pct(record.stored, record.size) : 0)
    setUploadStatus(
      record
        ? `Picking up your upload of ${name} (${pct(record.stored, record.size)}% sent)…`
        : 'Preparing upload…',
      'uploading',
    )
    try {
      // 1. Is the remembered upload already complete at Mux? (A finished
      //    upload is used whatever its age; an unfinished one only while
      //    Mux still keeps it open.)
      let needToSend = !!file
      if (record && file) {
        let st: VideoStatus | null = null
        try {
          st = await videoStatus(record.uploadId)
        } catch {
          /* couldn't ask — sending will find out where it got to */
        }
        if (!current()) return
        if (st?.state === 'processing' || st?.state === 'ready') {
          needToSend = false
        } else if (st?.state === 'failed' || (st?.state === 'waiting' && !isFresh(record))) {
          // Mux closed it (or is about to): start a new one. Only on a clear
          // answer — if Mux couldn't be asked, sending finds out where the
          // upload stands, and a closed one is then replaced.
          discardUpload(record.uploadId)
          writeRecord(null)
          record = null
        }
      }

      // 2. A new upload: get a one-off upload URL from Mux (via our server;
      //    the API token never reaches the browser).
      if (!record) {
        if (!file) return
        const { res: startRes, data: start } = await fetchJson<{
          uploadId?: string
          uploadUrl?: string
          error?: string
        }>('/admin/api/video-upload', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ title: titleEl?.value ?? '' }),
        })
        if (!startRes.ok || !start.uploadId || !start.uploadUrl) {
          if (!current()) return
          throw new Error(start.error ?? `Could not start the upload (HTTP ${startRes.status}).`)
        }
        if (!current()) {
          // Superseded while the URL was being fetched: it's not ours to keep.
          discardUpload(start.uploadId)
          return
        }
        record = {
          uploadId: start.uploadId,
          url: start.uploadUrl,
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
          stored: 0,
          startedAt: Date.now(),
        }
        writeRecord(record)
      }
      const uploadId = record.uploadId
      pendingUploadId = uploadId

      // 3. Send the file (or what's left of it).
      if (needToSend && file) {
        const controller = new AbortController()
        const handle = { abort: () => controller.abort() }
        activeUpload = handle
        // Recent (time, bytes) samples for a time-left estimate.
        const samples: Array<[number, number]> = []
        const timeLeft = (bytes: number): string => {
          const now = Date.now()
          samples.push([now, bytes])
          while (samples.length > 2 && now - samples[0][0] > 90_000) samples.shift()
          const [t0, b0] = samples[0]
          if (now - t0 < 20_000 || bytes <= b0) return ''
          const rate = (bytes - b0) / (now - t0)
          return ` · about ${fmtMinutes((file.size - bytes) / rate)} left`
        }
        await sendToMux({
          url: record.url,
          file,
          resumeFrom: record.stored,
          signal: controller.signal,
          onProgress: (bytes) => {
            if (!current()) return
            setProgress((bytes / file.size) * 100)
            setUploadStatus(
              `Uploading ${file.name} — ${pct(bytes, file.size)}% (${fmtBytes(bytes)} of ${fmtBytes(file.size)})${timeLeft(bytes)}`,
              'uploading',
            )
          },
          onStored: (bytes) => {
            const r = readRecord()
            if (r && r.uploadId === uploadId) writeRecord({ ...r, stored: bytes })
          },
          onState: (state) => {
            if (!current()) return
            if (state === 'offline') {
              setUploadStatus('Connection lost — the upload will continue when you’re back online…', 'uploading')
            } else if (state === 'retrying') {
              setUploadStatus('Connection trouble — retrying…', 'uploading')
            }
          },
        })
        if (activeUpload === handle) activeUpload = null
        if (!current()) return
      }
      setProgress(100)

      // 4. Wait for Mux to make it playable. Short clips take seconds; long
      //    or unusual files can take much longer. There is no time limit:
      //    the file is safe at Mux, and if this page is closed the next
      //    visit to this editor picks it up.
      setUploadStatus('Upload finished. Mux is processing the video…', 'uploading')
      const startedAt = Date.now()
      // Time spent on checks that actually failed while online. Time
      // offline or asleep doesn't count.
      let failingMs = 0
      let lastFailAt: number | null = null
      for (;;) {
        const waited = Date.now() - startedAt
        await sleep(waited < 120_000 ? 3000 : waited < 30 * 60_000 ? 8000 : 20_000)
        if (!current()) return
        if (navigator.onLine === false) {
          failingMs = 0
          lastFailAt = null
          setUploadStatus('Connection lost — still waiting for Mux to finish processing…', 'uploading')
          continue
        }
        let status: VideoStatus
        try {
          status = await videoStatus(uploadId)
          failingMs = 0
          lastFailAt = null
        } catch {
          const now = Date.now()
          failingMs += lastFailAt === null ? 0 : Math.min(now - lastFailAt, 30_000)
          lastFailAt = now
          if (failingMs > 5 * 60_000) throw new StatusUnavailable()
          continue
        }
        if (!current()) return
        if (status.state === 'failed') {
          throw new Error(status.error ?? 'Mux could not process this file.')
        }
        if (status.state === 'ready' && status.assetId && status.playbackId) {
          setVideoField('muxAssetId', status.assetId)
          setVideoField('playbackId', status.playbackId)
          setVideoField('durationSec', typeof status.durationSec === 'number' ? String(status.durationSec) : '')
          setVideoField('aspectRatio', status.aspectRatio ?? '')
          // A "still image at" time saved with the previous file doesn't
          // apply to this one. (Anything typed since is the user's: keep it.)
          if ((videoField('thumbnailTime')?.value ?? '') === savedVideo.thumbnailTime) {
            setVideoField('thumbnailTime', '')
          }
          if (videoPreview) {
            videoPreview.src = muxThumb(status.playbackId, { width: 640 })
            videoPreview.hidden = false
          }
          const duration = formatDuration(status.durationSec)
          setBusy(false)
          setProgress(null)
          setUploadStatus(`✓ Video ready${duration ? ` (${duration})` : ''} — now save to publish it`, 'success')
          videoFileEl.value = ''
          return
        }
        const elapsed = formatDuration((Date.now() - startedAt) / 1000)
        setUploadStatus(
          Date.now() - startedAt < 10 * 60_000
            ? `Upload finished. Mux is processing the video… (${elapsed})`
            : `Upload finished. Mux is still processing the video (${elapsed}) — long videos can take a while. You can leave this page; opening this editor again picks it up.`,
          'uploading',
        )
      }
    } catch (err) {
      if (!current()) return
      activeUpload?.abort()
      activeUpload = null
      setBusy(false)
      setProgress(null)
      videoFileEl.value = ''
      showSavedVideo()
      const keepUpload = (err instanceof UploadFailed && err.resumable) || err instanceof StatusUnavailable
      if (keepUpload) {
        // The upload is fine where it is: keep it remembered so it can be
        // continued, rather than throwing away what was already sent.
        pendingUploadId = null
        const r = readRecord()
        if (err instanceof StatusUnavailable) {
          setUploadStatus(
            '✗ Couldn’t check on the video for several minutes. Your upload is safe at Mux — reload this page to pick it up again.',
            'error',
          )
        } else {
          setUploadStatus(
            `✗ The upload paused: ${err instanceof Error ? err.message : String(err)}${
              r ? ` ${pct(r.stored, r.size)}% is safely at Mux.` : ''
            } Choose the same file again to continue from there.${hadVideo ? ' The current video is unchanged.' : ''}`,
            'error',
          )
        }
        return
      }
      const failed = pendingUploadId
      if (failed) discardUpload(failed)
      pendingUploadId = null
      writeRecord(null)
      const raw = (err instanceof Error ? err.message : String(err)).trim()
      const msg = /[.!?…]$/.test(raw) ? raw : `${raw}.`
      setUploadStatus(`✗ Video upload failed: ${msg}${hadVideo ? ' The current video is unchanged.' : ''}`, 'error')
    }
  }

  if (videoFileEl) {
    videoFileEl.addEventListener('change', () => {
      const file = videoFileEl.files?.[0]
      if (!file) return
      if (saving) {
        videoFileEl.value = ''
        return
      }
      void runUpload({ file })
    })

    // ── On opening the editor: an earlier upload to pick up? ─────────
    void (async () => {
      const r = readRecord()
      if (!r || videoFileEl.disabled) return
      let st: VideoStatus
      try {
        st = await videoStatus(r.uploadId, true)
      } catch {
        if (videoRun > 0) return // the user has already picked a file
        setUploadStatus(
          `An earlier upload of ${r.name} (${pct(r.stored, r.size)}% sent) can be continued: choose the same file again.`,
          'note',
        )
        return
      }
      if (videoRun > 0) return // the user has already picked a file
      if (st.inUse) {
        writeRecord(null) // it's part of a saved entry already
        return
      }
      if (st.state === 'processing' || st.state === 'ready') {
        void runUpload({ pickUp: r })
        return
      }
      if (st.state === 'failed') {
        discardUpload(r.uploadId)
        writeRecord(null)
        setUploadStatus(`✗ Your earlier upload of ${r.name} didn’t work (${st.error ?? 'Mux closed it'}). Choose the file again to start over.`, 'error')
        return
      }
      // Not fully sent yet.
      if (!isFresh(r)) {
        // Mux closes unfinished uploads after 24 hours.
        discardUpload(r.uploadId)
        writeRecord(null)
        setUploadStatus(`Your earlier upload of ${r.name} was never finished and has expired. Choose the file again to start over.`, 'note')
        return
      }
      setUploadStatus(
        `Your upload of ${r.name} stopped at ${pct(r.stored, r.size)}%. Choose the same file again to continue from there.`,
        'note',
      )
    })()
  }

  // ── 2c. Custom video thumbnail (→ Supabase Storage) ────────────────
  // An ordinary image upload, in two sizes: a large one for the player
  // frame and link previews, and a small one for the cards on /tv. Each
  // upload gets a fresh filename (storage is cached for a year, so a
  // replaced image must not reuse the old address).
  const posterFileEl = form.querySelector<HTMLInputElement>('input[name="poster-file"]')
  const posterStatus = form.querySelector<HTMLElement>('[data-poster-status]')
  const posterWrap = form.querySelector<HTMLElement>('[data-poster-preview-wrap]')
  const posterImg = form.querySelector<HTMLImageElement>('[data-poster-preview]')
  let posterBusy = false
  let posterRun = 0
  function setPosterStatus(text: string, state: 'uploading' | 'success' | 'error' | 'idle'): void {
    if (!posterStatus) return
    posterStatus.textContent = text
    posterStatus.dataset.state = state
    posterStatus.hidden = !text
  }
  function showPoster(poster: string, thumb: string): void {
    const posterField = form.querySelector<HTMLInputElement>('input[name="poster"]')
    const thumbField = form.querySelector<HTMLInputElement>('input[name="posterThumb"]')
    if (posterField) posterField.value = poster
    if (thumbField) thumbField.value = thumb
    if (posterImg && (thumb || poster)) posterImg.src = thumb || poster
    if (posterWrap) posterWrap.hidden = !poster
  }
  if (posterFileEl) {
    posterFileEl.addEventListener('change', async () => {
      const picked = posterFileEl.files?.[0]
      if (!picked) return
      const bucket = posterFileEl.dataset.posterBucket ?? ''
      const folder = posterFileEl.dataset.posterFolder ?? ''
      const looksLikeImage = picked.type.startsWith('image/') || /\.(heic|heif)$/i.test(picked.name)
      if (!bucket || !folder || !looksLikeImage) {
        // Refused before it becomes "the current upload", so an upload
        // already in progress carries on undisturbed.
        posterFileEl.value = ''
        if (!posterBusy) setPosterStatus('✗ That file isn’t an image. Choose a JPEG or PNG.', 'error')
        return
      }
      const run = ++posterRun
      posterBusy = true
      setPosterStatus(`Uploading ${picked.name}…`, 'uploading')
      // This upload reports only on its own line under the field — never in
      // the form's main status, where it could be mistaken for the video
      // upload or the save.
      const quiet: Report = () => {}
      const send = (file: File, path: string) =>
        file.size > PROXY_LIMIT_BYTES
          ? uploadViaSignedUrl(file, bucket, path, quiet)
          : uploadViaProxy(file, bucket, path)
      try {
        // iPhone HEIC → JPEG first, then two JPEG sizes: a large one for the
        // player and link previews, a 960px one for the cards on /tv.
        const source = await maybeConvertHeic(picked, quiet)
        const largeFile = await encodePoster(source, 1920)
        const smallFile = await encodePoster(source, 960)
        const year = yearEl?.value || String(new Date().getFullYear())
        const base = slugify(idEl?.value || titleEl?.value || 'video') || 'video'
        const name = `${base}-thumb-${Date.now().toString(36)}`
        const large = await send(largeFile, `${folder}/${year}/${name}.jpg`)
        const small = await send(smallFile, `${folder}/${year}/${name}-960.jpg`)
        if (run !== posterRun) return // a newer pick (or Remove) took over
        if (!isPosterUrl(large) || !isPosterUrl(small)) {
          throw new Error('the storage address came back in an unexpected form. Check the Year field is a 4-digit year and try again')
        }
        showPoster(large, small)
        setPosterStatus('✓ Custom thumbnail ready — save to use it', 'success')
      } catch (err) {
        if (run !== posterRun) return
        const raw = (err instanceof Error ? err.message : String(err)).trim()
        const msg = /[.!?…]$/.test(raw) ? raw : `${raw}.`
        const had = !!form.querySelector<HTMLInputElement>('input[name="poster"]')?.value
        setPosterStatus(
          `✗ Thumbnail upload failed: ${msg}${had ? ' The current thumbnail is unchanged.' : ''}`,
          'error',
        )
      } finally {
        if (run === posterRun) {
          posterBusy = false
          posterFileEl.value = ''
        }
      }
    })
    form.querySelector<HTMLButtonElement>('[data-poster-remove]')?.addEventListener('click', () => {
      posterRun++ // also abandons an upload still in progress
      posterBusy = false
      posterFileEl.value = ''
      showPoster('', '')
      setPosterStatus('Custom thumbnail removed — save to apply. A frame from the video will be used.', 'idle')
    })
  }

  // ── 3. Submit ──────────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    // A video entry needs the IDs Mux returns once processing finishes.
    if (collection === 'video') {
      if (videoBusy) {
        setStatus('The video is still uploading or processing. Wait for the green “✓ Video ready”, then save.', 'error')
        return
      }
      if (posterBusy) {
        setStatus('The thumbnail image is still uploading. Wait for it to finish, then save.', 'error')
        return
      }
      const playbackId = form.querySelector<HTMLInputElement>('input[name="playbackId"]')?.value.trim()
      if (!playbackId) {
        setStatus('No video attached yet. Choose a file in the Video file field and wait for the green “✓ Video ready”.', 'error')
        return
      }
    }
    // Required-image gate for art and photo. If the file picker never
    // resolved (slow Supabase upload, mobile Safari permissions denied,
    // upload errored out), there's no attached image and the server would
    // commit an un-schema-valid markdown entry that breaks the next build.
    // Stop the user here instead.
    //
    // The IMAGE GRID is the source of truth — not the single hidden cover
    // field, which can momentarily desync from the grid. Re-sync first,
    // then validate against the actual attached image URLs so a correctly
    // uploaded image is never rejected.
    if (collection === 'art' || collection === 'photo') {
      // The state array is the source of truth; make sure the hidden
      // fields reflect it before we serialize the form.
      syncHiddenFromGrid()
      if (imageUrls.length === 0) {
        setStatus(
          'No image attached yet. Pick a file in the Images field above and wait for the green “✓ images ready” indicator. If it turned red, the upload failed — try that file again.',
          'error',
        )
        return
      }
    }
    // Lock the submit button so a double-click can't fire two saves.
    if (submitBtn) submitBtn.disabled = true
    // From here until the server answers, the uploaded video belongs to this
    // save: leaving the page must not discard it (the save may land a moment
    // later), and the file can't be swapped underneath it.
    const savingUploadId = pendingUploadId
    pendingUploadId = null
    saving = true
    if (videoFileEl) videoFileEl.disabled = true
    const deleteBtnEl = document.getElementById('admin-delete-btn') as HTMLButtonElement | null
    if (deleteBtnEl) deleteBtnEl.disabled = true
    // The form has been read; a thumbnail picked or removed now would not
    // be part of this save. Lock those controls until the answer is back.
    const posterControls = [
      posterFileEl,
      form.querySelector<HTMLButtonElement>('[data-poster-remove]'),
    ].filter((el): el is HTMLInputElement | HTMLButtonElement => !!el)
    const lockPoster = (locked: boolean) => posterControls.forEach((el) => (el.disabled = locked))
    lockPoster(true)
    // The server said no (nothing was saved): the upload is unsaved again.
    const saveRefused = () => {
      saving = false
      pendingUploadId = savingUploadId
      if (videoFileEl) videoFileEl.disabled = false
      if (deleteBtnEl) deleteBtnEl.disabled = false
      if (submitBtn) submitBtn.disabled = false
      lockPoster(false)
    }
    setStatus('Saving…', 'info')
    const payload = readForm({ form, collection, isNew })
    // The file version this editor was filled from (set server-side from
    // GitHub). The server refuses the save if the file has changed since,
    // instead of silently overwriting the newer version.
    const basePath = form.dataset.basePath || undefined
    const baseSha = form.dataset.baseSha || null
    try {
      const res = await fetch('/admin/api/save', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ payload, isNew, basePath, baseSha }),
      })
      const data = await res.json()
      if (res.status === 409) {
        setStatus(data.error || 'This entry changed since you opened it. Reload to get the latest version.', 'error')
        saveRefused()
        return
      }
      if (!res.ok || !data.ok) {
        setStatus(`Save failed: ${data.error || `HTTP ${res.status}`}`, 'error')
        saveRefused()
        return
      }
      saving = false
      // The uploaded video is part of the saved entry now: forget it, so it
      // isn't offered for pick-up again. (A different, paused upload stays
      // remembered — it wasn't part of this save.)
      if (savingUploadId && readRecord()?.uploadId === savingUploadId) writeRecord(null)
      // This editor now holds the version just written.
      if (data.path) form.dataset.basePath = data.path
      if (data.contentSha) form.dataset.baseSha = data.contentSha
      // Saved = committed to the repo. The public site AND this editor read
      // content baked at build time, so the change won't appear until
      // Vercel finishes rebuilding (~1–2 min). Tell the user plainly so an
      // unchanged page afterwards doesn't look like a lost save, then
      // return to the list once they've had a moment to read it.
      setStatus(
        'Saved ✓ — committed to the site. It’s rebuilding now; your change goes live in about 1–2 minutes. (The page and this editor may still show the old version until the rebuild finishes.)' +
          (data.warning ? ` Note: ${data.warning}` : ''),
        'success',
      )
      window.setTimeout(() => {
        window.location.href = `/admin/${collection}`
      }, data.warning ? 9000 : 3500)
    } catch (err) {
      // No usable answer (connection dropped, or the reply wasn't readable):
      // the save may or may not have gone through. Let the user try again,
      // but do NOT treat the upload as unsaved — if the save did land,
      // discarding it would delete a published video. At worst an unused
      // file is left at Mux.
      const msg = err instanceof Error ? err.message : String(err)
      setStatus(
        `Save failed: ${msg}. If this keeps happening, reload the page and check whether the entry was saved before trying again.`,
        'error',
      )
      saving = false
      if (videoFileEl) videoFileEl.disabled = false
      if (deleteBtnEl) deleteBtnEl.disabled = false
      if (submitBtn) submitBtn.disabled = false
      lockPoster(false)
    }
  })

  // ── Prints editor (commerce) ───────────────────────────────────────
  // Toggle reveals the rows. + Add a size appends a fresh row. The
  // remove × on each row deletes it. No payload manipulation here —
  // readPrints() in readForm walks the live DOM at submit time.
  const printsToggle = form.querySelector<HTMLInputElement>('[data-prints-toggle]')
  const printsEditor = form.querySelector<HTMLElement>('[data-prints-editor]')
  const printsRows = form.querySelector<HTMLElement>('[data-prints-rows]')
  const printsAdd = form.querySelector<HTMLButtonElement>('[data-prints-add]')

  if (printsToggle && printsEditor) {
    printsToggle.addEventListener('change', () => {
      printsEditor.hidden = !printsToggle.checked
    })
  }

  function addPrintRow(size = '8x10', dollars = ''): void {
    if (!printsRows) return
    const row = document.createElement('div')
    row.className = 'prints-editor__row'
    row.setAttribute('data-prints-row', '')
    row.innerHTML = `
      <select class="admin-input prints-editor__size" data-prints-size>
        ${['8x10', '11x14', '16x20', '24x30']
          .map((s) => `<option value="${s}"${s === size ? ' selected' : ''}>${s}</option>`)
          .join('')}
      </select>
      <input type="number" class="admin-input prints-editor__price" data-prints-price min="1" step="1" value="${dollars}" placeholder="40" />
      <button type="button" class="prints-editor__remove" data-prints-remove aria-label="Remove">×</button>
    `
    printsRows.appendChild(row)
  }

  printsAdd?.addEventListener('click', () => addPrintRow())

  // Delegate the remove click — handles both existing rows and any
  // rows added dynamically.
  printsRows?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.matches('[data-prints-remove]')) return
    target.closest('[data-prints-row]')?.remove()
  })

  // ── Tag-suggestion pills ───────────────────────────────────────────
  // Click a pill to append its tag to the comma-separated input.
  // Skips duplicates so re-clicking has no effect. Re-clicking a
  // pill that's already in the field removes it instead.
  const pills = form.querySelectorAll<HTMLButtonElement>('[data-tag-pill]')
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const tag = pill.dataset.tagPill ?? ''
      const targetName = pill.dataset.targetInput ?? 'tags'
      const input = form.querySelector<HTMLInputElement>(`input[name="${targetName}"]`)
      if (!tag || !input) return
      const current = input.value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const idx = current.indexOf(tag)
      if (idx === -1) {
        current.push(tag)
        pill.classList.add('tag-suggest__pill--on')
      } else {
        current.splice(idx, 1)
        pill.classList.remove('tag-suggest__pill--on')
      }
      input.value = current.join(', ')
    })
    // Reflect initial state — if the input already contains the pill's
    // tag (because this is an edit, not new), mark the pill as on.
    const targetName = pill.dataset.targetInput ?? 'tags'
    const input = form.querySelector<HTMLInputElement>(`input[name="${targetName}"]`)
    const tag = pill.dataset.tagPill ?? ''
    if (input && tag) {
      const present = input.value
        .split(',')
        .map((s) => s.trim())
        .includes(tag)
      if (present) pill.classList.add('tag-suggest__pill--on')
    }
  })

  // ── Delete button ──────────────────────────────────────────────────
  const deleteBtn = document.getElementById('admin-delete-btn')
  if (deleteBtn && !isNew && idEl) {
    deleteBtn.addEventListener('click', async () => {
      const question = collection === 'video'
        ? 'Delete this video? This removes the entry from the site AND permanently deletes the video file from Mux. This cannot be undone.'
        : 'Delete this entry? This commits a removal to the repo.'
      if (!confirm(question)) return
      const year = yearEl?.value ? Number(yearEl.value) : undefined
      try {
        const res = await fetch('/admin/api/delete', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          // basePath = the exact file this editor loaded (when known).
          body: JSON.stringify({ collection, id: idEl.value, year, basePath: form.dataset.basePath || undefined }),
        })
        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`)
        // An upload made on this page but never saved goes with the entry.
        activeUpload?.abort()
        activeUpload = null
        videoRun++
        setBusy(false)
        if (pendingUploadId) {
          discardUpload(pendingUploadId)
          pendingUploadId = null
        }
        const remembered = readRecord()
        if (remembered) {
          discardUpload(remembered.uploadId)
          writeRecord(null)
        }
        // e.g. the entry is gone but the Mux file couldn't be removed.
        if (data.warning) alert(data.warning)
        window.location.href = `/admin/${collection}`
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setStatus(`Delete failed: ${msg}`, 'error')
      }
    })
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
