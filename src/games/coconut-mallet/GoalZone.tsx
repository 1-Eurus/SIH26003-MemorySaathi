import { useDroppable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { Trophy, type LucideIcon } from 'lucide-react'

interface GoalZoneProps {
  id: string
  /** Diameter as a percentage of the play area width. */
  sizePercent: number
  xPercent: number
  yPercent: number
  isSuccess: boolean
  label: string
  icon?: LucideIcon
}

export function GoalZone({ id, sizePercent, xPercent, yPercent, isSuccess, label, icon: Icon = Trophy }: GoalZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-dashed transition-colors duration-150"
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        width: `${sizePercent}%`,
        aspectRatio: '1 / 1',
        borderColor: isOver ? '#4A7C59' : '#355FC7',
        background: isOver ? 'rgba(74,124,89,0.18)' : 'rgba(53,95,199,0.10)',
      }}
      role="img"
      aria-label={label}
    >
      <motion.div
        animate={isSuccess ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-1 text-center"
      >
        <Icon className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: isOver ? '#4A7C59' : '#355FC7' }} strokeWidth={2.2} />
        <span className="text-xs font-bold sm:text-sm" style={{ color: '#1D2B49' }}>
          {label}
        </span>
      </motion.div>
    </div>
  )
}
