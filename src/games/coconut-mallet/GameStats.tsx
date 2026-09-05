import { Target, Timer, Percent } from 'lucide-react'

interface GameStatsProps {
  successes: number
  attempts: number
  elapsedMs: number
  /** Average accuracy across all attempts, 0–100. */
  accuracy: number
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function GameStats({ successes, attempts, elapsedMs, accuracy }: GameStatsProps) {
  const stats = [
    {
      icon: Target,
      label: 'Completed',
      value: `${successes}`,
      sub: attempts > 0 ? `of ${attempts} tries` : 'Start playing',
    },
    { icon: Timer, label: 'Time', value: formatTime(elapsedMs), sub: 'this session' },
    { icon: Percent, label: 'Accuracy', value: `${Math.round(accuracy)}%`, sub: 'average precision' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ icon: Icon, label, value, sub }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-1 rounded-2xl border-2 border-[#E8D5B8] bg-white px-3 py-3 text-center shadow-sm sm:py-4"
        >
          <Icon className="h-6 w-6 text-[#355FC7] sm:h-7 sm:w-7" strokeWidth={2.4} />
          <span className="text-xl font-extrabold text-[#1D2B49] sm:text-2xl">{value}</span>
          <span className="text-[11px] font-bold text-[#7A6A5A] sm:text-xs">{label}</span>
          <span className="text-[10px] font-semibold text-[#9A8A76] sm:text-[11px]">{sub}</span>
        </div>
      ))}
    </div>
  )
}
