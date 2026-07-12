export const CHART_WINDOW_MS = 3 * 60 * 60 * 1000
export const CHART_WINDOW_SECONDS = CHART_WINDOW_MS / 1000
export const CHART_WINDOW_HOURS = 3

export function sanitizePoints(points = []) {
  const byTimestamp = new Map()

  for (const point of points) {
    if (!point || typeof point !== 'object') {
      continue
    }

    const timestamp = Number(point.timestamp)
    const value = Number(point.value)

    if (!Number.isFinite(timestamp) || !Number.isFinite(value)) {
      continue
    }

    byTimestamp.set(timestamp, { timestamp, value })
  }

  return [...byTimestamp.values()].sort((a, b) => a.timestamp - b.timestamp)
}

export function trimChartWindow(points, endTime = Date.now()) {
  const windowEnd = Number.isFinite(endTime) ? endTime : Date.now()
  const windowStart = windowEnd - CHART_WINDOW_MS

  return sanitizePoints(points).filter(
    (point) => point.timestamp >= windowStart && point.timestamp <= windowEnd,
  )
}

export function normalizeChartDataset(dataset = []) {
  if (!Array.isArray(dataset) || dataset.length === 0) {
    return []
  }

  return trimChartWindow(dataset, Date.now())
}

export function appendChartPoint(points = [], value, timestamp = Date.now()) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return points
  }

  if (!Number.isFinite(Number(timestamp))) {
    return points
  }

  const sanitized = sanitizePoints(points)
  const lastPoint = sanitized[sanitized.length - 1]
  const nextTimestamp = Number(timestamp)

  if (lastPoint && nextTimestamp <= lastPoint.timestamp) {
    return sanitized
  }

  return trimChartWindow(
    [...sanitized, { timestamp: nextTimestamp, value: Number(value) }],
    Date.now(),
  )
}

export function mergeChartPoints(existingPoints = [], incomingChart, scalarValue, timestamp = Date.now()) {
  if (incomingChart?.points?.length) {
    return trimChartWindow(incomingChart.points, Date.now())
  }

  if (scalarValue !== null && scalarValue !== undefined) {
    return appendChartPoint(existingPoints, scalarValue, timestamp)
  }

  return sanitizePoints(existingPoints)
}

export function formatChartTime(timestamp) {
  const date = new Date(timestamp)

  if (!Number.isFinite(date.getTime())) {
    return '--'
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getChartWindowDomain(points) {
  const end = points.length ? points[points.length - 1].timestamp : Date.now()
  return [end - CHART_WINDOW_MS, end]
}

export function createEmptyCharts() {
  return {
    temperature: {
      title: 'Temperature',
      unit: '°C',
      color: '#0891b2',
      points: [],
    },
    vibration: {
      title: 'Vibration',
      unit: 'mm/s',
      color: '#7c3aed',
      points: [],
    },
    sound: {
      title: 'Sound',
      unit: 'dB',
      color: '#059669',
      points: [],
    },
    current: {
      title: 'Current',
      unit: 'A',
      color: '#d97706',
      points: [],
    },
  }
}

export function normalizeHistoryCharts(rawCharts = {}) {
  const empty = createEmptyCharts()

  return Object.fromEntries(
    Object.keys(empty).map((key) => {
      const incoming = rawCharts?.[key] ?? {}
      return [
        key,
        {
          ...empty[key],
          ...incoming,
          unit: incoming.unit ?? empty[key].unit,
          title: incoming.title ?? empty[key].title,
          color: incoming.color ?? empty[key].color,
          points: trimChartWindow(incoming.points ?? incoming.dataset ?? [], Date.now()),
        },
      ]
    }),
  )
}
