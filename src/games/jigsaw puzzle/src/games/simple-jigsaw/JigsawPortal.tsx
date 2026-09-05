import { useCallback, useEffect, useRef, useState } from 'react'
import { PuzzleBoard } from './PuzzleBoard'
import { ReferenceImage } from './ReferenceImage'
import { GameStats } from './GameStats'
import { PuzzleControls } from './PuzzleControls'
import { useGameAudio } from './useGameAudio'
import { shufflePieceOrder, swapPieces, isSolved, countCorrectPieces } from './puzzleLogic'
import { resolveImageSource } from './imageSource'
import { BUILT_IN_IMAGES } from './constants'
import type { GridSize } from './types'

const DEFAULT_GRID_SIZE: GridSize = 3

export function JigsawPortal() {
  const [gridSize, setGridSize] = useState<GridSize>(DEFAULT_GRID_SIZE)
  const [selectedImageId, setSelectedImageId] = useState(BUILT_IN_IMAGES[0].id)
  const [pieceOrder, setPieceOrder] = useState<number[]>(() => shufflePieceOrder(DEFAULT_GRID_SIZE * DEFAULT_GRID_SIZE))
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [showReference, setShowReference] = useState(false)
  const [largeTiles, setLargeTiles] = useState(false)
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0)

  const { playSwap, playComplete } = useGameAudio()
  const hasCelebratedRef = useRef(false)

  const currentImage = BUILT_IN_IMAGES.find((image) => image.id === selectedImageId) ?? BUILT_IN_IMAGES[0]
  const imageSrc = resolveImageSource(currentImage)
  const solved = isSolved(pieceOrder)

  const startNewPuzzle = useCallback((size: GridSize) => {
    hasCelebratedRef.current = false
    setPieceOrder(shufflePieceOrder(size * size))
    setSelectedPosition(null)
  }, [])

  const handleGridSizeChange = useCallback(
    (size: GridSize) => {
      setGridSize(size)
      startNewPuzzle(size)
    },
    [startNewPuzzle],
  )

  const handleImageChange = useCallback(
    (imageId: string) => {
      setSelectedImageId(imageId)
      startNewPuzzle(gridSize)
    },
    [gridSize, startNewPuzzle],
  )

  const handleNewPuzzle = useCallback(() => {
    startNewPuzzle(gridSize)
  }, [gridSize, startNewPuzzle])

  const handleTilePress = useCallback(
    (position: number) => {
      if (solved) return

      if (selectedPosition === null) {
        setSelectedPosition(position)
        return
      }
      if (selectedPosition === position) {
        setSelectedPosition(null)
        return
      }

      setPieceOrder((prevOrder) => swapPieces(prevOrder, selectedPosition, position))
      playSwap()
      setSelectedPosition(null)
    },
    [solved, selectedPosition, playSwap],
  )

  useEffect(() => {
    if (isSolved(pieceOrder) && !hasCelebratedRef.current) {
      hasCelebratedRef.current = true
      playComplete()
      setPuzzlesCompleted((prev) => prev + 1)
    }
  }, [pieceOrder, playComplete])

  const totalPieces = gridSize * gridSize
  const correctPieces = countCorrectPieces(pieceOrder)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:gap-5 sm:p-6" style={{ background: '#FBF8F0' }}>
      <header>
        <h1 className="text-2xl font-extrabold text-[#1D2B49] sm:text-3xl">Simple Jigsaw</h1>
        <p className="mt-1 text-sm font-semibold text-[#7A6A5A] sm:text-base">
          Tap one piece, then tap another to swap them. No timer, no wrong moves.
        </p>
      </header>

      <GameStats correctPieces={correctPieces} totalPieces={totalPieces} puzzlesCompleted={puzzlesCompleted} />

      {solved && (
        <div className="rounded-3xl border-4 border-[#4A7C59] bg-[#EAF4DF] p-5 text-center">
          <p className="text-xl font-extrabold text-[#1D2B49]">Puzzle complete!</p>
          <p className="mt-1 font-semibold text-[#5B4632]">Take a look, then start a new one whenever you're ready.</p>
        </div>
      )}

      <ReferenceImage imageSrc={imageSrc} visible={showReference && !solved} />

      <PuzzleBoard
        pieceOrder={pieceOrder}
        gridSize={gridSize}
        imageSrc={imageSrc}
        selectedPosition={selectedPosition}
        onTilePress={handleTilePress}
        large={largeTiles}
      />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setLargeTiles((prev) => !prev)}
          aria-pressed={largeTiles}
          className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors ${
            largeTiles ? 'border-[#355FC7] bg-[#355FC7] text-white' : 'border-[#E8D5B8] bg-white text-[#1D2B49]'
          }`}
        >
          {largeTiles ? 'Standard size board' : 'Extra-large board'}
        </button>
      </div>

      <PuzzleControls
        gridSize={gridSize}
        onGridSizeChange={handleGridSizeChange}
        selectedImageId={selectedImageId}
        onImageChange={handleImageChange}
        showReference={showReference}
        onToggleReference={() => setShowReference((prev) => !prev)}
        onNewPuzzle={handleNewPuzzle}
      />
    </div>
  )
}
