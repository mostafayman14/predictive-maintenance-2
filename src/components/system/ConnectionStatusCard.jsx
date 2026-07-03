import { Wifi } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { AnimatedCard } from '../ui/animated-card'
import { fadeIn, transition } from '../../lib/motion'
import { StatusBadge } from '../cards/StatusBadge'

function ConnectionStatusCard({
  title,
  status,
  description,
  variant = 'default',
  details,
  icon: Icon = Wifi,
  delay = 0,
}) {
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <StatusBadge label={status} variant={variant} pulse />
          <AnimatePresence mode="wait" initial={false}>
            {details ? (
              <motion.p
                key={details}
                variants={fadeIn}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={transition}
                className="text-sm text-slate-600"
              >
                {details}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </CardContent>
    </AnimatedCard>
  )
}

export { ConnectionStatusCard }
