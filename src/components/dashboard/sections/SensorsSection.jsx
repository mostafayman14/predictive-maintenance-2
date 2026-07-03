import { memo } from 'react'

import { sensorIcons } from '../../../constants/dashboardIcons'
import { SectionHeader } from '../../common/SectionHeader'
import { SensorCard } from '../../cards/SensorCard'

const SensorsSection = memo(function SensorsSection({ section, sensors }) {
  return (
    <section aria-labelledby="sensors-section-title">
      <SectionHeader {...section} />
      <h2 id="sensors-section-title" className="sr-only">
        {section.title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sensors.map((sensor, index) => (
          <SensorCard
            key={sensor.title}
            {...sensor}
            icon={sensorIcons[index]}
            delay={index * 0.05}
          />
        ))}
      </div>
    </section>
  )
})

export { SensorsSection }
