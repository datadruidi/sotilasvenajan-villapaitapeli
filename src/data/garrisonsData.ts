/**
 * Varuskunnat (garrisons) quiz data.
 * Each entry has an image (map-style) and the correct garrison name.
 *
 * Image location: public/assets/garrisons/
 * Naming: use the correct answer as filename, e.g. Santahamina.jpg, Upinniemi.jpg
 * Names with spaces: Utin lentoasema.jpg (path is URL-encoded automatically).
 */

export interface GarrisonEntry {
  id: string
  /** Path to image asset. Built from correctAnswer → /assets/garrisons/{correctAnswer}.jpg */
  imagePath: string
  /** Correct answer shown as one of the four options. Also used for image filename. */
  correctAnswer: string
  active: boolean
}

const GARRISONS_BASE = '/assets/garrisons'

/** Image path from garrison name: e.g. "Santahamina" → .../Santahamina.jpg */
function imagePathFromName(correctAnswer: string): string {
  return `${GARRISONS_BASE}/${encodeURIComponent(correctAnswer)}.jpg`
}

export const GARRISONS_REGISTRY: GarrisonEntry[] = [  { id: 'garrison-23', imagePath: imagePathFromName('Agalatovo'), correctAnswer: 'Agalatovo', active: true },
  { id: 'garrison-24', imagePath: imagePathFromName('Alakurtti'), correctAnswer: 'Alakurtti', active: true },
  { id: 'garrison-25', imagePath: imagePathFromName('Baltijsk'), correctAnswer: 'Baltijsk', active: true },
  { id: 'garrison-26', imagePath: imagePathFromName('Besovets'), correctAnswer: 'Besovets', active: true },
  { id: 'garrison-27', imagePath: imagePathFromName('Donskoe'), correctAnswer: 'Donskoe', active: true },
  { id: 'garrison-28', imagePath: imagePathFromName('Gadzievo'), correctAnswer: 'Gadzievo', active: true },
  { id: 'garrison-29', imagePath: imagePathFromName('Gorelovo'), correctAnswer: 'Gorelovo', active: true },
  { id: 'garrison-30', imagePath: imagePathFromName('Guba Olenja'), correctAnswer: 'Guba Olenja', active: true },
  { id: 'garrison-31', imagePath: imagePathFromName('Gvardeisk'), correctAnswer: 'Gvardeisk', active: true },
  { id: 'garrison-32', imagePath: imagePathFromName('Hotilovo'), correctAnswer: 'Hotilovo', active: true },
  { id: 'garrison-33', imagePath: imagePathFromName('Hrabrovo'), correctAnswer: 'Hrabrovo', active: true },
  { id: 'garrison-34', imagePath: imagePathFromName('Kaliningrad'), correctAnswer: 'Kaliningrad', active: true },
  { id: 'garrison-35', imagePath: imagePathFromName('Kamenka'), correctAnswer: 'Kamenka', active: true },
  { id: 'garrison-36', imagePath: imagePathFromName('Kerro'), correctAnswer: 'Kerro', active: true },
  { id: 'garrison-37', imagePath: imagePathFromName('Kola'), correctAnswer: 'Kola', active: true },
  { id: 'garrison-38', imagePath: imagePathFromName('Krasnoe Selo'), correctAnswer: 'Krasnoe Selo', active: true },
  { id: 'garrison-39', imagePath: imagePathFromName('Kronstadt'), correctAnswer: 'Kronstadt', active: true },
  { id: 'garrison-40', imagePath: imagePathFromName('Lomonosov'), correctAnswer: 'Lomonosov', active: true },
  { id: 'garrison-41', imagePath: imagePathFromName('Luga'), correctAnswer: 'Luga', active: true },
  { id: 'garrison-42', imagePath: imagePathFromName('Montsegorsk'), correctAnswer: 'Montsegorsk', active: true },
  { id: 'garrison-43', imagePath: imagePathFromName('Murmansk'), correctAnswer: 'Murmansk', active: true },
  { id: 'garrison-44', imagePath: imagePathFromName('Olenja'), correctAnswer: 'Olenja', active: true },
  { id: 'garrison-45', imagePath: imagePathFromName('Perunoe'), correctAnswer: 'Perunoe', active: true },
  { id: 'garrison-46', imagePath: imagePathFromName('Petroskoi'), correctAnswer: 'Petroskoi', active: true },
  { id: 'garrison-47', imagePath: imagePathFromName('Petsamo'), correctAnswer: 'Petsamo', active: true },
  { id: 'garrison-48', imagePath: imagePathFromName('Pietari'), correctAnswer: 'Pietari', active: true },
  { id: 'garrison-49', imagePath: imagePathFromName('Pihkova'), correctAnswer: 'Pihkova', active: true },
  { id: 'garrison-50', imagePath: imagePathFromName('Poljarnyj'), correctAnswer: 'Poljarnyj', active: true },
  { id: 'garrison-51', imagePath: imagePathFromName('Promezhitsy'), correctAnswer: 'Promezhitsy', active: true },
  { id: 'garrison-52', imagePath: imagePathFromName('Sapjornoe'), correctAnswer: 'Sapjornoe', active: true },
  { id: 'garrison-53', imagePath: imagePathFromName('Severomorsk 3'), correctAnswer: 'Severomorsk 3', active: true },
  { id: 'garrison-54', imagePath: imagePathFromName('Severomorsk'), correctAnswer: 'Severomorsk', active: true },
  { id: 'garrison-55', imagePath: imagePathFromName('Sputnik'), correctAnswer: 'Sputnik', active: true },
  { id: 'garrison-56', imagePath: imagePathFromName('Tsernaja Retska'), correctAnswer: 'Tsernaja Retska', active: true },
  { id: 'garrison-57', imagePath: imagePathFromName('Tsernjahovsk'), correctAnswer: 'Tsernjahovsk', active: true },
  { id: 'garrison-58', imagePath: imagePathFromName('Tskalovsk'), correctAnswer: 'Tskalovsk', active: true },
  { id: 'garrison-59', imagePath: imagePathFromName('Vidjaevo'), correctAnswer: 'Vidjaevo', active: true },
  { id: 'garrison-60', imagePath: imagePathFromName('Vladimirsky Lager'), correctAnswer: 'Vladimirsky Lager', active: true },
  { id: 'garrison-61', imagePath: imagePathFromName('Zapadnaja Litsa'), correctAnswer: 'Zapadnaja Litsa', active: true },
  { id: 'garrison-62', imagePath: imagePathFromName('Znamensk'), correctAnswer: 'Znamensk', active: true },
]

/** Region id for filtering garrison quiz. */
export type GarrisonRegionId = 'pohjoinen' | 'etela' | 'kaliningrad' | 'kaikki'

const POHJOINEN_NAMES = new Set([
  'Petsamo', 'Sputnik', 'Zapadnaja Litsa', 'Vidjaevo', 'Gadzievo', 'Poljarnyj', 'Guba Olenja',
  'Severomorsk', 'Murmansk', 'Severomorsk 3', 'Kola', 'Olenja', 'Montsegorsk', 'Alakurtti',
])
const ETELA_NAMES = new Set([
  'Besovets', 'Petroskoi', 'Sapjornoe', 'Kamenka', 'Kerro', 'Agalatovo', 'Tsernaja Retska',
  'Kronstadt', 'Pietari', 'Gorelovo', 'Krasnoe Selo', 'Lomonosov', 'Luga', 'Vladimirsky Lager',
  'Hotilovo', 'Pihkova', 'Promezhitsy',
])
const KALININGRAD_NAMES = new Set([
  'Donskoe', 'Perunoe', 'Baltijsk', 'Hrabrovo', 'Tskalovsk', 'Kaliningrad', 'Gvardeisk', 'Znamensk', 'Tsernjahovsk',
])

export function getGarrisonsRegistryByRegion(region: GarrisonRegionId): GarrisonEntry[] {
  const active = GARRISONS_REGISTRY.filter((e) => e.active)
  if (region === 'kaikki') return active
  const set = region === 'pohjoinen' ? POHJOINEN_NAMES : region === 'etela' ? ETELA_NAMES : KALININGRAD_NAMES
  return active.filter((e) => set.has(e.correctAnswer))
}
