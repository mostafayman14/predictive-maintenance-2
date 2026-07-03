import { mergeChartPoints } from '../lib/chartUtils'

const SENSOR_KEYS = {
  temperature: 'Temperature Sensor',
  vibration: 'Vibration Sensor',
  sound: 'Sound Sensor',
  current: 'Current Sensor',
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function formatValue(value) {
  return value === null ? null : String(value)
}

function mergeChartSeries(existingChart, incomingChart, scalarValue, unit, timestamp) {
  const existingPoints = existingChart?.points ?? existingChart?.dataset ?? []

  return {
    ...existingChart,
    ...(incomingChart ?? {}),
    unit: incomingChart?.unit ?? existingChart?.unit ?? unit,
    points: mergeChartPoints(existingPoints, incomingChart, scalarValue, timestamp),
  }
}

function updateSensorList(sensors, key, value, status, variant) {
  const title = SENSOR_KEYS[key]

  if (!title) {
    return sensors
  }

  return sensors.map((sensor) => {
    if (sensor.title !== title) {
      return sensor
    }

    return {
      ...sensor,
      ...(value !== null ? { value: formatValue(value) } : {}),
      ...(status ? { status } : {}),
      ...(variant ? { variant } : {}),
    }
  })
}

function normalizeIncomingPayload(payload) {
  const data = payload?.data ?? payload

  return {
    temperature: toNumber(data.temperature),
    vibration: toNumber(data.vibration),
    sound: toNumber(data.sound),
    current: toNumber(data.current),
    sensorStatus: data.sensorStatus ?? data.sensors ?? null,
    prediction: data.prediction ?? null,
    healthScore: data.healthScore ?? null,
    confidence: data.confidence ?? null,
    charts: data.charts ?? null,
    timestamp: data.timestamp ?? data.lastUpdate ?? new Date().toISOString(),
  }
}

function mergeLiveIntoDashboard(baseData, livePatch) {
  if (!livePatch?.hasUpdates) {
    return baseData
  }

  const {
    temperature,
    vibration,
    sound,
    current,
    sensorStatus,
    charts,
    timestamp,
  } = livePatch

  let sensors = [...baseData.sensors]

  if (Array.isArray(sensorStatus)) {
    sensors = sensorStatus
  } else {
    sensors = updateSensorList(sensors, 'temperature', temperature, sensorStatus?.temperature?.status, sensorStatus?.temperature?.variant)
    sensors = updateSensorList(sensors, 'vibration', vibration, sensorStatus?.vibration?.status, sensorStatus?.vibration?.variant)
    sensors = updateSensorList(sensors, 'sound', sound, sensorStatus?.sound?.status, sensorStatus?.sound?.variant)
    sensors = updateSensorList(sensors, 'current', current, sensorStatus?.current?.status, sensorStatus?.current?.variant)
  }

  const timestampMs = timestamp ? new Date(timestamp).getTime() : Date.now()

  const nextCharts = {
    temperature: mergeChartSeries(
      baseData.charts.temperature,
      charts?.temperature,
      temperature,
      '°C',
      timestampMs,
    ),
    vibration: mergeChartSeries(
      baseData.charts.vibration,
      charts?.vibration,
      vibration,
      'mm/s',
      timestampMs,
    ),
    sound: mergeChartSeries(
      baseData.charts.sound,
      charts?.sound,
      sound,
      'dB',
      timestampMs,
    ),
    current: mergeChartSeries(
      baseData.charts.current,
      charts?.current,
      current,
      'A',
      timestampMs,
    ),
  }

  return {
    ...baseData,
    sensors,
    charts: nextCharts,
    healthScore: livePatch.healthScore
      ? { ...baseData.healthScore, ...livePatch.healthScore }
      : baseData.healthScore,
    confidence: livePatch.confidence
      ? { ...baseData.confidence, ...livePatch.confidence }
      : baseData.confidence,
    prediction: livePatch.prediction
      ? { ...baseData.prediction, ...livePatch.prediction }
      : baseData.prediction,
    lastUpdate: timestamp,
  }
}

function mapConnectionStatus(wsStatus, fallbackConnection, wsError) {
  const statusMap = {
    connected: {
      label: 'Live Connected',
      variant: 'success',
      description: 'Receiving real-time motor data',
    },
    connecting: {
      label: 'Connecting',
      variant: 'warning',
      description: 'Opening live WebSocket stream',
    },
    reconnecting: {
      label: 'Reconnecting',
      variant: 'warning',
      description: 'Attempting to restore live stream',
    },
    disconnected: {
      label: 'Disconnected',
      variant: 'muted',
      description: 'Live stream is offline',
    },
    error: {
      label: 'Connection Error',
      variant: 'warning',
      description: wsError?.message ?? 'Live stream encountered an error',
    },
  }

  return {
    ...fallbackConnection,
    ...(statusMap[wsStatus] ?? statusMap.disconnected),
  }
}

function createLivePatch(previousPatch, payload) {
  const normalized = normalizeIncomingPayload(payload)

  return {
    hasUpdates: true,
    temperature: normalized.temperature ?? previousPatch.temperature,
    vibration: normalized.vibration ?? previousPatch.vibration,
    sound: normalized.sound ?? previousPatch.sound,
    current: normalized.current ?? previousPatch.current,
    sensorStatus: normalized.sensorStatus ?? previousPatch.sensorStatus,
    prediction: normalized.prediction
      ? { ...(previousPatch.prediction ?? {}), ...normalized.prediction }
      : previousPatch.prediction,
    healthScore: normalized.healthScore
      ? { ...(previousPatch.healthScore ?? {}), ...normalized.healthScore }
      : previousPatch.healthScore,
    confidence: normalized.confidence
      ? { ...(previousPatch.confidence ?? {}), ...normalized.confidence }
      : previousPatch.confidence,
    charts: normalized.charts ?? previousPatch.charts,
    timestamp: normalized.timestamp,
  }
}

const initialLivePatch = {
  hasUpdates: false,
  temperature: null,
  vibration: null,
  sound: null,
  current: null,
  sensorStatus: null,
  prediction: null,
  healthScore: null,
  confidence: null,
  charts: null,
  timestamp: null,
}

export {
  createLivePatch,
  initialLivePatch,
  mapConnectionStatus,
  mergeLiveIntoDashboard,
  normalizeIncomingPayload,
}
