/**
 * Ladataan…-ikkuna: loading overlay shown after user makes main/home selections.
 * Displays "Ladataan…", plays waiting music, blocks interaction for 3 seconds,
 * then calls onComplete. Stops audio on unmount or when loading ends.
 */

import { useEffect, useRef } from 'react'

const LADAAN_IKKUNA_DURATION_MS = 3000

/** Waiting music for the loading overlay (only this file, no fallback). */
const LOADING_MUSIC_SRC = `${import.meta.env.BASE_URL}audio/loading.mp3`

interface LadataanIkkunaProps {
  onComplete: () => void
  muted: boolean
}

export function LadataanIkkuna({ onComplete, muted }: LadataanIkkunaProps) {
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
      /* Only loading.mp3; no fallback to other music */
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

  return (
    <div className="ladataan-ikkuna" role="status" aria-live="polite" aria-label="Ladataan">
      <div className="ladataan-ikkuna-backdrop" />
      <div className="ladataan-ikkuna-content">
        <p className="ladataan-ikkuna-text">Ladataan…</p>
      </div>
    </div>
  )
}
