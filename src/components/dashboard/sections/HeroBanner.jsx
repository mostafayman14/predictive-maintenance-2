import { memo } from 'react'
import { motion } from 'framer-motion'

import { formatDisplayTime } from '../../../lib/formatTime'
import { staggerItem } from '../../../lib/motion'

const HeroBanner = memo(function HeroBanner({ hero, liveLabels, lastUpdate }) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-5 shadow-sm shadow-slate-200/60 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-700">{hero.eyebrow}</p>
          <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {hero.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{hero.description}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
            {liveLabels.lastUpdate}
          </p>
          <time className="font-mono text-sm text-cyan-700" dateTime={lastUpdate ?? undefined}>
            {lastUpdate ? formatDisplayTime(lastUpdate) : liveLabels.waiting}
          </time>
        </div>
      </div>
    </motion.div>
  )
})

export { HeroBanner }
