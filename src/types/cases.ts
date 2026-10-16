export const CASE_IDS = ['nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'prepositional'] as const
export type RussianCase = typeof CASE_IDS[number]
export type GrammaticalNumber = 'singular' | 'plural'
export type CaseForms = Record<RussianCase, string[]>

export interface CaseNoun {
  id: string
  lemma: string
  gender: 'masculine' | 'feminine' | 'neuter'
  animate: boolean
  translations: { fi: string; en: string }
  sources: { file: string; row: number; russian: string; finnish: string; english: string }[]
  forms: Record<GrammaticalNumber, CaseForms>
}

export interface CaseTask {
  nounId: string
  caseId: RussianCase
  number: GrammaticalNumber
}

export interface CaseQuestion extends CaseTask {
  noun: CaseNoun
  sentenceTemplate: string
  options: string[]
  acceptedForms: string[]
}

export interface CaseReviewEntry extends CaseTask {
  lemma: string
  correctForm: string
}

export const CASE_NAMES: Record<RussianCase, { fi: string; en: string }> = {
  nominative: { fi: 'Nominatiivi', en: 'Nominative' },
  genitive: { fi: 'Genetiivi', en: 'Genitive' },
  dative: { fi: 'Datiivi', en: 'Dative' },
  accusative: { fi: 'Akkusatiivi', en: 'Accusative' },
  instrumental: { fi: 'Instrumentaali', en: 'Instrumental' },
  prepositional: { fi: 'Prepositionaali', en: 'Prepositional' },
}
