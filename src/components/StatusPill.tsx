import type { ReactNode } from 'react'

type Tone = 'live' | 'upcoming' | 'done' | 'neutral' | 'warning'

const TONE_CLASSES: Record<Tone, string> = {
  live: 'bg-accent-red text-cream',
  upcoming: 'bg-gold text-ink',
  done: 'bg-cream/15 text-cream',
  neutral: 'bg-cream/10 text-cream/80',
  warning: 'bg-gold text-ink',
}

/** Petite étiquette de statut. Ne repose jamais QUE sur la couleur : le
 * texte porte toujours le sens (section 49 accessibilité). */
export function StatusPill({
  tone = 'neutral',
  children,
  icon,
}: {
  tone?: Tone
  children: ReactNode
  icon?: ReactNode
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wide',
        TONE_CLASSES[tone],
      ].join(' ')}
    >
      {icon}
      {children}
    </span>
  )
}
