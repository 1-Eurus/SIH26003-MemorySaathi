import { CheckCircle2, Layers, RotateCw } from 'lucide-react'

interface GameStatsProps {
  pairsFound: number
  totalPairs: number
  moves: number
  roundsCompleted: number
}

export function GameStats({ pairsFound, totalPairs, moves, roundsCompleted }: GameStatsProps) {
  const stats = [
    { icon: Layers, label: 'Pairs found', value: `${pairsFound}/${totalPairs}` },
    { icon: RotateCw, label: 'Moves', value: `${moves}` },
    { icon: CheckCircle2, label: 'Rounds completed', value: `${roundsCompleted}` },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-1 rounded-2xl border-2 border-[#E8D5B8] bg-white px-3 py-3 text-center shadow-sm sm:py-4"
        >
          <Icon className="h-6 w-6 text-[#4A7C59] sm:h-7 sm:w-7" strokeWidth={2.4} />
          <span className="text-xl font-extrabold text-[#1D2B49] sm:text-2xl">{value}</span>
          <span className="text-[11px] font-bold text-[#7A6A5A] sm:text-xs">{label}</span>
        </div>
      ))}
    </div>
  )
}
