import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface DraggableCoconutProps {
  id: string
  startXPercent: number
  startYPercent: number
  disabled?: boolean
}

export function DraggableCoconut({ id, startXPercent, startYPercent, disabled }: DraggableCoconutProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled })

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      disabled={disabled}
      type="button"
      aria-label="Coconut. Drag it around the obstacles into the basket."
      className="absolute z-20 flex h-20 w-20 cursor-grab touch-none items-center justify-center rounded-full border-4 border-[#3D2314] shadow-[0_6px_0_0_#3D2314] active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 sm:h-24 sm:w-24"
      style={{
        left: `${startXPercent}%`,
        top: `${startYPercent}%`,
        transform: `translate(-50%, -50%) ${transform ? CSS.Translate.toString(transform) : ''}`,
        background: 'radial-gradient(circle at 35% 30%, #8B5A3C 0%, #5A3A24 55%, #3D2314 100%)',
        touchAction: 'none',
      }}
    >
      <div className="pointer-events-none grid grid-cols-3 gap-1.5 opacity-70">
        <span className="h-2 w-2 rounded-full bg-[#2A180E]" />
        <span className="h-2 w-2 rounded-full bg-[#2A180E]" />
        <span className="h-2 w-2 rounded-full bg-[#2A180E]" />
      </div>
      <GripVertical
        className={`absolute -bottom-2 h-5 w-5 rounded-full bg-white p-0.5 text-[#1D2B49] shadow transition-opacity ${
          isDragging ? 'opacity-100' : 'opacity-70'
        }`}
      />
    </button>
  )
}
