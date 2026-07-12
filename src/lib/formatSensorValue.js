export function formatSensorValue(value, unit) {
  if (value === null || value === undefined || value === '' || value === '--') {
    return '--'
  }

  const numeric = Number(value)
  const display = Number.isFinite(numeric) ? numeric : value

  if (!unit) {
    return String(display)
  }

  if (unit.startsWith('°') || unit === '%') {
    return `${display}${unit}`
  }

  if (unit === '×10³') {
    return `${display}×10³`
  }

  return `${display} ${unit}`
}
