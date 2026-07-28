import type { TypingAttemptStats } from '../types/typing'

export function correctPrefixLength(input: string, target: string): number {
  const limit = Math.min(input.length, target.length)
  let index = 0
  while (index < limit && input[index] === target[index]) index += 1
  return index
}

export function typingProgress(input: string, target: string): number {
  return target.length === 0 ? 0 : correctPrefixLength(input, target) / target.length
}

export function calculateCpm(length: number, elapsedMilliseconds: number): number {
  if (elapsedMilliseconds <= 0) return 0
  return Math.round(length / (elapsedMilliseconds / 60_000))
}

export function calculateAccuracy(stats: TypingAttemptStats): number {
  if (stats.totalCharacterAttempts === 0) return 100
  return Math.round((stats.correctCharacterAttempts / stats.totalCharacterAttempts) * 1000) / 10
}

export function countCharacterAttempts(previous: string, next: string, target: string): TypingAttemptStats {
  let shared = 0
  while (shared < previous.length && shared < next.length && previous[shared] === next[shared]) shared += 1
  const inserted = next.slice(shared)
  let correct = 0
  for (let index = 0; index < inserted.length; index += 1) {
    if (inserted[index] === target[shared + index]) correct += 1
  }
  return {
    totalCharacterAttempts: inserted.length,
    correctCharacterAttempts: correct,
    incorrectCharacterAttempts: inserted.length - correct,
  }
}

export function formatTypingTime(milliseconds: number): string {
  const tenths = Math.floor(Math.max(0, milliseconds) / 100)
  const minutes = Math.floor(tenths / 600)
  const seconds = Math.floor((tenths % 600) / 10)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths % 10}`
}
