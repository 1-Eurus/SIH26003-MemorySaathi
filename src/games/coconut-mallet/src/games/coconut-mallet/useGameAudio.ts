import { useCallback, useRef } from 'react'

/** Tiny synth built on the Web Audio API so the game needs no bundled audio assets. */
export function useGameAudio() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctxRef.current = new AudioCtx()
    }
    if (ctxRef.current.state === 'suspended') {
      void ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const playTone = useCallback(
    (
      ctx: AudioContext,
      frequency: number,
      startTime: number,
      duration: number,
      peakGain = 0.16,
      type: OscillatorType = 'sine',
    ) => {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, startTime)
      gain.gain.setValueAtTime(0.0001, startTime)
      gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start(startTime)
      oscillator.stop(startTime + duration + 0.02)
    },
    [],
  )

  /** Soft tap — obstacle graze / minor feedback. */
  const playPop = useCallback(() => {
    const ctx = getContext()
    playTone(ctx, 220, ctx.currentTime, 0.12, 0.14, 'triangle')
  }, [getContext, playTone])

  /** Low thud — a failed/incomplete attempt. */
  const playThud = useCallback(() => {
    const ctx = getContext()
    playTone(ctx, 130, ctx.currentTime, 0.16, 0.18, 'sine')
  }, [getContext, playTone])

  /** Rising four-note chime — a successful hit/goal. */
  const playCheer = useCallback(() => {
    const ctx = getContext()
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    notes.forEach((frequency, index) => {
      playTone(ctx, frequency, now + index * 0.09, 0.28, 0.15, 'sine')
    })
  }, [getContext, playTone])

  /** Sharp crack — the mallet actually connecting with the moving ball. */
  const playStrike = useCallback(() => {
    const ctx = getContext()
    const now = ctx.currentTime
    playTone(ctx, 900, now, 0.05, 0.2, 'square')
    playTone(ctx, 180, now, 0.12, 0.18, 'triangle')
  }, [getContext, playTone])

  /** Harsh buzz — a hazard/obstacle actually costing a life now. */
  const playHazard = useCallback(() => {
    const ctx = getContext()
    const now = ctx.currentTime
    playTone(ctx, 110, now, 0.22, 0.22, 'sawtooth')
    playTone(ctx, 98, now + 0.05, 0.22, 0.18, 'sawtooth')
  }, [getContext, playTone])

  /** Descending tone — game over. */
  const playGameOver = useCallback(() => {
    const ctx = getContext()
    const now = ctx.currentTime
    const notes = [392, 349.23, 293.66, 220]
    notes.forEach((frequency, index) => {
      playTone(ctx, frequency, now + index * 0.16, 0.3, 0.2, 'triangle')
    })
  }, [getContext, playTone])

  return { playPop, playThud, playCheer, playStrike, playHazard, playGameOver }
}
