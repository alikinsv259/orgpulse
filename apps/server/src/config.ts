import { config as loadEnvFiles } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const ENV_FILE_PATHS = ['.env', '../../.env']

const isProduction = process.env.NODE_ENV === 'production'

const presentEnvFiles = ENV_FILE_PATHS.map((file) => resolve(process.cwd(), file)).filter((path) => existsSync(path))

if (presentEnvFiles.length > 0) loadEnvFiles({ path: presentEnvFiles, quiet: true })

const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && value !== undefined && value !== '' ? parsed : fallback
}

const toStr = (value: string | undefined, fallback: string): string =>
  value !== undefined && value.length > 0 ? value : fallback

export const env = {
  PORT: toInt(process.env.PORT, 4001),
  CORS_ORIGIN: toStr(process.env.CORS_ORIGIN, 'http://localhost:5173'),
  LATENCY_MS: toInt(process.env.LATENCY_MS, isProduction ? 0 : 1000),
  LIVE_INTERVAL_MS: toInt(process.env.LIVE_INTERVAL_MS, 3000),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
  AI_SEARCH_MODEL: toStr(process.env.AI_SEARCH_MODEL, 'gpt-4o-mini'),
  ENV_FILES: presentEnvFiles,
}
