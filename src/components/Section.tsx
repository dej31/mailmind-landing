import type { ReactNode } from 'react'

export function Section({
  title,
  children,
  className = '',
}: {
  title?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`px-4 py-4 sm:px-6 ${className}`}>
      {title && (
        <h2 className="mb-3 font-display text-xl font-bold text-cream">{title}</h2>
      )}
      {children}
    </section>
  )
}

/** Bloc "aplat + bordure" — jamais de glassmorphism ni de gradient
 * (section 37). Sert de conteneur générique (carte de match, ligne de
 * classement...). */
export function Panel({
  children,
  className = '',
  tone = 'default',
}: {
  children: ReactNode
  className?: string
  tone?: 'default' | 'live' | 'muted'
}) {
  const toneClasses =
    tone === 'live'
      ? 'border-accent-red bg-accent-red/10'
      : tone === 'muted'
        ? 'border-cream/10 bg-cream/5'
        : 'border-cream/15 bg-ink-soft'

  return (
    <div className={`rounded border-2 ${toneClasses} ${className}`}>{children}</div>
  )
}
