import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

async function moduleUrl(path, replacements = []) {
  let source = await readFile(new URL(path, import.meta.url), 'utf8')
  for (const [from, to] of replacements) source = source.replaceAll(from, to)
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
  return `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
}
const types = await moduleUrl('../src/types/cases.ts')
const singularUrl = await moduleUrl('../src/data/singularExercises.ts')
const { SINGULAR_EXERCISES } = await import(singularUrl)
const examplesUrl = await moduleUrl('../src/data/caseExamples.ts', [["'../types/cases'", JSON.stringify(types)]])
const { CASE_EXAMPLES } = await import(examplesUrl)
const templatesUrl = await moduleUrl('../src/data/caseSentenceTemplates.ts')
const { getCaseTemplates } = await import(templatesUrl)
const logicUrl = await moduleUrl('../src/lib/caseGameLogic.ts', [["'../data/caseExamples'", JSON.stringify(examplesUrl)], ["'../data/singularExercises'", JSON.stringify(singularUrl)], ["'../types/cases'", JSON.stringify(types)], ["'../data/caseSentenceTemplates'", JSON.stringify(templatesUrl)]])
const logic = await import(logicUrl)
const sentenceWordsUrl = await moduleUrl('../src/data/caseSentenceWords.ts')
const sentences = await import(await moduleUrl('../src/lib/caseSentences.ts', [
  ["'../data/caseExamples'", JSON.stringify(examplesUrl)],
  ["'../data/singularExercises'", JSON.stringify(singularUrl)],
  ["'../data/caseSentenceWords'", JSON.stringify(sentenceWordsUrl)],
  ["'./caseGameLogic'", JSON.stringify(logicUrl)],
  ["'../data/caseSentenceTemplates'", JSON.stringify(templatesUrl)],
]))
const { CASE_IDS } = await import(types)
const { CASE_GRAMMAR, CASE_ENDINGS } = await import(await moduleUrl('../src/data/caseGrammar.ts', [["'../types/cases'", JSON.stringify(types)]]))
const review = await import(await moduleUrl('../src/lib/caseReviewStorage.ts', [["'../types/cases'", JSON.stringify(types)], ["'./caseGameLogic'", JSON.stringify(logicUrl)]]))
const bank = JSON.parse(await readFile(new URL('../public/data/cases/nouns.json', import.meta.url), 'utf8'))
const nouns = bank.nouns
assert.ok(nouns.length >= 100)
assert.equal(new Set(nouns.map(n => n.lemma)).size, nouns.length)
const noun = word => { const result = nouns.find(n => n.lemma === word); assert.ok(result, word); return result }
for (const number of ['singular', 'plural']) {
  const round = logic.createCaseRound(nouns, number, 'mixed')
  assert.equal(round.length, 10)
  assert.deepEqual(new Set(round.map(question => question.caseId)), new Set(CASE_IDS))
  for (const question of round) {
    assert.equal(question.number, number)
    assert.equal(question.options.filter(option => logic.checkCaseAnswer(option, question)).length, 1)
    assert.equal(sentences.getCaseSentence(question, 'fi').prompt.split('___').length, 2)
  }
}
// Independent reference fixtures, including stem changes, zero genitive and soft-sign forms.
const fixtures = {
  солдат: [['солдат','солдата','солдату','солдата','солдатом','солдате'], ['солдаты','солдат','солдатам','солдат','солдатами','солдатах']],
  боец: [['боец','бойца','бойцу','бойца','бойцом','бойце'], ['бойцы','бойцов','бойцам','бойцов','бойцами','бойцах']],
  день: [['день','дня','дню','день','днём','дне'], ['дни','дней','дням','дни','днями','днях']],
  ночь: [['ночь','ночи','ночи','ночь','ночью','ночи'], ['ночи','ночей','ночам','ночи','ночами','ночах']],
  море: [['море','моря','морю','море','морем','море'], ['моря','морей','морям','моря','морями','морях']],
  крыло: [['крыло','крыла','крылу','крыло','крылом','крыле'], ['крылья','крыльев','крыльям','крылья','крыльями','крыльях']],
  армия: [['армия','армии','армии','армию','армией','армии'], ['армии','армий','армиям','армии','армиями','армиях']],
  орудие: [['орудие','орудия','орудию','орудие','орудием','орудии'], ['орудия','орудий','орудиям','орудия','орудиями','орудиях']],
}
for (const [word, forms] of Object.entries(fixtures)) for (const [i, number] of ['singular','plural'].entries()) {
  assert.deepEqual(CASE_IDS.map(id => noun(word).forms[number][id][0]), forms[i], `${word} ${number}`)
}
for (const word of ['справа','течь','левый','правый','военный','взрывной','корпус','судно','данные','сведения','оружие','шасси']) {
  assert.ok(!nouns.some(n => n.lemma === word), `unsafe noun admitted: ${word}`)
}
let checked = 0
for (const item of nouns) for (const number of ['singular','plural']) for (const caseId of CASE_IDS) {
  const question = logic.makeCaseQuestion(item, number, caseId)
  for (const template of getCaseTemplates(item, number, caseId)) for (const language of ['fi', 'en']) {
    const contextualQuestion = { ...question, sentenceTemplate: template.id }
    const sentence = sentences.getCaseSentence(contextualQuestion, language)
    assert.equal(sentence.prompt.split('___').length, 2, 'one noun blank')
    assert.equal(sentence.prompt.replace('___', question.acceptedForms[0]), sentences.caseSentenceText(contextualQuestion, question.acceptedForms[0]))
    assert.ok(sentence.translation.endsWith('.'))
    assert.ok(!/undefined|___|[{}а-яё]/u.test(sentence.translation), `${item.lemma}: invalid ${language} translation`)
  }
  assert.ok(question.options.length >= 3 && question.options.length <= 4)
  assert.ok(question.options.some(form => logic.checkCaseAnswer(form, question)))
  assert.equal(new Set(question.options).size, question.options.length)
  for (const other of CASE_IDS) for (const form of item.forms[number][other]) {
    assert.equal(logic.checkCaseAnswer(form, question), question.acceptedForms.includes(form), `${item.lemma}: ${caseId} ${form}`)
  }
  for (const form of question.acceptedForms) {
    assert.ok(logic.checkCaseAnswer(form, question))
    assert.equal(logic.checkCaseAnswer(`${form}а`, question), question.acceptedForms.includes(`${form}а`))
  }
  checked++
}
for (const number of ['singular','plural']) for (const caseId of CASE_IDS) {
  const round = logic.createCaseRound(nouns, number, caseId)
  assert.equal(round.length, 10)
  if (number === 'plural') assert.equal(new Set(round.map(q => q.nounId)).size, 10)
  assert.ok(round.every(q => q.number === number && q.caseId === caseId))
  assert.ok(new Set(round.map(q => q.sentenceTemplate)).size >= 3, `${caseId}: round must practise multiple uses`)
  for (const exercise of CASE_EXAMPLES.filter(item => item.caseId === caseId && item.number === number)) {
    const question = round.find(q => q.sentenceTemplate === exercise.id)
    assert.ok(question, exercise.id)
    assert.equal(sentences.getCaseSentence(question, 'fi').prompt, exercise.ru)
    assert.equal(question.options.filter(form => logic.checkCaseAnswer(form, question)).length, 1)
    assert.equal(new Set(question.options).size, question.options.length)
    const reviewed = logic.createCaseRound(nouns, number, caseId, [question])
    assert.equal(reviewed.length, 10)
    assert.ok(reviewed.every(q => q.sentenceTemplate === exercise.id))
    if (exercise.ru.startsWith('___')) {
      assert.match(sentences.caseSentenceText(question, question.acceptedForms[0]), /^\p{Lu}/u)
    }
  }
}
const recon = { ...logic.makeCaseQuestion(noun('разведка'), 'singular', 'prepositional'), sentenceTemplate: 'talk' }
assert.deepEqual(sentences.getCaseSentence(recon, 'fi'), { prompt: 'Командир говорит о ___.', translation: 'Komentaja puhuu tiedustelusta.' })
assert.deepEqual(sentences.getCaseSentence(recon, 'en'), { prompt: 'Командир говорит о ___.', translation: 'The commander is talking about the reconnaissance.' })
const armies = { ...logic.makeCaseQuestion(noun('армия'), 'plural', 'prepositional'), sentenceTemplate: 'talk' }
assert.deepEqual(sentences.getCaseSentence(armies, 'fi'), { prompt: 'Командир говорит об ___.', translation: 'Komentaja puhuu armeijoista.' })
assert.equal(sentences.getCaseSentence(armies, 'en').translation, 'The commander is talking about the armies.')
assert.equal(sentences.getCaseSentence({ ...logic.makeCaseQuestion(noun('солдат'), 'plural', 'accusative'), sentenceTemplate: 'see' }, 'fi').translation, 'Komentaja näkee sotilaita.')
const soldier = logic.makeCaseQuestion(noun('солдат'), 'singular', 'genitive')
assert.deepEqual(sentences.getCaseSentence({ ...soldier, sentenceTemplate: 'possession' }, 'fi'), { prompt: 'Это вещь ___.', translation: 'Tämä on sotilaan tavara.' })
assert.equal(sentences.getCaseSentence({ ...soldier, sentenceTemplate: 'purpose' }, 'fi').translation, 'Tämä on sotilasta varten.')
assert.equal(sentences.getCaseSentence({ ...soldier, caseId: 'dative', acceptedForms: ['солдату'], sentenceTemplate: 'recipient' }, 'fi').prompt, 'Я даю ___ шанс.')
assert.equal(sentences.getCaseSentence({ ...soldier, caseId: 'dative', acceptedForms: ['солдату'], sentenceTemplate: 'help' }, 'fi').translation, 'Tästä on apua sotilaalle.')
const pluralArmy = logic.makeCaseQuestion(noun('армия'), 'plural', 'prepositional')
assert.deepEqual(sentences.getCaseSentence({ ...pluralArmy, sentenceTemplate: 'location' }, 'fi'), { prompt: 'Мы в ___.', translation: 'Olemme armeijoissa.' })
const pluralSoldier = logic.makeCaseQuestion(noun('солдат'), 'plural', 'nominative')
assert.equal(sentences.getCaseSentence({ ...pluralSoldier, sentenceTemplate: 'identify' }, 'fi').translation, 'Nämä ovat sotilaat.')
assert.equal(sentences.getCaseSentence({ ...pluralSoldier, sentenceTemplate: 'identify' }, 'en').translation, 'These are the soldiers.')
for (const lemma of ['лес', 'мост', 'день', 'ночь']) {
  assert.ok(!getCaseTemplates(noun(lemma), 'singular', 'prepositional').some(t => t.id === 'location'))
}
assert.equal(logic.caseContext('prepositional','армии'), 'об армии')
assert.equal(logic.caseContext('prepositional','орудии'), 'об орудии')
assert.equal(logic.caseContext('prepositional','солдате'), 'о солдате')
assert.equal(logic.caseContext('prepositional','якоре'), 'о якоре')
assert.equal(logic.caseContext('instrumental','взводом'), 'со взводом')
assert.equal(logic.caseContext('dative','взводу'), 'ко взводу')
assert.equal(logic.caseContext('instrumental','солдатом'), 'с солдатом')
for (const id of CASE_IDS) {
  const guide = CASE_GRAMMAR[id]
  for (const category of ['M', 'F', 'N', 'Plural']) {
    const changes = CASE_ENDINGS[id][category]
    assert.ok(changes.length > 0, `${id}: missing ${category} ending table`)
    for (const change of changes) {
      assert.ok(change.from && change.to && change.example.includes(' → '), `${id}: incomplete ending change`)
    }
  }
  assert.deepEqual(guide.rules.map(r => r.category), ['M','F','N','Plural'])
  for (const lang of ['fi','en']) {
    for (const field of ['name','questions','use','exceptions']) assert.ok(guide[field][lang].length > 3)
    assert.ok(guide.rules.every(r => r.text[lang] && r.example))
  }
}
const storage = new Map()
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key,value) => storage.set(key,value) }
const a = logic.makeCaseQuestion(noun('солдат'),'singular','accusative')
const b = logic.makeCaseQuestion(noun('солдат'),'plural','genitive')
assert.equal(review.toggleCaseReview(a).length,1)
assert.equal(review.toggleCaseReview(b).length,2)
const saved = review.getCaseReviewList()
assert.deepEqual(saved[0], { nounId:a.nounId, lemma:'солдат', number:'singular', caseId:'accusative', correctForm:'солдата' })
const round = logic.createCaseRound(nouns,'singular','nominative',saved)
assert.equal(round.length,10)
assert.ok(round.some(q=>q.number==='plural' && q.caseId==='genitive'))
assert.equal(review.toggleCaseReview(a).length,1)
assert.equal(review.toggleCaseReview(b).length,0)
assert.deepEqual(logic.createCaseRound(nouns,'singular','nominative',[]),[])
localStorage.setItem('sotilasvenaja_cases_kerrattava_v1','invalid json')
assert.deepEqual(review.getCaseReviewList(),[])
localStorage.setItem('sotilasvenaja_cases_kerrattava_v1',JSON.stringify([{nounId:'bad',caseId:'fake',number:'plural',lemma:'x',correctForm:'x'}]))
assert.deepEqual(review.getCaseReviewList(),[])
globalThis.localStorage = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }
assert.deepEqual(review.getCaseReviewList(),[])
assert.deepEqual(review.toggleCaseReview(a),[])
console.log(`Verified ${checked} noun/number/case combinations, reference irregulars, contexts, bilingual guides, rounds and review persistence.`)

for (const caseId of CASE_IDS) {
  const sampled = logic.createCaseRound(nouns, 'singular', caseId)
  assert.equal(sampled.length, 10)
  assert.deepEqual(['easy','medium','hard'].map(level => sampled.filter(q => [...SINGULAR_EXERCISES[caseId], ...CASE_EXAMPLES].find(e => e.id === q.sentenceTemplate).difficulty === level).length), [3,4,3])
  const round = SINGULAR_EXERCISES[caseId].map(exercise => logic.makeSingularQuestion(noun(exercise.lemma), caseId, exercise, Math.random))
  assert.equal(round.length, 100)
  assert.equal(new Set(round.map(q => q.sentenceTemplate)).size, 100)
  assert.deepEqual(['easy','medium','hard'].map(level => SINGULAR_EXERCISES[caseId].filter(e => e.difficulty === level).length), [30,40,30])
  assert.equal(new Set(round.map(q => q.noun.gender)).size, 3)
  assert.ok(round.some(q => q.noun.animate))
  assert.ok(round.some(q => !q.noun.animate))
  for (const q of round) {
    assert.equal(new Set(q.options).size, 4, `${caseId}: ${q.noun.lemma}`)
    assert.equal(q.options.filter(form => logic.checkCaseAnswer(form, q)).length, 1)
    for (const lang of ['fi','en']) {
      const sentence = sentences.getCaseSentence(q, lang)
      assert.equal(sentence.prompt.split('___').length, 2)
      assert.ok(!/[{}]|undefined/.test(sentence.translation))
      assert.ok(sentences.caseExplanation(q, lang).includes(q.acceptedForms[0]))
    }
  }
}
console.log('Verified 600 singular exercises: difficulty, gender, animacy, unique answers, translations and explanations.')
