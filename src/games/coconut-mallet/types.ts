// ─── Coconut & Mallet Challenge — shared types ────────────────────────────

/** Which mini-game is currently active. */
export type GameMode = 'mallet' | 'coconut'

/** Controls goal size and obstacle count/speed. */
export type Difficulty = 'easy' | 'medium' | 'hard'

/**
 * A single obstacle in Coconut Goal mode. Coordinates are percentages of
 * the play area (0–100), so the layout scales with the responsive 16:9
 * board instead of being tied to pixel values.
 */
export interface Obstacle {
  id: string
  x: number
  /** Baseline y position; moving obstacles oscillate around this value. */
  y: number
  /** Radius as a percentage of the play area width. */
  radius: number
  moving: boolean
  /** How far (in percentage points) a moving obstacle drifts from baseline. */
  amplitude: number
  /** Oscillation speed in radians/second. */
  speed: number
  /** Phase offset so obstacles don't all move in lockstep. */
  phase: number
}

/** Outcome reported by the play area after each drag attempt. */
export interface RoundResult {
  success: boolean
  /** 0–100 precision score for the attempt (0 for a clean miss). */
  accuracy: number
}
