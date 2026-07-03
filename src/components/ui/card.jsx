import { cn } from '../../lib/utils'

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm shadow-slate-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-100/50',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return <div className={cn('space-y-1.5 p-5 pb-3', className)} {...props} />
}

function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn('text-sm font-semibold tracking-wide text-slate-900', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-slate-600', className)} {...props} />
}

function CardContent({ className, ...props }) {
  return <div className={cn('p-5 pt-2', className)} {...props} />
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle }
