import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { AnimatedCard } from '../ui/animated-card'
import { AnimatedValue } from '../ui/animated-value'
import { StatusBadge } from './StatusBadge'

function OverviewCard({
  title,
  value,
  description,
  trend,
  variant = 'default',
  icon: Icon,
  delay = 0,
}) {
  return (
    <AnimatedCard delay={delay}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {Icon ? (
          <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-2 text-cyan-700">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-4">
          <AnimatedValue value={value} className="text-3xl font-semibold tracking-tight text-slate-900" />
          {trend ? <StatusBadge label={trend} variant={variant} icon={null} /> : null}
        </div>
      </CardContent>
    </AnimatedCard>
  )
}

export { OverviewCard }
