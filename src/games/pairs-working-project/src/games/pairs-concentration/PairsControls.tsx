import { RotateCcw } from 'lucide-react'
import { GRID_OPTIONS } from './constants'

interface PairsControlsProps {
  pairCount: number
  onPairCountChange: (pairCount: number) => void
  onNewRound: () => void
}

export function PairsControls({ pairCount, onPairCountChange, onNewRound }: PairsControlsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-[#E8D5B8] bg-white p-4 sm:p-5">
      <div>
        <span className="mb-2 block font-bold text-[#1D2B49]">Board size</span>
        <div className="grid grid-cols-3 gap-2">
          {GRID_OPTIONS.map((option) => (
            <button
              key={option.pairCount}
              type="button"
              onClick={() => onPairCountChange(option.pairCount)}
              className={`min-h-[52px] rounded-xl border-2 font-bold transition-colors ${
                pairCount === option.pairCount
                  ? 'border-[#355FC7] bg-[#355FC7] text-white'
                  : 'border-[#E8D5B8] bg-[#FBF8F0] text-[#1D2B49] hover:bg-[#F1E3A4]/40'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onNewRound}
        className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-2 border-[#E8D5B8] bg-[#FBF8F0] px-4 font-bold text-[#C4622D]"
      >
        <RotateCcw className="h-5 w-5" />
        New round
      </button>
    </div>
  )
}
