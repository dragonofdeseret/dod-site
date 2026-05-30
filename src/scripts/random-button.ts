// ──────────────────────────────────────────────────────────────────────────────
// Random-shuffle button — picks a random visible artwork tile and
// navigates to it. Port of legacy buildRandomButton(). Mounts into the
// #random-container element on /art (and could be used elsewhere).
//
// "Visible" means the tile is currently displayed (filter-engine.ts may
// have hidden some). The randomization re-evaluates on each click so
// filtering down to "all 2024 jade-pattern pieces" then tapping random
// surfaces a piece from that subset.
// ──────────────────────────────────────────────────────────────────────────────

function init(): void {
  const container = document.getElementById('random-container')
  if (!container) return
  if (container.dataset.bound === '1') return
  container.dataset.bound = '1'

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'random-button'
  btn.textContent = '✦ Random'
  btn.addEventListener('click', () => {
    const tiles = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.gallery-grid > a'),
    ).filter((el) => el.style.display !== 'none')
    if (tiles.length === 0) return
    const pick = tiles[Math.floor(Math.random() * tiles.length)]!
    window.location.href = pick.href
  })
  container.appendChild(btn)
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
}
