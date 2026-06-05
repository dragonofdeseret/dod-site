// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'

// https://astro.build/config
export default defineConfig({
  // Canonical domain is www.dragonofdeseret.com — that's the one set as
  // Production in Vercel; everything else (apex, christophershenefelt
  // both forms) 30x's to it. Affects every absolute URL emitted by the
  // build: sitemap, RSS, OG tags, canonical link tags. Matching Vercel's
  // canonical exactly prevents search engines from indexing the
  // redirected variants and keeps social cards on one URL family.
  site: 'https://www.dragonofdeseret.com',
  // Server output → Astro emits a Vercel serverless function for
  // dynamic routes, but every page still defaults to prerendered
  // (HTML built at deploy time). Routes opt INTO SSR via
  // `export const prerender = false` — currently just /admin/**.
  output: 'server',
  adapter: vercel({
    // Web Analytics ships with Vercel — disable if you don't want it.
    webAnalytics: { enabled: false },
    // Image service intentionally OFF: in some Vercel x Astro setups
    // it confuses the function bundler and produces an unloadable
    // serverless function. Legacy responsive variants are pre-baked
    // as static files anyway; we don't need Vercel-side optimization.
    imageService: false,
  }),
  integrations: [
    sitemap({
      // Don't list admin routes in the sitemap.
      filter: (page) => !page.includes('/admin'),
    }),
  ],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  build: {
    inlineStylesheets: 'auto',
  },
  // Disable Astro's strict origin check for POST forms. The default
  // (`checkOrigin: true`) is fine in local dev but rejects legitimate
  // same-site POSTs on Vercel's preview URLs because of how their edge
  // network forwards Origin headers. Our admin POST endpoints are
  // already gated by Supabase auth + the middleware, so dropping this
  // narrowly-targeted check doesn't expose anything.
  security: {
    checkOrigin: false,
  },
})
