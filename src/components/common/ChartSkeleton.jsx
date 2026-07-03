import { Skeleton } from '../ui/skeleton'

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-hidden="true">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-60 w-full rounded-2xl sm:h-64" />
    </div>
  )
}

export { ChartSkeleton }
