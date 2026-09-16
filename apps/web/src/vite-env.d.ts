/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_LIVE_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
