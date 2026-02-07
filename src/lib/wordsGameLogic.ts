/**
 * Words quiz logic: select one pair, generate 4 options (1 correct + 3 wrong from list).
 */

import type { WordPair } from '../types/game'

export type WordsDirection = 'fi-ru' | 'ru-fi'

/**
 * Picks one pair at random from the list.
 */
export function selectPairFromPool(pool: WordPair[]): WordPair | null {
  if (pool.length === 0) return null
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}

/**
 * For the given direction, returns the prompt text and correct answer for a pair.
 */
export function getPromptAndAnswer(
  pair: WordPair,
  direction: WordsDirection
): { prompt: string; correctAnswer: string } {
  if (direction === 'fi-ru') {
    return { prompt: pair.finnish, correctAnswer: pair.russian }
  }
  return { prompt: pair.russian, correctAnswer: pair.finnish }
}

/**
 * Returns 4 option strings: the correct answer plus 3 other answers from the same pool.
 * All must be distinct. Shuffled.
 */
export function generateWordOptions(
  correctAnswer: string,
  pool: WordPair[],
  direction: WordsDirection
): string[] {
  const getAnswer = (p: WordPair) =>
    direction === 'fi-ru' ? p.russian : p.finnish
  const others = pool
    .map(getAnswer)
    .filter((a) => a !== correctAnswer)
  const unique = [...new Set(others)]
  const shuffled = [...unique].sort(() => Math.random() - 0.5)
  const wrong = shuffled.slice(0, 3)
  const options = [correctAnswer, ...wrong]
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

export function checkWordAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.trim() === correctAnswer
}
