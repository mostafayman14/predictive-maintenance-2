const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
}

const DEFAULT_OPTIONS = {
  intervalMs: 1000,
}

/**
 * Polls a POST endpoint on a fixed interval and re-broadcasts each response to
 * subscribers. Exposes a small pub/sub surface (connect/disconnect/onMessage/
 * onStatusChange/onError/getStatus) consumed by LiveDataContext.
 */
class LivePollingService {
  #fetcher
  #intervalMs
  #timer = null
  #stopped = true
  #inFlight = false
  #hasConnected = false
  #status = CONNECTION_STATUS.DISCONNECTED
  #messageListeners = new Set()
  #statusListeners = new Set()
  #errorListeners = new Set()

  constructor(fetcher, options = {}) {
    this.#fetcher = fetcher
    this.#intervalMs = { ...DEFAULT_OPTIONS, ...options }.intervalMs
  }

  connect() {
    if (!this.#stopped) {
      return
    }

    this.#stopped = false
    this.#setStatus(CONNECTION_STATUS.CONNECTING)
    this.#poll()
  }

  disconnect() {
    this.#stopped = true
    this.#clearTimer()
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

  async #poll() {
    if (this.#stopped || this.#inFlight) {
      return
    }

    this.#inFlight = true

    try {
      const payload = await this.#fetcher()

      if (this.#stopped) {
        return
      }

      this.#hasConnected = true
      this.#setStatus(CONNECTION_STATUS.CONNECTED)
      this.#messageListeners.forEach((listener) => listener(payload))
    } catch (error) {
      if (this.#stopped) {
        return
      }

      this.#setStatus(
        this.#hasConnected ? CONNECTION_STATUS.RECONNECTING : CONNECTION_STATUS.CONNECTING,
      )
      this.#emitError(error)
    } finally {
      this.#inFlight = false
      this.#scheduleNext()
    }
  }

  #scheduleNext() {
    if (this.#stopped) {
      return
    }

    this.#clearTimer()
    this.#timer = window.setTimeout(() => this.#poll(), this.#intervalMs)
  }

  #clearTimer() {
    if (this.#timer) {
      window.clearTimeout(this.#timer)
      this.#timer = null
    }
  }

  #setStatus(status) {
    if (this.#status === status) {
      return
    }

    this.#status = status
    this.#statusListeners.forEach((listener) => listener(status))
  }

  #emitError(error) {
    this.#errorListeners.forEach((listener) => listener(error))
  }
}

function createLivePollingService(fetcher, options) {
  return new LivePollingService(fetcher, options)
}

export { CONNECTION_STATUS, LivePollingService, createLivePollingService }
