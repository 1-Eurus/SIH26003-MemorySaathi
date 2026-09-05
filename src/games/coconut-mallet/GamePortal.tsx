import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Hammer, Trees, RotateCcw, Play, Pause } from 'lucide-react'
import { GameStats } from './GameStats'
import { ControlPanel } from './ControlPanel'
import { PlayArea } from './PlayArea'
import { useGameAudio } from './useGameAudio'
import { createSensitivityModifier } from './modifiers'
import { SENSITIVITY_DEFAULT } from './constants'
import type { Difficulty, GameMode, RoundResult } from './types'

interface SessionStats {
  attempts: number
  successes: number
  accuracySum: number
}

const INITIAL_STATS: SessionStats = { attempts: 0, successes: 0, accuracySum: 0 }
const TICK_MS = 250

export function GamePortal() {
  const [mode, setMode] = useState<GameMode>('mallet')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [sensitivity, setSensitivity] = useState(SENSITIVITY_DEFAULT)
  const [stats, setStats] = useState<SessionStats>(INITIAL_STATS)
  const [running, setRunning] = useState(true)
  const [elapsedMs, setElapsedMs] = useState(0)

  const { playCheer, playThud, playPop } = useGameAudio()
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = window.setInterval(() => setElapsedMs((prev) => prev + TICK_MS), TICK_MS)
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
    }
  }, [running])

  const handleRoundComplete = useCallback(
    (result: RoundResult) => {
      setStats((prev) => ({
        attempts: prev.attempts + 1,
        successes: prev.successes + (result.success ? 1 : 0),
        accuracySum: prev.accuracySum + result.accuracy,
      }))
      if (result.success) {
        playCheer()
      } else {
        playThud()
      }
    },
    [playCheer, playThud],
  )

  const handleReset = useCallback(() => {
    setStats(INITIAL_STATS)
    setElapsedMs(0)
    setRunning(true)
  }, [])

  const sensitivityModifier = useMemo(() => createSensitivityModifier(sensitivity), [sensitivity])
  const averageAccuracy = stats.attempts > 0 ? stats.accuracySum / stats.attempts : 0

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 sm:gap-5 sm:p-6" style={{ background: '#FBF8F0' }}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1D2B49] sm:text-3xl">Coconut &amp; Mallet Challenge</h1>
          <p className="mt-1 text-sm font-semibold text-[#7A6A5A] sm:text-base">
            A gentle drag practice game for hand-eye coordination and steady motion.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full border-2 border-[#E8D5B8] bg-white p-1">
          <button
            type="button"
            onClick={() => setMode('mallet')}
            className={`flex min-h-[52px] items-center gap-2 rounded-full px-4 font-bold transition-colors ${
              mode === 'mallet' ? 'bg-[#355FC7] text-white' : 'text-[#1D2B49]'
            }`}
          >
            <Hammer className="h-5 w-5" strokeWidth={2.4} />
            Mallet Strike
          </button>
          <button
            type="button"
            onClick={() => setMode('coconut')}
            className={`flex min-h-[52px] items-center gap-2 rounded-full px-4 font-bold transition-colors ${
              mode === 'coconut' ? 'bg-[#355FC7] text-white' : 'text-[#1D2B49]'
            }`}
          >
            <Trees className="h-5 w-5" strokeWidth={2.4} />
            Coconut Goal
          </button>
        </div>
      </header>

      <GameStats successes={stats.successes} attempts={stats.attempts} elapsedMs={elapsedMs} accuracy={averageAccuracy} />

      <PlayArea
        mode={mode}
        difficulty={difficulty}
        sensitivityModifier={sensitivityModifier}
        onRoundComplete={handleRoundComplete}
        onGraze={playPop}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <ControlPanel
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            sensitivity={sensitivity}
            onSensitivityChange={setSensitivity}
          />
        </div>

        <div className="flex gap-2 sm:w-48 sm:flex-col">
          <button
            type="button"
            onClick={() => setRunning((prev) => !prev)}
            className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#E8D5B8] bg-white px-4 font-bold text-[#1D2B49] sm:flex-none"
          >
            {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {running ? 'Pause timer' : 'Resume timer'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#E8D5B8] bg-white px-4 font-bold text-[#C4622D] sm:flex-none"
          >
            <RotateCcw className="h-5 w-5" />
            Reset session
          </button>
        </div>
      </div>
    </div>
  )
}
