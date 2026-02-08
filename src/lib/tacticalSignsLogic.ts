/**
 * Taktiset merkit game logic. Correct answer = image filename without extension.
 * Options = correct term + 3 other terms from the same image set.
 * Subsets: sotilasmerkisto = folder "Sotilasmerkistö"; joukkojen-koko = folder "Joukkojen koko".
 */

import {
  TACTICAL_SIGNS_JOUKKOJEN_KOKO_PATHS,
  TACTICAL_SIGNS_SOTILASMERKISTO_PATHS,
} from '../data/tacticalSignsPaths'

export interface TacticalSignEntry {
  id: string
  assetPath: string
  /** Correct answer term = filename without extension */
  term: string
}

/** Subset of Taktiset merkit: Sotilasmerkistö folder vs Joukkojen koko folder */
export type TacticalSignsSubset = 'sotilasmerkisto' | 'joukkojen-koko'

/** Derive term from asset path: filename without extension */
function termFromPath(assetPath: string): string {
  const filename = assetPath.split('/').pop() ?? ''
  return filename.replace(/\.[^.]+$/, '').trim()
}

function buildPoolFromPaths(paths: string[], idPrefix: string): TacticalSignEntry[] {
  return paths.map((assetPath, i) => ({
    id: `${idPrefix}-${i}-${assetPath.replace(/\//g, '-')}`,
    assetPath,
    term: termFromPath(assetPath),
  })).filter((e) => e.term.length > 0)
}

/** Pool for the chosen subset: images from that folder only */
export function getTacticalSignsPool(subset: TacticalSignsSubset): TacticalSignEntry[] {
  const paths = subset === 'sotilasmerkisto'
    ? TACTICAL_SIGNS_SOTILASMERKISTO_PATHS
    : TACTICAL_SIGNS_JOUKKOJEN_KOKO_PATHS
  return buildPoolFromPaths(paths, subset)
}

/** Pick one entry at random from the pool */
export function selectTacticalSignFromPool(pool: TacticalSignEntry[]): TacticalSignEntry | null {
  if (pool.length === 0) return null
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}

/** All distinct terms from the pool (for distractors) */
function getTermsFromPool(pool: TacticalSignEntry[]): string[] {
  return [...new Set(pool.map((e) => e.term))]
}

/** Four options: correct term + three other terms from pool, shuffled */
export function generateTacticalSignOptions(selected: TacticalSignEntry, pool: TacticalSignEntry[]): string[] {
  const correct = selected.term
  const allTerms = getTermsFromPool(pool)
  const others = allTerms.filter((t) => t !== correct)
  const wrongOptions: string[] = []
  const shuffled = [...others].sort(() => Math.random() - 0.5)
  for (const t of shuffled) {
    if (wrongOptions.length >= 3) break
    wrongOptions.push(t)
  }
  const options = [correct, ...wrongOptions]
  return shuffleArray(options)
}

/** Compare user answer to correct term (trim, case-insensitive) */
export function checkTacticalSignAnswer(userAnswer: string, correctTerm: string): boolean {
  return userAnswer.trim().toLowerCase() === correctTerm.trim().toLowerCase()
}

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
