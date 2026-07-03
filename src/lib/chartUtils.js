export const CHART_WINDOW_SECONDS = 60
export const CHART_WINDOW_MS = CHART_WINDOW_SECONDS * 1000

export function createSeedPoints(values, endTime = Date.now()) {
  return values.map((value, index) => ({
    timestamp: endTime - (values.length - 1 - index) * 1000,
    value: Number(value),
  }))
}

export function normalizeChartDataset(dataset, legacyData = []) {
  if (Array.isArray(dataset) && dataset.length > 0) {
    const lastTimestamp = dataset[dataset.length - 1].timestamp
    const now = Date.now()
    const endTime = lastTimestamp < now - CHART_WINDOW_MS ? lastTimestamp : now

    return trimChartWindow(dataset, endTime)
  }

  if (Array.isArray(legacyData) && legacyData.length > 0) {
    return trimChartWindow(createSeedPoints(legacyData, Date.now()), Date.now())
  }

  return []
}

export function trimChartWindow(points, endTime = Date.now()) {
  const windowStart = endTime - CHART_WINDOW_MS

  return points
    .filter((point) => point.timestamp >= windowStart && point.timestamp <= endTime)
    .slice(-CHART_WINDOW_SECONDS)
}

export function appendChartPoint(points = [], value, timestamp = Date.now()) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return points
  }

  const lastPoint = points[points.length - 1]

  if (lastPoint && timestamp <= lastPoint.timestamp) {
    return points
  }

  return trimChartWindow(
    [...points, { timestamp, value: Number(value) }],
    timestamp,
  )
}

export function mergeChartPoints(existingPoints = [], incomingChart, scalarValue, timestamp = Date.now()) {
  if (incomingChart?.points?.length) {
    return trimChartWindow(incomingChart.points, timestamp)
  }

  if (incomingChart?.data?.length) {
    return trimChartWindow(createSeedPoints(incomingChart.data, timestamp), timestamp)
  }

  if (scalarValue !== null && scalarValue !== undefined) {
    return appendChartPoint(existingPoints, scalarValue, timestamp)
  }

  return existingPoints
}

export function formatChartTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function getChartWindowDomain(points) {
  const end = points.length ? points[points.length - 1].timestamp : Date.now()
  return [end - CHART_WINDOW_MS, end]
}
