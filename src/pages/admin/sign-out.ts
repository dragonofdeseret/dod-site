// ──────────────────────────────────────────────────────────────────────────────
// POST /admin/sign-out — clear the session cookie and bounce to login.
// ──────────────────────────────────────────────────────────────────────────────

export const prerender = false

import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../lib/supabase'

export const POST: APIRoute = async ({ cookies, redirect, request }) => {
  const supabase = getServerSupabase(cookies, request)
  await supabase.auth.signOut()
  // Tear down the presence cookie too so the public site stops
  // showing Edit pills after sign-out.
  cookies.delete('cs-admin-present', { path: '/' })
  return redirect('/admin/login')
}
