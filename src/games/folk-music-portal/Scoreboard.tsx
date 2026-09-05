import type { ReactNode } from 'react'
import { Captions, Lightbulb, Music4, Sparkles } from 'lucide-react'
import type { CulturalEntry } from '../types'

interface ToggleSwitchProps {
  label: string
  description: string
  icon: ReactNode
  checked: boolean
  onChange: () => void
}

function ToggleSwitch({ label, description, icon, checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="flex min-h-[64px] w-full items-center justify-between gap-3 rounded-2xl bg-white px-5 py-3 text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#355FC7]"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFE0C8] text-[#1D2B49]">
          {icon}
        </span>
        <span>
          <span className="block font-[Nunito] text-lg font-bold text-[#1D2B49]">{label}</span>
          <span className="block font-[DM_Sans] text-sm text-[#1D2B49]/60">{description}</span>
        </span>
      </span>
      <span
        className={`relative h-9 w-16 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#4A7C59]' : 'bg-[#EFE0C8]'}`}
      >
        <span
          className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all ${
            checked ? 'left-8' : 'left-1'
          }`}
        />
      </span>
    </button>
  )
}

interface ScoreboardProps {
  discoveredEntries: CulturalEntry[]
  totalCount: number
  hintEnabled: boolean
  onToggleHint: () => void
  showSubtitles: boolean
  onToggleSubtitles: () => void
}

export function Scoreboard({
  discoveredEntries,
  totalCount,
  hintEnabled,
  onToggleHint,
  showSubtitles,
  onToggleSubtitles,
}: ScoreboardProps) {
  return (
    <section aria-label="Progress and settings" className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-[24px] bg-[#1D2B49] p-6 text-white">
        <div className="flex items-center gap-2">
          <Music4 className="h-6 w-6 text-[#F1E3A4]" aria-hidden="true" />
          <p className="font-[DM_Sans] text-sm font-semibold uppercase tracking-wide text-white/70">
            Songs discovered
          </p>
        </div>
        <p className="mt-1 font-[Nunito] text-4xl font-extrabold">
          {discoveredEntries.length} <span className="text-xl font-semibold text-white/60">of {totalCount}</span>
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#F1E3A4]" aria-hidden="true" />
          <p className="font-[DM_Sans] text-sm font-semibold text-white/70">Cultural badges earned</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" aria-live="polite">
          {discoveredEntries.length === 0 && (
            <p className="font-[DM_Sans] text-sm text-white/50">Play a song and find its match to earn your first badge.</p>
          )}
          {discoveredEntries.map((entry) => (
            <span
              key={entry.id}
              className="flex h-12 w-12 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: entry.accentColor }}
              title={`${entry.region} badge`}
            >
              <entry.icon className="h-6 w-6" aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <ToggleSwitch
          label="Hints"
          description="Show the festival name on each card"
          icon={<Lightbulb className="h-5 w-5" aria-hidden="true" />}
          checked={hintEnabled}
          onChange={onToggleHint}
        />
        <ToggleSwitch
          label="Subtitles"
          description="Show the song title while it plays"
          icon={<Captions className="h-5 w-5" aria-hidden="true" />}
          checked={showSubtitles}
          onChange={onToggleSubtitles}
        />
      </div>
    </section>
  )
}
