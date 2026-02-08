/**
 * Game logic: image selection and answer generation.
 * Navy pool is built from file list + filename parser; other branches use the registry.
 */

import type { CountryId, ImageEntry, NavySubMode, VehicleBranch } from '../types/game'
import { IMAGE_REGISTRY } from '../data/imageRegistry'
import { NAVY_IMAGE_PATHS } from '../data/navyImagePaths'
import { parseNavyFilename } from './navyFilenameParser'

/**
 * Build navy image entries from path list; class and vessel name are derived from filenames.
 * - class_01.jpg → class only (Alusluokat).
 * - class_vesselname_01.jpg or class_vesselname.jpg → class + vessel name (both modes).
 */
function getNavyImageEntries(): ImageEntry[] {
  const entries: ImageEntry[] = []
  for (let i = 0; i < NAVY_IMAGE_PATHS.length; i++) {
    const assetPath = NAVY_IMAGE_PATHS[i]
    const parsed = parseNavyFilename(assetPath)
    if (!parsed) continue
    // When there is no vessel name (e.g. ivan_gren_01.jpg), use class name so the same name
    // is shown in both Alusluokat and Alusten nimet.
    const vesselName = parsed.vesselName ?? parsed.classDisplay
    entries.push({
      id: `ru-navy-${i}-${assetPath.replace(/\//g, '-').replace(/\s/g, '_')}`,
      assetPath,
      country: 'russia',
      branch: 'navy',
      correctClassName: `${parsed.classDisplay} class`,
      active: true,
      vesselName,
    })
  }
  return entries
}

/**
 * Filters the image pool to entries matching country and branch, active only.
 * Navy uses file list + parser; for navy + vesselName mode, only entries with vesselName are included.
 */
export function getFilteredPool(
  country: CountryId,
  branch: VehicleBranch,
  navySubMode?: NavySubMode
): ImageEntry[] {
  if (country === 'russia' && branch === 'navy') {
    let pool = getNavyImageEntries()
    if (navySubMode === 'vesselName') {
      pool = pool.filter((e) => e.vesselName != null && e.vesselName.trim() !== '')
    }
    return pool
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

/**
 * All distinct class names from the pool (for generating wrong answers).
 */
function getClassNamesFromPool(pool: ImageEntry[]): string[] {
  const set = new Set(pool.map((e) => e.correctClassName))
  return [...set]
}

/**
 * All distinct vessel names from the pool (navy vesselName mode).
 */
function getVesselNamesFromPool(pool: ImageEntry[]): string[] {
  const names: string[] = []
  for (const e of pool) {
    if (e.vesselName != null && e.vesselName.trim() !== '') {
      names.push(e.vesselName.trim())
    }
  }
  return [...new Set(names)]
}

/**
 * Returns four option strings: the correct class name plus three other
 * plausible options from the same country and branch. Options are shuffled.
 */
export function generateOptions(
  selectedEntry: ImageEntry,
  pool: ImageEntry[],
  navySubMode?: NavySubMode
): string[] {
  if (navySubMode === 'vesselName' && selectedEntry.vesselName != null) {
    const correct = selectedEntry.vesselName.trim()
    const allVesselNames = getVesselNamesFromPool(pool)
    const others = allVesselNames.filter((name) => normalizeVesselName(name) !== normalizeVesselName(correct))
    const wrongOptions: string[] = []
    const shuffled = [...others].sort(() => Math.random() - 0.5)
    for (const name of shuffled) {
      if (wrongOptions.length >= 3) break
      wrongOptions.push(name)
    }
    const options = [correct, ...wrongOptions]
    return shuffleArray(options)
  }

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

/**
 * Correct answer for the current question (class or vessel name depending on navy sub-mode).
 */
export function getCorrectAnswer(entry: ImageEntry, navySubMode?: NavySubMode): string {
  if (navySubMode === 'vesselName' && entry.vesselName != null && entry.vesselName.trim() !== '') {
    return entry.vesselName.trim()
  }
  return entry.correctClassName
}

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Checks the user's answer against the correct answer (class or vessel name).
 */
export function checkAnswer(
  userAnswer: string,
  correctAnswer: string,
  isVesselName: boolean = false
): boolean {
  if (isVesselName) {
    return normalizeVesselName(userAnswer) === normalizeVesselName(correctAnswer)
  }
  return normalizeClassLabel(userAnswer) === normalizeClassLabel(correctAnswer)
}

/**
 * Strips trailing " class" (case-insensitive) for display; answers are shown without "class".
 */
export function normalizeClassLabel(name: string): string {
  return name.trim().replace(/\s+class$/i, '')
}

/**
 * Normalize vessel name for comparison (trim, case-insensitive).
 */
export function normalizeVesselName(name: string): string {
  return name.trim().toLowerCase()
}

/**
 * Display form of vessel name (capitalize each word).
 */
export function formatVesselName(name: string): string {
  const t = name.trim()
  if (t.length === 0) return t
  return t.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}
