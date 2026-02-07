/**
 * Android back button: go back in WebView history when possible, otherwise exit.
 * Only runs when running inside Capacitor (native app).
 */
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

export function registerCapacitorBackButton(): void {
  if (!Capacitor.isNativePlatform()) return

  App.addListener('backButton', () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      void App.exitApp()
    }
  })
}
