import type { MatchType } from '@/models'
import { createRng, type Rng } from './rng'

export interface ScheduleCandidate {
  id: string
  poolId?: string
  type: MatchType
  teamAId: string
  teamBId: string
}

/** Score d'ordonnancement : plus il est BAS, meilleur est le planning
 * (0 = aucune pénalité). Le terrain est unique, les matchs sont donc
 * forcément séquentiels ; l'objectif est de maximiser le temps de repos
 * entre deux matchs d'une même équipe. */
export function calculateScheduleScore(order: ScheduleCandidate[]): number {
  const indicesByTeam = new Map<string, number[]>()
  order.forEach((match, index) => {
    for (const teamId of [match.teamAId, match.teamBId]) {
      const list = indicesByTeam.get(teamId) ?? []
      list.push(index)
      indicesByTeam.set(teamId, list)
    }
  })

  const gaps: number[] = []
  let penalty = 0

  for (const indices of indicesByTeam.values()) {
    for (let i = 1; i < indices.length; i++) {
      const gap = indices[i] - indices[i - 1] - 1
      gaps.push(gap)
      if (gap === 0) {
        penalty += 1000 // deux matchs consécutifs pour la même équipe
      } else if (gap === 1) {
        penalty += 200 // un seul match de répit
      }
    }
  }

  if (gaps.length > 0) {
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
    for (const gap of gaps) {
      if (gap > 1 && gap < avgGap) {
        penalty += (avgGap - gap) * 8
      }
    }
    const variance =
      gaps.reduce((acc, g) => acc + (g - avgGap) ** 2, 0) / gaps.length
    penalty += variance * 2 // bonus implicite : homogénéité de la récupération
  }

  for (let i = 1; i < order.length; i++) {
    if (
      order[i].poolId &&
      order[i].poolId === order[i - 1].poolId &&
      order[i].type === 'pool'
    ) {
      penalty += 5 // favorise l'alternance des poules pour la lisibilité
    }
  }

  return penalty
}

function interleaveByPool(matches: ScheduleCandidate[]): ScheduleCandidate[] {
  const groups = new Map<string, ScheduleCandidate[]>()
  for (const match of matches) {
    const key = match.poolId ?? match.type
    const list = groups.get(key) ?? []
    list.push(match)
    groups.set(key, list)
  }
  const queues = [...groups.values()]
  const result: ScheduleCandidate[] = []
  let remaining = matches.length
  let cursor = 0
  while (remaining > 0) {
    const queue = queues[cursor % queues.length]
    if (queue.length > 0) {
      result.push(queue.shift()!)
      remaining--
    }
    cursor++
  }
  return result
}

/** Ordonnance les matchs sur le terrain unique en maximisant la
 * récupération des équipes : part d'un ordre initial qui alterne les
 * poules, puis explore de nombreux échanges aléatoires de position via une
 * recherche locale, en ne conservant que le meilleur ordre trouvé
 * (`calculateScheduleScore`). */
export function optimizeMatchSchedule(
  matches: ScheduleCandidate[],
  options: { iterations?: number; seed?: number } = {},
): ScheduleCandidate[] {
  if (matches.length <= 2) return matches
  const iterations = options.iterations ?? 6000
  const rng: Rng = createRng(options.seed)

  let best = interleaveByPool(matches)
  let bestScore = calculateScheduleScore(best)

  let current = [...best]
  let currentScore = bestScore

  for (let i = 0; i < iterations; i++) {
    const a = Math.floor(rng() * current.length)
    const b = Math.floor(rng() * current.length)
    if (a === b) continue

    const attempt = [...current]
    ;[attempt[a], attempt[b]] = [attempt[b], attempt[a]]
    const attemptScore = calculateScheduleScore(attempt)

    if (attemptScore <= currentScore) {
      current = attempt
      currentScore = attemptScore
      if (attemptScore < bestScore) {
        best = attempt
        bestScore = attemptScore
      }
    }
  }

  return best
}
