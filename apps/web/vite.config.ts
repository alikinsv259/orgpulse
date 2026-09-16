import react from '@vitejs/plugin-react'
import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@staff-pulse/api-contract': fileURLToPath(
        new URL('../../packages/api-contract/src/index.ts', import.meta.url),
      ),
      '@contract': fileURLToPath(new URL('../../packages/api-contract/src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
