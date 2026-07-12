export const CHART_WINDOW_MS = 70 * 1000
export const CHART_WINDOW_SECONDS = CHART_WINDOW_MS / 1000

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

/**
 * Trim to a sliding window anchored on the newest point (not wall-clock).
 * Visible range: [maxTimestamp - CHART_WINDOW_MS, maxTimestamp]
 */
export function trimChartWindow(points = []) {
  const sanitized = sanitizePoints(points)

  if (!sanitized.length) {
    return []
  }

  const maxTimestamp = sanitized[sanitized.length - 1].timestamp
  const windowStart = maxTimestamp - CHART_WINDOW_MS

  return sanitized.filter(
    (point) => point.timestamp >= windowStart && point.timestamp <= maxTimestamp,
  )
}

export function normalizeChartDataset(dataset = []) {
  if (!Array.isArray(dataset) || dataset.length === 0) {
    return []
  }

  return trimChartWindow(dataset)
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

  // New point becomes maxTimestamp; oldest points outside the 70s window drop off.
  return trimChartWindow([...sanitized, { timestamp: nextTimestamp, value: Number(value) }])
}

export function mergeChartPoints(existingPoints = [], incomingChart, scalarValue, timestamp = Date.now()) {
  if (incomingChart?.points?.length) {
    return trimChartWindow(incomingChart.points)
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
    second: '2-digit',
  })
}

/** X-axis domain: [maxTimestamp - CHART_WINDOW_MS, maxTimestamp] */
export function getChartWindowDomain(points = []) {
  if (!points.length) {
    return [0, CHART_WINDOW_MS]
  }

  const maxTimestamp = points[points.length - 1].timestamp
  return [maxTimestamp - CHART_WINDOW_MS, maxTimestamp]
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
      unit: '×10³',
      color: '#059669',
      points: [],
    },
    current: {
      title: 'Current',
      unit: 'mA',
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
          points: trimChartWindow(incoming.points ?? incoming.dataset ?? []),
        },
      ]
    }),
  )
}
