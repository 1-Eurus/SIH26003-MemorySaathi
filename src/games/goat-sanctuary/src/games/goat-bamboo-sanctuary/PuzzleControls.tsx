import { Undo2, RotateCcw, Eye } from 'lucide-react'
import type { GridSize } from './types'

interface PuzzleControlsProps {
  gridSize: GridSize
  onGridSizeChange: (size: GridSize) => void
  onUndo: () => void
  canUndo: boolean
  onReset: () => void
  highContrast: boolean
  onToggleHighContrast: () => void
  largeTiles: boolean
  onToggleLargeTiles: () => void
}

const GRID_SIZE_OPTIONS: { value: GridSize; label: string }[] = [
  { value: 5, label: 'Easy 5×5' },
  { value: 6, label: 'Calm 6×6' },
  { value: 7, label: 'Gentle 7×7' },
  { value: 8, label: 'Relaxed 8×8' },
]

export function PuzzleControls({
  gridSize,
  onGridSizeChange,
  onUndo,
  canUndo,
  onReset,
  highContrast,
  onToggleHighContrast,
  largeTiles,
  onToggleLargeTiles,
}: PuzzleControlsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-[#D8CBA9] bg-white p-4 sm:p-5">
      <div>
        <span className="mb-2 block font-bold text-[#2E3B2C]">Pasture size</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GRID_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onGridSizeChange(option.value)}
              className={`min-h-[52px] rounded-xl border-2 font-bold transition-colors ${
                gridSize === option.value
                  ? 'border-[#4A7C59] bg-[#4A7C59] text-white'
                  : 'border-[#D8CBA9] bg-[#FBF8ED] text-[#2E3B2C] hover:bg-[#F1E9C9]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#D8CBA9] bg-[#FBF8ED] px-4 font-bold text-[#2E3B2C] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Undo2 className="h-5 w-5" />
          Undo
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#D8CBA9] bg-[#FBF8ED] px-4 font-bold text-[#7A4A22]"
        >
          <RotateCcw className="h-5 w-5" />
          Reset pasture
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onToggleHighContrast}
          aria-pressed={highContrast}
          className={`flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 px-4 font-bold transition-colors ${
            highContrast ? 'border-[#12331F] bg-[#12331F] text-white' : 'border-[#D8CBA9] bg-[#FBF8ED] text-[#2E3B2C]'
          }`}
        >
          <Eye className="h-5 w-5" />
          High contrast
        </button>
        <button
          type="button"
          onClick={onToggleLargeTiles}
          aria-pressed={largeTiles}
          className={`flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 px-4 font-bold transition-colors ${
            largeTiles ? 'border-[#4A7C59] bg-[#4A7C59] text-white' : 'border-[#D8CBA9] bg-[#FBF8ED] text-[#2E3B2C]'
          }`}
        >
          Extra-large tiles
        </button>
      </div>
    </div>
  )
}
