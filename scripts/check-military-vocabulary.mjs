import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

// Exercise the actual loader and quiz functions without needing a browser or test runner.
async function moduleUrl(path, replacements = []) {
  let source = await readFile(new URL(path, import.meta.url), 'utf8')
  for (const [from, to] of replacements) source = source.replaceAll(from, to)
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  })
  return `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
}
const data = await import(await moduleUrl('../src/lib/wordsData.ts', [['import.meta.env.BASE_URL', "'/'"]]))
const typesUrl = await moduleUrl('../src/types/game.ts')
const logic = await import(await moduleUrl('../src/lib/wordsGameLogic.ts', [["'../types/game'", JSON.stringify(typesUrl)]]))
const originalFetch = globalThis.fetch
let total = 0
try {
  globalThis.fetch = async url => ({
    ok: true,
    text: () => readFile(new URL(`../public${url}`, import.meta.url), 'utf8'),
  })
  for (const list of data.PERUSSANASTO_LIST_IDS) {
    const fi = await data.loadWordsCSV(list, 'fin')
    const en = await data.loadWordsCSV(list, 'eng')
    assert.deepEqual(fi.map(row => row.russian), en.map(row => row.russian), `${list}: language parity`)
    for (const [language, entries] of [['fin', fi], ['eng', en]]) {
      assert.equal(new Set(entries.map(row => row.russian)).size, entries.length, `${list}: duplicate Russian term`)
      for (const entry of entries) {
        assert.match(entry.russian, /^[А-ЯЁ]/u)
        assert.match(entry.finnish, /^[A-ZÄÖÅ]/u)
        assert.doesNotMatch(entry.finnish, /[\u0400-\u04ff]/u, `${list}: Cyrillic in ${language} answer`)
        for (const direction of ['ru-fi', 'fi-ru']) {
          const { prompt, correctAnswer } = logic.getPromptAndAnswer(entry, direction)
          const valid = new Set(entries
            .map(pair => logic.getPromptAndAnswer(pair, direction))
            .filter(pair => pair.prompt === prompt).map(pair => pair.correctAnswer))
          const options = logic.generateWordOptions(correctAnswer, entries, direction, undefined, prompt)
          assert.equal(options.length, 4)
          assert.equal(new Set(options).size, 4)
          assert.ok(options.includes(correctAnswer))
          assert.equal(options.filter(answer => valid.has(answer)).length, 1, `${list}: synonym offered as wrong answer`)
        }
      }
      total += entries.length
    }
    if (list === 'kyberturvallisuuden-kasitteisto') {
      const state = fi.find(row => row.russian.startsWith('Государственная система обнаружения,'))
      assert.ok(state)
      assert.match(state.russian, /, предупреждения/)
      assert.match(state.finnish, /^Valtiollinen järjestelmä/)
      assert.ok(fi.some(row => row.russian === 'Угроза в информационном пространстве'))
      assert.ok(fi.some(row => row.russian === 'Угроза информационной безопасности'))
    }
  }
  // Regressions for quoted punctuation, escaped quotes, BOM, semicolon and legacy card formats.
  let fixtureId = 0
  async function loadFixture(text) {
    globalThis.fetch = async () => ({ ok: true, text: async () => text })
    const fixtureData = await import(`${await moduleUrl('../src/lib/wordsData.ts', [['import.meta.env.BASE_URL', "'/'"]])}#fixture-${fixtureId++}`)
    return fixtureData.loadWordsCSV('aseet-ja-ammukset')
  }
  assert.deepEqual(await loadFixture('\ufeffRussian,Finnish\n"Термин, пояснение", "Vastaus; lisäys ""lainaus"""'), [
    { russian: 'Термин, пояснение', finnish: 'Vastaus; lisäys "lainaus"' },
  ])
  assert.deepEqual(await loadFixture('Russian;Finnish\n"Термин; пояснение";Vastaus'), [
    { russian: 'Термин; пояснение', finnish: 'Vastaus' },
  ])
  const extended = await loadFixture('Russian,Finnish,Finnish_alt1,Finnish_alt2,Finnish_alt3,Russian_alt1,Russian_alt2,Russian_alt3\nА,Answer,Wrong1,Wrong2,Wrong3,Б,В,Г')
  assert.deepEqual(extended[0].russianAlts, ['Б', 'В', 'Г'])
  assert.deepEqual(extended[0].finnishAlts, ['Wrong1', 'Wrong2', 'Wrong3'])
  const cards = await loadFixture('prompt,ve1,ve2,ve3,ve4\nQuestion,А,Б,В,Г')
  assert.deepEqual(cards[0], { prompt: 'Question', correct: 'А', wrongOptions: ['Б', 'В', 'Г'] })
  const cachedData = await import(`${await moduleUrl('../src/lib/wordsData.ts', [['import.meta.env.BASE_URL', "'/'"]])}#cache-tests`)
  let requests = 0
  globalThis.fetch = async () => {
    requests++
    await new Promise(resolve => setTimeout(resolve, 5))
    return { ok: true, text: async () => 'Russian,Finnish\nТермин,Vastaus' }
  }
  const [first, concurrent] = await Promise.all([
    cachedData.loadWordsCSV('aseet-ja-ammukset'),
    cachedData.loadWordsCSV('aseet-ja-ammukset'),
  ])
  assert.equal(requests, 1, 'concurrent requests should share a fetch')
  first[0].finnish = 'Changed by caller'
  assert.equal(concurrent[0].finnish, 'Vastaus', 'cached entries must not share mutable state')
  assert.equal((await cachedData.loadWordsCSV('aseet-ja-ammukset'))[0].finnish, 'Vastaus')
  assert.equal(requests, 1, 'repeat visits should use the session cache')
  await cachedData.loadWordsCSV('aseet-ja-ammukset', 'eng')
  assert.equal(requests, 2, 'languages need separate cache entries')
  globalThis.fetch = async () => { throw new Error('Temporary network error') }
  await assert.rejects(cachedData.loadWordsCSV('kalusto-ja-alustat'), /Temporary network error/)
  globalThis.fetch = async () => ({ ok: true, text: async () => 'Russian,Finnish\nТермин,Vastaus' })
  assert.equal((await cachedData.loadWordsCSV('kalusto-ja-alustat')).length, 1, 'failed fetches must be retryable')

} finally {
  globalThis.fetch = originalFetch
}
console.log(`Verified ${total} vocabulary rows, both quiz directions, language parity CSV parser regressions and session caching.`)
