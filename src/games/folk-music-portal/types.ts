import type { LucideIcon } from 'lucide-react'

export type NortheastRegion =
  | 'Assam'
  | 'Manipur'
  | 'Nagaland'
  | 'Mizoram'
  | 'Tripura'
  | 'Meghalaya'
  | 'Arunachal Pradesh'
  | 'Sikkim'

/**
 * A short, procedurally-played melody used when no real audio file is
 * supplied for an entry. Notes are plain frequencies (Hz) so the whole
 * game works offline with zero audio assets, using nothing but the
 * Web Audio API's oscillators.
 */
export interface SynthPreset {
  /** Oscillator waveform used to voice the melody. */
  waveform: OscillatorType
  /** Melody notes in Hz, played in order and held for `noteDurationMs`. */
  notes: number[]
  /** Base duration of each note, in milliseconds. */
  noteDurationMs: number
  /** Multiplier on playback speed — under 1 plays slower / more stately. */
  tempo: number
  /** Optional sustained low note under the melody, common to many folk forms. */
  droneHz?: number
}

/** One region's cultural scene in the matching game. */
export interface CulturalEntry {
  id: string
  /** Name of the song, dance, or ceremony represented. */
  title: string
  region: NortheastRegion
  /** The festival, dance form, or tradition this entry belongs to. */
  festivalOrForm: string
  /** Optional real audio clip (5–10s). Falls back to `synthPreset` if absent. */
  audioUrl?: string
  synthPreset: SynthPreset
  /** One warm, plain-language sentence shown on the story card. */
  description: string
  /** Short cultural history/trivia shown in the success modal. */
  culturalContext: string
  icon: LucideIcon
  /** One of the app's established accent tokens (hex), for card theming. */
  accentColor: string
}

export interface CulturalBadge {
  entryId: string
  title: string
  earnedAt: number
}
