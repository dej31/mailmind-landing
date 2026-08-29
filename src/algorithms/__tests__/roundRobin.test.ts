import { describe, expect, it } from 'vitest'
import { generateLimitedPoolMatches, generateRoundRobin } from '../roundRobin'

function pairKey(teamAId: string, teamBId: string): string {
  return [teamAId, teamBId].sort().join('|')
}

describe('generateRoundRobin', () => {
  it.each([2, 3, 4, 5, 6, 7, 8, 9, 10])(
    'produces n*(n-1)/2 unique matches for %i teams, each team playing n-1 times',
    (n) => {
      const ids = Array.from({ length: n }, (_, i) => `t${i}`)
      const pairs = generateRoundRobin(ids)

      expect(pairs.length).toBe((n * (n - 1)) / 2)

      const seen = new Set<string>()
      for (const pair of pairs) {
        const key = pairKey(pair.teamAId, pair.teamBId)
        expect(seen.has(key)).toBe(false)
        seen.add(key)
        expect(pair.teamAId).not.toBe(pair.teamBId)
      }

      const counts = new Map<string, number>()
      for (const pair of pairs) {
        counts.set(pair.teamAId, (counts.get(pair.teamAId) ?? 0) + 1)
        counts.set(pair.teamBId, (counts.get(pair.teamBId) ?? 0) + 1)
      }
      for (const id of ids) {
        expect(counts.get(id)).toBe(n - 1)
      }
    },
  )
})

describe('generateLimitedPoolMatches', () => {
  it.each([4, 5, 6, 7, 8, 9, 10])(
    'gives each of %i teams at least matchesPerTeam-1 matches with no duplicate pairing',
    (n) => {
      const ids = Array.from({ length: n }, (_, i) => `t${i}`)
      const matchesPerTeam = 3
      const pairs = generateLimitedPoolMatches(ids, matchesPerTeam)

      const seen = new Set<string>()
      for (const pair of pairs) {
        const key = pairKey(pair.teamAId, pair.teamBId)
        expect(seen.has(key)).toBe(false)
        seen.add(key)
      }

      const counts = new Map<string, number>()
      for (const id of ids) counts.set(id, 0)
      for (const pair of pairs) {
        counts.set(pair.teamAId, (counts.get(pair.teamAId) ?? 0) + 1)
        counts.set(pair.teamBId, (counts.get(pair.teamBId) ?? 0) + 1)
      }

      for (const count of counts.values()) {
        expect(count).toBeGreaterThanOrEqual(matchesPerTeam - 1)
        expect(count).toBeLessThanOrEqual(matchesPerTeam)
      }
    },
  )

  it('never exceeds the maximum possible matches per team', () => {
    const ids = Array.from({ length: 5 }, (_, i) => `t${i}`)
    const pairs = generateLimitedPoolMatches(ids, 50)
    // 5 équipes -> round robin complet = 4 matchs max par équipe
    expect(pairs.length).toBe(10)
  })
})
