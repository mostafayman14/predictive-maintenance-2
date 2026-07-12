import { memo } from 'react'

import { createEmptyCharts } from '../../lib/chartUtils'
import { LiveLineChart } from './LiveLineChart'

const emptyCharts = createEmptyCharts()

const SensorLineChart = memo(function SensorLineChart({
  config,
  chartData,
  reading,
  connectionStatus,
  isLoading = false,
  delay = 0,
}) {
  const resolved = chartData ?? emptyCharts[config.key]

  return (
    <LiveLineChart
      title={resolved.title}
      unit={resolved.unit}
      points={resolved.points}
      dataset={resolved.dataset}
      reading={reading}
      color={resolved.color ?? config.color}
      icon={config.icon}
      connectionStatus={connectionStatus}
      isLoading={isLoading}
      delay={delay}
    />
  )
})

export { SensorLineChart }
