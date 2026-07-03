import { BrainCircuit } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { AnimatedCard } from '../ui/animated-card'
import { springTransition, valueChange } from '../../lib/motion'
import { StatusBadge } from '../cards/StatusBadge'

function PredictionCard({
  title,
  prediction,
  probability,
  description,
  variant = 'default',
  icon: Icon = BrainCircuit,
  delay = 0,
}) {
  return (
    <AnimatedCard delay={delay} layout>
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
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={prediction}
                variants={valueChange}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={springTransition}
                className="text-2xl font-semibold text-slate-900"
              >
                {prediction}
              </motion.p>
            </AnimatePresence>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={probability}
                variants={valueChange}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={springTransition}
                className="mt-1 text-sm text-slate-600"
              >
                {probability}% probability
              </motion.p>
            </AnimatePresence>
          </div>
          <StatusBadge label={`${probability}%`} variant={variant} icon={null} />
        </div>
      </CardContent>
    </AnimatedCard>
  )
}

export { PredictionCard }
