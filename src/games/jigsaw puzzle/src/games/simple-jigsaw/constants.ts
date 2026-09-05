import type { GridSize, PuzzleImage } from './types'

// Simple, bold, uncluttered shapes on purpose — busy detail becomes
// unrecognizable once cut into 16 small pieces, and bold/simple imagery is
// also just easier to read for anyone with vision changes. These are
// original illustrations, not photos; see types.ts for how to supply real
// photos (e.g. family pictures) via `imageUrl` instead.

const SUNRISE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FBF8F0"/>
      <stop offset="100%" stop-color="#F1E3A4"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#sky)"/>
  <circle cx="200" cy="220" r="70" fill="#C4622D"/>
  <path d="M0 300 Q100 220 200 280 T400 260 V400 H0 Z" fill="#4A7C59"/>
  <path d="M0 340 Q120 290 220 330 T400 320 V400 H0 Z" fill="#EFE0C8"/>
  <path d="M80 120 q12 -16 24 0" stroke="#1D2B49" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M130 150 q12 -16 24 0" stroke="#1D2B49" stroke-width="5" fill="none" stroke-linecap="round"/>
</svg>
`.trim()

const BAMBOO_GROVE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#FBF8F0"/>
  <rect x="0" y="330" width="400" height="70" fill="#EFE0C8"/>
  <rect x="40" y="20" width="28" height="360" rx="14" fill="#4A7C59"/>
  <rect x="112" y="60" width="28" height="320" rx="14" fill="#4A7C59"/>
  <rect x="184" y="10" width="28" height="370" rx="14" fill="#4A7C59"/>
  <rect x="256" y="80" width="28" height="300" rx="14" fill="#4A7C59"/>
  <rect x="328" y="40" width="28" height="340" rx="14" fill="#4A7C59"/>
  <g stroke="#355F3F" stroke-width="4">
    <line x1="40" y1="100" x2="68" y2="100"/>
    <line x1="40" y1="180" x2="68" y2="180"/>
    <line x1="40" y1="260" x2="68" y2="260"/>
    <line x1="112" y1="140" x2="140" y2="140"/>
    <line x1="112" y1="220" x2="140" y2="220"/>
    <line x1="184" y1="90" x2="212" y2="90"/>
    <line x1="184" y1="170" x2="212" y2="170"/>
    <line x1="184" y1="250" x2="212" y2="250"/>
    <line x1="256" y1="160" x2="284" y2="160"/>
    <line x1="256" y1="240" x2="284" y2="240"/>
    <line x1="328" y1="120" x2="356" y2="120"/>
    <line x1="328" y1="200" x2="356" y2="200"/>
  </g>
  <ellipse cx="54" cy="20" rx="22" ry="10" fill="#6FA47F" transform="rotate(-20 54 20)"/>
  <ellipse cx="198" cy="12" rx="24" ry="10" fill="#6FA47F" transform="rotate(15 198 12)"/>
  <ellipse cx="342" cy="42" rx="22" ry="10" fill="#6FA47F" transform="rotate(-10 342 42)"/>
</svg>
`.trim()

const LOTUS_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#EFE0C8"/>
  <ellipse cx="200" cy="340" rx="160" ry="20" fill="#355FC7" opacity="0.18"/>
  <ellipse cx="200" cy="340" rx="115" ry="13" fill="#355FC7" opacity="0.22"/>
  <path d="M200 340 C160 260 160 200 200 160 C240 200 240 260 200 340 Z" fill="#C4622D"/>
  <path d="M200 340 C140 280 120 220 150 170 C200 190 220 250 200 340 Z" fill="#F1E3A4"/>
  <path d="M200 340 C260 280 280 220 250 170 C200 190 180 250 200 340 Z" fill="#F1E3A4"/>
  <path d="M200 340 C130 300 110 250 140 210 C190 230 210 280 200 340 Z" fill="#C4622D" opacity="0.85"/>
  <path d="M200 340 C270 300 290 250 260 210 C210 230 190 280 200 340 Z" fill="#C4622D" opacity="0.85"/>
  <circle cx="200" cy="220" r="16" fill="#4A7C59"/>
</svg>
`.trim()

export const BUILT_IN_IMAGES: PuzzleImage[] = [
  { id: 'sunrise', name: 'Sunrise Over the Hills', accentColor: '#C4622D', svgMarkup: SUNRISE_SVG },
  { id: 'bamboo-grove', name: 'Bamboo Grove', accentColor: '#4A7C59', svgMarkup: BAMBOO_GROVE_SVG },
  { id: 'lotus', name: 'Lotus Bloom', accentColor: '#355FC7', svgMarkup: LOTUS_SVG },
]

export const GRID_SIZE_OPTIONS: { value: GridSize; label: string }[] = [
  { value: 2, label: '4 pieces' },
  { value: 3, label: '9 pieces' },
  { value: 4, label: '16 pieces' },
]
