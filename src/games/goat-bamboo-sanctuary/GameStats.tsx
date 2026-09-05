import { PawPrint, Footprints, Sprout } from 'lucide-react'

interface GameStatsProps {
  goatsHoused: number
  totalGoats: number
  movesTaken: number
  level: number
}

export function GameStats({ goatsHoused, totalGoats, movesTaken, level }: GameStatsProps) {
  const stats = [
    { icon: PawPrint, label: 'Goats home', value: `${goatsHoused}/${totalGoats}`, sub: 'safely in the paddock' },
    { icon: Footprints, label: 'Moves taken', value: `${movesTaken}`, sub: 'no rush, no limit' },
    { icon: Sprout, label: 'Level', value: `${level}`, sub: 'the sanctuary grows' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ icon: Icon, label, value, sub }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-1 rounded-2xl border-2 border-[#D8CBA9] bg-white px-3 py-3 text-center shadow-sm sm:py-4"
        >
          <Icon className="h-6 w-6 text-[#4A7C59] sm:h-7 sm:w-7" strokeWidth={2.4} />
          <span className="text-xl font-extrabold text-[#2E3B2C] sm:text-2xl">{value}</span>
          <span className="text-[11px] font-bold text-[#6B6152] sm:text-xs">{label}</span>
          <span className="text-[10px] font-semibold text-[#9A917E] sm:text-[11px]">{sub}</span>
        </div>
      ))}
    </div>
  )
}
