import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GridBoard } from './GridBoard'
import { GameStats } from './GameStats'
import { PuzzleControls } from './PuzzleControls'
import { useGameAudio } from './useGameAudio'
import { advanceGoats, coordKey, generateLevel, goatCountForLevel } from './gridLogic'
import { OBSTACLE_LIFETIME } from './constants'
import type { Coordinate, Goat, GridSize, LevelLayout, Obstacle } from './types'
import './sanctuary.css'

interface Snapshot {
  goats: Goat[]
  obstacles: Obstacle[]
  movesTaken: number
}

const MAX_HISTORY = 60
const LEVEL_TRANSITION_DELAY_MS = 1100
const PULSE_DURATION_MS = 900

export function GoatPuzzlePortal() {
  const [gridSize, setGridSize] = useState<GridSize>(6)
  const [level, setLevel] = useState(1)
  const [layout, setLayout] = useState<LevelLayout>(() => generateLevel(6, goatCountForLevel(1, 6)))
  const [goats, setGoats] = useState<Goat[]>(() => layout.goats)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [movesTaken, setMovesTaken] = useState(0)
  const [history, setHistory] = useState<Snapshot[]>([])
  const [highContrast, setHighContrast] = useState(false)
  const [largeTiles, setLargeTiles] = useState(false)
  const [pulsingGoatIds, setPulsingGoatIds] = useState<Set<string>>(new Set())
  const [transitioning, setTransitioning] = useState(false)

  const { playChime, playLevelUp } = useGameAudio()
  const pulseTimeoutRef = useRef<number | null>(null)
  const levelTimeoutRef = useRef<number | null>(null)

  const startLevel = useCallback((size: GridSize, levelNumber: number) => {
    const nextLayout = generateLevel(size, goatCountForLevel(levelNumber, size))
    setLayout(nextLayout)
    setGoats(nextLayout.goats)
    setObstacles([])
    setMovesTaken(0)
    setHistory([])
    setPulsingGoatIds(new Set())
  }, [])

  const handleGridSizeChange = useCallback(
    (size: GridSize) => {
      setGridSize(size)
      setLevel(1)
      startLevel(size, 1)
    },
    [startLevel],
  )

  const handleReset = useCallback(() => {
    startLevel(gridSize, level)
  }, [gridSize, level, startLevel])

  const pushHistory = useCallback(() => {
    setHistory((prev) => {
      const snapshot: Snapshot = { goats, obstacles, movesTaken }
      const next = [...prev, snapshot]
      return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next
    })
  }, [goats, obstacles, movesTaken])

  const handleUndo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      setGoats(last.goats)
      setObstacles(last.obstacles)
      setMovesTaken(last.movesTaken)
      return prev.slice(0, -1)
    })
  }, [])

  const handleTileTap = useCallback(
    (cell: Coordinate) => {
      if (transitioning) return
      const key = coordKey(cell)
      const existingObstacle = obstacles.find((o) => coordKey(o.position) === key)

      // Tapping an existing marker clears it for free — no turn spent,
      // so the player can freely reconsider without any cost.
      if (existingObstacle) {
        pushHistory()
        setObstacles((prev) => prev.filter((o) => coordKey(o.position) !== key))
        return
      }

      pushHistory()
      const placedObstacles = [...obstacles, { position: cell, turnsLeft: OBSTACLE_LIFETIME }]
      setMovesTaken((prev) => prev + 1)

      const { goats: movedGoats, justHousedIds } = advanceGoats(
        goats,
        placedObstacles,
        layout.fenceCells,
        layout.paddockCells,
        gridSize,
      )
      const decayedObstacles = placedObstacles.map((o) => ({ ...o, turnsLeft: o.turnsLeft - 1 })).filter((o) => o.turnsLeft > 0)

      setGoats(movedGoats)
      setObstacles(decayedObstacles)

      if (justHousedIds.length > 0) {
        playChime()
        setPulsingGoatIds(new Set(justHousedIds))
        if (pulseTimeoutRef.current !== null) window.clearTimeout(pulseTimeoutRef.current)
        pulseTimeoutRef.current = window.setTimeout(() => setPulsingGoatIds(new Set()), PULSE_DURATION_MS)
      }
    },
    [transitioning, obstacles, goats, layout, gridSize, pushHistory, playChime],
  )

  // Advance to the next level once every goat in the current one is home.
  useEffect(() => {
    if (goats.length === 0 || transitioning) return
    const allHoused = goats.every((g) => g.status === 'housed')
    if (!allHoused) return

    setTransitioning(true)
    playLevelUp()
    levelTimeoutRef.current = window.setTimeout(() => {
      const nextLevel = level + 1
      setLevel(nextLevel)
      startLevel(gridSize, nextLevel)
      setTransitioning(false)
    }, LEVEL_TRANSITION_DELAY_MS)
  }, [goats, transitioning, level, gridSize, startLevel, playLevelUp])

  useEffect(() => {
    return () => {
      if (pulseTimeoutRef.current !== null) window.clearTimeout(pulseTimeoutRef.current)
      if (levelTimeoutRef.current !== null) window.clearTimeout(levelTimeoutRef.current)
    }
  }, [])

  const goatsHoused = useMemo(() => goats.filter((g) => g.status === 'housed').length, [goats])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:gap-5 sm:p-6" style={{ background: '#FBF8ED' }}>
      <header>
        <h1 className="text-2xl font-extrabold text-[#2E3B2C] sm:text-3xl">Goat &amp; Bamboo Sanctuary</h1>
        <p className="mt-1 text-sm font-semibold text-[#6B6152] sm:text-base">
          Tap a pasture tile to place a guide marker. The goats wander home in their own time.
        </p>
      </header>

      <GameStats goatsHoused={goatsHoused} totalGoats={goats.length} movesTaken={movesTaken} level={level} />

      {transitioning && (
        <div className="rounded-2xl border-2 border-[#4A7C59] bg-[#EAF4DF] px-4 py-3 text-center font-bold text-[#2E3B2C]">
          All goats are home. The sanctuary is growing…
        </div>
      )}

      <GridBoard
        layout={layout}
        goats={goats}
        obstacles={obstacles}
        highContrast={highContrast}
        largeTiles={largeTiles}
        pulsingGoatIds={pulsingGoatIds}
        onTileTap={handleTileTap}
      />

      <PuzzleControls
        gridSize={gridSize}
        onGridSizeChange={handleGridSizeChange}
        onUndo={handleUndo}
        canUndo={history.length > 0}
        onReset={handleReset}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast((prev) => !prev)}
        largeTiles={largeTiles}
        onToggleLargeTiles={() => setLargeTiles((prev) => !prev)}
      />
    </div>
  )
}
