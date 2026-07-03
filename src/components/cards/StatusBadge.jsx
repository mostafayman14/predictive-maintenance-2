import { RadioTower } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { Badge } from '../ui/badge'
import { springTransition } from '../../lib/motion'
import { cn } from '../../lib/utils'

function StatusBadge({
  label,
  variant = 'default',
  icon: Icon = RadioTower,
  pulse = false,
  className,
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={label}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={springTransition}
      >
        <Badge variant={variant} className={cn('shadow-sm', className)}>
          {pulse ? (
            <motion.span
              className="h-2 w-2 rounded-full bg-current shadow-[0_0_12px_currentColor]"
              animate={{ opacity: [1, 0.45, 1], scale: [1, 0.85, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          ) : null}
          {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
          {label}
        </Badge>
      </motion.span>
    </AnimatePresence>
  )
}

export { StatusBadge }
