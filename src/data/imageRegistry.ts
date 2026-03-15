/**
 * Image registry - fallback source of truth for quiz images that are not built
 * from the branch-specific asset lists under public/assets.
 */

import type { ImageEntry } from '../types/game'

const PLACEHOLDER = '/assets/sotilaspiirit/placeholder.svg'

/**
 * All images that may appear in fallback game modes. Russia branch modes use
 * dedicated image path lists plus runtime parsing.
 */
export const IMAGE_REGISTRY: ImageEntry[] = [
  { id: 'ru-army-1', assetPath: PLACEHOLDER, country: 'russia', branch: 'army', correctClassName: 'T-90 class', active: true },
  { id: 'ru-army-2', assetPath: PLACEHOLDER, country: 'russia', branch: 'army', correctClassName: 'T-72 class', active: true },
  { id: 'ru-army-3', assetPath: PLACEHOLDER, country: 'russia', branch: 'army', correctClassName: 'BMP-3 class', active: true },
  { id: 'ru-army-4', assetPath: PLACEHOLDER, country: 'russia', branch: 'army', correctClassName: 'BTR-82A class', active: true },
  { id: 'ru-army-5', assetPath: PLACEHOLDER, country: 'russia', branch: 'army', correctClassName: 'Kurganets class', active: true },
  { id: 'ru-other-1', assetPath: PLACEHOLDER, country: 'russia', branch: 'other', correctClassName: 'S-400 class', active: true },
  { id: 'ru-other-2', assetPath: PLACEHOLDER, country: 'russia', branch: 'other', correctClassName: 'Iskander class', active: true },
  { id: 'ru-other-3', assetPath: PLACEHOLDER, country: 'russia', branch: 'other', correctClassName: 'Buk class', active: true },
  { id: 'ru-other-4', assetPath: PLACEHOLDER, country: 'russia', branch: 'other', correctClassName: 'Pantsir class', active: true },
  { id: 'ru-other-5', assetPath: PLACEHOLDER, country: 'russia', branch: 'other', correctClassName: 'Orlan class', active: true },
]

