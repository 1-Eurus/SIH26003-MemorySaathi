import type { Modifier } from '@dnd-kit/core'

/**
 * Scales the raw pointer delta before it's applied to the dragged item.
 * Values below 1 act like added resistance (patient must move further for
 * the same on-screen travel); values above 1 amplify small movements —
 * useful for patients working on very limited range of motion.
 */
export function createSensitivityModifier(sensitivity: number): Modifier {
  return ({ transform }) => ({
    ...transform,
    x: transform.x * sensitivity,
    y: transform.y * sensitivity,
  })
}

/**
 * Keeps the dragged item's bounding box inside the play area container so a
 * fast or shaky drag can't fling the mallet/coconut off-screen. Reads the
 * container element lazily via a getter since the ref isn't attached yet
 * when the modifier is first constructed.
 */
export function createBoundsModifier(getContainer: () => HTMLElement | null): Modifier {
  return ({ transform, draggingNodeRect }) => {
    const container = getContainer()
    if (!container || !draggingNodeRect) return transform

    const containerRect = container.getBoundingClientRect()
    const minX = containerRect.left - draggingNodeRect.left
    const minY = containerRect.top - draggingNodeRect.top
    const maxX = containerRect.right - draggingNodeRect.right
    const maxY = containerRect.bottom - draggingNodeRect.bottom

    return {
      ...transform,
      x: Math.min(Math.max(transform.x, minX), maxX),
      y: Math.min(Math.max(transform.y, minY), maxY),
    }
  }
}
