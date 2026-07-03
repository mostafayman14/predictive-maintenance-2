import { memo } from 'react'

import { LiveLineChart } from './LiveLineChart'

const SensorLineChart = memo(function SensorLineChart({ config, chartData, reading, connectionStatus, delay = 0 }) {
  if (!chartData) {
    return null
  }

  return (
    <LiveLineChart
      title={chartData.title}
      unit={chartData.unit}
      points={chartData.points}
      dataset={chartData.dataset}
      data={chartData.data}
      reading={reading}
      color={chartData.color ?? config.color}
      icon={config.icon}
      connectionStatus={connectionStatus}
      delay={delay}
    />
  )
})

export { SensorLineChart }
