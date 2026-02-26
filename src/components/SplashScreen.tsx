import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { AppLanguage } from '../types/game'
import { playButtonClick } from '../lib/sound'

const FAVICON_SRC = `${import.meta.env.BASE_URL}favicon.png`
const INTRO_URL = `${import.meta.env.BASE_URL}audio/intro.mp3`
const LAHTEET_URL = `${import.meta.env.BASE_URL}lahteet.md`
const TIETOA_URL = `${import.meta.env.BASE_URL}README.md`
const UPDATES_URL = `${import.meta.env.BASE_URL}UPDATES.md`

type InfoPage = 'lahteet' | 'tietoa' | 'paivitykset' | null

interface SplashScreenProps {
  onPlay: () => void
  muted: boolean
  appLanguage: AppLanguage
  onChangeLanguage: (language: AppLanguage) => void
}

export function SplashScreen({ onPlay, muted, appLanguage, onChangeLanguage }: SplashScreenProps) {
  const isEnglish = appLanguage === 'eng'
  const [infoPage, setInfoPage] = useState<InfoPage>(null)
  const [pageContent, setPageContent] = useState<string | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)
  const introAudioRef = useRef<HTMLAudioElement | null>(null)

  const pageUrl = infoPage === 'lahteet' ? LAHTEET_URL : infoPage === 'tietoa' ? TIETOA_URL : infoPage === 'paivitykset' ? UPDATES_URL : null
  const pageTitle = infoPage === 'lahteet'
    ? (isEnglish ? 'Sources and licenses' : 'Lahteet ja lisenssit')
    : infoPage === 'tietoa'
      ? (isEnglish ? 'About' : 'Tietoa')
      : infoPage === 'paivitykset'
        ? (isEnglish ? 'Updates' : 'Paivitykset')
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

  const openInfoPage = (page: InfoPage) => {
    playButtonClick(muted)
    setInfoPage(page)
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
              🏠
            </button>
            <h1 className="splash-info-page-title">{pageTitle}</h1>
            <span className="splash-info-header-spacer" aria-hidden="true" />
          </div>
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
        <h1 className="splash-title title-ukraine">{isEnglish ? 'Military Russian 101' : 'Sotilasvenäjän villapaitapeli'}</h1>
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
              <span className="lang-flag" aria-hidden="true">🇫🇮</span> FIN
            </button>
            <button type="button" className={`lang-btn ${appLanguage === 'eng' ? 'active' : ''}`} onClick={() => onChangeLanguage('eng')}>
              <span className="lang-flag" aria-hidden="true">🇬🇧</span> ENG
            </button>
          </div>
        </div>
        <div className="splash-buttons">
          <button type="button" className="splash-play-btn" onClick={onPlay}>
            {isEnglish ? 'Play' : 'Pelaa'}
          </button>
          <button type="button" className="splash-info-btn" onClick={() => openInfoPage('tietoa')}>
            {isEnglish ? 'About' : 'Tietoa'}
          </button>
          <button type="button" className="splash-info-btn" onClick={() => openInfoPage('paivitykset')}>
            {isEnglish ? 'Updates' : 'Paivitykset'}
          </button>
          <button type="button" className="splash-info-btn" onClick={() => openInfoPage('lahteet')}>
            {isEnglish ? 'Sources and licenses' : 'Lahteet ja lisenssit'}
          </button>
        </div>
      </div>
    </div>
  )
}
