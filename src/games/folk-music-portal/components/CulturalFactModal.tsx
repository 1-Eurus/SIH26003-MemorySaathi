import { AnimatePresence, motion } from 'framer-motion'
import { Award, X } from 'lucide-react'
import type { CulturalEntry } from '../types'

interface CulturalFactModalProps {
  entry: CulturalEntry | null
  onContinue: () => void
}

export function CulturalFactModal({ entry, onContinue }: CulturalFactModalProps) {
  return (
    <AnimatePresence>
      {entry && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D2B49]/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cultural-fact-title"
        >
          <motion.div
            className="relative w-full max-w-lg rounded-[28px] bg-[#FBF8F0] p-7 shadow-2xl sm:p-9"
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <button
              type="button"
              onClick={onContinue}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1D2B49]/60 focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#355FC7]"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>

            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl text-white"
              style={{ backgroundColor: entry.accentColor }}
            >
              <entry.icon className="h-10 w-10" aria-hidden="true" />
            </div>

            <p className="mt-5 text-center font-[DM_Sans] text-base font-semibold uppercase tracking-wide text-[#4A7C59]">
              Lovely listening!
            </p>
            <h2 id="cultural-fact-title" className="mt-1 text-center font-[Nunito] text-3xl font-extrabold text-[#1D2B49]">
              {entry.title}
            </h2>
            <p className="mt-1 text-center font-[DM_Sans] text-base font-semibold text-[#1D2B49]/60">
              {entry.region} · {entry.festivalOrForm}
            </p>

            <p className="mt-5 text-center font-[Nunito] text-lg leading-relaxed text-[#1D2B49]">
              {entry.culturalContext}
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-[#F1E3A4] px-5 py-3">
              <Award className="h-6 w-6 text-[#C4622D]" aria-hidden="true" />
              <p className="font-[DM_Sans] text-base font-semibold text-[#1D2B49]">
                Cultural badge earned: {entry.region}
              </p>
            </div>

            <button
              type="button"
              onClick={onContinue}
              className="mt-6 flex min-h-[64px] w-full items-center justify-center rounded-full bg-[#355FC7] font-[Nunito] text-xl font-extrabold text-white shadow-md focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#1D2B49]"
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
