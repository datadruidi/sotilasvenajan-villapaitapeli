export type TypingDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'superhuman'

export interface TypingSentence {
  id: string
  difficulty: TypingDifficulty
  russian: string
  translations: { fi: string; en: string }
  vocabulary: string[]
  enabled: boolean
}

export interface TypingAttemptStats {
  totalCharacterAttempts: number
  correctCharacterAttempts: number
  incorrectCharacterAttempts: number
}
