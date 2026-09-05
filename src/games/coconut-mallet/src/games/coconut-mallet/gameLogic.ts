import { BASE_HIT_SCORE, COMBO_SCORE_STEP, MAX_COMBO_MULTIPLIER, type LevelConfig } from './constants'

/** Points awarded for a hit, given the combo streak length *before* this hit. */
export function computeHitScore(comboBeforeHit: number): number {
  return BASE_HIT_SCORE + comboBeforeHit * COMBO_SCORE_STEP
}

/** The new combo streak length after a successful hit, capped so it can't grow forever. */
export function nextCombo(currentCombo: number): number {
  return Math.min(currentCombo + 1, MAX_COMBO_MULTIPLIER)
}

export function isLevelComplete(hitsThisLevel: number, levelConfig: LevelConfig): boolean {
  return hitsThisLevel >= levelConfig.hitsToAdvance
}

export function isGameOver(livesRemaining: number): boolean {
  return livesRemaining <= 0
}
