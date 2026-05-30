// ──────────────────────────────────────────────────────────────────────────────
// Date formatting helpers — port of legacy script.js formatQuoteDate().
// "2025-11-16" → "November 16, 2025".
// ──────────────────────────────────────────────────────────────────────────────

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

export function formatLongDate(dateString: string | undefined | null): string {
  if (!dateString) return ''
  const parts = String(dateString).split('-')
  if (parts.length !== 3) return String(dateString)
  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])
  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12
  ) {
    return String(dateString)
  }
  return `${MONTHS[month - 1]} ${day}, ${year}`
}
