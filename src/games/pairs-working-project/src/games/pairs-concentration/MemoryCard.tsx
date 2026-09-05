interface MemoryCardProps {
  symbol: string
  faceUp: boolean
  matched: boolean
  onPress: () => void
  disabled: boolean
}

export function MemoryCard({ symbol, faceUp, matched, onPress, disabled }: MemoryCardProps) {
  const showSymbol = faceUp || matched

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled || showSymbol}
      aria-label={showSymbol ? `Card showing ${symbol}` : 'Face-down card, tap to flip'}
      className={`flex aspect-square items-center justify-center rounded-2xl border-4 text-4xl transition-all duration-200 sm:text-5xl ${
        matched
          ? 'border-[#4A7C59] bg-[#EAF4DF]'
          : showSymbol
            ? 'border-[#355FC7] bg-white'
            : 'border-[#E8D5B8] bg-[#C9A46A] hover:bg-[#D8B87E] disabled:cursor-not-allowed'
      }`}
      style={!showSymbol ? { backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 10px, transparent 10px 20px)' } : undefined}
    >
      {showSymbol ? symbol : ''}
    </button>
  )
}
