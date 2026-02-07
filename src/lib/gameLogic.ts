/**
 * Game logic: image selection and answer generation.
 * All logic is based on the registry; no image analysis or inference.
 */

import type { CountryId, ImageEntry, VehicleBranch } from '../types/game'
import { IMAGE_REGISTRY } from '../data/imageRegistry'

/**
 * Filters the image pool to entries matching country and branch, active only.
 */
export function getFilteredPool(
  country: CountryId,
  branch: VehicleBranch
): ImageEntry[] {
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
 * Returns four option strings: the correct class name plus three other
 * plausible options from the same country and branch. Options are shuffled.
 */
export function generateOptions(
  selectedEntry: ImageEntry,
  pool: ImageEntry[]
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

  // If we have fewer than 3 other classes, we still show what we have
  const options = [correct, ...wrongOptions]
  return shuffleArray(options)
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
 * Checks the user's answer against the class name assigned to the image.
 * No inference or visual analysis.
 */
export function checkAnswer(
  userAnswer: string,
  correctClassName: string
): boolean {
  return normalizeClassLabel(userAnswer) === normalizeClassLabel(correctClassName)
}

/**
 * Strips trailing " class" (case-insensitive) for display; answers are shown without "class".
 */
export function normalizeClassLabel(name: string): string {
  return name.trim().replace(/\s+class$/i, '')
}
