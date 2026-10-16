import { getCaseTemplates } from '../data/caseSentenceTemplates'
import { CASE_IDS } from '../types/cases'
import type { CaseNoun, CaseQuestion, CaseTask, GrammaticalNumber, RussianCase } from '../types/cases'

export function shuffleCases<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function caseTaskKey(task: CaseTask): string {
  return `${task.nounId}:${task.number}:${task.caseId}`
}

export function makeCaseQuestion(noun: CaseNoun, number: GrammaticalNumber, caseId: RussianCase, random = Math.random): CaseQuestion {
  const forms = noun.forms[number]
  const others = shuffleCases(CASE_IDS.filter(id => id !== caseId), random).slice(0, 3)
  // Keep syncretic spellings: every button containing a valid form is correct.
  const options = shuffleCases([forms[caseId][0], ...others.map(id => forms[id][0])], random)
  const templates = getCaseTemplates(noun, number, caseId)
  const sentenceTemplate = templates[Math.floor(random() * templates.length)].id
  return { nounId: noun.id, noun, number, caseId, sentenceTemplate, options, acceptedForms: [...forms[caseId]] }
}

export function createCaseRound(nouns: CaseNoun[], number: GrammaticalNumber, caseId: RussianCase, review?: CaseTask[], random = Math.random): CaseQuestion[] {
  if (nouns.length === 0) return []
  const byId = new Map(nouns.map(noun => [noun.id, noun]))
  const tasks = review
    ? [...new Map(review.filter(task => byId.has(task.nounId)).map(task => [caseTaskKey(task), task])).values()]
    : nouns.map(noun => ({ nounId: noun.id, number, caseId }))
  if (!tasks.length) return []
  // Normal rounds keep the selected case; review retains each saved case and number.
  const ordered = shuffleCases(tasks, random)
  const templateUses = new Map<string, number>()
  return Array.from({ length: 10 }, (_, index) => {
    const task = ordered[index % ordered.length]
    const noun = byId.get(task.nounId)!
    const question = makeCaseQuestion(noun, task.number, task.caseId, random)
    // Balance compatible contexts across the round, retaining random order on ties.
    const templates = shuffleCases(getCaseTemplates(noun, task.number, task.caseId), random)
    templates.sort((a, b) => (templateUses.get(a.id) ?? 0) - (templateUses.get(b.id) ?? 0))
    question.sentenceTemplate = templates[0].id
    templateUses.set(question.sentenceTemplate, (templateUses.get(question.sentenceTemplate) ?? 0) + 1)
    return question
  })
}

export function checkCaseAnswer(answer: string, question: Pick<CaseQuestion, 'acceptedForms'>): boolean {
  return question.acceptedForms.some(form => form.normalize('NFC') === answer.normalize('NFC'))
}

export function caseContext(caseId: RussianCase, form: string): string {
  switch (caseId) {
    case 'nominative': return `это ${form}`
    case 'genitive': return `нет ${form}`
    case 'dative': return `${/^в[сз]/u.test(form) ? 'ко' : 'к'} ${form}`
    case 'accusative': return `вижу ${form}`
    case 'instrumental': return `${/^(?:[сзшжщ][^аеёиоуыэюяьъ]|в[сз])/u.test(form) ? 'со' : 'с'} ${form}`
    case 'prepositional': return `${/^[аоуыэи]/u.test(form) ? 'об' : 'о'} ${form}`
  }
}

