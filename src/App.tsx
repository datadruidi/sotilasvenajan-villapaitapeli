import { useEffect, useRef, useState } from 'react'
import './App.css'
import { GameView } from './components/GameView'
import { GarrisonsGameView } from './components/GarrisonsGameView'
import { LadataanIkkuna } from './components/LadataanIkkuna'
import { RanksGameView } from './components/RanksGameView'
import { TacticalSignsGameView } from './components/TacticalSignsGameView'
import { SplashScreen } from './components/SplashScreen'
import { WordsGameView } from './components/WordsGameView'
import { getRoundsKey, getRounds, incrementRounds, formatRoundsDisplay } from './lib/roundsStorage'
import { playButtonClick } from './lib/sound'
import { loadWordsCSV } from './lib/wordsData'
import type { WordsListId } from './lib/wordsData'
import type { GarrisonRegionId } from './data/garrisonsData'
import type { RanksBranchId } from './data/ranksData'
import type { RanksLanguage } from './lib/ranksLogic'
import type { NavySubMode, VehicleBranch, WordPair, WordsDirection, WordsDifficulty } from './types/game'

const WORDS_MODULE_SIZE = 50

type ContentType = 'vehicles' | 'words' | 'garrisons' | 'local-forces' | 'tactical-signs' | 'ranks' | 'venajan-asevoimat'

/** Branch button id: real branch or placeholder for grayed-out row */
type BranchButtonId = VehicleBranch | 'coming-soon' | 'strategic-missile' | 'airborne' | 'uav-systems'

const WORDS_DIRECTIONS: { id: WordsDirection; label: string }[] = [
  { id: 'fi-ru', label: '1.1. Suomi → Venäjä' },
  { id: 'ru-fi', label: '1.2. Venäjä → Suomi' },
]

const CONTENT_TYPES: { id: ContentType; label: string; available: boolean }[] = [
  { id: 'words', label: '1. Sotilasvenäjän sanasto', available: true },
  { id: 'venajan-asevoimat', label: '2. Venäjän asevoimat', available: true },
  { id: 'ranks', label: '3. Sotilasarvot', available: true },
  { id: 'tactical-signs', label: '4. Taktiset merkit', available: true },
]

/** Sub-options under Venäjän asevoimat (same structure as before, just grouped) */
const VENAJAN_ASEVOIMAT_OPTIONS: { id: ContentType; label: string; available: boolean }[] = [
  { id: 'garrisons', label: '2.1. Sotilaspiirit', available: true },
  { id: 'vehicles', label: '2.2. Puolustushaarojen suorituskyvyt', available: true },
  { id: 'local-forces', label: '2.3. Lähialueen joukot', available: false },
]

const COMING_SOON_TEXT = 'Julkaistaan kysynnän mukaan'

const BRANCHES: { id: BranchButtonId; label: string; disabled?: boolean }[] = [
  { id: 'navy', label: '2.2.1. Merivoimat' },
  { id: 'airforce', label: '2.2.2. Ilma- ja avaruusvoimat', disabled: true },
  { id: 'army', label: '2.2.3. Maavoimat', disabled: true },
  { id: 'strategic-missile', label: '2.2.4. Strategiset ohjusjoukot', disabled: true },
  { id: 'airborne', label: '2.2.5. Maahanlaskujoukot', disabled: true },
  { id: 'uav-systems', label: '2.2.6. Miehittämättömien järjestelmien joukot', disabled: true },
]

/** Military districts under Sotilaspiirit; only Leningrad is selectable and shows the 4 responsibility areas */
const GARRISON_DISTRICTS: { id: string; label: string; disabled: boolean }[] = [
  { id: 'leningrad', label: '2.1.1. Leningradin sotilaspiiri', disabled: false },
  { id: 'moscow', label: '2.1.2. Moskovan sotilaspiiri', disabled: true },
  { id: 'southern', label: '2.1.3. Eteläinen sotilaspiiri', disabled: true },
  { id: 'central', label: '2.1.4. Keskinen sotilaspiiri', disabled: true },
  { id: 'eastern', label: '2.1.5. Itäinen sotilaspiiri', disabled: true },
  { id: 'badges', label: '2.1.6. Sotilaspiirien tunnukset', disabled: true },
]

const GARRISON_REGIONS: { id: GarrisonRegionId; label: string }[] = [
  { id: 'pohjoinen', label: '2.1.1.1. Pohjoinen vastuualue' },
  { id: 'etela', label: '2.1.1.2. Eteläinen vastuualue' },
  { id: 'kaliningrad', label: '2.1.1.3. Kaliningradin vastuualue' },
  { id: 'kaikki', label: '2.1.1.4. Kaikki yhdessä' },
]

const MUTE_STORAGE_KEY = 'miliingo-muted'
const INTRO_2_URL = `${import.meta.env.BASE_URL}audio/intro_2.mp3`

function App() {
  const intro2AudioRef = useRef<HTMLAudioElement | null>(null)
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(MUTE_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<VehicleBranch | null>(null)
  const [selectedNavySubMode, setSelectedNavySubMode] = useState<NavySubMode | null>(null)
  const [selectedWordsDirection, setSelectedWordsDirection] = useState<WordsDirection | null>(null)
  const [selectedWordsModuleIndex, setSelectedWordsModuleIndex] = useState<number | null>(null)
  const [selectedWordsDifficulty, setSelectedWordsDifficulty] = useState<WordsDifficulty | null>(null)
  const [selectedGarrisonRegion, setSelectedGarrisonRegion] = useState<GarrisonRegionId | null>(null)
  const [selectedGarrisonDistrict, setSelectedGarrisonDistrict] = useState<string | null>(null)
  const [selectedTacticalSignsSubset, setSelectedTacticalSignsSubset] = useState<'sotilasmerkisto' | 'joukkojen-koko' | null>(null)
  const [selectedRanksBranch, setSelectedRanksBranch] = useState<RanksBranchId | null>(null)
  const [selectedRanksLanguage, setSelectedRanksLanguage] = useState<RanksLanguage | null>(null)
  const [showSplash, setShowSplash] = useState(true)
  const [view, setView] = useState<'landing' | 'vehicles-game' | 'words-game' | 'garrisons-game' | 'tactical-signs-game' | 'ranks-game'>('landing')
  const [showLadataanIkkuna, setShowLadataanIkkuna] = useState(false)
  const [pendingView, setPendingView] = useState<'vehicles-game' | 'words-game' | 'garrisons-game' | 'tactical-signs-game' | 'ranks-game' | null>(null)

  const [wordsPool, setWordsPool] = useState<WordPair[]>([])
  const [selectedWordsList, setSelectedWordsList] = useState<WordsListId | null>(null)
  const [alkeetPool, setAlkeetPool] = useState<WordPair[]>([])
  const [alkeetLoading, setAlkeetLoading] = useState(false)
  const [alkeetLoadError, setAlkeetLoadError] = useState<string | null>(null)
  const startAlkeetGameWhenLoadedRef = useRef(false)
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
    if (showSplash) {
      if (intro2AudioRef.current) {
        intro2AudioRef.current.pause()
        intro2AudioRef.current.currentTime = 0
        intro2AudioRef.current = null
      }
      return
    }
    if (muted) return
    const audio = new Audio(INTRO_2_URL)
    intro2AudioRef.current = audio
    audio.volume = 0.7
    audio.play().catch(() => {})
    return () => {
      audio.pause()
      audio.currentTime = 0
      intro2AudioRef.current = null
    }
  }, [showSplash, muted])

  const handleLandingLogoClick = () => {
    if (muted) return
    if (intro2AudioRef.current) {
      intro2AudioRef.current.currentTime = 0
      intro2AudioRef.current.play().catch(() => {})
    } else {
      const audio = new Audio(INTRO_2_URL)
      intro2AudioRef.current = audio
      audio.volume = 0.7
      audio.play().catch(() => {})
    }
  }

  useEffect(() => {
    if (selectedContentType !== 'words') return
    let cancelled = false
    setWordsLoading(true)
    setWordsLoadError(null)
    loadWordsCSV('sanasto')
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

  useEffect(() => {
    if (selectedWordsList !== 'rintamavenajan-alkeet' || selectedContentType !== 'words') return
    let cancelled = false
    setAlkeetLoading(true)
    setAlkeetLoadError(null)
    loadWordsCSV('rintamavenajan-alkeet')
      .then((pairs) => {
        if (!cancelled) {
          setAlkeetPool(pairs)
          if (startAlkeetGameWhenLoadedRef.current && pairs.length >= 4) {
            startAlkeetGameWhenLoadedRef.current = false
            setSelectedWordsModuleIndex(0)
            setSelectedWordsDifficulty('easy')
            setPendingView('words-game')
            setShowLadataanIkkuna(true)
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAlkeetLoadError(err instanceof Error ? err.message : String(err))
          startAlkeetGameWhenLoadedRef.current = false
        }
      })
      .finally(() => {
        if (!cancelled) setAlkeetLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedWordsList, selectedContentType])

  const startVehiclesGame = (branch: VehicleBranch, navySubMode?: NavySubMode) => {
    setSelectedBranch(branch)
    setSelectedNavySubMode(navySubMode ?? null)
    setPendingView('vehicles-game')
    setShowLadataanIkkuna(true)
  }

  const startNavySubMode = (mode: NavySubMode) => {
    setSelectedNavySubMode(mode)
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

  const startTacticalSignsGame = (subset: 'sotilasmerkisto' | 'joukkojen-koko') => {
    setSelectedTacticalSignsSubset(subset)
    setPendingView('tactical-signs-game')
    setShowLadataanIkkuna(true)
  }

  const startRanksGame = (branch: RanksBranchId, language: RanksLanguage) => {
    setSelectedRanksBranch(branch)
    setSelectedRanksLanguage(language)
    setPendingView('ranks-game')
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
    setSelectedNavySubMode(null)
    setSelectedWordsList(null)
    setSelectedContentType(null)
    setSelectedWordsDirection(null)
    setSelectedWordsModuleIndex(null)
    setSelectedWordsDifficulty(null)
    setSelectedGarrisonRegion(null)
    setSelectedGarrisonDistrict(null)
    setSelectedTacticalSignsSubset(null)
    setSelectedRanksBranch(null)
    setSelectedRanksLanguage(null)
  }

  const currentWordsPool = selectedWordsList === 'rintamavenajan-alkeet' ? alkeetPool : wordsPool
  const wordsModuleCount =
    currentWordsPool.length === 0 ? 0 : Math.ceil(currentWordsPool.length / WORDS_MODULE_SIZE)
  const getModulePool = (moduleIndex: number): WordPair[] => {
    const start = moduleIndex * WORDS_MODULE_SIZE
    return currentWordsPool.slice(start, start + WORDS_MODULE_SIZE)
  }

  const handleSplashPlay = () => {
    setShowSplash(false)
  }

  if (showSplash) {
    return <SplashScreen muted={muted} onPlay={handleSplashPlay} />
  }

  if (view === 'vehicles-game' && selectedBranch) {
    const branchLabel = BRANCHES.find((b) => b.id === selectedBranch)?.label ?? selectedBranch
    const vehiclesKey =
      selectedBranch === 'navy' && selectedNavySubMode
        ? getRoundsKey('vehicles', `russia_navy_${selectedNavySubMode}`)
        : getRoundsKey('vehicles', `russia_${selectedBranch}`)
    return (
      <GameView
        country="russia"
        branch={selectedBranch}
        branchLabel={branchLabel}
        navySubMode={selectedNavySubMode ?? undefined}
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

  if (view === 'tactical-signs-game' && selectedTacticalSignsSubset) {
    const tacticalSignsKey = getRoundsKey('tactical-signs', selectedTacticalSignsSubset)
    return (
      <TacticalSignsGameView
        subset={selectedTacticalSignsSubset}
        muted={muted}
        onToggleMute={toggleMute}
        onBack={backToLanding}
        onRoundComplete={() => incrementRounds(tacticalSignsKey)}
      />
    )
  }

  if (view === 'ranks-game' && selectedRanksBranch && selectedRanksLanguage) {
    const ranksKey = getRoundsKey('ranks', `${selectedRanksBranch}_${selectedRanksLanguage}`)
    return (
      <RanksGameView
        key={`ranks-${selectedRanksBranch}-${selectedRanksLanguage}`}
        branch={selectedRanksBranch}
        language={selectedRanksLanguage}
        muted={muted}
        onToggleMute={toggleMute}
        onBack={backToLanding}
        onRoundComplete={() => incrementRounds(ranksKey)}
      />
    )
  }

  if (view === 'words-game' && selectedWordsDirection != null && selectedWordsDifficulty != null && (selectedWordsModuleIndex != null || selectedWordsList === 'rintamavenajan-alkeet')) {
    const directionLabel = WORDS_DIRECTIONS.find((d) => d.id === selectedWordsDirection)?.label ?? selectedWordsDirection
    const initialPool = selectedWordsList === 'rintamavenajan-alkeet' ? alkeetPool : getModulePool(selectedWordsModuleIndex ?? 0)
    const wordsKey =
      selectedWordsList === 'rintamavenajan-alkeet'
        ? getRoundsKey('words', `alkeet_${selectedWordsDirection}`)
        : getRoundsKey('words', `${selectedWordsDirection}_${selectedWordsModuleIndex}`)
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
        <button
          type="button"
          className="landing-header-logo-btn"
          onClick={handleLandingLogoClick}
          aria-label="Toista intro"
        >
          <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="" className="landing-header-logo" />
        </button>
        <div className="landing-header-actions">
          <button
            type="button"
            className="back-btn back-btn-small"
            onClick={() => setShowSplash(true)}
          >
            Takaisin aloitusnäytölle
          </button>
          <button
            type="button"
            className="mute-btn"
            onClick={toggleMute}
            title={muted ? 'Äänitä äänet' : 'Mykistä äänet'}
            aria-label={muted ? 'Äänitä äänet' : 'Mykistä äänet'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
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

      {/* Venäjän asevoimat – sub-options: garrisons, vehicles, local-forces */}
      {selectedContentType === 'venajan-asevoimat' && (
        <section className="section">
          <h2 className="section-heading">Venäjän asevoimat</h2>
          <div className="options-grid">
            {VENAJAN_ASEVOIMAT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`option-btn ${opt.available ? '' : 'disabled'}`}
                onClick={() => {
                  if (!opt.available) return
                  playButtonClick(muted)
                  setSelectedContentType(opt.id)
                }}
                disabled={!opt.available}
              >
                {opt.label}
                {!opt.available && <span className="coming-soon-inline"> — {COMING_SOON_TEXT}</span>}
              </button>
            ))}
          </div>
          <button type="button" className="back-btn back-btn-inline" onClick={() => { playButtonClick(muted); setSelectedContentType(null) }}>
            ← Takaisin
          </button>
        </section>
      )}

      {/* Sotilaspiirit – first select military district (only Leningrad active) */}
      {selectedContentType === 'garrisons' && selectedGarrisonDistrict === null && (
        <section className="section">
          <h2 className="section-heading">Sotilaspiirit</h2>
          <div className="options-grid">
            {GARRISON_DISTRICTS.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`option-btn ${d.disabled ? 'disabled' : ''}`}
                onClick={() => {
                  if (d.disabled) return
                  playButtonClick(muted)
                  setSelectedGarrisonDistrict(d.id)
                }}
                disabled={d.disabled}
              >
                {d.label}
                {d.disabled && <span className="coming-soon-inline"> — {COMING_SOON_TEXT}</span>}
              </button>
            ))}
          </div>
          <button type="button" className="back-btn back-btn-inline" onClick={() => { playButtonClick(muted); setSelectedContentType('venajan-asevoimat') }}>
            ← Takaisin
          </button>
        </section>
      )}

      {/* Leningradin sotilaspiiri – responsibility areas (Pohjoinen, Etelä, Kaliningrad, Kaikki) */}
      {selectedContentType === 'garrisons' && selectedGarrisonDistrict === 'leningrad' && (
        <section className="section">
          <h2 className="section-heading">Leningradin sotilaspiiri</h2>
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
                    startGarrisonsGame(r.id)
                  }}
                >
                  <span className="option-btn-label">{r.label}</span>
                  <span className="option-rounds">{roundsDisplay}</span>
                </button>
              )
            })}
          </div>
          <button type="button" className="back-btn back-btn-inline" onClick={() => { playButtonClick(muted); setSelectedGarrisonDistrict(null) }}>
            ← Takaisin
          </button>
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

      {/* Words: Sanasto – Rintamavenäjän alkeet + Sotilasvenäjän perusteet 1, 2, 3… */}
      {selectedContentType === 'words' && selectedWordsDirection && !wordsLoading && wordsPool.length > 0 && selectedWordsList === null && (
        <section className="section">
          <h2 className="section-heading">Sanasto</h2>
          <div className="options-grid options-grid-modules">
            <button
              type="button"
              className="option-btn option-btn-with-rounds"
              onClick={() => {
                setSelectedWordsList('rintamavenajan-alkeet')
                if (alkeetPool.length >= 4) {
                  setSelectedWordsModuleIndex(0)
                  setSelectedWordsDifficulty('easy')
                  setPendingView('words-game')
                  setShowLadataanIkkuna(true)
                } else {
                  playButtonClick(muted)
                  startAlkeetGameWhenLoadedRef.current = true
                }
              }}
            >
              <span className="option-btn-label">{selectedWordsDirection === 'fi-ru' ? '1.1.1.' : '1.2.1.'} Rintamavenäjän alkeet</span>
              <span className="option-rounds">
                {selectedWordsDirection ? formatRoundsDisplay(getRounds(getRoundsKey('words', `alkeet_${selectedWordsDirection}`))) : formatRoundsDisplay(0)}
              </span>
            </button>
            {Array.from({ length: wordsModuleCount }, (_, i) => {
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
                      setSelectedWordsModuleIndex(i)
                      startWordsGame('easy')
                    }
                  }}
                  disabled={disabled}
                >
                  <span className="option-btn-label">
                    {selectedWordsDirection === 'fi-ru' ? `1.1.${i + 2}.` : `1.2.${i + 2}.`} Sotilasvenäjän perusteet {i + 1}
                    {disabled && <span className="coming-soon-inline"> (vähintään 4 sanaa)</span>}
                  </span>
                  {roundsDisplay != null && <span className="option-rounds">{roundsDisplay}</span>}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Rintamavenäjän alkeet: show loading/error only when we triggered load but game not started yet */}
      {selectedContentType === 'words' && selectedWordsDirection && selectedWordsList === 'rintamavenajan-alkeet' && view === 'landing' && (
        <section className="section">
          {alkeetLoading && <p className="words-loading-inline">Ladataan sanalistaa…</p>}
          {alkeetLoadError && (
            <p className="words-file-hint-inline">
              Sanalistaa ei voitu ladata. Lisää tiedosto <strong>public/data/rintamavenajan-alkeet.csv</strong> (UTF-8, A=venäjä, B=suomi).
            </p>
          )}
          {!alkeetLoading && alkeetPool.length > 0 && alkeetPool.length < 4 && !alkeetLoadError && (
            <p className="words-file-hint-inline">Sanalistassa täytyy olla vähintään 4 sanaa.</p>
          )}
          {selectedWordsList === 'rintamavenajan-alkeet' && view === 'landing' && (
            <button type="button" className="back-btn back-btn-inline" onClick={() => { startAlkeetGameWhenLoadedRef.current = false; setSelectedWordsList(null) }}>
              ← Takaisin sanastoon
            </button>
          )}
        </section>
      )}

      {/* Taktiset merkit – Sotilasmerkistö (Vihollisen*) and Joukkojen koko (rest) */}
      {selectedContentType === 'tactical-signs' && (
        <section className="section">
          <h2 className="section-heading">Taktiset merkit</h2>
          <div className="options-grid">
            <button
              type="button"
              className="option-btn option-btn-with-rounds"
              onClick={() => {
                startTacticalSignsGame('sotilasmerkisto')
              }}
            >
              <span className="option-btn-label">4.1. Sotilasmerkistö</span>
              <span className="option-rounds">{formatRoundsDisplay(getRounds(getRoundsKey('tactical-signs', 'sotilasmerkisto')))}</span>
            </button>
            <button
              type="button"
              className="option-btn option-btn-with-rounds"
              onClick={() => {
                startTacticalSignsGame('joukkojen-koko')
              }}
            >
              <span className="option-btn-label">4.2. Joukkojen koko</span>
              <span className="option-rounds">{formatRoundsDisplay(getRounds(getRoundsKey('tactical-signs', 'joukkojen-koko')))}</span>
            </button>
          </div>
        </section>
      )}

      {/* Sotilasarvot – Maavoimat / Merivoimat, then Suomeksi / Venäjäksi */}
      {selectedContentType === 'ranks' && selectedRanksBranch === null && (
        <section className="section">
          <h2 className="section-heading">Sotilasarvot</h2>
          <div className="options-grid">
            <button
              type="button"
              className="option-btn"
              onClick={() => {
                playButtonClick(muted)
                setSelectedRanksBranch('maavoimat')
              }}
            >
              3.1. Maavoimat
            </button>
            <button
              type="button"
              className="option-btn disabled"
              disabled
            >
              3.2. Merivoimat<span className="coming-soon-inline"> — {COMING_SOON_TEXT}</span>
            </button>
          </div>
        </section>
      )}
      {selectedContentType === 'ranks' && selectedRanksBranch !== null && (
        <section className="section">
          <h2 className="section-heading">Kieli</h2>
          <div className="options-grid">
            <button
              type="button"
              className="option-btn option-btn-with-rounds"
              onClick={() => startRanksGame(selectedRanksBranch, 'fi')}
            >
              <span className="option-btn-label">3.1.1. Suomeksi</span>
              <span className="option-rounds">{formatRoundsDisplay(getRounds(getRoundsKey('ranks', `${selectedRanksBranch}_fi`)))}</span>
            </button>
            <button
              type="button"
              className="option-btn option-btn-with-rounds"
              onClick={() => startRanksGame(selectedRanksBranch, 'ru')}
            >
              <span className="option-btn-label">3.1.2. Venäjäksi</span>
              <span className="option-rounds">{formatRoundsDisplay(getRounds(getRoundsKey('ranks', `${selectedRanksBranch}_ru`)))}</span>
            </button>
          </div>
          <button type="button" className="back-btn back-btn-inline" onClick={() => { playButtonClick(muted); setSelectedRanksBranch(null) }}>
            ← Takaisin
          </button>
        </section>
      )}

      {/* Coming soon message for content types not yet implemented */}
      {selectedContentType === 'local-forces' && (
        <section className="section">
          <p className="coming-soon-message">{COMING_SOON_TEXT}</p>
          <button type="button" className="back-btn back-btn-inline" onClick={() => { playButtonClick(muted); setSelectedContentType('venajan-asevoimat') }}>
            ← Takaisin
          </button>
        </section>
      )}

      {/* Kaluston osasto – after Puolustushaarojen suorituskyvyt selected */}
      {selectedContentType === 'vehicles' && selectedBranch === null && (
        <section className="section">
          <h2 className="section-heading">Kaluston osasto</h2>
          <div className="options-grid">
            {BRANCHES.map((b) => {
              const isDisabled = b.disabled || b.id === 'coming-soon'
              const vehiclesKey =
                b.id === 'navy'
                  ? null
                  : b.id !== 'coming-soon'
                    ? getRoundsKey('vehicles', `russia_${b.id}`)
                    : null
              const rounds =
                vehiclesKey != null
                  ? getRounds(vehiclesKey)
                  : b.id === 'navy'
                    ? Math.max(
                        getRounds(getRoundsKey('vehicles', 'russia_navy_class')),
                        getRounds(getRoundsKey('vehicles', 'russia_navy_vesselName'))
                      )
                    : 0
              const roundsDisplay = formatRoundsDisplay(rounds)
              return (
                <button
                  key={b.id}
                  type="button"
                  className={`option-btn branch option-btn-with-rounds ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => {
                    if (isDisabled) return
                    if (b.id === 'navy') {
                      playButtonClick(muted)
                      setSelectedBranch('navy')
                    } else {
                      startVehiclesGame(b.id as VehicleBranch)
                    }
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
          <button type="button" className="back-btn back-btn-inline" onClick={() => { playButtonClick(muted); setSelectedContentType('venajan-asevoimat') }}>
            ← Takaisin
          </button>
        </section>
      )}

      {/* Merivoimat: Alusluokat vs Alusten nimet */}
      {selectedContentType === 'vehicles' && selectedBranch === 'navy' && (
        <section className="section">
          <h2 className="section-heading">Merivoimat</h2>
          <div className="options-grid">
            <button
              type="button"
              className="option-btn option-btn-with-rounds"
              onClick={() => {
                startNavySubMode('class')
              }}
            >
              <span className="option-btn-label">2.2.1.1. Alusluokat</span>
              <span className="option-rounds">{formatRoundsDisplay(getRounds(getRoundsKey('vehicles', 'russia_navy_class')))}</span>
            </button>
            <button
              type="button"
              className="option-btn option-btn-with-rounds"
              onClick={() => {
                startNavySubMode('vesselName')
              }}
            >
              <span className="option-btn-label">2.2.1.2. Alusten nimet</span>
              <span className="option-rounds">{formatRoundsDisplay(getRounds(getRoundsKey('vehicles', 'russia_navy_vesselName')))}</span>
            </button>
          </div>
          <button type="button" className="back-btn back-btn-inline" onClick={() => setSelectedBranch(null)}>
            ← Takaisin kaluston osastoon
          </button>
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
