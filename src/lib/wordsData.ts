/**
 * Loads and parses the military words list from CSV.
 * File: public/data/military-words.csv
 * Format: UTF-8, column A = Russian (Cyrillic), column B = Finnish.
 * First row may be header (e.g. "Russian,Finnish" or "russian,finnish"); it is auto-skipped if it looks like a header.
 */

import type { WordPair } from '../types/game'

function getWordsCsvUrl(): string {
  return `${import.meta.env.BASE_URL}data/military-words.csv`
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
 * Fetches and parses the words CSV. Returns array of { russian, finnish }.
 * Column index 0 = Russian, 1 = Finnish.
 */
export async function loadWordsCSV(): Promise<WordPair[]> {
  const res = await fetch(getWordsCsvUrl())
  if (!res.ok) {
    throw new Error(`Could not load words file: ${res.status} ${res.statusText}. Place the file at public/data/military-words.csv`)
  }
  const text = await res.text()
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
