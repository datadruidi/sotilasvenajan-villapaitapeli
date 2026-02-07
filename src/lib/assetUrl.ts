/**
 * Resolve asset path for correct loading on web and Capacitor (Android).
 * Vite uses base: './' for Capacitor; BASE_URL is './' so assets load from the app bundle.
 */
export function getAssetUrl(path: string): string {
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `${import.meta.env.BASE_URL}${normalized}`
}
