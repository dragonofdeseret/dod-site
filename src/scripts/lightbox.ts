// ──────────────────────────────────────────────────────────────────────────────
// Lightbox — image viewer overlay. Port of legacy script.js
// openLightbox()/closeLightbox().
//
// Mount on any page that needs lightbox behavior by adding `data-lightbox`
// to <img> or to a containing element. Click → opens overlay; click on
// backdrop or ESC → closes. Stable DOM markup (.image-viewer) so existing
// CSS in style.css applies without changes.
//
// Astro pages opt in:
//
//   <img src=... data-lightbox="path/to/full.webp" alt="...">
//   <script>import('/src/scripts/lightbox.ts')</script>
//
// Or wrap into a global init for site-wide pages — see attachLightboxGlobal().
// ──────────────────────────────────────────────────────────────────────────────

export function closeLightbox(): void {
  const viewer = document.querySelector('.image-viewer')
  if (!viewer) return
  document.body.style.overflow = ''
  viewer.remove()
}

export function openLightbox(src: string, alt = ''): void {
  if (!src) return
  closeLightbox()

  const viewer = document.createElement('div')
  viewer.className = 'image-viewer'

  const img = document.createElement('img')
  img.src = src
  img.alt = alt
  img.decoding = 'async'

  viewer.appendChild(img)

  viewer.addEventListener('click', (e) => {
    if (e.target === viewer || e.target === img) closeLightbox()
  })

  document.body.appendChild(viewer)
  document.body.style.overflow = 'hidden'
}

/**
 * Attach click handlers to every element with [data-lightbox]. The
 * attribute value is the URL of the full-resolution image to open.
 * Idempotent — safe to call on every page load.
 */
export function attachLightboxGlobal(): void {
  document.querySelectorAll<HTMLElement>('[data-lightbox]').forEach((el) => {
    if (el.dataset.lightboxBound === '1') return
    el.dataset.lightboxBound = '1'
    el.addEventListener('click', (e) => {
      e.preventDefault()
      const src = el.dataset.lightbox || ''
      const alt =
        el.getAttribute('aria-label') ||
        (el.tagName === 'IMG' ? (el as HTMLImageElement).alt : '') ||
        ''
      openLightbox(src, alt)
    })
  })

  // ESC closes whenever a viewer is mounted. Bind once; the handler
  // no-ops when the viewer doesn't exist.
  if (!(document.body.dataset.lightboxEscBound === '1')) {
    document.body.dataset.lightboxEscBound = '1'
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox()
    })
  }
}

// Auto-init on import.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachLightboxGlobal)
  } else {
    attachLightboxGlobal()
  }
}
