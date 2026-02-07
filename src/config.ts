/**
 * Environment-based app config. Use this for any API or external base URLs
 * so dev and production stay separate (no hardcoded localhost in production).
 *
 * Vite exposes env vars prefixed with VITE_ via import.meta.env.
 * See .env.example for available variables.
 */

/** Base URL for API requests. Empty string = same origin as the app. */
export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL
  if (typeof base === 'string' && base.trim() !== '') {
    return base.replace(/\/$/, '') // strip trailing slash
  }
  return ''
}

/** True when running in development (dev server). */
export const isDev = import.meta.env.DEV

/** True when running a production build. */
export const isProd = import.meta.env.PROD
