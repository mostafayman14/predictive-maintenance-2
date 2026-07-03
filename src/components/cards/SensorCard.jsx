import { CardHeader, CardTitle } from '../ui/card'
import { AnimatedCard } from '../ui/animated-card'
import { AnimatedValue } from '../ui/animated-value'
import { formatSensorValue } from '../../lib/formatSensorValue'
import { StatusBadge } from './StatusBadge'

function SensorCard({
  title,
  value,
  unit,
  status,
  variant = 'default',
  icon: Icon,
  delay = 0,
}) {
  const reading = formatSensorValue(value, unit)

  return (
    <AnimatedCard delay={delay}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {Icon ? (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-2 text-cyan-700">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
          ) : null}
          <div>
            <CardTitle>{title}</CardTitle>
            <AnimatedValue
              value={reading}
              className="mt-2 font-mono text-2xl font-semibold tracking-tight text-cyan-700"
            />
          </div>
        </div>
        {status ? <StatusBadge label={status} variant={variant} icon={null} /> : null}
      </CardHeader>
    </AnimatedCard>
  )
}

export { SensorCard }
