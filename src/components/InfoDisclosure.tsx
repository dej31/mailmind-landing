import { useId, useState } from 'react'
import { HelpCircle } from 'lucide-react'

/** Petite explication contextuelle repliée par défaut (section 66) :
 * jamais de pavé de texte imposé, l'utilisateur ouvre "?" s'il veut
 * comprendre comment une décision automatique a été prise. */
export function InfoDisclosure({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div className="inline-block">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-8 items-center gap-1 rounded-full border border-cream/30 px-2.5 py-1 text-sm text-cream/70 hover:border-gold hover:text-gold"
      >
        <HelpCircle size={14} />
        {label}
      </button>
      {open && (
        <p
          id={id}
          className="mt-2 max-w-sm rounded border border-cream/15 bg-ink-soft px-3 py-2 text-sm text-cream/80"
        >
          {children}
        </p>
      )}
    </div>
  )
}
