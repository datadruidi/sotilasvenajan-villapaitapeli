import { useCallback, useEffect, useState } from 'react'
import type { AppLanguage } from '../types/game'
import type { TacticalSignEntry, TacticalSignsSubset } from '../lib/tacticalSignsLogic'
import {
  checkTacticalSignAnswer,
  generateTacticalSignOptions,
  getTacticalSignsPool,
  selectTacticalSignFromPool,
} from '../lib/tacticalSignsLogic'
import { getAssetUrl } from '../lib/assetUrl'
import { playCorrect, playRoundComplete, playWrong } from '../lib/sound'
import { TACTICAL_SIGNS_TRANSLATIONS } from '../data/tacticalSignsTranslations'

const MAX_ROUNDS = 10
const POINTS_PER_CORRECT = 1

interface TacticalSignsGameViewProps {
  subset: TacticalSignsSubset
  menuTitle: string
  appLanguage: AppLanguage
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

export function TacticalSignsGameView({ subset, menuTitle, appLanguage, muted, onToggleMute, onBack, onRoundComplete }: TacticalSignsGameViewProps) {
  const isEnglish = appLanguage === 'eng'
  const [pool, setPool] = useState<TacticalSignEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState<TacticalSignEntry | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const startRound = useCallback((roundNumber: number) => {
    const tacticalPool = getTacticalSignsPool(subset)
    setPool(tacticalPool)
    const entry = selectTacticalSignFromPool(tacticalPool)
    if (!entry) {
      setCurrentEntry(null)
      setOptions([])
      return
    }
    setCurrentEntry(entry)
    setOptions(generateTacticalSignOptions(entry, tacticalPool))
    setSelectedAnswer(null)
    setShowResult(false)
    setRound(roundNumber)
  }, [subset])

  const startNewGame = useCallback(() => {
    setScore(0)
    setGameOver(false)
    startRound(1)
  }, [startRound])

  useEffect(() => {
    startRound(1)
  }, [startRound])

  const correctAnswer = currentEntry?.term ?? ''
  const displayTerm = (term: string): string => {
    const translation = TACTICAL_SIGNS_TRANSLATIONS[term]
    if (!translation) return term
    return isEnglish ? (translation.en || translation.fi || term) : (translation.fi || term)
  }

  const handleOptionClick = (option: string) => {
    if (showResult) return
    const isCorrect = checkTacticalSignAnswer(option, correctAnswer)
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
      setCurrentEntry(null)
      onRoundComplete?.()
      return
    }
    startRound(round + 1)
  }

  if (pool.length === 0 && !currentEntry && !gameOver) {
    return (
      <div className="app">
        <div className="game-view">
          <h2>{isEnglish ? 'No content yet' : 'Ei sisaltoa viela'}</h2>
          <p className="session-info">{isEnglish ? 'Tactical signs' : 'Taktiset merkit'}</p>
          <p className="placeholder-note">
            {isEnglish
              ? 'Add images under the proper folder and run from project root: node scripts/list-tactical-signs.cjs'
              : 'Lisaa kuvia oikeaan alakansioon (Sotilasmerkisto tai Joukkojen koko) ja aja projektin juuresta: node scripts/list-tactical-signs.cjs'}
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
            <div className="result-score-line">{isEnglish ? 'Round' : 'Kierros'}: {MAX_ROUNDS}/{MAX_ROUNDS}</div>
            <div className="result-score-line">{isEnglish ? 'Correct' : 'Oikein'}: {score}/{MAX_ROUNDS}</div>
          </div>
          <img src={getAssetUrl('assets/complete.png')} alt="" className="result-complete-img" />
          <h2 className="result-title">{isEnglish ? 'Round complete!' : 'Kierros suoritettu!'}</h2>
          <p className="result-message">{getAchievementMessage(score, appLanguage)}</p>
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

  const isCorrect = selectedAnswer !== null && checkTacticalSignAnswer(selectedAnswer, correctAnswer)

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
            <span className="quiz-progress-line">{isEnglish ? 'Round' : 'Kierros'}: {round}/{MAX_ROUNDS}</span>
            <span className="quiz-progress-line">{isEnglish ? 'Correct' : 'Oikein'}: {score}/{MAX_ROUNDS}</span>
          </div>
        </div>

        <div className="quiz-image-wrap">
          <img
            src={getAssetUrl(currentEntry.assetPath)}
            alt={isEnglish ? 'Identify tactical sign' : 'Tunnista taktinen merkki'}
            className="quiz-image"
          />
        </div>

        <p className="quiz-prompt">{isEnglish ? 'Which tactical sign is this?' : 'Mika taktinen merkki tama on?'}</p>

        <div className="quiz-options">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`quiz-option ${getOptionState(option)}`}
              onClick={() => handleOptionClick(option)}
              disabled={showResult}
            >
              {displayTerm(option)}
            </button>
          ))}
        </div>

        {showResult && (
          <div className={`quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? (
              <>{isEnglish ? 'Correct' : 'Oikein'} - {displayTerm(correctAnswer)}</>
            ) : (
              <>{isEnglish ? 'Correct answer' : 'Oikea vastaus'}: {displayTerm(correctAnswer)}</>
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
