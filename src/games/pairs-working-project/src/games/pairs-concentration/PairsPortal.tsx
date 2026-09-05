import { useCallback, useEffect, useRef, useState } from 'react'
import { MemoryCard } from './MemoryCard'
import { GameStats } from './GameStats'
import { PairsControls } from './PairsControls'
import { useGameAudio } from './useGameAudio'
import { buildShuffledDeck, canFlipCard, isMatch, isRoundComplete } from './pairsLogic'
import { GRID_OPTIONS, SYMBOL_SET } from './constants'

const MATCH_SETTLE_DELAY_MS = 450
const MISMATCH_FLIP_BACK_DELAY_MS = 900
const DEFAULT_PAIR_COUNT = GRID_OPTIONS[1].pairCount

export function PairsPortal() {
  const [pairCount, setPairCount] = useState(DEFAULT_PAIR_COUNT)
  const [deck, setDeck] = useState<number[]>(() => buildShuffledDeck(DEFAULT_PAIR_COUNT))
  const [flippedPositions, setFlippedPositions] = useState<number[]>([])
  const [matchedPositions, setMatchedPositions] = useState<Set<number>>(new Set())
  const [moves, setMoves] = useState(0)
  const [roundsCompleted, setRoundsCompleted] = useState(0)
  const [isChecking, setIsChecking] = useState(false)

  const { playFlip, playMatch, playComplete } = useGameAudio()
  const hasCelebratedRef = useRef(false)
  const pendingTimeoutRef = useRef<number | null>(null)

  const columns = GRID_OPTIONS.find((option) => option.pairCount === pairCount)?.columns ?? 4
  const totalCards = pairCount * 2
  const complete = isRoundComplete(matchedPositions, totalCards)

  const startNewRound = useCallback((count: number) => {
    if (pendingTimeoutRef.current !== null) window.clearTimeout(pendingTimeoutRef.current)
    hasCelebratedRef.current = false
    setDeck(buildShuffledDeck(count))
    setFlippedPositions([])
    setMatchedPositions(new Set())
    setMoves(0)
    setIsChecking(false)
  }, [])

  const handlePairCountChange = useCallback(
    (count: number) => {
      setPairCount(count)
      startNewRound(count)
    },
    [startNewRound],
  )

  const handleNewRound = useCallback(() => {
    startNewRound(pairCount)
  }, [pairCount, startNewRound])

  const handleCardPress = useCallback(
    (position: number) => {
      if (isChecking) return
      if (!canFlipCard(position, flippedPositions, matchedPositions)) return

      playFlip()
      const nextFlipped = [...flippedPositions, position]

      if (nextFlipped.length < 2) {
        setFlippedPositions(nextFlipped)
        return
      }

      setFlippedPositions(nextFlipped)
      setMoves((prev) => prev + 1)
      setIsChecking(true)

      const [positionA, positionB] = nextFlipped
      if (isMatch(deck, positionA, positionB)) {
        pendingTimeoutRef.current = window.setTimeout(() => {
          setMatchedPositions((prev) => {
            const next = new Set(prev)
            next.add(positionA)
            next.add(positionB)
            return next
          })
          setFlippedPositions([])
          setIsChecking(false)
          playMatch()
        }, MATCH_SETTLE_DELAY_MS)
      } else {
        pendingTimeoutRef.current = window.setTimeout(() => {
          setFlippedPositions([])
          setIsChecking(false)
        }, MISMATCH_FLIP_BACK_DELAY_MS)
      }
    },
    [isChecking, flippedPositions, matchedPositions, deck, playFlip, playMatch],
  )

  useEffect(() => {
    if (complete && !hasCelebratedRef.current) {
      hasCelebratedRef.current = true
      playComplete()
      setRoundsCompleted((prev) => prev + 1)
    }
  }, [complete, playComplete])

  useEffect(() => {
    return () => {
      if (pendingTimeoutRef.current !== null) window.clearTimeout(pendingTimeoutRef.current)
    }
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:gap-5 sm:p-6" style={{ background: '#FBF8F0' }}>
      <header>
        <h1 className="text-2xl font-extrabold text-[#1D2B49] sm:text-3xl">Pairs</h1>
        <p className="mt-1 text-sm font-semibold text-[#7A6A5A] sm:text-base">
          Flip two cards at a time to find matching pairs. No timer, no penalty for a mismatch.
        </p>
      </header>

      <GameStats pairsFound={matchedPositions.size / 2} totalPairs={pairCount} moves={moves} roundsCompleted={roundsCompleted} />

      {complete && (
        <div className="rounded-3xl border-4 border-[#4A7C59] bg-[#EAF4DF] p-5 text-center">
          <p className="text-xl font-extrabold text-[#1D2B49]">All pairs found!</p>
          <p className="mt-1 font-semibold text-[#5B4632]">Start a new round whenever you're ready.</p>
        </div>
      )}

      <div className="mx-auto grid w-full max-w-[480px] gap-2.5 sm:gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {deck.map((symbolIndex, position) => (
          <MemoryCard
            key={position}
            symbol={SYMBOL_SET[symbolIndex]}
            faceUp={flippedPositions.includes(position)}
            matched={matchedPositions.has(position)}
            onPress={() => handleCardPress(position)}
            disabled={isChecking}
          />
        ))}
      </div>

      <PairsControls pairCount={pairCount} onPairCountChange={handlePairCountChange} onNewRound={handleNewRound} />
    </div>
  )
}
