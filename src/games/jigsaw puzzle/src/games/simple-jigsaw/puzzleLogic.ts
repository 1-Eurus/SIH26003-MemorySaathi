// ─── Simple Jigsaw — pure puzzle logic ─────────────────────────────────────
// `pieceOrder[position]` holds the *original* piece index currently sitting
// at that board position. The puzzle is solved when every position holds
// its own index (pieceOrder[i] === i for all i).

export function isSolved(pieceOrder: number[]): boolean {
  return pieceOrder.every((value, index) => value === index)
}

export function countCorrectPieces(pieceOrder: number[]): number {
  return pieceOrder.reduce((count, value, index) => (value === index ? count + 1 : count), 0)
}

export function swapPieces(pieceOrder: number[], positionA: number, positionB: number): number[] {
  const next = [...pieceOrder]
  const temp = next[positionA]
  next[positionA] = next[positionB]
  next[positionB] = temp
  return next
}

/**
 * A random permutation of [0, pieceCount), re-rolled if it happens to come
 * out already solved (only possible/likely for very small piece counts).
 */
export function shufflePieceOrder(pieceCount: number): number[] {
  const order = Array.from({ length: pieceCount }, (_, index) => index)

  const shuffleOnce = () => {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = order[i]
      order[i] = order[j]
      order[j] = temp
    }
  }

  shuffleOnce()
  while (pieceCount > 1 && isSolved(order)) {
    shuffleOnce()
  }

  return order
}
