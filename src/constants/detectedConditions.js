/**
 * Raspberry Pi / model sends only `detectedCondition`.
 * Frontend maps it to diagnosis, recommended action, and UI card fields.
 */
export const DETECTED_CONDITIONS = {
  good100: {
    code: 'good100',
    diagnosis: 'Healthy',
    recommendedAction:
      'Motor is operating normally. No maintenance is required.',
    severity: 'Low',
    variant: 'success',
    probability: 100,
    predictionTitle: 'Detected Condition',
    faultTitle: 'Diagnosis',
  },
  good50: {
    code: 'good50',
    diagnosis: 'Aged Motor',
    recommendedAction:
      'Motor is operational but shows signs of aging. Schedule preventive maintenance.',
    severity: 'Medium',
    variant: 'warning',
    probability: 50,
    predictionTitle: 'Detected Condition',
    faultTitle: 'Diagnosis',
  },
  bearingAboutToFail: {
    code: 'bearingAboutToFail',
    diagnosis: 'Bearing Degradation',
    recommendedAction:
      'Bearing wear has been detected. Replace the bearing within 1–2 weeks to prevent unexpected failure.',
    severity: 'High',
    variant: 'warning',
    probability: 75,
    predictionTitle: 'Detected Condition',
    faultTitle: 'Diagnosis',
  },
  bearingFailure: {
    code: 'bearingFailure',
    diagnosis: 'Bearing Failure',
    recommendedAction:
      'Critical bearing failure detected. Stop operation and replace the bearing immediately.',
    severity: 'Critical',
    variant: 'warning',
    probability: 95,
    predictionTitle: 'Detected Condition',
    faultTitle: 'Diagnosis',
  },
  capacitorFailure: {
    code: 'capacitorFailure',
    diagnosis: 'Capacitor Fault',
    recommendedAction:
      'Capacitor malfunction detected. Replace the capacitor as soon as possible.',
    severity: 'High',
    variant: 'warning',
    probability: 90,
    predictionTitle: 'Detected Condition',
    faultTitle: 'Diagnosis',
  },
  axisFailure: {
    code: 'axisFailure',
    diagnosis: 'Shaft Wear',
    recommendedAction:
      'Shaft wear detected. Inspect the shaft and replace it if necessary.',
    severity: 'High',
    variant: 'warning',
    probability: 85,
    predictionTitle: 'Detected Condition',
    faultTitle: 'Diagnosis',
  },
  overheating: {
    code: 'overheating',
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

export const DETECTED_CONDITION_CODES = Object.keys(DETECTED_CONDITIONS)

export function getDetectedCondition(code) {
  if (!code || typeof code !== 'string') {
    return null
  }

  return DETECTED_CONDITIONS[code] ?? null
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
