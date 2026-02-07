import { useEffect, useState } from 'react'
import './App.css'
import { GameView } from './components/GameView'
import { GarrisonsGameView } from './components/GarrisonsGameView'
import { LadataanIkkuna } from './components/LadataanIkkuna'
import { SplashScreen } from './components/SplashScreen'
import { WordsGameView } from './components/WordsGameView'
import { getRoundsKey, getRounds, incrementRounds, formatRoundsDisplay } from './lib/roundsStorage'
import { playButtonClick } from './lib/sound'
import { loadWordsCSV } from './lib/wordsData'
import type { GarrisonRegionId } from './data/garrisonsData'
import type { VehicleBranch, WordPair, WordsDirection, WordsDifficulty } from './types/game'

const WORDS_MODULE_SIZE = 50

type ContentType = 'vehicles' | 'words' | 'garrisons' | 'local-forces' | 'tactical-signs'

/** Branch button id: real branch or placeholder for grayed-out row */
type BranchButtonId = VehicleBranch | 'coming-soon'

const WORDS_DIRECTIONS: { id: WordsDirection; label: string }[] = [
  { id: 'fi-ru', label: 'Suomi → Venäjä' },
  { id: 'ru-fi', label: 'Venäjä → Suomi' },
]

const CONTENT_TYPES: { id: ContentType; label: string; available: boolean }[] = [
  { id: 'words', label: 'Sotilasvenäjän sanasto', available: true },
  { id: 'garrisons', label: 'Lähialueen joukkojen sijoituspaikat', available: true },
  { id: 'vehicles', label: 'Lähialueen joukkojen suorituskyvyt', available: true },
  { id: 'local-forces', label: 'Lähialueen joukot', available: false },
  { id: 'tactical-signs', label: 'Taktiset merkit', available: false },
]

const COMING_SOON_TEXT = 'Julkaistaan kysynnän mukaan'

const BRANCHES: { id: BranchButtonId; label: string; disabled?: boolean }[] = [
  { id: 'navy', label: 'Merivoimat' },
  { id: 'airforce', label: 'Ilmavoimat' },
  { id: 'army', label: 'Maavoimat', disabled: true },
  { id: 'coming-soon', label: 'Dronet', disabled: true },
  { id: 'other', label: 'Muut', disabled: true },
]

const GARRISON_REGIONS: { id: GarrisonRegionId; label: string }[] = [
  { id: 'pohjoinen', label: 'Pohjoinen' },
  { id: 'etela', label: 'Etelä' },
  { id: 'kaliningrad', label: 'Kaliningrad' },
  { id: 'kaikki', label: 'Kaikki' },
]

const MUTE_STORAGE_KEY = 'miliingo-muted'

function App() {
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(MUTE_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<VehicleBranch | null>(null)
  const [selectedWordsDirection, setSelectedWordsDirection] = useState<WordsDirection | null>(null)
  const [selectedWordsModuleIndex, setSelectedWordsModuleIndex] = useState<number | null>(null)
  const [selectedWordsDifficulty, setSelectedWordsDifficulty] = useState<WordsDifficulty | null>(null)
  const [selectedGarrisonRegion, setSelectedGarrisonRegion] = useState<GarrisonRegionId | null>(null)
  const [showSplash, setShowSplash] = useState(true)
  const [view, setView] = useState<'landing' | 'vehicles-game' | 'words-game' | 'garrisons-game'>('landing')
  const [showLadataanIkkuna, setShowLadataanIkkuna] = useState(false)
  const [pendingView, setPendingView] = useState<'vehicles-game' | 'words-game' | 'garrisons-game' | null>(null)

  const [wordsPool, setWordsPool] = useState<WordPair[]>([])
  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev
      try {
        localStorage.setItem(MUTE_STORAGE_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const [wordsLoading, setWordsLoading] = useState(false)
  const [wordsLoadError, setWordsLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedContentType !== 'words') return
    let cancelled = false
    setWordsLoading(true)
    setWordsLoadError(null)
    loadWordsCSV()
      .then((pairs) => {
        if (!cancelled) setWordsPool(pairs)
      })
      .catch((err) => {
        if (!cancelled) setWordsLoadError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setWordsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedContentType])

  const startVehiclesGame = (branch: VehicleBranch) => {
    setSelectedBranch(branch)
    setPendingView('vehicles-game')
    setShowLadataanIkkuna(true)
  }

  const startWordsGame = (difficulty: WordsDifficulty) => {
    setSelectedWordsDifficulty(difficulty)
    setPendingView('words-game')
    setShowLadataanIkkuna(true)
  }

  const startGarrisonsGame = (region: GarrisonRegionId) => {
    setSelectedGarrisonRegion(region)
    setPendingView('garrisons-game')
    setShowLadataanIkkuna(true)
  }

  const finishLadataanIkkuna = () => {
    if (pendingView) setView(pendingView)
    setShowLadataanIkkuna(false)
    setPendingView(null)
  }

  const backToLanding = () => {
    setView('landing')
    setPendingView(null)
    setShowLadataanIkkuna(false)
    setSelectedBranch(null)
    setSelectedContentType(null)
    setSelectedWordsDirection(null)
    setSelectedWordsModuleIndex(null)
    setSelectedWordsDifficulty(null)
    setSelectedGarrisonRegion(null)
  }

  const wordsModuleCount = Math.floor(wordsPool.length / WORDS_MODULE_SIZE)
  const getModulePool = (moduleIndex: number): WordPair[] => {
    const start = moduleIndex * WORDS_MODULE_SIZE
    return wordsPool.slice(start, start + WORDS_MODULE_SIZE)
  }

  const handleSplashPlay = () => {
    setShowSplash(false)
  }

  if (showSplash) {
    return <SplashScreen muted={muted} onPlay={handleSplashPlay} />
  }

  if (view === 'vehicles-game' && selectedBranch) {
    const branchLabel = BRANCHES.find((b) => b.id === selectedBranch)?.label ?? selectedBranch
    const vehiclesKey = getRoundsKey('vehicles', `russia_${selectedBranch}`)
    return (
      <GameView
        country="russia"
        branch={selectedBranch}
        branchLabel={branchLabel}
        muted={muted}
        onToggleMute={toggleMute}
        onBack={backToLanding}
        onRoundComplete={() => incrementRounds(vehiclesKey)}
      />
    )
  }

  if (view === 'garrisons-game' && selectedGarrisonRegion) {
    const garrisonsKey = getRoundsKey('garrisons', selectedGarrisonRegion)
    return (
      <GarrisonsGameView
        region={selectedGarrisonRegion}
        muted={muted}
        onToggleMute={toggleMute}
        onBack={backToLanding}
        onRoundComplete={() => incrementRounds(garrisonsKey)}
      />
    )
  }

  if (view === 'words-game' && selectedWordsDirection != null && selectedWordsDifficulty != null && selectedWordsModuleIndex != null) {
    const directionLabel = WORDS_DIRECTIONS.find((d) => d.id === selectedWordsDirection)?.label ?? selectedWordsDirection
    const initialPool = getModulePool(selectedWordsModuleIndex)
    const wordsKey = getRoundsKey('words', `${selectedWordsDirection}_${selectedWordsModuleIndex}`)
    return (
      <WordsGameView
        direction={selectedWordsDirection}
        difficulty={selectedWordsDifficulty}
        directionLabel={directionLabel}
        initialPool={initialPool}
        muted={muted}
        onToggleMute={toggleMute}
        onBack={backToLanding}
        onRoundComplete={() => incrementRounds(wordsKey)}
      />
    )
  }

  return (
    <>
    <div className="app landing">
      <header className="landing-header">
        <h1 className="title">Sotilasvenäjän villapaitapeli</h1>
        <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="" className="landing-header-logo" />
        <button
          type="button"
          className="mute-btn"
          onClick={toggleMute}
          title={muted ? 'Äänitä äänet' : 'Mykistä äänet'}
          aria-label={muted ? 'Äänitä äänet' : 'Mykistä äänet'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </header>

      <div className="landing-scroll">
      {/* Content type */}
      <section className="section">
          <h2 className="section-heading">Sisältötyyppi</h2>
          <div className="options-grid">
            {CONTENT_TYPES.map((ct) => (
              <button
                key={ct.id}
                type="button"
                className={`option-btn ${ct.available ? '' : 'disabled'}`}
                onClick={() => {
                  if (!ct.available) return
                  playButtonClick(muted)
                  setSelectedContentType(ct.id)
                }}
                disabled={!ct.available}
              >
                {ct.label}
                {!ct.available && <span className="coming-soon-inline"> — {COMING_SOON_TEXT}</span>}
              </button>
            ))}
          </div>
        </section>

      {/* Garrison regions – after Lähialueen joukkojen sijoituspaikat selected */}
      {selectedContentType === 'garrisons' && (
        <section className="section">
          <h2 className="section-heading">Alue</h2>
          <div className="options-grid">
            {GARRISON_REGIONS.map((r) => {
              const garrisonsKey = getRoundsKey('garrisons', r.id)
              const rounds = getRounds(garrisonsKey)
              const roundsDisplay = formatRoundsDisplay(rounds)
              return (
                <button
                  key={r.id}
                  type="button"
                  className="option-btn option-btn-with-rounds"
                  onClick={() => {
                    playButtonClick(muted)
                    startGarrisonsGame(r.id)
                  }}
                >
                  <span className="option-btn-label">{r.label}</span>
                  <span className="option-rounds">{roundsDisplay}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Words: Direction – after Sotilasvenäjän sanasto */}
      {selectedContentType === 'words' && (
        <section className="section">
          <h2 className="section-heading">Käännössuunta</h2>
          <div className="options-grid">
            {WORDS_DIRECTIONS.map((d) => (
              <button
                key={d.id}
                type="button"
                className="option-btn"
                onClick={() => {
                  playButtonClick(muted)
                  setSelectedWordsDirection(d.id)
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
          {wordsLoading && <p className="words-loading-inline">Ladataan sanalistaa…</p>}
          {wordsLoadError && (
            <p className="words-file-hint-inline">
              Sanalistaa ei voitu ladata. Lisää tiedosto <strong>public/data/military-words.csv</strong> (UTF-8, A=venäjä, B=suomi).
            </p>
          )}
        </section>
      )}

      {/* Words: Module (1-50, 51-100, …) – after direction, when words loaded */}
      {selectedContentType === 'words' && selectedWordsDirection && !wordsLoading && wordsPool.length > 0 && (
        <section className="section">
          <h2 className="section-heading">Valitse moduuli</h2>
          <div className="options-grid options-grid-modules">
            {Array.from({ length: wordsModuleCount }, (_, i) => {
              const start = i * WORDS_MODULE_SIZE + 1
              const end = Math.min((i + 1) * WORDS_MODULE_SIZE, wordsPool.length)
              const pool = getModulePool(i)
              const disabled = pool.length < 4
              const wordsKey = selectedWordsDirection ? getRoundsKey('words', `${selectedWordsDirection}_${i}`) : ''
              const roundsDisplay = !disabled && wordsKey ? formatRoundsDisplay(getRounds(wordsKey)) : null
              return (
                <button
                  key={i}
                  type="button"
                  className={`option-btn ${disabled ? 'disabled' : 'option-btn-with-rounds'}`}
                  onClick={() => {
                    if (!disabled) {
                      playButtonClick(muted)
                      setSelectedWordsModuleIndex(i)
                      startWordsGame('easy')
                    }
                  }}
                  disabled={disabled}
                >
                  <span className="option-btn-label">
                    Sanat {start}–{end}
                    {disabled && <span className="coming-soon-inline"> (vähintään 4 sanaa)</span>}
                  </span>
                  {roundsDisplay != null && <span className="option-rounds">{roundsDisplay}</span>}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Coming soon message for content types not yet implemented */}
      {(selectedContentType === 'local-forces' || selectedContentType === 'tactical-signs') && (
        <section className="section">
          <p className="coming-soon-message">{COMING_SOON_TEXT}</p>
        </section>
      )}

      {/* Kaluston osasto – after Lähialueen joukkojen suorituskyvyt selected */}
      {selectedContentType === 'vehicles' && (
        <section className="section">
          <h2 className="section-heading">Kaluston osasto</h2>
          <div className="options-grid">
            {BRANCHES.map((b) => {
              const isDisabled = b.disabled || b.id === 'coming-soon'
              const vehiclesKey = b.id !== 'coming-soon' ? getRoundsKey('vehicles', `russia_${b.id}`) : null
              const rounds = vehiclesKey != null ? getRounds(vehiclesKey) : 0
              const roundsDisplay = formatRoundsDisplay(rounds)
              return (
                <button
                  key={b.id}
                  type="button"
                  className={`option-btn branch option-btn-with-rounds ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => {
                    if (isDisabled) return
                    playButtonClick(muted)
                    startVehiclesGame(b.id as VehicleBranch)
                  }}
                  disabled={isDisabled}
                >
                  <span className="option-btn-label">{b.label}</span>
                  <span className={isDisabled ? 'option-rounds option-rounds-disabled' : 'option-rounds'}>
                    {isDisabled ? COMING_SOON_TEXT : roundsDisplay}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}
      </div>
    </div>
    {showLadataanIkkuna && pendingView && (
      <LadataanIkkuna muted={muted} onComplete={finishLadataanIkkuna} />
    )}
    </>
  )
}

export default App
