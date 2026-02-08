/**
 * Splash screen: logo, "Pelaa", "Tietoa" and "Lähteet ja lisenssit" buttons (same width).
 * Tietoa and Lähteet open separate pages with markdown from public/tietoa.md and public/lahteet.md.
 */

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { playButtonClick } from '../lib/sound'

const FAVICON_SRC = `${import.meta.env.BASE_URL}favicon.png`
const LAHTEET_URL = `${import.meta.env.BASE_URL}lahteet.md`
const TIETOA_URL = `${import.meta.env.BASE_URL}tietoa.md`

type InfoPage = 'lahteet' | 'tietoa' | null

interface SplashScreenProps {
  onPlay: () => void
  muted: boolean
}

export function SplashScreen({ onPlay, muted }: SplashScreenProps) {
  const [infoPage, setInfoPage] = useState<InfoPage>(null)
  const [pageContent, setPageContent] = useState<string | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)

  const pageUrl = infoPage === 'lahteet' ? LAHTEET_URL : infoPage === 'tietoa' ? TIETOA_URL : null
  const pageTitle = infoPage === 'lahteet' ? 'Lähteet ja lisenssit' : infoPage === 'tietoa' ? 'Tietoa' : ''

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
    playButtonClick(muted)
    onPlay()
  }

  const openInfoPage = (page: InfoPage) => {
    playButtonClick(muted)
    setInfoPage(page)
  }

  const handleInfoBack = () => {
    playButtonClick(muted)
    setInfoPage(null)
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
        <img src={FAVICON_SRC} alt="" className="splash-logo" />
        <h1 className="splash-title">Sotilasvenäjän villapaitapeli</h1>
        <div className="splash-buttons">
          <button type="button" className="splash-play-btn" onClick={handlePlayClick}>
            Pelaa
          </button>
          <button type="button" className="splash-info-btn" onClick={() => openInfoPage('tietoa')}>
            Tietoa
          </button>
          <button type="button" className="splash-info-btn" onClick={() => openInfoPage('lahteet')}>
            Lähteet ja lisenssit
          </button>
        </div>
      </div>
    </div>
  )
}
