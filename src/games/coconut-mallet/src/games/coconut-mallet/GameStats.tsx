import { Clock, Heart, Star, Trophy } from 'lucide-react'

interface GameStatsProps {
  level: number
  lives: number
  maxLives: number
  score: number
  combo: number
  timeRemaining: number
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function GameStats({ level, lives, maxLives, score, combo, timeRemaining }: GameStatsProps) {
  const timeCritical = timeRemaining <= 10

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-[#E8D5B8] bg-white px-3 py-3 text-center shadow-sm">
        <Trophy className="h-6 w-6 text-[#C9812B]" strokeWidth={2.4} />
        <span className="text-xl font-extrabold text-[#1D2B49]">{level}</span>
        <span className="text-[11px] font-bold text-[#7A6A5A]">Level</span>
      </div>

      <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-[#E8D5B8] bg-white px-3 py-3 text-center shadow-sm">
        <div className="flex gap-0.5" aria-label={`${lives} of ${maxLives} lives remaining`}>
          {Array.from({ length: maxLives }).map((_, index) => (
            <Heart
              key={index}
              className="h-5 w-5"
              style={{ color: index < lives ? '#C0392B' : '#E8D5B8' }}
              fill={index < lives ? '#C0392B' : 'none'}
              strokeWidth={2}
            />
          ))}
        </div>
        <span className="mt-1 text-[11px] font-bold text-[#7A6A5A]">Lives</span>
      </div>

      <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-[#E8D5B8] bg-white px-3 py-3 text-center shadow-sm">
        <Star className="h-6 w-6 text-[#355FC7]" strokeWidth={2.4} />
        <span className="text-xl font-extrabold text-[#1D2B49]">{score}</span>
        <span className="text-[11px] font-bold text-[#7A6A5A]">{combo > 1 ? `Combo x${combo}!` : 'Score'}</span>
      </div>

      <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-[#E8D5B8] bg-white px-3 py-3 text-center shadow-sm">
        <Clock className="h-6 w-6" style={{ color: timeCritical ? '#C0392B' : '#4A7C59' }} strokeWidth={2.4} />
        <span className="text-xl font-extrabold" style={{ color: timeCritical ? '#C0392B' : '#1D2B49' }}>
          {formatTime(timeRemaining)}
        </span>
        <span className="text-[11px] font-bold text-[#7A6A5A]">Time left</span>
      </div>
    </div>
  )
}
