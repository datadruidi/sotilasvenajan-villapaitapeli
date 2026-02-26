import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppLanguage } from '../types/game'
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
  menuTitle: string
  appLanguage: AppLanguage
  initialPool?: GarrisonEntry[]
  onAddToGarrisonReview?: (entry: GarrisonEntry) => void
  onRemoveFromGarrisonReview?: (entry: GarrisonEntry) => void
  isGarrisonReviewList?: boolean
  muted: boolean
  onToggleMute: () => void
  onBack: () => void
  onRoundComplete?: () => void
}

function getAchievementMessage(correctCount: number, appLanguage: AppLanguage): string {
  if (appLanguage === 'eng') {
    if (correctCount >= 10) return 'Perfect score. Excellent work.'
    if (correctCount >= 8) return 'Great work. Almost perfect.'
    if (correctCount >= 6) return 'Good job. Solid result.'
    if (correctCount >= 4) return 'Nice try. Keep practicing.'
    return 'Keep going. You will improve quickly.'
  }
  if (correctCount >= 10) return 'Taydellinen! Olet aivan oikeassa.'
  if (correctCount >= 8) return 'Hienoa! Melkein taydellinen.'
  if (correctCount >= 6) return 'Hyvin tehty! Vakaa suoritus.'
  if (correctCount >= 4) return 'Hyva yritys! Jatka harjoittelua.'
  return 'Jatka vain! Paatset maaraan.'
}

export function GarrisonsGameView({
  region,
  menuTitle,
  appLanguage,
  initialPool: initialPoolProp,
  onAddToGarrisonReview,
  onRemoveFromGarrisonReview,
  isGarrisonReviewList = false,
  muted,
  onToggleMute,
  onBack,
  onRoundComplete,
}: GarrisonsGameViewProps) {
  const isEnglish = appLanguage === 'eng'
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
      setPool(garrisonPool)
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
    if (initialPoolProp != null && initialPoolProp.length > 0) setPool(initialPoolProp)
  }, [initialPoolProp])

  useEffect(() => {
    startRound(0)
  }, [startRound])

  const prevReviewPoolLengthRef = useRef<number | null>(null)
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
  }, [initialPoolProp, isGarrisonReviewList, currentRoundIndex, onRoundComplete, startRound])

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
          <h2>{isEnglish ? 'No content yet' : 'Ei sisaltoa viela'}</h2>
          <p className="placeholder-note">{isEnglish ? 'No garrison data found.' : 'Varuskuntadataa ei loytynyt.'}</p>
          <button type="button" className="back-btn" onClick={onBack}>
            {isEnglish ? '<- Back to menu' : '<- Takaisin alkuun'}
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
              title={muted ? (isEnglish ? 'Unmute' : 'Aanita aanet') : (isEnglish ? 'Mute' : 'Mykista aanet')}
              aria-label={muted ? (isEnglish ? 'Unmute' : 'Aanita aanet') : (isEnglish ? 'Mute' : 'Mykista aanet')}
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </div>
          <div className="result-scores">
            {isGarrisonReviewList ? (
              <div className="result-score-line">{isEnglish ? 'Correct' : 'Oikein'}: {correctCount}</div>
            ) : (
              <>
                <div className="result-score-line">{isEnglish ? 'Round' : 'Kierros'}: {MAX_ROUNDS}/{MAX_ROUNDS}</div>
                <div className="result-score-line">{isEnglish ? 'Correct' : 'Oikein'}: {correctCount}/{MAX_ROUNDS}</div>
              </>
            )}
          </div>
          <img src={getAssetUrl('assets/complete.png')} alt="" className="result-complete-img" />
          <h2 className="result-title">{isGarrisonReviewList ? (isEnglish ? 'Review list completed!' : 'Kaikki kerrattavat tehty!') : (isEnglish ? 'Round complete!' : 'Kierros suoritettu!')}</h2>
          <p className="result-message">{isGarrisonReviewList ? (isEnglish ? `${correctCount} correct answers.` : `Oikein ${correctCount} vastausta.`) : getAchievementMessage(correctCount, appLanguage)}</p>
          <div className="result-actions">
            <button type="button" className="result-btn result-btn-retry" onClick={startNewGame}>
              {isEnglish ? 'Try again' : 'Yrita uudelleen'}
            </button>
            <button type="button" className="result-btn result-btn-menu" onClick={onBack}>
              {isEnglish ? 'Main menu' : 'Paavalikko'}
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
          <span className="quiz-title">{menuTitle}</span>
          <div className="quiz-progress quiz-progress-card">
            <span className="quiz-progress-line">{isGarrisonReviewList ? `${isEnglish ? 'Round' : 'Kierros'}: ${displayRound}` : `${isEnglish ? 'Round' : 'Kierros'}: ${displayRound}/${MAX_ROUNDS}`}</span>
            <span className="quiz-progress-line">{isGarrisonReviewList ? `${isEnglish ? 'Correct' : 'Oikein'}: ${correctCount}` : `${isEnglish ? 'Correct' : 'Oikein'}: ${correctCount}/${MAX_ROUNDS}`}</span>
          </div>
          <div className="quiz-header-actions">
            <button type="button" className="back-btn back-btn-small game-home-btn" onClick={onBack} title={isEnglish ? 'Main menu' : 'Paavalikko'} aria-label={isEnglish ? 'Main menu' : 'Paavalikko'}>
              🏠
            </button>
            <button
              type="button"
              className="mute-btn mute-btn-small"
              onClick={onToggleMute}
              title={muted ? (isEnglish ? 'Unmute' : 'Aanita aanet') : (isEnglish ? 'Mute' : 'Mykista aanet')}
              aria-label={muted ? (isEnglish ? 'Unmute' : 'Aanita aanet') : (isEnglish ? 'Mute' : 'Mykista aanet')}
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>

        <div className="quiz-image-wrap">
          <img
            src={getAssetUrl(currentEntry.imagePath)}
            alt={isEnglish ? 'Identify garrison' : 'Tunnista varuskunta'}
            className="quiz-image"
          />
        </div>

        <p className="quiz-prompt">{isEnglish ? 'Name the location pointed by the arrow' : 'Nimea nuolen osoittama joukkojen sijoituspaikka'}</p>

        {onAddToGarrisonReview && currentEntry && !isGarrisonReviewList && (
          isCurrentInGarrisonReviewList ? (
            <button type="button" className="quiz-review-btn quiz-review-btn--remove" onClick={handleRemoveFromGarrisonReviewInGame}>
              {isEnglish ? 'Remove target from review list' : 'Poista kohde kerrattavalta listalta'}
            </button>
          ) : (
            <button type="button" className="quiz-review-btn quiz-review-btn--add" onClick={handleAddToGarrisonReview}>
              {isEnglish ? 'Add target to review list' : 'Lisaa kohde kerrattavaan listaan'}
            </button>
          )
        )}
        {isGarrisonReviewList && onRemoveFromGarrisonReview && currentEntry && (
          <button type="button" className="quiz-review-btn quiz-review-btn--remove" onClick={handleRemoveFromGarrisonReviewAndAdvance}>
            {isEnglish ? 'Remove target from review list' : 'Poista kohde kerrattavalta listalta'}
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
              <>{isEnglish ? 'Correct' : 'Oikein'} - {correctAnswer}</>
            ) : (
              <>{isEnglish ? 'Correct answer' : 'Oikea vastaus'}: {correctAnswer}</>
            )}
          </div>
        )}

        {showResult && (
          <button type="button" className="quiz-next-btn" onClick={handleNext}>
            {isEnglish ? 'Next question' : 'Seuraava kysymys'}
          </button>
        )}
      </div>
    </div>
  )
}
