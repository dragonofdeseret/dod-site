// ──────────────────────────────────────────────────────────────────────────────
// GitHub content commit helper — used by the admin "Save" handler to
// commit a markdown file change back to the repo.
//
// The flow:
//   1. Get the current file SHA on the branch (if it exists). GitHub
//      requires the SHA on update so we don't blindly clobber concurrent
//      edits.
//   2. PUT contents/<path> with the new content + commit message.
//
// Single-file commit per save — the Octokit REST API doesn't expose
// multi-file commits except via the lower-level git database API. For
// our shape (one markdown per save) the simpler REST flow is fine.
//
// Vercel auto-rebuilds on push, so a successful commit here means the
// live site updates within ~60s.
// ──────────────────────────────────────────────────────────────────────────────

import { Octokit } from '@octokit/rest'
import { getGithubRepo, getGithubToken } from './env'

let cached: Octokit | null = null
function client(): Octokit {
  if (!cached) cached = new Octokit({ auth: getGithubToken() })
  return cached
}

/**
 * Commit a single file to the repo. `path` is repo-relative
 * (e.g. "src/content/art/2026/2026-05-03.md"). `content` is the raw
 * file body as a UTF-8 string; we base64 it for the API. `message` is
 * the commit subject — keep it terse + meaningful.
 *
 * Returns the new commit SHA + content SHA for the file. Callers
 * usually don't need these but they're handy for chained operations.
 */
export async function commitFile(args: {
  path: string
  content: string
  message: string
}): Promise<{ commitSha: string; contentSha: string }> {
  const { owner, repo, branch } = getGithubRepo()
  const gh = client()

  // Look up the current SHA so an update goes through; a fresh path
  // returns 404 which we treat as "no SHA, this is a create."
  let existingSha: string | undefined
  try {
    const existing = await gh.repos.getContent({
      owner,
      repo,
      path: args.path,
      ref: branch,
    })
    // getContent returns either a single file or an array (for dirs).
    // We only ever request file paths here, so single-file is expected.
    if (!Array.isArray(existing.data) && 'sha' in existing.data) {
      existingSha = existing.data.sha
    }
  } catch (err: unknown) {
    // 404 is fine — it just means we're creating, not updating.
    const status = (err as { status?: number })?.status
    if (status !== 404) throw err
  }

  // Base64-encode content. Buffer is available in Node runtimes (Vercel
  // serverless functions); for edge runtimes we'd swap to TextEncoder
  // + btoa.
  const encoded = Buffer.from(args.content, 'utf8').toString('base64')

  const result = await gh.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: args.path,
    branch,
    message: args.message,
    content: encoded,
    sha: existingSha,
  })

  return {
    commitSha: result.data.commit.sha ?? '',
    contentSha: result.data.content?.sha ?? '',
  }
}

/**
 * Delete a single file from the repo. Same flow — needs the file's
 * current SHA.
 */
export async function deleteFile(args: {
  path: string
  message: string
}): Promise<{ commitSha: string }> {
  const { owner, repo, branch } = getGithubRepo()
  const gh = client()

  const existing = await gh.repos.getContent({
    owner,
    repo,
    path: args.path,
    ref: branch,
  })
  if (Array.isArray(existing.data) || !('sha' in existing.data)) {
    throw new Error(`Cannot delete: ${args.path} isn't a file`)
  }

  const result = await gh.repos.deleteFile({
    owner,
    repo,
    path: args.path,
    branch,
    message: args.message,
    sha: existing.data.sha,
  })
  return { commitSha: result.data.commit.sha ?? '' }
}
