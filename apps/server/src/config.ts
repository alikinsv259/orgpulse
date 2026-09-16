const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const env = {
  PORT: toInt(process.env.PORT, 4001),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  LATENCY_MS: toInt(process.env.LATENCY_MS, 1000),
}
