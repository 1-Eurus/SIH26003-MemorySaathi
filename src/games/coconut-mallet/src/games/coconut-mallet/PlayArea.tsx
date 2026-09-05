import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type Modifier,
} from '@dnd-kit/core'
import { DraggableMallet } from './DraggableMallet'
import { DraggableCoconut } from './DraggableCoconut'
import { GoalZone } from './GoalZone'
import { ObstacleMarker } from './ObstacleMarker'
import { ConfettiBurst } from './ConfettiBurst'
import { createBoundsModifier } from './modifiers'
import {
  stepBouncingBody,
  circlesOverlap,
  velocityToward,
  velocityFromAngle,
  type Vector2,
  type Bounds,
} from './physics'
import type { LevelConfig } from './constants'
import type { GameMode, Obstacle } from './types'

interface PlayAreaProps {
  mode: GameMode
  levelConfig: LevelConfig
  sensitivityModifier: Modifier
  /** A successful goal/hit — mallet ball reaching the net, or coconut reaching the basket. */
  onHit: () => void
  /** A real hazard: an obstacle touched in Coconut mode, costing a life. */
  onHazardHit: () => void
  onGraze: () => void
  onStrike: () => void
}

const MALLET_ID = 'mallet'
const COCONUT_ID = 'coconut'
const GOAL_ID = 'goal'

const MALLET_START = { x: 25, y: 74 }
const MALLET_GOAL = { x: 85, y: 22 }
const MALLET_RADIUS = 10 // collision radius, percent of play-area width
const BALL_RADIUS = 6
const STRIKE_SPEED_MULTIPLIER = 1.4

const COCONUT_START = { x: 13, y: 76 }
const COCONUT_GOAL = { x: 87, y: 24 }
const GRAZE_RADIUS_PERCENT = 7

function buildObstacles(levelConfig: LevelConfig): Obstacle[] {
  const { obstacleCount, obstacleSpeedMultiplier } = levelConfig
  return Array.from({ length: obstacleCount }).map((_, index) => {
    const t = (index + 1) / (obstacleCount + 1)
    return {
      id: `obstacle-${index}`,
      x: COCONUT_START.x + (COCONUT_GOAL.x - COCONUT_START.x) * t,
      y: 50 + (index % 2 === 0 ? -16 : 16),
      radius: 6,
      moving: true,
      amplitude: 7,
      speed: obstacleSpeedMultiplier * (0.9 + 0.2 * index),
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

function randomBallSpawn(): Vector2 {
  return { x: 25 + Math.random() * 50, y: 25 + Math.random() * 40 }
}

export function PlayArea({ mode, levelConfig, sensitivityModifier, onHit, onHazardHit, onGraze, onStrike }: PlayAreaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const ballElRef = useRef<HTMLDivElement | null>(null)

  const grazedRef = useRef<Set<string>>(new Set())
  const lifeLostThisDragRef = useRef(false)
  const hasStruckRef = useRef(false)

  const ballStateRef = useRef<{ pos: Vector2; vel: Vector2; flyingToGoal: boolean }>({
    pos: randomBallSpawn(),
    vel: velocityFromAngle(Math.random() * Math.PI * 2, levelConfig.ballSpeedPercent),
    flyingToGoal: false,
  })

  const onHitRef = useRef(onHit)
  const onStrikeRef = useRef(onStrike)
  useEffect(() => {
    onHitRef.current = onHit
    onStrikeRef.current = onStrike
  }, [onHit, onStrike])

  const baseObstaclesRef = useRef<Obstacle[]>(buildObstacles(levelConfig))
  const obstaclePositionsRef = useRef<Obstacle[]>(baseObstaclesRef.current)
  const [obstaclePositions, setObstaclePositions] = useState<Obstacle[]>(baseObstaclesRef.current)

  const [confetti, setConfetti] = useState<{ x: number; y: number } | null>(null)
  const [grazeFlash, setGrazeFlash] = useState<string | null>(null)
  const [hazardShake, setHazardShake] = useState(false)
  const [dragKey, setDragKey] = useState(0)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const boundsModifier = useMemo(() => createBoundsModifier(() => containerRef.current), [])
  const modifiers = useMemo(() => [sensitivityModifier, boundsModifier], [sensitivityModifier, boundsModifier])

  useEffect(() => {
    obstaclePositionsRef.current = obstaclePositions
  }, [obstaclePositions])

  // Moving obstacles (Coconut Goal mode) — recomputed from the level config.
  useEffect(() => {
    if (mode !== 'coconut') return
    baseObstaclesRef.current = buildObstacles(levelConfig)
    setObstaclePositions(baseObstaclesRef.current)

    let frame: number
    const start = performance.now()
    const animate = (now: number) => {
      const t = (now - start) / 1000
      setObstaclePositions(
        baseObstaclesRef.current.map((obstacle) => ({
          ...obstacle,
          y: obstacle.y + Math.sin(t * obstacle.speed + obstacle.phase) * obstacle.amplitude,
        })),
      )
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [mode, levelConfig])

  // Real-time ball physics (Mallet Strike mode) — bounces continuously; a
  // mallet strike (detected in handleDragMove) redirects it toward the net.
  useEffect(() => {
    if (mode !== 'mallet') return
    const bounds: Bounds = { minX: BALL_RADIUS, maxX: 100 - BALL_RADIUS, minY: BALL_RADIUS, maxY: 100 - BALL_RADIUS }
    let frameId: number
    let lastTime: number | null = null

    const tick = (time: number) => {
      if (lastTime === null) lastTime = time
      const dt = Math.min((time - lastTime) / 1000, 0.05) // cap dt so a tab switch can't fling the ball
      lastTime = time

      const state = ballStateRef.current
      const stepped = stepBouncingBody(state.pos, state.vel, dt, bounds, BALL_RADIUS)
      state.pos = stepped.position
      state.vel = stepped.velocity

      if (state.flyingToGoal && circlesOverlap(state.pos, BALL_RADIUS, MALLET_GOAL, levelConfig.goalSizePercent / 2)) {
        state.flyingToGoal = false
        state.pos = randomBallSpawn()
        state.vel = velocityFromAngle(Math.random() * Math.PI * 2, levelConfig.ballSpeedPercent)
        setConfetti({ x: MALLET_GOAL.x, y: MALLET_GOAL.y })
        onHitRef.current()
      }

      if (ballElRef.current) {
        ballElRef.current.style.left = `${state.pos.x}%`
        ballElRef.current.style.top = `${state.pos.y}%`
      }

      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [mode, levelConfig])

  // Reset transient visuals whenever the mode changes.
  useEffect(() => {
    setConfetti(null)
    setGrazeFlash(null)
    setHazardShake(false)
    grazedRef.current = new Set()
    lifeLostThisDragRef.current = false
    hasStruckRef.current = false
    setDragKey((key) => key + 1)
  }, [mode])

  const handleDragStart = useCallback(() => {
    lifeLostThisDragRef.current = false
  }, [])

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const rect = event.active.rect.current.translated
      const container = containerRef.current?.getBoundingClientRect()
      if (!rect || !container) return
      const pos = rectCenterPercent(rect, container)

      if (mode === 'mallet') {
        const state = ballStateRef.current
        const overlapping = circlesOverlap(pos, MALLET_RADIUS, state.pos, BALL_RADIUS)
        if (overlapping && !hasStruckRef.current && !state.flyingToGoal) {
          hasStruckRef.current = true
          state.vel = velocityToward(state.pos, MALLET_GOAL, levelConfig.ballSpeedPercent * STRIKE_SPEED_MULTIPLIER)
          state.flyingToGoal = true
          onStrikeRef.current()
        } else if (!overlapping) {
          hasStruckRef.current = false
        }
        return
      }

      // Coconut Goal mode — obstacles are real hazards now: the first one
      // touched in a given drag costs a life immediately (capped at one per
      // drag so grazing several obstacles in a row isn't disproportionate).
      obstaclePositionsRef.current.forEach((obstacle) => {
        const distance = Math.hypot(pos.x - obstacle.x, pos.y - obstacle.y)
        if (distance < obstacle.radius + GRAZE_RADIUS_PERCENT && !grazedRef.current.has(obstacle.id)) {
          grazedRef.current.add(obstacle.id)
          setGrazeFlash(obstacle.id)
          onGraze()
          window.setTimeout(() => setGrazeFlash((current) => (current === obstacle.id ? null : current)), 300)

          if (!lifeLostThisDragRef.current) {
            lifeLostThisDragRef.current = true
            setHazardShake(true)
            window.setTimeout(() => setHazardShake(false), 400)
            onHazardHit()
          }
        }
      })
    },
    [mode, levelConfig, onGraze, onHazardHit],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (mode === 'coconut') {
        const success = event.over?.id === GOAL_ID
        if (success) {
          setConfetti({ x: COCONUT_GOAL.x, y: COCONUT_GOAL.y })
          onHitRef.current()
        }
      }
      grazedRef.current = new Set()
      setDragKey((key) => key + 1)
    },
    [mode],
  )

  const goalSize = levelConfig.goalSizePercent

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-3xl border-4 transition-shadow ${
        hazardShake ? 'border-[#C0392B] shadow-[0_0_0_4px_rgba(192,57,43,0.35)]' : 'border-[#E8D5B8]'
      }`}
      style={{ aspectRatio: '16 / 9', background: 'linear-gradient(180deg, #FBF8F0 0%, #F1E3A4 150%)' }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        modifiers={modifiers}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        {mode === 'mallet' ? (
          <>
            <div
              ref={ballElRef}
              className="pointer-events-none absolute z-10 rounded-full border-4 border-[#1D2B49] shadow-[0_4px_0_0_#12203a]"
              style={{
                left: `${ballStateRef.current.pos.x}%`,
                top: `${ballStateRef.current.pos.y}%`,
                width: `${BALL_RADIUS * 2}%`,
                aspectRatio: '1 / 1',
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #EFE0C8 60%, #C9B78E 100%)',
              }}
              aria-hidden="true"
            />
            <div
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-t-full border-4 border-[#355FC7] bg-[#355FC7]/10"
              style={{
                left: `${MALLET_GOAL.x}%`,
                top: `${MALLET_GOAL.y}%`,
                width: `${goalSize}%`,
                aspectRatio: '1 / 1',
              }}
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
