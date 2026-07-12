import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { getApiErrorMessage } from '../api/client'
import {
  appendChartPoint,
  createEmptyCharts,
  normalizeHistoryCharts,
  trimChartWindow,
} from '../lib/chartUtils'
import { dashboardService } from '../services/dashboardService'
import { normalizeIncomingPayload } from '../services/liveDataNormalizer'

const ChartDataContext = createContext(null)

const SENSOR_CHART_KEYS = ['temperature', 'vibration', 'sound', 'current']

const SENSOR_UNITS = {
  temperature: '°C',
  vibration: 'mm/s',
  sound: '×10³',
  current: 'mA',
}

function latestPointTimestamp(charts) {
  const times = Object.values(charts ?? {})
    .flatMap((chart) => chart?.points ?? [])
    .map((point) => point?.timestamp)
    .filter((timestamp) => Number.isFinite(timestamp))

  return times.length ? Math.max(...times) : null
}

function ChartDataProvider({ children }) {
  const [charts, setCharts] = useState(createEmptyCharts)
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    async function loadHistory() {
      setIsHistoryLoading(true)
      setHistoryError(null)

      try {
        const payload = await dashboardService.getHistory()
        const raw = payload?.data ?? payload
        const nextCharts = normalizeHistoryCharts(raw?.charts)

        if (!mountedRef.current) {
          return
        }

        setCharts(nextCharts)
        setLastUpdate(latestPointTimestamp(nextCharts))
      } catch (error) {
        if (!mountedRef.current) {
          return
        }

        setCharts(createEmptyCharts())
        setHistoryError(getApiErrorMessage(error))
        setLastUpdate(null)
      } finally {
        if (mountedRef.current) {
          setIsHistoryLoading(false)
        }
      }
    }

    loadHistory()

    return () => {
      mountedRef.current = false
    }
  }, [])

  const appendLiveReading = useCallback((payload) => {
    const normalized = normalizeIncomingPayload(payload)

    setCharts((previous) => {
      const next = { ...previous }

      for (const key of SENSOR_CHART_KEYS) {
        const existing = previous[key] ?? createEmptyCharts()[key]
        const incomingSeries = normalized.charts?.[key]
        const reading = normalized[key]
        let points = existing.points ?? []

        if (incomingSeries?.points?.length) {
          // Trim relative to newest point in the series (not wall-clock).
          points = trimChartWindow(incomingSeries.points)
        } else if (reading?.value !== null && reading?.value !== undefined) {
          points = appendChartPoint(
            points,
            reading.value,
            reading.timestamp ?? Date.now(),
          )
        } else {
          points = trimChartWindow(points)
        }

        next[key] = {
          ...existing,
          ...(incomingSeries ?? {}),
          unit: incomingSeries?.unit ?? existing.unit ?? SENSOR_UNITS[key],
          title: incomingSeries?.title ?? existing.title,
          color: incomingSeries?.color ?? existing.color,
          points,
        }
      }

      return next
    })

    setLastUpdate((previous) => {
      const candidates = [
        previous,
        normalized.temperature?.timestamp,
        normalized.vibration?.timestamp,
        normalized.sound?.timestamp,
        normalized.current?.timestamp,
      ].filter((value) => Number.isFinite(value))

      return candidates.length ? Math.max(...candidates) : previous
    })
  }, [])

  const retryHistory = useCallback(async () => {
    setIsHistoryLoading(true)
    setHistoryError(null)

    try {
      const payload = await dashboardService.getHistory()
      const raw = payload?.data ?? payload
      const nextCharts = normalizeHistoryCharts(raw?.charts)
      setCharts(nextCharts)
      setLastUpdate(latestPointTimestamp(nextCharts))
    } catch (error) {
      setHistoryError(getApiErrorMessage(error))
    } finally {
      setIsHistoryLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      charts,
      isHistoryLoading,
      historyError,
      lastUpdate,
      appendLiveReading,
      retryHistory,
    }),
    [charts, isHistoryLoading, historyError, lastUpdate, appendLiveReading, retryHistory],
  )

  return <ChartDataContext.Provider value={value}>{children}</ChartDataContext.Provider>
}

function useChartDataContext() {
  const context = useContext(ChartDataContext)

  if (!context) {
    throw new Error('useChartDataContext must be used within ChartDataProvider')
  }

  return context
}

export { ChartDataContext, ChartDataProvider, useChartDataContext }
