import { Trash2, AlertTriangle } from 'lucide-react'
import type { Team } from '@/models'
import { TEAM_CATEGORY_EMOJI } from '@/models'
import { EmptyState } from '@/components'

export function TeamList({
  teams,
  onDelete,
  onToggleForfeit,
}: {
  teams: Team[]
  onDelete: (id: string) => void
  onToggleForfeit: (id: string) => void
}) {
  if (teams.length === 0) {
    return (
      <EmptyState
        title="Aucune équipe pour l'instant"
        description="Ajoutez vos équipes ci-dessus, une par une."
      />
    )
  }

  return (
    <div>
      <p className="mb-2 font-display text-lg font-bold text-cream">
        {teams.length} équipe{teams.length > 1 ? 's' : ''}
      </p>
      <ul className="flex flex-col gap-2">
        {teams.map((team) => (
          <li
            key={team.id}
            className={[
              'flex items-center gap-3 rounded border-2 px-3 py-2.5',
              team.status === 'forfeit'
                ? 'border-cream/10 bg-cream/5 opacity-50'
                : 'border-cream/15 bg-ink-soft',
            ].join(' ')}
          >
            <span className="text-xl">{TEAM_CATEGORY_EMOJI[team.category]}</span>
            <span className="flex-1 truncate font-semibold text-cream">
              {team.name}
              {team.status === 'forfeit' && (
                <span className="ml-2 text-xs uppercase text-cream/50">Forfait</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => onToggleForfeit(team.id)}
              title={team.status === 'forfeit' ? 'Annuler le forfait' : 'Déclarer forfait'}
              className="rounded p-2 text-cream/50 hover:text-gold"
            >
              <AlertTriangle size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(team.id)}
              title="Supprimer"
              className="rounded p-2 text-cream/50 hover:text-accent-red"
            >
              <Trash2 size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
