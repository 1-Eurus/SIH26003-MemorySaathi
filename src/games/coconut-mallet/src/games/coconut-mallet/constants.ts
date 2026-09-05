export interface LevelConfig {
  level: number
  /** Goal diameter as a percentage of the play area width — shrinks as levels rise. */
  goalSizePercent: number
  /** Ball travel speed in Mallet Strike mode, in percent-of-play-area per second. */
  ballSpeedPercent: number
  /** Obstacle count in Coconut Goal mode. */
  obstacleCount: number
  /** Multiplier applied to each obstacle's base drift speed. */
  obstacleSpeedMultiplier: number
  /** Seconds allowed to reach `hitsToAdvance` before a life is lost and the level restarts. */
  timeLimitSeconds: number
  /** Successful hits/goals needed to clear this level. */
  hitsToAdvance: number
}

export const LEVELS: LevelConfig[] = [
  { level: 1, goalSizePercent: 16, ballSpeedPercent: 20, obstacleCount: 2, obstacleSpeedMultiplier: 0.5, timeLimitSeconds: 45, hitsToAdvance: 3 },
  { level: 2, goalSizePercent: 14, ballSpeedPercent: 26, obstacleCount: 3, obstacleSpeedMultiplier: 0.7, timeLimitSeconds: 40, hitsToAdvance: 4 },
  { level: 3, goalSizePercent: 12, ballSpeedPercent: 32, obstacleCount: 4, obstacleSpeedMultiplier: 0.9, timeLimitSeconds: 38, hitsToAdvance: 4 },
  { level: 4, goalSizePercent: 11, ballSpeedPercent: 38, obstacleCount: 5, obstacleSpeedMultiplier: 1.1, timeLimitSeconds: 35, hitsToAdvance: 5 },
  { level: 5, goalSizePercent: 10, ballSpeedPercent: 44, obstacleCount: 6, obstacleSpeedMultiplier: 1.3, timeLimitSeconds: 32, hitsToAdvance: 5 },
  { level: 6, goalSizePercent: 9, ballSpeedPercent: 50, obstacleCount: 7, obstacleSpeedMultiplier: 1.5, timeLimitSeconds: 30, hitsToAdvance: 6 },
  { level: 7, goalSizePercent: 8, ballSpeedPercent: 56, obstacleCount: 8, obstacleSpeedMultiplier: 1.7, timeLimitSeconds: 28, hitsToAdvance: 6 },
  { level: 8, goalSizePercent: 7, ballSpeedPercent: 62, obstacleCount: 9, obstacleSpeedMultiplier: 1.9, timeLimitSeconds: 25, hitsToAdvance: 7 },
]

/** "Starting difficulty" the player can pick — which level index to begin at, not a separate config. */
export const STARTING_LEVEL_INDEX: Record<'easy' | 'normal' | 'hard', number> = {
  easy: 0,
  normal: 2,
  hard: 4,
}

export const STARTING_LIVES = 3
export const MAX_COMBO_MULTIPLIER = 5
export const BASE_HIT_SCORE = 100
export const COMBO_SCORE_STEP = 25 // extra points per combo tier, on top of the base

export const SENSITIVITY_MIN = 0.5
export const SENSITIVITY_MAX = 1.8
export const SENSITIVITY_DEFAULT = 1

// Palette reused from the app's Guidelines.md (Sunlit Modular / NE India
// warmth) plus a couple of game-specific wood and husk tones. Kept here as
// a single reference even where components inline the hex values directly.
export const COLORS = {
  ivory: '#FBF8F0',
  butter: '#F1E3A4',
  navy: '#1D2B49',
  cobalt: '#355FC7',
  terracotta: '#C4622D',
  bamboo: '#4A7C59',
  sand: '#EFE0C8',
  huskBrown: '#3D2314',
  malletWood: '#A9702D',
  danger: '#C0392B',
} as const
