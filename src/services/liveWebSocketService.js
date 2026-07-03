const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
}

const DEFAULT_OPTIONS = {
  maxReconnectAttempts: Infinity,
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
  heartbeatInterval: 25000,
  heartbeatTimeout: 10000,
  heartbeatMessage: JSON.stringify({ type: 'ping' }),
  heartbeatResponseType: 'pong',
}

class LiveWebSocketService {
  #url
  #options
  #ws = null
  #reconnectAttempts = 0
  #intentionalClose = false
  #reconnectTimer = null
  #heartbeatTimer = null
  #heartbeatTimeoutTimer = null
  #status = CONNECTION_STATUS.DISCONNECTED
  #messageListeners = new Set()
  #statusListeners = new Set()
  #errorListeners = new Set()

  constructor(url, options = {}) {
    this.#url = url
    this.#options = { ...DEFAULT_OPTIONS, ...options }
  }

  connect() {
    if (this.#ws?.readyState === WebSocket.OPEN || this.#ws?.readyState === WebSocket.CONNECTING) {
      return
    }

    this.#intentionalClose = false
    this.#setStatus(
      this.#reconnectAttempts > 0
        ? CONNECTION_STATUS.RECONNECTING
        : CONNECTION_STATUS.CONNECTING,
    )

    try {
      this.#ws = new WebSocket(this.#url)
    } catch (error) {
      this.#emitError(error)
      this.#scheduleReconnect()
      return
    }

    this.#ws.onopen = () => {
      this.#reconnectAttempts = 0
      this.#setStatus(CONNECTION_STATUS.CONNECTED)
      this.#startHeartbeat()
    }

    this.#ws.onmessage = (event) => {
      this.#handleMessage(event.data)
    }

    this.#ws.onerror = () => {
      this.#setStatus(CONNECTION_STATUS.ERROR)
      this.#emitError(new Error('WebSocket connection error'))
    }

    this.#ws.onclose = () => {
      this.#stopHeartbeat()

      if (this.#intentionalClose) {
        this.#setStatus(CONNECTION_STATUS.DISCONNECTED)
        return
      }

      this.#setStatus(CONNECTION_STATUS.RECONNECTING)
      this.#scheduleReconnect()
    }
  }

  disconnect() {
    this.#intentionalClose = true
    this.#clearReconnectTimer()
    this.#stopHeartbeat()

    if (this.#ws) {
      this.#ws.onopen = null
      this.#ws.onmessage = null
      this.#ws.onerror = null
      this.#ws.onclose = null

      if (this.#ws.readyState === WebSocket.OPEN || this.#ws.readyState === WebSocket.CONNECTING) {
        this.#ws.close(1000, 'Client disconnect')
      }

      this.#ws = null
    }

    this.#setStatus(CONNECTION_STATUS.DISCONNECTED)
  }

  onMessage(listener) {
    this.#messageListeners.add(listener)
    return () => this.#messageListeners.delete(listener)
  }

  onStatusChange(listener) {
    this.#statusListeners.add(listener)
    listener(this.#status)
    return () => this.#statusListeners.delete(listener)
  }

  onError(listener) {
    this.#errorListeners.add(listener)
    return () => this.#errorListeners.delete(listener)
  }

  getStatus() {
    return this.#status
  }

  #handleMessage(rawData) {
    this.#resetHeartbeatTimeout()

    let payload

    try {
      payload = JSON.parse(rawData)
    } catch {
      this.#emitError(new Error('Received invalid JSON from live stream'))
      return
    }

    if (payload?.type === this.#options.heartbeatResponseType) {
      return
    }

    this.#messageListeners.forEach((listener) => listener(payload))
  }

  #startHeartbeat() {
    this.#stopHeartbeat()
    this.#resetHeartbeatTimeout()

    this.#heartbeatTimer = window.setInterval(() => {
      if (this.#ws?.readyState === WebSocket.OPEN) {
        this.#ws.send(this.#options.heartbeatMessage)
        this.#resetHeartbeatTimeout()
      }
    }, this.#options.heartbeatInterval)
  }

  #resetHeartbeatTimeout() {
    if (this.#heartbeatTimeoutTimer) {
      window.clearTimeout(this.#heartbeatTimeoutTimer)
    }

    this.#heartbeatTimeoutTimer = window.setTimeout(() => {
      this.#emitError(new Error('WebSocket heartbeat timeout'))
      this.#ws?.close(4000, 'Heartbeat timeout')
    }, this.#options.heartbeatTimeout)
  }

  #stopHeartbeat() {
    if (this.#heartbeatTimer) {
      window.clearInterval(this.#heartbeatTimer)
      this.#heartbeatTimer = null
    }

    if (this.#heartbeatTimeoutTimer) {
      window.clearTimeout(this.#heartbeatTimeoutTimer)
      this.#heartbeatTimeoutTimer = null
    }
  }

  #scheduleReconnect() {
    if (this.#intentionalClose) {
      return
    }

    if (this.#reconnectAttempts >= this.#options.maxReconnectAttempts) {
      this.#setStatus(CONNECTION_STATUS.ERROR)
      this.#emitError(new Error('Maximum WebSocket reconnect attempts reached'))
      return
    }

    this.#clearReconnectTimer()

    const backoff = Math.min(
      this.#options.reconnectDelay * 2 ** this.#reconnectAttempts,
      this.#options.maxReconnectDelay,
    )

    this.#reconnectAttempts += 1

    this.#reconnectTimer = window.setTimeout(() => {
      this.connect()
    }, backoff)
  }

  #clearReconnectTimer() {
    if (this.#reconnectTimer) {
      window.clearTimeout(this.#reconnectTimer)
      this.#reconnectTimer = null
    }
  }

  #setStatus(status) {
    this.#status = status
    this.#statusListeners.forEach((listener) => listener(status))
  }

  #emitError(error) {
    this.#errorListeners.forEach((listener) => listener(error))
  }
}

function createLiveWebSocketService(url, options) {
  return new LiveWebSocketService(url, options)
}

export { CONNECTION_STATUS, LiveWebSocketService, createLiveWebSocketService }
