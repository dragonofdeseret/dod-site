/// <reference types="astro/client" />

// ──────────────────────────────────────────────────────────────────────────────
// Astro.locals shape — populated by middleware. Pages read it via
// `const { user } = Astro.locals`.
// ──────────────────────────────────────────────────────────────────────────────

declare namespace App {
  interface Locals {
    user?: {
      id: string
      email: string
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// import.meta.env typing for project-specific env vars. Adding entries
// here gives autocomplete + typecheck on `import.meta.env.X`.
// ──────────────────────────────────────────────────────────────────────────────

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string
  readonly PUBLIC_SUPABASE_ANON_KEY: string
  readonly SUPABASE_SERVICE_ROLE_KEY: string
  readonly GITHUB_TOKEN: string
  readonly GITHUB_REPO: string
  readonly GITHUB_BRANCH?: string
  readonly ADMIN_EMAIL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
