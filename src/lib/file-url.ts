// ──────────────────────────────────────────────────────────────────────────────
// Resolve a stored media path (e.g. a writing entry's `file`) to a URL.
//
// Two shapes reach here:
//   • Legacy LOCAL paths, relative to public/ ("pdf/AIW.pdf") → "/pdf/AIW.pdf"
//   • Admin-uploaded ABSOLUTE Supabase Storage URLs ("https://…/x.pdf") →
//     returned unchanged. Prefixing "/" would resolve them against our own
//     origin ("/https://…") and 404.
// ──────────────────────────────────────────────────────────────────────────────

export function fileUrl(path: string): string {
  return /^https?:\/\//i.test(path) ? path : `/${path}`
}
