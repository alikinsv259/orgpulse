const DEFAULT_API_URL = 'http://localhost:4001'

const API_URL = (import.meta.env.VITE_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '')

const toWebSocketOrigin = (httpUrl: string): string => httpUrl.replace(/^http/, 'ws')

export const env = {
  API_URL,
  LIVE_ORIGIN: import.meta.env.VITE_LIVE_ORIGIN ?? toWebSocketOrigin(API_URL),
}
