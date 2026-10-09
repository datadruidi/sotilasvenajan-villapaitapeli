import { Capacitor, registerPlugin } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'

export interface ShuffleAudioState {
  track: string
  playing: boolean
}

export const hasNativeShuffleAudio = Capacitor.getPlatform() === 'android'
export const shuffleAudio = registerPlugin<{
  start(options: { tracks: string[] }): Promise<void>
  control(options: { action: 'play' | 'pause' | 'stop' }): Promise<void>
  status(): Promise<ShuffleAudioState>
  addListener(event: 'state', listener: (state: ShuffleAudioState) => void): Promise<PluginListenerHandle>
}>('ShuffleAudio')
