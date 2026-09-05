import { useCallback, useEffect, useRef, useState } from 'react'
import type { CulturalEntry } from '../types'

const BAR_COUNT = 20

interface FolkAudioState {
  isPlaying: boolean
  /** 0–1 playback progress, for a simple "time remaining" indicator. */
  progress: number
  volume: number
}

/**
 * Plays one cultural entry's clip — a real `audioUrl` if the entry has
 * one, otherwise a small synthesised melody built from `synthPreset` —
 * and exposes live frequency levels for a waveform visualizer. Built on
 * the Web Audio API so both paths share one analyser and one volume
 * control.
 */
export function useFolkAudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const mediaElRef = useRef<HTMLAudioElement | null>(null)
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const scheduledNodesRef = useRef<AudioScheduledSourceNode[]>([])
  const timersRef = useRef<number[]>([])
  const rafRef = useRef<number | null>(null)
  const currentEntryIdRef = useRef<string | null>(null)

  const [state, setState] = useState<FolkAudioState>({ isPlaying: false, progress: 0, volume: 0.75 })
  const [levels, setLevels] = useState<number[]>(() => new Array(BAR_COUNT).fill(0.08))

  const ensureContext = useCallback(() => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      const gain = ctx.createGain()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      analyser.smoothingTimeConstant = 0.75
      gain.gain.value = state.volume
      gain.connect(analyser)
      analyser.connect(ctx.destination)
      ctxRef.current = ctx
      gainRef.current = gain
      analyserRef.current = analyser
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
    }
    return ctxRef.current
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const stop = useCallback(() => {
    clearTimers()
    scheduledNodesRef.current.forEach((node) => {
      try {
        node.stop()
      } catch {
        // already stopped — safe to ignore
      }
    })
    scheduledNodesRef.current = []
    if (mediaElRef.current) {
      mediaElRef.current.pause()
      mediaElRef.current.currentTime = 0
    }
    currentEntryIdRef.current = null
    setState((s) => ({ ...s, isPlaying: false, progress: 0 }))
    setLevels(new Array(BAR_COUNT).fill(0.08))
  }, [])

  const setVolume = useCallback((v: number) => {
    setState((s) => ({ ...s, volume: v }))
    if (gainRef.current) gainRef.current.gain.value = v
  }, [])

  const trackLevels = useCallback(() => {
    const analyser = analyserRef.current
    const data = dataArrayRef.current
    if (!analyser || !data) return
    const loop = () => {
      analyser.getByteFrequencyData(data)
      const bucket = Math.floor(data.length / BAR_COUNT) || 1
      const next: number[] = []
      for (let i = 0; i < BAR_COUNT; i++) {
        const slice = data.slice(i * bucket, i * bucket + bucket)
        const avg = slice.length ? slice.reduce((sum, v) => sum + v, 0) / slice.length : 0
        next.push(Math.max(0.08, avg / 255))
      }
      setLevels(next)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [])

  const playSynth = useCallback(
    (entry: CulturalEntry) => {
      const ctx = ensureContext()
      const gain = gainRef.current!
      const preset = entry.synthPreset
      const startTime = ctx.currentTime + 0.05
      const noteSeconds = (preset.noteDurationMs / 1000) / preset.tempo
      const totalSeconds = noteSeconds * preset.notes.length

      if (preset.droneHz) {
        const drone = ctx.createOscillator()
        const droneGain = ctx.createGain()
        drone.type = 'sine'
        drone.frequency.value = preset.droneHz
        droneGain.gain.value = 0.07
        drone.connect(droneGain)
        droneGain.connect(gain)
        drone.start(startTime)
        drone.stop(startTime + totalSeconds)
        scheduledNodesRef.current.push(drone)
      }

      preset.notes.forEach((noteFreq, i) => {
        const osc = ctx.createOscillator()
        const noteGain = ctx.createGain()
        osc.type = preset.waveform
        osc.frequency.value = noteFreq
        const noteStart = startTime + i * noteSeconds
        noteGain.gain.setValueAtTime(0, noteStart)
        noteGain.gain.linearRampToValueAtTime(0.28, noteStart + Math.min(0.04, noteSeconds * 0.2))
        noteGain.gain.linearRampToValueAtTime(0, noteStart + noteSeconds * 0.92)
        osc.connect(noteGain)
        noteGain.connect(gain)
        osc.start(noteStart)
        osc.stop(noteStart + noteSeconds)
        scheduledNodesRef.current.push(osc)
      })

      return totalSeconds
    },
    [ensureContext],
  )

  const playRealClip = useCallback(
    (entry: CulturalEntry) => {
      const ctx = ensureContext()
      if (!mediaElRef.current) {
        const el = new Audio()
        el.crossOrigin = 'anonymous'
        mediaElRef.current = el
        mediaSourceRef.current = ctx.createMediaElementSource(el)
        mediaSourceRef.current.connect(gainRef.current!)
      }
      const el = mediaElRef.current
      el.src = entry.audioUrl!
      el.currentTime = 0
      void el.play()
      return el.duration && Number.isFinite(el.duration) ? el.duration : 8
    },
    [ensureContext],
  )

  const play = useCallback(
    (entry: CulturalEntry) => {
      stop()
      const ctx = ensureContext()
      if (ctx.state === 'suspended') void ctx.resume()

      currentEntryIdRef.current = entry.id
      const totalSeconds = entry.audioUrl ? playRealClip(entry) : playSynth(entry)

      setState((s) => ({ ...s, isPlaying: true, progress: 0 }))
      trackLevels()

      const tickMs = 80
      let elapsed = 0
      const tick = () => {
        elapsed += tickMs
        const progress = Math.min(1, elapsed / (totalSeconds * 1000))
        setState((s) => ({ ...s, progress }))
        if (elapsed < totalSeconds * 1000 && currentEntryIdRef.current === entry.id) {
          timersRef.current.push(window.setTimeout(tick, tickMs))
        } else if (currentEntryIdRef.current === entry.id) {
          clearTimers()
          setState((s) => ({ ...s, isPlaying: false, progress: 0 }))
          setLevels(new Array(BAR_COUNT).fill(0.08))
        }
      }
      timersRef.current.push(window.setTimeout(tick, tickMs))
    },
    [ensureContext, playRealClip, playSynth, stop, trackLevels],
  )

  /** Short, cheerful two-note chime for correct matches — independent of the melody engine. */
  const playSuccessChime = useCallback(() => {
    const ctx = ensureContext()
    const gain = gainRef.current!
    const now = ctx.currentTime + 0.02
    ;[523.25, 783.99].forEach((f, i) => {
      const osc = ctx.createOscillator()
      const noteGain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = f
      const start = now + i * 0.12
      noteGain.gain.setValueAtTime(0, start)
      noteGain.gain.linearRampToValueAtTime(0.22, start + 0.02)
      noteGain.gain.linearRampToValueAtTime(0, start + 0.3)
      osc.connect(noteGain)
      noteGain.connect(gain)
      osc.start(start)
      osc.stop(start + 0.32)
    })
  }, [ensureContext])

  useEffect(() => () => stop(), [stop])

  return {
    play,
    stop,
    playSuccessChime,
    isPlaying: state.isPlaying,
    progress: state.progress,
    volume: state.volume,
    setVolume,
    levels,
  }
}
