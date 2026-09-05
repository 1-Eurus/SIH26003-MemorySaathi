/**
 * Tiny equal-temperament note helper so synth presets can be written as
 * readable note names (e.g. `freq('D', 4)`) instead of raw Hz values.
 */
const SEMITONES_FROM_A4: Record<string, number> = {
  C: -9,
  'C#': -8,
  D: -7,
  'D#': -6,
  E: -5,
  F: -4,
  'F#': -3,
  G: -2,
  'G#': -1,
  A: 0,
  'A#': 1,
  B: 2,
}

export function freq(note: keyof typeof SEMITONES_FROM_A4, octave: number): number {
  const semitones = SEMITONES_FROM_A4[note] + (octave - 4) * 12
  return 440 * Math.pow(2, semitones / 12)
}

/** Builds a simple looping melody from a scale and a step pattern. */
export function buildMelody(scale: number[], pattern: number[]): number[] {
  return pattern.map((step) => scale[((step % scale.length) + scale.length) % scale.length])
}
