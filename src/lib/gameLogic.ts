/**
 * Game logic: image selection and answer generation.
 * Russia branch pools are built from file lists under public/assets; everything else uses the registry.
 */

import type { ArmySubMode, CountryId, ImageEntry, NavySubMode, VehicleBranch } from '../types/game'
import { AIRBORNE_FORCES_IMAGE_PATHS } from '../data/airborneForcesImagePaths'
import { IMAGE_REGISTRY } from '../data/imageRegistry'
import { AEROSPACE_FORCES_IMAGE_PATHS } from '../data/aerospaceForcesImagePaths'
import { GROUND_FORCES_IMAGE_PATHS } from '../data/groundForcesImagePaths'
import { NAVY_IMAGE_PATHS } from '../data/navyImagePaths'
import { STRATEGIC_MISSILE_FORCES_IMAGE_PATHS } from '../data/strategicMissileForcesImagePaths'
import { UNMANNED_SYSTEMS_IMAGE_PATHS } from '../data/unmannedSystemsImagePaths'

const NAVY_SUB_MODE_SET = new Set<NavySubMode>([
  'maihinnousualukset',
  'miinantorjunta-alukset',
  'sukellusveneet',
  'taistelualukset',
  'tiedustelualukset',
])

function formatNavyClassName(raw: string): string {
  const parts = raw
    .trim()
    .split(/[_\s]+/)
    .flatMap((segment) => segment.split('-').map((part) => part.trim()).filter(Boolean))

  if (parts.length === 0) return raw

  return parts
    .map((part) => {
      if (/^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i.test(part)) return part.toUpperCase()
      if (/^[a-z]$/i.test(part)) return part.toUpperCase()
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    })
    .reduce<string[]>((acc, part) => {
      const previous = acc[acc.length - 1] ?? ''
      if (/^[A-Z]$/.test(part) && previous.length > 0) {
        acc[acc.length - 1] = `${previous}-${part}`
        return acc
      }
      acc.push(part)
      return acc
    }, [])
    .join(' ')
}

/**
 * Build navy image entries from path list.
 * The final folder structure is /<branch>/<category>/<class>/<image>.
 */
function getNavyImageEntries(): ImageEntry[] {
  const entries: ImageEntry[] = []
  for (let i = 0; i < NAVY_IMAGE_PATHS.length; i++) {
    const assetPath = NAVY_IMAGE_PATHS[i]
    const parts = assetPath.split('/').filter(Boolean)
    const navySubMode = parts[parts.length - 3] ?? ''
    const classKey = parts[parts.length - 2] ?? ''
    if (!NAVY_SUB_MODE_SET.has(navySubMode as NavySubMode) || !classKey) continue
    entries.push({
      id: `ru-navy-${i}-${assetPath.replace(/\//g, '-').replace(/\s/g, '_')}`,
      assetPath,
      country: 'russia',
      branch: 'navy',
      correctClassName: `${formatNavyClassName(classKey)} class`,
      active: true,
      navySubMode: navySubMode as NavySubMode,
    })
  }
  return entries
}

function formatUavClassName(raw: string): string {
  const normalized = raw.replace(/[_-]+/g, ' ').trim()
  if (normalized.length === 0) return raw
  return normalized
    .split(/\s+/)
    .map((word) => {
      if (/\d/.test(word)) return word.toUpperCase()
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

function formatGroundForcesClassName(raw: string): string {
  const tokens = raw
    .replace(/[-]+/g, ' ')
    .split(/[_\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)

  const out: string[] = []
  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i]
    const next = i + 1 < tokens.length ? tokens[i + 1] : ''
    const currentIsLetters = /^[a-zA-Z]+$/.test(current)
    const nextHasDigit = /\d/.test(next)

    // Join code prefixes with the following numeric token: bm + 21 -> BM21, t + 90m -> T90M.
    if (currentIsLetters && current.length <= 3 && nextHasDigit) {
      out.push((current + next).toUpperCase())
      i++
      continue
    }

    // Uppercase short tokens (<=4 chars), including alphanumeric model codes.
    if (current.length <= 4 || /\d/.test(current)) {
      out.push(current.toUpperCase())
      continue
    }

    out.push(current.charAt(0).toUpperCase() + current.slice(1).toLowerCase())
  }

  return out.join(' ')
}

/**
 * Build Aerospace Forces image entries from path list.
 * Class name is derived from the folder above the image file.
 */
function getAerospaceForcesImageEntries(): ImageEntry[] {
  const entries: ImageEntry[] = []
  for (let i = 0; i < AEROSPACE_FORCES_IMAGE_PATHS.length; i++) {
    const assetPath = AEROSPACE_FORCES_IMAGE_PATHS[i]
    const parts = assetPath.split('/').filter(Boolean)
    const classKey = parts[parts.length - 2] ?? ''
    if (!classKey) continue
    entries.push({
      id: `ru-airforce-${i}-${assetPath.replace(/\//g, '-').replace(/\s/g, '_')}`,
      assetPath,
      country: 'russia',
      branch: 'airforce',
      correctClassName: `${classKey.trim()} class`,
      active: true,
    })
  }
  return entries
}

/**
 * Build Ground Forces image entries from path list.
 * The final folder structure is /<branch>/<sub-mode>/<class>/<image>.
 */
function getGroundForcesImageEntries(): ImageEntry[] {
  const entries: ImageEntry[] = []
  for (let i = 0; i < GROUND_FORCES_IMAGE_PATHS.length; i++) {
    const assetPath = GROUND_FORCES_IMAGE_PATHS[i]
    const parts = assetPath.split('/').filter(Boolean)
    const armySubMode = parts[parts.length - 3] ?? ''
    const classKey = parts[parts.length - 2] ?? ''
    if (!armySubMode || !classKey) continue
    entries.push({
      id: `ru-army-${i}-${assetPath.replace(/\//g, '-').replace(/\s/g, '_')}`,
      assetPath,
      country: 'russia',
      branch: 'army',
      correctClassName: `${formatGroundForcesClassName(classKey)} class`,
      active: true,
      armySubMode: armySubMode as ArmySubMode,
    })
  }
  return entries
}

function formatStrategicMissileClassName(raw: string): string {
  const base = formatGroundForcesClassName(raw)
  return base.replace(/\bSS18\b/g, 'SS-18')
}

/**
 * Build Strategic Missile Forces image entries from path list.
 * Class name is derived from the folder above the image file.
 */
function getStrategicMissileForcesImageEntries(): ImageEntry[] {
  const entries: ImageEntry[] = []
  for (let i = 0; i < STRATEGIC_MISSILE_FORCES_IMAGE_PATHS.length; i++) {
    const assetPath = STRATEGIC_MISSILE_FORCES_IMAGE_PATHS[i]
    const parts = assetPath.split('/').filter(Boolean)
    const classKey = parts[parts.length - 2] ?? ''
    if (!classKey) continue
    entries.push({
      id: `ru-strategic-missile-${i}-${assetPath.replace(/\//g, '-').replace(/\s/g, '_')}`,
      assetPath,
      country: 'russia',
      branch: 'strategic-missile',
      correctClassName: `${formatStrategicMissileClassName(classKey)} class`,
      active: true,
    })
  }
  return entries
}

/**
 * Build Airborne Forces image entries from path list.
 * Class name is derived from the folder above the image file.
 */
function getAirborneForcesImageEntries(): ImageEntry[] {
  const entries: ImageEntry[] = []
  for (let i = 0; i < AIRBORNE_FORCES_IMAGE_PATHS.length; i++) {
    const assetPath = AIRBORNE_FORCES_IMAGE_PATHS[i]
    const parts = assetPath.split('/').filter(Boolean)
    const classKey = parts[parts.length - 2] ?? ''
    if (!classKey) continue
    entries.push({
      id: `ru-airborne-${i}-${assetPath.replace(/\//g, '-').replace(/\s/g, '_')}`,
      assetPath,
      country: 'russia',
      branch: 'airborne',
      correctClassName: `${classKey.trim()} class`,
      active: true,
    })
  }
  return entries
}

/**
 * Build Unmanned Systems Forces image entries from path list.
 * The final folder structure is /<branch>/<platform-type>/<class>/<image>.
 */
function getUnmannedSystemsImageEntries(): ImageEntry[] {
  const entries: ImageEntry[] = []
  for (let i = 0; i < UNMANNED_SYSTEMS_IMAGE_PATHS.length; i++) {
    const assetPath = UNMANNED_SYSTEMS_IMAGE_PATHS[i]
    const parts = assetPath.split('/').filter(Boolean)
    const classKey = parts[parts.length - 2] ?? ''
    if (!classKey) continue
    entries.push({
      id: `ru-uav-systems-${i}-${assetPath.replace(/\//g, '-').replace(/\s/g, '_')}`,
      assetPath,
      country: 'russia',
      branch: 'uav-systems',
      correctClassName: `${formatUavClassName(classKey)} class`,
      active: true,
    })
  }
  return entries
}

/** Filters the image pool to entries matching country and branch, active only. */
export function getFilteredPool(
  country: CountryId,
  branch: VehicleBranch,
  navySubMode?: NavySubMode,
  armySubMode?: ArmySubMode
): ImageEntry[] {
  if (country === 'russia' && branch === 'navy') {
    const pool = getNavyImageEntries()
    if (!navySubMode) return pool
    return pool.filter((entry) => entry.navySubMode === navySubMode)
  }
  if (country === 'russia' && branch === 'uav-systems') {
    return getUnmannedSystemsImageEntries()
  }
  if (country === 'russia' && branch === 'airforce') {
    return getAerospaceForcesImageEntries()
  }
  if (country === 'russia' && branch === 'army') {
    const pool = getGroundForcesImageEntries()
    if (!armySubMode) return pool
    return pool.filter((entry) => entry.armySubMode === armySubMode)
  }
  if (country === 'russia' && branch === 'strategic-missile') {
    return getStrategicMissileForcesImageEntries()
  }
  if (country === 'russia' && branch === 'airborne') {
    return getAirborneForcesImageEntries()
  }
  return IMAGE_REGISTRY.filter(
    (e) => e.country === country && e.branch === branch && e.active
  )
}

/**
 * Picks one image at random from the filtered pool.
 * Returns null if the pool is empty.
 */
export function selectImageFromPool(pool: ImageEntry[]): ImageEntry | null {
  if (pool.length === 0) return null
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}

/** All distinct class names from the pool (for generating wrong answers). */
function getClassNamesFromPool(pool: ImageEntry[]): string[] {
  const set = new Set(pool.map((e) => e.correctClassName))
  return [...set]
}

/** Returns four option strings: the correct class name plus three other plausible options. */
export function generateOptions(
  selectedEntry: ImageEntry,
  pool: ImageEntry[],
  _navySubMode?: NavySubMode
): string[] {
  const correct = selectedEntry.correctClassName
  const allClassNames = getClassNamesFromPool(pool)
  const others = allClassNames.filter((name) => name !== correct)

  const wrongOptions: string[] = []
  const shuffled = [...others].sort(() => Math.random() - 0.5)
  for (const name of shuffled) {
    if (wrongOptions.length >= 3) break
    wrongOptions.push(name)
  }

  const options = [correct, ...wrongOptions]
  return shuffleArray(options)
}

/** Correct answer for the current question. */
export function getCorrectAnswer(entry: ImageEntry, _navySubMode?: NavySubMode): string {
  return entry.correctClassName
}

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Checks the user's answer against the correct class name. */
export function checkAnswer(
  userAnswer: string,
  correctAnswer: string
): boolean {
  return normalizeClassLabel(userAnswer) === normalizeClassLabel(correctAnswer)
}

/** Strips trailing " class" (case-insensitive) for display; answers are shown without "class". */
export function normalizeClassLabel(name: string): string {
  return name.trim().replace(/\s+class$/i, '')
}
