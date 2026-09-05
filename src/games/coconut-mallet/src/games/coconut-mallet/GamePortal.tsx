import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Hammer, Trees } from 'lucide-react'
import { GameStats } from './GameStats'
import { ControlPanel } from './ControlPanel'
import { PlayArea } from './PlayArea'
import { StatusOverlay } from './StatusOverlay'
import { useGameAudio } from './useGameAudio'
import { createSensitivityModifier } from './modifiers'
import { computeHitScore, nextCombo, isLevelComplete, isGameOver } from './gameLogic'
import { LEVELS, STARTING_LEVEL_INDEX, STARTING_LIVES, SENSITIVITY_DEFAULT } from './constants'
import type { GameMode, GameStatus, StartingDifficulty } from './types'

const LEVEL_COMPLETE_DELAY_MS = 1400
const LIFE_LOST_DELAY_MS = 1200

export function GamePortal() {
  const [mode, setMode] = useState<GameMode>('mallet')
  const [startingDifficulty, setStartingDifficulty] = useState<StartingDifficulty>('normal')
  const [sensitivity, setSensitivity] = useState(SENSITIVITY_DEFAULT)

  const initialLevelIndex = STARTING_LEVEL_INDEX[startingDifficulty]
  const [levelIndex, setLevelIndex] = useState(initialLevelIndex)
  const [lives, setLives] = useState(STARTING_LIVES)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [hitsThisLevel, setHitsThisLevel] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(LEVELS[initialLevelIndex].timeLimitSeconds)
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing')
  const [attemptKey, setAttemptKey] = useState(0)

  const { playCheer, playPop, playStrike, playHazard, playGameOver } = useGameAudio()

  const levelConfig = LEVELS[levelIndex]
  const comboRef = useRef(combo)
  const livesRef = useRef(lives)
  useEffect(() => {
    comboRef.current = combo
  }, [combo])
  useEffect(() => {
    livesRef.current = lives
  }, [lives])

  const sensitivityModifier = useMemo(() => createSensitivityModifier(sensitivity), [sensitivity])

  // Declared early (before the effects that reference it) so it can be
  // listed honestly in their dependency arrays — its own deps are empty, so
  // its identity never changes and including it never causes extra reruns.
  const handleLifeLost = useCallback(() => {
    setGameStatus((current) => {
      if (current !== 'playing') return current
      const remaining = livesRef.current - 1
      setLives(remaining)
      setCombo(0)
      return isGameOver(remaining) ? 'gameOver' : 'lifeLost'
    })
  }, [])

  // ── Countdown timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (gameStatus !== 'playing') return
    const interval = window.setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [gameStatus])

  useEffect(() => {
    if (gameStatus === 'playing' && timeRemaining === 0) {
      handleLifeLost()
    }
  }, [timeRemaining, gameStatus, handleLifeLost])

  // ── Level completion ─────────────────────────────────────────────────
  useEffect(() => {
    if (gameStatus === 'playing' && isLevelComplete(hitsThisLevel, levelConfig)) {
      setGameStatus('levelComplete')
    }
  }, [hitsThisLevel, levelConfig, gameStatus])

  useEffect(() => {
    if (gameStatus !== 'levelComplete') return
    const timeout = window.setTimeout(() => {
      const nextIndex = levelIndex + 1
      if (nextIndex < LEVELS.length) {
        setLevelIndex(nextIndex)
        setHitsThisLevel(0)
        setTimeRemaining(LEVELS[nextIndex].timeLimitSeconds)
        setGameStatus('playing')
        setAttemptKey((key) => key + 1)
      } else {
        setGameStatus('victory')
      }
    }, LEVEL_COMPLETE_DELAY_MS)
    return () => window.clearTimeout(timeout)
  }, [gameStatus, levelIndex])

  // ── Life-loss sound + retry ──────────────────────────────────────────
  useEffect(() => {
    if (gameStatus === 'lifeLost') playHazard()
    if (gameStatus === 'gameOver') playGameOver()
    if (gameStatus === 'victory') playCheer()
  }, [gameStatus, playHazard, playGameOver, playCheer])

  useEffect(() => {
    if (gameStatus !== 'lifeLost') return
    const timeout = window.setTimeout(() => {
      setHitsThisLevel(0)
      setTimeRemaining(levelConfig.timeLimitSeconds)
      setGameStatus('playing')
      setAttemptKey((key) => key + 1)
    }, LIFE_LOST_DELAY_MS)
    return () => window.clearTimeout(timeout)
  }, [gameStatus, levelConfig])

  // ── Scoring ───────────────────────────────────────────────────────────
  const handleHit = useCallback(() => {
    setScore((prev) => prev + computeHitScore(comboRef.current))
    setCombo((prev) => nextCombo(prev))
    setHitsThisLevel((prev) => prev + 1)
    playCheer()
  }, [playCheer])

  // ── Restart / difficulty change ──────────────────────────────────────
  const startRun = useCallback((fromLevelIndex: number) => {
    setLevelIndex(fromLevelIndex)
    setLives(STARTING_LIVES)
    setScore(0)
    setCombo(0)
    setHitsThisLevel(0)
    setTimeRemaining(LEVELS[fromLevelIndex].timeLimitSeconds)
    setGameStatus('playing')
    setAttemptKey((key) => key + 1)
  }, [])

  const handlePlayAgain = useCallback(() => {
    startRun(STARTING_LEVEL_INDEX[startingDifficulty])
  }, [startRun, startingDifficulty])

  const handleStartingDifficultyChange = useCallback(
    (difficulty: StartingDifficulty) => {
      setStartingDifficulty(difficulty)
      startRun(STARTING_LEVEL_INDEX[difficulty])
    },
    [startRun],
  )

  const handleModeChange = useCallback(
    (newMode: GameMode) => {
      setMode(newMode)
      setHitsThisLevel(0)
      setTimeRemaining(levelConfig.timeLimitSeconds)
      setGameStatus('playing')
      setAttemptKey((key) => key + 1)
    },
    [levelConfig],
  )

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 sm:gap-5 sm:p-6" style={{ background: '#FBF8F0' }}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1D2B49] sm:text-3xl">Coconut &amp; Mallet Challenge</h1>
          <p className="mt-1 text-sm font-semibold text-[#7A6A5A] sm:text-base">
            A moving target, real hazards, and levels that get genuinely harder.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full border-2 border-[#E8D5B8] bg-white p-1">
          <button
            type="button"
            onClick={() => handleModeChange('mallet')}
            className={`flex min-h-[52px] items-center gap-2 rounded-full px-4 font-bold transition-colors ${
              mode === 'mallet' ? 'bg-[#355FC7] text-white' : 'text-[#1D2B49]'
            }`}
          >
            <Hammer className="h-5 w-5" strokeWidth={2.4} />
            Mallet Strike
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('coconut')}
            className={`flex min-h-[52px] items-center gap-2 rounded-full px-4 font-bold transition-colors ${
              mode === 'coconut' ? 'bg-[#355FC7] text-white' : 'text-[#1D2B49]'
            }`}
          >
            <Trees className="h-5 w-5" strokeWidth={2.4} />
            Coconut Goal
          </button>
        </div>
      </header>

      <GameStats
        level={levelConfig.level}
        lives={lives}
        maxLives={STARTING_LIVES}
        score={score}
        combo={combo}
        timeRemaining={timeRemaining}
      />

      <div className="relative">
        <PlayArea
          key={attemptKey}
          mode={mode}
          levelConfig={levelConfig}
          sensitivityModifier={sensitivityModifier}
          onHit={handleHit}
          onHazardHit={handleLifeLost}
          onGraze={playPop}
          onStrike={playStrike}
        />
        <StatusOverlay status={gameStatus} level={levelConfig.level} score={score} onPlayAgain={handlePlayAgain} />
      </div>

      <ControlPanel
        startingDifficulty={startingDifficulty}
        onStartingDifficultyChange={handleStartingDifficultyChange}
        sensitivity={sensitivity}
        onSensitivityChange={setSensitivity}
      />
    </div>
  )
}
