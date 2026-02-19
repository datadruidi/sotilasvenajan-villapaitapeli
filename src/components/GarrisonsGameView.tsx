import { useCallback, useEffect, useRef, useState } from 'react'
import type { GarrisonEntry, GarrisonRegionId } from '../data/garrisonsData'
import { getAssetUrl } from '../lib/assetUrl'
import {
  checkGarrisonAnswer,
  generateGarrisonOptions,
  getGarrisonsPool,
  selectGarrisonFromPool,
} from '../lib/garrisonsGameLogic'
import { getGarrisonsReviewIds } from '../lib/reviewListStorage'
import { playCorrect, playRoundComplete, playWrong } from '../lib/sound'

const MAX_ROUNDS = 10
const POINTS_PER_CORRECT = 1

interface GarrisonsGameViewProps {
  region: GarrisonRegionId
  /** When set, use this pool instead of getGarrisonsPool(region). Used for "Käyttäjän kerrattava". */
  initialPool?: GarrisonEntry[]
  onAddToGarrisonReview?: (entry: GarrisonEntry) => void
  onRemoveFromGarrisonReview?: (entry: GarrisonEntry) => void
  isGarrisonReviewList?: boolean
  muted: boolean
  onToggleMute: () => void
  onBack: () => void
  onRoundComplete?: () => void
}

function getAchievementMessage(correctCount: number): string {
  if (correctCount >= 10) return 'Täydellinen! Olet aivan oikeassa.'
  if (correctCount >= 8) return 'Hienoa! Melkein täydellinen.'
  if (correctCount >= 6) return 'Hyvin tehty! Vakaa suoritus.'
  if (correctCount >= 4) return 'Hyvä yritys! Jatka harjoittelua.'
  return 'Jatka vain! Pääset määrään.'
}

export function GarrisonsGameView({
  region,
  initialPool: initialPoolProp,
  onAddToGarrisonReview,
  onRemoveFromGarrisonReview,
  isGarrisonReviewList = false,
  muted,
  onToggleMute,
  onBack,
  onRoundComplete,
}: GarrisonsGameViewProps) {
  const [pool, setPool] = useState<GarrisonEntry[]>(initialPoolProp ?? [])
  const [currentEntry, setCurrentEntry] = useState<GarrisonEntry | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const startRound = useCallback(
    (roundIndex: number) => {
      const garrisonPool = initialPoolProp != null && initialPoolProp.length > 0 ? initialPoolProp : getGarrisonsPool(region)
      if (initialPoolProp != null && initialPoolProp.length > 0) {
        setPool(initialPoolProp)
      } else {
        setPool(garrisonPool)
      }
      const entry = selectGarrisonFromPool(garrisonPool)
      if (!entry) {
        setCurrentEntry(null)
        setOptions([])
        return
      }
      setCurrentEntry(entry)
      setOptions(generateGarrisonOptions(entry, garrisonPool))
      setSelectedAnswer(null)
      setShowResult(false)
      setCurrentRoundIndex(roundIndex)
    },
    [region, initialPoolProp]
  )

  const startNewGame = useCallback(() => {
    setCorrectCount(0)
    setGameOver(false)
    startRound(0)
  }, [startRound])

  useEffect(() => {
    if (initialPoolProp != null && initialPoolProp.length > 0) {
      setPool(initialPoolProp)
    }
  }, [initialPoolProp])

  useEffect(() => {
    startRound(0)
  }, [startRound])

  const prevReviewPoolLengthRef = useRef<number | null>(null)
  // When in review mode and parent updates pool (after remove), refresh current question or end game if empty
  useEffect(() => {
    if (!isGarrisonReviewList || initialPoolProp == null) return
    if (initialPoolProp.length === 0) {
      setGameOver(true)
      setCurrentEntry(null)
      setOptions([])
      onRoundComplete?.()
      prevReviewPoolLengthRef.current = 0
      return
    }
    if (prevReviewPoolLengthRef.current != null && initialPoolProp.length < prevReviewPoolLengthRef.current) {
      startRound(currentRoundIndex)
    }
    prevReviewPoolLengthRef.current = initialPoolProp.length
  }, [initialPoolProp, isGarrisonReviewList])

  const handleOptionClick = (option: string) => {
    if (showResult) return
    const correctAnswer = currentEntry?.correctAnswer ?? ''
    const isCorrect = checkGarrisonAnswer(option, correctAnswer)
    setSelectedAnswer(option)
    setShowResult(true)
    if (isCorrect) {
      setCorrectCount((c) => c + POINTS_PER_CORRECT)
      playCorrect(muted)
    } else {
      playWrong(muted)
    }
  }

  const handleNext = () => {
    if (isGarrisonReviewList) {
      startRound(currentRoundIndex + 1)
      return
    }
    if (currentRoundIndex >= MAX_ROUNDS - 1) {
      playRoundComplete(muted)
      setGameOver(true)
      setCurrentEntry(null)
      onRoundComplete?.()
      return
    }
    startRound(currentRoundIndex + 1)
  }

  const garrisonReviewIds = onAddToGarrisonReview || onRemoveFromGarrisonReview ? getGarrisonsReviewIds() : []
  const isCurrentInGarrisonReviewList = currentEntry != null && garrisonReviewIds.includes(currentEntry.id)

  const handleAddToGarrisonReview = () => {
    if (currentEntry && onAddToGarrisonReview) onAddToGarrisonReview(currentEntry)
  }

  const handleRemoveFromGarrisonReviewInGame = () => {
    if (currentEntry && onRemoveFromGarrisonReview) onRemoveFromGarrisonReview(currentEntry)
  }

  const handleRemoveFromGarrisonReviewAndAdvance = () => {
    if (currentEntry && onRemoveFromGarrisonReview) onRemoveFromGarrisonReview(currentEntry)
  }

  if (pool.length === 0 && !currentEntry && !gameOver) {
    return (
      <div className="app">
        <div className="game-view">
          <h2>Ei sisältöä vielä</h2>
          <p className="placeholder-note">Varuskuntadataa ei löytynyt.</p>
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
            {isGarrisonReviewList ? (
              <div className="result-score-line">Oikein: {correctCount}</div>
            ) : (
              <>
                <div className="result-score-line">Kierros: {MAX_ROUNDS}/{MAX_ROUNDS}</div>
                <div className="result-score-line">Oikein: {correctCount}/{MAX_ROUNDS}</div>
              </>
            )}
          </div>
          <img src={getAssetUrl('assets/complete.png')} alt="" className="result-complete-img" />
          <h2 className="result-title">{isGarrisonReviewList ? 'Kaikki kerrattavat tehty!' : 'Kierros suoritettu!'}</h2>
          <p className="result-message">{isGarrisonReviewList ? `Oikein ${correctCount} vastausta.` : getAchievementMessage(correctCount)}</p>
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

  const correctAnswer = currentEntry.correctAnswer
  const isCorrect = selectedAnswer !== null && checkGarrisonAnswer(selectedAnswer, correctAnswer)
  const displayRound = currentRoundIndex + 1

  const getOptionState = (option: string) => {
    if (!showResult) return ''
    if (option === correctAnswer) return 'correct'
    if (option === selectedAnswer && !isCorrect) return 'incorrect'
    return 'revealed'
  }

  return (
    <div className="app">
      <div className="game-view game-view-quiz">
        <div className="quiz-header">
          <span className="quiz-breadcrumb">Venäjä → Sotilaspiirit</span>
          <div className="quiz-progress">
            <span className="quiz-progress-line">{isGarrisonReviewList ? `Kierros: ${displayRound}` : `Kierros: ${displayRound}/${MAX_ROUNDS}`}</span>
            <span className="quiz-progress-line">{isGarrisonReviewList ? `Oikein: ${correctCount}` : `Oikein: ${correctCount}/${MAX_ROUNDS}`}</span>
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
            src={getAssetUrl(currentEntry.imagePath)}
            alt="Tunnista varuskunta"
            className="quiz-image"
          />
        </div>

        <p className="quiz-prompt">Nimeä nuolen osoittama joukkojen sijoituspaikka</p>

        {onAddToGarrisonReview && currentEntry && !isGarrisonReviewList && (
          isCurrentInGarrisonReviewList ? (
            <button type="button" className="quiz-review-btn quiz-review-btn--remove" onClick={handleRemoveFromGarrisonReviewInGame}>
              Poista kohde kerrattavalta listalta
            </button>
          ) : (
            <button type="button" className="quiz-review-btn quiz-review-btn--add" onClick={handleAddToGarrisonReview}>
              Lisää kohde kerrattavaan listaan
            </button>
          )
        )}
        {isGarrisonReviewList && onRemoveFromGarrisonReview && currentEntry && (
          <button type="button" className="quiz-review-btn quiz-review-btn--remove" onClick={handleRemoveFromGarrisonReviewAndAdvance}>
            Poista kohde kerrattavalta listalta
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
