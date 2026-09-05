import type { Difficulty } from './types'

// Goal/target diameter as a percentage of the play area width. Larger goal
// sizes are more forgiving for patients still building fine motor control.
export const DIFFICULTY_GOAL_SIZE: Record<Difficulty, number> = {
  easy: 24,
  medium: 17,
  hard: 12,
}

export const DIFFICULTY_OBSTACLE_COUNT: Record<Difficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 5,
}

export const DIFFICULTY_OBSTACLE_SPEED: Record<Difficulty, number> = {
  easy: 0.35,
  medium: 0.65,
  hard: 1,
}

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
} as const
