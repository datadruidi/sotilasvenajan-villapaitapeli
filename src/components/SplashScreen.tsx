import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { AppLanguage } from '../types/game'
import { playButtonClick } from '../lib/sound'

const FAVICON_SRC = `${import.meta.env.BASE_URL}favicon.png`
const SETTINGS_PAGES_BASE_URL = `${import.meta.env.BASE_URL}tiedot-ja-asetukset/`
const SETTINGS_SOURCES_BASE_URL = `${SETTINGS_PAGES_BASE_URL}sources/`
const SETTINGS_AUDIO_BASE_URL = `${SETTINGS_PAGES_BASE_URL}audio/`
const INTRO_URL = `${SETTINGS_AUDIO_BASE_URL}intro.mp3`
const TIETOA_URL = `${SETTINGS_PAGES_BASE_URL}README.md`
const UPDATES_URL = `${SETTINGS_PAGES_BASE_URL}UPDATES.md`
const SOUNDTRACK_URL = `${SETTINGS_PAGES_BASE_URL}soundtrack.md`
const SHORT_WAR_STORIES_BASE_URL = `${import.meta.env.BASE_URL}short-war-stories/`
const SHORT_WAR_STORIES_AUDIO_BASE_URL = `${SHORT_WAR_STORIES_BASE_URL}audio/`
const GITHUB_URL = 'https://github.com/datadruidi/sotilasvenajan-villapaitapeli'
const YOUTUBE_URL = 'https://www.youtube.com/@sotilasvenaja'
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.sotilasvenajan.villapaitapeli&hl=en_NZ'
const FEEDBACK_URL = 'https://pad.riseup.net/p/MqxWfBo7cIo-x0yPks6g-keep'

type InfoPage =
  | 'tietoa'
  | 'paivitykset'
  | 'soundtrack'
  | 'sources-sotilassanasto'
  | 'sources-puolustushaarat'
  | 'sources-sotilaspiirit'
  | 'sources-sotilasarvot'
  | 'sources-sotilasmerkisto'
  | 'kalustokuvasto-maavoimat'
  | 'kalustokuvasto-merivoimat'
  | 'kalustokuvasto-ilma-avaruusvoimat'
  | 'kalustokuvasto-miehittamattomat-jarjestelmat'
  | 'kalustokuvasto-maahanlaskujoukot'
  | 'kalustokuvasto-strategiset-ohjusjoukot'
  | 'short-story-weapons-and-ammunition'
  | 'short-story-equipment-and-platforms'
  | 'short-story-organization-structure'
  | 'short-story-ivan-in-ukraine-full'
  | null

type StoryPage =
  | 'short-story-weapons-and-ammunition'
  | 'short-story-equipment-and-platforms'
  | 'short-story-organization-structure'
  | 'short-story-ivan-in-ukraine-full'

const EQUIPMENT_CATALOG_OPTIONS = [
  {
    id: 'kalustokuvasto-maavoimat' as const,
    file: 'maavoimat.md',
    labelFi: 'Maavoimat',
    labelEn: 'Ground Forces',
  },
  {
    id: 'kalustokuvasto-merivoimat' as const,
    file: 'merivoimat.md',
    labelFi: 'Merivoimat',
    labelEn: 'Navy',
  },
  {
    id: 'kalustokuvasto-ilma-avaruusvoimat' as const,
    file: 'ilma-avaruusvoimat.md',
    labelFi: 'Ilma-avaruusvoimat',
    labelEn: 'Aerospace Forces',
  },
  {
    id: 'kalustokuvasto-miehittamattomat-jarjestelmat' as const,
    file: 'miehittamattomat-jarjestelmat.md',
    labelFi: 'Miehittamattomat järjestelmät',
    labelEn: 'Unmanned Systems',
  },
  {
    id: 'kalustokuvasto-maahanlaskujoukot' as const,
    file: 'maahanlaskujoukot.md',
    labelFi: 'Maahanlaskujoukot',
    labelEn: 'Airborne Forces',
  },
  {
    id: 'kalustokuvasto-strategiset-ohjusjoukot' as const,
    file: 'strategiset-ohjusjoukot.md',
    labelFi: 'Strategiset ohjusjoukot',
    labelEn: 'Strategic Missile Forces',
  },
]

const SOURCES_OPTIONS = [
  {
    id: 'sources-sotilassanasto' as const,
    file: '00-sotilassanasto-sources.md',
    labelFi: 'Sotilassanasto',
    labelEn: 'Military Vocabulary',
  },
  {
    id: 'sources-puolustushaarat' as const,
    file: '01-puolustushaarat-sources.md',
    labelFi: 'Puolustushaarat',
    labelEn: 'Military Branches',
  },
  {
    id: 'sources-sotilaspiirit' as const,
    file: '02-sotilaspiirit-sources.md',
    labelFi: 'Sotilaspiirit',
    labelEn: 'Military Districts',
  },
  {
    id: 'sources-sotilasarvot' as const,
    file: '03-sotilasarvot-sources.md',
    labelFi: 'Sotilasarvot',
    labelEn: 'Military Ranks',
  },
  {
    id: 'sources-sotilasmerkisto' as const,
    file: '04-sotilasmerkisto-sources.md',
    labelFi: 'Sotilasmerkisto',
    labelEn: 'Military Symbology',
  },
]

const SHORT_WAR_STORY_OPTIONS = [
  {
    id: 'short-story-ivan-in-ukraine-full' as const,
    file: 'Ivan_in_Ukraine_All_Stories_Russian.md',
    audioFile: 'Ivan-in-Ukraine_FULL.mp3',
    labelFi: 'Ivan in Ukraine - Full Story',
    labelEn: 'Ivan in Ukraine - Full Story',
    available: true,
  },
  {
    id: 'short-story-weapons-and-ammunition' as const,
    file: 'Part_1_Weapons_and_Ammunition.md',
    audioFile: 'Part_1_Weapons_and_Ammunition.mp3',
    labelFi: 'Osa 1: Tervetuloa SVO:hon',
    labelEn: 'Part 1: Welcome to the SVO',
    available: true,
  },
  {
    id: 'short-story-equipment-and-platforms' as const,
    file: 'Part_2_Equipment_and_Platforms.md',
    audioFile: 'Part_2_Equipment_and_Platforms.mp3',
    labelFi: 'Osa 2: Paperitiikeri',
    labelEn: 'Part 2: Paper Tiger',
    available: true,
  },
  {
    id: 'short-story-organization-structure' as const,
    file: 'Part_3_Organization_Structure.md',
    audioFile: 'Part_3_Organization_Structure.mp3',
    labelFi: 'Osa 3: Iso armeija, pieni soppa',
    labelEn: 'Part 3: Big Army, Small Soup',
    available: true,
  },
  {
    labelFi: 'Koulutus ja teht\u00E4v\u00E4t',
    labelEn: 'Training and Tasks',
    available: false,
  },
  {
    labelFi: 'Taistelu ja taktiikka',
    labelEn: 'Combat and Tactics',
    available: false,
  },
  {
    labelFi: 'Maasto ja linnoitteet',
    labelEn: 'Terrain and Fortifications',
    available: false,
  },
  {
    labelFi: 'Sotilasarvot',
    labelEn: 'Military Ranks',
    available: false,
  },
  {
    labelFi: 'Kyberturvallisuuden k\u00E4sitteist\u00F6',
    labelEn: 'Cybersecurity Terminology',
    available: false,
  },
]

interface SplashScreenProps {
  onPlay: () => void
  onPlayMemoryGame: () => void
  onOpenDailyBrief: () => void
  muted: boolean
  appLanguage: AppLanguage
  onChangeLanguage: (language: AppLanguage) => void
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="splash-store-link-icon">
      <path
        fill="currentColor"
        d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.41-4.04-1.41-.55-1.37-1.33-1.73-1.33-1.73-1.09-.73.08-.72.08-.72 1.2.09 1.83 1.22 1.83 1.22 1.08 1.82 2.82 1.3 3.5 1 .11-.76.42-1.3.77-1.6-2.67-.3-5.47-1.31-5.47-5.86 0-1.3.47-2.36 1.22-3.2-.12-.3-.53-1.52.12-3.16 0 0 1-.32 3.3 1.22a11.6 11.6 0 0 1 6 0c2.3-1.54 3.3-1.22 3.3-1.22.65 1.64.24 2.86.12 3.16.76.84 1.22 1.9 1.22 3.2 0 4.56-2.8 5.56-5.48 5.85.43.37.81 1.1.81 2.22v3.29c0 .32.21.69.82.58A12 12 0 0 0 12 .5Z"
      />
    </svg>
  )
}

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="splash-store-link-icon">
      <path fill="#00d07f" d="M3.18 2.36c-.27.3-.43.74-.43 1.31v16.66c0 .57.16 1.01.43 1.31l.07.07L12.6 12 3.25 2.29l-.07.07Z" />
      <path fill="#00a1ff" d="m15.72 15.13-3.12-3.13L3.18 21.64c.42.45 1.1.5 1.88.08l10.66-6.59Z" />
      <path fill="#ff4d6d" d="M15.83 8.76 5.13 2.12c-.78-.42-1.46-.37-1.88.08L12.6 12l3.23-3.24Z" />
      <path fill="#ffb703" d="M21.26 10.95 15.83 8.76 12.6 12l3.12 3.13 5.52-3.42c.92-.57.92-1.5.02-1.86Z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="splash-store-link-icon">
      <path
        fill="#ff0000"
        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8Z"
      />
      <path fill="#fff" d="m9.6 15.6 6.2-3.6-6.2-3.6v7.2Z" />
    </svg>
  )
}

function FeedbackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="splash-store-link-icon">
      <path
        fill="currentColor"
        d="M4.5 4.25A2.75 2.75 0 0 0 1.75 7v7.25A2.75 2.75 0 0 0 4.5 17h1.25v2.75c0 .34.2.65.51.79.31.13.68.07.92-.17L10.55 17h8.95a2.75 2.75 0 0 0 2.75-2.75V7a2.75 2.75 0 0 0-2.75-2.75h-15Zm0 1.5h15c.69 0 1.25.56 1.25 1.25v7.25c0 .69-.56 1.25-1.25 1.25h-9.26c-.2 0-.39.08-.53.22l-2.46 2.46V16.25a.75.75 0 0 0-.75-.75h-2A1.25 1.25 0 0 1 3.25 14.25V7c0-.69.56-1.25 1.25-1.25Zm2.25 3.5a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H6.75Zm0 3.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z"
      />
    </svg>
  )
}

export function SplashScreen({ onPlay, onPlayMemoryGame, onOpenDailyBrief, muted, appLanguage, onChangeLanguage }: SplashScreenProps) {
  const isEnglish = appLanguage === 'eng'
  const [infoPage, setInfoPage] = useState<InfoPage>(null)
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false)
  const [isEquipmentMenuOpen, setIsEquipmentMenuOpen] = useState(false)
  const [isSourcesMenuOpen, setIsSourcesMenuOpen] = useState(false)
  const [isShortStoriesMenuOpen, setIsShortStoriesMenuOpen] = useState(false)
  const [pageContent, setPageContent] = useState<string | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)
  const [isStoryAudioPlaying, setIsStoryAudioPlaying] = useState(false)
  const [storyAudioCurrentTime, setStoryAudioCurrentTime] = useState(0)
  const [storyAudioDuration, setStoryAudioDuration] = useState(0)
  const introAudioRef = useRef<HTMLAudioElement | null>(null)
  const storyAudioRef = useRef<HTMLAudioElement | null>(null)

  const equipmentCatalogPage = EQUIPMENT_CATALOG_OPTIONS.find((option) => option.id === infoPage)
  const sourcesPage = SOURCES_OPTIONS.find((option) => option.id === infoPage)
  const storyPage = SHORT_WAR_STORY_OPTIONS.find((option): option is Extract<typeof SHORT_WAR_STORY_OPTIONS[number], { id: StoryPage }> => option.available && option.id === infoPage)
  const pageUrl = infoPage === 'tietoa'
      ? TIETOA_URL
      : infoPage === 'paivitykset'
        ? UPDATES_URL
        : infoPage === 'soundtrack'
          ? SOUNDTRACK_URL
          : storyPage
            ? `${SHORT_WAR_STORIES_BASE_URL}${storyPage.file}`
          : sourcesPage
            ? `${SETTINGS_SOURCES_BASE_URL}${sourcesPage.file}`
          : equipmentCatalogPage
            ? `${import.meta.env.BASE_URL}kalustokuvasto/${equipmentCatalogPage.file}`
            : null
  const storyAudioUrl = storyPage ? `${SHORT_WAR_STORIES_AUDIO_BASE_URL}${storyPage.audioFile}` : null
  const pageTitle = infoPage === 'tietoa'
      ? (isEnglish ? 'About' : 'Tietoa')
      : infoPage === 'paivitykset'
        ? (isEnglish ? 'Updates' : 'Paivitykset')
        : infoPage === 'soundtrack'
          ? (isEnglish ? 'Soundtrack' : 'Soundtrack')
          : storyPage
            ? (isEnglish ? storyPage.labelEn : storyPage.labelFi)
          : sourcesPage
            ? (isEnglish ? sourcesPage.labelEn : sourcesPage.labelFi)
          : equipmentCatalogPage
            ? (isEnglish ? equipmentCatalogPage.labelEn : equipmentCatalogPage.labelFi)
            : ''

  useEffect(() => {
    const showMainSplash = infoPage === null
    if (showMainSplash && !muted) {
      const audio = new Audio(INTRO_URL)
      introAudioRef.current = audio
      audio.volume = 0.7
      audio.play().catch(() => {})
      return () => {
        audio.pause()
        audio.currentTime = 0
        introAudioRef.current = null
      }
    }
    if (introAudioRef.current) {
      introAudioRef.current.pause()
      introAudioRef.current.currentTime = 0
      introAudioRef.current = null
    }
  }, [infoPage, muted])

  useEffect(() => {
    if (pageUrl == null) return
    setPageError(null)
    setPageContent(null)
    const freshUrl = `${pageUrl}${pageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`
    fetch(freshUrl, { cache: 'no-store' })
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error('Could not load page'))))
      .then(setPageContent)
      .catch(() => setPageError(isEnglish ? 'Could not load content.' : 'Sisaltoa ei voitu ladata.'))
  }, [pageUrl, isEnglish])

  useEffect(() => {
    if (storyAudioRef.current) {
      storyAudioRef.current.pause()
      storyAudioRef.current.currentTime = 0
      storyAudioRef.current = null
    }
    setIsStoryAudioPlaying(false)
    setStoryAudioCurrentTime(0)
    setStoryAudioDuration(0)
  }, [storyAudioUrl])

  useEffect(() => {
    return () => {
      if (storyAudioRef.current) {
        storyAudioRef.current.pause()
        storyAudioRef.current.currentTime = 0
        storyAudioRef.current = null
      }
    }
  }, [])

  const openInfoPage = (page: InfoPage) => {
    playButtonClick(muted)
    setIsInfoMenuOpen(false)
    setIsEquipmentMenuOpen(false)
    setIsSourcesMenuOpen(false)
    setIsShortStoriesMenuOpen(false)
    setInfoPage(page)
  }

  const openKalustokuvastoMenu = () => {
    playButtonClick(muted)
    setIsEquipmentMenuOpen(true)
  }

  const openShortStoriesMenu = () => {
    playButtonClick(muted)
    setIsShortStoriesMenuOpen(true)
  }

  const openGithub = () => {
    playButtonClick(muted)
    window.open(GITHUB_URL, '_blank', 'noopener,noreferrer')
  }

  const openGooglePlay = () => {
    playButtonClick(muted)
    window.open(GOOGLE_PLAY_URL, '_blank', 'noopener,noreferrer')
  }

  const openYouTube = () => {
    playButtonClick(muted)
    window.open(YOUTUBE_URL, '_blank', 'noopener,noreferrer')
  }

  const openFeedback = () => {
    playButtonClick(muted)
    window.open(FEEDBACK_URL, '_blank', 'noopener,noreferrer')
  }

  const openInfoMenu = () => {
    playButtonClick(muted)
    setIsInfoMenuOpen(true)
  }

  const openSourcesMenu = () => {
    playButtonClick(muted)
    setIsSourcesMenuOpen(true)
  }

  const closeInfoMenu = () => {
    playButtonClick(muted)
    setIsInfoMenuOpen(false)
  }

  const closeEquipmentMenu = () => {
    playButtonClick(muted)
    setIsEquipmentMenuOpen(false)
  }

  const closeSourcesMenu = () => {
    playButtonClick(muted)
    setIsSourcesMenuOpen(false)
  }

  const closeShortStoriesMenu = () => {
    playButtonClick(muted)
    setIsShortStoriesMenuOpen(false)
  }

  const toggleStoryAudio = () => {
    if (!storyAudioUrl) return
    let audio = storyAudioRef.current
    if (!audio) {
      const createdAudio = new Audio(storyAudioUrl)
      createdAudio.volume = 0.85
      createdAudio.loop = true
      createdAudio.addEventListener('timeupdate', () => setStoryAudioCurrentTime(createdAudio.currentTime))
      createdAudio.addEventListener('loadedmetadata', () => setStoryAudioDuration(Number.isFinite(createdAudio.duration) ? createdAudio.duration : 0))
      createdAudio.addEventListener('durationchange', () => setStoryAudioDuration(Number.isFinite(createdAudio.duration) ? createdAudio.duration : 0))
      createdAudio.addEventListener('ended', () => setIsStoryAudioPlaying(false))
      storyAudioRef.current = createdAudio
      audio = createdAudio
    }
    if (audio.paused) {
      audio.play()
        .then(() => setIsStoryAudioPlaying(true))
        .catch(() => setIsStoryAudioPlaying(false))
    } else {
      audio.pause()
      setIsStoryAudioPlaying(false)
    }
  }

  const restartStoryAudio = () => {
    if (!storyAudioUrl) return
    playButtonClick(muted)
    let audio = storyAudioRef.current
    if (!audio) {
      const createdAudio = new Audio(storyAudioUrl)
      createdAudio.volume = 0.85
      createdAudio.loop = true
      createdAudio.addEventListener('timeupdate', () => setStoryAudioCurrentTime(createdAudio.currentTime))
      createdAudio.addEventListener('loadedmetadata', () => setStoryAudioDuration(Number.isFinite(createdAudio.duration) ? createdAudio.duration : 0))
      createdAudio.addEventListener('durationchange', () => setStoryAudioDuration(Number.isFinite(createdAudio.duration) ? createdAudio.duration : 0))
      createdAudio.addEventListener('ended', () => setIsStoryAudioPlaying(false))
      storyAudioRef.current = createdAudio
      audio = createdAudio
    }
    audio.currentTime = 0
    setStoryAudioCurrentTime(0)
    audio.play()
      .then(() => setIsStoryAudioPlaying(true))
      .catch(() => setIsStoryAudioPlaying(false))
  }

  const seekStoryAudio = (time: number) => {
    const audio = storyAudioRef.current
    if (!audio) return
    audio.currentTime = time
    setStoryAudioCurrentTime(time)
  }

  const formatAudioTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '0:00'
    const wholeSeconds = Math.max(0, Math.floor(seconds))
    const hours = Math.floor(wholeSeconds / 3600)
    const minutes = Math.floor((wholeSeconds % 3600) / 60)
    const remainingSeconds = wholeSeconds % 60
    return hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
      : `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
  }

  const handleLogoClick = () => {
    if (muted) return
    if (introAudioRef.current) {
      introAudioRef.current.currentTime = 0
      introAudioRef.current.play().catch(() => {})
    } else {
      const audio = new Audio(INTRO_URL)
      introAudioRef.current = audio
      audio.volume = 0.7
      audio.play().catch(() => {})
    }
  }

  if (infoPage != null) {
    return (
      <div className="splash-screen splash-screen--info">
        <div className="splash-info-page">
          <div className="splash-info-header">
            <button type="button" className="splash-info-back" onClick={() => setInfoPage(null)} aria-label={isEnglish ? 'Back to start' : 'Aloitusnaytolle'}>
              ??
            </button>
            <h1 className="splash-info-page-title">{pageTitle}</h1>
            <span className="splash-info-header-spacer" aria-hidden="true" />
          </div>
          {storyAudioUrl && (
            <div className="short-story-audio-player" aria-label={isEnglish ? 'Story audio controls' : 'Tarinan \u00E4\u00E4niohjaimet'}>
              <div className="short-story-audio-controls">
                <button type="button" className="short-story-audio-btn" onClick={toggleStoryAudio}>
                  {isStoryAudioPlaying ? (isEnglish ? 'Pause' : 'Tauko') : (isEnglish ? 'Play Audio' : 'Toista \u00E4\u00E4ni')}
                </button>
                <button type="button" className="short-story-audio-btn short-story-audio-btn-secondary" onClick={restartStoryAudio}>
                  {isEnglish ? 'Start Over' : 'Alusta'}
                </button>
              </div>
              <div className="short-story-audio-seek">
                <span>{formatAudioTime(storyAudioCurrentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={storyAudioDuration || 0}
                  step="0.1"
                  value={Math.min(storyAudioCurrentTime, storyAudioDuration || 0)}
                  onChange={(event) => seekStoryAudio(Number(event.target.value))}
                  disabled={storyAudioDuration === 0}
                  aria-label={isEnglish ? 'Audio position' : '\u00C4\u00E4nen kohta'}
                />
                <span>{formatAudioTime(storyAudioDuration)}</span>
              </div>
            </div>
          )}
          <div className="splash-info-body">
            {pageError && <p className="splash-info-error">{pageError}</p>}
            {pageContent == null && !pageError && (
              <p className="splash-info-loading">{isEnglish ? 'Loading...' : 'Ladataan...'}</p>
            )}
            {pageContent != null && (
              <div className="splash-info-markdown">
                <ReactMarkdown>{pageContent}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <h1 className={`splash-title title-ukraine${isEnglish ? ' title-ukraine--english' : ''}`}>
          {isEnglish ? (
            <>
              <span className="title-line title-line-top">All Things</span>
              <span className="title-line title-line-bottom">Russian Military 101</span>
            </>
          ) : (
            <>
              <span className="title-line title-line-top">Sotilasvenäjän</span>
              <span className="title-line title-line-bottom">villapaitapeli</span>
            </>
          )}
        </h1>
        <button
          type="button"
          className="splash-logo-btn"
          onClick={handleLogoClick}
          aria-label={isEnglish ? 'Replay intro' : 'Toista intro'}
        >
          <img src={FAVICON_SRC} alt="" className="splash-logo" />
        </button>
        <div className="splash-language-picker">
          <span className="splash-language-label">{isEnglish ? 'Choose language' : 'Valitse kieli'}</span>
          <div className="landing-language-switch" role="group" aria-label="Language">
            <button type="button" className={`lang-btn ${appLanguage === 'fin' ? 'active' : ''}`} onClick={() => onChangeLanguage('fin')}>
              <span className="lang-flag" aria-hidden="true">{"\uD83C\uDDEB\uD83C\uDDEE"}</span> FIN
            </button>
            <button type="button" className={`lang-btn ${appLanguage === 'eng' ? 'active' : ''}`} onClick={() => onChangeLanguage('eng')}>
              <span className="lang-flag" aria-hidden="true">{"\uD83C\uDDEC\uD83C\uDDE7"}</span> ENG
            </button>
          </div>
        </div>
        <div className="splash-buttons">
          <button type="button" className="splash-play-btn" onClick={onPlay}>
            {isEnglish ? 'Play Military Quiz' : 'Pelaa sotilastietovisaa'}
          </button>
          <button type="button" className="splash-info-btn" onClick={onPlayMemoryGame}>
            {isEnglish ? 'Play Military Memory Game' : 'Pelaa sotilasmuistipeli\u00E4'}
          </button>
          <button type="button" className="splash-info-btn splash-primary-btn" onClick={openShortStoriesMenu}>
            {isEnglish ? 'Short War Stories' : 'Lyhyit\u00E4 sotatarinoita'}
          </button>
          <button type="button" className="splash-info-btn splash-primary-btn" onClick={onOpenDailyBrief}>
            {isEnglish ? 'Daily OSINT Brief' : 'P\u00E4ivitt\u00E4inen OSINT-katsaus'}
          </button>
          <button type="button" className="splash-info-btn splash-danger-btn" onClick={openKalustokuvastoMenu}>
            {isEnglish ? 'Equipment Catalog' : 'Kalustokuvasto'}
          </button>
          <button type="button" className="splash-info-btn splash-settings-btn splash-danger-btn" onClick={openInfoMenu}>
            {isEnglish ? 'Information & Settings' : 'Tiedot ja asetukset'}
          </button>
        </div>
        <div className="splash-store-links" aria-label={isEnglish ? 'External links' : 'Ulkoiset linkit'}>
          <div className="splash-store-link-group">
            <span className="splash-store-links-label">{isEnglish ? 'Available on:' : 'Saatavilla:'}</span>
            <div className="splash-store-links-row">
              <button
                type="button"
                className="splash-store-link-btn"
                onClick={openGithub}
                aria-label={isEnglish ? 'Open GitHub page' : 'Avaa GitHub-sivu'}
                title="GitHub"
              >
                <GitHubIcon />
              </button>
              <button
                type="button"
                className="splash-store-link-btn"
                onClick={openYouTube}
                aria-label={isEnglish ? 'Open YouTube channel' : 'Avaa YouTube-kanava'}
                title="YouTube"
              >
                <YouTubeIcon />
              </button>
              <button
                type="button"
                className="splash-store-link-btn"
                onClick={openGooglePlay}
                aria-label={isEnglish ? 'Open Google Play page' : 'Avaa Google Play -sivu'}
                title="Google Play"
              >
                <GooglePlayIcon />
              </button>
            </div>
          </div>
          <div className="splash-store-link-group">
            <span className="splash-store-links-label splash-feedback-label">{isEnglish ? 'Give Feedback' : 'Anna palautetta'}</span>
            <div className="splash-store-links-row">
              <button
                type="button"
                className="splash-store-link-btn"
                onClick={openFeedback}
                aria-label={isEnglish ? 'Give feedback' : 'Anna palautetta'}
                title={isEnglish ? 'Give Feedback' : 'Anna palautetta'}
              >
                <FeedbackIcon />
              </button>
            </div>
          </div>
        </div>
        {isInfoMenuOpen && (
          <div className="splash-menu-overlay" role="dialog" aria-modal="true" aria-label={isEnglish ? 'Information and settings' : 'Tiedot ja asetukset'}>
            <button type="button" className="splash-menu-backdrop" onClick={closeInfoMenu} aria-label={isEnglish ? 'Close menu' : 'Sulje valikko'} />
            <div className="splash-menu-card">
              <div className="splash-menu-header">
                <h2 className="splash-menu-title">{isEnglish ? 'Information & Settings' : 'Tiedot ja asetukset'}</h2>
                <button type="button" className="splash-menu-close" onClick={closeInfoMenu} aria-label={isEnglish ? 'Close menu' : 'Sulje valikko'}>
                  ?
                </button>
              </div>
              <div className="splash-menu-buttons">
                <button type="button" className="splash-info-btn" onClick={() => openInfoPage('tietoa')}>
                  {isEnglish ? 'About' : 'Tietoa'}
                </button>
                <button type="button" className="splash-info-btn" onClick={() => openInfoPage('paivitykset')}>
                  {isEnglish ? 'Updates' : 'Päivitykset'}
                </button>
                <button type="button" className="splash-info-btn" onClick={openSourcesMenu}>
                  {isEnglish ? 'Sources & Licenses' : 'Lähteet ja lisenssit'}
                </button>
                <button type="button" className="splash-info-btn" onClick={() => openInfoPage('soundtrack')}>
                  {isEnglish ? 'Soundtrack' : 'Soundtrack'}
                </button>
              </div>
            </div>
          </div>
        )}
        {isSourcesMenuOpen && (
          <div className="splash-menu-overlay" role="dialog" aria-modal="true" aria-label={isEnglish ? 'Sources and licenses' : 'Lähteet ja lisenssit'}>
            <button type="button" className="splash-menu-backdrop" onClick={closeSourcesMenu} aria-label={isEnglish ? 'Close menu' : 'Sulje valikko'} />
            <div className="splash-menu-card splash-menu-card-wide">
              <div className="splash-menu-header">
                <h2 className="splash-menu-title">{isEnglish ? 'Sources & Licenses' : 'Lähteet ja lisenssit'}</h2>
                <button type="button" className="splash-menu-close" onClick={closeSourcesMenu} aria-label={isEnglish ? 'Close menu' : 'Sulje valikko'}>
                  ?
                </button>
              </div>
              <div className="splash-menu-buttons">
                {SOURCES_OPTIONS.map((option) => (
                  <button key={option.id} type="button" className="splash-info-btn" onClick={() => openInfoPage(option.id)}>
                    {isEnglish ? option.labelEn : option.labelFi}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {isShortStoriesMenuOpen && (
          <div className="splash-menu-overlay" role="dialog" aria-modal="true" aria-label={isEnglish ? 'Short War Stories' : 'Lyhyit\u00E4 sotatarinoita'}>
            <button type="button" className="splash-menu-backdrop" onClick={closeShortStoriesMenu} aria-label={isEnglish ? 'Close menu' : 'Sulje valikko'} />
            <div className="splash-menu-card splash-menu-card-wide">
              <div className="splash-menu-header">
                <h2 className="splash-menu-title">{isEnglish ? 'Short War Stories' : 'Lyhyit\u00E4 sotatarinoita'}</h2>
                <button type="button" className="splash-menu-close" onClick={closeShortStoriesMenu} aria-label={isEnglish ? 'Close menu' : 'Sulje valikko'}>
                  ?
                </button>
              </div>
              <div className="splash-menu-buttons">
                {SHORT_WAR_STORY_OPTIONS.map((option) => option.available && 'id' in option ? (
                  <button
                    key={option.labelEn}
                    type="button"
                    className={`splash-info-btn${option.id === 'short-story-ivan-in-ukraine-full' ? ' splash-info-btn-full-story' : ''}`}
                    onClick={() => openInfoPage(option.id as StoryPage)}
                  >
                    {isEnglish ? option.labelEn : option.labelFi}
                  </button>
                ) : (
                  <button key={option.labelEn} type="button" className="splash-info-btn splash-info-btn-disabled" disabled>
                    {isEnglish ? `${option.labelEn} (Coming Soon)` : `${option.labelFi} (Tulossa)`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {isEquipmentMenuOpen && (
          <div className="splash-menu-overlay" role="dialog" aria-modal="true" aria-label={isEnglish ? 'Equipment catalog' : 'Kalustokuvasto'}>
            <button type="button" className="splash-menu-backdrop" onClick={closeEquipmentMenu} aria-label={isEnglish ? 'Close menu' : 'Sulje valikko'} />
            <div className="splash-menu-card splash-menu-card-wide">
              <div className="splash-menu-header">
                <h2 className="splash-menu-title">{isEnglish ? 'Equipment Catalog' : 'Kalustokuvasto'}</h2>
                <button type="button" className="splash-menu-close" onClick={closeEquipmentMenu} aria-label={isEnglish ? 'Close menu' : 'Sulje valikko'}>
                  ?
                </button>
              </div>
              <div className="splash-menu-buttons">
                {EQUIPMENT_CATALOG_OPTIONS.map((option) => (
                  <button key={option.id} type="button" className="splash-info-btn splash-equipment-btn" onClick={() => openInfoPage(option.id)}>
                    {isEnglish ? option.labelEn : option.labelFi}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
