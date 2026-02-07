import { useCallback, useEffect, useState } from 'react'
import type { WordPair, WordsDirection, WordsDifficulty } from '../types/game'
import { loadWordsCSV } from '../lib/wordsData'
import {
  checkWordAnswer,
  generateWordOptions,
  getPromptAndAnswer,
  selectPairFromPool,
} from '../lib/wordsGameLogic'
import { getAssetUrl } from '../lib/assetUrl'
import { playCorrect, playRoundComplete, playWrong } from '../lib/sound'

const MAX_ROUNDS = 10
const POINTS_PER_CORRECT = 1

interface WordsGameViewProps {
  direction: WordsDirection
  difficulty: WordsDifficulty
  directionLabel: string
  /** Pre-filtered word pool (e.g. one module). When provided, CSV is not loaded. */
  initialPool?: WordPair[]
  muted: boolean
  onToggleMute: () => void
  onBack: () => void
  onRoundComplete?: () => void
}

function getAchievementMessage(score: number): string {
  if (score >= 10) return 'Täydellinen! Olet aivan oikeassa.'
  if (score >= 8) return 'Hienoa! Melkein täydellinen.'
  if (score >= 6) return 'Hyvin tehty! Vakaa suoritus.'
  if (score >= 4) return 'Hyvä yritys! Jatka harjoittelua.'
  return 'Jatka vain! Pääset määrään.'
}

export function WordsGameView({
  direction,
  difficulty: _difficulty,
  directionLabel,
  initialPool,
  muted,
  onToggleMute,
  onBack,
  onRoundComplete,
}: WordsGameViewProps) {
  const [pool, setPool] = useState<WordPair[]>(initialPool ?? [])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!initialPool)

  const [prompt, setPrompt] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    if (initialPool != null) {
      setPool(initialPool)
      setLoading(false)
      setLoadError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    loadWordsCSV()
      .then((pairs) => {
        if (!cancelled) setPool(pairs)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [initialPool])

  const startRound = useCallback(
    (roundNumber: number) => {
      if (pool.length < 4) return
      const pair = selectPairFromPool(pool)
      if (!pair) return
      const { prompt: p, correctAnswer: c } = getPromptAndAnswer(pair, direction)
      const opts = generateWordOptions(c, pool, direction)
      setPrompt(p)
      setCorrectAnswer(c)
      setOptions(opts)
      setSelectedAnswer(null)
      setShowResult(false)
      setRound(roundNumber)
    },
    [pool, direction]
  )

  const startNewGame = useCallback(() => {
    setScore(0)
    setGameOver(false)
    startRound(1)
  }, [startRound])

  useEffect(() => {
    if (pool.length >= 4 && !loading && !gameOver) startRound(1)
  }, [pool.length, loading, gameOver, startRound])

  const handleOptionClick = (option: string) => {
    if (showResult) return
    const isCorrect = checkWordAnswer(option, correctAnswer)
    setSelectedAnswer(option)
    setShowResult(true)
    if (isCorrect) {
      setScore((s) => s + POINTS_PER_CORRECT)
      playCorrect(muted)
    } else {
      playWrong(muted)
    }
  }

  const handleNext = () => {
    if (round >= MAX_ROUNDS) {
      playRoundComplete(muted)
      setGameOver(true)
      setPrompt('')
      setOptions([])
      onRoundComplete?.()
      return
    }
    startRound(round + 1)
  }

  if (loading) {
    return (
      <div className="app">
        <div className="game-view">
          <p className="quiz-loading">Ladataan sanoja…</p>
          <button type="button" className="back-btn" onClick={onBack}>
            ← Takaisin
          </button>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="app">
        <div className="game-view">
          <h2>Sanalistaa ei voitu ladata</h2>
          <p className="placeholder-note">{loadError}</p>
          <p className="words-file-hint">
            Lisää tiedosto <strong>military-words.csv</strong> kansioon <strong>public/data/</strong>. Sarake A = venäjä, sarake B = suomi. Käytä UTF-8 -merkistöä.
          </p>
          <button type="button" className="back-btn" onClick={onBack}>
            ← Takaisin
          </button>
        </div>
      </div>
    )
  }

  if (pool.length >= 4 && !gameOver && options.length === 0) {
    return (
      <div className="app">
        <div className="game-view">
          <p className="quiz-loading">Valmistellaan ensimmäistä kysymystä…</p>
          <button type="button" className="back-btn" onClick={onBack}>
            ← Takaisin
          </button>
        </div>
      </div>
    )
  }

  if (pool.length < 4 && !gameOver) {
    return (
      <div className="app">
        <div className="game-view">
          <h2>Liian vähän sanoja</h2>
          <p className="placeholder-note">
            Listassa on {pool.length} paria. Tarvitaan vähintään 4 pelataksesi (1 oikea + 3 väärää vaihtoehtoa).
          </p>
          <button type="button" className="back-btn" onClick={onBack}>
            ← Takaisin
          </button>
        </div>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="app">
        <div className="game-view game-view-result">
          <div className="result-header">
            <button
              type="button"
              className="mute-btn mute-btn-small"
              onClick={onToggleMute}
              title={muted ? 'Äänitä äänet' : 'Mykistä äänet'}
              aria-label={muted ? 'Äänitä äänet' : 'Mykistä äänet'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </div>
          <div className="result-scores">
            <div className="result-score-line">Kierros: {MAX_ROUNDS}/{MAX_ROUNDS}</div>
            <div className="result-score-line">Oikein: {score}/{MAX_ROUNDS}</div>
          </div>
          <img src={getAssetUrl('assets/complete.png')} alt="" className="result-complete-img" />
          <h2 className="result-title">Kierros suoritettu!</h2>
          <p className="result-message">{getAchievementMessage(score)}</p>
          <div className="result-actions">
            <button type="button" className="result-btn result-btn-retry" onClick={startNewGame}>
              Yritä uudelleen
            </button>
            <button type="button" className="result-btn result-btn-menu" onClick={onBack}>
              Päävalikko
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isCorrect = selectedAnswer !== null && checkWordAnswer(selectedAnswer, correctAnswer)

  const getOptionState = (option: string) => {
    if (!showResult) return ''
    if (option === correctAnswer) return 'correct'
    if (option === selectedAnswer && !isCorrect) return 'incorrect'
    return 'revealed'
  }

  const promptLabel = direction === 'fi-ru' ? 'suomesta' : 'venäjästä'
  const answerLabel = direction === 'fi-ru' ? 'venäjänkielinen' : 'suomenkielinen'

  return (
    <div className="app">
      <div className="game-view game-view-quiz">
        <div className="quiz-header">
          <span className="quiz-breadcrumb">Venäjä → Sotilasvenäjän sanasto → {directionLabel}</span>
          <div className="quiz-progress">
            <span className="quiz-progress-line">Kierros: {round}/{MAX_ROUNDS}</span>
            <span className="quiz-progress-line">Oikein: {score}/{MAX_ROUNDS}</span>
          </div>
          <div className="quiz-header-actions">
            <button
              type="button"
              className="mute-btn mute-btn-small"
              onClick={onToggleMute}
              title={muted ? 'Äänitä äänet' : 'Mykistä äänet'}
              aria-label={muted ? 'Äänitä äänet' : 'Mykistä äänet'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <button type="button" className="back-btn back-btn-small" onClick={onBack}>
              ← Takaisin
            </button>
          </div>
        </div>

        <div className="quiz-words-prompt-wrap">
          <p className="quiz-words-prompt-label">Käännä {promptLabel}</p>
          <p className="quiz-words-prompt" lang={direction === 'fi-ru' ? 'fi' : 'ru'}>
            {prompt}
          </p>
        </div>

        <p className="quiz-prompt">Valitse oikea {answerLabel} käännös</p>

        <div className="quiz-options">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`quiz-option ${getOptionState(option)}`}
              onClick={() => handleOptionClick(option)}
              disabled={showResult}
              lang={direction === 'fi-ru' ? 'ru' : 'fi'}
            >
              {option}
            </button>
          ))}
        </div>

        {showResult && (
          <div className={`quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? (
              <>Oikein — {correctAnswer}</>
            ) : (
              <>Oikea vastaus: {correctAnswer}</>
            )}
          </div>
        )}

        {showResult && (
          <button type="button" className="quiz-next-btn" onClick={handleNext}>
            Seuraava kysymys
          </button>
        )}
      </div>
    </div>
  )
}
