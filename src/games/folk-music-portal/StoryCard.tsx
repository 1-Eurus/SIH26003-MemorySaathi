import { CheckCircle2, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import type { CulturalEntry } from '../types'

export type CardFeedback = 'none' | 'correct' | 'incorrect'

interface StoryCardProps {
  entry: CulturalEntry
  isDiscovered: boolean
  hintEnabled: boolean
  feedback: CardFeedback
  disabled: boolean
  onSelect: (id: string) => void
}

export function StoryCard({ entry, isDiscovered, hintEnabled, feedback, disabled, onSelect }: StoryCardProps) {
  const Icon = entry.icon

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(entry.id)}
      style={{ perspective: 800 }}
      className="card-tap-area group relative flex min-h-[188px] flex-col items-center justify-center gap-3 rounded-[20px] bg-[#EFE0C8] p-5 text-center shadow-[0_6px_0_0_rgba(29,43,73,0.08)] transition-colors focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#355FC7] disabled:cursor-default"
      whileHover={disabled ? undefined : { scale: 1.035, y: -3 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      animate={
        feedback === 'incorrect'
          ? { x: [0, -10, 10, -8, 8, 0] }
          : feedback === 'correct'
            ? { rotateY: [0, 180, 360] }
            : { x: 0, rotateY: 0 }
      }
      transition={feedback === 'incorrect' ? { duration: 0.45 } : { duration: 0.6, ease: 'easeInOut' }}
      aria-pressed={isDiscovered}
      aria-label={
        isDiscovered
          ? `${entry.region} — already discovered`
          : hintEnabled
            ? `Guess: ${entry.region}, ${entry.festivalOrForm}`
            : `Guess: ${entry.region}`
      }
    >
      {isDiscovered && (
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#4A7C59] text-white">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </span>
      )}

      <span
        className="flex h-16 w-16 items-center justify-center rounded-2xl text-white"
        style={{ backgroundColor: entry.accentColor }}
      >
        <Icon className="h-8 w-8" aria-hidden="true" />
      </span>

      <p className="font-[Nunito] text-xl font-extrabold leading-tight text-[#1D2B49]">{entry.region}</p>

      {hintEnabled ? (
        <p className="font-[DM_Sans] text-sm font-medium leading-snug text-[#1D2B49]/70">{entry.festivalOrForm}</p>
      ) : (
        <p className="flex items-center gap-1 font-[DM_Sans] text-sm font-medium text-[#1D2B49]/50">
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
          Tap if this matches
        </p>
      )}
    </motion.button>
  )
}
