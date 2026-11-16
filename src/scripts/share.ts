// ──────────────────────────────────────────────────────────────────────────────
// Share button on a /tv watch page.
//
// Opens the device's own share sheet where there is one (phones, Safari):
// Messages, Mail, AirDrop, copy, apps. Elsewhere it copies the link and
// says so. The button is hidden until this script runs, since it needs it.
//
//   <button data-share data-share-url="https://…" data-share-title="…">
//     … <span data-share-label aria-live="polite">Share</span>
//   </button>
// ──────────────────────────────────────────────────────────────────────────────

function wire(btn: HTMLButtonElement): void {
  const url = btn.dataset.shareUrl || location.href.split(/[?#]/)[0]
  const title = btn.dataset.shareTitle || document.title
  const label = btn.querySelector<HTMLElement>('[data-share-label]')
  const idle = label?.textContent ?? 'Share'
  let reset: number | undefined

  const flash = (text: string) => {
    if (!label) return
    label.textContent = text
    window.clearTimeout(reset)
    reset = window.setTimeout(() => (label.textContent = idle), 2200)
  }

  btn.addEventListener('click', async () => {
    const data: ShareData = { title, url }
    if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data)
        return
      } catch (err) {
        // Closing the share sheet isn't an error; anything else falls back
        // to copying the link.
        if ((err as DOMException | undefined)?.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      flash('Link copied')
      return
    } catch {
      /* clipboard not available (old browser, or permission denied) */
    }
    window.prompt('Copy this link:', url)
  })
  btn.hidden = false
}

function init(): void {
  document.querySelectorAll<HTMLButtonElement>('button[data-share]').forEach(wire)
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
else init()
