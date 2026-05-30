// ──────────────────────────────────────────────────────────────────────────────
// Sort + group helpers, replacing the equivalent functions in the legacy
// script.js. The legacy versions worked on the in-memory `archive` array;
// these work on the `getCollection` output shape ({ id, data, body, … }).
//
// Date parsing: collection schemas store `date` as a string (ISO). We parse
// to Date here at the boundary. Items with unparseable dates sink to the
// bottom of date-desc sorts.
// ──────────────────────────────────────────────────────────────────────────────

type WithDate = { data: { date?: string; year?: number; id?: string } }

function toMs(v: string | undefined): number {
  if (!v) return 0
  const t = new Date(v).getTime()
  return Number.isFinite(t) ? t : 0
}

/** Newest-first by `data.date`. Stable for items without a date (they
 *  cluster at the end in stable input order). */
export function sortByDateDesc<T extends WithDate>(items: T[]): T[] {
  return [...items].sort((a, b) => toMs(b.data.date) - toMs(a.data.date))
}

/** Newest-first by date, with the `_N` suffix on ids as a tiebreaker so
 *  multi-piece days (e.g. "2026-04-20", "2026-04-20_2") render in
 *  index order. Mirrors the legacy script.js sortByDateDescWithIdTiebreak. */
export function sortByDateDescWithIdTiebreak<T extends WithDate>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const d = toMs(b.data.date) - toMs(a.data.date)
    if (d !== 0) return d
    const ix = (s: string | undefined) => {
      const m = String(s ?? '').match(/_(\d+)$/)
      return m ? parseInt(m[1]!, 10) : 0
    }
    return ix(a.data.id) - ix(b.data.id)
  })
}

/** Group by year (descending). Items missing both `year` and a parseable
 *  date land in the 'undated' bucket which sorts last. */
export function groupByYear<T extends WithDate>(items: T[]): Array<{ year: string; items: T[] }> {
  const buckets = new Map<string, T[]>()
  for (const it of items) {
    const y =
      it.data.year ??
      (it.data.date ? new Date(it.data.date).getUTCFullYear() : 'undated')
    const key = String(y)
    const arr = buckets.get(key) ?? []
    arr.push(it)
    buckets.set(key, arr)
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => {
      if (a === 'undated') return 1
      if (b === 'undated') return -1
      return Number(b) - Number(a)
    })
    .map(([year, arr]) => ({ year, items: sortByDateDescWithIdTiebreak(arr) }))
}
