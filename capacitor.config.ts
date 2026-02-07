import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor configuration.
 * - Release: Android app loads the bundled web app from dist/ (offline capable).
 * - Dev mode: Set CAPACITOR_DEV_SERVER to your PC's URL (e.g. http://192.168.1.100:5173)
 *   then run `npx cap sync android` and run from Android Studio. Remove or unset for release.
 */
const config: CapacitorConfig = {
  appId: 'com.sotilasvenajan.villapaitapeli',
  appName: 'Sotilasvenäjän villapaitapeli',
  webDir: 'dist',
  server: process.env.CAPACITOR_DEV_SERVER
    ? { url: process.env.CAPACITOR_DEV_SERVER, cleartext: true }
    : undefined,
}

export default config
