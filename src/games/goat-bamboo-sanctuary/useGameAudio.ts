import { useCallback, useRef } from 'react'

/**
 * Soft, unhurried tones for a rehab/mindfulness context — no sharp attacks,
 * no alarms. Built on the Web Audio API so no audio files need bundling.
 */
export function useGameAudio() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      const AudioCtx =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctxRef.current = new AudioCtx()
    }
    if (ctxRef.current.state === 'suspended') {
      void ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const playTone = useCallback((ctx: AudioContext, frequency: number, startTime: number, duration: number, peakGain = 0.14) => {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, startTime)
    gain.gain.setValueAtTime(0.0001, startTime)
    gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start(startTime)
    oscillator.stop(startTime + duration + 0.05)
  }, [])

  /** A single soft two-note chime — played when one goat reaches the paddock. */
  const playChime = useCallback(() => {
    const ctx = getContext()
    const now = ctx.currentTime
    playTone(ctx, 784, now, 0.5, 0.12) // G5
    playTone(ctx, 987.77, now + 0.07, 0.6, 0.08) // B5, soft harmony
  }, [getContext, playTone])

  /** A fuller, slower chime — played when every goat in the level is home. */
  const playLevelUp = useCallback(() => {
    const ctx = getContext()
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 784, 1046.5] // C5, E5, G5, C6
    notes.forEach((frequency, index) => {
      playTone(ctx, frequency, now + index * 0.12, 0.7, 0.1)
    })
  }, [getContext, playTone])

  return { playChime, playLevelUp }
}
