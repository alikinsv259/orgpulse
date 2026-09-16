import type { LiveEvent } from '@staff-pulse/api-contract'
import type { Server } from 'node:http'
import { WebSocketServer } from 'ws'

import { env } from '~/config'
import { mutateRandomNode } from '~/orgData'

const LIVE_PATH = '/api/live'

export const startLiveUpdates = (server: Server): WebSocketServer => {
  const wss = new WebSocketServer({ server, path: LIVE_PATH })

  const broadcast = (event: LiveEvent) => {
    const payload = JSON.stringify(event)

    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) client.send(payload)
    }
  }

  setInterval(() => {
    if (wss.clients.size === 0) return

    broadcast({ type: 'orgNode.updated', patch: mutateRandomNode() })
  }, env.LIVE_INTERVAL_MS)

  wss.on('connection', () => {
    console.log(`[server] live client connected (${wss.clients.size} total)`)
  })

  return wss
}
