import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const handlers = new Map()
const session = { setActionHandler: (name, handler) => handlers.set(name, handler) }
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaSession: session } })
globalThis.MediaMetadata = class { constructor(data) { Object.assign(this, data) } }
globalThis.document = { body: { append(audio) { audio.attached = true } } }
globalThis.Audio = class {
  paused = true
  ended = false
  currentTime = 0
  play() { this.paused = false; this.ended = false; this.onplaying?.(); return Promise.resolve() }
  pause() { this.paused = true; this.onpause?.() }
  load() { this.ended = false }
  removeAttribute() { this.src = '' }
  remove() { this.attached = false }
  finish() { this.ended = true; this.paused = true; this.onended?.() }
}
const source = await readFile(new URL('../src/lib/browserShufflePlayer.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
const { createBrowserShufflePlayer } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
let state
const player = createBrowserShufflePlayer(['a.mp3','b.mp3','c.mp3'], '/music/', (track, playing) => { state = { track, playing } }, () => 0.4)
player.start()
const heard = []
for (let i = 0; i < 12; i++) {
  assert.equal(state.playing, true)
  assert.equal(player.audio.attached, true)
  heard.push(state.track)
  player.audio.finish()
}
for (let i = 0; i < heard.length; i += 3) assert.equal(new Set(heard.slice(i, i + 3)).size, 3)
for (let i = 1; i < heard.length; i++) assert.notEqual(heard[i], heard[i - 1])
handlers.get('pause')()
await Promise.resolve()
assert.equal(state.playing, false)
handlers.get('play')()
assert.equal(state.playing, true)
handlers.get('nexttrack')()
assert.equal(state.playing, true)
player.stop()
assert.equal(state.playing, false)
const beforeDispose = state
player.dispose()
await Promise.resolve()
assert.equal(state, beforeDispose, 'late play promises must not update disposed sessions')
assert.equal(player.audio.onended, null)
assert.equal(player.audio.attached, false)
assert.equal(session.playbackState, 'none')
assert.ok([...handlers.values()].every(handler => handler === null))
console.log('Verified shuffle across four playlist cycles, media controls, pause, stop and cleanup.')

const roundsSource = await readFile(new URL('../src/lib/roundsStorage.ts', import.meta.url), 'utf8')
const roundsJs = ts.transpileModule(roundsSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const rounds = await import(`data:text/javascript;base64,${Buffer.from(roundsJs).toString('base64')}`)
const saved = new Map()
globalThis.localStorage = { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) }
const key = rounds.getRoundsKey('cases', 'singular')
assert.equal(rounds.formatRoundsDisplay(rounds.getRounds(key)), '0/10')
rounds.incrementRounds(key)
assert.equal(rounds.formatRoundsDisplay(rounds.getRounds(key)), '1/10')
for (let i = 0; i < 12; i++) rounds.incrementRounds(key)
assert.equal(rounds.getRounds(key), 10)
assert.equal(rounds.formatRoundsDisplay(rounds.getRounds(key)), 'Completed')
saved.set(key, '42')
assert.equal(rounds.getRounds(key), 10, 'old progress beyond the new target remains completed')
console.log('Verified ten-game completion target and existing progress compatibility.')
