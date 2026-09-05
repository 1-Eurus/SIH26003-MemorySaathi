// ─── Goat & Bamboo Sanctuary — shared types ───────────────────────────────

/** Accessible pasture sizes, from Easy up to Relaxed. */
export type GridSize = 5 | 6 | 7 | 8

export interface Coordinate {
  row: number
  col: number
}

export type GoatStatus = 'wandering' | 'housed'

export interface Goat {
  id: string
  position: Coordinate
  status: GoatStatus
}

/** A temporary player-placed guide marker that fades after a few turns. */
export interface Obstacle {
  position: Coordinate
  turnsLeft: number
}

export interface LevelLayout {
  gridSize: GridSize
  /** Bamboo fence wall segments enclosing the paddock (impassable). */
  fenceCells: Coordinate[]
  /** The safe interior of the paddock — a goat standing here is home. */
  paddockCells: Coordinate[]
  /** The single opening in the fence wall goats must route through. */
  gateCell: Coordinate
  goats: Goat[]
}
