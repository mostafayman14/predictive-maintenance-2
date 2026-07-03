import { motion } from 'framer-motion'

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { cardHover, fadeInUp, transition } from '../../lib/motion'
import { cn } from '../../lib/utils'

const cardClassName =
  'rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm shadow-slate-200/60'

function AnimatedCard({
  className,
  delay = 0,
  hover = true,
  layout = false,
  children,
  ...props
}) {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (prefersReducedMotion) {
    return (
      <div className={cn(cardClassName, className)} {...props}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      layout={layout}
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ ...transition, delay }}
      whileHover={hover ? cardHover : undefined}
      className={cn(
        cardClassName,
        hover && 'hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-100/50',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export { AnimatedCard }
