// ─── Sort & Match — pure logic ──────────────────────────────────────────────

/** A Fisher-Yates shuffle of item ids for the starting tray order. */
export function shuffleOrder<T>(items: T[]): T[] {
  const order = [...items]
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = order[i]
    order[i] = order[j]
    order[j] = temp
  }
  return order
}

export function isSetComplete(trayItemIds: string[]): boolean {
  return trayItemIds.length === 0
}

/** Removes one item from the tray immutably — returns the same array reference-wise unchanged if the id wasn't present. */
export function removeFromTray(trayItemIds: string[], itemId: string): string[] {
  return trayItemIds.filter((id) => id !== itemId)
}
