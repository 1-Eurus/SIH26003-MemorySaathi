import { PawPrint } from 'lucide-react'
import { OBSTACLE_LIFETIME } from './constants'
import { coordKey, coordsEqual } from './gridLogic'
import type { Coordinate, Goat, LevelLayout, Obstacle } from './types'

interface GridBoardProps {
  layout: LevelLayout
  goats: Goat[]
  obstacles: Obstacle[]
  highContrast: boolean
  largeTiles: boolean
  pulsingGoatIds: Set<string>
  onTileTap: (cell: Coordinate) => void
}

export function GridBoard({ layout, goats, obstacles, highContrast, largeTiles, pulsingGoatIds, onTileTap }: GridBoardProps) {
  const { gridSize, fenceCells, paddockCells, gateCell } = layout
  const fenceKeys = new Set(fenceCells.map(coordKey))
  const paddockKeys = new Set(paddockCells.map(coordKey))
  const obstacleByKey = new Map(obstacles.map((o) => [coordKey(o.position), o]))
  const goatKeys = new Set(goats.map((g) => coordKey(g.position)))

  const cells: Coordinate[] = []
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) cells.push({ row, col })
  }

  const tileBorder = highContrast ? 'border-[3px] border-[#12331F]' : 'border-2 border-[#D8CBA9]'

  return (
    <div className={`mx-auto w-full ${largeTiles ? 'max-w-[560px]' : 'max-w-[420px]'}`}>
      <div
        className="relative grid gap-1.5 rounded-3xl p-3"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          background: highContrast ? '#EDE6CF' : '#F4EFDF',
        }}
      >
        {cells.map((cell) => {
          const key = coordKey(cell)
          const isFence = fenceKeys.has(key)
          const isPaddock = paddockKeys.has(key)
          const isGate = coordsEqual(cell, gateCell)
          const obstacle = obstacleByKey.get(key)
          const hasGoat = goatKeys.has(key)
          const tappable = !isFence && !isPaddock && !hasGoat

          let tileClasses = `aspect-square rounded-xl transition-colors ${tileBorder}`
          if (isFence) {
            tileClasses += highContrast ? ' bg-[#12331F]' : ' bg-[#5B7A4F]'
          } else if (isPaddock) {
            tileClasses += highContrast ? ' bg-[#CDE7B0]' : ' bg-[#E4F1D3]'
          } else if (obstacle) {
            tileClasses += highContrast ? ' bg-[#7A4A22]' : ' bg-[#C99A5B]'
          } else {
            tileClasses += highContrast ? ' bg-[#FBF8ED] hover:bg-[#EFE6C8]' : ' bg-white hover:bg-[#F7F1DD]'
          }
          if (isGate && !obstacle && !hasGoat) {
            tileClasses += ' ring-2 ring-inset ring-[#8FBE86]'
          }

          return (
            <button
              key={key}
              type="button"
              disabled={!tappable}
              onClick={() => onTileTap(cell)}
              aria-label={
                isFence
                  ? 'Bamboo fence'
                  : isPaddock
                    ? 'Sanctuary paddock'
                    : obstacle
                      ? 'Guide marker, tap to remove'
                      : 'Empty pasture tile, tap to place a guide marker'
              }
              className={`${tileClasses} ${tappable ? 'cursor-pointer' : 'cursor-default'}`}
              style={obstacle ? { opacity: 0.35 + (obstacle.turnsLeft / OBSTACLE_LIFETIME) * 0.5 } : undefined}
            />
          )
        })}

        {/* Goats float above the tile grid so they can glide smoothly between turns. */}
        <div className="pointer-events-none absolute inset-3">
          {goats.map((goat) => {
            const leftPercent = ((goat.position.col + 0.5) / gridSize) * 100
            const topPercent = ((goat.position.row + 0.5) / gridSize) * 100
            return (
              <div
                key={goat.id}
                className={`absolute flex items-center justify-center rounded-full border-[3px] shadow-md transition-all duration-500 ease-out ${
                  goat.status === 'housed' ? 'border-[#4A7C59] bg-[#EAF4DF]' : 'border-[#7A4A22] bg-[#F3E4C8]'
                } ${pulsingGoatIds.has(goat.id) ? 'sanctuary-pulse' : ''}`}
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  width: `${88 / gridSize}%`,
                  aspectRatio: '1 / 1',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <PawPrint className="h-1/2 w-1/2 text-[#5B3A1E]" strokeWidth={2.4} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
