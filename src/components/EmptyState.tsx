import type { ReactNode } from 'react'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-cream/70">
      {icon && <div className="text-cream/40">{icon}</div>}
      <p className="font-display text-xl font-semibold text-cream">{title}</p>
      {description && <p className="max-w-sm">{description}</p>}
      {action}
    </div>
  )
}
