import { Info } from 'lucide-react'
import { motion } from 'framer-motion'

import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { AnimatedCard } from '../ui/animated-card'
import { transition } from '../../lib/motion'

function SystemInfoCard({
  title,
  description,
  items = [],
  icon: Icon = Info,
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
        <dl className="grid gap-3 sm:grid-cols-2">
          {items.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: delay + index * 0.04 }}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</dt>
              <dd className="mt-2 text-sm font-medium text-slate-800">{item.value}</dd>
            </motion.div>
          ))}
        </dl>
      </CardContent>
    </AnimatedCard>
  )
}

export { SystemInfoCard }
