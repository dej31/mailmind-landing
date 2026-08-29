import type { ReactNode } from 'react'

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-terracotta/40 px-4 pb-4 pt-6 sm:px-6">
      <div>
        {eyebrow && (
          <p className="font-hand text-2xl leading-none text-gold">{eyebrow}</p>
        )}
        <h1 className="font-display text-3xl font-bold text-cream sm:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-cream/70">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
