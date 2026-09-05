import { Eye, Image as ImageIcon, RotateCcw } from 'lucide-react'
import { BUILT_IN_IMAGES, GRID_SIZE_OPTIONS } from './constants'
import type { GridSize } from './types'

interface PuzzleControlsProps {
  gridSize: GridSize
  onGridSizeChange: (size: GridSize) => void
  selectedImageId: string
  onImageChange: (imageId: string) => void
  showReference: boolean
  onToggleReference: () => void
  onNewPuzzle: () => void
}

export function PuzzleControls({
  gridSize,
  onGridSizeChange,
  selectedImageId,
  onImageChange,
  showReference,
  onToggleReference,
  onNewPuzzle,
}: PuzzleControlsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-[#E8D5B8] bg-white p-4 sm:p-5">
      <div>
        <span className="mb-2 block font-bold text-[#1D2B49]">Number of pieces</span>
        <div className="grid grid-cols-3 gap-2">
          {GRID_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onGridSizeChange(option.value)}
              className={`min-h-[52px] rounded-xl border-2 font-bold transition-colors ${
                gridSize === option.value
                  ? 'border-[#4A7C59] bg-[#4A7C59] text-white'
                  : 'border-[#E8D5B8] bg-[#FBF8F0] text-[#1D2B49] hover:bg-[#F1E3A4]/40'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-[#355FC7]" strokeWidth={2.4} />
          <span className="font-bold text-[#1D2B49]">Picture</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {BUILT_IN_IMAGES.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => onImageChange(image.id)}
              className={`min-h-[52px] rounded-xl border-2 px-2 text-xs font-bold transition-colors sm:text-sm ${
                selectedImageId === image.id
                  ? 'text-white'
                  : 'border-[#E8D5B8] bg-[#FBF8F0] text-[#1D2B49] hover:bg-[#F1E3A4]/40'
              }`}
              style={selectedImageId === image.id ? { borderColor: image.accentColor, background: image.accentColor } : undefined}
            >
              {image.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onToggleReference}
          aria-pressed={showReference}
          className={`flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 px-4 font-bold transition-colors ${
            showReference ? 'border-[#355FC7] bg-[#355FC7] text-white' : 'border-[#E8D5B8] bg-[#FBF8F0] text-[#1D2B49]'
          }`}
        >
          <Eye className="h-5 w-5" />
          Show picture
        </button>
        <button
          type="button"
          onClick={onNewPuzzle}
          className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#E8D5B8] bg-[#FBF8F0] px-4 font-bold text-[#C4622D]"
        >
          <RotateCcw className="h-5 w-5" />
          New puzzle
        </button>
      </div>
    </div>
  )
}
