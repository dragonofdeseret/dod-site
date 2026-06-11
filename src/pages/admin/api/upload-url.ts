// ──────────────────────────────────────────────────────────────────────────────
// POST /admin/api/upload-url — return a signed upload URL.
//
// Used for files larger than the Vercel function body limit (~4.5MB on
// Hobby). The browser POSTs JSON describing the target path + bucket,
// the server uses the SERVICE ROLE Supabase client to mint a signed
// upload URL, returns it, and the browser then PUTs the file directly
// to Supabase Storage. The data never traverses our Vercel function,
// so file size is bounded by Supabase Storage limits (~5GB) rather
// than Vercel's request limits.
//
// Auth: same /admin/** middleware that gates every other admin route.
// Signed upload URLs are short-lived (2 hours from creation) and
// single-use, so even if one leaked from the admin's browser it
// couldn't be reused indefinitely.
// ──────────────────────────────────────────────────────────────────────────────

export const prerender = false

import type { APIRoute } from 'astro'
import { getAdminSupabase } from '../../../lib/supabase'

const ALLOWED_BUCKETS = new Set(['art-images', 'photo-images', 'pdf-files'])

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Not authorized' }, 401)
  }

  let body: { bucket?: string; path?: string }
  try {
    body = (await request.json()) as { bucket?: string; path?: string }
  } catch {
    return json({ error: 'Body must be JSON.' }, 400)
  }

  const bucket = String(body.bucket ?? '').trim()
  const path = String(body.path ?? '').trim()
  if (!bucket || !path) {
    return json({ error: 'Missing "bucket" or "path".' }, 400)
  }
  if (!ALLOWED_BUCKETS.has(bucket)) {
    return json({ error: `Bucket "${bucket}" not allowed.` }, 400)
  }

  try {
    const supabase = getAdminSupabase()
    // upsert: true lets the admin re-upload over the same path (e.g.
    // replacing a placeholder image with a final version).
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path, { upsert: true })
    if (error || !data) {
      console.error('[admin/api/upload-url] sign error', error?.message)
      return json({ error: error?.message ?? 'Could not create signed URL.' }, 500)
    }
    // Return both the signed URL (for the PUT) and the eventual public
    // URL (for the form to commit). Browser doesn't have to do the
    // getPublicUrl round-trip itself.
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path)
    return json({
      signedUrl: data.signedUrl,
      token: data.token,
      publicUrl: pub.publicUrl,
    }, 200)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[admin/api/upload-url] threw', msg)
    return json({ error: msg }, 500)
  }
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}
