import { buildConditionUi } from '../constants/detectedConditions'

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

/**
 * Applies condition catalog mapping onto dashboard fields.
 * Explicit prediction/fault/recommendations from API still win when no condition code is present.
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
