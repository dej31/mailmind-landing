import type { Team, TeamCategory, TeamLevel } from '@/models'

const CATEGORIES: TeamCategory[] = ['female', 'youth', 'male']
const LEVELS: TeamLevel[] = ['leisure', 'intermediate', 'confirmed']

/** Poids appliqués à la variance de répartition de chaque catégorie entre
 * poules. Les féminines sont réparties en priorité, puis les jeunes, puis
 * les masculines (section 10 du cahier des charges). */
const CATEGORY_WEIGHT: Record<TeamCategory, number> = {
  female: 3,
  youth: 2,
  male: 1,
}

/** Assignation d'une poule (index 0..poolCount-1) par équipe. */
export type PoolAssignment = Record<string, number>

function variance(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  return (
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length
  )
}

/** Score de déséquilibre d'une répartition en poules : plus il est BAS,
 * meilleure est la répartition (0 = parfaitement équilibrée). Combine la
 * variance de répartition des catégories, celle des niveaux (si renseignés)
 * et l'écart de taille entre poules. */
export function calculatePoolBalanceScore(
  teams: Team[],
  assignment: PoolAssignment,
  poolCount: number,
): number {
  const poolSizes = new Array(poolCount).fill(0)
  for (const team of teams) {
    const pool = assignment[team.id]
    if (pool !== undefined) poolSizes[pool]++
  }

  let categoryScore = 0
  for (const category of CATEGORIES) {
    const teamsOfCategory = teams.filter((t) => t.category === category)
    if (teamsOfCategory.length === 0) continue
    const perPool = new Array(poolCount).fill(0)
    for (const team of teamsOfCategory) {
      const pool = assignment[team.id]
      if (pool !== undefined) perPool[pool]++
    }
    categoryScore += CATEGORY_WEIGHT[category] * variance(perPool)
  }

  const teamsWithLevel = teams.filter((t) => t.level)
  let levelScore = 0
  if (teamsWithLevel.length >= teams.length / 2) {
    for (const level of LEVELS) {
      const teamsOfLevel = teams.filter((t) => t.level === level)
      if (teamsOfLevel.length === 0) continue
      const perPool = new Array(poolCount).fill(0)
      for (const team of teamsOfLevel) {
        const pool = assignment[team.id]
        if (pool !== undefined) perPool[pool]++
      }
      levelScore += variance(perPool)
    }
  }

  const sizeSpread = Math.max(...poolSizes) - Math.min(...poolSizes)
  const sizePenalty = sizeSpread ** 2 * 4

  return categoryScore * 10 + levelScore * 4 + sizePenalty
}
