import { useCallback, useEffect, useRef, useState } from 'react'
import { ItemTray } from './ItemTray'
import { CategoryBin } from './CategoryBin'
import { GameStats } from './GameStats'
import { SortControls } from './SortControls'
import { useGameAudio } from './useGameAudio'
import { shuffleOrder, isSetComplete, removeFromTray } from './sortLogic'
import { SORT_SETS } from './constants'
import './sortMatch.css'

const WRONG_FLASH_DURATION_MS = 450

type SortedByCategory = Record<string, string[]>

function emptySortedByCategory(): SortedByCategory {
  return {}
}

export function SortMatchPortal() {
  const [selectedSetId, setSelectedSetId] = useState(SORT_SETS[0].id)
  const [trayItemIds, setTrayItemIds] = useState<string[]>(() => shuffleOrder(SORT_SETS[0].items.map((item) => item.id)))
  const [sortedByCategory, setSortedByCategory] = useState<SortedByCategory>(emptySortedByCategory)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [wrongItemId, setWrongItemId] = useState<string | null>(null)
  const [setsCompleted, setSetsCompleted] = useState(0)

  const { playCorrect, playTryAgain, playComplete } = useGameAudio()
  const hasCelebratedRef = useRef(false)

  const currentSet = SORT_SETS.find((set) => set.id === selectedSetId) ?? SORT_SETS[0]
  const complete = isSetComplete(trayItemIds)
  const sortedCount = Object.values(sortedByCategory).reduce((sum, ids) => sum + ids.length, 0)

  const startNewRound = useCallback((setId: string) => {
    const set = SORT_SETS.find((s) => s.id === setId) ?? SORT_SETS[0]
    hasCelebratedRef.current = false
    setTrayItemIds(shuffleOrder(set.items.map((item) => item.id)))
    setSortedByCategory(emptySortedByCategory())
    setSelectedItemId(null)
    setWrongItemId(null)
  }, [])

  const handleSetChange = useCallback(
    (setId: string) => {
      setSelectedSetId(setId)
      startNewRound(setId)
    },
    [startNewRound],
  )

  const handleNewRound = useCallback(() => {
    startNewRound(selectedSetId)
  }, [selectedSetId, startNewRound])

  const handleSelectItem = useCallback(
    (itemId: string) => {
      if (complete) return
      setSelectedItemId((current) => (current === itemId ? null : itemId))
    },
    [complete],
  )

  const handleCategoryPress = useCallback(
    (categoryId: string) => {
      if (!selectedItemId) return
      const item = currentSet.items.find((entry) => entry.id === selectedItemId)
      if (!item) return

      if (item.categoryId === categoryId) {
        setTrayItemIds((prev) => removeFromTray(prev, item.id))
        setSortedByCategory((prev) => ({ ...prev, [categoryId]: [...(prev[categoryId] ?? []), item.id] }))
        playCorrect()
        setSelectedItemId(null)
      } else {
        playTryAgain()
        setWrongItemId(item.id)
        setSelectedItemId(null)
        window.setTimeout(() => setWrongItemId((current) => (current === item.id ? null : current)), WRONG_FLASH_DURATION_MS)
      }
    },
    [selectedItemId, currentSet, playCorrect, playTryAgain],
  )

  useEffect(() => {
    if (complete && !hasCelebratedRef.current) {
      hasCelebratedRef.current = true
      playComplete()
      setSetsCompleted((prev) => prev + 1)
    }
  }, [complete, playComplete])

  const trayItems = trayItemIds.map((id) => currentSet.items.find((item) => item.id === id)!).filter(Boolean)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:gap-5 sm:p-6" style={{ background: '#FBF8F0' }}>
      <header>
        <h1 className="text-2xl font-extrabold text-[#1D2B49] sm:text-3xl">Sort &amp; Match</h1>
        <p className="mt-1 text-sm font-semibold text-[#7A6A5A] sm:text-base">
          Tap an item, then tap the category it belongs to. No wrong answers to worry about — just try again.
        </p>
      </header>

      <GameStats sortedCount={sortedCount} totalCount={currentSet.items.length} setsCompleted={setsCompleted} />

      {complete ? (
        <div className="rounded-3xl border-4 border-[#4A7C59] bg-[#EAF4DF] p-5 text-center">
          <p className="text-xl font-extrabold text-[#1D2B49]">Everything sorted!</p>
          <p className="mt-1 font-semibold text-[#5B4632]">Start a new round whenever you're ready.</p>
        </div>
      ) : (
        <ItemTray items={trayItems} selectedItemId={selectedItemId} wrongItemId={wrongItemId} onSelectItem={handleSelectItem} />
      )}

      <div className="flex gap-3">
        {currentSet.categories.map((category) => (
          <CategoryBin
            key={category.id}
            category={category}
            collectedItems={(sortedByCategory[category.id] ?? []).map((id) => currentSet.items.find((item) => item.id === id)!)}
            onPress={() => handleCategoryPress(category.id)}
            active={Boolean(selectedItemId)}
          />
        ))}
      </div>

      <SortControls selectedSetId={selectedSetId} onSetChange={handleSetChange} onNewRound={handleNewRound} />
    </div>
  )
}
