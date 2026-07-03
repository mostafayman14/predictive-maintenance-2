import { AlertTriangle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { AnimatedCard } from '../ui/animated-card'
import { scaleIn, springTransition, valueChange } from '../../lib/motion'
import { StatusBadge } from '../cards/StatusBadge'

function FaultCard({
  title,
  fault,
  severity,
  description,
  variant = 'default',
  icon: Icon = AlertTriangle,
  delay = 0,
}) {
  const isAlert = variant === 'warning' || severity?.toLowerCase() === 'high'

  return (
    <AnimatedCard delay={delay} layout className="relative overflow-hidden">
      <AnimatePresence initial={false}>
        {isAlert ? (
          <motion.div
            key="fault-glow"
            className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-amber-400/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : null}
      </AnimatePresence>

      <CardHeader className="relative flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {Icon ? (
          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            transition={springTransition}
            className="rounded-xl border border-cyan-200 bg-cyan-50 p-2 text-cyan-700"
          >
            <Icon className="h-4 w-4" />
          </motion.div>
        ) : null}
      </CardHeader>
      <CardContent className="relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={fault}
              variants={valueChange}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={springTransition}
              className="text-xl font-semibold text-slate-900"
            >
              {fault}
            </motion.p>
          </AnimatePresence>
          {severity ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={severity}
                variants={scaleIn}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={springTransition}
              >
                <StatusBadge label={severity} variant={variant} icon={null} />
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      </CardContent>
    </AnimatedCard>
  )
}

export { FaultCard }
