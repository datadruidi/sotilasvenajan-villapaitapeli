import type { CaseQuestion } from '../types/cases'
import { getCaseTemplates } from '../data/caseSentenceTemplates'
import { CASE_SENTENCE_ENGLISH_PLURALS, CASE_SENTENCE_FINNISH } from '../data/caseSentenceWords'
import { caseContext } from './caseGameLogic'

function sentenceTemplate(question: CaseQuestion) {
  const template = getCaseTemplates(question.noun, question.number, question.caseId).find(item => item.id === question.sentenceTemplate)
  if (!template) throw new Error(`Invalid case sentence template: ${question.sentenceTemplate}`)
  return template
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/gu, (_, key: string) => {
    if (!(key in values)) throw new Error(`Missing sentence value: ${key}`)
    return values[key]
  })
}

export function caseSentenceText(question: CaseQuestion, form: string, blank = false): string {
  // Resolve prepositions from the accepted spelling, even while showing a blank.
  const word = blank ? '___' : form
  const context = (caseId: 'dative' | 'instrumental' | 'prepositional') => {
    const full = caseContext(caseId, form)
    return `${full.slice(0, full.length - form.length)}${word}`
  }
  return fill(sentenceTemplate(question).ru, {
    word,
    dativeContext: context('dative'),
    instrumentalContext: context('instrumental'),
    prepositionalContext: context('prepositional'),
    in: /^в[сз]/u.test(form) ? 'во' : 'в',
  })
}

export function getCaseSentence(question: CaseQuestion, language: 'fi' | 'en'): { prompt: string; translation: string } {
  const { noun, number } = question
  const plural = number === 'plural'
  const template = sentenceTemplate(question)
  const prompt = caseSentenceText(question, question.acceptedForms[0], true)
  const label = noun.translations[language].replace(/\s*\([^)]*\)/gu, '').trim()
  let translation: string
  if (language === 'fi') {
    const forms = CASE_SENTENCE_FINNISH[label]
    if (!forms) throw new Error(`Missing Finnish sentence forms: ${label}`)
    const elative = forms[plural ? 4 : 3]
    // These Finnish local cases share the elative stem, including adjective
    // agreement. Singular genitive uses the same stem; never use it for plurals.
    translation = fill(template.fi, {
      nom: plural ? forms[0] : label.toLocaleLowerCase('fi'),
      part: forms[plural ? 2 : 1],
      elat: elative,
      all: elative.replace(/st[aä](?= |$)/gu, 'lle'),
      iness: elative.replace(/st([aä])(?= |$)/gu, 'ss$1'),
      gen: forms[3].replace(/st[aä](?= |$)/gu, 'n'),
    })
    if (plural && template.id === 'identify') translation = `Nämä ovat ${forms[0]}.`
  } else {
    const word = plural ? CASE_SENTENCE_ENGLISH_PLURALS[label] : label === 'Communications' ? 'communication link' : label.toLocaleLowerCase('en')
    if (!word) throw new Error(`Missing English sentence forms: ${label}`)
    translation = fill(template.en, { noun: word, is: plural ? 'are' : 'is' })
    if (plural && template.id === 'identify') translation = `These are the ${word}.`
  }
  return { prompt, translation }
}
