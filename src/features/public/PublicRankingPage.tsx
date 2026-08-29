import { useMemo } from 'react'
import { usePublicTournamentData } from './PublicLayout'
import { calculatePoolStandings } from '@/algorithms/standings'
import { PageHeader, InfoDisclosure } from '@/components'
import { PoolStandingsTable } from '@/features/ranking/PoolStandingsTable'

export function PublicRankingPage() {
  const { tournament, teams, pools, matches, qualifications } = usePublicTournamentData()
  const teamsById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams])
  const qualifiedTeamIds = useMemo(
    () => new Set(qualifications.map((q) => q.teamId)),
    [qualifications],
  )

  if (!tournament) return null

  return (
    <div className="pb-4">
      <PageHeader
        title="Classement"
        actions={
          pools.length >= 3 ? (
            <InfoDisclosure label="Comment sont choisis les qualifiés ?">
              Comme les poules n'ont pas toutes la même taille, on compare les
              équipes sur leurs statistiques ramenées "par match joué" plutôt
              que sur leurs totaux bruts, pour rester équitable.
            </InfoDisclosure>
          ) : undefined
        }
      />
      <div className="flex flex-col gap-6 px-4 py-4 sm:px-6">
        {pools.map((pool) => {
          const standing = calculatePoolStandings(teams, matches, pool.id, tournament.settings)
          return (
            <div key={pool.id}>
              <p className="mb-2 font-display text-lg font-bold text-gold">{pool.name}</p>
              <PoolStandingsTable
                standing={standing}
                teamsById={teamsById}
                qualifiedTeamIds={qualifiedTeamIds.size > 0 ? qualifiedTeamIds : undefined}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
