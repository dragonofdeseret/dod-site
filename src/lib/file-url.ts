// ──────────────────────────────────────────────────────────────────────────────
// Resolve a stored media path (e.g. a writing entry's `file`) to a URL.
//
// Three shapes reach here:
//   • Legacy LOCAL paths, relative to public/ ("pdf/AIW.pdf") → "/pdf/AIW.pdf"
//   • Admin-uploaded PDFs in Supabase Storage ("https://<project>.supabase.co/
//     storage/v1/object/public/pdf-files/2026/x.pdf") → "/storage/pdf-files/
//     2026/x.pdf". That route (src/pages/storage/pdf-files/[...path].ts)
//     proxies to Supabase, so the PDF is served from OUR origin. Safari
//     renders cross-origin PDFs in an iframe as
//     a column of tiny thumbnails instead of fitting the page; same-origin
//     PDFs (like the legacy ones) display normally.
//   • Any other absolute URL → returned unchanged. Prefixing "/" would
//     resolve it against our own origin ("/https://…") and 404.
// ──────────────────────────────────────────────────────────────────────────────

const SUPABASE_PDF = /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\/pdf-files\/(.+)$/i

export function fileUrl(path: string): string {
  const pdf = path.match(SUPABASE_PDF)
  if (pdf) return `/storage/pdf-files/${pdf[1]}`
  return /^https?:\/\//i.test(path) ? path : `/${path}`
}
