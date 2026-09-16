import { useSyncExternalStore } from 'react'

import { type LiveStatus, liveClient } from '@/shared/api/liveClient'

export const useLiveStatus = (): LiveStatus =>
  useSyncExternalStore(liveClient.subscribeStatus, liveClient.getStatus)
