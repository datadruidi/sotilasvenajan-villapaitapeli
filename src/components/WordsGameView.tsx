import { useCallback, useEffect, useState } from 'react'
import type { WordEntry, WordPair, WordCardPrompt, WordsDirection, WordsDifficulty } from '../types/game'
import {
  checkWordAnswer,
  generateWordOptions,
  getPromptAndAnswer,
  isWordCardPrompt,
  shuffleWordPool,
} from '../lib/wordsGameLogic'
import { getAssetUrl } from '../lib/assetUrl'
import { playCorrect, playRoundComplete, playWrong } from '../lib/sound'
import { getReviewList, getLyhenteetReviewList } from '../lib/reviewListStorage'

function isSamePair(a: WordPair, b: WordPair): boolean {
  return a.russian === b.russian && a.finnish === b.finnish
}

function isSameLyhenteet(a: WordCardPrompt, b: WordCardPrompt): boolean {
  return a.prompt === b.prompt && a.correct === b.correct
}

const ROUNDS_PER_GAME = 10
const POINTS_PER_CORRECT = 1

interface WordsGameViewProps {
  direction: WordsDirection
  difficulty: WordsDifficulty
  directionLabel: string
  /** Pre-filtered word pool (e.g. one module). When provided, CSV is not loaded. */
  initialPool?: WordEntry[]
  /** When true (e.g. 1.2 Lyhenteet), prompt text uses same size as option buttons. */
  compactPrompt?: boolean
  /** When set, show "Lisää sana kerrattavaan sanastoon" for current word (1.1.1–1.1.7). */
  onAddToReview?: (pair: WordPair) => void
  /** When true (1.1.8), show "Poista sana kerrattavalta listalta" and call onRemoveFromReview. */
  isReviewList?: boolean
  onRemoveFromReview?: (pair: WordPair) => void
  /** Lyhenteet (1.2): add current abbreviation to user's kerrattava list. */
  onAddToLyhenteetReview?: (entry: WordCardPrompt) => void
  /** Lyhenteet (1.2.7): playing from kerrattava list; show remove and advance on remove. */
  isLyhenteetReviewList?: boolean
  onRemoveFromLyhenteetReview?: (entry: WordCardPrompt) => void
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
  compactPrompt = false,
  onAddToReview,
  isReviewList = false,
  onRemoveFromReview,
  onAddToLyhenteetReview,
  isLyhenteetReviewList = false,
  onRemoveFromLyhenteetReview,
  muted,
  onToggleMute,
  onBack,
  onRoundComplete,
}: WordsGameViewProps) {
  const [pool, setPool] = useState<WordEntry[]>(initialPool ?? [])
  /** Shuffled order of up to 10 words for this game – each word asked at most once per game */
  const [roundOrder, setRoundOrder] = useState<WordEntry[]>([])
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
  /** When onAddToReview is set, track review list so we can show add vs remove and keep in sync. */
  const [reviewList, setReviewList] = useState<WordPair[]>(() => (onAddToReview ? getReviewList() : []))
  /** When onAddToLyhenteetReview is set, track Lyhenteet review list. */
  const [lyhenteetReviewList, setLyhenteetReviewList] = useState<WordCardPrompt[]>(() =>
    onAddToLyhenteetReview ? getLyhenteetReviewList() : []
  )

  const unlimitedRounds = isReviewList || isLyhenteetReviewList
  const maxRounds = roundOrder.length

  useEffect(() => {
    if (onAddToReview) setReviewList(getReviewList())
  }, [onAddToReview])

  useEffect(() => {
    if (onAddToLyhenteetReview) setLyhenteetReviewList(getLyhenteetReviewList())
  }, [onAddToLyhenteetReview])

  useEffect(() => {
    if (initialPool != null && initialPool.length > 0) {
      setPool(initialPool)
      setRoundOrder([])
      setLoading(false)
      setLoadError(null)
      return
    }
    setPool([])
    setRoundOrder([])
    setLoading(false)
    setLoadError(initialPool != null ? 'Sanalistassa täytyy olla vähintään 4 sanaa.' : null)
  }, [initialPool])

  const startRound = useCallback(
    (roundNumber: number, order: WordEntry[]) => {
      if (order.length < 4) return
      const entry = order[roundNumber - 1]
      if (!entry) return
      if (isWordCardPrompt(entry)) {
        setPrompt(entry.prompt)
        setCorrectAnswer(entry.correct)
        setOptions(generateWordOptions(entry.correct, [], direction, entry.wrongOptions))
      } else {
        const { prompt: p, correctAnswer: c } = getPromptAndAnswer(entry, direction)
        const fixedWrong =
          direction === 'fi-ru' ? entry.russianAlts : entry.finnishAlts
        setPrompt(p)
        setCorrectAnswer(c)
        setOptions(generateWordOptions(c, pool, direction, fixedWrong))
      }
      setSelectedAnswer(null)
      setShowResult(false)
      setRound(roundNumber)
    },
    [pool, direction]
  )

  const startNewGame = useCallback(() => {
    setScore(0)
    setGameOver(false)
    const order = unlimitedRounds ? shuffleWordPool(pool) : shuffleWordPool(pool).slice(0, ROUNDS_PER_GAME)
    setRoundOrder(order)
    startRound(1, order)
  }, [pool, startRound, unlimitedRounds])

  useEffect(() => {
    if (pool.length >= 4 && !loading && !gameOver && roundOrder.length === 0) {
      const order = unlimitedRounds ? shuffleWordPool(pool) : shuffleWordPool(pool).slice(0, ROUNDS_PER_GAME)
      setRoundOrder(order)
      startRound(1, order)
    }
  }, [pool.length, loading, gameOver, startRound, pool, unlimitedRounds])

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
    if (round >= maxRounds) {
      if (unlimitedRounds) {
        const extra = shuffleWordPool(pool)
        const newOrder = [...roundOrder, ...extra]
        setRoundOrder(newOrder)
        startRound(round + 1, newOrder)
        return
      }
      playRoundComplete(muted)
      setGameOver(true)
      setPrompt('')
      setOptions([])
      onRoundComplete?.()
      return
    }
    startRound(round + 1, roundOrder)
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
            Lisää sanatiedosto kansioon <strong>public/data/</strong> (UTF-8, sarake A = venäjä, sarake B = suomi).
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
            {unlimitedRounds ? (
              <div className="result-score-line">Oikein: {score}</div>
            ) : (
              <>
                <div className="result-score-line">Kierros: {maxRounds}/{maxRounds}</div>
                <div className="result-score-line">Oikein: {score}/{maxRounds}</div>
              </>
            )}
          </div>
          <img src={getAssetUrl('assets/complete.png')} alt="" className="result-complete-img" />
          <h2 className="result-title">{unlimitedRounds ? 'Kaikki kerrattavat tehty!' : 'Kierros suoritettu!'}</h2>
          <p className="result-message">{unlimitedRounds ? `Oikein ${score} vastausta.` : getAchievementMessage(score)}</p>
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

  const currentEntry = roundOrder[round - 1]
  const currentPair = currentEntry && !isWordCardPrompt(currentEntry) ? (currentEntry as WordPair) : null
  const currentLyhenteetEntry = currentEntry && isWordCardPrompt(currentEntry) ? (currentEntry as WordCardPrompt) : null
  const isCurrentInReviewList = currentPair && reviewList.some((p) => isSamePair(p, currentPair))
  const isCurrentInLyhenteetReviewList =
    currentLyhenteetEntry && lyhenteetReviewList.some((e) => isSameLyhenteet(e, currentLyhenteetEntry))

  const handleAddToReview = () => {
    if (currentPair && onAddToReview) {
      onAddToReview(currentPair)
      setReviewList((prev) => [...prev, currentPair])
    }
  }

  const handleRemoveFromReviewInGame = () => {
    if (!currentPair || !onRemoveFromReview) return
    onRemoveFromReview(currentPair)
    setReviewList((prev) => prev.filter((p) => !isSamePair(p, currentPair)))
  }

  const handleRemoveFromReview = () => {
    if (!currentPair || !onRemoveFromReview) return
    onRemoveFromReview(currentPair)
    const newOrder = roundOrder.filter((_, i) => i !== round - 1)
    setRoundOrder(newOrder)
    if (newOrder.length === 0) {
      setGameOver(true)
      setPrompt('')
      setOptions([])
      onRoundComplete?.()
      return
    }
    if (round > newOrder.length) {
      setGameOver(true)
      setPrompt('')
      setOptions([])
      onRoundComplete?.()
      return
    }
    startRound(round, newOrder)
  }

  const handleAddToLyhenteetReview = () => {
    if (currentLyhenteetEntry && onAddToLyhenteetReview) {
      onAddToLyhenteetReview(currentLyhenteetEntry)
      setLyhenteetReviewList((prev) => [...prev, { ...currentLyhenteetEntry, wrongOptions: [...currentLyhenteetEntry.wrongOptions] }])
    }
  }

  const handleRemoveFromLyhenteetReviewInGame = () => {
    if (!currentLyhenteetEntry || !onRemoveFromLyhenteetReview) return
    onRemoveFromLyhenteetReview(currentLyhenteetEntry)
    setLyhenteetReviewList((prev) => prev.filter((e) => !isSameLyhenteet(e, currentLyhenteetEntry!)))
  }

  const handleRemoveFromLyhenteetReview = () => {
    if (!currentLyhenteetEntry || !onRemoveFromLyhenteetReview) return
    onRemoveFromLyhenteetReview(currentLyhenteetEntry)
    const newOrder = roundOrder.filter((_, i) => i !== round - 1)
    setRoundOrder(newOrder)
    if (newOrder.length === 0) {
      setGameOver(true)
      setPrompt('')
      setOptions([])
      onRoundComplete?.()
      return
    }
    if (round > newOrder.length) {
      setGameOver(true)
      setPrompt('')
      setOptions([])
      onRoundComplete?.()
      return
    }
    startRound(round, newOrder)
  }

  return (
    <div className="app">
      <div className="game-view game-view-quiz">
        <div className="quiz-header">
          <span className="quiz-breadcrumb">Venäjä → Sotilasvenäjän sanasto → {directionLabel}</span>
          <div className="quiz-progress">
            <span className="quiz-progress-line">{unlimitedRounds ? `Kierros: ${round}` : `Kierros: ${round}/${maxRounds}`}</span>
            <span className="quiz-progress-line">{unlimitedRounds ? `Oikein: ${score}` : `Oikein: ${score}/${maxRounds}`}</span>
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

        <div className={`quiz-words-prompt-wrap${compactPrompt ? ' quiz-words-prompt-wrap--compact' : ''}`}>
          <p className="quiz-words-prompt-label">Käännä {promptLabel}</p>
          <p className="quiz-words-prompt" lang={direction === 'fi-ru' ? 'fi' : 'ru'}>
            {prompt}
          </p>
        </div>

        <p className="quiz-prompt">Valitse oikea {answerLabel} käännös</p>

        {onAddToReview && currentPair && !isReviewList && (
          isCurrentInReviewList ? (
            <button type="button" className="quiz-review-btn quiz-review-btn--remove" onClick={handleRemoveFromReviewInGame}>
              Poista sana kerrattavalta listalta
            </button>
          ) : (
            <button type="button" className="quiz-review-btn quiz-review-btn--add" onClick={handleAddToReview}>
              Lisää sana kerrattavaan sanastoon
            </button>
          )
        )}
        {isReviewList && onRemoveFromReview && currentPair && (
          <button type="button" className="quiz-review-btn quiz-review-btn--remove" onClick={handleRemoveFromReview}>
            Poista sana kerrattavalta listalta
          </button>
        )}
        {onAddToLyhenteetReview && currentLyhenteetEntry && !isLyhenteetReviewList && (
          isCurrentInLyhenteetReviewList ? (
            <button type="button" className="quiz-review-btn quiz-review-btn--remove" onClick={handleRemoveFromLyhenteetReviewInGame}>
              Poista lyhenne kerrattavalta listalta
            </button>
          ) : (
            <button type="button" className="quiz-review-btn quiz-review-btn--add" onClick={handleAddToLyhenteetReview}>
              Lisää lyhenne kerrattavaan listaan
            </button>
          )
        )}
        {isLyhenteetReviewList && onRemoveFromLyhenteetReview && currentLyhenteetEntry && (
          <button type="button" className="quiz-review-btn quiz-review-btn--remove" onClick={handleRemoveFromLyhenteetReview}>
            Poista lyhenne kerrattavalta listalta
          </button>
        )}

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
