import type { PuzzleImage } from './types'

export function buildSvgDataUrl(svgMarkup: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svgMarkup)}`
}

/** Prefers a real photo (`imageUrl`) if set, otherwise falls back to the built-in illustration. */
export function resolveImageSource(image: PuzzleImage): string {
  if (image.imageUrl) return image.imageUrl
  if (image.svgMarkup) return buildSvgDataUrl(image.svgMarkup)
  return ''
}
