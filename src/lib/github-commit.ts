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
 * Thrown when a write is refused because the file on the branch is no
 * longer the version the editor was based on (someone — usually the same
 * admin in another tab, or a save made before the site rebuilt — committed
 * a newer version in between). Callers should tell the user to reload
 * rather than overwrite.
 */
export class FileConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FileConflictError'
  }
}

/**
 * Read a file's current content + blob SHA from the branch. Returns null
 * if the file doesn't exist. This is the source of truth for the admin
 * editor — the content baked into the deployed build can lag behind the
 * repo until Vercel finishes rebuilding.
 */
export async function readFile(
  path: string,
  signal?: AbortSignal,
): Promise<{ content: string; sha: string } | null> {
  const { owner, repo, branch } = getGithubRepo()
  try {
    const res = await client().repos.getContent({ owner, repo, path, ref: branch, request: { signal } })
    if (Array.isArray(res.data) || !('content' in res.data)) return null
    return {
      content: Buffer.from(res.data.content, 'base64').toString('utf8'),
      sha: res.data.sha,
    }
  } catch (err: unknown) {
    if ((err as { status?: number })?.status === 404) return null
    throw err
  }
}

/**
 * Every markdown file under src/content on the branch, as repo-relative
 * path → blob SHA. Two API calls regardless of how many entries exist:
 * list `src` to get the `content` tree's SHA, then read that tree
 * recursively. (The repo root tree is avoided on purpose: public/ holds
 * thousands of image variants.)
 */
export async function listContentTree(signal?: AbortSignal): Promise<Map<string, string>> {
  const { owner, repo, branch } = getGithubRepo()
  const gh = client()
  const src = await gh.repos.getContent({ owner, repo, path: 'src', ref: branch, request: { signal } })
  if (!Array.isArray(src.data)) throw new Error('src is not a directory')
  const contentDir = src.data.find((e) => e.name === 'content' && e.type === 'dir')
  if (!contentDir) throw new Error('src/content not found on branch')
  const tree = await gh.git.getTree({ owner, repo, tree_sha: contentDir.sha, recursive: 'true', request: { signal } })
  if (tree.data.truncated) throw new Error('src/content tree listing was truncated')
  const out = new Map<string, string>()
  for (const item of tree.data.tree) {
    if (item.type === 'blob' && item.path?.endsWith('.md') && item.sha) {
      out.set(`src/content/${item.path}`, item.sha)
    }
  }
  return out
}

/**
 * Commit a single file to the repo. `path` is repo-relative
 * (e.g. "src/content/art/2026/2026-05-03.md"). `content` is the raw
 * file body as a UTF-8 string; we base64 it for the API. `message` is
 * the commit subject — keep it terse + meaningful.
 *
 * `expectedSha` makes the write conditional (optimistic concurrency):
 *   • a string — the blob SHA the caller's edit was based on. GitHub
 *     rejects the write if the file has changed since, and we throw
 *     FileConflictError instead of silently overwriting the newer version.
 *   • null — the file must NOT exist yet (creating a new entry); an
 *     existing file with the same path raises FileConflictError.
 *   • undefined — unconditional: write over whatever is there (the old
 *     behaviour; used when the caller has no base version to compare).
 *
 * Returns the new commit SHA + content SHA for the file.
 */
export async function commitFile(args: {
  path: string
  content: string
  message: string
  expectedSha?: string | null
}): Promise<{ commitSha: string; contentSha: string }> {
  const { owner, repo, branch } = getGithubRepo()
  const gh = client()

  let sha: string | undefined
  if (args.expectedSha === undefined) {
    // Unconditional write: look up the current SHA so an update goes
    // through; a fresh path returns 404, which means "create".
    try {
      const existing = await gh.repos.getContent({
        owner,
        repo,
        path: args.path,
        ref: branch,
      })
      if (!Array.isArray(existing.data) && 'sha' in existing.data) {
        sha = existing.data.sha
      }
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status !== 404) throw err
    }
  } else {
    sha = args.expectedSha ?? undefined
  }

  // Base64-encode content. Buffer is available in Node runtimes (Vercel
  // serverless functions); for edge runtimes we'd swap to TextEncoder
  // + btoa.
  const encoded = Buffer.from(args.content, 'utf8').toString('base64')

  try {
    const result = await gh.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: args.path,
      branch,
      message: args.message,
      content: encoded,
      sha,
    })
    return {
      commitSha: result.data.commit.sha ?? '',
      contentSha: result.data.content?.sha ?? '',
    }
  } catch (err: unknown) {
    // GitHub answers a stale SHA with 409, and a create over an existing
    // file (no SHA supplied) or an update of a missing file with 422.
    const status = (err as { status?: number })?.status
    if (args.expectedSha !== undefined && (status === 409 || status === 422)) {
      throw new FileConflictError(
        args.expectedSha === null
          ? 'An entry with this ID already exists. Choose a different ID, or edit the existing entry.'
          : 'This entry was changed since you opened it (for example, saved from another tab). Your save was NOT applied, so nothing was overwritten. Reload the editor to get the latest version, then make your change again.',
      )
    }
    throw err
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
