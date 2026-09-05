import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

interface ConfettiBurstProps {
  /** Origin as a percentage of the parent play area. */
  originX: number
  originY: number
  onDone: () => void
}

const PARTICLE_COLORS = ['#355FC7', '#C4622D', '#4A7C59', '#F1E3A4', '#FFFFFF']
const PARTICLE_COUNT = 18
const BURST_DURATION_MS = 750

export function ConfettiBurst({ originX, originY, onDone }: ConfettiBurstProps) {
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, index) => {
      const angle = (Math.PI * 2 * index) / PARTICLE_COUNT + Math.random() * 0.3
      const distance = 55 + Math.random() * 55
      return {
        id: index,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance - 18,
        rotate: Math.random() * 360,
        size: 6 + Math.random() * 6,
        color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
      }
    })
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(onDone, BURST_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return (
    <div
      className="pointer-events-none absolute z-30"
      style={{ left: `${originX}%`, top: `${originY}%` }}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: particle.dx, y: particle.dy, opacity: 0, rotate: particle.rotate, scale: 0.6 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: particle.size,
            height: particle.size * 1.4,
            borderRadius: 2,
            background: particle.color,
          }}
        />
      ))}
    </div>
  )
}
