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
// TWO kinds of image path reach these helpers:
//
//   1. Legacy LOCAL paths ("images/art/2026/2026-05-03.webp") — relative to
//      public/, with the pre-baked -NNN.webp variants on disk. We derive the
//      variant filenames from them as described above.
//
//   2. Admin-uploaded ABSOLUTE URLs ("https://<project>.supabase.co/storage/
//      v1/object/public/art-images/2026/2026-10-02.jpg") — written by the
//      admin editor. Supabase Storage holds ONLY the single uploaded file;
//      there are no -800/-1600 variants, and prefixing "/" would make the
//      browser resolve the URL against our own origin (a guaranteed 404).
//      Absolute URLs are therefore passed through UNCHANGED by every helper.
//      The uploader already downsizes to <= 2000px wide, so serving the one
//      file at every size is an acceptable trade-off.
//
// If/when we want to drop the manual variant pipeline, swap the call sites
// to Astro's <Image> component and let Sharp generate variants at build.
// For now this keeps visual parity with the legacy site without forcing
// a 906MB image rebuild.
// ──────────────────────────────────────────────────────────────────────────────

/** True for a fully-qualified http(s) URL (admin-uploaded Supabase image). */
function isAbsolute(path: string): boolean {
  return /^https?:\/\//i.test(path)
}

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
  if (isAbsolute(sourcePath)) return sourcePath
  const { dir, stem } = splitPath(sourcePath)
  return `/${dir}/${stem}-1600.webp`
}

/** Full-resolution srcset for the viewer / lightbox image. */
export function viewerSrcset(sourcePath: string): string {
  // A single absolute candidate with no descriptor is valid srcset (1x).
  if (isAbsolute(sourcePath)) return sourcePath
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
  if (isAbsolute(sourcePath)) return sourcePath
  const { dir, stem } = splitPath(sourcePath)
  return `/${dir}/${stem}-800.webp`
}

export function thumbSrcset(sourcePath: string): string {
  if (isAbsolute(sourcePath)) return sourcePath
  const { dir, stem } = splitPath(sourcePath)
  return [`/${dir}/${stem}-480.webp 480w`, `/${dir}/${stem}-800.webp 800w`].join(', ')
}

/** Tiny 60px archive thumb (the small inline image on /archive rows). */
export function archiveThumbSrc(sourcePath: string): string {
  if (isAbsolute(sourcePath)) return sourcePath
  const { dir, stem } = splitPath(sourcePath)
  return `/${dir}/${stem}-120.webp`
}

export function archiveThumbSrcset(sourcePath: string): string {
  if (isAbsolute(sourcePath)) return sourcePath
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
  if (isAbsolute(sourcePath)) return sourcePath
  return `/${sourcePath}`
}
