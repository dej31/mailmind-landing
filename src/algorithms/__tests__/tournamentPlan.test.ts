import { describe, expect, it } from 'vitest'
import { findBestTournamentFormat } from '../format'
import { generateTournamentPlan } from '../tournamentPlan'
import { makeTeam, makeTournament } from '@/test/factories'

const TEAM_COUNTS = [6, 8, 12, 16, 20]

describe('generateTournamentPlan', () => {
  it.each(TEAM_COUNTS)(
    'builds a coherent full plan for %i teams (pools, matches, schedule, timing)',
    (n) => {
      const teams = Array.from({ length: n }, () => makeTeam())
      const tournament = makeTournament()
      const { recommended } = findBestTournamentFormat(teams, {
        startTime: tournament.startTime,
        targetEndTime: tournament.targetEndTime,
      })

      const plan = generateTournamentPlan(tournament, teams, recommended.scenario, {
        seed: 1,
      })

      expect(plan.pools).toHaveLength(recommended.scenario.pool.poolCount)
      expect(Object.keys(plan.teamPoolAssignment)).toHaveLength(n)
      expect(plan.matches.length).toBe(recommended.scenario.pool.poolMatchCount)

      // Ordre chronologique strict et orderIndex sans trous ni doublons.
      const sorted = [...plan.matches].sort((a, b) => a.orderIndex - b.orderIndex)
      sorted.forEach((m, i) => expect(m.orderIndex).toBe(i))
      for (let i = 1; i < sorted.length; i++) {
        expect(new Date(sorted[i].scheduledStart).getTime()).toBeGreaterThan(
          new Date(sorted[i - 1].scheduledStart).getTime(),
        )
      }

      // Chaque match appartient à une poule existante et oppose deux équipes distinctes.
      const poolIds = new Set(plan.pools.map((p) => p.id))
      for (const match of plan.matches) {
        expect(match.poolId && poolIds.has(match.poolId)).toBe(true)
        expect(match.teamAId).not.toBe(match.teamBId)
      }
    },
  )
})
