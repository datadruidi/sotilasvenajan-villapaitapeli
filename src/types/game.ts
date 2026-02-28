/**
 * Shared game types. Country and branch align with user selection.
 * Image registry and game logic use these.
 */

export type CountryId = 'russia' | 'usa' | 'china'

export type VehicleBranch = 'army' | 'navy' | 'airforce' | 'other' | 'uav-systems' | 'strategic-missile' | 'airborne'
export type AppLanguage = 'fin' | 'eng'

/** Navy-only: quiz by vessel class (e.g. Steregushchiy) or by vessel name (e.g. Boikiy). */
export type NavySubMode = 'class' | 'vesselName'

/**
 * Single source-of-truth entry for one image.
 * The program does not analyze images; the correct answer is assigned here.
 */
export interface ImageEntry {
  /** Unique id for this image (e.g. for deduplication in options). */
  id: string
  /** Path to the image asset (e.g. /assets/vehicles/russia/navy/xyz.jpg). */
  assetPath: string
  country: CountryId
  branch: VehicleBranch
  /** Correct vehicle class name shown to user (e.g. "Steregushchiy class"). */
  correctClassName: string
  /** If false, this image is excluded from the game pool. */
  active: boolean
  /** Navy only: vessel name (e.g. Boikiy) when filename is class_vesselname.jpg. Used for "Alusten nimet" mode. */
  vesselName?: string
}

export interface GameSessionConfig {
  country: CountryId
  branch: VehicleBranch
}

/** Direction for words quiz: prompt language → answer language */
export type WordsDirection = 'fi-ru' | 'ru-fi'

export type WordsDifficulty = 'easy' | 'medium' | 'hard'

export interface WordPair {
  russian: string
  finnish: string
  /** When set: 3 wrong options in Finnish (for direction ru→fi). Use these instead of drawing from pool. */
  finnishAlts?: [string, string, string]
  /** When set: 3 wrong options in Russian (for direction fi→ru). Use these instead of drawing from pool. */
  russianAlts?: [string, string, string]
}

/**
 * One prompt (e.g. abbreviation + Finnish) and 4 Russian options (1 correct + 3 wrong).
 * CSV format: prompt,ve1,ve2,ve3,ve4 with ve1 = correct answer.
 */
export interface WordCardPrompt {
  prompt: string
  correct: string
  wrongOptions: [string, string, string]
}

export type WordEntry = WordPair | WordCardPrompt

export function isWordCardPrompt(entry: WordEntry): entry is WordCardPrompt {
  return 'prompt' in entry && 'wrongOptions' in entry
}
