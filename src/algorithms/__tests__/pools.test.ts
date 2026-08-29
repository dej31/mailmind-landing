import { describe, expect, it } from 'vitest'
import { balancedPoolSizes, generateBalancedPools } from '../pools'
import { makeTeam, makeTeams } from '@/test/factories'

describe('balancedPoolSizes', () => {
  it('spreads teams as evenly as possible', () => {
    expect(balancedPoolSizes(12, 3)).toEqual([4, 4, 4])
    expect(balancedPoolSizes(13, 3)).toEqual([5, 4, 4])
    expect(balancedPoolSizes(20, 4)).toEqual([5, 5, 5, 5])
    expect(balancedPoolSizes(6, 2)).toEqual([3, 3])
  })
})

const TEAM_COUNTS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

describe('generateBalancedPools', () => {
  it.each(TEAM_COUNTS)(
    'assigns every one of %i teams to exactly one pool with no duplicates',
    (n) => {
      const teams = makeTeams(n)
      const poolCount = n >= 16 ? 4 : n >= 9 ? 3 : 2
      const { assignment } = generateBalancedPools(teams, poolCount, {
        seed: 42,
      })

      const assignedIds = Object.keys(assignment)
      expect(assignedIds.length).toBe(n)
      expect(new Set(assignedIds).size).toBe(n)
      for (const team of teams) {
        expect(assignment[team.id]).toBeGreaterThanOrEqual(0)
        expect(assignment[team.id]).toBeLessThan(poolCount)
      }
    },
  )

  it('spreads an unbalanced category distribution across pools (12 teams: 8M/2F/2J)', () => {
    const teams = [
      ...Array.from({ length: 8 }, () => makeTeam({ category: 'male' })),
      ...Array.from({ length: 2 }, () => makeTeam({ category: 'female' })),
      ...Array.from({ length: 2 }, () => makeTeam({ category: 'youth' })),
    ]
    const { assignment } = generateBalancedPools(teams, 3, { seed: 7 })

    const femaleTeams = teams.filter((t) => t.category === 'female')
    const femalePools = new Set(femaleTeams.map((t) => assignment[t.id]))
    // Les 2 équipes féminines doivent être séparées dans des poules différentes.
    expect(femalePools.size).toBe(2)

    const youthTeams = teams.filter((t) => t.category === 'youth')
    const youthPools = new Set(youthTeams.map((t) => assignment[t.id]))
    expect(youthPools.size).toBe(2)
  })

  it('spreads a very unbalanced distribution across pools (20 teams: 12M/5F/3J)', () => {
    const teams = [
      ...Array.from({ length: 12 }, () => makeTeam({ category: 'male' })),
      ...Array.from({ length: 5 }, () => makeTeam({ category: 'female' })),
      ...Array.from({ length: 3 }, () => makeTeam({ category: 'youth' })),
    ]
    const { assignment } = generateBalancedPools(teams, 4, { seed: 3 })

    const poolSizes = [0, 0, 0, 0]
    for (const team of teams) poolSizes[assignment[team.id]]++
    expect(Math.max(...poolSizes) - Math.min(...poolSizes)).toBeLessThanOrEqual(1)

    const femaleTeams = teams.filter((t) => t.category === 'female')
    const femalePoolCounts = new Map<number, number>()
    for (const t of femaleTeams) {
      const p = assignment[t.id]
      femalePoolCounts.set(p, (femalePoolCounts.get(p) ?? 0) + 1)
    }
    // Avec 5 féminines sur 4 poules, aucune poule ne doit en recevoir plus de 2.
    expect(Math.max(...femalePoolCounts.values())).toBeLessThanOrEqual(2)
  })

  it('ignores forfeited teams', () => {
    const teams = [
      ...makeTeams(8),
      makeTeam({ status: 'forfeit' }),
      makeTeam({ status: 'forfeit' }),
    ]
    const { assignment } = generateBalancedPools(teams, 2, { seed: 1 })
    expect(Object.keys(assignment).length).toBe(8)
  })
})
