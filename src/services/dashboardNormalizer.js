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
}) {
  const baseData = {
    ...fallbackData,
    connection: normalizeConnection(statusPayload, fallbackData.connection),
    overview: statusPayload.overview ?? fallbackData.overview,
    sensors: statusPayload.sensors ?? historyPayload.sensors ?? fallbackData.sensors,
    healthScore: statusPayload.healthScore ?? fallbackData.healthScore,
    confidence: statusPayload.confidence ?? fallbackData.confidence,
    charts: historyPayload.charts ?? fallbackData.charts,
    prediction: statusPayload.prediction ?? fallbackData.prediction,
    fault: recommendationsPayload.fault ?? statusPayload.fault ?? fallbackData.fault,
    recommendations:
      recommendationsPayload.recommendations ??
      recommendationsPayload.items ??
      fallbackData.recommendations,
    systemInfo: normalizeSystemInfo(systemInfoPayload, fallbackData.systemInfo),
    systemInfoCard: systemInfoPayload.systemInfoCard ?? fallbackData.systemInfoCard,
    connectionCard: systemInfoPayload.connectionCard ?? fallbackData.connectionCard,
  }

  const merged = mergeLiveIntoDashboard(baseData, livePatch)

  return {
    ...merged,
    connection: liveConnection,
    lastUpdate: liveLastUpdate ?? merged.lastUpdate,
  }
}
