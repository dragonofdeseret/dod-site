// ──────────────────────────────────────────────────────────────────────────────
// POST /admin/api/save — accept a typed entry payload, serialize to markdown,
// commit to GitHub. Vercel auto-rebuilds on push.
//
// Auth is handled by middleware (the route lives under /admin/**, so the
// auth gate ran before us). The `isNew` flag controls the commit subject
// ("Add" vs "Update").
// ──────────────────────────────────────────────────────────────────────────────

export const prerender = false

import type { APIRoute } from 'astro'
import {
  pathFor,
  SAFE_ID,
  SAFE_ID_HELP,
  saveEntry,
  type AnyPayload,
  type VideoPayload,
} from '../../../lib/save-entry'
import {
  CONFLICT_CHANGED,
  CONFLICT_EXISTS,
  deleteFile,
  FileConflictError,
  readFile,
} from '../../../lib/github-commit'
import { findEntryPath, parseContentFile, videoAssetInUse, type Collection } from '../../../lib/live-content'
import { muxConfigured } from '../../../lib/env'
import { deleteAsset, getAsset, MuxError, MUX_ID, MUX_NOT_CONFIGURED } from '../../../lib/mux'

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Not authorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }
  // basePath/baseSha: the file version the editor loaded from GitHub. When
  // present the save is conditional and refuses to overwrite a newer commit.
  let body: { payload: AnyPayload; isNew: boolean; basePath?: string; baseSha?: string | null }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return new Response(JSON.stringify({ error: 'Body must be JSON' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }
  if (!body?.payload?.type || !body.payload.id) {
    return new Response(
      JSON.stringify({ error: 'payload.type + payload.id required' }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    )
  }
  // A new entry's id becomes a filename and a URL: keep it to safe
  // characters. (Only checked on create, so nothing that already exists is
  // ever locked out of being edited.)
  if (body.isNew && !SAFE_ID.test(String(body.payload.id))) {
    return new Response(JSON.stringify({ error: SAFE_ID_HELP }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }
  // Server-side schema floor — if the client validator was bypassed
  // (older bundle in cache, JS disabled), we still won't commit a
  // markdown file that we know will fail Astro's content-collection
  // validation at build time and kill the next deploy.
  const p = body.payload as {
    type: string
    image?: string
    file?: string
    muxAssetId?: string
    playbackId?: string
  }
  if ((p.type === 'art' || p.type === 'photo') && !p.image?.trim()) {
    return new Response(
      JSON.stringify({
        error:
          'Image required for art/photo entries. Upload a file and wait for the "Upload complete" status before saving.',
      }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    )
  }
  if (p.type === 'writing' && !p.file?.trim()) {
    return new Response(
      JSON.stringify({
        error:
          'PDF required for writing entries. Upload a file and wait for the "Upload complete" status before saving.',
      }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    )
  }
  // Videos: the entry is only useful with the IDs Mux hands back once an
  // upload has finished processing. They also end up inside URLs, so they
  // must look like Mux IDs.
  if (p.type === 'video' && !(MUX_ID.test(p.muxAssetId ?? '') && MUX_ID.test(p.playbackId ?? ''))) {
    return new Response(
      JSON.stringify({
        error:
          'Video required. Choose a video file and wait for the green "Video ready" status before saving.',
      }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    )
  }
  const base =
    typeof body.basePath === 'string' && body.basePath
      ? { path: body.basePath, sha: typeof body.baseSha === 'string' && body.baseSha ? body.baseSha : null }
      : undefined
  const fail = (error: string, status: number) =>
    new Response(JSON.stringify({ error }), { status, headers: { 'content-type': 'application/json' } })
  const id = String(body.payload.id)
  const isNew = Boolean(body.isNew)
  const yearBucketed = ['art', 'photo', 'writing', 'margins', 'video'].includes(p.type)
  // The repo path this save will write, and whether a path is "this entry's
  // file in this collection" (the only kind of file a move may remove).
  const targetPath = pathFor(body.payload)
  const ownFile = (path: string) =>
    path.startsWith(`src/content/${p.type}/`) && path.endsWith(`/${id}.md`) && !path.includes('..')
  try {
    // ── New entry: the id must be free in every year, not just this one ──
    // Two files with one id (say the same title in 2025 and 2026) collide
    // on the public URL and can't be told apart in the admin.
    if (isNew && yearBucketed) {
      let taken: string | null = null
      try {
        taken = await findEntryPath(p.type as Collection, id)
      } catch (err) {
        // Couldn't list the repo; the commit below still refuses to
        // overwrite a file at the same path.
        console.error('[admin save] could not check for an existing id', err)
      }
      if (taken) throw new FileConflictError(CONFLICT_EXISTS)
    }

    // ── Where does the saved version of this entry live right now? ───────
    // Normally the path the editor loaded (base). If the editor opened
    // without reaching GitHub there is no base, so look the entry up here —
    // otherwise a year change would leave a duplicate behind and a video
    // edit couldn't tell whether the file itself changed.
    let prevPath: string | undefined = base?.path
    let previousUnknown = false
    if (!isNew && !prevPath && yearBucketed) {
      try {
        prevPath = (await findEntryPath(p.type as Collection, id)) ?? undefined
      } catch (err) {
        previousUnknown = true
        console.error('[admin save] could not locate the previous version', err)
      }
    }
    const moving = !isNew && !!prevPath && prevPath !== targetPath && ownFile(prevPath)

    // Read the previous version when it matters: for a move (to make sure
    // the editor wasn't stale) and for videos (to know the current file).
    let previous: { content: string; sha: string } | null = null
    if (!isNew && prevPath && (moving || p.type === 'video')) {
      try {
        previous = await readFile(prevPath)
      } catch (err) {
        previousUnknown = true
        console.error('[admin save] could not read the previous version', err)
      }
    }

    // ── A move must pass the same "nothing newer was saved" test ─────────
    // A same-path save is conditional on the SHA the editor loaded. A save
    // that changes the year writes a NEW path, so check the old one here:
    // if it changed since the editor opened (or is gone), stop — otherwise
    // the newer version would be deleted below.
    if (moving && base?.sha && !previousUnknown && (!previous || previous.sha !== base.sha)) {
      throw new FileConflictError(CONFLICT_CHANGED)
    }

    // ── Videos: check the file with Mux before publishing it ──────────────
    // Which Mux asset does the saved version point at? Needed to tell
    // whether the video file itself changed in this save, and (after the
    // commit) to remove a file that has been replaced.
    let previousAssetId: string | undefined
    if (p.type === 'video' && previous) {
      const prevId = parseContentFile(previous.content)?.data.muxAssetId
      if (typeof prevId === 'string' && MUX_ID.test(prevId)) previousAssetId = prevId
    }
    const videoChanged = p.type === 'video' && p.muxAssetId !== previousAssetId
    if (videoChanged) {
      // A new or replaced video file (or one we couldn't compare). Don't
      // trust the form for it: ask Mux that the asset really exists and is
      // playable, and take the playback details from Mux. This also catches
      // a form restored by the browser after its upload was discarded.
      if (!muxConfigured()) return fail(MUX_NOT_CONFIGURED, 503)
      let asset
      try {
        asset = await getAsset(p.muxAssetId!)
      } catch (err) {
        if (err instanceof MuxError && err.status === 404) {
          return fail('That video is no longer at Mux. Choose the video file again and wait for the green "Video ready".', 400)
        }
        console.error('[admin save] could not confirm video with Mux', err)
        return fail(`Couldn't confirm the video with Mux, so nothing was saved. Try again in a moment. (${err instanceof Error ? err.message : String(err)})`, 502)
      }
      if (asset.status !== 'ready' || !asset.playbackId) {
        return fail('Mux is still processing this video. Wait for the green "Video ready", then save.', 400)
      }
      const v = body.payload as VideoPayload
      v.playbackId = asset.playbackId
      if (typeof asset.durationSec === 'number') v.durationSec = asset.durationSec
      if (asset.aspectRatio) v.aspectRatio = asset.aspectRatio
    }

    const result = await saveEntry(body.payload, isNew, base)
    const warnings: string[] = []

    // ── An edit that moved the file (the year changed) ────────────────────
    // The entry was just written at its new path; the copy at the old path
    // is now a stale duplicate with the same id, so remove it — but only if
    // it is still the version the editor loaded.
    if (moving && prevPath && prevPath !== result.path) {
      try {
        await deleteFile({
          path: prevPath,
          message: `Move ${p.type}: ${id}`,
          expectedSha: base?.sha ?? previous?.sha ?? undefined,
        })
      } catch (err) {
        console.error('[admin save] could not remove old copy', prevPath, err)
        warnings.push(`Saved, but the old copy at ${prevPath.replace('src/content/', '')} couldn't be removed, so this entry appears twice in the list. Open the one marked with the old year and delete it.`)
      }
    }
    if (previousUnknown) {
      warnings.push("Saved, but the previous version couldn't be read, so an old copy under another year (or a replaced video file at Mux) may not have been cleaned up.")
    }

    // ── A replaced video file ─────────────────────────────────────────────
    // Remove the old file from Mux so it doesn't keep accruing storage
    // charges — but only once the new one is committed, only if the new one
    // is definitely still there, and never if any other entry still plays
    // the old one (or that can't be checked).
    if (p.type === 'video' && previousAssetId && previousAssetId !== p.muxAssetId) {
      try {
        const replacement = await getAsset(p.muxAssetId!)
        if (replacement.status !== 'ready') throw new Error('replacement is not ready')
        if ((await videoAssetInUse(previousAssetId, result.path)) === 'no') {
          await deleteAsset(previousAssetId)
        } else {
          console.warn('[admin save] replaced Mux asset kept (still referenced or unverifiable)', previousAssetId)
        }
      } catch (err) {
        // The save itself succeeded. Keep the old file: either the new one
        // has gone missing (so the old one is the only copy left) or Mux /
        // GitHub couldn't be reached to make sure.
        console.error('[admin save] replaced Mux asset kept', previousAssetId, err)
        if (err instanceof MuxError && err.status === 404) {
          warnings.push('The new video file is missing at Mux, so this entry will not play. Open it again and upload the video once more. The previous file was kept.')
        }
      }
    }
    return new Response(
      JSON.stringify({ ok: true, ...result, warning: warnings.join(' ') || undefined }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )
  } catch (err) {
    if (err instanceof FileConflictError) {
      return new Response(JSON.stringify({ error: err.message, conflict: true }), {
        status: 409,
        headers: { 'content-type': 'application/json' },
      })
    }
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[admin save] failed', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
