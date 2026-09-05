import { Award, Heart, RotateCcw, Trophy, type LucideIcon } from 'lucide-react'
import type { GameStatus } from './types'

interface StatusOverlayProps {
  status: GameStatus
  level: number
  score: number
  onPlayAgain: () => void
}

interface OverlayContent {
  icon: LucideIcon
  title: string
  subtitle: string
  color: string
  showButton: boolean
}

export function StatusOverlay({ status, level, score, onPlayAgain }: StatusOverlayProps) {
  if (status === 'playing') return null

  const contentByStatus: Record<Exclude<GameStatus, 'playing'>, OverlayContent> = {
    levelComplete: {
      icon: Award,
      title: `Level ${level} clear!`,
      subtitle: 'Next level incoming — get ready.',
      color: '#4A7C59',
      showButton: false,
    },
    lifeLost: {
      icon: Heart,
      title: 'Life lost',
      subtitle: 'Retrying this level...',
      color: '#C0392B',
      showButton: false,
    },
    gameOver: {
      icon: Heart,
      title: 'Game over',
      subtitle: `Final score: ${score} · Reached level ${level}`,
      color: '#C0392B',
      showButton: true,
    },
    victory: {
      icon: Trophy,
      title: 'All levels cleared!',
      subtitle: `Final score: ${score} — you beat every level.`,
      color: '#C9812B',
      showButton: true,
    },
  }

  const content = contentByStatus[status]
  const Icon = content.icon

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center rounded-3xl bg-[#1D2B49]/80 p-4">
      <div className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl">
        <div
          className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: `${content.color}22` }}
        >
          <Icon className="h-7 w-7" style={{ color: content.color }} strokeWidth={2.4} />
        </div>
        <p className="text-xl font-extrabold text-[#1D2B49]">{content.title}</p>
        <p className="mt-1 text-sm font-semibold text-[#7A6A5A]">{content.subtitle}</p>
        {content.showButton && (
          <button
            type="button"
            onClick={onPlayAgain}
            className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#355FC7] px-4 font-extrabold text-white"
          >
            <RotateCcw className="h-5 w-5" />
            Play again
          </button>
        )}
      </div>
    </div>
  )
}
