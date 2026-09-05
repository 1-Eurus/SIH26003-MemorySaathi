// ─── Sort & Match — shared types ────────────────────────────────────────────

export interface SortCategory {
  id: string
  label: string
  accentColor: string
}

export interface SortItem {
  id: string
  emoji: string
  label: string
  categoryId: string
}

export interface SortSet {
  id: string
  name: string
  categories: [SortCategory, SortCategory]
  items: SortItem[]
}
