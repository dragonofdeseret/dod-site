// ──────────────────────────────────────────────────────────────────────────────
// View counts and likes for /tv videos — server side.
//
// The numbers live in Supabase (tables + functions created by
// supabase/video-stats.sql). Everything goes through those functions with
// the service-role client, so the counting rules (once per browser per day,
// one like per browser, an hourly limit per address) are enforced by the
// database, not by this code.
//
// There are no accounts: a visitor is a random id their browser keeps. The
// IP address is never stored. For the hourly limit the database gets a
// keyed one-way hash of it (the key changes every day), kept only in a
// short-lived counter that is cleared within about two hours.
// ──────────────────────────────────────────────────────────────────────────────

import { createHmac } from 'node:crypto'
import { getServiceRoleKey } from './env'
import { getAdminSupabase } from './supabase'

/** New views + likes one address may add per hour (a household or mobile
 *  network can share one address, so this is generous). */
export const HOURLY_LIMIT = 120

/** What a browser's anonymous id looks like (crypto.randomUUID()). */
export const VISITOR_ID = /^[A-Za-z0-9-]{16,64}$/

export interface VideoCounts {
  views: number
  likes: number
  liked: boolean
}

/** The stats database isn't reachable or hasn't been set up yet. */
export class StatsUnavailable extends Error {}

/** One-way, keyed hash of an IP address for the hourly limit. Includes the
 *  UTC date, so the same address hashes differently each day. */
export function ipHash(ip: string): string {
  const day = new Date().toISOString().slice(0, 10)
  return createHmac('sha256', getServiceRoleKey()).update(`video-stats:${day}:${ip}`).digest('hex').slice(0, 32)
}

type Row = { video_id?: string; ok?: boolean; views: number | string; likes: number | string; liked: boolean }
const toCounts = (r: Row): VideoCounts => ({
  views: Number(r.views) || 0,
  likes: Number(r.likes) || 0,
  liked: r.liked === true,
})

async function call(fn: string, args: Record<string, unknown>): Promise<Row[]> {
  const { data, error } = await getAdminSupabase().rpc(fn, args)
  if (error) {
    // e.g. PGRST202 (function not found) before the setup script was run.
    console.error(`[video-stats] ${fn} failed`, error.code, error.message)
    throw new StatsUnavailable(error.message)
  }
  return (Array.isArray(data) ? data : []) as Row[]
}

/** Counts for several videos, and whether `viewer` liked each one. */
export async function countsFor(ids: string[], viewer: string | null): Promise<Record<string, VideoCounts>> {
  if (ids.length === 0) return {}
  const rows = await call('video_counts', { ids, viewer })
  return Object.fromEntries(rows.map((r) => [String(r.video_id), toCounts(r)]))
}

/** Count a view. `ok` is false if the address is over its hourly limit. */
export async function recordView(
  id: string,
  visitor: string,
  hash: string,
): Promise<{ ok: boolean; counts: VideoCounts }> {
  const [row] = await call('record_video_view', {
    p_video: id,
    p_visitor: visitor,
    p_ip_hash: hash,
    p_limit: HOURLY_LIMIT,
  })
  if (!row) throw new StatsUnavailable('no result')
  return { ok: row.ok === true, counts: toCounts(row) }
}

/** Like or un-like. `ok` is false if a new like is over the hourly limit. */
export async function setLike(
  id: string,
  visitor: string,
  hash: string,
  like: boolean,
): Promise<{ ok: boolean; counts: VideoCounts }> {
  const [row] = await call('set_video_like', {
    p_video: id,
    p_visitor: visitor,
    p_ip_hash: hash,
    p_like: like,
    p_limit: HOURLY_LIMIT,
  })
  if (!row) throw new StatsUnavailable('no result')
  return { ok: row.ok === true, counts: toCounts(row) }
}
