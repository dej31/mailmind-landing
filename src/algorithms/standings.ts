import type {
  CrossPoolStandingRow,
  Match,
  Pool,
  PoolStanding,
  Team,
  TeamStanding,
  TournamentSettings,
} from '@/models'
import { emptyStanding } from '@/models'

function applyMatchToStandings(
  standings: Map<string, TeamStanding>,
  match: Match,
  settings: TournamentSettings,
) {
  if (
    match.status !== 'finished' ||
    match.scoreA === undefined ||
    match.scoreB === undefined
  ) {
    return
  }

  const a = standings.get(match.teamAId) ?? emptyStanding(match.teamAId)
  const b = standings.get(match.teamBId) ?? emptyStanding(match.teamBId)

  a.played++
  b.played++
  a.pointsFor += match.scoreA
  a.pointsAgainst += match.scoreB
  b.pointsFor += match.scoreB
  b.pointsAgainst += match.scoreA

  if (match.scoreA > match.scoreB) {
    a.won++
    b.lost++
    a.points += settings.pointsWin
    b.points += settings.pointsLoss
  } else if (match.scoreA < match.scoreB) {
    b.won++
    a.lost++
    b.points += settings.pointsWin
    a.points += settings.pointsLoss
  } else {
    a.drawn++
    b.drawn++
    a.points += settings.pointsDraw
    b.points += settings.pointsDraw
  }

  a.diff = a.pointsFor - a.pointsAgainst
  b.diff = b.pointsFor - b.pointsAgainst

  standings.set(match.teamAId, a)
  standings.set(match.teamBId, b)
}

function headToHeadDiff(teamAId: string, teamBId: string, matches: Match[]): number {
  let diff = 0
  for (const match of matches) {
    if (match.status !== 'finished') continue
    if (match.scoreA === undefined || match.scoreB === undefined) continue
    if (match.teamAId === teamAId && match.teamBId === teamBId) {
      diff += match.scoreA - match.scoreB
    } else if (match.teamAId === teamBId && match.teamBId === teamAId) {
      diff += match.scoreB - match.scoreA
    }
  }
  return diff
}

function compareStandings(
  a: TeamStanding,
  b: TeamStanding,
  matches: Match[],
): number {
  if (b.points !== a.points) return b.points - a.points
  if (b.diff !== a.diff) return b.diff - a.diff
  if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor
  const h2h = headToHeadDiff(a.teamId, b.teamId, matches)
  if (h2h !== 0) return -h2h
  return 0
}

/** Classement d'une poule (section 22-23) : points, puis diff, puis
 * scores marqués, puis confrontation directe. Les équipes n'ayant joué
 * aucun match apparaissent quand même, à 0 point. */
export function calculatePoolStandings(
  teams: Team[],
  matches: Match[],
  poolId: string,
  settings: TournamentSettings,
): PoolStanding {
  const poolTeams = teams.filter((t) => t.poolId === poolId)
  const poolMatches = matches.filter(
    (m) => m.poolId === poolId && m.type === 'pool',
  )

  const standings = new Map<string, TeamStanding>()
  for (const team of poolTeams) standings.set(team.id, emptyStanding(team.id))
  for (const match of poolMatches) {
    applyMatchToStandings(standings, match, settings)
  }

  const rows = [...standings.values()].sort((a, b) =>
    compareStandings(a, b, poolMatches),
  )

  return { poolId, rows }
}

/** Classement inter-poules normalisé "par match joué" (section 24), pour
 * comparer équitablement des équipes qui n'ont pas toutes disputé le même
 * nombre de rencontres. */
export function calculateCrossPoolRanking(
  pools: Pool[],
  teams: Team[],
  matches: Match[],
  settings: TournamentSettings,
  qualifiersCount = 4,
): CrossPoolStandingRow[] {
  const rows: CrossPoolStandingRow[] = []

  for (const pool of pools) {
    const poolStanding = calculatePoolStandings(teams, matches, pool.id, settings)
    poolStanding.rows.forEach((row, index) => {
      const played = row.played || 1
      rows.push({
        ...row,
        poolId: pool.id,
        poolRank: index + 1,
        pointsPerGame: row.points / played,
        diffPerGame: row.diff / played,
        scoredPerGame: row.pointsFor / played,
        winRate: row.played > 0 ? row.won / row.played : 0,
        qualified: false,
      })
    })
  }

  rows.sort((a, b) => {
    if (b.pointsPerGame !== a.pointsPerGame) return b.pointsPerGame - a.pointsPerGame
    if (b.diffPerGame !== a.diffPerGame) return b.diffPerGame - a.diffPerGame
    if (b.scoredPerGame !== a.scoredPerGame) return b.scoredPerGame - a.scoredPerGame
    if (b.winRate !== a.winRate) return b.winRate - a.winRate
    return a.poolRank - b.poolRank
  })

  rows.forEach((row, index) => {
    row.qualified = index < qualifiersCount
  })

  return rows
}
