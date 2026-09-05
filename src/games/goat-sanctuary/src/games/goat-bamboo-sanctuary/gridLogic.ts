import type { Coordinate, Goat, GridSize, LevelLayout, Obstacle } from './types'

export function coordKey(cell: Coordinate): string {
  return `${cell.row},${cell.col}`
}

export function coordsEqual(a: Coordinate, b: Coordinate): boolean {
  return a.row === b.row && a.col === b.col
}

function neighborsOf(cell: Coordinate, gridSize: GridSize): Coordinate[] {
  const deltas = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ]
  return deltas
    .map((d) => ({ row: cell.row + d.row, col: cell.col + d.col }))
    .filter((c) => c.row >= 0 && c.row < gridSize && c.col >= 0 && c.col < gridSize)
}

/** Paddock is a square block in the top-left corner; larger pastures get a bigger paddock. */
export function getPaddockSize(gridSize: GridSize): number {
  return gridSize <= 6 ? 2 : 3
}

/** Goat count grows gently with level, capped at how many can actually fit in the paddock. */
export function goatCountForLevel(level: number, gridSize: GridSize): number {
  const capacity = getPaddockSize(gridSize) ** 2
  return Math.min(2 + level, capacity)
}

export function generateLevel(gridSize: GridSize, goatCount: number): LevelLayout {
  const paddockSize = getPaddockSize(gridSize)

  const paddockCells: Coordinate[] = []
  for (let row = 0; row < paddockSize; row++) {
    for (let col = 0; col < paddockSize; col++) {
      paddockCells.push({ row, col })
    }
  }

  // Wall runs along the outer edge of the paddock block, with the very
  // last segment left out to serve as the single gate.
  const wallCells: Coordinate[] = []
  for (let col = 0; col < paddockSize; col++) wallCells.push({ row: paddockSize, col })
  for (let row = 0; row < paddockSize; row++) wallCells.push({ row, col: paddockSize })

  const gateCell = wallCells[wallCells.length - 1]
  const fenceCells = wallCells.slice(0, -1)

  const blockedKeys = new Set([...paddockCells, ...fenceCells].map(coordKey))
  const candidates: Coordinate[] = []
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = { row, col }
      if (!blockedKeys.has(coordKey(cell)) && !coordsEqual(cell, gateCell)) {
        candidates.push(cell)
      }
    }
  }

  const shuffled = [...candidates].sort(() => Math.random() - 0.5)
  const goats: Goat[] = shuffled.slice(0, Math.min(goatCount, shuffled.length)).map((position, index) => ({
    id: `goat-${index}-${Math.random().toString(36).slice(2, 8)}`,
    position,
    status: 'wandering',
  }))

  return { gridSize, fenceCells, paddockCells, gateCell, goats }
}

/**
 * Breadth-first search from `start` to the nearest paddock cell, returning
 * only the first step of the shortest path (or null if already home / no
 * path currently exists). Obstacles and fences show up in `blockedKeys`, so
 * a freshly placed guide marker naturally reroutes the search.
 */
export function findNextStep(
  start: Coordinate,
  gridSize: GridSize,
  paddockKeys: Set<string>,
  blockedKeys: Set<string>,
): Coordinate | null {
  if (paddockKeys.has(coordKey(start))) return null

  const cameFrom = new Map<string, Coordinate | null>()
  cameFrom.set(coordKey(start), null)
  const queue: Coordinate[] = [start]
  let goal: Coordinate | null = null

  while (queue.length > 0) {
    const current = queue.shift() as Coordinate
    if (paddockKeys.has(coordKey(current))) {
      goal = current
      break
    }
    for (const next of neighborsOf(current, gridSize)) {
      const key = coordKey(next)
      if (cameFrom.has(key)) continue
      // Paddock tiles are a shared safe zone, not exclusive parking spots —
      // a step into the paddock is always allowed even if the search's
      // blocked set (built from other goats' positions) happens to include it.
      if (blockedKeys.has(key) && !paddockKeys.has(key)) continue
      cameFrom.set(key, current)
      queue.push(next)
    }
  }

  if (!goal) return null

  const path: Coordinate[] = []
  let cursor: Coordinate | null = goal
  while (cursor) {
    path.push(cursor)
    cursor = cameFrom.get(coordKey(cursor)) ?? null
  }
  path.reverse() // path[0] === start

  return path.length > 1 ? path[1] : null
}

/**
 * Moves every wandering goat one step toward the paddock, resolving each
 * goat in order so two goats never land on (or pass through) the same
 * tile in a single turn. Goats with no available step simply stay put —
 * there is no failure state, only a pause.
 */
export function advanceGoats(
  goats: Goat[],
  obstacles: Obstacle[],
  fenceCells: Coordinate[],
  paddockCells: Coordinate[],
  gridSize: GridSize,
): { goats: Goat[]; justHousedIds: string[] } {
  const paddockKeys = new Set(paddockCells.map(coordKey))
  const fenceKeys = new Set(fenceCells.map(coordKey))
  const obstacleKeys = new Set(obstacles.map((o) => coordKey(o.position)))

  // Reservations prevent two goats colliding out in the open field. The
  // paddock itself is a shared safe zone, not a set of exclusive parking
  // spots — a single-cell gate would otherwise let the first goat home
  // permanently block every goat behind it, since the interior tiles are
  // only reachable through that same entrance.
  const reserved = new Set(goats.filter((g) => !paddockKeys.has(coordKey(g.position))).map((g) => coordKey(g.position)))

  // Track which paddock tiles already have a goat so newly arriving goats
  // settle into their own open spot instead of stacking on the entry tile.
  const claimedPaddockCells = new Set(goats.filter((g) => g.status === 'housed').map((g) => coordKey(g.position)))

  const justHousedIds: string[] = []

  const nextGoats = goats.map((goat) => {
    if (goat.status === 'housed') return goat

    const blocked = new Set<string>([...fenceKeys, ...obstacleKeys, ...reserved])
    blocked.delete(coordKey(goat.position))

    const next = findNextStep(goat.position, gridSize, paddockKeys, blocked)
    if (!next) return goat

    reserved.delete(coordKey(goat.position))

    if (paddockKeys.has(coordKey(next))) {
      const openSlot = paddockCells.find((cell) => !claimedPaddockCells.has(coordKey(cell))) ?? next
      claimedPaddockCells.add(coordKey(openSlot))
      justHousedIds.push(goat.id)
      return { ...goat, position: openSlot, status: 'housed' as const }
    }

    reserved.add(coordKey(next))
    return { ...goat, position: next, status: 'wandering' as const }
  })

  return { goats: nextGoats, justHousedIds }
}
