// ──────────────────────────────────────────────────────────────────────────────
// Filter engine — client-side multi-select tag filtering with year nav
// updates. Port of legacy createFilterEngine + renderMultiSelectFilter.
//
// Wiring contract: the Astro page renders every item it has (no
// pre-filtering) and tags each item-row with data-attributes carrying
// the filterable values. This script:
//
//   1. Scans the page for items + their tag values
//   2. Renders chip rows into the named filter containers (.tag-filter-*)
//   3. Toggles chips and shows/hides items based on the active selection
//   4. Updates the year-nav so years with zero visible items disappear
//
// Page setup:
//
//   <div class="tag-filter tag-filter-art-tags"
//        data-filter-name="artTags"
//        data-filter-mode="or"
//        data-filter-target=".gallery-grid a"
//        data-filter-key="art-tags"></div>
//
//   <a data-art-tags="abstract,blue" data-year="2024">…</a>
//
// The script discovers all data-filter-* containers on the page and
// auto-binds. Idempotent on multiple init() calls.
// ──────────────────────────────────────────────────────────────────────────────

type FilterMode = 'or' | 'and'

interface FilterGroup {
  name: string
  /** CSS selector identifying the items this filter constrains. */
  targetSelector: string
  /** Data-attribute key on each item carrying its comma-separated values.
   *  e.g. `data-tags="a,b,c"` → use `'tags'`. */
  dataKey: string
  /** "or" → show item if it has any selected value; "and" → must have all. */
  mode: FilterMode
  /** Container that holds the chips. */
  container: HTMLElement
  /** Optional label for the clear-all button. Defaults to "All". */
  allLabel: string
}

function readItems(group: FilterGroup): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(group.targetSelector))
}

function readValues(el: HTMLElement, dataKey: string): string[] {
  const raw = el.dataset[dataKey] ?? ''
  if (!raw) return []
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function dashToCamel(s: string): string {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

interface State {
  selected: Map<string, Set<string>> // group name → selected values
}

function matchesGroup(
  el: HTMLElement,
  group: FilterGroup,
  selected: Set<string>,
): boolean {
  if (selected.size === 0) return true
  const itemValues = readValues(el, group.dataKey)
  if (group.mode === 'and') {
    for (const v of selected) if (!itemValues.includes(v)) return false
    return true
  }
  for (const v of itemValues) if (selected.has(v)) return true
  return false
}

function renderChips(
  group: FilterGroup,
  values: string[],
  selected: Set<string>,
  onToggle: (value: string | null) => void,
): void {
  group.container.innerHTML = ''

  const clear = document.createElement('button')
  clear.type = 'button'
  clear.className = `tag-pill tag-pill-clear${selected.size === 0 ? ' active' : ''}`
  clear.textContent = group.allLabel
  clear.addEventListener('click', () => onToggle(null))
  group.container.appendChild(clear)

  for (const value of values) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = `tag-pill${selected.has(value) ? ' active' : ''}`
    btn.textContent = value
    btn.addEventListener('click', () => onToggle(value))
    group.container.appendChild(btn)
  }
}

function applyVisibility(groups: FilterGroup[], state: State): void {
  // Collect all unique target selectors so each item is checked once even
  // if multiple groups share the same target.
  const targetMap = new Map<string, HTMLElement[]>()
  for (const g of groups) {
    if (!targetMap.has(g.targetSelector)) {
      targetMap.set(g.targetSelector, readItems(g))
    }
  }

  for (const items of targetMap.values()) {
    for (const el of items) {
      const visible = groups.every((g) =>
        matchesGroup(el, g, state.selected.get(g.name) ?? new Set()),
      )
      el.style.display = visible ? '' : 'none'
    }
  }

  // Hide year sections that now have zero visible items. Year nav is
  // updated to match.
  const yearSections = Array.from(
    document.querySelectorAll<HTMLElement>('[id^="year-"]'),
  )
  const visibleYears = new Set<string>()
  for (const section of yearSections) {
    const visibleChildren = section.querySelectorAll<HTMLElement>(
      'a, .archive-row, .quote-entry',
    )
    let hasVisible = false
    for (const c of visibleChildren) {
      if (c.style.display !== 'none') {
        hasVisible = true
        break
      }
    }
    section.style.display = hasVisible ? '' : 'none'
    if (hasVisible) visibleYears.add(section.id.replace(/^year-/, ''))
  }

  for (const navLink of document.querySelectorAll<HTMLAnchorElement>(
    '.year-nav a',
  )) {
    const target = navLink.hash.replace(/^#year-/, '')
    navLink.style.display = visibleYears.has(target) ? '' : 'none'
  }
}

function discoverGroups(): FilterGroup[] {
  const containers = Array.from(
    document.querySelectorAll<HTMLElement>('.tag-filter[data-filter-name]'),
  )
  return containers.map((container) => {
    const name = container.dataset.filterName!
    const targetSelector = container.dataset.filterTarget ?? ''
    const dataKey = dashToCamel(container.dataset.filterKey ?? '')
    const mode = (container.dataset.filterMode ?? 'or') as FilterMode
    const allLabel = container.dataset.filterAllLabel ?? 'All'
    return { name, targetSelector, dataKey, mode, container, allLabel }
  })
}

function init(): void {
  const groups = discoverGroups()
  if (groups.length === 0) return

  // Discover all values per group from the actual items on the page.
  const valuesByGroup = new Map<string, string[]>()
  for (const g of groups) {
    const all: string[] = []
    for (const el of readItems(g)) all.push(...readValues(el, g.dataKey))
    valuesByGroup.set(g.name, uniqueSorted(all))
  }

  const state: State = { selected: new Map() }
  for (const g of groups) state.selected.set(g.name, new Set())

  function rerender(): void {
    for (const g of groups) {
      const selected = state.selected.get(g.name)!
      renderChips(g, valuesByGroup.get(g.name) ?? [], selected, (value) => {
        if (value === null) {
          selected.clear()
        } else if (selected.has(value)) {
          selected.delete(value)
        } else {
          selected.add(value)
        }
        rerender()
      })
    }
    applyVisibility(groups, state)
  }

  rerender()
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
}
