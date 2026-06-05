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

import { getBrowserSupabase } from '@/lib/supabase'

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface FormContext {
  form: HTMLFormElement
  collection: 'art' | 'photo' | 'writing' | 'margins' | 'quotes' | 'site'
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

  switch (ctx.collection) {
    case 'art':
    case 'photo': {
      const forSale = !!ctx.form.querySelector<HTMLInputElement>('[data-prints-toggle]')?.checked
      return {
        id: get('id'),
        type: ctx.collection,
        title: get('title'),
        date: get('date'),
        year: getNumber('year'),
        image: get('image'),
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

async function uploadMedia(rawFile: File, bucket: string, year: string, id: string): Promise<string | null> {
  const supabase = getBrowserSupabase()
  // Resize first (no-op for PDFs, GIFs, SVGs, and already-small images).
  setStatus('Preparing file…', 'info')
  let file: File
  try {
    file = await maybeResizeImage(rawFile)
  } catch (err) {
    // Resize failed — log and fall through with the original. Better to
    // upload a too-big image than to block the user entirely.
    console.warn('[admin-editor] resize failed, using original', err)
    file = rawFile
  }
  // Path scheme: <year>/<id><ext>. Year-bucketed so big collections stay
  // legible in the Supabase Storage dashboard.
  const dot = file.name.lastIndexOf('.')
  const ext = dot === -1 ? '' : file.name.slice(dot).toLowerCase()
  const path = `${year}/${id}${ext}`
  const sizeKb = Math.round(file.size / 1024)
  setStatus(`Uploading ${file.name} (${sizeKb} KB)…`, 'info')
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: '31536000', // 1 year — images are content-addressed by id
  })
  if (error) {
    setStatus(`Upload failed: ${error.message}`, 'error')
    return null
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  setStatus('Upload complete.', 'success')
  return data.publicUrl
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
  const mediaUrlEl = form.querySelector<HTMLInputElement>('input[name="image"], input[name="file"]')
  const mediaPreview = form.querySelector<HTMLImageElement>('#media-preview')
  const bucket = form.dataset.mediaBucket

  if (mediaFileEl && mediaUrlEl && bucket) {
    mediaFileEl.addEventListener('change', async () => {
      const file = mediaFileEl.files?.[0]
      if (!file) return
      const year = yearEl?.value || String(new Date().getFullYear())
      const id = idEl?.value || slugify(file.name.replace(/\.[^.]+$/, ''))
      const url = await uploadMedia(file, bucket, year, id)
      if (url) {
        mediaUrlEl.value = url
        if (mediaPreview && /\.(jpe?g|png|webp|gif|avif)$/i.test(url)) {
          mediaPreview.src = url
          mediaPreview.style.display = 'block'
        }
      }
    })
  }

  // ── 3. Submit ──────────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    setStatus('Saving…', 'info')
    const payload = readForm({ form, collection, isNew })
    try {
      const res = await fetch('/admin/api/save', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ payload, isNew }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      setStatus('Saved. Redirecting…', 'success')
      window.location.href = `/admin/${collection}`
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setStatus(`Save failed: ${msg}`, 'error')
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
      if (!confirm('Delete this entry? This commits a removal to the repo.')) return
      const year = yearEl?.value ? Number(yearEl.value) : undefined
      try {
        const res = await fetch('/admin/api/delete', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ collection, id: idEl.value, year }),
        })
        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`)
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
