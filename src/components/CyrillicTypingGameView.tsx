import { useCallback, useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type CompositionEvent, type DragEvent } from 'react'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import type { AppLanguage } from '../types/game'
import type { TypingAttemptStats, TypingDifficulty, TypingSentence } from '../types/typing'
import { loadTypingSentences, selectTypingSentence } from '../lib/typingData'
import { calculateAccuracy, calculateCpm, correctPrefixLength, countCharacterAttempts, formatTypingTime } from '../lib/typingLogic'
import { loadTypingBestTimes, saveTypingBestTime } from '../lib/typingStorage'
import { playWrong } from '../lib/sound'
import './CyrillicTypingGameView.css'

type GameState = 'difficulty-selection' | 'ready' | 'running' | 'cancelled' | 'finishing' | 'finished'
const EMPTY_STATS: TypingAttemptStats = { totalCharacterAttempts: 0, correctCharacterAttempts: 0, incorrectCharacterAttempts: 0 }
const DIFFICULTIES: TypingDifficulty[] = ['easy', 'harder', 'svo']
const TANK_IMAGE_URL = `${import.meta.env.BASE_URL}assets/typing/tankracer.png`
const MINE_IMAGE_URL = `${import.meta.env.BASE_URL}assets/typing/mine.png`
const FLAG_IMAGE_URL = `${import.meta.env.BASE_URL}assets/typing/flag.png`
const DESTROYED_TANK_IMAGE_URL = `${import.meta.env.BASE_URL}assets/typing/explosion.png`
const BACKGROUND_MUSIC_URL = `${import.meta.env.BASE_URL}tiedot-ja-asetukset/audio/background.mp3`
const LABELS: Record<TypingDifficulty, { fi: string; en: string }> = {
  easy: { fi: 'Helppo', en: 'Easy' },
  harder: { fi: 'Vaikeampi', en: 'Harder' },
  svo: { fi: 'SVO', en: 'SVO' },
}

interface Props { appLanguage: AppLanguage; muted: boolean; onToggleMute: () => void; onBack: () => void }

export function CyrillicTypingGameView({ appLanguage, muted, onToggleMute, onBack }: Props) {
  const en = appLanguage === 'eng'
  const [sentences, setSentences] = useState<TypingSentence[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<TypingDifficulty | null>(null)
  const [sentence, setSentence] = useState<TypingSentence | null>(null)
  const [state, setState] = useState<GameState>('difficulty-selection')
  const [input, setInput] = useState('')
  const [stats, setStats] = useState<TypingAttemptStats>(EMPTY_STATS)
  const [elapsed, setElapsed] = useState(0)
  const [bestTime, setBestTime] = useState<number | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const startRef = useRef<number | null>(null)
  const stateRef = useRef<GameState>(state)
  const composingRef = useRef(false)
  const completionRef = useRef(false)
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null)
  const [backgroundMusicPlaying, setBackgroundMusicPlaying] = useState(false)
  stateRef.current = state

  useEffect(() => () => {
    backgroundMusicRef.current?.pause()
    backgroundMusicRef.current = null
  }, [])

  const toggleBackgroundMusic = () => {
    let audio = backgroundMusicRef.current
    if (!audio) {
      audio = new Audio(BACKGROUND_MUSIC_URL)
      audio.loop = true
      backgroundMusicRef.current = audio
    }

    if (!audio.paused) {
      audio.pause()
      setBackgroundMusicPlaying(false)
      return
    }

    void audio.play()
      .then(() => setBackgroundMusicPlaying(true))
      .catch(() => setBackgroundMusicPlaying(false))
  }

  const musicButton = <button type="button" className="mute-btn mute-btn-small music-btn" onClick={toggleBackgroundMusic} aria-label={backgroundMusicPlaying ? (en ? 'Stop background music' : 'Pysäytä taustamusiikki') : (en ? 'Play background music' : 'Soita taustamusiikkia')} aria-pressed={backgroundMusicPlaying} title={backgroundMusicPlaying ? (en ? 'Stop background music' : 'Pysäytä taustamusiikki') : (en ? 'Play background music' : 'Soita taustamusiikkia')}>{backgroundMusicPlaying ? '⏸️' : '🎵'}</button>

  useEffect(() => { loadTypingSentences().then(setSentences).catch((error: unknown) => setLoadError(error instanceof Error ? error.message : String(error))) }, [])
  useEffect(() => { if (state === 'ready' || state === 'running' || state === 'cancelled') requestAnimationFrame(() => inputRef.current?.focus()) }, [sentence, state])

  useEffect(() => {
    if (state !== 'running') return
    let frame = 0
    const update = () => { if (startRef.current != null) setElapsed(performance.now() - startRef.current); frame = requestAnimationFrame(update) }
    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [state])

  const resetAttempt = useCallback((cancelled = false) => {
    startRef.current = null; completionRef.current = false; setInput(''); setStats(EMPTY_STATS); setElapsed(0); setState(cancelled ? 'cancelled' : 'ready')
  }, [])

  useEffect(() => {
    const cancelActive = () => { if (stateRef.current === 'running') resetAttempt(true) }
    const visibility = () => { if (document.hidden) cancelActive() }
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('pagehide', cancelActive)
    let removeNative: (() => void) | undefined
    if (Capacitor.isNativePlatform()) void CapacitorApp.addListener('appStateChange', ({ isActive }) => { if (!isActive) cancelActive() }).then((handle) => { removeNative = () => void handle.remove() })
    return () => { document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', cancelActive); removeNative?.() }
  }, [resetAttempt])

  const chooseDifficulty = (next: TypingDifficulty) => {
    const selected = selectTypingSentence(sentences, next)
    if (!selected) return
    setDifficulty(next); setSentence(selected); setBestTime(loadTypingBestTimes()[selected.id] ?? null); resetAttempt()
  }

  const complete = (finalElapsed: number, finalStats: TypingAttemptStats) => {
    if (!sentence || completionRef.current) return
    completionRef.current = true; setElapsed(finalElapsed); setStats(finalStats); setBestTime(saveTypingBestTime(sentence.id, finalElapsed)); setState('finishing'); playWrong(muted)
    window.setTimeout(() => setState((current) => current === 'finishing' ? 'finished' : current), 650)
  }

  const applyInput = (rawValue: string) => {
    if (!sentence || state === 'finished' || state === 'finishing') return
    const next = rawValue.normalize('NFC').slice(0, sentence.russian.length)
    const added = countCharacterAttempts(input, next, sentence.russian)
    const nextStats = {
      totalCharacterAttempts: stats.totalCharacterAttempts + added.totalCharacterAttempts,
      correctCharacterAttempts: stats.correctCharacterAttempts + added.correctCharacterAttempts,
      incorrectCharacterAttempts: stats.incorrectCharacterAttempts + added.incorrectCharacterAttempts,
    }
    let startedAt = startRef.current
    if (added.totalCharacterAttempts > 0 && startedAt == null) { startedAt = performance.now(); startRef.current = startedAt; setState('running') }
    setInput(next); setStats(nextStats)
    if (next === sentence.russian && startedAt != null) complete(performance.now() - startedAt, nextStats)
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value
    if (!composingRef.current && next.length - input.length > 1) return
    applyInput(next)
  }
  const blockPaste = (event: ClipboardEvent | DragEvent) => event.preventDefault()
  const retry = () => resetAttempt()
  const newSentence = () => {
    if (!difficulty || !sentence) return
    const selected = selectTypingSentence(sentences, difficulty, sentence.id)
    if (!selected) return
    setSentence(selected); setBestTime(loadTypingBestTimes()[selected.id] ?? null); resetAttempt()
  }
  const prefix = sentence ? correctPrefixLength(input, sentence.russian) : 0
  const progress = sentence ? prefix / sentence.russian.length : 0

  if (loadError) return <main className="typing-game"><p role="alert">{loadError}</p><button className="back-btn" onClick={onBack}>{en ? 'Main menu' : 'Päävalikko'}</button></main>
  if (state === 'difficulty-selection') return (
    <main className="typing-game typing-select">
      <header className="typing-header"><div className="typing-header-actions"><button type="button" className="back-btn back-btn-small game-home-btn" onClick={onBack} title={en ? 'Main menu' : 'Päävalikko'} aria-label={en ? 'Main menu' : 'Päävalikko'}>🏠</button><button className="mute-btn mute-btn-small" onClick={onToggleMute} aria-label={en ? 'Toggle sound' : 'Äänet'}>{muted ? '🔇' : '🔊'}</button>{musicButton}</div><h1>{en ? 'Tank Racer' : 'Tankkiralli'}</h1></header>
      <section className="typing-card"><h2>{en ? 'Choose difficulty' : 'Valitse vaikeustaso'}</h2><div className="typing-difficulty-grid">{DIFFICULTIES.map((item) => <button key={item} disabled={!sentences.some((entry) => entry.difficulty === item)} onClick={() => chooseDifficulty(item)}>{LABELS[item][en ? 'en' : 'fi']}</button>)}</div></section>
      <button className="back-btn" onClick={onBack}>{en ? 'Main menu' : 'Päävalikko'}</button>
    </main>
  )
  if (!sentence || !difficulty) return null
  return (
    <main className="typing-game">
      <header className="typing-header"><div className="typing-header-actions"><button type="button" className="back-btn back-btn-small game-home-btn" onClick={onBack} title={en ? 'Main menu' : 'Päävalikko'} aria-label={en ? 'Main menu' : 'Päävalikko'}>🏠</button><button className="mute-btn mute-btn-small" onClick={onToggleMute} aria-label={en ? 'Toggle sound' : 'Äänet'}>{muted ? '🔇' : '🔊'}</button>{musicButton}</div><h1>{en ? 'Tank Racer' : 'Tankkiralli'}</h1></header>
      <div className="typing-status"><span>{LABELS[difficulty][en ? 'en' : 'fi']}</span><strong aria-label={en ? 'Elapsed time' : 'Kulunut aika'}>{formatTypingTime(elapsed)}</strong></div>
      <div className="typing-track" aria-label={`${Math.round(progress * 100)}%`}>
        <img src={FLAG_IMAGE_URL} className="typing-finish" alt={en ? 'Ukrainian flag' : 'Ukrainan lippu'} />
        <img src={MINE_IMAGE_URL} className="typing-mine" alt={en ? 'Mine' : 'Miina'} />
        {state !== 'finished' && <img src={TANK_IMAGE_URL} className={`typing-tank ${state === 'finishing' ? 'hidden' : ''}`} style={{ left: `calc(${progress * 100}% - ${progress * 17}rem)` }} alt="" />}
        {state === 'finishing' && <div className="typing-explosion" aria-label={en ? 'Explosion' : 'Räjähdys'}>💥</div>}
        {state === 'finished' && <img src={DESTROYED_TANK_IMAGE_URL} className="typing-destroyed-tank" alt={en ? 'Destroyed tank' : 'Tuhoutunut panssarivaunu'} />}
      </div>
      {state === 'cancelled' && <div className="typing-cancelled" role="status"><p>{en ? 'Run cancelled because the application was placed in the background.' : 'Suoritus keskeytettiin, koska sovellus siirrettiin taustalle.'}</p><button onClick={retry}>{en ? 'Start' : 'Aloita'}</button></div>}
      <section className="typing-card">
        <div className="typing-target" aria-label={sentence.russian}>{Array.from(sentence.russian).map((character, index) => { const className = index < prefix ? 'correct' : index === prefix ? (input[index] == null ? 'current' : 'incorrect current') : index < input.length ? 'incorrect' : 'pending'; return <span key={index} className={className}>{character}</span> })}</div>
        <label htmlFor="typing-input">{en ? 'Type the Russian text exactly' : 'Kirjoita venäjänkielinen teksti täsmälleen'}</label>
        <textarea id="typing-input" ref={inputRef} value={input} onChange={handleChange} onPaste={blockPaste} onDrop={blockPaste} onDragOver={blockPaste} onContextMenu={(event) => event.preventDefault()} onCompositionStart={() => { composingRef.current = true }} onCompositionEnd={(event: CompositionEvent<HTMLTextAreaElement>) => { composingRef.current = false; applyInput(event.currentTarget.value) }} autoCapitalize="off" autoCorrect="off" spellCheck={false} disabled={state === 'finishing' || state === 'finished'} />
        <div className="typing-live"><span>{Math.round(elapsed > 0 ? prefix / (elapsed / 60_000) : 0)} CPM</span><span>{calculateAccuracy(stats).toFixed(1)}%</span></div>
        {state === 'finished' && <div className="typing-translation"><h3>{en ? 'Translation' : 'Käännös'}</h3><p>{sentence.translations[en ? 'en' : 'fi']}</p></div>}
      </section>
      {state === 'finished' && <section className="typing-result" aria-live="polite"><h2>{en ? 'Completed!' : 'Valmis!'}</h2><dl><div><dt>{en ? 'Time' : 'Aika'}</dt><dd>{formatTypingTime(elapsed)}</dd></div><div><dt>{en ? 'Speed' : 'Nopeus'}</dt><dd>{calculateCpm(sentence.russian.length, elapsed)} {en ? 'CPM' : 'merkkiä/min'}</dd></div><div><dt>{en ? 'Accuracy' : 'Tarkkuus'}</dt><dd>{calculateAccuracy(stats).toFixed(1)} %</dd></div><div><dt>{en ? 'Best time' : 'Paras aika'}</dt><dd>{bestTime == null ? '–' : formatTypingTime(bestTime)}</dd></div></dl><div className="typing-actions"><button onClick={retry}>{en ? 'Try again' : 'Yritä uudelleen'}</button><button onClick={newSentence}>{en ? 'New sentence' : 'Uusi teksti'}</button><button onClick={onBack}>{en ? 'Main menu' : 'Päävalikko'}</button></div></section>}
      {state !== 'finished' && <button className="back-btn" onClick={onBack}>{en ? 'Cancel / back' : 'Keskeytä / takaisin'}</button>}
    </main>
  )
}
