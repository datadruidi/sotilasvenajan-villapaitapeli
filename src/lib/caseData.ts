import { CASE_IDS } from '../types/cases'
import type { CaseNoun } from '../types/cases'

let cached: Promise<CaseNoun[]> | undefined

function isCaseNoun(value: unknown): value is CaseNoun {
  if (!value || typeof value !== 'object') return false
  const noun = value as CaseNoun
  return typeof noun.id === 'string' && typeof noun.lemma === 'string' &&
    ['masculine', 'feminine', 'neuter'].includes(noun.gender) && typeof noun.animate === 'boolean' &&
    typeof noun.translations?.fi === 'string' && typeof noun.translations?.en === 'string' &&
    Array.isArray(noun.sources) && noun.sources.length > 0 &&
    (['singular', 'plural'] as const).every(number => CASE_IDS.every(id => {
      const forms = noun.forms?.[number]?.[id]
      return Array.isArray(forms) && forms.length > 0 && forms.every(form => typeof form === 'string' && /^[а-яё-]+$/u.test(form))
    }))
}

export async function loadCaseNouns(): Promise<CaseNoun[]> {
  cached ??= fetch(`${import.meta.env.BASE_URL}data/cases/nouns.json`, { cache: 'no-cache' })
    .then(async response => {
      if (!response.ok) throw new Error(`Case data: ${response.status}`)
      const value: unknown = await response.json()
      const nouns = value && typeof value === 'object' && 'nouns' in value ? value.nouns : null
      if (!Array.isArray(nouns) || nouns.length < 10 || !nouns.every(isCaseNoun) || new Set(nouns.map(noun => noun.id)).size !== nouns.length) {
        throw new Error('Invalid case practice data')
      }
      return nouns
    }).catch((error: unknown) => { cached = undefined; throw error })
  return cached
}
