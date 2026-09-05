import type { SortItem } from './types'

interface ItemTrayProps {
  items: SortItem[]
  selectedItemId: string | null
  wrongItemId: string | null
  onSelectItem: (itemId: string) => void
}

export function ItemTray({ items, selectedItemId, wrongItemId, onSelectItem }: ItemTrayProps) {
  if (items.length === 0) return null

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {items.map((item) => {
        const isSelected = selectedItemId === item.id
        const isWrong = wrongItemId === item.id

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectItem(item.id)}
            aria-label={`${item.label}, tap a category to sort it`}
            className={`flex min-h-[92px] flex-col items-center justify-center gap-1 rounded-2xl border-4 bg-white p-2 transition-transform ${
              isSelected ? 'scale-95 border-[#355FC7]' : 'border-[#E8D5B8] hover:scale-[0.98]'
            } ${isWrong ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
          >
            <span className="text-4xl">{item.emoji}</span>
            <span className="text-xs font-bold text-[#1D2B49]">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
