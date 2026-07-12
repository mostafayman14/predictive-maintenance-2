import { createContext, useEffect, useMemo, useRef, useState } from 'react'

import { getLivePollInterval, isLivePollingEnabled } from '../api/endpoints'
import { useChartDataContext } from './ChartDataContext'
import { dashboardService } from '../services/dashboardService'
import {
  createLivePatch,
  initialLivePatch,
  mapConnectionStatus,
} from '../services/liveDataNormalizer'
import { createLivePollingService } from '../services/livePollingService'

const LiveDataContext = createContext(null)

function LiveDataProvider({ children, fallbackConnection }) {
  const { appendLiveReading } = useChartDataContext()
  const serviceRef = useRef(null)
  const appendLiveReadingRef = useRef(appendLiveReading)
  const [livePatch, setLivePatch] = useState(initialLivePatch)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [error, setError] = useState(null)

  useEffect(() => {
    appendLiveReadingRef.current = appendLiveReading
  }, [appendLiveReading])

  useEffect(() => {
    if (!isLivePollingEnabled()) {
      return undefined
    }

    const service = createLivePollingService(() => dashboardService.getLive(), {
      intervalMs: getLivePollInterval(),
    })
    serviceRef.current = service

    const unsubscribeMessage = service.onMessage((payload) => {
      setLivePatch((previous) => createLivePatch(previous, payload))
      appendLiveReadingRef.current?.(payload)
      setError(null)
    })

    const unsubscribeStatus = service.onStatusChange(setConnectionStatus)

    const unsubscribeError = service.onError((nextError) => {
      setError(nextError)
    })

    service.connect()

    return () => {
      unsubscribeMessage()
      unsubscribeStatus()
      unsubscribeError()
      service.disconnect()
      serviceRef.current = null
    }
  }, [])

  const connection = useMemo(
    () => mapConnectionStatus(connectionStatus, fallbackConnection, error),
    [connectionStatus, fallbackConnection, error],
  )

  const value = useMemo(
    () => ({
      livePatch,
      connectionStatus,
      connection,
      error,
      lastUpdate: livePatch.timestamp,
      isLive: connectionStatus === 'connected',
    }),
    [livePatch, connectionStatus, connection, error],
  )

  return <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>
}

export { LiveDataContext, LiveDataProvider }
