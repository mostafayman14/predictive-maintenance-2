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

function toTimestampMs(value, fallback) {
  if (value === null || value === undefined) {
    return fallback
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  const parsed = new Date(value).getTime()
  return Number.isFinite(parsed) ? parsed : fallback
}

function readSensor(data, key, fallbackTimestamp) {
  const raw = data?.[key]

  if (raw !== null && typeof raw === 'object') {
    return {
      value: toNumber(raw.value),
      timestamp: toTimestampMs(raw.timestamp, fallbackTimestamp),
    }
  }

  return {
    value: toNumber(raw),
    timestamp: fallbackTimestamp,
  }
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

  const topTimestamp = data.timestamp ?? data.lastUpdate ?? null
  const fallbackTimestamp = topTimestamp ? new Date(topTimestamp).getTime() : Date.now()

  return {
    temperature: readSensor(data, 'temperature', fallbackTimestamp),
    vibration: readSensor(data, 'vibration', fallbackTimestamp),
    sound: readSensor(data, 'sound', fallbackTimestamp),
    current: readSensor(data, 'current', fallbackTimestamp),
    sensorStatus: data.sensorStatus ?? data.sensors ?? null,
    prediction: data.prediction ?? null,
    healthScore: data.healthScore ?? null,
    confidence: data.confidence ?? null,
    charts: data.charts ?? null,
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
    sensors = updateSensorList(sensors, 'temperature', temperature?.value, sensorStatus?.temperature?.status, sensorStatus?.temperature?.variant)
    sensors = updateSensorList(sensors, 'vibration', vibration?.value, sensorStatus?.vibration?.status, sensorStatus?.vibration?.variant)
    sensors = updateSensorList(sensors, 'sound', sound?.value, sensorStatus?.sound?.status, sensorStatus?.sound?.variant)
    sensors = updateSensorList(sensors, 'current', current?.value, sensorStatus?.current?.status, sensorStatus?.current?.variant)
  }

  const nextCharts = {
    temperature: mergeChartSeries(
      baseData.charts.temperature,
      charts?.temperature,
      temperature?.value,
      '°C',
      temperature?.timestamp,
    ),
    vibration: mergeChartSeries(
      baseData.charts.vibration,
      charts?.vibration,
      vibration?.value,
      'mm/s',
      vibration?.timestamp,
    ),
    sound: mergeChartSeries(
      baseData.charts.sound,
      charts?.sound,
      sound?.value,
      'dB',
      sound?.timestamp,
    ),
    current: mergeChartSeries(
      baseData.charts.current,
      charts?.current,
      current?.value,
      'mA',
      current?.timestamp,
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

function mapConnectionStatus(liveStatus, fallbackConnection, liveError) {
  const statusMap = {
    connected: {
      label: 'Live Connected',
      variant: 'success',
      description: 'Receiving live motor data',
    },
    connecting: {
      label: 'Connecting',
      variant: 'warning',
      description: 'Requesting live motor data',
    },
    reconnecting: {
      label: 'Reconnecting',
      variant: 'warning',
      description: 'Retrying the live data request',
    },
    disconnected: {
      label: 'Disconnected',
      variant: 'muted',
      description: 'Live polling is stopped',
    },
    error: {
      label: 'Connection Error',
      variant: 'warning',
      description: liveError?.message ?? 'Live data request failed',
    },
  }

  return {
    ...fallbackConnection,
    ...(statusMap[liveStatus] ?? statusMap.disconnected),
  }
}

function mergeSensorReading(previous, incoming) {
  if (incoming?.value === null || incoming?.value === undefined) {
    return previous ?? { value: null, timestamp: null }
  }

  return incoming
}

function latestTimestamp(readings, fallback) {
  const times = readings
    .filter((reading) => reading?.value !== null && reading?.value !== undefined && reading?.timestamp)
    .map((reading) => reading.timestamp)

  return times.length ? Math.max(...times) : fallback
}

function createLivePatch(previousPatch, payload) {
  const normalized = normalizeIncomingPayload(payload)

  const temperature = mergeSensorReading(previousPatch.temperature, normalized.temperature)
  const vibration = mergeSensorReading(previousPatch.vibration, normalized.vibration)
  const sound = mergeSensorReading(previousPatch.sound, normalized.sound)
  const current = mergeSensorReading(previousPatch.current, normalized.current)

  return {
    hasUpdates: true,
    temperature,
    vibration,
    sound,
    current,
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
    timestamp: latestTimestamp(
      [normalized.temperature, normalized.vibration, normalized.sound, normalized.current],
      previousPatch.timestamp,
    ),
  }
}

const initialLivePatch = {
  hasUpdates: false,
  temperature: { value: null, timestamp: null },
  vibration: { value: null, timestamp: null },
  sound: { value: null, timestamp: null },
  current: { value: null, timestamp: null },
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
