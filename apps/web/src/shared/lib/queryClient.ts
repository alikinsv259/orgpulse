import { QueryClient } from '@tanstack/react-query'

import { isClientError } from '@/shared/api'

const DEFAULT_STALE_TIME_MS = 5_000
const DEFAULT_GC_TIME_MS = 5 * 60_000
const MAX_RETRIES = 2

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME_MS,
      gcTime: DEFAULT_GC_TIME_MS,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => !isClientError(error) && failureCount < MAX_RETRIES,
    },
  },
})
