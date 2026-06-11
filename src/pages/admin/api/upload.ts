// ──────────────────────────────────────────────────────────────────────────────
// POST /admin/api/upload — server-side media upload proxy.
//
// The browser POSTs a multipart form here with { file, bucket, path }. The
// route uses the SERVICE ROLE Supabase client (bypassing RLS entirely) to
// write to Supabase Storage, then returns the public URL.
//
// Why server-side instead of direct browser→Supabase:
//   • Auth is taken care of by the existing /admin/** middleware — if we
//     got here, the user is the authenticated admin. No browser-side
//     Supabase session juggling required.
//   • iOS Safari's Intelligent Tracking Prevention silently breaks
//     browser-side @supabase/ssr session persistence in some
//     configurations. Server-side route sidesteps every browser quirk.
//   • The upload now works identically on every browser.
//
// Vercel function body limits: Hobby plan is 4.5MB for traditional
// serverless. Most photos after the client-side resize fit comfortably
// under this. PDFs and large unresized assets may bump against it.
// ──────────────────────────────────────────────────────────────────────────────

export const prerender = false

import type { APIRoute } from 'astro'
import { getAdminSupabase } from '../../../lib/supabase'

// Whitelist of storage buckets that can be written through this proxy.
// Keeps the endpoint from being weaponized to write to arbitrary buckets
// if the request body is tampered with in transit.
const ALLOWED_BUCKETS = new Set(['art-images', 'photo-images', 'pdf-files'])

export const POST: APIRoute = async ({ request, locals }) => {
  // Middleware already gates /admin/** behind auth. Belt-and-suspenders
  // check that locals.user exists — should always be set when this runs.
  if (!locals.user) {
    return json({ error: 'Not authorized' }, 401)
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return json({ error: 'Body must be multipart/form-data.' }, 400)
  }

  const file = formData.get('file')
  const bucket = String(formData.get('bucket') ?? '').trim()
  const path = String(formData.get('path') ?? '').trim()

  if (!(file instanceof File)) {
    return json({ error: 'No file in form data (field name "file").' }, 400)
  }
  if (!bucket || !path) {
    return json({ error: 'Missing required field "bucket" or "path".' }, 400)
  }
  if (!ALLOWED_BUCKETS.has(bucket)) {
    return json({ error: `Bucket "${bucket}" not allowed.` }, 400)
  }

  try {
    // Service-role client bypasses RLS. Authentication is already
    // enforced upstream by the middleware that let us reach this route.
    const supabase = getAdminSupabase()
    // Pass the File object directly; Supabase SDK handles the stream.
    // contentType is read from the File.type the browser provides.
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: true,
      cacheControl: '31536000', // 1 year — paths are content-addressed by id
    })
    if (error) {
      console.error('[admin/api/upload] storage error:', error.message)
      return json({ error: error.message }, 500)
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return json({ url: data.publicUrl }, 200)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[admin/api/upload] threw', msg)
    return json({ error: msg }, 500)
  }
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}
