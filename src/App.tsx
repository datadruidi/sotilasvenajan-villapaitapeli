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
import { loadWordsCSV, getWordsListLabel, SOTILASSANASTO_MENU_IDS, LYHENTEET_LIST_IDS, isPerussanastoListId, isLyhenteetListId } from './lib/wordsData'
import { getReviewList, addToReviewList, removeFromReviewList, getLyhenteetReviewList, addToLyhenteetReviewList, removeFromLyhenteetReviewList, getGarrisonsReviewIds, addToGarrisonsReviewList, removeFromGarrisonsReviewList, getRanksReviewEntries, addToRanksReviewList, removeFromRanksReviewList } from './lib/reviewListStorage'
import type { WordsListId } from './lib/wordsData'
import { getGarrisonsPoolFromIds } from './data/garrisonsData'
import type { GarrisonEntry, GarrisonRegionId } from './data/garrisonsData'
import type { RanksBranchId } from './data/ranksData'
import { getRanksReviewPool } from './lib/ranksLogic'
import type { RanksLanguage } from './lib/ranksLogic'
import type { RankGameEntry } from './lib/ranksLogic'
import type { AppLanguage, NavySubMode, VehicleBranch, WordEntry, WordsDirection, WordsDifficulty } from './types/game'

type ContentType = 'vehicles' | 'words' | 'garrisons' | 'local-forces' | 'tactical-signs' | 'ranks' | 'venajan-asevoimat'

/** Branch button id: real branch or placeholder for grayed-out row */
type BranchButtonId = VehicleBranch | 'coming-soon' | 'strategic-missile' | 'airborne' | 'uav-systems'

const CONTENT_TYPES: { id: ContentType; label: string; available: boolean }[] = [
  { id: 'words', label: '1. Sotilassanasto', available: true },
  { id: 'venajan-asevoimat', label: '2. Sotilasorganisaatio', available: true },
  { id: 'tactical-signs', label: '3. Sotilasmerkistö', available: true },
  { id: 'ranks', label: '4. Sotilasarvot', available: true },
]

/** Sub-options under Venäjän asevoimat (same structure as before, just grouped) */
const VENAJAN_ASEVOIMAT_OPTIONS: { id: ContentType; label: string; available: boolean }[] = [
  { id: 'garrisons', label: '2.1. Sotilaspiirit', available: true },
  { id: 'vehicles', label: '2.2. Suorituskyvyt', available: true },
]

function stripMenuNumber(label: string): string {
  return label.replace(/^\d+(?:\.\d+)*\.\s*/, '').trim()
}

const BRANCHES: { id: BranchButtonId; label: string; disabled?: boolean }[] = [
  { id: 'navy', label: '2.2.1. Merivoimat' },
  { id: 'airforce', label: '2.2.2. Ilma- ja avaruusvoimat' },
  { id: 'army', label: '2.2.3. Maavoimat' },
  { id: 'strategic-missile', label: '2.2.4. Strategiset ohjusjoukot' },
  { id: 'airborne', label: '2.2.5. Maahanlaskujoukot', disabled: true },
  { id: 'uav-systems', label: '2.2.6. Miehittämättömien järjestelmien joukot' },
]

/** Military districts under Sotilaspiirit; only Leningrad is selectable and shows the 4 responsibility areas */
const GARRISON_DISTRICTS: { id: string; label: string; disabled: boolean }[] = [
  { id: 'leningrad', label: '2.1.1. Leningradin sotilaspiiri', disabled: false },
  { id: 'local-forces', label: '2.1.2. Lähialueen joukot', disabled: true },
  { id: 'badges', label: '2.1.3. Sotilaspiirien tunnukset', disabled: true },
]

const GARRISON_REGIONS: { id: GarrisonRegionId; label: string }[] = [
  { id: 'pohjoinen', label: '2.1.1.1. Pohjoinen vastuualue' },
  { id: 'etela', label: '2.1.1.2. Eteläinen vastuualue' },
  { id: 'kaliningrad', label: '2.1.1.3. Kaliningradin vastuualue' },
  { id: 'kaikki', label: '2.1.1.4. Kaikki yhdessä' },
]

const MUTE_STORAGE_KEY = 'miliingo-muted'
const APP_LANGUAGE_STORAGE_KEY = 'miliingo-app-language'
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
  const [appLanguage, setAppLanguage] = useState<AppLanguage>(() => {
    try {
      return localStorage.getItem(APP_LANGUAGE_STORAGE_KEY) === 'eng' ? 'eng' : 'fin'
    } catch {
      return 'fin'
    }
  })
  const isEnglish = appLanguage === 'eng'
  const primaryRanksLanguage: RanksLanguage = isEnglish ? 'en' : 'fi'
  const comingSoonText = isEnglish ? 'Released by demand' : 'Julkaistaan kysynnän mukaan'

  const getContentTypeLabel = (id: ContentType): string => {
    if (!isEnglish) return CONTENT_TYPES.find((ct) => ct.id === id)?.label ?? id
    if (id === 'words') return '1. Military Vocabulary'
    if (id === 'venajan-asevoimat') return '2. Military Organization'
    if (id === 'tactical-signs') return '3. Military Symbology'
    if (id === 'ranks') return '4. Military Ranks'
    return id
  }
  const getMilitaryOrgOptionLabel = (id: ContentType): string => {
    if (!isEnglish) return VENAJAN_ASEVOIMAT_OPTIONS.find((opt) => opt.id === id)?.label ?? id
    if (id === 'garrisons') return '2.1. Military Districts'
    if (id === 'vehicles') return '2.2. Military Capabilities'
    return id
  }
  const getVehicleBranchLabel = (id: BranchButtonId, fallback: string): string => {
    if (!isEnglish) return fallback
    if (id === 'navy') return '2.2.1. Navy'
    if (id === 'airforce') return '2.2.2. Aerospace Forces'
    if (id === 'army') return '2.2.3. Ground Forces'
    if (id === 'strategic-missile') return '2.2.4. Strategic Missile Forces'
    if (id === 'airborne') return '2.2.5. Airborne Forces'
    if (id === 'uav-systems') return '2.2.6. Unmanned Systems Forces'
    return fallback
  }
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<VehicleBranch | null>(null)
  const [selectedNavySubMode, setSelectedNavySubMode] = useState<NavySubMode | null>(null)
  const [selectedWordsDirection, setSelectedWordsDirection] = useState<WordsDirection | null>(null)
  const [showDirectionPopup, setShowDirectionPopup] = useState(false)
  const [showRanksReviewDirectionPopup, setShowRanksReviewDirectionPopup] = useState(false)
  const [pendingWordsListId, setPendingWordsListId] = useState<WordsListId | null>(null)
  const [selectedWordsDifficulty, setSelectedWordsDifficulty] = useState<WordsDifficulty | null>(null)
  const [selectedGarrisonRegion, setSelectedGarrisonRegion] = useState<GarrisonRegionId | null>(null)
  const [garrisonsReviewPool, setGarrisonsReviewPool] = useState<GarrisonEntry[] | null>(null)
  const [garrisonsReviewError, setGarrisonsReviewError] = useState<string | null>(null)
  const [selectedGarrisonDistrict, setSelectedGarrisonDistrict] = useState<string | null>(null)
  const [selectedTacticalSignsSubset, setSelectedTacticalSignsSubset] = useState<'sotilasmerkisto' | 'joukkojen-koko' | null>(null)
  const [selectedRanksBranch, setSelectedRanksBranch] = useState<RanksBranchId | null>(null)
  const [selectedRanksLanguage, setSelectedRanksLanguage] = useState<RanksLanguage | null>(null)
  const [ranksReviewPool, setRanksReviewPool] = useState<RankGameEntry[] | null>(null)
  const [ranksReviewLanguage, setRanksReviewLanguage] = useState<RanksLanguage | null>(null)
  const [ranksReviewError, setRanksReviewError] = useState<string | null>(null)
  const [showSplash, setShowSplash] = useState(true)
  const [view, setView] = useState<'landing' | 'vehicles-game' | 'words-game' | 'garrisons-game' | 'tactical-signs-game' | 'ranks-game'>('landing')
  const [showLadataanIkkuna, setShowLadataanIkkuna] = useState(false)
  const [pendingView, setPendingView] = useState<'vehicles-game' | 'words-game' | 'garrisons-game' | 'tactical-signs-game' | 'ranks-game' | null>(null)
  const [gameMenuTitle, setGameMenuTitle] = useState('')

  const [selectedWordsCategory, setSelectedWordsCategory] = useState<'sotilassanasto' | 'lyhenteet' | null>(null)
  const [selectedWordsList, setSelectedWordsList] = useState<WordsListId | null>(null)
  const [perussanastoPool, setPerussanastoPool] = useState<WordEntry[]>([])
  const [perussanastoLoading, setPerussanastoLoading] = useState(false)
  const [perussanastoLoadError, setPerussanastoLoadError] = useState<string | null>(null)
  const startPerussanastoGameWhenLoadedRef = useRef(false)

  const getGarrisonDistrictLabel = (id: string): string => {
    if (!isEnglish) return GARRISON_DISTRICTS.find((d) => d.id === id)?.label ?? id
    if (id === 'leningrad') return '2.1.1. Leningrad Military District'
    if (id === 'local-forces') return '2.1.2. Nearby Forces (FIN)'
    if (id === 'badges') return '2.1.3. Military District Insignia'
    return id
  }

  const getGarrisonRegionLabel = (id: GarrisonRegionId): string => {
    if (!isEnglish) return GARRISON_REGIONS.find((r) => r.id === id)?.label ?? id
    if (id === 'pohjoinen') return '2.1.1.1. Northern AOO'
    if (id === 'etela') return '2.1.1.2. Southern AOO'
    if (id === 'kaliningrad') return '2.1.1.3. Kaliningrad'
    return '2.1.1.4. Combined View'
  }
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

  const changeAppLanguage = (language: AppLanguage) => {
    setAppLanguage(language)
    try {
      localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language)
    } catch {
      /* ignore */
    }
  }

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
    if (selectedContentType !== 'words' || !selectedWordsList) return
    if (selectedWordsList === 'kerrattava-sanasto') return
    if (!isPerussanastoListId(selectedWordsList) && !isLyhenteetListId(selectedWordsList)) return
    if (selectedWordsList === 'lyhenteet-kerrattava') {
      const list = getLyhenteetReviewList()
      setPerussanastoPool(list)
      setPerussanastoLoadError(null)
      setPerussanastoLoading(false)
      if (startPerussanastoGameWhenLoadedRef.current && list.length >= 4) {
        startPerussanastoGameWhenLoadedRef.current = false
        setSelectedWordsDifficulty('easy')
        setPendingView('words-game')
        setShowLadataanIkkuna(true)
      }
      return
    }
    let cancelled = false
    setPerussanastoLoadError(null)
    setPerussanastoLoading(true)
    loadWordsCSV(selectedWordsList, appLanguage)
      .then((pairs) => {
        if (!cancelled) {
          setPerussanastoPool(pairs)
          if (startPerussanastoGameWhenLoadedRef.current && pairs.length >= 4) {
            startPerussanastoGameWhenLoadedRef.current = false
            setSelectedWordsDifficulty('easy')
            setPendingView('words-game')
            setShowLadataanIkkuna(true)
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setPerussanastoLoadError(err instanceof Error ? err.message : String(err))
          startPerussanastoGameWhenLoadedRef.current = false
        }
      })
      .finally(() => {
        if (!cancelled) setPerussanastoLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedContentType, selectedWordsList, appLanguage])

  const startVehiclesGame = (branch: VehicleBranch, navySubMode?: NavySubMode) => {
    const branchMenuLabel = BRANCHES.find((b) => b.id === branch)?.label ?? String(branch)
    setGameMenuTitle(stripMenuNumber(branchMenuLabel))
    setSelectedBranch(branch)
    setSelectedNavySubMode(navySubMode ?? null)
    setPendingView('vehicles-game')
    setShowLadataanIkkuna(true)
  }

  const startNavySubMode = (mode: NavySubMode) => {
    setGameMenuTitle(mode === 'class' ? (isEnglish ? 'Naval Ship Classes' : 'Alusluokat') : (isEnglish ? 'Naval Ship Names' : 'Alusten nimet'))
    setSelectedNavySubMode(mode)
    setPendingView('vehicles-game')
    setShowLadataanIkkuna(true)
  }

  const startGarrisonsGame = (region: GarrisonRegionId) => {
    const regionLabel = getGarrisonRegionLabel(region)
    setGameMenuTitle(stripMenuNumber(regionLabel))
    setSelectedGarrisonRegion(region)
    setGarrisonsReviewPool(null)
    setPendingView('garrisons-game')
    setShowLadataanIkkuna(true)
  }

  const startGarrisonsReviewGame = () => {
    const ids = getGarrisonsReviewIds()
    const pool = getGarrisonsPoolFromIds(ids)
    if (pool.length < 4) return
    setGameMenuTitle('Kertaus')
    setGarrisonsReviewPool(pool)
    setSelectedGarrisonRegion(null)
    setPendingView('garrisons-game')
    setShowLadataanIkkuna(true)
  }

  const startTacticalSignsGame = (subset: 'sotilasmerkisto' | 'joukkojen-koko') => {
    if (subset === 'sotilasmerkisto') {
      setGameMenuTitle(isEnglish ? 'Unit Size' : 'Joukkotyypit')
    } else {
      setGameMenuTitle(isEnglish ? 'Echelons' : 'Joukkokoko')
    }
    setSelectedTacticalSignsSubset(subset)
    setPendingView('tactical-signs-game')
    setShowLadataanIkkuna(true)
  }

  const startRanksGame = (branch: RanksBranchId, language: RanksLanguage) => {
    if (language === 'ru') {
      setGameMenuTitle(isEnglish ? 'In Russian' : 'Venäjäksi')
    } else {
      setGameMenuTitle(isEnglish ? 'In English' : 'Suomeksi')
    }
    setSelectedRanksBranch(branch)
    setSelectedRanksLanguage(language)
    setRanksReviewPool(null)
    setRanksReviewLanguage(null)
    setPendingView('ranks-game')
    setShowLadataanIkkuna(true)
  }

  const startRanksReviewGame = (language: RanksLanguage) => {
    const entries = getRanksReviewEntries()
    const pool = getRanksReviewPool(entries, language)
    if (pool.length < 4) return false
    setRanksReviewPool(pool)
    setRanksReviewLanguage(language)
    setSelectedRanksBranch(null)
    setSelectedRanksLanguage(null)
    setPendingView('ranks-game')
    setShowLadataanIkkuna(true)
    return true
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
    setSelectedWordsCategory(null)
    setSelectedWordsList(null)
    setPerussanastoPool([])
    setPerussanastoLoadError(null)
    setSelectedContentType(null)
    setSelectedWordsDirection(null)
    setShowDirectionPopup(false)
    setShowRanksReviewDirectionPopup(false)
    setPendingWordsListId(null)
    setSelectedWordsDifficulty(null)
    setSelectedGarrisonRegion(null)
    setGarrisonsReviewPool(null)
    setSelectedGarrisonDistrict(null)
    setSelectedTacticalSignsSubset(null)
    setSelectedRanksBranch(null)
    setSelectedRanksLanguage(null)
    setRanksReviewPool(null)
    setRanksReviewLanguage(null)
    setRanksReviewError(null)
    setGameMenuTitle('')
  }

  const closeOptionPopup = () => {
    setSelectedContentType(null)
    setSelectedBranch(null)
    setSelectedNavySubMode(null)
    setSelectedWordsCategory(null)
    setSelectedWordsList(null)
    setSelectedWordsDirection(null)
    setShowDirectionPopup(false)
    setShowRanksReviewDirectionPopup(false)
    setPendingWordsListId(null)
    setPerussanastoPool([])
    setPerussanastoLoadError(null)
    startPerussanastoGameWhenLoadedRef.current = false
    setSelectedGarrisonDistrict(null)
    setGarrisonsReviewError(null)
    setSelectedRanksBranch(null)
    setRanksReviewError(null)
  }

  const handleSplashPlay = () => {
    setShowSplash(false)
  }

  if (showSplash) {
    return <SplashScreen appLanguage={appLanguage} muted={muted} onPlay={handleSplashPlay} onChangeLanguage={changeAppLanguage} />
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
        menuTitle={gameMenuTitle}
        navySubMode={selectedNavySubMode ?? undefined}
        appLanguage={appLanguage}
        muted={muted}
        onToggleMute={toggleMute}
        onBack={backToLanding}
        onRoundComplete={() => incrementRounds(vehiclesKey)}
      />
    )
  }

  if (view === 'garrisons-game' && (selectedGarrisonRegion || (garrisonsReviewPool != null && garrisonsReviewPool.length > 0))) {
    const isReview = garrisonsReviewPool != null && garrisonsReviewPool.length > 0
    const garrisonsKey = getRoundsKey('garrisons', isReview ? 'kerrattava' : selectedGarrisonRegion!)
    return (
      <GarrisonsGameView
        region={isReview ? 'kaikki' : selectedGarrisonRegion!}
        menuTitle={gameMenuTitle}
        appLanguage={appLanguage}
        initialPool={isReview ? garrisonsReviewPool : undefined}
        onAddToGarrisonReview={!isReview ? (entry) => addToGarrisonsReviewList(entry.id) : undefined}
        onRemoveFromGarrisonReview={(entry) => {
          removeFromGarrisonsReviewList(entry.id)
          if (isReview) setGarrisonsReviewPool((prev) => (prev ? prev.filter((e) => e.id !== entry.id) : null))
        }}
        isGarrisonReviewList={isReview}
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
        menuTitle={gameMenuTitle}
        appLanguage={appLanguage}
        muted={muted}
        onToggleMute={toggleMute}
        onBack={backToLanding}
        onRoundComplete={() => incrementRounds(tacticalSignsKey)}
      />
    )
  }

  if (view === 'ranks-game' && ((selectedRanksBranch && selectedRanksLanguage) || (ranksReviewPool != null && ranksReviewPool.length > 0 && ranksReviewLanguage != null))) {
    const isReview = ranksReviewPool != null && ranksReviewPool.length > 0 && ranksReviewLanguage != null
    const branch = isReview ? ranksReviewPool[0].branch : selectedRanksBranch!
    const language = isReview ? ranksReviewLanguage : selectedRanksLanguage!
    const ranksKey = getRoundsKey('ranks', isReview ? `kerrattava_${language}` : `${selectedRanksBranch}_${selectedRanksLanguage}`)
    return (
      <RanksGameView
        key={isReview ? `ranks-kerrattava-${language}` : `ranks-${selectedRanksBranch}-${selectedRanksLanguage}`}
        branch={branch}
        language={language}
        menuTitle={gameMenuTitle}
        appLanguage={appLanguage}
        initialPool={isReview ? ranksReviewPool : undefined}
        onAddToRanksReview={!isReview ? (entry) => addToRanksReviewList({ branch: entry.branch, language, termFi: entry.termFi }) : undefined}
        onRemoveFromRanksReview={(entry) => {
          removeFromRanksReviewList({ branch: entry.branch, language, termFi: entry.termFi })
          if (isReview) setRanksReviewPool((prev) => (prev ? prev.filter((e) => !(e.branch === entry.branch && e.termFi === entry.termFi)) : null))
        }}
        isRanksReviewList={isReview}
        muted={muted}
        onToggleMute={toggleMute}
        onBack={backToLanding}
        onRoundComplete={() => incrementRounds(ranksKey)}
      />
    )
  }

  if (view === 'words-game' && selectedWordsDirection != null && selectedWordsDifficulty != null && selectedWordsList != null && perussanastoPool.length > 0) {
    const directionLabel = selectedWordsDirection === 'fi-ru'
      ? (isEnglish ? 'English -> Russian' : 'Suomi -> Venäjä')
      : (isEnglish ? 'Russian -> English' : 'Venäjä -> Suomi')
    const initialPool = perussanastoPool
    const wordsKey = getRoundsKey('words', `${selectedWordsDirection}_${selectedWordsList}`)
    const isLyhenteet = isLyhenteetListId(selectedWordsList)
    const isLyhenteetKerrattava = selectedWordsList === 'lyhenteet-kerrattava'
    return (
      <WordsGameView
        direction={selectedWordsDirection}
        difficulty={selectedWordsDifficulty}
        directionLabel={directionLabel}
        menuTitle={gameMenuTitle}
        appLanguage={appLanguage}
        initialPool={initialPool}
        compactPrompt={isLyhenteet}
        onAddToReview={isPerussanastoListId(selectedWordsList) ? addToReviewList : undefined}
        isReviewList={selectedWordsList === 'kerrattava-sanasto'}
        onRemoveFromReview={isPerussanastoListId(selectedWordsList) || selectedWordsList === 'kerrattava-sanasto' ? removeFromReviewList : undefined}
        onAddToLyhenteetReview={isLyhenteet && !isLyhenteetKerrattava ? addToLyhenteetReviewList : undefined}
        isLyhenteetReviewList={isLyhenteetKerrattava}
        onRemoveFromLyhenteetReview={isLyhenteet ? removeFromLyhenteetReviewList : undefined}
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
        <h1 className="title title-ukraine">
          <span>{isEnglish ? 'Military Russian 101' : 'Sotilasvenäjän villapaitapeli'}</span>
        </h1>
        <button
          type="button"
          className="landing-header-logo-btn"
          onClick={handleLandingLogoClick}
          aria-label={isEnglish ? 'Replay intro' : 'Toista intro'}
        >
          <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="" className="landing-header-logo" />
        </button>
        <div className="landing-header-actions">
          <div className="landing-header-left-controls">
            <button
              type="button"
              className="back-btn back-btn-small"
              onClick={() => setShowSplash(true)}
            >
              {isEnglish ? 'Back to Start' : 'Takaisin aloitusnäytölle'}
            </button>
            <button
              type="button"
              className="mute-btn"
              onClick={toggleMute}
              title={muted ? (isEnglish ? 'Unmute' : 'Äänitä äänet') : (isEnglish ? 'Mute' : 'Mykistä äänet')}
              aria-label={muted ? (isEnglish ? 'Unmute' : 'Äänitä äänet') : (isEnglish ? 'Mute' : 'Mykistä äänet')}
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </div>
          <div className="landing-language-picker">
            <span className="landing-language-label">{isEnglish ? 'Choose language' : 'Valitse kieli'}</span>
            <div className="landing-language-switch" role="group" aria-label="Language">
              <button type="button" className={`lang-btn ${appLanguage === 'fin' ? 'active' : ''}`} onClick={() => changeAppLanguage('fin')}>
                <span className="lang-flag" aria-hidden="true">🇫🇮</span> FIN
              </button>
              <button type="button" className={`lang-btn ${appLanguage === 'eng' ? 'active' : ''}`} onClick={() => changeAppLanguage('eng')}>
                <span className="lang-flag" aria-hidden="true">🇬🇧</span> ENG
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="landing-scroll">
      {/* Content type */}
      <section className="section">
          <h2 className="section-heading">{isEnglish ? 'Content type' : 'Sisältötyyppi'}</h2>
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
                {getContentTypeLabel(ct.id)}
                {!ct.available && <span className="coming-soon-inline"> — {comingSoonText}</span>}
              </button>
            ))}
          </div>
        </section>
      {selectedContentType !== null && (
      <div className="menu-layer-overlay" role="dialog" aria-modal="true">
      <div className="menu-layer-window">
        <button
          type="button"
          className="popup-close-btn"
          onClick={() => {
            playButtonClick(muted)
            closeOptionPopup()
          }}
          aria-label="Sulje"
        >
          ×
        </button>

      {/* Venäjän asevoimat – sub-options: garrisons, vehicles, local-forces */}
      {selectedContentType === 'venajan-asevoimat' && (
        <section className="section">
          <h2 className="section-heading">{isEnglish ? 'Military Organization' : 'Sotilasorganisaatio'}</h2>
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
                {getMilitaryOrgOptionLabel(opt.id)}
                {!opt.available && <span className="coming-soon-inline"> — {comingSoonText}</span>}
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
          <h2 className="section-heading">{isEnglish ? 'Military Districts' : 'Sotilaspiirit'}</h2>
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
                {getGarrisonDistrictLabel(d.id)}
                {d.disabled && <span className="coming-soon-inline"> — {comingSoonText}</span>}
              </button>
            ))}
          </div>
          <button type="button" className="back-btn back-btn-inline" onClick={() => { playButtonClick(muted); setSelectedContentType('venajan-asevoimat') }}>
            ← Takaisin
          </button>
        </section>
      )}

      {/* Leningradin sotilaspiiri – responsibility areas (Pohjoinen, Etelä, Kaliningrad, Kaikki) + Kertaus */}
      {selectedContentType === 'garrisons' && selectedGarrisonDistrict === 'leningrad' && (
        <section className="section">
          <h2 className="section-heading">{isEnglish ? 'Leningrad Military District' : 'Leningradin sotilaspiiri'}</h2>
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
                    setGarrisonsReviewError(null)
                    startGarrisonsGame(r.id)
                  }}
                >
                  <span className="option-btn-label">{getGarrisonRegionLabel(r.id)}</span>
                  <span className="option-rounds">{roundsDisplay}</span>
                </button>
              )
            })}
            <button
              type="button"
              className="option-btn option-btn-kertaus"
              onClick={() => {
                playButtonClick(muted)
                setGarrisonsReviewError(null)
                const ids = getGarrisonsReviewIds()
                const pool = getGarrisonsPoolFromIds(ids)
                if (pool.length < 4) {
                  setGarrisonsReviewError(isEnglish ? 'Add at least 4 targets to the review list to play.' : 'Lisää vähintään 4 kohdetta kerrattavaan listaan pelataksesi.')
                  return
                }
                startGarrisonsReviewGame()
              }}
            >
              <span className="option-btn-label">{isEnglish ? '2.1.1.5. Review' : 'Kertaus'}</span>
            </button>
          </div>
          {garrisonsReviewError && <p className="words-file-hint-inline">{garrisonsReviewError}</p>}
          <button type="button" className="back-btn back-btn-inline" onClick={() => { playButtonClick(muted); setSelectedGarrisonDistrict(null); setGarrisonsReviewError(null) }}>
            ← Takaisin
          </button>
        </section>
      )}

      {/* Words: Category – 1.1. Sotilassanasto, 1.2. Lyhenteet */}
      {selectedContentType === 'words' && selectedWordsCategory === null && selectedWordsList === null && (
        <section className="section">
          <h2 className="section-heading">{isEnglish ? 'Vocabulary' : 'Sanasto'}</h2>
          <div className="options-grid">
            <button
              type="button"
              className="option-btn"
              onClick={() => {
                playButtonClick(muted)
                setSelectedWordsCategory('sotilassanasto')
              }}
            >
              <span className="option-btn-label">{isEnglish ? '1.1. Military Operations' : '1.1. Sotilastoiminta'}</span>
            </button>
            <button
              type="button"
              className="option-btn"
              onClick={() => {
                playButtonClick(muted)
                setSelectedWordsCategory('lyhenteet')
              }}
            >
              <span className="option-btn-label">{isEnglish ? '1.2. Military Abbreviations' : '1.2. Sotilaslyhenteet'}</span>
            </button>
          </div>
          <button type="button" className="back-btn back-btn-inline" onClick={() => setSelectedContentType(null)}>
            ← Takaisin
          </button>
        </section>
      )}

      {/* Words: direction popup – after choosing a list under 1.1 */}
      {showDirectionPopup && pendingWordsListId !== null && (
        <div className="words-direction-overlay" role="dialog" aria-labelledby="words-direction-popup-title" aria-modal="true">
          <div className="words-direction-popup">
            <button
              type="button"
              className="popup-close-btn popup-close-btn--direction"
              onClick={() => {
                playButtonClick(muted)
                setShowDirectionPopup(false)
                setPendingWordsListId(null)
              }}
              aria-label="Sulje"
            >
              ×
            </button>
            <h2 id="words-direction-popup-title" className="section-heading">Valitse sanaston käännössuunta</h2>
            <div className="options-grid">
              {(['fi-ru', 'ru-fi'] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  className="option-btn"
                  onClick={() => {
                    const listId = pendingWordsListId
                    const actualDirection: WordsDirection = dir === 'fi-ru' ? 'ru-fi' : 'fi-ru'
                    playButtonClick(muted)
                    setSelectedWordsDirection(actualDirection)
                    setSelectedWordsList(listId)
                    setPendingWordsListId(null)
                    setShowDirectionPopup(false)
                    if (listId === 'kerrattava-sanasto') {
                      const reviewPool = getReviewList()
                      if (reviewPool.length < 5) {
                        setPerussanastoLoadError('Et ole lisännyt tarpeeksi monta kerrattavaa sanaa. Listattavia sanoja oltava vähintään viisi.')
                        setPerussanastoPool([])
                        return
                      }
                      setPerussanastoPool(reviewPool)
                      setPerussanastoLoadError(null)
                      setSelectedWordsDifficulty('easy')
                      setPendingView('words-game')
                      setShowLadataanIkkuna(true)
                    } else {
                      startPerussanastoGameWhenLoadedRef.current = true
                    }
                  }}
                >
                  <span className="option-btn-label">{dir === 'fi-ru' ? (isEnglish ? 'Answer in English' : 'Vastaa suomeksi') : (isEnglish ? 'Answer in Russian' : 'Vastaa по-русски')}</span>
                </button>
              ))}
            </div>
            <button type="button" className="back-btn back-btn-inline words-direction-popup-back" onClick={() => { setShowDirectionPopup(false); setPendingWordsListId(null) }}>
              ← Takaisin
            </button>
          </div>
        </div>
      )}
      {showRanksReviewDirectionPopup && (
        <div className="words-direction-overlay" role="dialog" aria-labelledby="ranks-review-direction-popup-title" aria-modal="true">
          <div className="words-direction-popup">
            <button
              type="button"
              className="popup-close-btn popup-close-btn--direction"
              onClick={() => {
                playButtonClick(muted)
                setShowRanksReviewDirectionPopup(false)
              }}
              aria-label="Sulje"
            >
              ×
            </button>
            <h2 id="ranks-review-direction-popup-title" className="section-heading">Valitse sanaston käännössuunta</h2>
            <div className="options-grid">
              {(['fi-ru', 'ru-fi'] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  className="option-btn"
                  onClick={() => {
                    const language: RanksLanguage = dir === 'fi-ru' ? primaryRanksLanguage : 'ru'
                    playButtonClick(muted)
                    setRanksReviewError(null)
                    if (!startRanksReviewGame(language)) {
                      setRanksReviewError('Lisää vähintään 4 arvoa kerrattavaan listaan pelataksesi.')
                      return
                    }
                    setShowRanksReviewDirectionPopup(false)
                  }}
                >
                  <span className="option-btn-label">{dir === 'fi-ru' ? (isEnglish ? 'Answer in English' : 'Vastaa suomeksi') : (isEnglish ? 'Answer in Russian' : 'Vastaa по-русски')}</span>
                </button>
              ))}
            </div>
            <button type="button" className="back-btn back-btn-inline words-direction-popup-back" onClick={() => setShowRanksReviewDirectionPopup(false)}>
              ← Takaisin
            </button>
          </div>
        </div>
      )}

      {/* Words: Sotilassanasto – 1.1.1.–1.1.8. (direction asked in popup after click) */}
      {selectedContentType === 'words' && selectedWordsCategory === 'sotilassanasto' && selectedWordsList === null && (
        <section className="section">
          <h2 className="section-heading">Sotilassanasto</h2>
          <div className="options-grid options-grid-modules">
            {[...SOTILASSANASTO_MENU_IDS.filter((id) => id !== 'kerrattava-sanasto'), ...SOTILASSANASTO_MENU_IDS.filter((id) => id === 'kerrattava-sanasto')].map((listId, idx) => {
              const directionForRounds = selectedWordsDirection ?? 'fi-ru'
              const wordsKey = getRoundsKey('words', `${directionForRounds}_${listId}`)
              const roundsDisplay = formatRoundsDisplay(getRounds(wordsKey))
              const isKertaus = listId === 'kerrattava-sanasto'
              return (
                <button
                  key={listId}
                  type="button"
                  className={isKertaus ? 'option-btn option-btn-kertaus' : 'option-btn option-btn-with-rounds'}
                  onClick={() => {
                    playButtonClick(muted)
                    setGameMenuTitle(listId === 'kerrattava-sanasto' ? (isEnglish ? 'Review' : 'Kertaus') : getWordsListLabel(listId, appLanguage))
                    setPendingWordsListId(listId)
                    setShowDirectionPopup(true)
                  }}
                >
                  <span className="option-btn-label">{isKertaus ? (isEnglish ? 'Review' : 'Kertaus') : `1.1.${idx + 1}. ${getWordsListLabel(listId, appLanguage)}`}</span>
                  {!isKertaus && <span className="option-rounds">{roundsDisplay}</span>}
                </button>
              )
            })}
          </div>
          <button type="button" className="back-btn back-btn-inline" onClick={() => setSelectedWordsCategory(null)}>
            ← Takaisin
          </button>
        </section>
      )}

      {/* Words: Lyhenteet – 1.2.1.–1.2.7. (no direction popup; uses fi-ru) */}
      {selectedContentType === 'words' && selectedWordsCategory === 'lyhenteet' && selectedWordsList === null && (
        <section className="section">
          <h2 className="section-heading">Lyhenteet</h2>
          <div className="options-grid options-grid-modules">
            {[...LYHENTEET_LIST_IDS.filter((id) => id !== 'lyhenteet-kerrattava'), ...LYHENTEET_LIST_IDS.filter((id) => id === 'lyhenteet-kerrattava')].map((listId, idx) => {
              const num = idx + 1
              const directionForRounds = 'fi-ru'
              const isKertaus = listId === 'lyhenteet-kerrattava'
              return (
                <button
                  key={listId}
                  type="button"
                  className={isKertaus ? 'option-btn option-btn-kertaus' : 'option-btn option-btn-with-rounds'}
                  onClick={() => {
                    playButtonClick(muted)
                    setGameMenuTitle(listId === 'lyhenteet-kerrattava' ? (isEnglish ? 'Review' : 'Kertaus') : getWordsListLabel(listId, appLanguage))
                    setSelectedWordsDirection('fi-ru')
                    startPerussanastoGameWhenLoadedRef.current = true
                    setSelectedWordsList(listId)
                  }}
                >
                  <span className="option-btn-label">{isKertaus ? (isEnglish ? 'Review' : 'Kertaus') : `1.2.${num}. ${getWordsListLabel(listId, appLanguage)}`}</span>
                  {!isKertaus && (
                    <span className="option-rounds">
                      {formatRoundsDisplay(getRounds(getRoundsKey('words', `${directionForRounds}_${listId}`)))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <button type="button" className="back-btn back-btn-inline" onClick={() => setSelectedWordsCategory(null)}>
            ← Takaisin
          </button>
        </section>
      )}

      {/* Perussanasto / Lyhenteet: loading/error when one of those lists is selected */}
      {selectedContentType === 'words' && selectedWordsDirection && selectedWordsList !== null && (isPerussanastoListId(selectedWordsList) || isLyhenteetListId(selectedWordsList) || selectedWordsList === 'kerrattava-sanasto') && view === 'landing' && (
        <section className="section">
          {perussanastoLoading && <p className="words-loading-inline">Ladataan sanalistaa…</p>}
          {perussanastoLoadError && (
            <p className="words-file-hint-inline">
              {selectedWordsList === 'kerrattava-sanasto'
                ? perussanastoLoadError
                : <>Sanalistaa ei voitu ladata. Lisää tiedosto <strong>public/data/{selectedWordsList}.csv</strong> (UTF-8, A=venäjä, B=suomi).</>}
            </p>
          )}
          {selectedWordsList === 'lyhenteet-kerrattava' && !perussanastoLoading && perussanastoPool.length === 0 && !perussanastoLoadError && (
            <p className="words-file-hint-inline">Sinulla ei ole kerrattavia sanoja. Lisää pelistä kerrattavia sanoja harjoitellaksesi niitä täällä.</p>
          )}
          {!perussanastoLoading && perussanastoPool.length > 0 && perussanastoPool.length < 4 && !perussanastoLoadError && (
            <p className="words-file-hint-inline">Sanalistassa täytyy olla vähintään 4 sanaa.</p>
          )}
          <button type="button" className="back-btn back-btn-inline" onClick={() => { startPerussanastoGameWhenLoadedRef.current = false; setSelectedWordsList(null); setPerussanastoPool([]); setPerussanastoLoadError(null) }}>
            ← Takaisin
          </button>
        </section>
      )}

      {/* Taktiset merkit – Sotilasmerkistö (Vihollisen*) and Joukkojen koko (rest) */}
      {selectedContentType === 'tactical-signs' && (
        <section className="section">
          <h2 className="section-heading">{isEnglish ? 'Military Symbology' : 'Sotilasmerkistö'}</h2>
          <div className="options-grid">
            <button
              type="button"
              className="option-btn option-btn-with-rounds"
              onClick={() => {
                startTacticalSignsGame('sotilasmerkisto')
              }}
            >
              <span className="option-btn-label">{isEnglish ? '3.1. Unit Size' : '3.1. Joukkotyypit'}</span>
              <span className="option-rounds">{formatRoundsDisplay(getRounds(getRoundsKey('tactical-signs', 'sotilasmerkisto')))}</span>
            </button>
            <button
              type="button"
              className="option-btn option-btn-with-rounds"
              onClick={() => {
                startTacticalSignsGame('joukkojen-koko')
              }}
            >
              <span className="option-btn-label">{isEnglish ? '3.2. Echelons' : '3.2. Joukkokoko'}</span>
              <span className="option-rounds">{formatRoundsDisplay(getRounds(getRoundsKey('tactical-signs', 'joukkojen-koko')))}</span>
            </button>
          </div>
          <button type="button" className="back-btn back-btn-inline" onClick={() => { playButtonClick(muted); setSelectedContentType(null) }}>
            ← Takaisin
          </button>
        </section>
      )}

      {/* Sotilasarvot – universal (always Ground Forces), then language */}
      {selectedContentType === 'ranks' && (
        <section className="section">
          <h2 className="section-heading">{isEnglish ? 'Military Ranks' : 'Sotilasarvot'}</h2>
          <div className="options-grid">
            <button
              type="button"
              className="option-btn option-btn-with-rounds"
              onClick={() => { setRanksReviewError(null); startRanksGame('maavoimat', primaryRanksLanguage) }}
            >
              <span className="option-btn-label">{isEnglish ? '4.1. In English' : '4.1. Suomeksi'}</span>
              <span className="option-rounds">{formatRoundsDisplay(getRounds(getRoundsKey('ranks', `maavoimat_${primaryRanksLanguage}`)))}</span>
            </button>
            <button
              type="button"
              className="option-btn option-btn-with-rounds"
              onClick={() => { setRanksReviewError(null); startRanksGame('maavoimat', 'ru') }}
            >
              <span className="option-btn-label">{isEnglish ? '4.2. In Russian' : '4.2. Venäjäksi'}</span>
              <span className="option-rounds">{formatRoundsDisplay(getRounds(getRoundsKey('ranks', 'maavoimat_ru')))}</span>
            </button>
            <button
              type="button"
              className="option-btn option-btn-kertaus"
              onClick={() => {
                playButtonClick(muted)
                setRanksReviewError(null)
                setGameMenuTitle(isEnglish ? 'Review' : 'Kertaus')
                setShowRanksReviewDirectionPopup(true)
              }}
            >
              <span className="option-btn-label">{isEnglish ? 'Review' : 'Kertaus'}</span>
            </button>
          </div>
          {ranksReviewError && <p className="words-file-hint-inline">{ranksReviewError}</p>}
          <button type="button" className="back-btn back-btn-inline" onClick={() => { playButtonClick(muted); setSelectedContentType(null); setRanksReviewError(null) }}>
            {isEnglish ? '← Back' : '← Takaisin'}
          </button>
        </section>
      )}

      {/* Coming soon message for content types not yet implemented */}
      {selectedContentType === 'local-forces' && (
        <section className="section">
          <p className="coming-soon-message">{comingSoonText}</p>
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
                  <span className="option-btn-label">{getVehicleBranchLabel(b.id, b.label)}</span>
                  <span className={isDisabled ? 'option-rounds option-rounds-disabled' : 'option-rounds'}>
                    {isDisabled ? comingSoonText : roundsDisplay}
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
          <h2 className="section-heading">{isEnglish ? 'Navy' : 'Merivoimat'}</h2>
          <div className="options-grid">
            <button
              type="button"
              className="option-btn option-btn-with-rounds"
              onClick={() => {
                startNavySubMode('class')
              }}
            >
              <span className="option-btn-label">{isEnglish ? '2.2.1.1. Naval Ship Classes' : '2.2.1.1. Alusluokat'}</span>
              <span className="option-rounds">{formatRoundsDisplay(getRounds(getRoundsKey('vehicles', 'russia_navy_class')))}</span>
            </button>
            <button
              type="button"
              className="option-btn option-btn-with-rounds"
              onClick={() => {
                startNavySubMode('vesselName')
              }}
            >
              <span className="option-btn-label">{isEnglish ? '2.2.1.2. Naval Ship Names' : '2.2.1.2. Alusten nimet'}</span>
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
      )}
      </div>
    </div>
    {showLadataanIkkuna && pendingView && (
      <LadataanIkkuna appLanguage={appLanguage} muted={muted} onComplete={finishLadataanIkkuna} />
    )}
    </>
  )
}

export default App
