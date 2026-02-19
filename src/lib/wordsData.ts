/**
 * Loads and parses word lists from CSV.
 * Files in public/data/: one CSV per list (e.g. aseet-ja-ammukset.csv).
 * Format: UTF-8, column A = Russian (Cyrillic), column B = Finnish.
 * First row may be header (e.g. "Russian,Finnish"); it is auto-skipped if it looks like a header.
 */

import type { WordPair, WordCardPrompt, WordEntry } from '../types/game'

/** Perussanasto = 7 themed lists; Lyhenteet = abbreviation lists. */
export type WordsListId =
  | 'aseet-ja-ammukset'
  | 'kalusto-ja-alustat'
  | 'organisaatiorakenne'
  | 'koulutus-ja-tehtavat'
  | 'taistelu-ja-taktiikka'
  | 'maasto-ja-linnoitteet'
  | 'sotilasarvot'
  | 'kerrattava-sanasto'
  | 'lyhenteet-turvallisuus'
  | 'lyhenteet-puolustushallinto'
  | 'lyhenteet-asevoimat'
  | 'lyhenteet-toiminnalliset'
  | 'lyhenteet-kalustolliset'
  | 'lyhenteet-johtaminen'
  | 'lyhenteet-kerrattava'

/** List ids that have a CSV file (excludes kerrattava-sanasto and lyhenteet-kerrattava, which use localStorage). */
type WordsListIdWithFile = Exclude<WordsListId, 'kerrattava-sanasto' | 'lyhenteet-kerrattava'>

const WORDS_FILES: Record<WordsListIdWithFile, string> = {
  'aseet-ja-ammukset': 'aseet-ja-ammukset.csv',
  'kalusto-ja-alustat': 'kalusto-ja-alustat.csv',
  organisaatiorakenne: 'organisaatiorakenne.csv',
  'koulutus-ja-tehtavat': 'koulutus-ja-tehtavat.csv',
  'taistelu-ja-taktiikka': 'taistelu-ja-taktiikka.csv',
  'maasto-ja-linnoitteet': 'maasto-ja-linnoitteet.csv',
  sotilasarvot: 'sotilasarvot.csv',
  'lyhenteet-turvallisuus': 'lyhenteet-turvallisuus.csv',
  'lyhenteet-puolustushallinto': 'lyhenteet-puolustushallinto.csv',
  'lyhenteet-asevoimat': 'lyhenteet-asevoimat.csv',
  'lyhenteet-toiminnalliset': 'lyhenteet-toiminnalliset.csv',
  'lyhenteet-kalustolliset': 'lyhenteet-kalustolliset.csv',
  'lyhenteet-johtaminen': 'lyhenteet-johtaminen.csv',
}

/** The 7 Sotilasvenäjän perussanasto modules (each has its own CSV). */
export const PERUSSANASTO_LIST_IDS: WordsListId[] = [
  'aseet-ja-ammukset',
  'kalusto-ja-alustat',
  'organisaatiorakenne',
  'koulutus-ja-tehtavat',
  'taistelu-ja-taktiikka',
  'maasto-ja-linnoitteet',
  'sotilasarvot',
]

export const PERUSSANASTO_LABELS: Record<WordsListId, string> = {
  'aseet-ja-ammukset': 'Aseet ja ammukset',
  'kalusto-ja-alustat': 'Kalusto ja alustat',
  organisaatiorakenne: 'Organisaatiorakenne',
  'koulutus-ja-tehtavat': 'Koulutus ja tehtävät',
  'taistelu-ja-taktiikka': 'Taistelu ja taktiikka',
  'maasto-ja-linnoitteet': 'Maasto ja linnoitteet',
  sotilasarvot: 'Sotilasarvot',
  'kerrattava-sanasto': 'Kertaus',
  'lyhenteet-turvallisuus': 'Valtion turvallisuus- ja tiedusteluelimet',
  'lyhenteet-puolustushallinto': 'Puolustushallinto ja asevoimien johto',
  'lyhenteet-asevoimat': 'Asevoimien päähaarat ja erikoisjoukot',
  'lyhenteet-toiminnalliset': 'Toiminnalliset suorituskyvyt',
  'lyhenteet-kalustolliset': 'Kalustolliset suorituskyvyt',
  'lyhenteet-johtaminen': 'Johtaminen, hallinto ja arjen lyhenteet',
  'lyhenteet-kerrattava': 'Kertaus',
}

/** Sotilassanasto menu: 7 CSV modules + 1.1.8 Käyttäjän kerrattava sanasto. */
export const SOTILASSANASTO_MENU_IDS: WordsListId[] = [
  ...PERUSSANASTO_LIST_IDS,
  'kerrattava-sanasto',
]

/** The 6 Lyhenteet sub-modules (1.2.1–1.2.6) + 1.2.7 Käyttäjän kerrattava lyhenteet. */
export const LYHENTEET_LIST_IDS: WordsListId[] = [
  'lyhenteet-turvallisuus',
  'lyhenteet-puolustushallinto',
  'lyhenteet-asevoimat',
  'lyhenteet-toiminnalliset',
  'lyhenteet-kalustolliset',
  'lyhenteet-johtaminen',
  'lyhenteet-kerrattava',
]

export function isPerussanastoListId(id: WordsListId): id is (typeof PERUSSANASTO_LIST_IDS)[number] {
  return PERUSSANASTO_LIST_IDS.includes(id as (typeof PERUSSANASTO_LIST_IDS)[number])
}

export function isLyhenteetListId(id: WordsListId): id is (typeof LYHENTEET_LIST_IDS)[number] {
  return LYHENTEET_LIST_IDS.includes(id as (typeof LYHENTEET_LIST_IDS)[number])
}

function getWordsCsvUrl(listId: WordsListIdWithFile): string {
  return `${import.meta.env.BASE_URL}data/${WORDS_FILES[listId]}`
}

/**
 * Parses a CSV string into rows and cells.
 * Supports comma or semicolon as separator (Excel often uses semicolon in some locales).
 */
function parseCSV(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/)
  const rows: string[][] = []
  for (const line of lines) {
    const cells: string[] = []
    const sep = line.includes(';') ? ';' : ','
    let rest = line
    while (rest.length > 0) {
      if (rest.startsWith('"')) {
        const end = rest.indexOf('"', 1)
        if (end === -1) {
          cells.push(rest.slice(1).replace(/""/g, '"'))
          break
        }
        cells.push(rest.slice(1, end).replace(/""/g, '"'))
        rest = rest.slice(end + 1).replace(/^\s*[\s,]/, '')
        continue
      }
      const idx = rest.indexOf(sep)
      if (idx === -1) {
        cells.push(rest.trim())
        break
      }
      cells.push(rest.slice(0, idx).trim())
      rest = rest.slice(idx + 1)
    }
    rows.push(cells)
  }
  return rows
}

function isHeaderRow(cells: string[]): boolean {
  if (cells.length < 2) return false
  const a = cells[0].toLowerCase()
  const b = cells[1].toLowerCase()
  return (
    (a === 'russian' && b === 'finnish') ||
    (a === 'ru' && b === 'fi') ||
    (a === 'a' && b === 'b')
  )
}

/** Header for extended format (abbreviation + 4 options: 1 correct + 3 wrong per direction). */
function isExtendedHeaderRow(cells: string[]): boolean {
  if (cells.length < 8) return false
  const a = (cells[0] ?? '').toLowerCase()
  const b = (cells[1] ?? '').toLowerCase()
  return (a === 'russian' || a === 'ru') && (b === 'finnish' || b === 'fi')
}

/** Header for prompt + 4 options: prompt,ve1,ve2,ve3,ve4 (ve1 = correct Russian answer). */
function isPromptFormatHeader(cells: string[]): boolean {
  if (cells.length < 5) return false
  const a = (cells[0] ?? '').toLowerCase().trim()
  return a === 'prompt'
}

/**
 * Fetches and parses a words CSV.
 * - 2-column format: Russian,Finnish → wrong options are generated from other rows.
 * - 8-column format (abbreviation + 4 options): Russian,Finnish,Finnish_alt1,Finnish_alt2,Finnish_alt3,Russian_alt1,Russian_alt2,Russian_alt3
 *   → one correct + three fixed wrong options per direction (user’s own “similar words”).
 */
export async function loadWordsCSV(listId: WordsListIdWithFile): Promise<WordEntry[]> {
  const url = getWordsCsvUrl(listId)
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    const filename = WORDS_FILES[listId]
    throw new Error(`Could not load words file: ${res.status} ${res.statusText}. Place the file at public/data/${filename}`)
  }
  let text = await res.text()
  if (text.length > 0 && text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  const rows = parseCSV(text)
  if (rows.length === 0) return []

  const first = rows[0]
  if (first && isPromptFormatHeader(first)) {
    const entries: WordCardPrompt[] = []
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const prompt = (row[0] ?? '').trim()
      const correct = (row[1] ?? '').trim()
      const w1 = (row[2] ?? '').trim()
      const w2 = (row[3] ?? '').trim()
      const w3 = (row[4] ?? '').trim()
      if (prompt && correct && w1 && w2 && w3) {
        entries.push({ prompt, correct, wrongOptions: [w1, w2, w3] })
      }
    }
    return entries
  }

  let start = 0
  if (rows.length > 0 && (isHeaderRow(rows[0]) || isExtendedHeaderRow(rows[0]))) start = 1

  const pairs: WordPair[] = []
  for (let i = start; i < rows.length; i++) {
    const row = rows[i]
    const russian = (row[0] ?? '').trim()
    const finnish = (row[1] ?? '').trim()
    if (!russian || !finnish) continue

    if (row.length >= 8) {
      const fa1 = (row[2] ?? '').trim()
      const fa2 = (row[3] ?? '').trim()
      const fa3 = (row[4] ?? '').trim()
      const ra1 = (row[5] ?? '').trim()
      const ra2 = (row[6] ?? '').trim()
      const ra3 = (row[7] ?? '').trim()
      if (fa1 && fa2 && fa3 && ra1 && ra2 && ra3) {
        pairs.push({
          russian,
          finnish,
          finnishAlts: [fa1, fa2, fa3],
          russianAlts: [ra1, ra2, ra3],
        })
        continue
      }
    }
    pairs.push({ russian, finnish })
  }
  return pairs
}
