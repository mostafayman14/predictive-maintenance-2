import { AnimatePresence, motion } from 'framer-motion'

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { springTransition, valueChange } from '../../lib/motion'

function AnimatedValue({ value, className, as: Component = motion.span }) {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (prefersReducedMotion) {
    return <span className={className}>{value}</span>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Component
        key={String(value)}
        variants={valueChange}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={springTransition}
        className={className}
      >
        {value}
      </Component>
    </AnimatePresence>
  )
}

export { AnimatedValue }
