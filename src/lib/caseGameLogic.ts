import { CASE_EXAMPLES, CASE_EXAMPLE_NOUNS } from '../data/caseExamples'
import { SINGULAR_EXERCISES, type SingularExercise } from '../data/singularExercises'
import { getCaseTemplates } from '../data/caseSentenceTemplates'
import { CASE_IDS } from '../types/cases'
import type { CaseForms, CaseNoun, CaseQuestion, CaseTask, GrammaticalNumber, RussianCase } from '../types/cases'

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

function makeCaseOptions(forms: CaseForms, acceptedForms: string[], random: () => number): string[] {
  const distractors = [...new Set(CASE_IDS.flatMap(id => forms[id]))]
    .filter(form => !acceptedForms.includes(form))
  return shuffleCases([acceptedForms[0], ...shuffleCases(distractors, random).slice(0, 3)], random)
}

export function makeCaseQuestion(noun: CaseNoun, number: GrammaticalNumber, caseId: RussianCase, random = Math.random): CaseQuestion {
  const forms = noun.forms[number]
  const acceptedForms = [...forms[caseId]]
  const options = makeCaseOptions(forms, acceptedForms, random)
  const templates = getCaseTemplates(noun, number, caseId)
  const sentenceTemplate = templates[Math.floor(random() * templates.length)].id
  return { nounId: noun.id, noun, number, caseId, sentenceTemplate, options, acceptedForms }
}

export function createCaseRound(nouns: CaseNoun[], number: GrammaticalNumber, caseId: RussianCase | 'mixed', review?: CaseTask[], random = Math.random): CaseQuestion[] {
  if (nouns.length === 0) return []
  if (caseId === 'mixed') {
    if (review) return createCaseRound(nouns, number, 'nominative', review, random)
    const rounds = shuffleCases(CASE_IDS, random)
      .map(id => shuffleCases(createCaseRound(nouns, number, id, undefined, random), random))
    // Include every case, then take a second question from four randomly chosen cases.
    return shuffleCases(rounds.flatMap((round, index) => round.slice(0, index < 4 ? 2 : 1)), random)
  }
  const byLemma = new Map(nouns.map(noun => [noun.lemma, noun]))
  for (const noun of CASE_EXAMPLE_NOUNS) {
    if (!byLemma.has(noun.lemma)) byLemma.set(noun.lemma, noun)
  }
  const byId = new Map([...byLemma.values()].map(noun => [noun.id, noun]))
  const examples = CASE_EXAMPLES.filter(item => item.number === number && item.caseId === caseId)
  const exampleQuestion = (exercise: typeof CASE_EXAMPLES[number]) =>
    makeExerciseQuestion(byLemma.get(exercise.lemma)!, exercise.number, exercise.caseId, exercise, random)

  if (number === 'singular' && !review) {
    const exercises = SINGULAR_EXERCISES[caseId].filter(item => byLemma.has(item.lemma))
    return (['easy', 'medium', 'hard'] as const).flatMap(difficulty => {
      const preferred = examples.filter(item => item.difficulty === difficulty && byLemma.has(item.lemma))
      const remaining = (difficulty === 'medium' ? 4 : 3) - preferred.length
      const fallback = shuffleCases(exercises.filter(item => item.difficulty === difficulty), random).slice(0, remaining)
      return shuffleCases([...preferred, ...fallback], random)
        .map(exercise => makeSingularQuestion(byLemma.get(exercise.lemma)!, caseId, exercise, random))
    })
  }

  const tasks = review
    ? [...new Map(review.filter(task => {
      const noun = byId.get(task.nounId)
      return noun && (noun.sources.length > 0 || CASE_EXAMPLES.some(exercise =>
        exercise.lemma === noun.lemma && exercise.number === task.number && exercise.caseId === task.caseId,
      ))
    }).map(task => [caseTaskKey(task), task])).values()]
    : nouns.map(noun => ({ nounId: noun.id, number, caseId }))
  if (!tasks.length) return []
  // Normal rounds keep the selected case; review retains each saved case and number.
  const curated = review ? [] : examples.filter(exercise => byLemma.has(exercise.lemma)).map(exampleQuestion)
  const curatedIds = new Set(curated.map(question => question.nounId))
  const remainingTasks = tasks.filter(task => !curatedIds.has(task.nounId))
  const ordered = shuffleCases(remainingTasks.length ? remainingTasks : tasks, random)
  const templateUses = new Map<string, number>()
  const otherQuestions = Array.from({ length: 10 - curated.length }, (_, index) => {
    const task = ordered[index % ordered.length]
    const noun = byId.get(task.nounId)!
    const example = review && CASE_EXAMPLES.find(exercise =>
      exercise.lemma === noun.lemma && exercise.number === task.number && exercise.caseId === task.caseId,
    )
    if (example) return exampleQuestion(example)
    const question = makeCaseQuestion(noun, task.number, task.caseId, random)
    // Balance compatible contexts across the round, retaining random order on ties.
    const templates = shuffleCases(getCaseTemplates(noun, task.number, task.caseId), random)
    templates.sort((a, b) => (templateUses.get(a.id) ?? 0) - (templateUses.get(b.id) ?? 0))
    question.sentenceTemplate = templates[0].id
    templateUses.set(question.sentenceTemplate, (templateUses.get(question.sentenceTemplate) ?? 0) + 1)
    return question
  })
  return curated.length ? shuffleCases([...curated, ...otherQuestions], random) : otherQuestions
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

function makeExerciseQuestion(noun: CaseNoun, number: GrammaticalNumber, caseId: RussianCase, exercise: SingularExercise, random: () => number): CaseQuestion {
  const forms = noun.forms[number]
  const acceptedForms = exercise.form ? [exercise.form] : forms[caseId]
  const options = makeCaseOptions(forms, acceptedForms, random)
  return { nounId: noun.id, noun, number, caseId, sentenceTemplate: exercise.id, acceptedForms, options }
}

export function makeSingularQuestion(noun: CaseNoun, caseId: RussianCase, exercise: SingularExercise, random: () => number): CaseQuestion {
  return makeExerciseQuestion(noun, 'singular', caseId, exercise, random)
}
