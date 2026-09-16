const DEFAULT_API_URL = 'http://localhost:4001'

export const env = {
  API_URL: (import.meta.env.VITE_API_URL ?? DEFAULT_API_URL).replace(/\/$/, ''),
}
