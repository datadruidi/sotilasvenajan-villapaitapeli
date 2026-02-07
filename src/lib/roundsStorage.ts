/**
 * Persist and read round counts per game mode (1 round = 10 questions).
 * Max 1000 rounds per mode; keys are e.g. vehicles_russia_navy, words_fi-ru_0, garrisons.
 */

const ROUNDS_PREFIX = 'miliingo-rounds-'
const MAX_ROUNDS = 1000

export function getRoundsKey(type: 'vehicles' | 'words' | 'garrisons', subKey: string): string {
  return `${ROUNDS_PREFIX}${type}_${subKey}`
}

export function getRounds(key: string): number {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return 0
    const n = parseInt(raw, 10)
    return Number.isNaN(n) ? 0 : Math.max(0, Math.min(MAX_ROUNDS, n))
  } catch {
    return 0
  }
}

export function incrementRounds(key: string): void {
  try {
    const current = getRounds(key)
    const next = Math.min(MAX_ROUNDS, current + 1)
    localStorage.setItem(key, String(next))
  } catch {
    // ignore
  }
}

export function formatRoundsDisplay(count: number): string {
  if (count >= MAX_ROUNDS) return 'Completed'
  return `${count}/${MAX_ROUNDS}`
}

export { MAX_ROUNDS as ROUNDS_MAX }
