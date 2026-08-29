import { describe, expect, it } from 'vitest'
import { DEFAULT_TOURNAMENT_SETTINGS } from '@/models'
import type { Match, Pool, Team } from '@/models'
import { calculateCrossPoolRanking, calculatePoolStandings } from '../standings'
import { finishMatch, makeTeam, makeTournament } from '@/test/factories'

function makeMatch(overrides: Partial<Match>): Match {
  return {
    id: overrides.id ?? Math.random().toString(36),
    tournamentId: 'tournament-1',
    type: 'pool',
    teamAId: 'a',
    teamBId: 'b',
    scheduledStart: new Date().toISOString(),
    plannedDuration: 6,
    status: 'scheduled',
    orderIndex: 0,
    ...overrides,
  }
}

describe('calculatePoolStandings', () => {
  it('ranks by points, then diff, then scored, then head-to-head', () => {
    const pool: Pool = { id: 'pool-1', tournamentId: 't1', name: 'Poule A', order: 0 }
    const [teamA, teamB, teamC] = [
      makeTeam({ poolId: pool.id }),
      makeTeam({ poolId: pool.id }),
      makeTeam({ poolId: pool.id }),
    ]
    const teams: Team[] = [teamA, teamB, teamC]

    const matches: Match[] = [
      finishMatch(
        makeMatch({ poolId: pool.id, teamAId: teamA.id, teamBId: teamB.id }),
        5,
        2,
      ),
      finishMatch(
        makeMatch({ poolId: pool.id, teamAId: teamB.id, teamBId: teamC.id }),
        3,
        3,
      ),
      finishMatch(
        makeMatch({ poolId: pool.id, teamAId: teamA.id, teamBId: teamC.id }),
        1,
        1,
      ),
    ]

    const standing = calculatePoolStandings(
      teams,
      matches,
      pool.id,
      DEFAULT_TOURNAMENT_SETTINGS,
    )

    expect(standing.rows[0].teamId).toBe(teamA.id) // 1 victoire + 1 nul = 5 pts
    expect(standing.rows).toHaveLength(3)
    // Tout le monde a joué 2 matchs.
    for (const row of standing.rows) expect(row.played).toBe(2)
  })

  it('includes teams that have not played yet, at zero points', () => {
    const pool: Pool = { id: 'pool-1', tournamentId: 't1', name: 'Poule A', order: 0 }
    const teams = [makeTeam({ poolId: pool.id }), makeTeam({ poolId: pool.id })]
    const standing = calculatePoolStandings(
      teams,
      [],
      pool.id,
      DEFAULT_TOURNAMENT_SETTINGS,
    )
    expect(standing.rows).toHaveLength(2)
    expect(standing.rows.every((r) => r.points === 0)).toBe(true)
  })
})

describe('calculateCrossPoolRanking', () => {
  it('normalizes by games played so pools of different sizes stay comparable', () => {
    makeTournament()
    const poolA: Pool = { id: 'pool-a', tournamentId: 't1', name: 'Poule A', order: 0 }
    const poolB: Pool = { id: 'pool-b', tournamentId: 't1', name: 'Poule B', order: 1 }

    // Poule A : 3 équipes (2 matchs chacune). Poule B : 4 équipes (3 matchs chacune).
    const a1 = makeTeam({ poolId: poolA.id })
    const a2 = makeTeam({ poolId: poolA.id })
    const a3 = makeTeam({ poolId: poolA.id })
    const b1 = makeTeam({ poolId: poolB.id })
    const b2 = makeTeam({ poolId: poolB.id })
    const b3 = makeTeam({ poolId: poolB.id })
    const b4 = makeTeam({ poolId: poolB.id })

    const teams = [a1, a2, a3, b1, b2, b3, b4]

    const matches: Match[] = [
      finishMatch(makeMatch({ poolId: poolA.id, teamAId: a1.id, teamBId: a2.id }), 5, 0),
      finishMatch(makeMatch({ poolId: poolA.id, teamAId: a1.id, teamBId: a3.id }), 5, 0),
      finishMatch(makeMatch({ poolId: poolA.id, teamAId: a2.id, teamBId: a3.id }), 2, 2),

      finishMatch(makeMatch({ poolId: poolB.id, teamAId: b1.id, teamBId: b2.id }), 3, 1),
      finishMatch(makeMatch({ poolId: poolB.id, teamAId: b1.id, teamBId: b3.id }), 3, 1),
      finishMatch(makeMatch({ poolId: poolB.id, teamAId: b1.id, teamBId: b4.id }), 3, 1),
      finishMatch(makeMatch({ poolId: poolB.id, teamAId: b2.id, teamBId: b3.id }), 1, 1),
      finishMatch(makeMatch({ poolId: poolB.id, teamAId: b2.id, teamBId: b4.id }), 1, 1),
      finishMatch(makeMatch({ poolId: poolB.id, teamAId: b3.id, teamBId: b4.id }), 1, 1),
    ]

    const ranking = calculateCrossPoolRanking(
      [poolA, poolB],
      teams,
      matches,
      DEFAULT_TOURNAMENT_SETTINGS,
      4,
    )

    expect(ranking).toHaveLength(7)
    expect(ranking.filter((r) => r.qualified)).toHaveLength(4)
    // a1 a gagné tous ses matchs (2/2) : elle doit être qualifiée.
    expect(ranking.find((r) => r.teamId === a1.id)?.qualified).toBe(true)
    // Le classement est trié du meilleur ratio points/match au pire.
    for (let i = 1; i < ranking.length; i++) {
      expect(ranking[i - 1].pointsPerGame).toBeGreaterThanOrEqual(
        ranking[i].pointsPerGame,
      )
    }
  })
})
