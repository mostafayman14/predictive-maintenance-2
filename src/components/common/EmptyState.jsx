import { Inbox } from 'lucide-react'

function EmptyState({ title, description, icon: Icon = Inbox }) {
  return (
    <div
      role="status"
      className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"
    >
      <div className="mb-3 rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-cyan-700">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-sm text-slate-600">{description}</p> : null}
    </div>
  )
}

export { EmptyState }
