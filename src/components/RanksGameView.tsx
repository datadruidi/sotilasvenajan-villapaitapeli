import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RanksBranchId } from '../data/ranksData'
import type { RankGameEntry, RanksLanguage } from '../lib/ranksLogic'
import {
  checkRanksAnswer,
  generateRanksOptions,
  getCorrectAnswer,
  getRanksPool,
  selectRankFromPool,
} from '../lib/ranksLogic'
import { getRanksReviewEntries, type RanksReviewEntry } from '../lib/reviewListStorage'
import { getAssetUrl } from '../lib/assetUrl'
import { playCorrect, playRoundComplete, playWrong } from '../lib/sound'

const MAX_ROUNDS = 10
const POINTS_PER_CORRECT = 1

interface RanksGameViewProps {
  branch: RanksBranchId
  language: RanksLanguage
  /** When set, use this pool instead of getRanksPool(branch, language). Used for "Käyttäjän kerrattava". */
  initialPool?: RankGameEntry[]
  onAddToRanksReview?: (entry: RankGameEntry) => void
  onRemoveFromRanksReview?: (entry: RankGameEntry) => void
  isRanksReviewList?: boolean
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

const BRANCH_LABEL: Record<RanksBranchId, string> = {
  maavoimat: 'Maavoimat',
  merivoimat: 'Merivoimat',
}

export function RanksGameView({
  branch,
  language,
  initialPool: initialPoolProp,
  onAddToRanksReview,
  onRemoveFromRanksReview,
  isRanksReviewList = false,
  muted,
  onToggleMute,
  onBack,
  onRoundComplete,
}: RanksGameViewProps) {
  const [pool, setPool] = useState<RankGameEntry[]>(initialPoolProp ?? [])
  const [currentEntry, setCurrentEntry] = useState<RankGameEntry | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  /** When onAddToRanksReview is set, track review list so add/remove button updates immediately. */
  const [ranksReviewEntries, setRanksReviewEntries] = useState<RanksReviewEntry[]>(() =>
    onAddToRanksReview || onRemoveFromRanksReview ? getRanksReviewEntries() : []
  )

  useEffect(() => {
    if (onAddToRanksReview || onRemoveFromRanksReview) setRanksReviewEntries(getRanksReviewEntries())
  }, [onAddToRanksReview, onRemoveFromRanksReview])

  const startRound = useCallback(
    (roundNumber: number) => {
      const ranksPool = initialPoolProp != null && initialPoolProp.length > 0 ? initialPoolProp : getRanksPool(branch, language)
      if (initialPoolProp != null && initialPoolProp.length > 0) {
        setPool(initialPoolProp)
      } else {
        setPool(getRanksPool(branch, language))
      }
      const entry = selectRankFromPool(ranksPool)
      if (!entry) {
        setCurrentEntry(null)
        return
      }
      setCurrentEntry(entry)
      setSelectedAnswer(null)
      setShowResult(false)
      setRound(roundNumber)
    },
    [branch, language, initialPoolProp]
  )

  const startNewGame = useCallback(() => {
    setScore(0)
    setGameOver(false)
    startRound(1)
  }, [startRound])

  useEffect(() => {
    if (initialPoolProp != null && initialPoolProp.length > 0) {
      setPool(initialPoolProp)
    }
  }, [initialPoolProp])

  useEffect(() => {
    startRound(1)
  }, [startRound])

  const prevReviewPoolLengthRef = useRef<number | null>(null)
  // When in review mode and parent updates pool (after remove), refresh current question or end game if empty
  useEffect(() => {
    if (!isRanksReviewList || initialPoolProp == null) return
    if (initialPoolProp.length === 0) {
      setGameOver(true)
      setCurrentEntry(null)
      onRoundComplete?.()
      prevReviewPoolLengthRef.current = 0
      return
    }
    if (prevReviewPoolLengthRef.current != null && initialPoolProp.length < prevReviewPoolLengthRef.current) {
      startRound(round)
    }
    prevReviewPoolLengthRef.current = initialPoolProp.length
  }, [initialPoolProp, isRanksReviewList])

  // Derive options and correctAnswer from current language at render time (so Venäjäksi always shows Russian)
  const options = useMemo(() => {
    if (!currentEntry || pool.length === 0) return []
    return generateRanksOptions(currentEntry, pool, language)
  }, [currentEntry, pool, language])

  const correctAnswer = useMemo(
    () => (currentEntry ? getCorrectAnswer(currentEntry, language) : ''),
    [currentEntry, language]
  )

  const handleOptionClick = (option: string) => {
    if (showResult) return
    const isCorrect = checkRanksAnswer(option, correctAnswer)
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
    if (isRanksReviewList) {
      startRound(round + 1)
      return
    }
    if (round >= MAX_ROUNDS) {
      playRoundComplete(muted)
      setGameOver(true)
      setCurrentEntry(null)
      onRoundComplete?.()
      return
    }
    startRound(round + 1)
  }

  const isCurrentInRanksReviewList =
    currentEntry != null &&
    ranksReviewEntries.some(
      (e) => e.branch === currentEntry.branch && e.language === language && e.termFi === currentEntry.termFi
    )

  const handleAddToRanksReview = () => {
    if (currentEntry && onAddToRanksReview) {
      onAddToRanksReview(currentEntry)
      setRanksReviewEntries((prev) => {
        const entry = { branch: currentEntry.branch, language, termFi: currentEntry.termFi }
        if (prev.some((e) => e.branch === entry.branch && e.language === entry.language && e.termFi === entry.termFi)) return prev
        return [...prev, entry]
      })
    }
  }

  const handleRemoveFromRanksReviewInGame = () => {
    if (currentEntry && onRemoveFromRanksReview) {
      onRemoveFromRanksReview(currentEntry)
      setRanksReviewEntries((prev) =>
        prev.filter(
          (e) => !(e.branch === currentEntry.branch && e.language === language && e.termFi === currentEntry.termFi)
        )
      )
    }
  }

  const handleRemoveFromRanksReviewAndAdvance = () => {
    if (currentEntry && onRemoveFromRanksReview) onRemoveFromRanksReview(currentEntry)
  }

  if (pool.length === 0 && !currentEntry && !gameOver) {
    return (
      <div className="app">
        <div className="game-view">
          <h2>Ei sisältöä vielä</h2>
          <p className="session-info">Sotilasarvot — {BRANCH_LABEL[branch]}</p>
          <p className="placeholder-note">
            Lisää kuvia kansioon public/assets/sotilasarvot/{BRANCH_LABEL[branch]}/ (tiedostonimi = suomenkielinen arvo + .jpg)
            ja lisää arvot src/data/ranksData.ts. Aja: node scripts/list-ranks-images.cjs
          </p>
          <button type="button" className="back-btn" onClick={onBack}>
            ← Takaisin alkuun
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
            {isRanksReviewList ? (
              <div className="result-score-line">Oikein: {score}</div>
            ) : (
              <>
                <div className="result-score-line">Kierros: {MAX_ROUNDS}/{MAX_ROUNDS}</div>
                <div className="result-score-line">Oikein: {score}/{MAX_ROUNDS}</div>
              </>
            )}
          </div>
          <img src={getAssetUrl('assets/complete.png')} alt="" className="result-complete-img" />
          <h2 className="result-title">{isRanksReviewList ? 'Kaikki kerrattavat tehty!' : 'Kierros suoritettu!'}</h2>
          <p className="result-message">{isRanksReviewList ? `Oikein ${score} vastausta.` : getAchievementMessage(score)}</p>
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

  if (!currentEntry) return null

  const isCorrect = selectedAnswer !== null && checkRanksAnswer(selectedAnswer, correctAnswer)

  const getOptionState = (option: string) => {
    if (!showResult) return ''
    if (option.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) return 'correct'
    if (option === selectedAnswer && !isCorrect) return 'incorrect'
    return 'revealed'
  }

  const breadcrumb = `Sotilasarvot — ${BRANCH_LABEL[branch]} — ${language === 'fi' ? 'Suomeksi' : 'Venäjäksi'}`

  return (
    <div className="app">
      <div className="game-view game-view-quiz">
        <div className="quiz-header">
          <span className="quiz-breadcrumb">{breadcrumb}</span>
          <div className="quiz-progress">
            <span className="quiz-progress-line">{isRanksReviewList ? `Kierros: ${round}` : `Kierros: ${round}/${MAX_ROUNDS}`}</span>
            <span className="quiz-progress-line">{isRanksReviewList ? `Oikein: ${score}` : `Oikein: ${score}/${MAX_ROUNDS}`}</span>
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

        <div className="quiz-image-wrap">
          <img
            src={getAssetUrl(currentEntry.assetPath)}
            alt="Tunnista sotilasarvo"
            className="quiz-image"
          />
        </div>

        <p className="quiz-prompt">Mikä sotilasarvo tämä on?</p>

        {onAddToRanksReview && currentEntry && !isRanksReviewList && (
          isCurrentInRanksReviewList ? (
            <button type="button" className="quiz-review-btn quiz-review-btn--remove" onClick={handleRemoveFromRanksReviewInGame}>
              Poista arvo kerrattavalta listalta
            </button>
          ) : (
            <button type="button" className="quiz-review-btn quiz-review-btn--add" onClick={handleAddToRanksReview}>
              Lisää arvo kerrattavaan listaan
            </button>
          )
        )}
        {isRanksReviewList && onRemoveFromRanksReview && currentEntry && (
          <button type="button" className="quiz-review-btn quiz-review-btn--remove" onClick={handleRemoveFromRanksReviewAndAdvance}>
            Poista arvo kerrattavalta listalta
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
