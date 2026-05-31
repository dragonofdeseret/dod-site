// ──────────────────────────────────────────────────────────────────────────────
// POST /admin/sign-out — clear the session cookie and bounce to login.
// ──────────────────────────────────────────────────────────────────────────────

export const prerender = false

import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../lib/supabase'

export const POST: APIRoute = async ({ cookies, redirect, request }) => {
  const supabase = getServerSupabase(cookies, request)
  await supabase.auth.signOut()
  return redirect('/admin/login')
}
