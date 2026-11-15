// ──────────────────────────────────────────────────────────────────────────────
// View counts and likes on /tv pages — browser side.
//
// Markup it looks for (all hidden until numbers arrive, so a page never
// shows misleading zeros if the stats service is unavailable):
//   [data-views-for="<id>"]        "1.2K views" (data-views-format="full" →
//                                   "1,234 views")
//   button[data-like="<id>"]       like toggle; contains [data-likes]
//   mux-player[data-count-views="<id>"]  counts a view when playback starts
//
// No accounts: this browser gets a random id, kept in localStorage. A view
// is sent at most once per video per day (the server enforces the same).
// ──────────────────────────────────────────────────────────────────────────────

interface Counts {
  views: number
  likes: number
  liked: boolean
}

const VISITOR_KEY = 'dod:visitor'
let memoryVisitor: string | null = null

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** This browser's anonymous id (created on first use). */
function visitorId(): string {
  try {
    let v = localStorage.getItem(VISITOR_KEY)
    if (!v || !/^[A-Za-z0-9-]{16,64}$/.test(v)) {
      v = newId()
      localStorage.setItem(VISITOR_KEY, v)
    }
    return v
  } catch {
    // Storage blocked (e.g. some private modes): still works for this page.
    return (memoryVisitor ??= newId())
  }
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const full = new Intl.NumberFormat('en')
const viewsText = (n: number, format: string | undefined) =>
  `${format === 'full' ? full.format(n) : compact.format(n)} ${n === 1 ? 'view' : 'views'}`

function showViews(id: string, views: number): void {
  document.querySelectorAll<HTMLElement>(`[data-views-for="${CSS.escape(id)}"]`).forEach((el) => {
    el.textContent = viewsText(views, el.dataset.viewsFormat)
    el.hidden = false
  })
}

function showLike(id: string, likes: number, liked: boolean): void {
  document.querySelectorAll<HTMLButtonElement>(`button[data-like="${CSS.escape(id)}"]`).forEach((btn) => {
    btn.setAttribute('aria-pressed', String(liked))
    const n = btn.querySelector<HTMLElement>('[data-likes]')
    if (n) n.textContent = full.format(likes)
    btn.dataset.likeCount = String(likes)
    // The name stays "Like"; aria-pressed says whether it's liked.
    btn.setAttribute('aria-label', `Like this video (${full.format(likes)} ${likes === 1 ? 'like' : 'likes'})`)
    btn.hidden = false
  })
}

/** Videos whose view count was already updated by a counted view. */
const viewShown = new Set<string>()

function show(id: string, c: Counts): void {
  showViews(id, c.views)
  showLike(id, c.likes, c.liked)
}

async function post(action: 'view' | 'like' | 'unlike', id: string): Promise<{ ok: boolean; counts: Counts } | null> {
  try {
    const res = await fetch('/api/video-stats', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action, id, visitor: visitorId() }),
    })
    const data = (await res.json()) as { available?: boolean; ok?: boolean; counts?: Counts }
    if (!res.ok || !data.available || !data.counts) return null
    return { ok: data.ok === true, counts: data.counts }
  } catch {
    return null
  }
}

/** Today's date in UTC — the server counts views per UTC day. */
const today = () => new Date().toISOString().slice(0, 10)

function countViewOnPlay(player: HTMLElement): void {
  const id = player.dataset.countViews
  if (!id) return
  const key = `dod:viewed:${id}`
  let sent = false
  const onPlaying = async () => {
    if (sent) return
    try {
      if (localStorage.getItem(key) === today()) {
        sent = true
        return
      }
    } catch {
      /* no storage: the server still counts it once per day */
    }
    sent = true
    const r = await post('view', id)
    if (!r) {
      sent = false // try again on the next play
      return
    }
    // Only the view count: the like button belongs to its own handler.
    viewShown.add(id)
    showViews(id, r.counts.views)
    try {
      localStorage.setItem(key, today())
    } catch {
      /* fine */
    }
  }
  player.addEventListener('playing', onPlaying)
  // Already playing by the time this ran: count it now.
  if ((player as unknown as { paused?: boolean }).paused === false) void onPlaying()
}

function wireLike(btn: HTMLButtonElement): void {
  const id = btn.dataset.like
  if (!id) return
  let busy = false
  btn.addEventListener('click', async () => {
    if (busy) return
    busy = true
    const wasLiked = btn.getAttribute('aria-pressed') === 'true'
    const before = Number(btn.dataset.likeCount) || 0
    // Show the change straight away; the server's answer then corrects it.
    showLike(id, Math.max(0, before + (wasLiked ? -1 : 1)), !wasLiked)
    btn.setAttribute('aria-busy', 'true')
    const r = await post(wasLiked ? 'unlike' : 'like', id)
    btn.removeAttribute('aria-busy')
    busy = false
    if (r && (r.ok || wasLiked)) {
      show(id, r.counts)
      return
    }
    // Couldn't save (or too many likes from this network just now): put
    // it back as it was.
    showLike(id, r ? r.counts.likes : before, r ? r.counts.liked : wasLiked)
  })
}

async function init(): Promise<void> {
  // Count views from the start, not after the counts have loaded: a visitor
  // may press play straight away. (Nothing is shown if stats are off.)
  document.querySelectorAll<HTMLElement>('[data-count-views]').forEach(countViewOnPlay)

  const ids = new Set<string>()
  document.querySelectorAll<HTMLElement>('[data-views-for]').forEach((el) => ids.add(el.dataset.viewsFor ?? ''))
  document.querySelectorAll<HTMLElement>('button[data-like]').forEach((el) => ids.add(el.dataset.like ?? ''))
  ids.delete('')
  if (ids.size === 0) return

  let counts: Record<string, Counts> = {}
  try {
    const params = new URLSearchParams({ ids: [...ids].join(','), viewer: visitorId() })
    const res = await fetch(`/api/video-stats?${params}`)
    const data = (await res.json()) as { available?: boolean; counts?: Record<string, Counts> }
    if (!res.ok || !data.available || !data.counts) return // stats unavailable: show nothing
    counts = data.counts
  } catch {
    return
  }
  for (const [id, c] of Object.entries(counts)) {
    // A view counted while this request was on its way has newer numbers.
    if (!viewShown.has(id)) showViews(id, c.views)
    showLike(id, c.likes, c.liked)
  }

  document.querySelectorAll<HTMLButtonElement>('button[data-like]').forEach(wireLike)
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => void init())
else void init()
