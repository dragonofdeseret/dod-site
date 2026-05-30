// ──────────────────────────────────────────────────────────────────────────────
// Per-item URL resolver — mirror of legacy getItemUrl(). The legacy site
// used query-string routes (artwork.html?id=...&from=...); the Astro site
// uses dynamic clean routes (/art/2026-05-03, /writing/AcidLullabies, etc.).
//
// `from` is preserved as a query param (?from=archive) so the back-link
// on the item page knows where to send the visitor.
// ──────────────────────────────────────────────────────────────────────────────

type Item = {
  data: {
    type?: string
    id: string
    sections?: string[]
  }
}

export function itemUrl(item: Item, from = 'archive'): string {
  const { type, id, sections } = item.data
  const q = from ? `?from=${from}` : ''
  switch (type) {
    case 'art':
      return `/art/${id}${q}`
    case 'photo':
      return `/photography/${id}${q}`
    case 'writing': {
      const isTrip = Array.isArray(sections) && sections.includes('trips')
      return isTrip ? `/altered-states/${id}${q}` : `/writing/${id}${q}`
    }
    case 'margins':
      return `/margins#${id}`
    case 'quotes':
      return `/quotes#${id}`
    default:
      return '#'
  }
}
