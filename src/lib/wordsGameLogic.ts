/**
 * Words quiz logic: select one pair, generate 4 options (1 correct + 3 wrong from list).
 */

import type { WordPair, WordEntry } from '../types/game'
import { isWordCardPrompt } from '../types/game'

export type WordsDirection = 'fi-ru' | 'ru-fi'

export { isWordCardPrompt }

/**
 * Returns a new array with the pool shuffled (for going through the full list once per game).
 */
export function shuffleWordPool(pool: WordEntry[]): WordEntry[] {
  const out = [...pool]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
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
 * Returns 4 option strings: the correct answer plus 3 wrong options.
 * If fixedWrong is provided (from CSV’s alt columns), use those; otherwise pick 3 from the pool.
 * All options are distinct. Shuffled.
 */
export function generateWordOptions(
  correctAnswer: string,
  pool: WordEntry[],
  direction: WordsDirection,
  fixedWrong?: [string, string, string]
): string[] {
  if (fixedWrong && fixedWrong.length === 3) {
    const options = [correctAnswer, ...fixedWrong]
    return shuffleArray(options)
  }
  const getAnswer = (p: WordEntry) =>
    'russian' in p ? (direction === 'fi-ru' ? p.russian : p.finnish) : p.correct
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
