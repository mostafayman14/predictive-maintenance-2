import { memo } from 'react'
import { motion } from 'framer-motion'

import { transition } from '../../lib/motion'

const SectionHeader = memo(function SectionHeader({ title, description, className }) {
  return (
    <motion.div
      className={className ?? 'mb-4'}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={transition}
    >
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description ? <p className="text-sm text-slate-600">{description}</p> : null}
    </motion.div>
  )
})

export { SectionHeader }
