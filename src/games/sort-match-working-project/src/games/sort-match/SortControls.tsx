import { RotateCcw } from 'lucide-react'
import { SORT_SETS } from './constants'

interface SortControlsProps {
  selectedSetId: string
  onSetChange: (setId: string) => void
  onNewRound: () => void
}

export function SortControls({ selectedSetId, onSetChange, onNewRound }: SortControlsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-[#E8D5B8] bg-white p-4 sm:p-5">
      <div>
        <span className="mb-2 block font-bold text-[#1D2B49]">Category set</span>
        <div className="grid grid-cols-2 gap-2">
          {SORT_SETS.map((set) => (
            <button
              key={set.id}
              type="button"
              onClick={() => onSetChange(set.id)}
              className={`min-h-[52px] rounded-xl border-2 px-2 text-sm font-bold transition-colors ${
                selectedSetId === set.id
                  ? 'border-[#355FC7] bg-[#355FC7] text-white'
                  : 'border-[#E8D5B8] bg-[#FBF8F0] text-[#1D2B49] hover:bg-[#F1E3A4]/40'
              }`}
            >
              {set.name}
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
