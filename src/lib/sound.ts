/**
 * Play feedback sounds for correct/wrong answers and round complete.
 * Place your MP3 files in public/audio/:
 *   - correct.mp3  (played when answer is correct)
 *   - wrong.mp3    (played when answer is wrong)
 *   - complete.mp3 (played when the round is complete, after 10 questions)
 *   - button.mp3   (played when clicking buttons on front/option menu, not in-game)
 */

const getAudioUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
const CORRECT_URL = getAudioUrl('/audio/correct.mp3')
const WRONG_URL = getAudioUrl('/audio/wrong.mp3')
const COMPLETE_URL = getAudioUrl('/audio/complete.mp3')
const BUTTON_URL = getAudioUrl('/audio/button.mp3')

function playSound(url: string): void {
  try {
    const audio = new Audio(url)
    audio.volume = 1
    audio.play().catch(() => {
      // Ignore autoplay policy or load errors (e.g. file missing)
    })
  } catch {
    // Ignore
  }
}

export function playCorrect(muted?: boolean): void {
  if (muted) return
  playSound(CORRECT_URL)
}

export function playWrong(muted?: boolean): void {
  if (muted) return
  playSound(WRONG_URL)
}

export function playRoundComplete(muted?: boolean): void {
  if (muted) return
  playSound(COMPLETE_URL)
}

/** Play when user clicks buttons on front screen / option menu (not inside the game). */
export function playButtonClick(muted?: boolean): void {
  if (muted) return
  playSound(BUTTON_URL)
}
