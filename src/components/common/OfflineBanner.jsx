import { WifiOff } from 'lucide-react'
import { motion } from 'framer-motion'

import { slideInDown, transition } from '../../lib/motion'

function OfflineBanner({ title, description }) {
  return (
    <motion.div
      role="status"
      aria-live="polite"
      variants={slideInDown}
      initial="initial"
      animate="animate"
      transition={transition}
          className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-medium">{title}</p>
          {description ? <p className="text-amber-800">{description}</p> : null}
        </div>
      </div>
    </motion.div>
  )
}

export { OfflineBanner }
