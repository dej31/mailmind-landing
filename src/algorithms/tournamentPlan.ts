import type {
  Match,
  Pool,
  Team,
  Tournament,
  TournamentFormatScenario,
} from '@/models'
import { generateBalancedPools } from './pools'
import { generateLimitedPoolMatches, generateRoundRobin } from './roundRobin'
import { optimizeMatchSchedule, type ScheduleCandidate } from './schedule'
import { calculateTournamentTiming } from './timing'

const POOL_NAMES = ['Poule A', 'Poule B', 'Poule C', 'Poule D', 'Poule E']

function makeId(): string {
  return crypto.randomUUID()
}

export interface GeneratedTournamentPlan {
  pools: Pool[]
  /** teamId -> poolId */
  teamPoolAssignment: Record<string, string>
  matches: Match[]
}

/** Étape "Générer" de l'assistant admin : construit les poules équilibrées,
 * les rencontres de chaque poule, l'ordonnancement optimal sur le terrain
 * unique puis les horaires réels, à partir du format retenu par
 * `findBestTournamentFormat`. Fonction pure — ne dépend d'aucun accès
 * réseau, seul l'appelant persiste ensuite le résultat dans Supabase. */
export function generateTournamentPlan(
  tournament: Pick<Tournament, 'date' | 'startTime' | 'settings'>,
  teams: Team[],
  scenario: TournamentFormatScenario,
  options: { seed?: number } = {},
): GeneratedTournamentPlan {
  const activeTeams = teams.filter((t) => t.status !== 'forfeit')
  const { poolCount, fullRoundRobin, minMatchesPerTeam } = scenario.pool

  const balanced = generateBalancedPools(activeTeams, poolCount, {
    seed: options.seed,
  })

  const pools: Pool[] = Array.from({ length: poolCount }, (_, i) => ({
    id: makeId(),
    tournamentId: '',
    name: POOL_NAMES[i] ?? `Poule ${i + 1}`,
    order: i,
  }))

  const teamPoolAssignment: Record<string, string> = {}
  for (const team of activeTeams) {
    const poolIndex = balanced.assignment[team.id]
    teamPoolAssignment[team.id] = pools[poolIndex].id
  }

  const candidates: ScheduleCandidate[] = []
  for (const pool of pools) {
    const poolTeamIds = activeTeams
      .filter((t) => teamPoolAssignment[t.id] === pool.id)
      .map((t) => t.id)

    const pairs = fullRoundRobin
      ? generateRoundRobin(poolTeamIds)
      : generateLimitedPoolMatches(poolTeamIds, minMatchesPerTeam)

    for (const pair of pairs) {
      candidates.push({
        id: makeId(),
        poolId: pool.id,
        type: 'pool',
        teamAId: pair.teamAId,
        teamBId: pair.teamBId,
      })
    }
  }

  const ordered = optimizeMatchSchedule(candidates, { seed: options.seed })

  const withDuration = ordered.map((match, index) => ({
    id: match.id,
    plannedDuration: scenario.poolMatchDuration,
    orderIndex: index,
  }))
  const timing = calculateTournamentTiming(
    withDuration,
    tournament.date,
    tournament.startTime,
    tournament.settings.transitionDuration,
  )

  const matches: Match[] = ordered.map((match, index) => ({
    id: match.id,
    tournamentId: '',
    poolId: match.poolId,
    type: match.type,
    teamAId: match.teamAId,
    teamBId: match.teamBId,
    scheduledStart: timing[match.id],
    plannedDuration: scenario.poolMatchDuration,
    status: 'scheduled',
    orderIndex: index,
  }))

  return { pools, teamPoolAssignment, matches }
}
