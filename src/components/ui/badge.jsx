import { cn } from '../../lib/utils'

function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    muted: 'border-slate-200 bg-slate-100 text-slate-600',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
