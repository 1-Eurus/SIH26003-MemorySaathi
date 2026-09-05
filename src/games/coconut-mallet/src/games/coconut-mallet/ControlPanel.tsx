import { Gauge, Target } from 'lucide-react'
import { SENSITIVITY_MAX, SENSITIVITY_MIN } from './constants'
import type { StartingDifficulty } from './types'

interface ControlPanelProps {
  startingDifficulty: StartingDifficulty
  onStartingDifficultyChange: (difficulty: StartingDifficulty) => void
  sensitivity: number
  onSensitivityChange: (value: number) => void
}

const DIFFICULTY_OPTIONS: { value: StartingDifficulty; label: string }[] = [
  { value: 'easy', label: 'Easy start' },
  { value: 'normal', label: 'Normal start' },
  { value: 'hard', label: 'Hard start' },
]

export function ControlPanel({ startingDifficulty, onStartingDifficultyChange, sensitivity, onSensitivityChange }: ControlPanelProps) {
  return (
    <div className="grid gap-4 rounded-2xl border-2 border-[#E8D5B8] bg-white p-4 sm:grid-cols-2 sm:p-5">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Target className="h-5 w-5 text-[#355FC7]" strokeWidth={2.4} />
          <span className="font-bold text-[#1D2B49]">Starting level</span>
        </div>
        <p className="mb-2 text-xs font-semibold text-[#9A8A76]">Changing this restarts your run from that level.</p>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onStartingDifficultyChange(option.value)}
              className={`min-h-[52px] rounded-xl border-2 font-bold transition-colors ${
                startingDifficulty === option.value
                  ? 'border-[#355FC7] bg-[#355FC7] text-white'
                  : 'border-[#E8D5B8] bg-[#FBF8F0] text-[#1D2B49] hover:bg-[#F1E3A4]/40'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-[#355FC7]" strokeWidth={2.4} />
            <span className="font-bold text-[#1D2B49]">Drag sensitivity</span>
          </div>
          <span className="font-bold text-[#355FC7]">{sensitivity.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min={SENSITIVITY_MIN}
          max={SENSITIVITY_MAX}
          step={0.1}
          value={sensitivity}
          onChange={(event) => onSensitivityChange(Number(event.target.value))}
          className="h-3 w-full cursor-pointer accent-[#355FC7]"
          aria-label="Drag sensitivity"
        />
        <div className="mt-1 flex justify-between text-xs font-semibold text-[#9A8A76]">
          <span>More resistance</span>
          <span>More responsive</span>
        </div>
      </div>
    </div>
  )
}
