import { cn } from '../../lib/utils'

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
