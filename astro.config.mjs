// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'

// https://astro.build/config
export default defineConfig({
  // Canonical domain is dragonofdeseret.com — christophershenefelt.com
  // becomes the redirect alias at the DNS layer (GoDaddy forwarding +
  // Vercel custom-domain config). Affects every absolute URL emitted
  // by the build: sitemap, RSS, OG tags, canonical link tags.
  site: 'https://dragonofdeseret.com',
  // Server output → Astro emits a Vercel serverless function for
  // dynamic routes, but every page still defaults to prerendered
  // (HTML built at deploy time). Routes opt INTO SSR via
  // `export const prerender = false` — currently just /admin/**.
  output: 'server',
  adapter: vercel({
    // Web Analytics ships with Vercel — disable if you don't want it.
    webAnalytics: { enabled: false },
    // Image optimization via Vercel's edge service. Cheaper than
    // running Sharp on every cold-start, and keeps the legacy
    // responsive variants un-touched.
    imageService: true,
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
})
