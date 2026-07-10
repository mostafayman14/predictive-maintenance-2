/**
 * Raspberry Pi / model sends only `detectedCondition`.
 * Frontend maps it to diagnosis, recommended action, and UI card fields.
 *
 * Canonical codes:
 * Good100 | Good50 | BearingAboutToFail | BearingFail | CapacitorFail | AxeFail | Overheating
 */
export const DETECTED_CONDITIONS = {
  Good100: {
    code: 'Good100',
    diagnosis: 'Healthy',
    recommendedAction:
      'Motor is operating normally. No maintenance is required.',
    severity: 'Low',
    variant: 'success',
    probability: 100,
    predictionTitle: 'Detected Condition',
    faultTitle: 'Diagnosis',
  },
  Good50: {
    code: 'Good50',
    diagnosis: 'Aged Motor',
    recommendedAction:
      'Motor is operational but shows signs of aging. Schedule preventive maintenance.',
    severity: 'Medium',
    variant: 'warning',
    probability: 50,
    predictionTitle: 'Detected Condition',
    faultTitle: 'Diagnosis',
  },
  BearingAboutToFail: {
    code: 'BearingAboutToFail',
    diagnosis: 'Bearing Degradation',
    recommendedAction:
      'Bearing wear has been detected. Replace the bearing within 1–2 weeks to prevent unexpected failure.',
    severity: 'High',
    variant: 'warning',
    probability: 75,
    predictionTitle: 'Detected Condition',
    faultTitle: 'Diagnosis',
  },
  BearingFail: {
    code: 'BearingFail',
    diagnosis: 'Bearing Failure',
    recommendedAction:
      'Critical bearing failure detected. Stop operation and replace the bearing immediately.',
    severity: 'Critical',
    variant: 'warning',
    probability: 95,
    predictionTitle: 'Detected Condition',
    faultTitle: 'Diagnosis',
  },
  CapacitorFail: {
    code: 'CapacitorFail',
    diagnosis: 'Capacitor Fault',
    recommendedAction:
      'Capacitor malfunction detected. Replace the capacitor as soon as possible.',
    severity: 'High',
    variant: 'warning',
    probability: 90,
    predictionTitle: 'Detected Condition',
    faultTitle: 'Diagnosis',
  },
  AxeFail: {
    code: 'AxeFail',
    diagnosis: 'Shaft Wear',
    recommendedAction:
      'Shaft wear detected. Inspect the shaft and replace it if necessary.',
    severity: 'High',
    variant: 'warning',
    probability: 85,
    predictionTitle: 'Detected Condition',
    faultTitle: 'Diagnosis',
  },
  Overheating: {
    code: 'Overheating',
    diagnosis: 'Overheating',
    recommendedAction:
      'Motor temperature exceeds the safe operating limit. Turn off the motor immediately and inspect the cooling system before restarting.',
    severity: 'Critical',
    variant: 'warning',
    probability: 98,
    predictionTitle: 'Detected Condition',
    faultTitle: 'Diagnosis',
  },
}

/** Legacy / alternate spellings → canonical code */
const CONDITION_ALIASES = {
  good100: 'Good100',
  Good100: 'Good100',
  good50: 'Good50',
  Good50: 'Good50',
  bearingAboutToFail: 'BearingAboutToFail',
  BearingAboutToFail: 'BearingAboutToFail',
  bearingFailure: 'BearingFail',
  bearingFail: 'BearingFail',
  BearingFail: 'BearingFail',
  capacitorFailure: 'CapacitorFail',
  capacitorFail: 'CapacitorFail',
  CapacitorFail: 'CapacitorFail',
  axisFailure: 'AxeFail',
  axeFail: 'AxeFail',
  AxeFail: 'AxeFail',
  overheating: 'Overheating',
  Overheating: 'Overheating',
}

export const DETECTED_CONDITION_CODES = Object.keys(DETECTED_CONDITIONS)

export function normalizeDetectedConditionCode(code) {
  if (!code || typeof code !== 'string') {
    return null
  }

  const trimmed = code.trim()
  if (DETECTED_CONDITIONS[trimmed]) {
    return trimmed
  }

  if (CONDITION_ALIASES[trimmed]) {
    return CONDITION_ALIASES[trimmed]
  }

  const lowerMap = Object.fromEntries(
    Object.entries(CONDITION_ALIASES).map(([key, value]) => [key.toLowerCase(), value]),
  )

  return lowerMap[trimmed.toLowerCase()] ?? null
}

export function getDetectedCondition(code) {
  const normalized = normalizeDetectedConditionCode(code)
  if (!normalized) {
    return null
  }

  return DETECTED_CONDITIONS[normalized] ?? null
}

/**
 * Builds prediction / fault / recommendations UI objects from a condition code.
 */
export function buildConditionUi(code, fallback = {}) {
  const condition = getDetectedCondition(code)

  if (!condition) {
    return {
      detectedCondition: code ?? null,
      prediction: fallback.prediction ?? null,
      fault: fallback.fault ?? null,
      recommendations: fallback.recommendations ?? null,
    }
  }

  return {
    detectedCondition: condition.code,
    prediction: {
      title: condition.predictionTitle,
      prediction: condition.diagnosis,
      probability: condition.probability,
      description: condition.recommendedAction,
      variant: condition.variant,
    },
    fault: {
      title: condition.faultTitle,
      fault: condition.diagnosis,
      severity: condition.severity,
      description: condition.recommendedAction,
      variant: condition.variant,
    },
    recommendations: [
      {
        title: 'Recommended Action',
        content: condition.recommendedAction,
        value: 'item-0',
      },
      {
        title: 'Diagnosis',
        content: condition.diagnosis,
        value: 'item-1',
      },
      {
        title: 'Condition Code',
        content: condition.code,
        value: 'item-2',
      },
    ],
  }
}
