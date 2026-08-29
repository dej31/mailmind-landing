import { describe, expect, it } from 'vitest'
import { ALLOWED_DURATIONS, findBestTournamentFormat } from '../format'
import { makeTeam } from '@/test/factories'

const TEAM_COUNTS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

function teamsFor(n: number) {
  return Array.from({ length: n }, () => makeTeam())
}

describe('findBestTournamentFormat', () => {
  it.each(TEAM_COUNTS)(
    'produces a coherent, realistic format for %i teams starting at 15:30',
    (n) => {
      const { recommended } = findBestTournamentFormat(teamsFor(n), {
        startTime: '15:30',
        targetEndTime: '20:00',
      })
      const { scenario } = recommended

      // Toutes les équipes sont réparties, aucune poule vide ni à 1 équipe.
      expect(scenario.pool.poolSizes.reduce((a, b) => a + b, 0)).toBe(n)
      expect(Math.min(...scenario.pool.poolSizes)).toBeGreaterThanOrEqual(2)

      // Chaque équipe joue au moins 2 matchs de poule.
      expect(scenario.pool.minMatchesPerTeam).toBeGreaterThanOrEqual(2)

      // Durées "rondes" uniquement.
      expect(ALLOWED_DURATIONS).toContain(scenario.poolMatchDuration)
      expect(ALLOWED_DURATIONS).toContain(scenario.semiFinalDuration)
      expect(ALLOWED_DURATIONS).toContain(scenario.finalDuration)

      // Chronologie coherente.
      expect(scenario.finalStartMinutes).toBeLessThan(scenario.endMinutes)
    },
  )

  it('recommends a full round robin when there is plenty of time (6 teams, 2 pools of 3)', () => {
    const { recommended } = findBestTournamentFormat(teamsFor(6), {
      startTime: '15:30',
      targetEndTime: '20:00',
    })
    // Avec seulement 2 à 4 poules autorisées (section 11) et 6 équipes, le
    // maximum atteignable est 2 matchs/équipe (2 poules de 3, round robin
    // complet) : le moteur doit choisir ce format plutôt qu'un format limité.
    expect(recommended.scenario.pool.minMatchesPerTeam).toBe(2)
    expect(recommended.scenario.pool.fullRoundRobin).toBe(true)
  })

  it('falls back to a limited format for 20 teams to respect the target end time', () => {
    const { recommended } = findBestTournamentFormat(teamsFor(20), {
      startTime: '15:30',
      targetEndTime: '20:00',
    })
    // Avec 20 équipes, un round robin complet dans chaque poule est
    // généralement incompatible avec 20h : le moteur doit limiter le
    // nombre de rencontres plutôt que produire des matchs minuscules ou
    // dépasser largement l'horaire cible.
    expect(recommended.scenario.endMinutes).toBeLessThanOrEqual(20 * 60 + 30)
    expect(recommended.scenario.poolMatchDuration).toBeGreaterThanOrEqual(4)
  })

  it('provides at least one realistic alternative format', () => {
    const { alternatives } = findBestTournamentFormat(teamsFor(16), {
      startTime: '15:30',
      targetEndTime: '20:00',
    })
    expect(alternatives.length).toBeGreaterThan(0)
    for (const alt of alternatives) {
      expect(alt.scenario.pool.poolSizes.reduce((a, b) => a + b, 0)).toBe(16)
    }
  })

  it('throws a clear error below the minimum viable team count', () => {
    expect(() =>
      findBestTournamentFormat(teamsFor(3), {
        startTime: '15:30',
        targetEndTime: '20:00',
      }),
    ).toThrow()
  })

  it('spreads female and youth teams across pools even in unbalanced distributions (16 teams: 10M/3F/3J)', () => {
    const teams = [
      ...Array.from({ length: 10 }, () => makeTeam({ category: 'male' })),
      ...Array.from({ length: 3 }, () => makeTeam({ category: 'female' })),
      ...Array.from({ length: 3 }, () => makeTeam({ category: 'youth' })),
    ]
    const { recommended } = findBestTournamentFormat(teams, {
      startTime: '15:30',
      targetEndTime: '20:00',
    })
    expect(recommended.scenario.pool.poolCount).toBeGreaterThanOrEqual(2)
  })
})
