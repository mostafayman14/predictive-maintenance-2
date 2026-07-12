import { applyDetectedCondition, extractDetectedCondition } from './conditionNormalizer'
import { mergeLiveIntoDashboard } from './liveDataNormalizer'

export function getPayload(resourceData) {
  return resourceData?.data ?? resourceData ?? {}
}

export function normalizeConnection(statusPayload, fallbackConnection) {
  if (statusPayload.connection) {
    return statusPayload.connection
  }

  if (statusPayload.status) {
    return {
      ...fallbackConnection,
      label: statusPayload.status,
      description: statusPayload.message ?? fallbackConnection.description,
      variant: statusPayload.variant ?? fallbackConnection.variant,
    }
  }

  return fallbackConnection
}

export function normalizeSystemInfo(systemInfoPayload, fallbackSystemInfo) {
  if (Array.isArray(systemInfoPayload)) {
    return systemInfoPayload
  }

  if (Array.isArray(systemInfoPayload.items)) {
    return systemInfoPayload.items
  }

  if (systemInfoPayload.systemInfo) {
    return systemInfoPayload.systemInfo
  }

  return fallbackSystemInfo
}

export function buildDashboardData({
  fallbackData,
  statusPayload,
  historyPayload,
  recommendationsPayload,
  systemInfoPayload,
  livePatch,
  liveConnection,
  liveLastUpdate,
  chartSeries,
  chartLastUpdate,
}) {
  let baseData = {
    ...fallbackData,
    connection: normalizeConnection(statusPayload, fallbackData.connection),
    overview: statusPayload.overview ?? fallbackData.overview,
    sensors: statusPayload.sensors ?? historyPayload.sensors ?? fallbackData.sensors,
    healthScore: statusPayload.healthScore ?? fallbackData.healthScore,
    confidence: statusPayload.confidence ?? fallbackData.confidence,
    // Chart series come from ChartDataContext memory, not history re-merge.
    charts: chartSeries ?? fallbackData.charts,
    prediction: statusPayload.prediction ?? fallbackData.prediction,
    fault: recommendationsPayload.fault ?? statusPayload.fault ?? fallbackData.fault,
    recommendations:
      recommendationsPayload.recommendations ??
      recommendationsPayload.items ??
      fallbackData.recommendations,
    systemInfo: normalizeSystemInfo(systemInfoPayload, fallbackData.systemInfo),
    systemInfoCard: systemInfoPayload.systemInfoCard ?? fallbackData.systemInfoCard,
    connectionCard: systemInfoPayload.connectionCard ?? fallbackData.connectionCard,
    detectedCondition: fallbackData.detectedCondition ?? null,
  }

  const conditionSource =
    (livePatch?.detectedCondition ? { detectedCondition: livePatch.detectedCondition } : null) ??
    (extractDetectedCondition(statusPayload) ? statusPayload : null) ??
    (extractDetectedCondition(recommendationsPayload) ? recommendationsPayload : null)

  if (conditionSource) {
    baseData = applyDetectedCondition(baseData, conditionSource, fallbackData)
  }

  const merged = mergeLiveIntoDashboard(baseData, livePatch)

  return {
    ...merged,
    charts: chartSeries ?? merged.charts,
    connection: liveConnection,
    lastUpdate: liveLastUpdate ?? chartLastUpdate ?? merged.lastUpdate,
  }
}
