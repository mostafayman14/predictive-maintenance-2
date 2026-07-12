import { getDetectedCondition } from '../constants/detectedConditions'

const SENSOR_EXPORT_KEYS = [
  { key: 'temperature', column: 'Temperature' },
  { key: 'current', column: 'Current (mA)' },
  { key: 'vibration', column: 'Vibration' },
  { key: 'sound', column: 'Sound' },
]

function pad(value) {
  return String(value).padStart(2, '0')
}

export function formatExportTimestamp(timestamp) {
  const date = new Date(timestamp)

  if (!Number.isFinite(date.getTime())) {
    return 'N/A'
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function formatExportDate(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function resolveConditionLabel(conditionHistory = {}) {
  const code = conditionHistory.detectedCondition ?? conditionHistory.current ?? null
  const catalog = code ? getDetectedCondition(code) : null

  return (
    catalog?.diagnosis ??
    conditionHistory.diagnosis ??
    code ??
    'N/A'
  )
}

function resolveConditionAtTimestamp(conditionHistory, timestamp) {
  const byTimestamp = conditionHistory?.byTimestamp

  if (byTimestamp instanceof Map && byTimestamp.has(timestamp)) {
    return byTimestamp.get(timestamp)
  }

  if (byTimestamp && typeof byTimestamp === 'object' && byTimestamp[timestamp]) {
    return byTimestamp[timestamp]
  }

  return resolveConditionLabel(conditionHistory)
}

/**
 * Merges sensor point arrays into one timeline keyed by timestamp.
 */
export function mergeChartsByTimestamp(chartsData = {}) {
  const byTime = new Map()

  for (const { key, column } of SENSOR_EXPORT_KEYS) {
    const points = chartsData?.[key]?.points ?? []

    for (const point of points) {
      const timestamp = Number(point?.timestamp)
      const value = Number(point?.value)

      if (!Number.isFinite(timestamp) || !Number.isFinite(value)) {
        continue
      }

      if (!byTime.has(timestamp)) {
        byTime.set(timestamp, { timestamp })
      }

      byTime.get(timestamp)[column] = value
    }
  }

  return [...byTime.values()].sort((a, b) => a.timestamp - b.timestamp)
}

export function buildExportRows(chartsData = {}, conditionHistory = {}) {
  return mergeChartsByTimestamp(chartsData).map((row) => ({
    Time: formatExportTimestamp(row.timestamp),
    Temperature: row.Temperature ?? 'N/A',
    'Current (mA)': row['Current (mA)'] ?? 'N/A',
    Vibration: row.Vibration ?? 'N/A',
    Sound: row.Sound ?? 'N/A',
    'Detected Condition': resolveConditionAtTimestamp(conditionHistory, row.timestamp),
  }))
}

export function hasExportableData(chartsData = {}) {
  return SENSOR_EXPORT_KEYS.some(({ key }) => (chartsData?.[key]?.points?.length ?? 0) > 0)
}

function buildPredictionSummaryRows(conditionHistory = {}, rowCount = 0) {
  const conditionLabel = resolveConditionLabel(conditionHistory)

  return [
    { Field: 'Detected Condition', Value: conditionLabel },
    { Field: 'Condition Code', Value: conditionHistory.detectedCondition ?? 'N/A' },
    { Field: 'Diagnosis', Value: conditionHistory.diagnosis ?? conditionLabel },
    {
      Field: 'Recommended Action',
      Value:
        conditionHistory.recommendedAction ??
        conditionHistory.recommendations?.[0]?.content ??
        'N/A',
    },
    { Field: 'Export Time', Value: formatExportTimestamp(Date.now()) },
    { Field: 'Total Reading Rows', Value: rowCount },
  ]
}

/**
 * Builds and downloads Motor_Report_<date>.xlsx from chart store + prediction snapshot.
 */
export async function exportDashboardDataToExcel(chartsData = {}, conditionHistory = {}) {
  if (!hasExportableData(chartsData)) {
    return {
      success: false,
      error: 'No sensor readings available to export.',
    }
  }

  const XLSX = await import('xlsx')
  const rows = buildExportRows(chartsData, conditionHistory)
  const workbook = XLSX.utils.book_new()

  const readingsSheet = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, readingsSheet, 'Sensor Readings')

  const predictionSheet = XLSX.utils.json_to_sheet(
    buildPredictionSummaryRows(conditionHistory, rows.length),
  )
  XLSX.utils.book_append_sheet(workbook, predictionSheet, 'Prediction Summary')

  const fileName = `Motor_Report_${formatExportDate()}.xlsx`
  XLSX.writeFile(workbook, fileName)

  return {
    success: true,
    fileName,
    rowCount: rows.length,
  }
}
