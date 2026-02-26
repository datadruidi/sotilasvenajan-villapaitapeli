import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AppLanguage } from '../types/game'
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
  menuTitle: string
  appLanguage: AppLanguage
  initialPool?: RankGameEntry[]
  onAddToRanksReview?: (entry: RankGameEntry) => void
  onRemoveFromRanksReview?: (entry: RankGameEntry) => void
  isRanksReviewList?: boolean
  muted: boolean
  onToggleMute: () => void
  onBack: () => void
  onRoundComplete?: () => void
}

function getAchievementMessage(score: number, appLanguage: AppLanguage): string {
  if (appLanguage === 'eng') {
    if (score >= 10) return 'Perfect score. Excellent work.'
    if (score >= 8) return 'Great work. Almost perfect.'
    if (score >= 6) return 'Good job. Solid result.'
    if (score >= 4) return 'Nice try. Keep practicing.'
    return 'Keep going. You will improve quickly.'
  }
  if (score >= 10) return 'Taydellinen! Olet aivan oikeassa.'
  if (score >= 8) return 'Hienoa! Melkein taydellinen.'
  if (score >= 6) return 'Hyvin tehty! Vakaa suoritus.'
  if (score >= 4) return 'Hyva yritys! Jatka harjoittelua.'
  return 'Jatka vain! Paatset maaraan.'
}

const BRANCH_LABEL: Record<RanksBranchId, { fin: string; eng: string }> = {
  maavoimat: { fin: 'Maavoimat', eng: 'Ground Forces' },
  merivoimat: { fin: 'Merivoimat', eng: 'Navy' },
}

export function RanksGameView({
  branch,
  language,
  menuTitle,
  appLanguage,
  initialPool: initialPoolProp,
  onAddToRanksReview,
  onRemoveFromRanksReview,
  isRanksReviewList = false,
  muted,
  onToggleMute,
  onBack,
  onRoundComplete,
}: RanksGameViewProps) {
  const isEnglish = appLanguage === 'eng'
  const [pool, setPool] = useState<RankGameEntry[]>(initialPoolProp ?? [])
  const [currentEntry, setCurrentEntry] = useState<RankGameEntry | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [ranksReviewEntries, setRanksReviewEntries] = useState<RanksReviewEntry[]>(() =>
    onAddToRanksReview || onRemoveFromRanksReview ? getRanksReviewEntries() : []
  )

  useEffect(() => {
    if (onAddToRanksReview || onRemoveFromRanksReview) setRanksReviewEntries(getRanksReviewEntries())
  }, [onAddToRanksReview, onRemoveFromRanksReview])

  const startRound = useCallback(
    (roundNumber: number) => {
      const ranksPool = initialPoolProp != null && initialPoolProp.length > 0 ? initialPoolProp : getRanksPool(branch, language)
      setPool(ranksPool)
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
  }, [initialPoolProp, isRanksReviewList, onRoundComplete, round, startRound])

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
          <h2>{isEnglish ? 'No content yet' : 'Ei sisaltoa viela'}</h2>
          <p className="session-info">{isEnglish ? 'Military ranks' : 'Sotilasarvot'} - {BRANCH_LABEL[branch][isEnglish ? 'eng' : 'fin']}</p>
          <p className="placeholder-note">
            {isEnglish
              ? `Add images under public/assets/sotilasarvot/${BRANCH_LABEL[branch].fin}/ and add rank entries in src/data/ranksData.ts. Run: node scripts/list-ranks-images.cjs`
              : `Lisaa kuvia kansioon public/assets/sotilasarvot/${BRANCH_LABEL[branch].fin}/ (tiedostonimi = suomenkielinen arvo + .jpg) ja lisaa arvot src/data/ranksData.ts. Aja: node scripts/list-ranks-images.cjs`}
          </p>
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
            {isRanksReviewList ? (
              <div className="result-score-line">{isEnglish ? 'Correct' : 'Oikein'}: {score}</div>
            ) : (
              <>
                <div className="result-score-line">{isEnglish ? 'Round' : 'Kierros'}: {MAX_ROUNDS}/{MAX_ROUNDS}</div>
                <div className="result-score-line">{isEnglish ? 'Correct' : 'Oikein'}: {score}/{MAX_ROUNDS}</div>
              </>
            )}
          </div>
          <img src={getAssetUrl('assets/complete.png')} alt="" className="result-complete-img" />
          <h2 className="result-title">{isRanksReviewList ? (isEnglish ? 'Review list completed!' : 'Kaikki kerrattavat tehty!') : (isEnglish ? 'Round complete!' : 'Kierros suoritettu!')}</h2>
          <p className="result-message">{isRanksReviewList ? (isEnglish ? `${score} correct answers.` : `Oikein ${score} vastausta.`) : getAchievementMessage(score, appLanguage)}</p>
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

  const isCorrect = selectedAnswer !== null && checkRanksAnswer(selectedAnswer, correctAnswer)

  const getOptionState = (option: string) => {
    if (!showResult) return ''
    if (option.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) return 'correct'
    if (option === selectedAnswer && !isCorrect) return 'incorrect'
    return 'revealed'
  }

  return (
    <div className="app">
      <div className="game-view game-view-quiz">
        <div className="quiz-header">
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
          <span className="quiz-title">{menuTitle}</span>
          <div className="quiz-progress quiz-progress-card">
            <span className="quiz-progress-line">{isRanksReviewList ? `${isEnglish ? 'Round' : 'Kierros'}: ${round}` : `${isEnglish ? 'Round' : 'Kierros'}: ${round}/${MAX_ROUNDS}`}</span>
            <span className="quiz-progress-line">{isRanksReviewList ? `${isEnglish ? 'Correct' : 'Oikein'}: ${score}` : `${isEnglish ? 'Correct' : 'Oikein'}: ${score}/${MAX_ROUNDS}`}</span>
          </div>
        </div>

        <div className="quiz-image-wrap">
          <img
            src={getAssetUrl(currentEntry.assetPath)}
            alt={isEnglish ? 'Identify military rank' : 'Tunnista sotilasarvo'}
            className="quiz-image"
          />
        </div>

        <p className="quiz-prompt">{isEnglish ? 'What rank is this?' : 'Mika sotilasarvo tama on?'}</p>

        {onAddToRanksReview && currentEntry && !isRanksReviewList && (
          isCurrentInRanksReviewList ? (
            <button type="button" className="quiz-review-btn quiz-review-btn--remove" onClick={handleRemoveFromRanksReviewInGame}>
              {isEnglish ? 'Remove rank from review list' : 'Poista arvo kerrattavalta listalta'}
            </button>
          ) : (
            <button type="button" className="quiz-review-btn quiz-review-btn--add" onClick={handleAddToRanksReview}>
              {isEnglish ? 'Add rank to review list' : 'Lisaa arvo kerrattavaan listaan'}
            </button>
          )
        )}
        {isRanksReviewList && onRemoveFromRanksReview && currentEntry && (
          <button type="button" className="quiz-review-btn quiz-review-btn--remove" onClick={handleRemoveFromRanksReviewAndAdvance}>
            {isEnglish ? 'Remove rank from review list' : 'Poista arvo kerrattavalta listalta'}
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
