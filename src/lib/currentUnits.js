/** API current values are in Amps; UI displays milliamps. */
export const CURRENT_DISPLAY_UNIT = 'mA'

export function ampsToMilliAmps(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return null
  }

  return Math.round(parsed * 1000)
}

export function convertCurrentChart(chart) {
  if (!chart) {
    return chart
  }

  const points = chart.points ?? chart.dataset

  return {
    ...chart,
    unit: CURRENT_DISPLAY_UNIT,
    ...(Array.isArray(points)
      ? {
          points: points.map((point) => ({
            ...point,
            value: ampsToMilliAmps(point.value) ?? point.value,
          })),
        }
      : {}),
  }
}

export function convertCurrentSensor(sensor) {
  if (!sensor || sensor.title !== 'Current Sensor') {
    return sensor
  }

  const milliAmps = ampsToMilliAmps(sensor.value)

  return {
    ...sensor,
    unit: CURRENT_DISPLAY_UNIT,
    ...(milliAmps !== null ? { value: String(milliAmps) } : {}),
  }
}

export function convertCurrentSensors(sensors) {
  if (!Array.isArray(sensors)) {
    return sensors
  }

  return sensors.map(convertCurrentSensor)
}

export function convertCurrentCharts(charts) {
  if (!charts?.current) {
    return charts
  }

  return {
    ...charts,
    current: convertCurrentChart(charts.current),
  }
}
