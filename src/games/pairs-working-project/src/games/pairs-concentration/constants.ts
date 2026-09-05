// A calm, universally recognizable symbol set — enough distinct symbols for
// the largest 4x4 board (8 pairs). Kept simple and bold rather than
// detailed, which stays easy to tell apart at a glance.
export const SYMBOL_SET = ['☀️', '🌙', '⭐', '🌸', '🍃', '🔔', '🥁', '🛶']

export interface PairsGridOption {
  pairCount: number
  columns: number
  label: string
}

export const GRID_OPTIONS: PairsGridOption[] = [
  { pairCount: 2, columns: 2, label: '4 cards' },
  { pairCount: 6, columns: 4, label: '12 cards' },
  { pairCount: 8, columns: 4, label: '16 cards' },
]
