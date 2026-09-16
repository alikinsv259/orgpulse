const DEFAULT_API_URL = 'http://localhost:4001'

const API_URL = (import.meta.env.VITE_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '')

const resolveLiveOrigin = (): string => {
  if (import.meta.env.VITE_LIVE_ORIGIN) return import.meta.env.VITE_LIVE_ORIGIN
  if (API_URL) return API_URL.replace(/^http/, 'ws')

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'

  return `${protocol}//${window.location.host}`
}

export const env = {
  API_URL,
  LIVE_ORIGIN: resolveLiveOrigin(),
}
