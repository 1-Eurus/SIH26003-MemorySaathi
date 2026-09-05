import type { SortCategory, SortItem } from './types'

interface CategoryBinProps {
  category: SortCategory
  collectedItems: SortItem[]
  onPress: () => void
  active: boolean
}

export function CategoryBin({ category, collectedItems, onPress, active }: CategoryBinProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={`Sort into ${category.label}`}
      className={`flex min-h-[160px] flex-1 flex-col items-center gap-2 rounded-3xl border-4 p-4 text-center transition-transform ${
        active ? 'scale-[1.02]' : ''
      }`}
      style={{ borderColor: category.accentColor, background: `${category.accentColor}14` }}
    >
      <span className="text-lg font-extrabold" style={{ color: category.accentColor }}>
        {category.label}
      </span>
      <div className="flex flex-wrap justify-center gap-1.5">
        {collectedItems.length === 0 ? (
          <span className="text-xs font-semibold text-[#9A8A76]">Tap here to sort an item</span>
        ) : (
          collectedItems.map((item) => (
            <span key={item.id} className="text-2xl" title={item.label}>
              {item.emoji}
            </span>
          ))
        )}
      </div>
    </button>
  )
}
