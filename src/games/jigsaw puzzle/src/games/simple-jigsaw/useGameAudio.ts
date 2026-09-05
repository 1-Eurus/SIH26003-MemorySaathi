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
    (ctx: AudioContext, frequency: number, startTime: number, duration: number, peakGain = 0.15) => {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'sine'
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

  /** Soft tap — played on every piece swap, regardless of whether it helped. */
  const playSwap = useCallback(() => {
    const ctx = getContext()
    playTone(ctx, 480, ctx.currentTime, 0.1, 0.1)
  }, [getContext, playTone])

  /** Warm rising chime — played when the puzzle is solved. */
  const playComplete = useCallback(() => {
    const ctx = getContext()
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((frequency, index) => {
      playTone(ctx, frequency, now + index * 0.1, 0.35, 0.16)
    })
  }, [getContext, playTone])

  return { playSwap, playComplete }
}
