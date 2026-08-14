import type { TypingDifficulty, TypingSentence } from '../types/typing'

const DIFFICULTIES: TypingDifficulty[] = ['easy', 'harder', 'svo']
const LENGTHS: Record<TypingDifficulty, [number, number]> = {
  easy: [30, 220], harder: [30, 220], svo: [1, 500],
}
const LATIN_LOOKALIKE = /[ABCEHKMOPTXYacekmoptyx]/
const hasUnsupportedControl = (text: string) => Array.from(text).some((character) => {
  const code = character.charCodeAt(0)
  return code === 127 || (code < 32 && code !== 9)
})

function validateEntry(value: unknown, seen: Set<string>): TypingSentence | null {
  if (!value || typeof value !== 'object') return null
  const entry = value as Partial<TypingSentence>
  const id = typeof entry.id === 'string' ? entry.id : '(missing id)'
  const errors: string[] = []
  if (!entry.id || seen.has(entry.id)) errors.push(entry.id ? 'duplicate ID' : 'missing ID')
  if (!DIFFICULTIES.includes(entry.difficulty as TypingDifficulty)) errors.push('unknown difficulty')
  if (typeof entry.russian !== 'string' || !entry.russian) errors.push('missing Russian text')
  if (!entry.translations || typeof entry.translations.fi !== 'string' || !entry.translations.fi) errors.push('missing Finnish translation')
  if (!entry.translations || typeof entry.translations.en !== 'string' || !entry.translations.en) errors.push('missing English translation')
  if (!Array.isArray(entry.vocabulary)) errors.push('missing vocabulary list')
  if (typeof entry.enabled !== 'boolean') errors.push('missing enabled flag')
  if (typeof entry.russian === 'string' && DIFFICULTIES.includes(entry.difficulty as TypingDifficulty)) {
    const [min, max] = LENGTHS[entry.difficulty as TypingDifficulty]
    if (entry.russian.length < min || entry.russian.length > max) errors.push(`Russian text has ${entry.russian.length} characters; permitted length is ${min}–${max}`)
    if (entry.russian !== entry.russian.trim()) errors.push('leading or trailing spaces')
    if (/ {2}/.test(entry.russian)) errors.push('repeated spaces')
    if (/\r|\n/.test(entry.russian)) errors.push('line breaks')
    if (/\p{M}/u.test(entry.russian)) errors.push('combining marks')
    if (LATIN_LOOKALIKE.test(entry.russian)) errors.push('Latin look-alike characters')
    if (hasUnsupportedControl(entry.russian)) errors.push('control characters')
    const sentences = entry.russian.match(/[.!?](?:[»”"]|$)/g)?.length ?? 0
    if (sentences > 2) errors.push('more than two sentences')
  }
  if (errors.length) {
    console.error(`Invalid typing entry "${id}": ${errors.join('; ')}.`)
    return null
  }
  seen.add(entry.id!)
  return entry as TypingSentence
}

export async function loadTypingSentences(): Promise<TypingSentence[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/typing/sentences.json`)
  if (!response.ok) throw new Error(`Could not load typing exercises (${response.status})`)
  const data: unknown = await response.json()
  if (!Array.isArray(data)) throw new Error('Typing exercise data is not an array')
  const seen = new Set<string>()
  return data.map((entry) => validateEntry(entry, seen)).filter((entry): entry is TypingSentence => entry !== null && entry.enabled)
}

export function selectTypingSentence(sentences: TypingSentence[], difficulty: TypingDifficulty, previousId?: string): TypingSentence | null {
  const matches = sentences.filter((entry) => entry.difficulty === difficulty)
  const choices = matches.length > 1 ? matches.filter((entry) => entry.id !== previousId) : matches
  return choices[Math.floor(Math.random() * choices.length)] ?? null
}
