# christophershenefelt.com

Personal site: archive of essays, art, and photography. Astro app deployed
to Vercel. Custom admin at `/admin` backed by Supabase (auth + media
storage) and GitHub (content as markdown in git).

## Architecture at a glance

```
Public pages (static, prerendered at deploy time)
  /              minimal homepage
  /archive       chronological index
  /art, /art/[id]            gallery + viewer
  /photography, /photography/[id]
  /writing, /writing/[id]    essay list + PDF viewer
  /altered-states, /altered-states/[id]   trip reports
  /margins, /quotes
  /now, /bio, /guestbook, /questions, /exhibits
  /rss.xml, /sitemap-index.xml

Admin (SSR, auth-gated, single user)
  /admin                     dashboard
  /admin/login               magic-link sign-in
  /admin/[collection]        list view
  /admin/[collection]/[id]   edit view (or "new" for create)
  /admin/api/save            commits markdown to GitHub
  /admin/api/delete          deletes markdown from GitHub
```

The public site is fully static — Vercel serves prerendered HTML. The
admin is a small SSR surface that talks to Supabase (auth + media
storage) and GitHub (content writes via REST API).

## Local dev

```bash
npm install
cp .env.example .env       # fill in values — see Deployment below
npm run dev                # http://localhost:4321
```

The admin needs the env vars set OR it errors at boot (intentional —
missing env vars are loud, not silent).

Migrating from a fresh archive.js dump:

```bash
npm run migrate            # re-runs scripts/migrate-archive.mjs
```

Idempotent; overwrites the markdown collection files.

## Adding new content (day-to-day)

### Browser admin (recommended)

1. Visit https://christophershenefelt.com/admin/login
2. Email your `ADMIN_EMAIL` address → click the magic-link in email
3. Pick a collection (Artwork, Photography, Writing, Margins, Quotes)
4. **New** → fill in fields → drop in image/PDF → **Publish**
5. The image uploads to Supabase Storage; the markdown commits to git;
   Vercel rebuilds within ~60s.

### Direct git edit (always works)

Drop a markdown file into `src/content/<type>/<year>/<id>.md`. Frontmatter
shape: see existing entries. Commit + push, Vercel rebuilds.

## Deployment (one-time setup)

### 1. Supabase project

1. Create a new project at https://supabase.com
2. SQL editor → paste + run `supabase/setup.sql` from this repo
3. **Edit `setup.sql` first**: uncomment the `insert into admin_emails`
   line near the top and set your email
4. Auth → URL Configuration: add `https://christophershenefelt.com/admin/auth-callback`
   to the Redirect URLs allowlist (and `http://localhost:4321/admin/auth-callback`
   for local dev)
5. From Project Settings → API, copy:
   - `Project URL` → `PUBLIC_SUPABASE_URL`
   - `anon public` key → `PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. GitHub PAT

1. https://github.com/settings/personal-access-tokens/new
2. Fine-grained, repo-scoped to `dragonofdeseret/christophershenefelt-site`
3. Permissions: **Contents: Read and write**
4. Generate, copy → `GITHUB_TOKEN`

### 3. Vercel project

1. Import the GitHub repo at https://vercel.com/new
2. Framework preset: **Astro** (auto-detected)
3. Environment Variables → add all six from `.env.example`
   (PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
   GITHUB_TOKEN, GITHUB_REPO, ADMIN_EMAIL)
4. Deploy. Confirm `https://<your-project>.vercel.app/` works
5. Domains → add `christophershenefelt.com` + `www.christophershenefelt.com`
6. Switch DNS: in your registrar, point the A/CNAME records to Vercel's
   `cname.vercel-dns.com` (Vercel surfaces the exact value in the
   Domains panel)

### 4. Cut over from the old setup

Push the new project to the `main` branch of the existing repo (replaces
the old static-HTML setup). Vercel picks up the push, rebuilds, the live
site updates.

```bash
git checkout -b backup-legacy
git push origin backup-legacy   # safety branch
git checkout main
# Copy this project's contents into the repo root, preserving .git.
# Then:
git add -A
git commit -m "Migrate to Astro + Supabase + Vercel"
git push origin main
```

Once Vercel reports the deploy as healthy, disable the legacy GitHub Pages
build (Settings → Pages → Source = "None").

## Project shape

```
src/
  content/                    archive entries as markdown collections
  content.config.ts           Zod schemas
  layouts/
    BaseLayout.astro          public-page chrome
    AdminLayout.astro         admin chrome
  components/Sidebar.astro    single nav definition
  pages/
    *.astro                   public pages
    admin/                    SSR admin
    admin/api/                JSON endpoints (save, delete)
  scripts/                    client TS (lightbox, filters, admin-editor, …)
  lib/                        server helpers (supabase, github-commit, env, …)
  styles/global.css           ported from legacy site
  styles/admin.css            admin chrome
  middleware.ts               auth gate for /admin/**
supabase/setup.sql            Storage buckets + RLS
scripts/migrate-archive.mjs   one-shot importer from legacy archive.js
public/                       static assets (favicon, robots, sitemap)
public/images, public/pdf     legacy media (symlinks to ../christophershenefelt-site)
```

## iCloud-Drive setup note

`node_modules/` is symlinked to `node_modules.nosync/` to keep iCloud Drive
from trying to sync ~150MB of dependencies. If `npm install` ever creates
a real `node_modules/` (not a symlink):

```bash
rm -rf node_modules
mkdir node_modules.nosync
ln -s node_modules.nosync node_modules
npm install
```
