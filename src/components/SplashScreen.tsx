/**
 * Splash screen: logo, "Pelaa", "Tietoa" and "Lähteet ja lisenssit" buttons (same width).
 * Tietoa opens README.md (copied to public/ at build); Lähteet opens public/lahteet.md.
 * intro.mp3 plays when the main splash is shown (on open or when returning via "Takaisin aloitusnäytölle").
 */

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
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
}

export function SplashScreen({ onPlay, muted }: SplashScreenProps) {
  const [infoPage, setInfoPage] = useState<InfoPage>(null)
  const [pageContent, setPageContent] = useState<string | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)
  const introAudioRef = useRef<HTMLAudioElement | null>(null)

  const pageUrl = infoPage === 'lahteet' ? LAHTEET_URL : infoPage === 'tietoa' ? TIETOA_URL : infoPage === 'paivitykset' ? UPDATES_URL : null
  const pageTitle = infoPage === 'lahteet' ? 'Lähteet ja lisenssit' : infoPage === 'tietoa' ? 'Tietoa' : infoPage === 'paivitykset' ? 'Päivitykset' : ''

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
    fetch(pageUrl)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error('Sivua ei ladattu'))))
      .then(setPageContent)
      .catch(() => setPageError('Sisältöä ei voitu ladata.'))
  }, [pageUrl])

  const handlePlayClick = () => {
    onPlay()
  }

  const openInfoPage = (page: InfoPage) => {
    playButtonClick(muted)
    setInfoPage(page)
  }

  const handleInfoBack = () => {
    setInfoPage(null)
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
          <button type="button" className="splash-info-back" onClick={handleInfoBack}>
            ← Takaisin aloitusnäytölle
          </button>
          <h1 className="splash-info-page-title">{pageTitle}</h1>
          <div className="splash-info-body">
            {pageError && <p className="splash-info-error">{pageError}</p>}
            {pageContent == null && !pageError && (
              <p className="splash-info-loading">Ladataan…</p>
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
        <button
          type="button"
          className="splash-logo-btn"
          onClick={handleLogoClick}
          aria-label="Toista intro"
        >
          <img src={FAVICON_SRC} alt="" className="splash-logo" />
        </button>
        <h1 className="splash-title">Sotilasvenäjän villapaitapeli</h1>
        <div className="splash-buttons">
          <button type="button" className="splash-play-btn" onClick={handlePlayClick}>
            Pelaa
          </button>
          <button type="button" className="splash-info-btn" onClick={() => openInfoPage('tietoa')}>
            Tietoa
          </button>
          <button type="button" className="splash-info-btn" onClick={() => openInfoPage('paivitykset')}>
            Päivitykset
          </button>
          <button type="button" className="splash-info-btn" onClick={() => openInfoPage('lahteet')}>
            Lähteet ja lisenssit
          </button>
        </div>
      </div>
    </div>
  )
}
