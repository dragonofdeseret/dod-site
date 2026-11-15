// ──────────────────────────────────────────────────────────────────────────────
// Send a video file to a Mux direct-upload URL, in resumable pieces.
//
// Why not a library: the previous uploader (UpChunk) read the file through
// file.stream(), so every byte of a multi-gigabyte video passed through the
// page's memory — Safari has had bugs reading large files that way, and a
// tab that grows too big gets reloaded by Safari, losing the upload. Here
// each piece is a `file.slice()` handed straight to the browser's network
// stack, which reads it from disk: the page never holds the video's bytes.
//
// The URL Mux hands out is a Google Cloud Storage resumable-upload session
// (https://cloud.google.com/storage/docs/performing-resumable-uploads):
//   • PUT a piece with `Content-Range: bytes a-b/total` → 308 (send the
//     next piece; a `Range: bytes=0-n` header, when readable, says how much
//     was kept) or 200/201 (the whole file has arrived);
//   • PUT nothing with `Content-Range: bytes */total` → where it got to;
//   • bytes sent again at an offset already stored are ignored, so
//     resending a piece is always safe.
// The session stays valid for as long as the Mux upload does (24 hours, see
// lib/mux.ts), so an upload interrupted by a reload, a sleeping laptop or a
// dropped connection can carry on from the last stored byte.
// ──────────────────────────────────────────────────────────────────────────────

/** 16 MiB: a multiple of 256 KiB (required for all but the last piece) and
 *  large enough to be efficient, small enough that a failure costs little. */
export const PIECE_BYTES = 16 * 1024 * 1024

/** No bytes moving for this long while sending a piece = a dead connection. */
const STALL_MS = 60_000
/** After a piece is fully sent, how long to wait for Mux to answer. */
const ANSWER_MS = 120_000
/** Give up after this much time of failing while online (sleep and time
 *  offline don't count). The upload can still be resumed afterwards. */
const GIVE_UP_MS = 10 * 60_000

/** The caller stopped the upload (a newer file was picked, the page left). */
export class UploadStopped extends Error {
  constructor() {
    super('Upload stopped.')
    this.name = 'UploadStopped'
  }
}

/** The upload can't continue. `resumable` = the same file can be picked
 *  again later to carry on (the connection failed); otherwise Mux refused
 *  the upload and it has to start over. */
export class UploadFailed extends Error {
  resumable: boolean
  constructor(message: string, resumable: boolean) {
    super(message)
    this.name = 'UploadFailed'
    this.resumable = resumable
  }
}

type PutResult =
  | { kind: 'done' }
  /** 308. `stored` = bytes Mux has kept, from the Range header; null when
   *  the header is absent (nothing kept yet — or not readable here). */
  | { kind: 'partial'; stored: number | null }
  | { kind: 'transient'; why: string }
  | { kind: 'permanent'; status: number }

function put(
  url: string,
  body: Blob,
  contentRange: string,
  contentType: string | null,
  signal: AbortSignal,
  onSent?: (bytes: number) => void,
): Promise<PutResult> {
  return new Promise<PutResult>((resolve, reject) => {
    if (signal.aborted) return reject(new UploadStopped())
    const xhr = new XMLHttpRequest()
    let settled = false
    let last = Date.now()
    let bodySent = body.size === 0
    const finish = (r: PutResult | Error) => {
      if (settled) return
      settled = true
      window.clearInterval(watchdog)
      signal.removeEventListener('abort', onAbort)
      if (r instanceof Error) reject(r)
      else resolve(r)
    }
    // finish() before xhr.abort(): aborting fires the request's own abort
    // event straight away, and the first outcome recorded is the one kept.
    const onAbort = () => {
      finish(new UploadStopped())
      xhr.abort()
    }
    // A request can hang without ever failing (a connection that died while
    // the laptop slept, a network switch). Nothing would ever happen again,
    // so notice the silence and treat it as a failure.
    const watchdog = window.setInterval(() => {
      if (Date.now() - last > (bodySent ? ANSWER_MS : STALL_MS)) {
        finish({ kind: 'transient', why: 'stalled' })
        xhr.abort()
      }
    }, 5000)
    signal.addEventListener('abort', onAbort)

    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Range', contentRange)
    if (contentType) xhr.setRequestHeader('Content-Type', contentType)
    xhr.upload.onprogress = (e) => {
      last = Date.now()
      onSent?.(e.loaded)
    }
    xhr.upload.onload = () => {
      last = Date.now()
      bodySent = true
    }
    xhr.onload = () => {
      const s = xhr.status
      if (s === 200 || s === 201) return finish({ kind: 'done' })
      if (s === 308) {
        const m = (xhr.getResponseHeader('Range') ?? '').match(/bytes=(\d+)-(\d+)/)
        return finish({ kind: 'partial', stored: m ? Number(m[2]) + 1 : null })
      }
      if (s === 0 || s === 408 || s === 429 || s >= 500) return finish({ kind: 'transient', why: `HTTP ${s}` })
      finish({ kind: 'permanent', status: s })
    }
    xhr.onerror = () => finish({ kind: 'transient', why: 'network' })
    xhr.ontimeout = () => finish({ kind: 'transient', why: 'timeout' })
    xhr.onabort = () => finish({ kind: 'transient', why: 'aborted' })
    xhr.send(body)
  })
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(new UploadStopped())
    const t = window.setTimeout(() => {
      signal.removeEventListener('abort', stop)
      resolve()
    }, ms)
    const stop = () => {
      window.clearTimeout(t)
      reject(new UploadStopped())
    }
    signal.addEventListener('abort', stop, { once: true })
  })
}

/** Resolves once the browser reports being online (checked every few
 *  seconds too, in case the event is missed). */
function waitUntilOnline(signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(new UploadStopped())
    const done = () => {
      window.clearInterval(poll)
      window.removeEventListener('online', check)
      signal.removeEventListener('abort', stop)
    }
    const check = () => {
      if (navigator.onLine !== false) {
        done()
        resolve()
      }
    }
    const stop = () => {
      done()
      reject(new UploadStopped())
    }
    const poll = window.setInterval(check, 3000)
    window.addEventListener('online', check)
    signal.addEventListener('abort', stop)
    check()
  })
}

export interface SendOptions {
  url: string
  file: File
  /** Bytes an earlier session had confirmed as stored. Checked with Mux
   *  before use; 0 or absent for a new upload. */
  resumeFrom?: number
  signal: AbortSignal
  /** Bytes sent so far (stored + the piece in flight). */
  onProgress: (bytes: number) => void
  /** Bytes Mux has confirmed as stored — safe to resume from. */
  onStored: (bytes: number) => void
  /** What the transfer is doing, for the status line. */
  onState: (state: 'sending' | 'offline' | 'retrying') => void
}

/**
 * Upload `file` to the Mux URL, resuming from what Mux already has. Resolves
 * only once Mux has said the whole file arrived (200/201); rejects with
 * UploadStopped (caller aborted) or UploadFailed.
 */
export async function sendToMux(o: SendOptions): Promise<void> {
  const { url, file, signal } = o
  const size = file.size
  if (size === 0) throw new UploadFailed('That file is empty.', false)
  const type = file.type || 'application/octet-stream'
  const lastPieceStart = Math.floor((size - 1) / PIECE_BYTES) * PIECE_BYTES
  const status = () => put(url, new Blob([]), `bytes */${size}`, null, signal)
  const finished = () => {
    o.onStored(size)
    o.onProgress(size)
  }

  // Whether the Range header is readable from this page (it depends on
  // Mux's CORS settings). Once seen, a 308 without it reliably means
  // "nothing stored yet".
  let rangeReadable = false
  let offset = 0
  // While Range can't be read, our position is an assumption (that each
  // piece answered with 308 was kept in full). If Mux then refuses a piece
  // — a gap — step back: first to the start of the last assumed piece,
  // then to the beginning. Resent bytes are ignored, so this is safe.
  let assumedFrom: number | null = null
  let refusals = 0
  let furthest = 0
  let endChecks = 0
  const moveTo = (n: number) => {
    offset = Math.max(0, Math.min(n, size))
    if (offset > furthest) {
      furthest = offset
      refusals = 0
    }
    o.onStored(offset)
  }

  if (o.resumeFrom && o.resumeFrom > 0) {
    const s = await status()
    if (s.kind === 'done') return finished()
    if (s.kind === 'permanent') {
      throw new UploadFailed(`Mux no longer accepts this upload (HTTP ${s.status}).`, false)
    }
    if (s.kind === 'partial' && s.stored !== null) {
      rangeReadable = true
      moveTo(s.stored)
    } else {
      // No readable answer: carry on from our own record — but never from
      // "the end", since Mux hasn't said it is done.
      const from = Math.min(o.resumeFrom, lastPieceStart)
      assumedFrom = Math.max(0, from - PIECE_BYTES)
      moveTo(from)
    }
    o.onProgress(offset)
  }

  let failingMs = 0
  let lastFailAt: number | null = null
  let delay = 2000
  const calm = () => {
    failingMs = 0
    lastFailAt = null
    delay = 2000
  }

  for (;;) {
    if (signal.aborted) throw new UploadStopped()

    if (offset >= size) {
      // Everything has been sent but Mux hasn't said "done": ask.
      const s = await status()
      if (s.kind === 'done') return finished()
      if (++endChecks > 3) throw new UploadFailed('Mux didn’t confirm the end of the upload.', true)
      if (s.kind === 'partial' && s.stored !== null && s.stored < size) {
        rangeReadable = true
        moveTo(s.stored)
      } else {
        moveTo(lastPieceStart) // send the last piece again
      }
      continue
    }

    if (navigator.onLine === false) {
      o.onState('offline')
      await waitUntilOnline(signal)
      calm()
      continue
    }

    const start = offset
    const end = Math.min(start + PIECE_BYTES, size)
    o.onState('sending')
    const r = await put(url, file.slice(start, end), `bytes ${start}-${end - 1}/${size}`, type, signal, (sent) =>
      o.onProgress(start + sent),
    )

    if (r.kind === 'done') return finished()

    if (r.kind === 'partial') {
      let next: number
      if (r.stored !== null) {
        // Mux may keep less than was sent; carry on from what it kept.
        rangeReadable = true
        assumedFrom = null
        next = r.stored
      } else if (rangeReadable) {
        next = 0 // Mux says nothing is stored
      } else {
        assumedFrom = start
        next = end // assumed kept in full
      }
      moveTo(next)
      if (next > start) {
        calm()
        continue
      }
      // Answered, but nothing new was kept: treat it like a failure, so a
      // run of these backs off and eventually stops instead of looping.
      const now = Date.now()
      failingMs += lastFailAt === null ? 0 : Math.min(now - lastFailAt, 60_000)
      lastFailAt = now
      if (failingMs > GIVE_UP_MS) throw new UploadFailed('The connection to Mux kept failing.', true)
      o.onState('retrying')
      await wait(delay, signal)
      delay = Math.min(delay * 2, 30_000)
      continue
    }

    if (r.kind === 'permanent') {
      if (!rangeReadable && refusals < 2) {
        refusals++
        const back = refusals === 1 && assumedFrom !== null ? assumedFrom : 0
        assumedFrom = null
        offset = back
        o.onStored(back)
        continue
      }
      throw new UploadFailed(`Mux refused the upload (HTTP ${r.status}).`, false)
    }

    // Transient: the connection failed or stalled. Wait (longer each time),
    // then ask Mux how much arrived and carry on from there.
    const now = Date.now()
    failingMs += lastFailAt === null ? 0 : Math.min(now - lastFailAt, 60_000)
    lastFailAt = now
    if (failingMs > GIVE_UP_MS) {
      throw new UploadFailed('The connection to Mux kept failing.', true)
    }
    o.onState(navigator.onLine === false ? 'offline' : 'retrying')
    await wait(delay, signal)
    delay = Math.min(delay * 2, 30_000)
    const s = await status()
    if (s.kind === 'done') return finished()
    if (s.kind === 'partial') {
      if (s.stored !== null) {
        rangeReadable = true
        assumedFrom = null
        // Bytes kept get through even on a flaky connection: that's
        // progress, not failure.
        if (s.stored > start) calm()
        moveTo(s.stored)
      } else if (rangeReadable) {
        moveTo(0)
      }
      // (Range not readable: send the same piece again — repeats are ignored.)
    }
  }
}
