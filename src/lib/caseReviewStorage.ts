import { CASE_IDS } from '../types/cases'
import type { CaseQuestion, CaseReviewEntry } from '../types/cases'
import { caseTaskKey } from './caseGameLogic'

const KEY = 'sotilasvenaja_cases_kerrattava_v1'
const LIMIT = 500

export function getCaseReviewList(): CaseReviewEntry[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    if (!Array.isArray(value)) return []
    const entries = value.filter((item): item is CaseReviewEntry => item && typeof item === 'object' &&
      typeof item.nounId === 'string' && typeof item.lemma === 'string' &&
      typeof item.correctForm === 'string' && CASE_IDS.includes(item.caseId) &&
      ['singular', 'plural'].includes(item.number))
    return [...new Map(entries.map(entry => [caseTaskKey(entry), entry])).values()].slice(0, LIMIT)
  } catch { return [] }
}

export function toggleCaseReview(question: CaseQuestion): CaseReviewEntry[] {
  const entries = getCaseReviewList()
  const key = caseTaskKey(question)
  const exists = entries.some(entry => caseTaskKey(entry) === key)
  const next = exists ? entries.filter(entry => caseTaskKey(entry) !== key) : [...entries, {
    nounId: question.nounId, lemma: question.noun.lemma, caseId: question.caseId,
    number: question.number, correctForm: question.acceptedForms[0],
  }].slice(0, LIMIT)
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { return entries }
  return next
}
