import { memo } from 'react'

import { cn } from '../../lib/utils'

const CardIcon = memo(function CardIcon({ icon: Icon, className }) {
  if (!Icon) {
    return null
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-cyan-200 bg-cyan-50 p-2 text-cyan-700',
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </div>
  )
})

export { CardIcon }
