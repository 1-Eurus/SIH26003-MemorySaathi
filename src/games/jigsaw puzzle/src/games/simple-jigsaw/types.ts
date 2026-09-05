// ─── Simple Jigsaw — shared types ───────────────────────────────────────────

export type GridSize = 2 | 3 | 4

export interface PuzzleImage {
  id: string
  name: string
  accentColor: string
  /** Inline SVG markup for a built-in illustration — used when `imageUrl` isn't set. */
  svgMarkup?: string
  /** A real photo (e.g. a family photo), if you have one. Takes priority over svgMarkup when set. */
  imageUrl?: string
}
