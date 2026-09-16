import { LIVE_WS_PATH, type LiveEvent, LiveEventSchema } from '@staff-pulse/api-contract'

import { env } from '@/shared/config'

export type LiveStatus = 'idle' | 'connecting' | 'open' | 'reconnecting'

type LiveEventListener = (event: LiveEvent) => void

const BASE_RECONNECT_DELAY_MS = 1_000
const MAX_RECONNECT_DELAY_MS = 30_000
const RECONNECT_JITTER_RATIO = 0.25

class LiveClient {
  private socket: WebSocket | null = null
  private status: LiveStatus = 'idle'
  private reconnectAttempt = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  private readonly eventListeners = new Set<LiveEventListener>()
  private readonly statusListeners = new Set<() => void>()

  public getStatus = (): LiveStatus => this.status

  public subscribeStatus = (listener: () => void): (() => void) => {
    this.statusListeners.add(listener)

    return () => {
      this.statusListeners.delete(listener)
    }
  }

  public subscribe = (listener: LiveEventListener): (() => void) => {
    this.eventListeners.add(listener)
    this.open()

    return () => {
      this.eventListeners.delete(listener)

      if (this.eventListeners.size === 0) this.close()
    }
  }

  private setStatus(status: LiveStatus): void {
    if (this.status === status) return

    this.status = status

    for (const listener of this.statusListeners) listener()
  }

  private open(): void {
    if (this.socket) return

    this.setStatus(this.reconnectAttempt === 0 ? 'connecting' : 'reconnecting')

    const socket = new WebSocket(`${env.LIVE_ORIGIN}${LIVE_WS_PATH}`)
    this.socket = socket

    socket.onopen = () => {
      this.reconnectAttempt = 0
      this.setStatus('open')
    }

    socket.onmessage = (message: MessageEvent<string>) => this.handleMessage(message.data)

    socket.onerror = () => socket.close()

    socket.onclose = () => {
      this.socket = null

      if (this.eventListeners.size === 0) {
        this.setStatus('idle')
        return
      }

      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return

    this.setStatus('reconnecting')

    const delay = Math.min(BASE_RECONNECT_DELAY_MS * 2 ** this.reconnectAttempt, MAX_RECONNECT_DELAY_MS)
    const jitter = Math.round(Math.random() * delay * RECONNECT_JITTER_RATIO)

    this.reconnectAttempt += 1

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.open()
    }, delay + jitter)
  }

  private handleMessage(raw: string): void {
    let payload: unknown

    try {
      payload = JSON.parse(raw)
    } catch {
      return
    }

    const parsed = LiveEventSchema.safeParse(payload)

    if (!parsed.success) return

    for (const listener of this.eventListeners) listener(parsed.data)
  }

  private close(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.reconnectAttempt = 0

    const socket = this.socket
    this.socket = null

    if (socket) {
      socket.onclose = null
      socket.close()
    }

    this.setStatus('idle')
  }
}

export const liveClient = new LiveClient()
