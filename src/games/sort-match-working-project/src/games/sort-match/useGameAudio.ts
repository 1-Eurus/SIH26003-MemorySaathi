import { useCallback, useRef } from 'react'

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

  const playTone = useCallback(
    (ctx: AudioContext, frequency: number, startTime: number, duration: number, peakGain = 0.15, type: OscillatorType = 'sine') => {
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

  /** A warm two-note confirmation — a correct placement. */
  const playCorrect = useCallback(() => {
    const ctx = getContext()
    const now = ctx.currentTime
    playTone(ctx, 660, now, 0.16, 0.15)
    playTone(ctx, 880, now + 0.08, 0.2, 0.14)
  }, [getContext, playTone])

  /** A soft, non-judgmental tone — not the right bin, try another. */
  const playTryAgain = useCallback(() => {
    const ctx = getContext()
    playTone(ctx, 320, ctx.currentTime, 0.14, 0.1, 'triangle')
  }, [getContext, playTone])

  /** A fuller rising chime — the whole set is sorted. */
  const playComplete = useCallback(() => {
    const ctx = getContext()
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((frequency, index) => {
      playTone(ctx, frequency, now + index * 0.1, 0.35, 0.16)
    })
  }, [getContext, playTone])

  return { playCorrect, playTryAgain, playComplete }
}
