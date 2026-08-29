import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

export interface BottomNavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

/** Navigation basse, accessible au pouce (section 3/28). Volontairement
 * limitée à 4-5 entrées. */
export function BottomNav({ items }: { items: BottomNavItem[] }) {
  return (
    <nav className="sticky bottom-0 z-20 flex border-t-2 border-terracotta/40 bg-ink pb-[env(safe-area-inset-bottom)]">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            [
              'flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-xs font-semibold',
              isActive ? 'text-gold' : 'text-cream/60',
            ].join(' ')
          }
        >
          <Icon size={22} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
