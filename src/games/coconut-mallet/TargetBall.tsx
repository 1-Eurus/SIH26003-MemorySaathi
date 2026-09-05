import { motion } from 'framer-motion'

interface TargetBallProps {
  x: number
  y: number
  launched: boolean
  /** Pixel offset to fly toward when launched, measured from the ball's resting spot. */
  launchOffsetPx: { x: number; y: number }
}

export function TargetBall({ x, y, launched, launchOffsetPx }: TargetBallProps) {
  return (
    <div className="absolute z-10" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }} aria-hidden="true">
      <motion.div
        className="h-12 w-12 rounded-full border-4 border-[#1D2B49] shadow-[0_4px_0_0_#12203a] sm:h-14 sm:w-14"
        style={{ background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #EFE0C8 60%, #C9B78E 100%)' }}
        animate={
          launched
            ? { x: launchOffsetPx.x, y: launchOffsetPx.y, scale: 0.3, opacity: 0 }
            : { x: 0, y: 0, scale: 1, opacity: 1 }
        }
        transition={launched ? { duration: 0.55, ease: 'easeOut' } : { duration: 0.2 }}
      />
    </div>
  )
}
