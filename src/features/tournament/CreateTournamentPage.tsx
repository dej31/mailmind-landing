import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/AuthProvider'
import { DEFAULT_NEW_TOURNAMENT, DEFAULT_TOURNAMENT_SETTINGS } from '@/models'
import { createTournament, slugExists } from '@/repositories'
import { slugify, randomSuffix } from '@/utils/slugify'
import { Button, PageHeader } from '@/components'

async function makeUniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || 'challenge-halle-back'
  let slug = base
  while (await slugExists(slug)) {
    slug = `${base}-${randomSuffix()}`
  }
  return slug
}

export function CreateTournamentPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [name, setName] = useState(DEFAULT_NEW_TOURNAMENT.name)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState(DEFAULT_NEW_TOURNAMENT.startTime)
  const [targetEndTime, setTargetEndTime] = useState(DEFAULT_NEW_TOURNAMENT.targetEndTime)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    try {
      const slug = await makeUniqueSlug(name)
      const tournament = await createTournament({
        name,
        slug,
        date,
        startTime,
        targetEndTime,
        status: 'draft',
        settings: DEFAULT_TOURNAMENT_SETTINGS,
        ownerId: user.id,
      })
      navigate(`/admin/${tournament.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg pb-16">
      <PageHeader eyebrow="Nouveau" title="Créer le tournoi" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-4 sm:px-6">
        <Field label="Nom">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded border-2 border-cream/20 bg-ink px-3 py-2.5 text-cream outline-none focus:border-gold"
          />
        </Field>
        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded border-2 border-cream/20 bg-ink px-3 py-2.5 text-cream outline-none focus:border-gold"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Heure de début">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full rounded border-2 border-cream/20 bg-ink px-3 py-2.5 text-cream outline-none focus:border-gold"
            />
          </Field>
          <Field label="Fin souhaitée">
            <input
              type="time"
              value={targetEndTime}
              onChange={(e) => setTargetEndTime(e.target.value)}
              required
              className="w-full rounded border-2 border-cream/20 bg-ink px-3 py-2.5 text-cream outline-none focus:border-gold"
            />
          </Field>
        </div>
        <p className="text-sm text-cream/50">
          Un seul terrain, comme toujours pour le Challenge — tous les matchs
          s'enchaînent l'un après l'autre.
        </p>
        <Button type="submit" fullWidth size="xl" disabled={submitting}>
          {submitting ? 'Création…' : 'Créer le tournoi'}
        </Button>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-cream/80">{label}</span>
      {children}
    </label>
  )
}
