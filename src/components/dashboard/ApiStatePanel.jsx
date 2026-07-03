import { AlertTriangle, RefreshCw } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { fadeInUp, transition } from '../../lib/motion'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'

function ApiStatePanel({
  isLoading,
  isRetrying,
  errors = [],
  onRetry,
  loadingLabel,
  errorTitle,
  retryLabel,
}) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="api-loading"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-cyan-800">{loadingLabel}</p>
            <RefreshCw className="h-4 w-4 animate-spin text-cyan-600" />
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.1 }}
              >
                <Skeleton className="h-3 w-full" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : null}

      {!isLoading && errors.length > 0 ? (
        <motion.div
          key="api-error"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
                <AlertTriangle className="h-4 w-4" />
                {errorTitle}
              </div>
              <ul className="mt-2 space-y-1 text-sm text-amber-800/90">
                {errors.map((error) => (
                  <li key={error.key}>
                    {error.key}: {error.message}
                  </li>
                ))}
              </ul>
            </div>

            <Button type="button" variant="outline" onClick={onRetry} disabled={isRetrying}>
              <RefreshCw className={isRetrying ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
              {retryLabel}
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export { ApiStatePanel }
