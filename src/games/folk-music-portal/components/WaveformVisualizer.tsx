import { motion } from 'framer-motion'

interface WaveformVisualizerProps {
  levels: number[]
  isPlaying: boolean
  accentColor: string
}

/**
 * A row of soft bars that rise and fall with live playback levels. When
 * idle, the bars settle into a gentle "sleeping" state instead of a
 * blank strip, so the player never looks broken between rounds.
 */
export function WaveformVisualizer({ levels, isPlaying, accentColor }: WaveformVisualizerProps) {
  return (
    <div
      className="flex h-16 w-full items-center justify-center gap-[3px] rounded-2xl bg-white/60 px-4"
      role="img"
      aria-label={isPlaying ? 'Music is playing' : 'Music player, idle'}
    >
      {levels.map((level, i) => (
        <motion.span
          key={i}
          className="w-[6px] rounded-full"
          style={{ backgroundColor: accentColor }}
          animate={{
            height: isPlaying ? `${Math.max(10, level * 100)}%` : '18%',
            opacity: isPlaying ? 0.55 + level * 0.45 : 0.35,
          }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
