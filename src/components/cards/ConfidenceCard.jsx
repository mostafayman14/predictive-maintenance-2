import { motion } from 'framer-motion'

import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { AnimatedCard } from '../ui/animated-card'
import { AnimatedValue } from '../ui/animated-value'
import { springTransition } from '../../lib/motion'
import { StatusBadge } from './StatusBadge'

function ConfidenceCard({
  title,
  value,
  description,
  status,
  variant = 'default',
  icon: Icon,
  delay = 0,
}) {
  const filledBars = Math.round(value / 8.34)

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
          <AnimatedValue
            value={`${value}%`}
            className="text-4xl font-semibold text-slate-900"
          />
          {status ? <StatusBadge label={status} variant={variant} icon={null} /> : null}
        </div>
        <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 12 }).map((_, index) => (
            <motion.span
              key={index}
              className={
                index < filledBars
                  ? 'h-8 rounded-md bg-cyan-500'
                  : 'h-8 rounded-md bg-slate-200'
              }
              initial={false}
              animate={{
                opacity: index < filledBars ? 1 : 0.35,
                scaleY: index < filledBars ? 1 : 0.85,
              }}
              transition={{ ...springTransition, delay: index * 0.02 }}
            />
          ))}
        </div>
      </CardContent>
    </AnimatedCard>
  )
}

export { ConfidenceCard }
