import { buildConditionUi, normalizeDetectedConditionCode } from '../constants/detectedConditions'

export const OVERHEATING_TEMP_THRESHOLD = 80

/**
 * Reads `detectedCondition` from a payload (top-level or nested under prediction).
 */
export function extractDetectedCondition(payload = {}) {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  return (
    payload.detectedCondition ??
    payload.detected_condition ??
    payload.condition ??
    payload.prediction?.detectedCondition ??
    payload.prediction?.detected_condition ??
    payload.fault?.detectedCondition ??
    null
  )
}

export function readTemperatureValue({ temperature, sensors } = {}) {
  if (temperature !== null && temperature !== undefined) {
    const fromReading = Number(temperature?.value ?? temperature)
    if (Number.isFinite(fromReading)) {
      return fromReading
    }
  }

  if (Array.isArray(sensors)) {
    const row = sensors.find((item) => item.title === 'Temperature Sensor')
    const fromSensor = Number(row?.value)
    if (Number.isFinite(fromSensor)) {
      return fromSensor
    }
  }

  return null
}

/**
 * API/model condition with a frontend safety rule: temp > 80 → Overheating.
 */
export function resolveDetectedCondition(temperature, code) {
  const temp = Number(temperature)
  if (Number.isFinite(temp) && temp > OVERHEATING_TEMP_THRESHOLD) {
    return 'Overheating'
  }

  return normalizeDetectedConditionCode(code) ?? null
}

/**
 * Applies condition catalog mapping onto dashboard fields.
 */
export function applyDetectedCondition(base, payload, fallback = {}) {
  const code = extractDetectedCondition(payload)

  if (!code) {
    return base
  }

  const ui = buildConditionUi(code, {
    prediction: fallback.prediction ?? base.prediction,
    fault: fallback.fault ?? base.fault,
    recommendations: fallback.recommendations ?? base.recommendations,
  })

  return {
    ...base,
    detectedCondition: ui.detectedCondition,
    prediction: ui.prediction ?? base.prediction,
    fault: ui.fault ?? base.fault,
    recommendations: ui.recommendations ?? base.recommendations,
  }
}

/**
 * Resolves condition from temperature + API code, then maps diagnosis + recommendations.
 */
export function applyResolvedCondition(base, options = {}, fallback = {}) {
  const { temperature, detectedCondition, sensors } = options
  const tempValue = readTemperatureValue({
    temperature,
    sensors: sensors ?? base.sensors,
  })
  const resolved = resolveDetectedCondition(tempValue, detectedCondition ?? base.detectedCondition)

  if (!resolved) {
    return base
  }

  return applyDetectedCondition(base, { detectedCondition: resolved }, fallback)
}
