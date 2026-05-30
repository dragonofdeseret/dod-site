// ──────────────────────────────────────────────────────────────────────────────
// Image variant helpers — mirror legacy archive.js → mediaFromPath().
//
// The legacy site pre-bakes responsive .webp variants for every source image
// (the build/imagemagick pipeline runs once per piece, producing -120/-240/
// -480/-800/-900/-1200/-1600/-2000.webp alongside the source). All of those
// files live on disk under /images/... and the new site references the
// existing variants directly — no rebuild needed.
//
// Source-of-truth path on the markdown frontmatter is the "source" image,
// e.g. "images/art/2026/2026-05-03.webp". We expose helpers that derive
// the thumb / viewer / archive-thumb srcsets from that single string.
//
// If/when we want to drop the manual variant pipeline, swap the call sites
// to Astro's <Image> component and let Sharp generate variants at build.
// For now this keeps visual parity with the legacy site without forcing
// a 906MB image rebuild.
// ──────────────────────────────────────────────────────────────────────────────

/** Strip a trailing extension from a webp path and return { dir, stem }. */
function splitPath(path: string): { dir: string; stem: string } {
  const lastSlash = path.lastIndexOf('/')
  const dir = lastSlash === -1 ? '' : path.slice(0, lastSlash)
  const file = lastSlash === -1 ? path : path.slice(lastSlash + 1)
  const dot = file.lastIndexOf('.')
  const stem = dot === -1 ? file : file.slice(0, dot)
  return { dir, stem }
}

/** "images/art/2026/2026-05-03.webp" → "/images/art/2026/2026-05-03-1600.webp". */
export function viewerSrc(sourcePath: string): string {
  const { dir, stem } = splitPath(sourcePath)
  return `/${dir}/${stem}-1600.webp`
}

/** Full-resolution srcset for the viewer / lightbox image. */
export function viewerSrcset(sourcePath: string): string {
  const { dir, stem } = splitPath(sourcePath)
  return [
    `/${dir}/${stem}-900.webp 900w`,
    `/${dir}/${stem}-1200.webp 1200w`,
    `/${dir}/${stem}-1600.webp 1600w`,
    `/${dir}/${stem}-2000.webp 2000w`,
  ].join(', ')
}

/** Gallery tile (medium thumbnail) — 800w with 480w fallback. */
export function thumbSrc(sourcePath: string): string {
  const { dir, stem } = splitPath(sourcePath)
  return `/${dir}/${stem}-800.webp`
}

export function thumbSrcset(sourcePath: string): string {
  const { dir, stem } = splitPath(sourcePath)
  return [`/${dir}/${stem}-480.webp 480w`, `/${dir}/${stem}-800.webp 800w`].join(', ')
}

/** Tiny 60px archive thumb (the small inline image on /archive rows). */
export function archiveThumbSrc(sourcePath: string): string {
  const { dir, stem } = splitPath(sourcePath)
  return `/${dir}/${stem}-120.webp`
}

export function archiveThumbSrcset(sourcePath: string): string {
  const { dir, stem } = splitPath(sourcePath)
  return [`/${dir}/${stem}-120.webp 1x`, `/${dir}/${stem}-240.webp 2x`].join(', ')
}

/** Default `sizes` attribute for gallery tiles — taken from legacy
 *  applyGalleryImage(). 260px on desktop, full-width minus padding on mobile. */
export const GALLERY_SIZES =
  '(max-width: 900px) calc(100vw - 44px), 260px'

/** Default `sizes` for the viewer (single-item page) image. */
export const VIEWER_SIZES =
  '(max-width: 700px) calc(100vw - 44px), (max-width: 1200px) calc(100vw - 120px), 900px'

/** Default `sizes` for archive-row thumbnails. */
export const ARCHIVE_THUMB_SIZES = '60px'

/** Original source image (the un-suffixed path) — used as the lightbox
 *  click target so the largest available file loads when the user opens
 *  the viewer. Matches legacy openLightbox(src=item.image). */
export function originalSrc(sourcePath: string): string {
  return `/${sourcePath}`
}
