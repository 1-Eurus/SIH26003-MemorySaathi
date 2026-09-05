// ─── Image slicing math ─────────────────────────────────────────────────────
// Each piece shows one cell of a gridSize×gridSize crop of the full image,
// using the standard CSS technique: scale the background up to
// gridSize*100% in each dimension, then use a percentage background-position
// to select which cell shows through. Percentage background-position is
// defined so that X% aligns the point at X% of the (oversized) image with
// the point at X% of the container — which works out to `col / (gridSize
// - 1) * 100` for the column at index `col` (and the same for rows). This
// is exactly the kind of off-by-one-prone formula worth unit testing rather
// than trusting by eye.

export interface PieceBackgroundStyle {
  backgroundSize: string
  backgroundPositionX: string
  backgroundPositionY: string
}

export function pieceRowCol(pieceIndex: number, gridSize: number): { row: number; col: number } {
  return { row: Math.floor(pieceIndex / gridSize), col: pieceIndex % gridSize }
}

export function pieceBackgroundStyle(pieceIndex: number, gridSize: number): PieceBackgroundStyle {
  const { row, col } = pieceRowCol(pieceIndex, gridSize)
  const percentFor = (cellIndex: number) => (gridSize <= 1 ? 0 : (cellIndex / (gridSize - 1)) * 100)

  return {
    backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
    backgroundPositionX: `${percentFor(col)}%`,
    backgroundPositionY: `${percentFor(row)}%`,
  }
}
