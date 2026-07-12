import { Download } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '../ui/button'
import { exportDashboardDataToExcel, hasExportableData } from '../../utils/exportUtils'

const ExportExcelButton = memo(function ExportExcelButton({
  charts,
  conditionHistory,
  disabled = false,
  className,
}) {
  const [statusMessage, setStatusMessage] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  const canExport = useMemo(() => hasExportableData(charts), [charts])

  useEffect(() => {
    if (!statusMessage) {
      return undefined
    }

    const timer = window.setTimeout(() => setStatusMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [statusMessage])

  const handleExport = useCallback(async () => {
    setIsExporting(true)

    try {
      const result = await exportDashboardDataToExcel(charts, conditionHistory)

      if (!result.success) {
        setStatusMessage(result.error ?? 'Unable to export data.')
        return
      }

      setStatusMessage(`Downloaded ${result.fileName} (${result.rowCount} rows).`)
    } catch {
      setStatusMessage('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }, [charts, conditionHistory])

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || !canExport || isExporting}
        onClick={handleExport}
        aria-describedby={statusMessage ? 'export-excel-status' : undefined}
        aria-busy={isExporting}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {isExporting ? 'Preparing...' : 'Download Excel'}
      </Button>
      {statusMessage ? (
        <p
          id="export-excel-status"
          role="status"
          aria-live="polite"
          className="mt-2 text-xs text-slate-600"
        >
          {statusMessage}
        </p>
      ) : !canExport ? (
        <p className="mt-2 text-xs text-slate-500">No readings available to export yet.</p>
      ) : null}
    </div>
  )
})

export { ExportExcelButton }
