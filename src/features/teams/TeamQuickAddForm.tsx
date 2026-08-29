import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus } from 'lucide-react'
import type { TeamCategory, TeamLevel } from '@/models'
import { TEAM_CATEGORY_EMOJI, TEAM_CATEGORY_LABEL, TEAM_LEVEL_LABEL } from '@/models'
import { Button } from '@/components'

const CATEGORIES: TeamCategory[] = ['male', 'female', 'youth']
const LEVELS: TeamLevel[] = ['leisure', 'intermediate', 'confirmed']

export function TeamQuickAddForm({
  onAdd,
}: {
  onAdd: (data: { name: string; category: TeamCategory; level?: TeamLevel }) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<TeamCategory>('male')
  const [level, setLevel] = useState<TeamLevel | undefined>(undefined)
  const [showOptions, setShowOptions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || submitting) return
    setSubmitting(true)
    try {
      await onAdd({ name: name.trim(), category, level })
      setName('')
      inputRef.current?.focus()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded border-2 border-cream/15 bg-ink-soft p-4"
    >
      <label htmlFor="team-name" className="mb-1 block text-sm font-semibold text-cream/80">
        Nom de l'équipe
      </label>
      <input
        id="team-name"
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Les Pompoms"
        className="mb-3 w-full rounded border-2 border-cream/20 bg-ink px-3 py-2.5 text-cream outline-none focus:border-gold"
      />

      <p className="mb-1 text-sm font-semibold text-cream/80">Type</p>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={[
              'flex min-h-14 flex-col items-center justify-center gap-0.5 rounded border-2 text-sm font-semibold',
              category === c
                ? 'border-gold bg-gold/15 text-gold'
                : 'border-cream/20 text-cream/70',
            ].join(' ')}
          >
            <span className="text-xl leading-none">{TEAM_CATEGORY_EMOJI[c]}</span>
            {TEAM_CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      {!showOptions ? (
        <button
          type="button"
          onClick={() => setShowOptions(true)}
          className="mb-3 text-sm font-semibold text-cream/60 underline underline-offset-2"
        >
          Options avancées (niveau)
        </button>
      ) : (
        <div className="mb-3">
          <p className="mb-1 text-sm font-semibold text-cream/80">
            Niveau <span className="font-normal text-cream/50">(facultatif)</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(level === l ? undefined : l)}
                className={[
                  'min-h-11 rounded border-2 text-sm font-semibold',
                  level === l
                    ? 'border-gold bg-gold/15 text-gold'
                    : 'border-cream/20 text-cream/70',
                ].join(' ')}
              >
                {TEAM_LEVEL_LABEL[l]}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" fullWidth disabled={!name.trim() || submitting}>
        <Plus size={20} /> Ajouter une équipe
      </Button>
    </form>
  )
}
