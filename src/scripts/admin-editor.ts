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

  switch (ctx.collection) {
    case 'art':
    case 'photo':
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

async function uploadMedia(file: File, bucket: string, year: string, id: string): Promise<string | null> {
  const supabase = getBrowserSupabase()
  // Path scheme: <year>/<id><ext>. Year-bucketed so big collections stay
  // legible in the Supabase Storage dashboard.
  const dot = file.name.lastIndexOf('.')
  const ext = dot === -1 ? '' : file.name.slice(dot).toLowerCase()
  const path = `${year}/${id}${ext}`
  setStatus(`Uploading ${file.name}…`, 'info')
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
