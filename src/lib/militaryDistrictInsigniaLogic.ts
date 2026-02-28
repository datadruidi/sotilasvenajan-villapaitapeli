import { MILITARY_DISTRICT_INSIGNIA_IMAGE_PATHS } from '../data/militaryDistrictInsigniaPaths'

export interface MilitaryDistrictInsigniaEntry {
  id: string
  assetPath: string
  district: string
}

export type MilitaryDistrictInsigniaSubset =
  | 'all'
  | 'central_military_district'
  | 'eastern_military_district'
  | 'leningrad_military_district'
  | 'moscow_military_district'
  | 'northern_fleet_joint_strategic_command'
  | 'southern_military_district'

function districtFromPath(assetPath: string): string {
  const parts = assetPath.split('/').filter(Boolean)
  const idx = parts.indexOf('military-district-insignia')
  if (idx < 0) return ''
  return (parts[idx + 1] ?? '').trim()
}

function buildPool(paths: string[], subset: MilitaryDistrictInsigniaSubset): MilitaryDistrictInsigniaEntry[] {
  return paths
    .map((assetPath, i) => ({
      id: `district-insignia-${subset}-${i}-${assetPath.replace(/\//g, '-')}`,
      assetPath,
      district: districtFromPath(assetPath),
    }))
    .filter((e) => e.district.length > 0)
}

export function getMilitaryDistrictInsigniaPool(subset: MilitaryDistrictInsigniaSubset): MilitaryDistrictInsigniaEntry[] {
  const subsetPaths =
    subset === 'all'
      ? MILITARY_DISTRICT_INSIGNIA_IMAGE_PATHS
      : MILITARY_DISTRICT_INSIGNIA_IMAGE_PATHS.filter((p) => districtFromPath(p) === subset)
  return buildPool(subsetPaths, subset)
}

export function selectMilitaryDistrictInsigniaFromPool(pool: MilitaryDistrictInsigniaEntry[]): MilitaryDistrictInsigniaEntry | null {
  if (pool.length === 0) return null
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}

function getDistrictsFromPool(pool: MilitaryDistrictInsigniaEntry[]): string[] {
  return [...new Set(pool.map((e) => e.district))]
}

export function generateMilitaryDistrictInsigniaOptions(
  selected: MilitaryDistrictInsigniaEntry,
  pool: MilitaryDistrictInsigniaEntry[]
): string[] {
  const correct = selected.district
  const all = getDistrictsFromPool(pool)
  const others = all.filter((d) => d !== correct)
  const wrong: string[] = []
  const shuffled = [...others].sort(() => Math.random() - 0.5)
  for (const d of shuffled) {
    if (wrong.length >= 3) break
    wrong.push(d)
  }
  const options = [correct, ...wrong]
  return shuffleArray(options)
}

export function checkMilitaryDistrictInsigniaAnswer(userAnswer: string, correctDistrict: string): boolean {
  return userAnswer.trim().toLowerCase() === correctDistrict.trim().toLowerCase()
}

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
