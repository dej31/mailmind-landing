import { useMemo } from 'react'
import { Trophy } from 'lucide-react'
import { usePublicTournamentData } from './PublicLayout'
import { PageHeader, EmptyState, Panel } from '@/components'
import type { Match } from '@/models'

function BracketMatch({
  match,
  teamAName,
  teamBName,
  label,
}: {
  match?: Match
  teamAName: string
  teamBName: string
  label: string
}) {
  const done = match?.status === 'finished'
  const live = match?.status === 'live'
  return (
    <Panel
      tone={live ? 'live' : 'default'}
      className="flex flex-col gap-1 p-3 text-center"
    >
      <p className="text-xs uppercase tracking-wide text-cream/50">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <span
          className={[
            'flex-1 truncate text-left font-semibold',
            done && (match!.scoreA ?? 0) > (match!.scoreB ?? 0)
              ? 'text-gold'
              : 'text-cream',
          ].join(' ')}
        >
          {teamAName}
        </span>
        <span className="font-display font-bold tabular-nums text-cream">
          {done || live ? match?.scoreA ?? 0 : ''}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span
          className={[
            'flex-1 truncate text-left font-semibold',
            done && (match!.scoreB ?? 0) > (match!.scoreA ?? 0)
              ? 'text-gold'
              : 'text-cream',
          ].join(' ')}
        >
          {teamBName}
        </span>
        <span className="font-display font-bold tabular-nums text-cream">
          {done || live ? match?.scoreB ?? 0 : ''}
        </span>
      </div>
    </Panel>
  )
}

export function PublicFinalsPage() {
  const { teams, matches } = usePublicTournamentData()
  const teamsById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams])
  const semiFinals = matches.filter((m) => m.type === 'semifinal')
  const final = matches.find((m) => m.type === 'final')

  const name = (id?: string) => (id ? teamsById.get(id)?.name ?? '—' : '?')

  return (
    <div className="pb-4">
      <PageHeader title="Phases finales" />
      <div className="px-4 py-4 sm:px-6">
        {semiFinals.length === 0 ? (
          <EmptyState
            icon={<Trophy size={36} />}
            title="Demi-finales à venir"
            description="Elles seront annoncées dès la fin des poules."
          />
        ) : (
          <div className="mx-auto flex max-w-sm flex-col gap-4">
            <BracketMatch
              match={semiFinals[0]}
              teamAName={name(semiFinals[0]?.teamAId)}
              teamBName={name(semiFinals[0]?.teamBId)}
              label="Demi-finale 1"
            />
            <BracketMatch
              match={semiFinals[1]}
              teamAName={name(semiFinals[1]?.teamAId)}
              teamBName={name(semiFinals[1]?.teamBId)}
              label="Demi-finale 2"
            />

            <div className="my-1 text-center text-cream/30">↓</div>

            <BracketMatch
              match={final}
              teamAName={final ? name(final.teamAId) : 'Vainqueur DF1'}
              teamBName={final ? name(final.teamBId) : 'Vainqueur DF2'}
              label="🏆 Finale"
            />

            {final?.status === 'finished' && (
              <p className="text-center font-display text-2xl font-bold text-gold">
                🏆{' '}
                {(final.scoreA ?? 0) > (final.scoreB ?? 0)
                  ? name(final.teamAId)
                  : name(final.teamBId)}{' '}
                🏆
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
