/**
 * User review lists: persisted in localStorage.
 * - Words (1.1.1–1.1.7) → 1.1.8 Käyttäjän kerrattava sanasto
 * - Lyhenteet (1.2.1–1.2.6) → 1.2.7 Käyttäjän kerrattava lyhenteet
 * - Sotilaspiirit (2.1) → Käyttäjän kerrattava
 * - Sotilasarvot (3) → Käyttäjän kerrattava
 */

import type { WordPair } from '../types/game'
import type { WordCardPrompt } from '../types/game'
import type { RanksBranchId } from '../data/ranksData'
import type { RanksLanguage } from './ranksLogic'

const STORAGE_KEY = 'sotilasvenaja_kerrattava_sanasto'
const LYHENTEET_KEY = 'sotilasvenaja_lyhenteet_kerrattava'
const GARRISONS_KEY = 'sotilasvenaja_garrisons_kerrattava'
const RANKS_KEY = 'sotilasvenaja_ranks_kerrattava'

/** Max items per review list to avoid localStorage exhaustion. */
const MAX_LIST_SIZE = 500

function isSamePair(a: WordPair, b: WordPair): boolean {
  return a.russian === b.russian && a.finnish === b.finnish
}

export function getReviewList(): WordPair[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is WordPair =>
        item != null &&
        typeof item === 'object' &&
        typeof (item as WordPair).russian === 'string' &&
        typeof (item as WordPair).finnish === 'string'
    )
  } catch {
    return []
  }
}

export function addToReviewList(pair: WordPair): void {
  const list = getReviewList()
  if (list.length >= MAX_LIST_SIZE) return
  if (list.some((p) => isSamePair(p, pair))) return
  list.push({ russian: pair.russian, finnish: pair.finnish })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function removeFromReviewList(pair: WordPair): void {
  const list = getReviewList().filter((p) => !isSamePair(p, pair))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

// ——— Lyhenteet (1.3) ———
function isSameLyhenteet(a: WordCardPrompt, b: WordCardPrompt): boolean {
  return a.prompt === b.prompt && a.correct === b.correct
}

export function getLyhenteetReviewList(): WordCardPrompt[] {
  try {
    const raw = localStorage.getItem(LYHENTEET_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is WordCardPrompt =>
        item != null &&
        typeof item === 'object' &&
        typeof (item as WordCardPrompt).prompt === 'string' &&
        typeof (item as WordCardPrompt).correct === 'string' &&
        Array.isArray((item as WordCardPrompt).wrongOptions) &&
        (item as WordCardPrompt).wrongOptions.length === 3
    )
  } catch {
    return []
  }
}

export function addToLyhenteetReviewList(entry: WordCardPrompt): void {
  const list = getLyhenteetReviewList()
  if (list.length >= MAX_LIST_SIZE) return
  if (list.some((e) => isSameLyhenteet(e, entry))) return
  list.push({
    prompt: entry.prompt,
    correct: entry.correct,
    wrongOptions: [...entry.wrongOptions],
  })
  localStorage.setItem(LYHENTEET_KEY, JSON.stringify(list))
}

export function removeFromLyhenteetReviewList(entry: WordCardPrompt): void {
  const list = getLyhenteetReviewList().filter((e) => !isSameLyhenteet(e, entry))
  localStorage.setItem(LYHENTEET_KEY, JSON.stringify(list))
}

// ——— Sotilaspiirit (2.1) ——— store garrison entry ids
export function getGarrisonsReviewIds(): string[] {
  try {
    const raw = localStorage.getItem(GARRISONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => typeof id === 'string')
  } catch {
    return []
  }
}

export function addToGarrisonsReviewList(garrisonId: string): void {
  const ids = getGarrisonsReviewIds()
  if (ids.length >= MAX_LIST_SIZE) return
  if (ids.includes(garrisonId)) return
  ids.push(garrisonId)
  localStorage.setItem(GARRISONS_KEY, JSON.stringify(ids))
}

export function removeFromGarrisonsReviewList(garrisonId: string): void {
  const ids = getGarrisonsReviewIds().filter((id) => id !== garrisonId)
  localStorage.setItem(GARRISONS_KEY, JSON.stringify(ids))
}

// ——— Sotilasarvot (3) ——— store { branch, language, termFi }
export interface RanksReviewEntry {
  branch: RanksBranchId
  language: RanksLanguage
  termFi: string
}

export function getRanksReviewEntries(): RanksReviewEntry[] {
  try {
    const raw = localStorage.getItem(RANKS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is RanksReviewEntry =>
        item != null &&
        typeof item === 'object' &&
        ((item as RanksReviewEntry).branch === 'maavoimat' || (item as RanksReviewEntry).branch === 'merivoimat') &&
        ((item as RanksReviewEntry).language === 'fi' || (item as RanksReviewEntry).language === 'en' || (item as RanksReviewEntry).language === 'ru') &&
        typeof (item as RanksReviewEntry).termFi === 'string'
    )
  } catch {
    return []
  }
}

export function addToRanksReviewList(entry: RanksReviewEntry): void {
  const list = getRanksReviewEntries()
  if (list.length >= MAX_LIST_SIZE) return
  if (list.some((e) => e.branch === entry.branch && e.language === entry.language && e.termFi === entry.termFi)) return
  list.push({ ...entry })
  localStorage.setItem(RANKS_KEY, JSON.stringify(list))
}

export function removeFromRanksReviewList(entry: RanksReviewEntry): void {
  const list = getRanksReviewEntries().filter(
    (e) => !(e.branch === entry.branch && e.language === entry.language && e.termFi === entry.termFi)
  )
  localStorage.setItem(RANKS_KEY, JSON.stringify(list))
}
