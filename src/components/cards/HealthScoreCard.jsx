import { motion } from 'framer-motion'

import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { AnimatedCard } from '../ui/animated-card'
import { AnimatedValue } from '../ui/animated-value'
import { springTransition } from '../../lib/motion'
import { StatusBadge } from './StatusBadge'

function HealthScoreCard({
  title,
  score,
  maxScore = 100,
  description,
  status,
  variant = 'default',
  icon: Icon,
  delay = 0,
}) {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100))

  return (
    <AnimatedCard delay={delay}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
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
        <div className="mb-4 flex items-end justify-between gap-4">
          <AnimatedValue value={score} className="text-4xl font-semibold text-slate-900" />
          {status ? <StatusBadge label={status} variant={variant} icon={null} /> : null}
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            className="h-full rounded-full bg-cyan-500"
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={springTransition}
          />
        </div>
      </CardContent>
    </AnimatedCard>
  )
}

export { HealthScoreCard }
