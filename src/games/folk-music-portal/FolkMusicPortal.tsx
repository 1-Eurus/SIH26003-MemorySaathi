import { useCallback, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useFolkAudio } from "./useFolkAudio";
import { shuffle } from "./shuffle";
import { AudioPlayerCard } from "./AudioPlayerCard";
import { StoryGrid } from "./StoryGrid";
import { CulturalFactModal } from "./CulturalFactModal";
import { Scoreboard } from './Scoreboard'
import type { CardFeedback } from './StoryCard'
import type { CulturalEntry } from './types'
import { culturalEntries } from "./culturalEntries";

const INCORRECT_FEEDBACK_MS = 650

/**
 * Symphony of the North-East — a relaxed, no-penalty audio matching
 * game for an elder-focused portal. Players listen to a short folk
 * clip, then tap the story card that matches it. There is no timer,
 * no strikeout state, and wrong guesses simply invite another try.
 */
export function FolkMusicPortal() {
  // Grid layout is shuffled once per session so the cards aren't always
  // in the same order, without reshuffling mid-play (which would be
  // disorienting for the audience this app is built for).
  const [gridEntries] = useState<CulturalEntry[]>(() => shuffle(culturalEntries))
  const [roundOrder, setRoundOrder] = useState<CulturalEntry[]>(() => shuffle(culturalEntries))
  const [roundIndex, setRoundIndex] = useState(0)

  const [discoveredIds, setDiscoveredIds] = useState<Set<string>>(new Set())
  const [feedback, setFeedback] = useState<{ id: string; type: CardFeedback } | null>(null)
  const [modalEntry, setModalEntry] = useState<CulturalEntry | null>(null)
  const [hintEnabled, setHintEnabled] = useState(false)
  const [showSubtitles, setShowSubtitles] = useState(false)

  const { play, isPlaying, progress, levels, volume, setVolume, playSuccessChime } = useFolkAudio()

  const currentEntry = roundOrder[roundIndex]
  const discoveredEntries = useMemo(
    () => culturalEntries.filter((entry) => discoveredIds.has(entry.id)),
    [discoveredIds],
  )
  const interactionsLocked = modalEntry !== null

  const handlePlay = useCallback(() => {
    play(currentEntry)
  }, [play, currentEntry])

  const handleSelectCard = useCallback(
    (id: string) => {
      if (interactionsLocked) return

      if (id === currentEntry.id) {
        playSuccessChime()
        setDiscoveredIds((prev) => {
          const next = new Set(prev)
          next.add(id)
          return next
        })
        setFeedback({ id, type: 'correct' })
        setModalEntry(currentEntry)
        return
      }

      setFeedback({ id, type: 'incorrect' })
      window.setTimeout(() => {
        setFeedback((current) => (current?.id === id ? null : current))
      }, INCORRECT_FEEDBACK_MS)
    },
    [currentEntry, interactionsLocked, playSuccessChime],
  )

  const handleModalContinue = useCallback(() => {
    setModalEntry(null)
    setFeedback(null)
    setRoundIndex((prevIndex) => {
      const nextIndex = prevIndex + 1
      if (nextIndex >= roundOrder.length) {
        // Everyone's been heard once — shuffle a fresh sequence and keep
        // playing. Badges already earned stay earned.
        setRoundOrder(shuffle(culturalEntries))
        return 0
      }
      return nextIndex
    })
  }, [roundOrder.length])

  return (
    <div className="min-h-full bg-[#FBF8F0] px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4A7C59] text-white">
            <Sparkles className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="font-[Nunito] text-4xl font-extrabold text-[#1D2B49] sm:text-5xl">
            Symphony of the North-East
          </h1>
          <p className="max-w-xl font-[Nunito] text-lg text-[#1D2B49]/70">
            Listen closely, then tap the story that matches the song. Take your time — there's no clock and no wrong
            way to play.
          </p>
        </header>

        <AudioPlayerCard
          entry={currentEntry}
          isPlaying={isPlaying}
          progress={progress}
          levels={levels}
          volume={volume}
          roundNumber={roundIndex + 1}
          totalRounds={roundOrder.length}
          showSubtitles={showSubtitles}
          onPlay={handlePlay}
          onVolumeChange={setVolume}
        />

        <div className="mt-8">
          <Scoreboard
            discoveredEntries={discoveredEntries}
            totalCount={culturalEntries.length}
            hintEnabled={hintEnabled}
            onToggleHint={() => setHintEnabled((v) => !v)}
            showSubtitles={showSubtitles}
            onToggleSubtitles={() => setShowSubtitles((v) => !v)}
          />
        </div>

        <StoryGrid
          entries={gridEntries}
          discoveredIds={discoveredIds}
          hintEnabled={hintEnabled}
          feedbackId={feedback?.id ?? null}
          feedback={feedback?.type ?? 'none'}
          interactionsLocked={interactionsLocked}
          onSelect={handleSelectCard}
        />
      </div>

      <CulturalFactModal entry={modalEntry} onContinue={handleModalContinue} />
    </div>
  )
}

export default FolkMusicPortal
