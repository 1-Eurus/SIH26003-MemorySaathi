import type { SortSet } from './types'

export const SORT_SETS: SortSet[] = [
  {
    id: 'fruits-vegetables',
    name: 'Fruits & Vegetables',
    categories: [
      { id: 'fruit', label: 'Fruit', accentColor: '#C4622D' },
      { id: 'vegetable', label: 'Vegetable', accentColor: '#4A7C59' },
    ],
    items: [
      { id: 'apple', emoji: '🍎', label: 'Apple', categoryId: 'fruit' },
      { id: 'banana', emoji: '🍌', label: 'Banana', categoryId: 'fruit' },
      { id: 'grapes', emoji: '🍇', label: 'Grapes', categoryId: 'fruit' },
      { id: 'mango', emoji: '🥭', label: 'Mango', categoryId: 'fruit' },
      { id: 'orange', emoji: '🍊', label: 'Orange', categoryId: 'fruit' },
      { id: 'carrot', emoji: '🥕', label: 'Carrot', categoryId: 'vegetable' },
      { id: 'potato', emoji: '🥔', label: 'Potato', categoryId: 'vegetable' },
      { id: 'eggplant', emoji: '🍆', label: 'Eggplant', categoryId: 'vegetable' },
      { id: 'corn', emoji: '🌽', label: 'Corn', categoryId: 'vegetable' },
      { id: 'pepper', emoji: '🫑', label: 'Pepper', categoryId: 'vegetable' },
    ],
  },
  {
    id: 'animals-household',
    name: 'Animals & Household Items',
    categories: [
      { id: 'animal', label: 'Animal', accentColor: '#355FC7' },
      { id: 'household', label: 'Household Item', accentColor: '#7A4A22' },
    ],
    items: [
      { id: 'cat', emoji: '🐱', label: 'Cat', categoryId: 'animal' },
      { id: 'dog', emoji: '🐶', label: 'Dog', categoryId: 'animal' },
      { id: 'cow', emoji: '🐄', label: 'Cow', categoryId: 'animal' },
      { id: 'bird', emoji: '🐦', label: 'Bird', categoryId: 'animal' },
      { id: 'fish', emoji: '🐟', label: 'Fish', categoryId: 'animal' },
      { id: 'chair', emoji: '🪑', label: 'Chair', categoryId: 'household' },
      { id: 'lamp', emoji: '💡', label: 'Lamp', categoryId: 'household' },
      { id: 'clock', emoji: '🕰️', label: 'Clock', categoryId: 'household' },
      { id: 'teapot', emoji: '🫖', label: 'Teapot', categoryId: 'household' },
      { id: 'broom', emoji: '🧹', label: 'Broom', categoryId: 'household' },
    ],
  },
]
