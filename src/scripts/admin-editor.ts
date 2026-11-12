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

import { formatDuration, muxThumb } from '../lib/video'

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
async function maybeConvertHeic(file: File): Promise<File> {
  const isHeic =
    /image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)
  if (!isHeic) return file

  setStatus('Converting HEIC photo to JPEG…', 'info')
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
async function uploadViaSignedUrl(file: File, bucket: string, path: string): Promise<string> {
  setStatus(`Preparing direct upload for ${Math.round(file.size / 1024)} KB file…`, 'info')

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

  setStatus(`Uploading ${file.name} direct to storage…`, 'info')
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
  function setUploadStatus(text: string, state: 'uploading' | 'success' | 'error' | 'idle'): void {
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
  // upload URL, the browser sends the file there in resumable chunks
  // (UpChunk retries a failed chunk and waits out a dropped connection),
  // and then we poll until Mux has made it playable. Only then are the
  // hidden muxAssetId / playbackId fields filled in — until that moment
  // they hold the entry's saved video (or nothing, for a new one), so a
  // failed or abandoned upload never leaves the form half-updated.
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
  // An upload that has been started at Mux but isn't part of a saved entry
  // yet. If it is superseded, fails, or the page is left, it is discarded
  // so the file doesn't sit at Mux unused (and billed).
  let pendingUploadId: string | null = null
  // A save is on its way to the server. Its upload is no longer "pending"
  // (it is about to become part of a saved entry), and until the answer is
  // back nothing may discard it or swap the file.
  let saving = false

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

  // Leaving now would throw away an upload (in flight, or finished but not
  // saved) — make the browser ask first…
  window.addEventListener('beforeunload', (e) => {
    if (!videoBusy && !pendingUploadId) return
    e.preventDefault()
    e.returnValue = ''
  })
  // …and if the page really is left, clean the unsaved upload up.
  window.addEventListener('pagehide', () => {
    if (!pendingUploadId) return
    activeUpload?.abort()
    activeUpload = null
    discardUpload(pendingUploadId)
    pendingUploadId = null
    // Should the browser bring this page back as it was (Back button), it
    // must not still claim the discarded upload.
    videoRun++
    videoBusy = false
    setProgress(null)
    showSavedVideo()
    setUploadStatus(savedVideo.fields.playbackId ? '✓ Video ready' : '', savedVideo.fields.playbackId ? 'success' : 'idle')
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

  if (videoFileEl) {
    videoFileEl.addEventListener('change', async () => {
      const file = videoFileEl.files?.[0]
      if (!file) return
      if (saving) {
        videoFileEl.value = ''
        return
      }
      // A newer pick supersedes whatever came before it: stop an upload
      // still being sent, discard an unsaved one (in flight, processing, or
      // ready), and put the form back on the saved video meanwhile.
      const run = ++videoRun
      activeUpload?.abort()
      activeUpload = null
      if (pendingUploadId) {
        discardUpload(pendingUploadId)
        pendingUploadId = null
      }
      showSavedVideo()
      stillBeforeUpload = videoField('thumbnailTime')?.value ?? ''
      const current = () => run === videoRun
      const hadVideo = !!savedVideo.fields.playbackId
      let uploadId: string | null = null

      videoBusy = true
      setStatus('', 'info')
      setProgress(0)
      setUploadStatus('Preparing upload…', 'uploading')
      try {
        // 1. One-off upload URL from Mux (via our server; the API token
        //    never reaches the browser).
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
        uploadId = start.uploadId
        pendingUploadId = uploadId

        // 2. Send the file to Mux in chunks.
        const { createUpload } = await import('@mux/upchunk')
        if (!current()) return
        const sizeMb = Math.max(1, Math.round(file.size / 1_048_576))
        await new Promise<void>((resolve, reject) => {
          const upload = createUpload({
            endpoint: start.uploadUrl!,
            file,
            chunkSize: 30720, // KB
            // 0 is what a dropped connection looks like mid-chunk. Treating
            // it as retryable makes UpChunk hold the chunk and resend it
            // once back online, instead of failing the whole upload.
            retryCodes: [0, 408, 502, 503, 504],
            attempts: 8,
            delayBeforeAttempt: 2,
          })
          // UpChunk keeps listening for the browser going offline/online for
          // as long as the page lives. Once this transfer is over (done,
          // failed or replaced) it must neither touch the form's status
          // again nor resume.
          let sending = true
          const live = () => sending && current()
          // Connection drops. Left to itself UpChunk restarts its send loop
          // the instant the browser reports "online" — even when the chunk
          // that was in flight is still being sent or is waiting to be
          // retried — which would put two loops on one upload, sending
          // chunks under the wrong byte ranges. So: pause on "offline" (which
          // makes that automatic restart a no-op), and resume by hand only
          // once nothing is in flight and its retry timer has had time to
          // hand the unsent chunk back.
          let inFlight = false
          let lastActivity = Date.now()
          let resumeTimer: number | undefined
          const QUIET_MS = 2000 /* delayBeforeAttempt */ + 1500
          const touch = (busy: boolean) => {
            inFlight = busy
            lastActivity = Date.now()
          }
          upload.on('attempt', () => touch(true))
          upload.on('attemptFailure', () => touch(false))
          upload.on('chunkSuccess', () => touch(false))
          const tryResume = () => {
            resumeTimer = undefined
            if (!live() || !upload.paused) return
            if (navigator.onLine === false) return // the next "online" tries again
            if (inFlight || Date.now() - lastActivity < QUIET_MS) {
              resumeTimer = window.setTimeout(tryResume, 500)
              return
            }
            upload.resume()
          }
          const settle = () => {
            sending = false
            window.clearTimeout(resumeTimer)
            upload.abort()
            if (activeUpload === handle) activeUpload = null
          }
          // What the rest of the editor holds on to. Stopping the transfer
          // from outside (a newer pick, leaving the page, deleting the
          // entry) must END it — not merely pause it, or the resume logic
          // above could start it again later — and let this run finish.
          // Every caller bumps videoRun in the same breath, so the run then
          // stops at its next `current()` check.
          const handle = {
            abort: () => {
              settle()
              resolve()
            },
          }
          activeUpload = handle
          upload.on('progress', (ev: { detail: number }) => {
            if (!live()) return
            const pct = Math.floor(ev.detail)
            setProgress(pct)
            setUploadStatus(`Uploading ${file.name} — ${pct}% of ${sizeMb} MB`, 'uploading')
          })
          upload.on('offline', () => {
            if (!live()) return
            upload.pause()
            if (live()) setUploadStatus('Connection lost — the upload will resume when you’re back online…', 'uploading')
          })
          upload.on('online', () => {
            if (!live()) return
            setUploadStatus(`Back online — resuming ${file.name}…`, 'uploading')
            window.clearTimeout(resumeTimer)
            resumeTimer = window.setTimeout(tryResume, 500)
          })
          upload.on('error', (ev: { detail?: { message?: string } }) => {
            if (!sending) return
            settle()
            const raw = ev.detail?.message ?? ''
            reject(
              new Error(
                /responded with 0\b/.test(raw)
                  ? 'The connection to Mux kept failing. Check your internet connection and try the file again.'
                  : raw || 'The upload was interrupted.',
              ),
            )
          })
          upload.on('success', () => {
            if (!sending) return
            settle()
            resolve()
          })
        })
        if (!current()) return
        setProgress(100)

        // 3. Wait for Mux to make it playable. Short clips take seconds;
        //    long videos can take a few minutes.
        setUploadStatus('Upload finished. Mux is processing the video…', 'uploading')
        const startedAt = Date.now()
        // Time spent on checks that actually failed while online. Time
        // offline or asleep doesn't count: the file is safe at Mux, and the
        // answer is only delayed.
        let failingMs = 0
        let lastFailAt: number | null = null
        for (;;) {
          await sleep(Date.now() - startedAt < 120_000 ? 3000 : 8000)
          if (!current()) return
          if (navigator.onLine === false) {
            failingMs = 0
            lastFailAt = null
            setUploadStatus('Connection lost — still waiting for Mux to finish processing…', 'uploading')
            continue
          }
          let status: {
            state?: 'waiting' | 'processing' | 'ready' | 'failed'
            assetId?: string
            playbackId?: string
            durationSec?: number
            aspectRatio?: string
            error?: string
          }
          try {
            const { res, data } = await fetchJson<typeof status>(
              `/admin/api/video-status?uploadId=${encodeURIComponent(uploadId)}`,
            )
            if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
            status = data
            failingMs = 0
            lastFailAt = null
          } catch (err) {
            // A blip while checking isn't a failed upload. Keep waiting, and
            // only give up after five minutes' worth of failed checks (a gap
            // longer than one check interval — the machine slept — counts
            // as a single interval).
            const now = Date.now()
            failingMs += lastFailAt === null ? 0 : Math.min(now - lastFailAt, 15_000)
            lastFailAt = now
            if (failingMs > 5 * 60_000) throw err
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
            const length = duration ? ` (${duration})` : ''
            videoBusy = false
            setProgress(null)
            setUploadStatus(`✓ Video ready${length} — now save to publish it`, 'success')
            videoFileEl.value = ''
            return
          }
          // Mux has just told us it still isn't done. Only now may the long
          // wait limit apply — never on a check that didn't get an answer.
          if (Date.now() - startedAt > 45 * 60_000) {
            throw new Error('Mux is still processing after 45 minutes. Check the video in the Mux dashboard, then try again.')
          }
          const waited = Math.round((Date.now() - startedAt) / 1000)
          setUploadStatus(`Upload finished. Mux is processing the video… (${waited}s)`, 'uploading')
        }
      } catch (err) {
        if (!current()) return
        activeUpload?.abort()
        activeUpload = null
        if (uploadId) discardUpload(uploadId)
        if (pendingUploadId === uploadId) pendingUploadId = null
        videoBusy = false
        setProgress(null)
        videoFileEl.value = ''
        showSavedVideo()
        const raw = err instanceof Error ? err.message : String(err)
        const msg = /[.!?…]$/.test(raw.trim()) ? raw.trim() : `${raw.trim()}.`
        setUploadStatus(
          `✗ Video upload failed: ${msg}${hadVideo ? ' The current video is unchanged.' : ''}`,
          'error',
        )
      }
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
    // The server said no (nothing was saved): the upload is unsaved again.
    const saveRefused = () => {
      saving = false
      pendingUploadId = savingUploadId
      if (videoFileEl) videoFileEl.disabled = false
      if (deleteBtnEl) deleteBtnEl.disabled = false
      if (submitBtn) submitBtn.disabled = false
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
        videoRun++
        videoBusy = false
        if (pendingUploadId) {
          discardUpload(pendingUploadId)
          pendingUploadId = null
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
