// ──────────────────────────────────────────────────────────────────────────────
// Astro middleware — auth gate for /admin/**.
//
// Every request flows through here. For admin paths we:
//   1. Read the Supabase session from cookies
//   2. If no session → redirect to /admin/login (carrying the original
//      path as `next=` so login can bounce back to it)
//   3. If the session's email isn't the configured ADMIN_EMAIL →
//      redirect to /admin/login with an error flag (someone else's
//      Supabase user authed; not authorized)
//   4. Otherwise pass through; downstream pages get the session via
//      Astro.locals.session
//
// Public pages skip every check.
// ──────────────────────────────────────────────────────────────────────────────

import { defineMiddleware } from 'astro:middleware'
import { getServerSupabase } from './lib/supabase'
import { getAdminEmail } from './lib/env'

const ADMIN_PREFIX = '/admin'
const LOGIN_PATH = '/admin/login'
const AUTH_CALLBACK_PATH = '/admin/auth-callback'

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, locals, request } = context
  const pathname = url.pathname

  // Non-admin paths: pass through untouched.
  if (!pathname.startsWith(ADMIN_PREFIX)) return next()

  // Login + callback themselves must NOT be auth-gated (chicken/egg).
  if (pathname === LOGIN_PATH || pathname === AUTH_CALLBACK_PATH) {
    return next()
  }

  const supabase = getServerSupabase(cookies, request)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    // Not signed in. Bounce to login, preserving the requested URL so
    // we can return them here after a successful auth.
    const next = encodeURIComponent(pathname + url.search)
    return redirect(`${LOGIN_PATH}?next=${next}`)
  }

  // Single-user lockdown: ADMIN_EMAIL must match the authed account's
  // email. If you ever want multiple admins, swap to an array env var
  // or move the allowlist to the Supabase admin_emails table that
  // setup.sql already creates.
  const adminEmail = getAdminEmail()
  if ((user.email ?? '').toLowerCase() !== adminEmail.toLowerCase()) {
    await supabase.auth.signOut()
    return redirect(`${LOGIN_PATH}?error=not_authorized`)
  }

  // Stash the user on locals so downstream pages don't have to re-fetch.
  locals.user = {
    id: user.id,
    email: user.email ?? '',
  }
  return next()
})
