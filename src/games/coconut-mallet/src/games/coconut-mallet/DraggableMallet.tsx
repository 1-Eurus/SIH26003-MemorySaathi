import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface DraggableMalletProps {
  id: string
  startXPercent: number
  startYPercent: number
  disabled?: boolean
}

export function DraggableMallet({ id, startXPercent, startYPercent, disabled }: DraggableMalletProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled })

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      disabled={disabled}
      type="button"
      aria-label="Wooden mallet. Drag onto the ball to strike it toward the goal."
      className="absolute z-20 flex h-24 w-24 cursor-grab touch-none flex-col items-center justify-center rounded-2xl border-4 border-[#4A2E17] shadow-[0_6px_0_0_#4A2E17] active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 sm:h-28 sm:w-28"
      style={{
        left: `${startXPercent}%`,
        top: `${startYPercent}%`,
        transform: `translate(-50%, -50%) ${transform ? CSS.Translate.toString(transform) : ''}`,
        background: 'linear-gradient(180deg, #C98A45 0%, #A9702D 100%)',
        touchAction: 'none',
      }}
    >
      <div className="pointer-events-none flex flex-col items-center gap-0.5">
        <div
          className="h-8 w-14 rounded-lg border-2 border-[#4A2E17] sm:h-9 sm:w-16"
          style={{ background: 'linear-gradient(180deg, #D8A165 0%, #8B5E34 100%)' }}
        />
        <div className="h-8 w-2.5 rounded-full bg-[#4A2E17] sm:h-9" />
      </div>
      <GripVertical
        className={`absolute -bottom-2 h-5 w-5 rounded-full bg-white p-0.5 text-[#1D2B49] shadow transition-opacity ${
          isDragging ? 'opacity-100' : 'opacity-70'
        }`}
      />
    </button>
  )
}
