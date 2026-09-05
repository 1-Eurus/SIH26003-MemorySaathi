// ─── Pure 2D physics (percent-of-play-area units, not pixels) ─────────────
// Kept dependency-free so it's directly unit-testable without a browser.

export interface Vector2 {
  x: number
  y: number
}

export interface Bounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

/**
 * Advances a circular body by `velocity * dt`, reflecting its velocity off
 * whichever wall it would otherwise pass through (simple elastic bounce).
 * `radius` keeps the body's edge — not its center — from crossing the wall.
 */
export function stepBouncingBody(
  position: Vector2,
  velocity: Vector2,
  dt: number,
  bounds: Bounds,
  radius: number,
): { position: Vector2; velocity: Vector2 } {
  let x = position.x + velocity.x * dt
  let y = position.y + velocity.y * dt
  let vx = velocity.x
  let vy = velocity.y

  if (x - radius < bounds.minX) {
    x = bounds.minX + radius
    vx = Math.abs(vx)
  } else if (x + radius > bounds.maxX) {
    x = bounds.maxX - radius
    vx = -Math.abs(vx)
  }

  if (y - radius < bounds.minY) {
    y = bounds.minY + radius
    vy = Math.abs(vy)
  } else if (y + radius > bounds.maxY) {
    y = bounds.maxY - radius
    vy = -Math.abs(vy)
  }

  return { position: { x, y }, velocity: { x: vx, y: vy } }
}

export function distanceBetween(a: Vector2, b: Vector2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export function circlesOverlap(aCenter: Vector2, aRadius: number, bCenter: Vector2, bRadius: number): boolean {
  return distanceBetween(aCenter, bCenter) < aRadius + bRadius
}

/** A unit-length velocity vector of magnitude `speed` pointing from `from` toward `to`. Zero vector if the points coincide. */
export function velocityToward(from: Vector2, to: Vector2, speed: number): Vector2 {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  if (distance === 0) return { x: 0, y: 0 }
  return { x: (dx / distance) * speed, y: (dy / distance) * speed }
}

/** A vector pointing from `from` directly away from `to`, at magnitude `distance` — used for knockback. */
export function pushAway(from: Vector2, to: Vector2, distance: number): Vector2 {
  const dx = from.x - to.x
  const dy = from.y - to.y
  const currentDistance = Math.sqrt(dx * dx + dy * dy)
  if (currentDistance === 0) return { x: from.x + distance, y: from.y }
  return {
    x: from.x + (dx / currentDistance) * distance,
    y: from.y + (dy / currentDistance) * distance,
  }
}

/** Clamps a point to stay within bounds (inclusive of a radius margin on all sides). */
export function clampToBounds(point: Vector2, bounds: Bounds, radius: number): Vector2 {
  return {
    x: Math.min(Math.max(point.x, bounds.minX + radius), bounds.maxX - radius),
    y: Math.min(Math.max(point.y, bounds.minY + radius), bounds.maxY - radius),
  }
}

/** A deterministic-enough "random" starting velocity of the given speed, from an angle in radians. */
export function velocityFromAngle(angleRadians: number, speed: number): Vector2 {
  return { x: Math.cos(angleRadians) * speed, y: Math.sin(angleRadians) * speed }
}
