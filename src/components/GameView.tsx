import { useCallback, useEffect, useState } from 'react'
import type { CountryId, ImageEntry, NavySubMode, VehicleBranch } from '../types/game'
import {
  checkAnswer,
  formatVesselName,
  generateOptions,
  getCorrectAnswer,
  getFilteredPool,
  normalizeClassLabel,
  selectImageFromPool,
} from '../lib/gameLogic'
import { getAssetUrl } from '../lib/assetUrl'
import { playCorrect, playRoundComplete, playWrong } from '../lib/sound'

const MAX_ROUNDS = 10
const POINTS_PER_CORRECT = 1

interface GameViewProps {
  country: CountryId
  branch: VehicleBranch
  branchLabel: string
  /** Navy only: quiz by vessel class (Alusluokat) or vessel name (Alusten nimet). */
  navySubMode?: NavySubMode
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

export function GameView({ country, branch, branchLabel, navySubMode, muted, onToggleMute, onBack, onRoundComplete }: GameViewProps) {
  const [pool, setPool] = useState<ImageEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState<ImageEntry | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const startRound = useCallback((roundNumber: number) => {
    const filtered = getFilteredPool(country, branch, navySubMode)
    setPool(filtered)
    const entry = selectImageFromPool(filtered)
    if (!entry) {
      setCurrentEntry(null)
      setOptions([])
      return
    }
    setCurrentEntry(entry)
    setOptions(generateOptions(entry, filtered, navySubMode))
    setSelectedAnswer(null)
    setShowResult(false)
    setRound(roundNumber)
  }, [country, branch, navySubMode])

  const startNewGame = useCallback(() => {
    setScore(0)
    setGameOver(false)
    startRound(1)
  }, [startRound])

  useEffect(() => {
    startRound(1)
  }, [startRound])

  const isVesselNameMode = branch === 'navy' && navySubMode === 'vesselName'
  const correctAnswer = currentEntry ? getCorrectAnswer(currentEntry, navySubMode) : ''

  const handleOptionClick = (option: string) => {
    if (showResult) return
    const isCorrect = checkAnswer(option, correctAnswer, isVesselNameMode)
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

  const sessionInfo =
    branch === 'navy' && navySubMode
      ? `Venäjä → Lähialueen joukkojen suorituskyvyt → ${branchLabel} → ${navySubMode === 'class' ? 'Alusluokat' : 'Alusten nimet'}`
      : `Venäjä → Lähialueen joukkojen suorituskyvyt → ${branchLabel}`

  if (pool.length === 0 && !currentEntry && !gameOver) {
    return (
      <div className="app">
        <div className="game-view">
          <h2>Ei sisältöä vielä</h2>
          <p className="session-info">
            {sessionInfo}
          </p>
          <p className="placeholder-note">
            Tälle maalle ja osastolle ei ole kuvia rekisterissä. Lisää kuvia rekisteriin pelataksesi.
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

  if (!currentEntry) return null

  const isCorrect = selectedAnswer !== null && checkAnswer(selectedAnswer, correctAnswer, isVesselNameMode)

  const getOptionState = (option: string) => {
    if (!showResult) return ''
    const norm = isVesselNameMode ? (s: string) => s.trim().toLowerCase() : (s: string) => normalizeClassLabel(s)
    if (norm(option) === norm(correctAnswer)) return 'correct'
    if (option === selectedAnswer && !isCorrect) return 'incorrect'
    return 'revealed'
  }

  const quizPrompt = isVesselNameMode ? 'Mikä aluksen nimi on?' : 'Mikä alusluokka tämä on?'
  const formatOption = (opt: string) => (isVesselNameMode ? formatVesselName(opt) : normalizeClassLabel(opt))

  return (
    <div className="app">
      <div className="game-view game-view-quiz">
        <div className="quiz-header">
          <span className="quiz-breadcrumb">{sessionInfo}</span>
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

        <div className="quiz-image-wrap">
          <img
            src={getAssetUrl(currentEntry.assetPath)}
            alt="Tunnista alusluokka"
            className="quiz-image"
          />
        </div>

        <p className="quiz-prompt">{quizPrompt}</p>

        <div className="quiz-options">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`quiz-option ${getOptionState(option)}`}
              onClick={() => handleOptionClick(option)}
              disabled={showResult}
            >
              {formatOption(option)}
            </button>
          ))}
        </div>

        {showResult && (
          <div className={`quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? (
              <>Oikein — {formatOption(correctAnswer)}</>
            ) : (
              <>Oikea vastaus: {formatOption(correctAnswer)}</>
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
