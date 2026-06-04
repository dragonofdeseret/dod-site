// ──────────────────────────────────────────────────────────────────────────────
// Server-side env-var accessors with friendly error messages.
//
// Astro reads env vars from .env (local dev) and from Vercel project
// settings (deploy). This wrapper centralizes the required-var checks
// so a missing value fails at boot with a clear message instead of a
// generic "undefined is not a function" deeper in the stack.
// ──────────────────────────────────────────────────────────────────────────────

function required(name: string): string {
  const value = import.meta.env[name] ?? process.env[name]
  if (!value) {
    throw new Error(
      `Missing env var ${name}. Set it in .env (local) or Vercel project settings (deploy).`,
    )
  }
  return String(value)
}

function optional(name: string): string | undefined {
  const value = import.meta.env[name] ?? process.env[name]
  return value ? String(value) : undefined
}

// ── Public (safe to expose to browser) ──────────────────────────────────────
//
// These are read by the browser-side Supabase client and prefixed
// PUBLIC_ so Astro/Vite includes them in the client bundle.

export const SUPABASE_URL = required('PUBLIC_SUPABASE_URL')
export const SUPABASE_ANON_KEY = required('PUBLIC_SUPABASE_ANON_KEY')

// ── Server-only (never sent to browser) ─────────────────────────────────────
//
// Used by API routes only. Accessing these from a .astro page that
// also renders client code is fine because the call sites are inside
// `export const prerender = false` server routes.

export function getServiceRoleKey(): string {
  return required('SUPABASE_SERVICE_ROLE_KEY')
}

export function getGithubToken(): string {
  return required('GITHUB_TOKEN')
}

export function getGithubRepo(): { owner: string; repo: string; branch: string } {
  const raw = required('GITHUB_REPO') // e.g. "dragonofdeseret/christophershenefelt-site"
  const [owner, repo] = raw.split('/')
  if (!owner || !repo) {
    throw new Error(
      `GITHUB_REPO must be "owner/repo" (got "${raw}")`,
    )
  }
  return {
    owner,
    repo,
    branch: optional('GITHUB_BRANCH') ?? 'main',
  }
}

export function getAdminEmail(): string {
  return required('ADMIN_EMAIL')
}

// ── Stripe (commerce) ─────────────────────────────────────────────────────
// STRIPE_SECRET_KEY is sk_test_… or sk_live_… — used by both the checkout
// route and the webhook handler. STRIPE_WEBHOOK_SECRET (whsec_…) is the
// signing secret for the configured webhook endpoint and verifies that
// incoming events actually came from Stripe.

export function getStripeSecret(): string {
  return required('STRIPE_SECRET_KEY')
}

export function getStripeWebhookSecret(): string {
  return required('STRIPE_WEBHOOK_SECRET')
}

// ── Resend (transactional email) ───────────────────────────────────────────
// Used for order-confirmation emails after a successful purchase. Same
// account already used as the Supabase auth SMTP relay; the API key here
// is a Resend-side key (re_…), not the SMTP password.

export function getResendKey(): string {
  return required('RESEND_API_KEY')
}

export function getResendFrom(): string {
  // Optional override; default to the auth sender domain.
  return optional('RESEND_FROM') ?? 'orders@dragonofdeseret.com'
}
