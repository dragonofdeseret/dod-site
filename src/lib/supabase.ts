// ──────────────────────────────────────────────────────────────────────────────
// Supabase client factories.
//
// `getServerSupabase(context)` — read/write the user's session via cookies.
//   Use inside .astro frontmatter or API routes. The auth cookies stay
//   in sync between requests because @supabase/ssr's createServerClient
//   handles refresh tokens.
//
// `getBrowserSupabase()` — client-side singleton for the admin login
//   form. Reads the anon key, no service role.
//
// `getAdminSupabase()` — service-role client for privileged writes
//   (e.g. confirming an upload from a trusted server route). Bypasses
//   RLS; never expose to the browser.
// ──────────────────────────────────────────────────────────────────────────────

import {
  createBrowserClient,
  createServerClient,
  type CookieOptionsWithName,
} from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { AstroCookies } from 'astro'

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  getServiceRoleKey,
} from './env'

// Cookie config — shared between request/response handlers so the
// admin session survives navigation. `name` is the prefix; @supabase/ssr
// splits the token across `<name>.0` and `<name>.1` automatically.
const COOKIE_OPTIONS: CookieOptionsWithName = {
  name: 'cs-archive-auth',
  // 7-day session. Admin only — no public exposure.
  maxAge: 60 * 60 * 24 * 7,
  sameSite: 'lax',
  // Astro dev serves over plain HTTP; relax `secure` in dev so the
  // cookie still saves. Vercel deploys serve over HTTPS so it'll
  // upgrade automatically.
  secure: import.meta.env.PROD,
  httpOnly: true,
  path: '/',
}

/**
 * Server-side Supabase client bound to the current request's cookies.
 * Read sessions, sign in, sign out — all session state flows through
 * the cookie jar this client mutates.
 */
export function getServerSupabase(cookies: AstroCookies): SupabaseClient {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookieOptions: COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return cookies.getAll().map((c) => ({ name: c.name, value: c.value }))
      },
      setAll(toSet) {
        for (const { name, value, options } of toSet) {
          cookies.set(name, value, options)
        }
      },
    },
  })
}

let browserSingleton: SupabaseClient | null = null

/**
 * Browser-side singleton. Only used by the admin login form (small
 * piece of client JS in src/pages/admin/login.astro). Anywhere else
 * in the admin, prefer server-side reads via getServerSupabase().
 */
export function getBrowserSupabase(): SupabaseClient {
  if (browserSingleton) return browserSingleton
  browserSingleton = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookieOptions: COOKIE_OPTIONS,
  })
  return browserSingleton
}

/**
 * Service-role client. RLS-bypassing — used by trusted server routes
 * to do administrative writes (e.g. confirming a freshly-uploaded
 * media file's metadata). Never share with the browser.
 */
export function getAdminSupabase(): SupabaseClient {
  return createClient(SUPABASE_URL, getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
