const STORAGE_KEY = 'military-cyrillic-typing-best-times'

export function loadTypingBestTimes(): Record<string, number> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => typeof value === 'number' && Number.isFinite(value) && value > 0))
  } catch {
    return {}
  }
}

export function saveTypingBestTime(sentenceId: string, milliseconds: number): number {
  const times = loadTypingBestTimes()
  const best = times[sentenceId]
  if (best == null || milliseconds < best) {
    times[sentenceId] = milliseconds
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(times)) } catch { /* storage may be unavailable */ }
    return milliseconds
  }
  return best
}
