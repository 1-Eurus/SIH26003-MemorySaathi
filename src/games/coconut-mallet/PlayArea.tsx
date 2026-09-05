import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type Modifier,
} from '@dnd-kit/core'
import { CircleDot } from 'lucide-react'
import { DraggableMallet } from './DraggableMallet'
import { DraggableCoconut } from './DraggableCoconut'
import { GoalZone } from './GoalZone'
import { ObstacleMarker } from './ObstacleMarker'
import { TargetBall } from './TargetBall'
import { ConfettiBurst } from './ConfettiBurst'
import { createBoundsModifier } from './modifiers'
import { DIFFICULTY_GOAL_SIZE, DIFFICULTY_OBSTACLE_COUNT, DIFFICULTY_OBSTACLE_SPEED } from './constants'
import type { Difficulty, GameMode, Obstacle, RoundResult } from './types'

interface PlayAreaProps {
  mode: GameMode
  difficulty: Difficulty
  sensitivityModifier: Modifier
  onRoundComplete: (result: RoundResult) => void
  onGraze: () => void
}

const MALLET_ID = 'mallet'
const COCONUT_ID = 'coconut'
const BALL_TARGET_ID = 'ball-target'
const GOAL_ID = 'goal'

const MALLET_START = { x: 25, y: 74 }
const BALL_START = { x: 54, y: 44 }
const MALLET_GOAL = { x: 85, y: 22 }

const COCONUT_START = { x: 13, y: 76 }
const COCONUT_GOAL = { x: 87, y: 24 }

const GRAZE_RADIUS_PERCENT = 7

function buildObstacles(difficulty: Difficulty): Obstacle[] {
  const count = DIFFICULTY_OBSTACLE_COUNT[difficulty]
  const speed = DIFFICULTY_OBSTACLE_SPEED[difficulty]
  return Array.from({ length: count }).map((_, index) => {
    const t = (index + 1) / (count + 1)
    return {
      id: `obstacle-${index}`,
      x: COCONUT_START.x + (COCONUT_GOAL.x - COCONUT_START.x) * t,
      y: 50 + (index % 2 === 0 ? -16 : 16),
      radius: 6,
      moving: difficulty !== 'easy',
      amplitude: 7,
      speed: speed * (0.7 + 0.2 * index),
      phase: index * 1.3,
    }
  })
}

function rectCenterPercent(rect: { left: number; top: number; width: number; height: number }, container: DOMRect) {
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  return {
    x: ((centerX - container.left) / container.width) * 100,
    y: ((centerY - container.top) / container.height) * 100,
  }
}

export function PlayArea({ mode, difficulty, sensitivityModifier, onRoundComplete, onGraze }: PlayAreaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const grazedRef = useRef<Set<string>>(new Set())
  const baseObstaclesRef = useRef<Obstacle[]>(buildObstacles(difficulty))
  const obstaclePositionsRef = useRef<Obstacle[]>(baseObstaclesRef.current)

  const [obstaclePositions, setObstaclePositions] = useState<Obstacle[]>(baseObstaclesRef.current)
  const [launched, setLaunched] = useState(false)
  const [launchOffset, setLaunchOffset] = useState({ x: 0, y: 0 })
  const [confetti, setConfetti] = useState<{ x: number; y: number } | null>(null)
  const [grazeFlash, setGrazeFlash] = useState<string | null>(null)
  const [dragKey, setDragKey] = useState(0)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const boundsModifier = useMemo(() => createBoundsModifier(() => containerRef.current), [])

  // Rebuild the obstacle course whenever difficulty or mode changes.
  useEffect(() => {
    baseObstaclesRef.current = buildObstacles(difficulty)
    setObstaclePositions(baseObstaclesRef.current)
  }, [difficulty, mode])

  // Clear transient round state (confetti, flashes, grazes) on mode switch.
  useEffect(() => {
    setLaunched(false)
    setConfetti(null)
    setGrazeFlash(null)
    grazedRef.current = new Set()
    setDragKey((key) => key + 1)
  }, [mode])

  useEffect(() => {
    obstaclePositionsRef.current = obstaclePositions
  }, [obstaclePositions])

  // Gentle sinusoidal drift for medium/hard obstacles, recomputed each frame
  // from the fixed baseline so motion oscillates instead of drifting away.
  useEffect(() => {
    if (mode !== 'coconut') return
    let frame: number
    const start = performance.now()
    const animate = (now: number) => {
      const t = (now - start) / 1000
      setObstaclePositions(
        baseObstaclesRef.current.map((obstacle) =>
          obstacle.moving
            ? { ...obstacle, y: obstacle.y + Math.sin(t * obstacle.speed + obstacle.phase) * obstacle.amplitude }
            : obstacle,
        ),
      )
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [mode])

  const goalSize = DIFFICULTY_GOAL_SIZE[difficulty]

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      if (mode !== 'coconut') return
      const rect = event.active.rect.current.translated
      const container = containerRef.current?.getBoundingClientRect()
      if (!rect || !container) return

      const pos = rectCenterPercent(rect, container)
      obstaclePositionsRef.current.forEach((obstacle) => {
        const dx = pos.x - obstacle.x
        const dy = pos.y - obstacle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < obstacle.radius + GRAZE_RADIUS_PERCENT && !grazedRef.current.has(obstacle.id)) {
          grazedRef.current.add(obstacle.id)
          setGrazeFlash(obstacle.id)
          onGraze()
          window.setTimeout(() => setGrazeFlash((current) => (current === obstacle.id ? null : current)), 300)
        }
      })
    },
    [mode, onGraze],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const container = containerRef.current?.getBoundingClientRect()
      const activeRect = event.active.rect.current.translated

      const scoreDrop = (targetId: string, goalCenter: { x: number; y: number }) => {
        const overOk = event.over?.id === targetId
        if (!overOk || !event.over || !activeRect) {
          return { success: false, accuracy: 0 }
        }
        const overRect = event.over.rect
        const dx = activeRect.left + activeRect.width / 2 - (overRect.left + overRect.width / 2)
        const dy = activeRect.top + activeRect.height / 2 - (overRect.top + overRect.height / 2)
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = overRect.width / 2 || 1
        const centering = Math.max(0, Math.min(100, 100 * (1 - distance / maxDistance)))
        setConfetti(goalCenter)
        return { success: true, accuracy: centering }
      }

      if (mode === 'mallet') {
        const { success, accuracy } = scoreDrop(BALL_TARGET_ID, MALLET_GOAL)
        if (success && container) {
          setLaunchOffset({
            x: ((MALLET_GOAL.x - BALL_START.x) / 100) * container.width,
            y: ((MALLET_GOAL.y - BALL_START.y) / 100) * container.height,
          })
          setLaunched(true)
          window.setTimeout(() => setLaunched(false), 600)
        }
        onRoundComplete({ success, accuracy })
      } else {
        const { success, accuracy: centering } = scoreDrop(GOAL_ID, COCONUT_GOAL)
        const accuracy = success ? Math.max(0, centering - grazedRef.current.size * 15) : 0
        onRoundComplete({ success, accuracy })
      }

      grazedRef.current = new Set()
      setDragKey((key) => key + 1)
    },
    [mode, onRoundComplete],
  )

  const modifiers = useMemo(() => [sensitivityModifier, boundsModifier], [sensitivityModifier, boundsModifier])

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-3xl border-4 border-[#E8D5B8]"
      style={{ aspectRatio: '16 / 9', background: 'linear-gradient(180deg, #FBF8F0 0%, #F1E3A4 150%)' }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={modifiers}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        {mode === 'mallet' ? (
          <>
            <GoalZone
              id={BALL_TARGET_ID}
              sizePercent={goalSize}
              xPercent={BALL_START.x}
              yPercent={BALL_START.y}
              isSuccess={launched}
              label="Aim here"
              icon={CircleDot}
            />
            <TargetBall x={BALL_START.x} y={BALL_START.y} launched={launched} launchOffsetPx={launchOffset} />
            <div
              className="absolute flex h-16 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-t-full border-4 border-[#355FC7] bg-[#355FC7]/10 sm:h-20 sm:w-24"
              style={{ left: `${MALLET_GOAL.x}%`, top: `${MALLET_GOAL.y}%` }}
            >
              <span className="text-xs font-bold text-[#355FC7] sm:text-sm">Goal</span>
            </div>
            <DraggableMallet key={dragKey} id={MALLET_ID} startXPercent={MALLET_START.x} startYPercent={MALLET_START.y} />
          </>
        ) : (
          <>
            {obstaclePositions.map((obstacle) => (
              <ObstacleMarker
                key={obstacle.id}
                x={obstacle.x}
                y={obstacle.y}
                radius={obstacle.radius}
                highlight={grazeFlash === obstacle.id}
              />
            ))}
            <GoalZone
              id={GOAL_ID}
              sizePercent={goalSize}
              xPercent={COCONUT_GOAL.x}
              yPercent={COCONUT_GOAL.y}
              isSuccess={Boolean(confetti)}
              label="Basket"
            />
            <DraggableCoconut key={dragKey} id={COCONUT_ID} startXPercent={COCONUT_START.x} startYPercent={COCONUT_START.y} />
          </>
        )}

        {confetti && <ConfettiBurst originX={confetti.x} originY={confetti.y} onDone={() => setConfetti(null)} />}
      </DndContext>
    </div>
  )
}
