import { describe, expect, it } from 'vitest'
import { generateRoundRobin } from '../roundRobin'
import {
  calculateScheduleScore,
  optimizeMatchSchedule,
  type ScheduleCandidate,
} from '../schedule'

function buildCandidates(poolSizes: number[]): ScheduleCandidate[] {
  const candidates: ScheduleCandidate[] = []
  let idCounter = 0
  poolSizes.forEach((size, poolIndex) => {
    const ids = Array.from({ length: size }, (_, i) => `p${poolIndex}-${i}`)
    const pairs = generateRoundRobin(ids)
    for (const pair of pairs) {
      candidates.push({
        id: `m${idCounter++}`,
        poolId: `pool-${poolIndex}`,
        type: 'pool',
        teamAId: pair.teamAId,
        teamBId: pair.teamBId,
      })
    }
  })
  return candidates
}

describe('optimizeMatchSchedule', () => {
  it('never leaves a team playing two consecutive matches when avoidable', () => {
    const candidates = buildCandidates([4, 4, 4])
    const ordered = optimizeMatchSchedule(candidates, { seed: 123, iterations: 4000 })

    for (let i = 1; i < ordered.length; i++) {
      const prev = ordered[i - 1]
      const curr = ordered[i]
      const overlap =
        prev.teamAId === curr.teamAId ||
        prev.teamAId === curr.teamBId ||
        prev.teamBId === curr.teamAId ||
        prev.teamBId === curr.teamBId
      expect(overlap).toBe(false)
    }
  })

  it('reduces (or keeps equal) the schedule score compared to an unoptimized interleave', () => {
    const candidates = buildCandidates([5, 5, 5, 5])
    const optimized = optimizeMatchSchedule(candidates, { seed: 99 })
    const naive = [...candidates].reverse()

    expect(calculateScheduleScore(optimized)).toBeLessThanOrEqual(
      calculateScheduleScore(naive),
    )
  })

  it('keeps every match exactly once, in any order', () => {
    const candidates = buildCandidates([6, 6])
    const ordered = optimizeMatchSchedule(candidates, { seed: 5 })
    expect(ordered.length).toBe(candidates.length)
    expect(new Set(ordered.map((m) => m.id)).size).toBe(candidates.length)
  })
})
