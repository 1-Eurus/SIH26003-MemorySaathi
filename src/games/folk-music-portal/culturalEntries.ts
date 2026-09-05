import { Amphora, Bird, Drum, Flower2, Mountain, Music2, TreePine, Wheat } from 'lucide-react'
import type { CulturalEntry } from './types'
import { buildMelody, freq } from './music'

/**
 * The melodies below are original, synthesised gameplay cues — a stylised
 * stand-in for each tradition's mood (tempo, register, brightness), not a
 * reproduction of any real recording. Swap in a real `audioUrl` per entry
 * whenever a licensed field recording is available; the game falls back
 * to the synth preset automatically when `audioUrl` is absent.
 */

// A bright five-note scale, generally read as "lively" — good for
// festival dances that lean quick and rhythmic (Bihu, Wangala, Hozagiri).
const brightPentatonic = [freq('D', 4), freq('E', 4), freq('F#', 4), freq('A', 4), freq('B', 4)]

// A warmer, lower scale for slower, more devotional or ceremonial pieces.
const warmPentatonic = [freq('C', 4), freq('D', 4), freq('F', 4), freq('G', 4), freq('A#', 4)]

// A spare, open scale for mountain / mask-dance pieces with more air
// between phrases.
const openScale = [freq('A', 3), freq('C', 4), freq('D', 4), freq('E', 4), freq('G', 4)]

export const culturalEntries: CulturalEntry[] = [
  {
    id: 'assam-bihu',
    title: 'Bihu Dance',
    region: 'Assam',
    festivalOrForm: 'Rongali Bihu, the spring harvest festival',
    synthPreset: {
      waveform: 'triangle',
      notes: buildMelody(brightPentatonic, [0, 1, 2, 1, 3, 2, 4, 3, 0, 1, 2, 4, 3, 2, 1, 0]),
      noteDurationMs: 320,
      tempo: 1.1,
    },
    description: 'A quick, joyful dance that greets the new farming season with drums and swaying hips.',
    culturalContext:
      "Bihu is danced when the fields turn green each spring. The dhol drum sets a fast beat while dancers move in bright, hand-woven mekhela sador cloth — a community's way of thanking the land before the year's planting begins.",
    icon: Wheat,
    accentColor: '#C4622D',
  },
  {
    id: 'manipur-sankirtana',
    title: 'Sankirtana',
    region: 'Manipur',
    festivalOrForm: 'Nata Sankirtana, devotional temple performance',
    synthPreset: {
      waveform: 'sine',
      notes: buildMelody(warmPentatonic, [0, 1, 2, 3, 2, 1, 4, 3, 2, 1, 0]),
      noteDurationMs: 460,
      tempo: 0.9,
      droneHz: freq('C', 3),
    },
    description: 'A gentle, steady rhythm of cymbals and drums, sung as an offering rather than a show.',
    culturalContext:
      'Sankirtana is performed in temple courtyards to mark birth, marriage, and other family milestones. Singers narrate stories of Krishna while drummers keep a hypnotic, unhurried pulse — recognised by UNESCO as a living cultural treasure of humanity.',
    icon: Music2,
    accentColor: '#355FC7',
  },
  {
    id: 'nagaland-hornbill',
    title: 'Hornbill Festival Rhythms',
    region: 'Nagaland',
    festivalOrForm: 'Hornbill Festival, a gathering of Naga tribes',
    synthPreset: {
      waveform: 'square',
      notes: buildMelody(openScale, [0, 0, 1, 2, 1, 0, 3, 2, 1, 0, 4, 3]),
      noteDurationMs: 300,
      tempo: 1,
    },
    description: 'Bold, chant-like calls answered by log drums, echoing the hornbill for which the festival is named.',
    culturalContext:
      'Every December, sixteen Naga tribes gather in Kisama to share songs, chants, and log-drum rhythms passed down through generations. The hornbill bird is honoured for its grace, giving the festival its name.',
    icon: Bird,
    accentColor: '#4A7C59',
  },
  {
    id: 'mizoram-cheraw',
    title: 'Cheraw (Bamboo Dance)',
    region: 'Mizoram',
    festivalOrForm: 'Chapchar Kut, the spring festival',
    synthPreset: {
      waveform: 'triangle',
      notes: buildMelody(brightPentatonic, [4, 3, 2, 3, 1, 2, 0, 1, 4, 3, 2, 0]),
      noteDurationMs: 280,
      tempo: 1.15,
    },
    description: "A crisp, clacking beat that mirrors dancers' feet stepping neatly between rhythmic bamboo poles.",
    culturalContext:
      'In the Cheraw, pairs of bamboo staves are clapped open and shut in time while dancers step between them without missing a beat. It is one of the oldest dances in Mizoram, traditionally performed at Chapchar Kut to welcome spring.',
    icon: TreePine,
    accentColor: '#1D2B49',
  },
  {
    id: 'tripura-hozagiri',
    title: 'Hozagiri',
    region: 'Tripura',
    festivalOrForm: "Garia Puja, the Reang community's harvest worship",
    synthPreset: {
      waveform: 'sine',
      notes: buildMelody(warmPentatonic, [2, 3, 2, 1, 3, 4, 3, 1, 2, 0, 1]),
      noteDurationMs: 400,
      tempo: 0.95,
    },
    description: 'A poised, balanced melody for a dance performed atop earthen pitchers without a single wobble.',
    culturalContext:
      "Young women of the Reang community dance Hozagiri balanced on earthen pitchers, moving only their hips and shoulders while a bottle-lamp rests on their head. It is performed during Garia Puja to give thanks for a good harvest.",
    icon: Amphora,
    accentColor: '#C4622D',
  },
  {
    id: 'meghalaya-wangala',
    title: 'Wangala (Hundred Drums)',
    region: 'Meghalaya',
    festivalOrForm: 'Wangala, the Garo hundred-drums harvest festival',
    synthPreset: {
      waveform: 'square',
      notes: buildMelody(brightPentatonic, [0, 2, 0, 2, 1, 3, 1, 3, 4, 2, 0, 1, 2, 3]),
      noteDurationMs: 300,
      tempo: 1.05,
    },
    description: 'Layered drumbeats stack on top of one another, building into one great shared rhythm.',
    culturalContext:
      'The Garo people give thanks to the sun god Misi Saljong with rows of long drums played together at once. Dancers wear feathered headgear and move in long lines, one drumbeat answering the next.',
    icon: Drum,
    accentColor: '#355FC7',
  },
  {
    id: 'arunachal-losar',
    title: 'Losar Mask Songs',
    region: 'Arunachal Pradesh',
    festivalOrForm: 'Losar, the Monpa new year festival',
    synthPreset: {
      waveform: 'sine',
      notes: buildMelody(openScale, [0, 1, 0, 2, 3, 2, 1, 4, 3, 1, 0]),
      noteDurationMs: 480,
      tempo: 0.85,
      droneHz: freq('A', 2),
    },
    description: 'A slow, spacious tune with long, held notes, fit for masked dancers moving among mountain peaks.',
    culturalContext:
      'Losar welcomes the new year among the Monpa people of the high Himalayas. Monks in painted masks perform slow, deliberate dances to the sound of long horns, believed to clear away the troubles of the year just passed.',
    icon: Mountain,
    accentColor: '#4A7C59',
  },
  {
    id: 'sikkim-chaam',
    title: 'Chaam Mask Dance',
    region: 'Sikkim',
    festivalOrForm: 'Pang Lhabsol, honouring Mount Khangchendzonga',
    synthPreset: {
      waveform: 'sine',
      notes: buildMelody(warmPentatonic, [4, 3, 4, 2, 3, 1, 2, 0, 1, 4]),
      noteDurationMs: 440,
      tempo: 0.9,
      droneHz: freq('D', 3),
    },
    description: 'A calm, ceremonial tune that unfolds slowly, matching the measured turns of masked monastery dancers.',
    culturalContext:
      'Monks perform the Chaam in monastery courtyards during Pang Lhabsol, wearing elaborate painted masks to honour Mount Khangchendzonga as the guardian deity of Sikkim. Each turn and pause in the dance carries symbolic meaning.',
    icon: Flower2,
    accentColor: '#1D2B49',
  },
]
