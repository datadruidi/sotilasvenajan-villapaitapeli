/** A single media element/session owns the entire playlist, including track changes. */
export function createBrowserShufflePlayer(
  tracks: readonly string[],
  baseUrl: string,
  onState: (track: string, playing: boolean) => void,
  random = Math.random,
) {
  if (!tracks.length) throw new Error('No shuffle tracks')
  const audio = new Audio()
  audio.preload = 'auto'
  audio.hidden = true
  document.body.append(audio)
  let disposed = false
  let remaining: string[] = []
  let track = ''
  const session = navigator.mediaSession
  const publish = () => {
    if (disposed) return
    const playing = !audio.paused && !audio.ended
    if (session) session.playbackState = playing ? 'playing' : 'paused'
    onState(track, playing)
  }
  const play = () => {
    if (disposed) return
    void audio.play().then(publish).catch(publish)
  }
  const next = () => {
    if (disposed) return
    if (!remaining.length) {
      remaining = [...tracks]
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[remaining[i], remaining[j]] = [remaining[j], remaining[i]]
      }
      const last = remaining.length - 1
      if (last > 0 && remaining[last] === track) {
        ;[remaining[0], remaining[last]] = [remaining[last], remaining[0]]
      }
    }
    track = remaining.pop()!
    audio.src = `${baseUrl}${encodeURIComponent(track)}`
    // Reset the completed resource before starting the next one on mobile browsers.
    audio.load()
    if (session && typeof MediaMetadata !== 'undefined') {
      session.metadata = new MediaMetadata({ title: track.replace(/\.mp3$/iu, ''), album: 'Tartu mikkiin' })
    }
    onState(track, false)
    play()
  }
  const pause = () => { audio.pause(); publish() }
  const stop = () => { audio.pause(); audio.currentTime = 0; publish() }
  audio.onended = next
  audio.onplaying = publish
  audio.onpause = publish
  audio.onerror = publish
  const actions = { play, pause, stop, nexttrack: next }
  if (session) {
    for (const [action, handler] of Object.entries(actions)) {
      try { session.setActionHandler(action as MediaSessionAction, handler) } catch { /* Optional browser capability. */ }
    }
  }
  return {
    audio, start: next, stop,
    dispose() {
      disposed = true
      audio.onended = audio.onplaying = audio.onpause = audio.onerror = null
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      audio.remove()
      if (session) {
        for (const action of Object.keys(actions)) {
          try { session.setActionHandler(action as MediaSessionAction, null) } catch { /* Optional browser capability. */ }
        }
        session.playbackState = 'none'
        session.metadata = null
      }
    },
  }
}
