import { Check } from 'lucide-react'
import { pieceBackgroundStyle } from './imageSlicing'

interface PuzzleBoardProps {
  pieceOrder: number[]
  gridSize: number
  imageSrc: string
  selectedPosition: number | null
  onTilePress: (position: number) => void
  large: boolean
}

export function PuzzleBoard({ pieceOrder, gridSize, imageSrc, selectedPosition, onTilePress, large }: PuzzleBoardProps) {
  return (
    <div
      className="mx-auto grid aspect-square w-full gap-1.5 overflow-hidden rounded-3xl border-4 border-[#E8D5B8] bg-white p-1.5 sm:gap-2 sm:p-2"
      style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`, maxWidth: large ? '560px' : '440px' }}
    >
      {pieceOrder.map((originalIndex, position) => {
        const style = pieceBackgroundStyle(originalIndex, gridSize)
        const isCorrect = originalIndex === position
        const isSelected = selectedPosition === position

        return (
          <button
            key={position}
            type="button"
            onClick={() => onTilePress(position)}
            aria-label={isCorrect ? 'Puzzle piece, correctly placed' : 'Puzzle piece, tap another piece to swap with it'}
            className={`relative aspect-square overflow-hidden rounded-xl border-4 transition-transform ${
              isSelected ? 'scale-95 border-[#355FC7]' : isCorrect ? 'border-[#4A7C59]' : 'border-transparent hover:scale-[0.98]'
            }`}
            style={{
              backgroundImage: `url("${imageSrc}")`,
              backgroundSize: style.backgroundSize,
              backgroundPositionX: style.backgroundPositionX,
              backgroundPositionY: style.backgroundPositionY,
              backgroundRepeat: 'no-repeat',
            }}
          >
            {isCorrect && (
              <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#4A7C59] text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
