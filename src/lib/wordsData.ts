/**
 * Loads and parses word lists from CSV.
 * Files: public/data/military-words.csv, public/data/rintamavenajan-alkeet.csv
 * Format: UTF-8, column A = Russian (Cyrillic), column B = Finnish.
 * First row may be header (e.g. "Russian,Finnish" or "russian,finnish"); it is auto-skipped if it looks like a header.
 */

import type { WordPair } from '../types/game'

export type WordsListId = 'sanasto' | 'rintamavenajan-alkeet'

const WORDS_FILES: Record<WordsListId, string> = {
  sanasto: 'military-words.csv',
  'rintamavenajan-alkeet': 'rintamavenajan-alkeet.csv',
}

function getWordsCsvUrl(listId: WordsListId): string {
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
    // Try semicolon first (common in European Excel), then comma
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

/**
 * Returns true if the first row looks like a header (e.g. "russian,finnish" or "Russian,Finnish").
 */
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

/**
 * Fetches and parses a words CSV. Returns array of { russian, finnish }.
 * Column index 0 = Russian, 1 = Finnish.
 * @param listId - 'sanasto' = military-words.csv, 'rintamavenajan-alkeet' = rintamavenajan-alkeet.csv
 */
export async function loadWordsCSV(listId: WordsListId = 'sanasto'): Promise<WordPair[]> {
  const url = getWordsCsvUrl(listId)
  const res = await fetch(url)
  if (!res.ok) {
    const filename = WORDS_FILES[listId]
    throw new Error(`Could not load words file: ${res.status} ${res.statusText}. Place the file at public/data/${filename}`)
  }
  let text = await res.text()
  if (text.length > 0 && text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  const rows = parseCSV(text)
  if (rows.length === 0) return []

  let start = 0
  if (rows.length > 0 && isHeaderRow(rows[0])) start = 1

  const pairs: WordPair[] = []
  for (let i = start; i < rows.length; i++) {
    const row = rows[i]
    const russian = (row[0] ?? '').trim()
    const finnish = (row[1] ?? '').trim()
    if (russian && finnish) pairs.push({ russian, finnish })
  }
  return pairs
}
