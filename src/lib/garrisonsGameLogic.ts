/**
 * Varuskunnat quiz: select garrison image and generate 4 options.
 */

import type { GarrisonEntry, GarrisonRegionId } from '../data/garrisonsData'
import { getGarrisonsRegistryByRegion } from '../data/garrisonsData'

export function getGarrisonsPool(region: GarrisonRegionId = 'kaikki'): GarrisonEntry[] {
  return getGarrisonsRegistryByRegion(region)
}

export function selectGarrisonFromPool(pool: GarrisonEntry[]): GarrisonEntry | null {
  if (pool.length === 0) return null
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}

function getAllAnswerNames(pool: GarrisonEntry[]): string[] {
  const set = new Set(pool.map((e) => e.correctAnswer))
  return [...set]
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
 * Returns four option strings: correct answer + three distractors, shuffled.
 */
export function generateGarrisonOptions(selected: GarrisonEntry, pool: GarrisonEntry[]): string[] {
  const correct = selected.correctAnswer
  const allNames = getAllAnswerNames(pool)
  const others = allNames.filter((name) => name !== correct)
  const shuffledOthers = shuffleArray(others)
  const wrongOptions = shuffledOthers.slice(0, 3)
  const options = [correct, ...wrongOptions]
  return shuffleArray(options)
}

export function checkGarrisonAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.trim() === correctAnswer
}
