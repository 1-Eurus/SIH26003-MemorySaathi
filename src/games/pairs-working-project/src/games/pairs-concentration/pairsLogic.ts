// ─── Pairs / Concentration — pure logic ────────────────────────────────────
// `deck[position]` holds the symbol index shown at that card position (each
// symbol index appears in exactly two positions).

export function buildShuffledDeck(pairCount: number): number[] {
  const deck: number[] = []
  for (let symbolIndex = 0; symbolIndex < pairCount; symbolIndex++) {
    deck.push(symbolIndex, symbolIndex)
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = deck[i]
    deck[i] = deck[j]
    deck[j] = temp
  }
  return deck
}

/** Whether tapping this card position is currently a legal move. */
export function canFlipCard(position: number, flippedPositions: number[], matchedPositions: Set<number>): boolean {
  if (matchedPositions.has(position)) return false
  if (flippedPositions.includes(position)) return false
  if (flippedPositions.length >= 2) return false
  return true
}

export function isMatch(deck: number[], positionA: number, positionB: number): boolean {
  return positionA !== positionB && deck[positionA] === deck[positionB]
}

export function isRoundComplete(matchedPositions: Set<number>, totalCards: number): boolean {
  return matchedPositions.size === totalCards
}
