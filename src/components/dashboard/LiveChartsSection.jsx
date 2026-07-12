import { memo, useMemo } from 'react'

import { chartConfigs } from '../../constants/chartConfig'
import { createEmptyCharts } from '../../lib/chartUtils'
import { SectionHeader } from '../common/SectionHeader'
import { ErrorBoundary } from '../common/ErrorBoundary'
import { SensorLineChart } from '../charts/SensorLineChart'

const SENSOR_READING_KEYS = {
  temperature: 'Temperature Sensor',
  vibration: 'Vibration Sensor',
  sound: 'Sound Sensor',
  current: 'Current Sensor',
}

function getSensorReading(sensors, chartKey) {
  const sensorTitle = SENSOR_READING_KEYS[chartKey]
  const sensor = sensors?.find((item) => item.title === sensorTitle)

  return sensor?.value ?? null
}

const LiveChartsSection = memo(function LiveChartsSection({
  section,
  charts,
  sensors,
  connectionStatus,
  isLoading = false,
}) {
  const emptyCharts = useMemo(() => createEmptyCharts(), [])

  const readings = useMemo(
    () =>
      Object.fromEntries(
        chartConfigs.map((config) => [config.key, getSensorReading(sensors, config.key)]),
      ),
    [sensors],
  )

  return (
    <section aria-labelledby="charts-section-title">
      <SectionHeader {...section} />
      <h2 id="charts-section-title" className="sr-only">
        {section.title}
      </h2>
      <ErrorBoundary
        title="Charts unavailable"
        description="Live chart rendering failed. Other dashboard sections remain available."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {chartConfigs.map((config, index) => (
            <SensorLineChart
              key={config.key}
              config={config}
              chartData={charts?.[config.key] ?? emptyCharts[config.key]}
              reading={readings[config.key]}
              connectionStatus={connectionStatus}
              isLoading={isLoading}
              delay={index * 0.05}
            />
          ))}
        </div>
      </ErrorBoundary>
    </section>
  )
})

export { LiveChartsSection }
