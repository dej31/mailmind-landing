import type { Team, TeamCategory } from '@/models'
import { calculatePoolBalanceScore, type PoolAssignment } from './poolBalance'
import { createRng, shuffle, type Rng } from './rng'

const CATEGORY_PRIORITY: TeamCategory[] = ['female', 'youth', 'male']

export interface GeneratedPools {
  /** Poule (index 0..poolCount-1) assignée à chaque équipe */
  assignment: PoolAssignment
  score: number
}

function initialSerpentineAssignment(
  teams: Team[],
  poolCount: number,
  rng: Rng,
): PoolAssignment {
  const assignment: PoolAssignment = {}
  let cursor = 0

  for (const category of CATEGORY_PRIORITY) {
    const teamsOfCategory = shuffle(
      teams.filter((t) => t.category === category),
      rng,
    )
    for (const team of teamsOfCategory) {
      assignment[team.id] = cursor % poolCount
      cursor++
    }
    // Le curseur continue (sans saut) d'une catégorie à l'autre : chaque
    // catégorie démarre donc naturellement sur une poule différente, tout
    // en garantissant que la taille finale de chaque poule correspond
    // exactement à `balancedPoolSizes` (une répartition en "tranches" de
    // poolCount équipes consécutives ne peut pas déséquilibrer les tailles).
  }

  return assignment
}

/** Construit la répartition en poules la plus équilibrée possible via une
 * recherche locale randomisée : on part d'une distribution en serpentin par
 * catégorie (féminines puis jeunes puis masculines), puis on teste des
 * milliers d'échanges aléatoires en ne conservant que ceux qui améliorent
 * `calculatePoolBalanceScore`. Reste instantané jusqu'à 20 équipes. */
export function generateBalancedPools(
  teams: Team[],
  poolCount: number,
  options: { iterations?: number; seed?: number } = {},
): GeneratedPools {
  if (poolCount < 1) throw new Error('poolCount doit être >= 1')
  const activeTeams = teams.filter((t) => t.status !== 'forfeit')
  const iterations = options.iterations ?? 4000
  const rng = createRng(options.seed)

  let best = initialSerpentineAssignment(activeTeams, poolCount, rng)
  let bestScore = calculatePoolBalanceScore(activeTeams, best, poolCount)

  let current = { ...best }
  let currentScore = bestScore

  for (let i = 0; i < iterations; i++) {
    if (activeTeams.length < 2) break
    const a = activeTeams[Math.floor(rng() * activeTeams.length)]
    const b = activeTeams[Math.floor(rng() * activeTeams.length)]
    if (a.id === b.id || current[a.id] === current[b.id]) continue

    const attempt = { ...current }
    const tmp = attempt[a.id]
    attempt[a.id] = attempt[b.id]
    attempt[b.id] = tmp

    const attemptScore = calculatePoolBalanceScore(
      activeTeams,
      attempt,
      poolCount,
    )

    if (attemptScore <= currentScore) {
      current = attempt
      currentScore = attemptScore
      if (attemptScore < bestScore) {
        best = attempt
        bestScore = attemptScore
      }
    }
  }

  return { assignment: best, score: bestScore }
}

/** Répartit N équipes en poolCount poules aussi égales que possible en
 * taille, ex: balancedPoolSizes(13, 3) -> [5,4,4]. */
export function balancedPoolSizes(
  teamCount: number,
  poolCount: number,
): number[] {
  const base = Math.floor(teamCount / poolCount)
  const remainder = teamCount % poolCount
  return Array.from({ length: poolCount }, (_, i) =>
    i < remainder ? base + 1 : base,
  )
}
