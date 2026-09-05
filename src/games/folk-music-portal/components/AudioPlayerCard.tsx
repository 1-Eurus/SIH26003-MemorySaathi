import { Music2, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { motion } from 'framer-motion'
import type { CulturalEntry } from '../types'
import { WaveformVisualizer } from './WaveformVisualizer'

interface AudioPlayerCardProps {
  entry: CulturalEntry
  isPlaying: boolean
  progress: number
  levels: number[]
  volume: number
  roundNumber: number
  totalRounds: number
  showSubtitles: boolean
  onPlay: () => void
  onVolumeChange: (volume: number) => void
}

export function AudioPlayerCard({
  entry,
  isPlaying,
  progress,
  levels,
  volume,
  roundNumber,
  totalRounds,
  showSubtitles,
  onPlay,
  onVolumeChange,
}: AudioPlayerCardProps) {
  return (
    <section
      className="rounded-[28px] bg-[#F1E3A4] p-6 shadow-[0_8px_0_0_rgba(29,43,73,0.08)] sm:p-8"
      aria-label="Song player"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-[DM_Sans] text-base font-semibold uppercase tracking-wide text-[#1D2B49]/60">
          Song {roundNumber} of {totalRounds}
        </p>
        <div className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5">
          <Music2 className="h-5 w-5 text-[#355FC7]" aria-hidden="true" />
          <span className="font-[DM_Sans] text-sm font-semibold text-[#1D2B49]">Listen &amp; match</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          {isPlaying && (
            <>
              <span className="absolute h-28 w-28 animate-ping rounded-full bg-[#355FC7]/30" />
              <span className="absolute h-24 w-24 animate-ping rounded-full bg-[#355FC7]/20 [animation-delay:200ms]" />
            </>
          )}
          <motion.button
            type="button"
            onClick={onPlay}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#355FC7] text-white shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#1D2B49]"
            aria-label={isPlaying ? `Replaying ${entry.title}` : `Play ${entry.title}`}
          >
            <Play className="h-10 w-10 translate-x-0.5" fill="white" aria-hidden="true" />
          </motion.button>
        </div>

        <p className="font-[Nunito] text-2xl font-extrabold text-[#1D2B49]">Play Song</p>

        <div className="w-full">
          <WaveformVisualizer levels={levels} isPlaying={isPlaying} accentColor={entry.accentColor} />
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
            <motion.div
              className="h-full rounded-full bg-[#355FC7]"
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.15 }}
            />
          </div>
        </div>

        {showSubtitles && (
          <div className="w-full rounded-2xl bg-white/70 px-5 py-3 text-center" aria-live="polite">
            <p className="font-[DM_Sans] text-sm font-semibold text-[#1D2B49]/70">Now playing</p>
            <p className="font-[Nunito] text-lg font-bold text-[#1D2B49]">
              {entry.title} · {entry.festivalOrForm}
            </p>
          </div>
        )}

        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <motion.button
            type="button"
            onClick={onPlay}
            whileTap={{ scale: 0.95 }}
            className="flex min-h-[64px] items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-[DM_Sans] text-base font-semibold text-[#1D2B49] shadow-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#355FC7]"
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            Play again
          </motion.button>

          <div className="flex min-h-[64px] flex-1 items-center gap-3 rounded-full bg-white px-5 sm:max-w-xs">
            {volume === 0 ? (
              <VolumeX className="h-6 w-6 shrink-0 text-[#1D2B49]/70" aria-hidden="true" />
            ) : (
              <Volume2 className="h-6 w-6 shrink-0 text-[#1D2B49]/70" aria-hidden="true" />
            )}
            <label className="sr-only" htmlFor="volume-slider">
              Volume
            </label>
            <input
              id="volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-[#355FC7]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
