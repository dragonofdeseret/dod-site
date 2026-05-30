// ──────────────────────────────────────────────────────────────────────────────
// POST /admin/api/delete — remove a markdown file from the repo. Single
// commit per delete. Doesn't touch any media in Supabase Storage — orphan
// cleanup is a separate concern (a periodic sweep across the buckets vs.
// referenced URLs in markdown).
// ──────────────────────────────────────────────────────────────────────────────

export const prerender = false

import type { APIRoute } from 'astro'
import { deleteFile } from '../../../lib/github-commit'

interface Body {
  collection: 'art' | 'photo' | 'writing' | 'margins' | 'quotes'
  id: string
  year?: number
}

function pathFor(b: Body): string {
  if (b.collection === 'quotes') return `src/content/quotes/${b.id}.md`
  if (!b.year) throw new Error('year required for non-quote collections')
  return `src/content/${b.collection}/${b.year}/${b.id}.md`
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Not authorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return new Response(JSON.stringify({ error: 'Body must be JSON' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }
  try {
    const path = pathFor(body)
    const { commitSha } = await deleteFile({
      path,
      message: `Delete ${body.collection}: ${body.id}`,
    })
    return new Response(JSON.stringify({ ok: true, path, commitSha }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[admin delete] failed', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
