import { describe, expect, it } from 'vitest'
import { DEFAULT_TOURNAMENT_SETTINGS } from '@/models'
import type { Match, Pool } from '@/models'
import {
  generateFinal,
  generateSemiFinals,
  selectQualifiedTeams,
} from '../finals'
import { finishMatch, makeTeam } from '@/test/factories'

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

describe('selectQualifiedTeams — 2 pools', () => {
  it('qualifies 1st+2nd of each pool, cross-paired for semi-finals', () => {
    const poolA: Pool = { id: 'pool-a', tournamentId: 't1', name: 'Poule A', order: 0 }
    const poolB: Pool = { id: 'pool-b', tournamentId: 't1', name: 'Poule B', order: 1 }
    const [a1, a2, a3] = [
      makeTeam({ poolId: poolA.id }),
      makeTeam({ poolId: poolA.id }),
      makeTeam({ poolId: poolA.id }),
    ]
    const [b1, b2, b3] = [
      makeTeam({ poolId: poolB.id }),
      makeTeam({ poolId: poolB.id }),
      makeTeam({ poolId: poolB.id }),
    ]
    const teams = [a1, a2, a3, b1, b2, b3]

    const matches: Match[] = [
      finishMatch(makeMatch({ poolId: poolA.id, teamAId: a1.id, teamBId: a2.id }), 5, 0),
      finishMatch(makeMatch({ poolId: poolA.id, teamAId: a1.id, teamBId: a3.id }), 5, 0),
      finishMatch(makeMatch({ poolId: poolA.id, teamAId: a2.id, teamBId: a3.id }), 3, 0),
      finishMatch(makeMatch({ poolId: poolB.id, teamAId: b1.id, teamBId: b2.id }), 5, 0),
      finishMatch(makeMatch({ poolId: poolB.id, teamAId: b1.id, teamBId: b3.id }), 5, 0),
      finishMatch(makeMatch({ poolId: poolB.id, teamAId: b2.id, teamBId: b3.id }), 3, 0),
    ]

    const qualified = selectQualifiedTeams(
      [poolA, poolB],
      teams,
      matches,
      DEFAULT_TOURNAMENT_SETTINGS,
    )
    expect(qualified).toHaveLength(4)
    expect(qualified.find((q) => q.seed === 1)?.teamId).toBe(a1.id)
    expect(qualified.find((q) => q.seed === 2)?.teamId).toBe(b1.id)
    expect(qualified.find((q) => q.seed === 3)?.teamId).toBe(a2.id)
    expect(qualified.find((q) => q.seed === 4)?.teamId).toBe(b2.id)

    const bracket = generateSemiFinals(qualified)
    // SF1 = 1ère A vs 2ème B, SF2 = 1ère B vs 2ème A (section 24).
    expect(bracket.semiFinal1).toEqual({ teamAId: a1.id, teamBId: b2.id })
    expect(bracket.semiFinal2).toEqual({ teamAId: b1.id, teamBId: a2.id })
  })
})

describe('generateFinal', () => {
  it('pits the two semi-final winners against each other', () => {
    const sf1 = finishMatch(
      makeMatch({ type: 'semifinal', teamAId: 'x', teamBId: 'y' }),
      4,
      2,
    )
    const sf2 = finishMatch(
      makeMatch({ type: 'semifinal', teamAId: 'z', teamBId: 'w' }),
      1,
      3,
    )
    const final = generateFinal(sf1, sf2)
    expect(final).toEqual({ teamAId: 'x', teamBId: 'w' })
  })

  it('returns undefined while a semi-final is not finished', () => {
    const sf1 = makeMatch({ type: 'semifinal', teamAId: 'x', teamBId: 'y' })
    const sf2 = finishMatch(
      makeMatch({ type: 'semifinal', teamAId: 'z', teamBId: 'w' }),
      1,
      3,
    )
    expect(generateFinal(sf1, sf2)).toBeUndefined()
  })
})
