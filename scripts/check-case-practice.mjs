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
const templatesUrl = await moduleUrl('../src/data/caseSentenceTemplates.ts')
const { getCaseTemplates } = await import(templatesUrl)
const logicUrl = await moduleUrl('../src/lib/caseGameLogic.ts', [["'../types/cases'", JSON.stringify(types)], ["'../data/caseSentenceTemplates'", JSON.stringify(templatesUrl)]])
const logic = await import(logicUrl)
const sentenceWordsUrl = await moduleUrl('../src/data/caseSentenceWords.ts')
const sentences = await import(await moduleUrl('../src/lib/caseSentences.ts', [
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
let checked = 0, duplicates = 0
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
  assert.equal(question.options.length, 4)
  assert.ok(question.options.some(form => logic.checkCaseAnswer(form, question)))
  if (new Set(question.options).size < 4) duplicates++
  for (const other of CASE_IDS) for (const form of item.forms[number][other]) {
    assert.equal(logic.checkCaseAnswer(form, question), question.acceptedForms.includes(form), `${item.lemma}: ${caseId} ${form}`)
  }
  for (const form of question.acceptedForms) {
    assert.ok(logic.checkCaseAnswer(form, question))
    assert.equal(logic.checkCaseAnswer(`${form}а`, question), question.acceptedForms.includes(`${form}а`))
  }
  checked++
}
assert.ok(duplicates > 0, 'syncretic duplicate options must be retained')
for (const number of ['singular','plural']) for (const caseId of CASE_IDS) {
  const round = logic.createCaseRound(nouns, number, caseId)
  assert.equal(round.length, 10)
  assert.equal(new Set(round.map(logic.caseTaskKey)).size, 10)
  assert.equal(new Set(round.map(q => q.nounId)).size, 10)
  assert.ok(round.every(q => q.number === number && q.caseId === caseId))
  assert.ok(new Set(round.map(q => q.sentenceTemplate)).size >= 3, `${caseId}: round must practise multiple uses`)
  const smallRound = logic.createCaseRound(nouns.slice(0, 2), number, caseId)
  assert.equal(smallRound.length, 10)
  assert.ok(smallRound.every(q => q.number === number && q.caseId === caseId))
}
const recon = { ...logic.makeCaseQuestion(noun('разведка'), 'singular', 'prepositional'), sentenceTemplate: 'talk' }
assert.deepEqual(sentences.getCaseSentence(recon, 'fi'), { prompt: 'Я говорю о ___.', translation: 'Puhun tiedustelusta.' })
assert.deepEqual(sentences.getCaseSentence(recon, 'en'), { prompt: 'Я говорю о ___.', translation: 'I am talking about the reconnaissance.' })
const armies = { ...logic.makeCaseQuestion(noun('армия'), 'plural', 'prepositional'), sentenceTemplate: 'talk' }
assert.deepEqual(sentences.getCaseSentence(armies, 'fi'), { prompt: 'Я говорю об ___.', translation: 'Puhun armeijoista.' })
assert.equal(sentences.getCaseSentence(armies, 'en').translation, 'I am talking about the armies.')
assert.equal(sentences.getCaseSentence({ ...logic.makeCaseQuestion(noun('солдат'), 'plural', 'accusative'), sentenceTemplate: 'see' }, 'fi').translation, 'Näen sotilaita.')
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
console.log(`Verified ${checked} noun/number/case combinations, ${duplicates} questions with duplicate options, reference irregulars, contexts, bilingual guides, rounds and review persistence.`)
