/**
 * Sotilasarvot game logic. One image per question, correct answer = rank name in selected language (fi or ru).
 * Options = correct + 3 other ranks from the same branch in the same language.
 */

import { RANKS_DATA } from '../data/ranksData'
import { RANKS_MAAVOIMAT_PATHS, RANKS_MERIVOIMAT_PATHS } from '../data/ranksImagePaths'
import type { RanksBranchId } from '../data/ranksData'

export type RanksLanguage = 'fi' | 'en' | 'ru'

export interface RankGameEntry {
  id: string
  assetPath: string
  branch: RanksBranchId
  termFi: string
  termEn: string
  termRu: string
}

function filenameWithoutExtension(assetPath: string): string {
  const filename = assetPath.split('/').pop() ?? ''
  return filename.replace(/\.[^.]+$/, '').trim()
}

/**
 * From filename (no extension): if it ends with _<digits> (e.g. _1, _02), that part is ignored
 * and the rest is the rank name. Allows multiple images per rank: Sotamies_1.jpg, Sotamies_2.jpg.
 */
function rankNameFromFilename(name: string): string {
  const trimmed = name.trim()
  const match = trimmed.match(/^(.+)_(\d+)$/)
  if (match) return match[1].trim()
  return trimmed
}

/** Normalize for lookup: trim, NFC, lowercase so matching is robust. */
function normKey(s: string): string {
  return s.trim().normalize('NFC').toLowerCase()
}

/** Find RankEntry in RANKS_DATA by Finnish name (from filename). */
function findRankEntry(branch: RanksBranchId, termFi: string): (typeof RANKS_DATA.maavoimat)[0] | null {
  const key = normKey(termFi)
  const keyUnderscore = termFi.trim().replace(/\s+/g, '_')
  const keySpace = termFi.trim().replace(/_/g, ' ')
  for (const entry of RANKS_DATA[branch]) {
    const fi = normKey(entry.fi)
    if (fi === key || fi === normKey(keyUnderscore) || fi === normKey(keySpace)) return entry
  }
  return null
}

/**
 * Display name for a rank in the chosen language. Always resolved from RANKS_DATA.
 */
export function getRankDisplayName(branch: RanksBranchId, termFi: string, language: RanksLanguage): string {
  const entry = findRankEntry(branch, termFi)
  if (!entry) return termFi
  if (language === 'fi') return entry.fi
  if (language === 'en') return (entry.en ?? entry.fi).trim()
  return entry.ru.trim()
}

function buildPoolFromPaths(
  paths: string[],
  branch: RanksBranchId,
  idPrefix: string
): RankGameEntry[] {
  const entries: RankGameEntry[] = []
  for (let i = 0; i < paths.length; i++) {
    const assetPath = paths[i]
    const rawName = filenameWithoutExtension(assetPath)
    if (!rawName) continue
    const termFi = rankNameFromFilename(rawName)
    const rankEntry = findRankEntry(branch, termFi)
    const termEn = rankEntry ? (rankEntry.en ?? rankEntry.fi).trim() : termFi
    const termRu = rankEntry ? rankEntry.ru.trim() : termFi
    entries.push({
      id: `${idPrefix}-${i}-${assetPath.replace(/\//g, '-')}`,
      assetPath,
      branch,
      termFi,
      termEn,
      termRu,
    })
  }
  return entries
}

export function getRanksPool(branch: RanksBranchId, _language: RanksLanguage): RankGameEntry[] {
  const paths = branch === 'maavoimat' ? RANKS_MAAVOIMAT_PATHS : RANKS_MERIVOIMAT_PATHS
  return buildPoolFromPaths(paths, branch, branch)
}

/** Build pool for user's kerrattava list from stored { branch, language, termFi } entries. Uses only entries for the given language. */
export function getRanksReviewPool(
  entries: { branch: RanksBranchId; language: RanksLanguage; termFi: string }[],
  language: RanksLanguage
): RankGameEntry[] {
  const forLang = entries.filter((e) => e.language === language)
  if (forLang.length === 0) return []
  const fullMaavoimat = getRanksPool('maavoimat', language)
  const fullMerivoimat = getRanksPool('merivoimat', language)
  const termFiSetMaavoimat = new Set(forLang.filter((e) => e.branch === 'maavoimat').map((e) => e.termFi))
  const termFiSetMerivoimat = new Set(forLang.filter((e) => e.branch === 'merivoimat').map((e) => e.termFi))
  const fromMaavoimat = fullMaavoimat.filter((e) => termFiSetMaavoimat.has(e.termFi))
  const fromMerivoimat = fullMerivoimat.filter((e) => termFiSetMerivoimat.has(e.termFi))
  return [...fromMaavoimat, ...fromMerivoimat]
}

export function selectRankFromPool(pool: RankGameEntry[]): RankGameEntry | null {
  if (pool.length === 0) return null
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}

function getDisplayTerms(pool: RankGameEntry[], language: RanksLanguage): string[] {
  return [...new Set(pool.map((e) => getRankDisplayName(e.branch, e.termFi, language)))]
}

export function generateRanksOptions(
  selected: RankGameEntry,
  pool: RankGameEntry[],
  language: RanksLanguage
): string[] {
  const correct = getRankDisplayName(selected.branch, selected.termFi, language)
  const allTerms = getDisplayTerms(pool, language)
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

export function getCorrectAnswer(entry: RankGameEntry, language: RanksLanguage): string {
  return getRankDisplayName(entry.branch, entry.termFi, language)
}

export function checkRanksAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
}

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
