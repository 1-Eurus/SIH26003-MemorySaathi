// ─── Coconut & Mallet Challenge — shared types ────────────────────────────

/** Which mini-game is currently active. */
export type GameMode = 'mallet' | 'coconut'

/** Which level index to start from — see STARTING_LEVEL_INDEX in constants.ts. */
export type StartingDifficulty = 'easy' | 'normal' | 'hard'

export type GameStatus = 'playing' | 'levelComplete' | 'lifeLost' | 'gameOver' | 'victory'

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

/** Reported after each successful goal/hit, for scoring with combo bonuses. */
export interface HitResult {
  comboAtHit: number
}
