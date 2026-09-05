import type { CulturalEntry } from '../types'
import { StoryCard, type CardFeedback } from './StoryCard'

interface StoryGridProps {
  entries: CulturalEntry[]
  discoveredIds: Set<string>
  hintEnabled: boolean
  feedbackId: string | null
  feedback: CardFeedback
  interactionsLocked: boolean
  onSelect: (id: string) => void
}

export function StoryGrid({
  entries,
  discoveredIds,
  hintEnabled,
  feedbackId,
  feedback,
  interactionsLocked,
  onSelect,
}: StoryGridProps) {
  return (
    <section aria-label="Story cards" className="mt-8">
      <h2 className="mb-4 font-[Nunito] text-2xl font-extrabold text-[#1D2B49]">Which scene matches the song?</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {entries.map((entry) => (
          <StoryCard
            key={entry.id}
            entry={entry}
            isDiscovered={discoveredIds.has(entry.id)}
            hintEnabled={hintEnabled}
            feedback={feedbackId === entry.id ? feedback : 'none'}
            disabled={interactionsLocked}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  )
}
