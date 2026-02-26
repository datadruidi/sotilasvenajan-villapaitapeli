import { useEffect, useRef } from 'react'
import type { AppLanguage } from '../types/game'

const LADAAN_IKKUNA_DURATION_MS = 3000
const LOADING_MUSIC_SRC = `${import.meta.env.BASE_URL}audio/loading.mp3`

interface LadataanIkkunaProps {
  onComplete: () => void
  muted: boolean
  appLanguage: AppLanguage
}

export function LadataanIkkuna({ onComplete, muted, appLanguage }: LadataanIkkunaProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const done = () => onCompleteRef.current()

    if (muted) {
      timeoutRef.current = setTimeout(done, LADAAN_IKKUNA_DURATION_MS)
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    }

    const audio = new Audio(LOADING_MUSIC_SRC)
    audioRef.current = audio
    audio.volume = 0.6
    audio.play().catch(() => {
      // Only loading.mp3; no fallback.
    })

    timeoutRef.current = setTimeout(() => {
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
      done()
    }, LADAAN_IKKUNA_DURATION_MS)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
  }, [muted])

  const isEnglish = appLanguage === 'eng'

  return (
    <div className="ladataan-ikkuna" role="status" aria-live="polite" aria-label={isEnglish ? 'Loading' : 'Ladataan'}>
      <div className="ladataan-ikkuna-backdrop" />
      <div className="ladataan-ikkuna-content">
        <p className="ladataan-ikkuna-text">{isEnglish ? 'Loading...' : 'Ladataan...'}</p>
      </div>
    </div>
  )
}
