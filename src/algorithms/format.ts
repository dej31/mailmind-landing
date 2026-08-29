import type {
  Team,
  TournamentFormatRecommendation,
  TournamentFormatScenario,
  TournamentFormatScoreBreakdown,
} from '@/models'
import { balancedPoolSizes, generateBalancedPools } from './pools'
import { generateLimitedPoolMatches } from './roundRobin'
import { estimateTournamentEnd } from './timing'
import { timeToMinutes } from '@/utils/time'

/** Durées "rondes" acceptées, en minutes — jamais de 6min23. */
export const ALLOWED_DURATIONS = [4, 5, 6, 7, 8, 9, 10, 12] as const

const POOL_COUNT_CANDIDATES = [2, 3, 4]
const IDEAL_MARGIN_MIN = 10
const IDEAL_MARGIN_MAX = 20

interface PoolShape {
  poolCount: number
  poolSizes: number[]
  fullRoundRobin: boolean
  minMatchesPerTeam: number
  poolMatchCount: number
}

function combinations(n: number): number {
  return (n * (n - 1)) / 2
}

function dummyIds(count: number, prefix: string): string[] {
  return Array.from({ length: count }, (_, i) => `${prefix}${i}`)
}

function buildShapesForPoolCount(
  teamCount: number,
  poolCount: number,
): PoolShape[] {
  const poolSizes = balancedPoolSizes(teamCount, poolCount)
  const minPoolSize = Math.min(...poolSizes)
  if (minPoolSize < 2) return []

  const shapes: PoolShape[] = []

  const fullMatchCount = poolSizes.reduce((sum, s) => sum + combinations(s), 0)
  shapes.push({
    poolCount,
    poolSizes,
    fullRoundRobin: true,
    minMatchesPerTeam: minPoolSize - 1,
    poolMatchCount: fullMatchCount,
  })

  for (let m = minPoolSize - 2; m >= 2; m--) {
    const poolMatchCount = poolSizes.reduce((sum, size) => {
      const ids = dummyIds(size, 'p')
      return sum + generateLimitedPoolMatches(ids, m).length
    }, 0)
    shapes.push({
      poolCount,
      poolSizes,
      fullRoundRobin: false,
      minMatchesPerTeam: m,
      poolMatchCount,
    })
  }

  return shapes
}

function scoreScenario(
  shape: PoolShape,
  poolDuration: number,
  semiFinalDuration: number,
  finalDuration: number,
  startTime: string,
  targetEndTime: string,
  transitionDuration: number,
  categoryBalanceScore: number,
): { scenario: TournamentFormatScenario; score: TournamentFormatScoreBreakdown } {
  const estimate = estimateTournamentEnd({
    startTime,
    poolMatchCount: shape.poolMatchCount,
    poolMatchDuration: poolDuration,
    semiFinalDuration,
    finalDuration,
    transitionDuration,
  })
  const targetMinutes = timeToMinutes(targetEndTime)
  const marginMinutes = targetMinutes - estimate.endMinutes

  const scenario: TournamentFormatScenario = {
    teamCount: shape.poolSizes.reduce((a, b) => a + b, 0),
    pool: {
      poolCount: shape.poolCount,
      poolSizes: shape.poolSizes,
      fullRoundRobin: shape.fullRoundRobin,
      minMatchesPerTeam: shape.minMatchesPerTeam,
      poolMatchCount: shape.poolMatchCount,
    },
    poolMatchDuration: poolDuration,
    semiFinalDuration,
    finalDuration,
    transitionDuration,
    finalStartMinutes: estimate.finalStartMinutes,
    endMinutes: estimate.endMinutes,
    marginMinutes,
  }

  const endTimePenalty = marginMinutes < 0 ? Math.abs(marginMinutes) * 50 : 0

  const shortMatchPenalty =
    Math.max(0, 6 - poolDuration) * 15 +
    Math.max(0, 7 - semiFinalDuration) * 10 +
    Math.max(0, 8 - finalDuration) * 10

  // Pénalité forte tant qu'on est sous le plancher garanti de 3 matchs,
  // puis léger bonus continu au-delà : jouer plus est mieux, mais ce
  // critère ne doit jamais peser autant que l'heure de fin (priorité 1).
  const fewMatchesPenalty =
    Math.max(0, 3 - shape.minMatchesPerTeam) * 80 -
    Math.max(0, shape.minMatchesPerTeam - 3) * 5

  // Le Round Robin complet est le format par défaut (section 12) : on ne
  // doit s'en écarter que si c'est nécessaire pour tenir l'horaire, jamais
  // pour gratter quelques minutes de marge.
  const fullRoundRobinBonus = shape.fullRoundRobin ? 15 : 0

  const unfairMatchCountPenalty =
    (Math.max(...shape.poolSizes) - Math.min(...shape.poolSizes)) * 10 +
    (!shape.fullRoundRobin ? shape.poolSizes.filter((s) => s % 2 === 1).length * 5 : 0)

  const categoryBalancePenalty = categoryBalanceScore

  // La qualité de récupération réelle dépend de l'ordonnancement final des
  // matchs (optimizeMatchSchedule), calculé après le tirage des poules :
  // elle n'est donc pas encore connue au stade du choix de format.
  const recoveryPenalty = 0

  // Évite des écarts de durée disproportionnés entre poules et phases
  // finales (ex: poules à 6min mais demies à 12min) au profit d'une montée
  // en durée progressive, plus lisible pour l'organisateur.
  const roundDurationPenalty =
    Math.max(0, semiFinalDuration - poolDuration - 4) * 3 +
    Math.max(0, finalDuration - semiFinalDuration - 4) * 3

  // Un peu de marge est rassurante (section 69) mais une marge abondante
  // n'est jamais un problème en soi : le bonus reste modeste pour ne pas
  // dominer le choix du format (nombre de matchs, round robin complet...).
  let marginBonus = 0
  if (marginMinutes >= IDEAL_MARGIN_MIN && marginMinutes <= IDEAL_MARGIN_MAX) {
    marginBonus = 15
  } else if (marginMinutes >= 0 && marginMinutes < IDEAL_MARGIN_MIN) {
    marginBonus = marginMinutes
  } else if (marginMinutes > IDEAL_MARGIN_MAX) {
    marginBonus = Math.max(5, 15 - (marginMinutes - IDEAL_MARGIN_MAX) * 0.3)
  }

  const total =
    endTimePenalty +
    shortMatchPenalty +
    fewMatchesPenalty +
    unfairMatchCountPenalty +
    categoryBalancePenalty +
    recoveryPenalty +
    roundDurationPenalty -
    marginBonus -
    fullRoundRobinBonus

  return {
    scenario,
    score: {
      endTimePenalty,
      shortMatchPenalty,
      fewMatchesPenalty,
      unfairMatchCountPenalty,
      categoryBalancePenalty,
      recoveryPenalty,
      roundDurationPenalty,
      marginBonus,
      total,
    },
  }
}

function buildHighlights(
  scenario: TournamentFormatScenario,
  targetEndTime: string,
): string[] {
  const highlights: string[] = []
  highlights.push(
    `${scenario.pool.poolCount} poule${scenario.pool.poolCount > 1 ? 's' : ''} de ${scenario.pool.poolSizes.join('-')} équipes`,
  )
  highlights.push(
    `✓ ${scenario.pool.minMatchesPerTeam} match${scenario.pool.minMatchesPerTeam > 1 ? 's' : ''} minimum par équipe`,
  )
  highlights.push(`✓ matchs de poule de ${scenario.poolMatchDuration} min`)
  highlights.push(
    scenario.marginMinutes >= 0
      ? `✓ finale avant ${targetEndTime}`
      : `⚠ finale ${Math.abs(Math.round(scenario.marginMinutes))} min après ${targetEndTime}`,
  )
  return highlights
}

export interface FindFormatParams {
  startTime: string
  targetEndTime: string
  transitionDuration?: number
}

export interface FindFormatOptions {
  seed?: number
  poolCounts?: number[]
}

/** Compare de nombreux scénarios complets (nombre de poules, round robin
 * complet ou limité, durées "rondes" des matchs) et retient celui qui
 * minimise le score global de pénalité (heure de fin, nombre de matchs par
 * équipe, équilibre des catégories, durée des matchs...). Voir section 16
 * du cahier des charges pour l'ordre de priorité. */
export function findBestTournamentFormat(
  teams: Team[],
  params: FindFormatParams,
  options: FindFormatOptions = {},
): {
  recommended: TournamentFormatRecommendation
  alternatives: TournamentFormatRecommendation[]
} {
  const activeTeams = teams.filter((t) => t.status !== 'forfeit')
  const teamCount = activeTeams.length
  if (teamCount < 4) {
    throw new Error('Il faut au moins 4 équipes pour générer un format.')
  }

  const transitionDuration = params.transitionDuration ?? 1
  const poolCounts = (options.poolCounts ?? POOL_COUNT_CANDIDATES).filter(
    (pc) => pc >= 2 && teamCount / pc >= 2,
  )

  const perPoolCountBest = new Map<
    number,
    { scenario: TournamentFormatScenario; score: TournamentFormatScoreBreakdown }
  >()

  for (const poolCount of poolCounts) {
    const categoryBalanceScore = generateBalancedPools(activeTeams, poolCount, {
      seed: options.seed,
    }).score
    const shapes = buildShapesForPoolCount(teamCount, poolCount)

    let bestForPoolCount:
      | { scenario: TournamentFormatScenario; score: TournamentFormatScoreBreakdown }
      | undefined

    for (const shape of shapes) {
      for (const poolDuration of ALLOWED_DURATIONS) {
        for (const semiFinalDuration of ALLOWED_DURATIONS) {
          if (semiFinalDuration < poolDuration) continue
          for (const finalDuration of ALLOWED_DURATIONS) {
            if (finalDuration < semiFinalDuration) continue
            const result = scoreScenario(
              shape,
              poolDuration,
              semiFinalDuration,
              finalDuration,
              params.startTime,
              params.targetEndTime,
              transitionDuration,
              categoryBalanceScore,
            )
            if (!bestForPoolCount || result.score.total < bestForPoolCount.score.total) {
              bestForPoolCount = result
            }
          }
        }
      }
    }

    if (bestForPoolCount) perPoolCountBest.set(poolCount, bestForPoolCount)
  }

  const ranked = [...perPoolCountBest.values()].sort(
    (a, b) => a.score.total - b.score.total,
  )

  if (ranked.length === 0) {
    throw new Error(
      "Aucun format réalisable n'a été trouvé pour ce nombre d'équipes.",
    )
  }

  const toRecommendation = (result: (typeof ranked)[number]): TournamentFormatRecommendation => {
    const highlights = buildHighlights(result.scenario, params.targetEndTime)
    const warning = !result.scenario.pool.fullRoundRobin
      ? `Pour maintenir des matchs d'une durée correcte et terminer avant ${params.targetEndTime}, chaque équipe jouera ${result.scenario.pool.minMatchesPerTeam} matchs de poule.`
      : undefined
    return { scenario: result.scenario, score: result.score, highlights, warning }
  }

  return {
    recommended: toRecommendation(ranked[0]),
    alternatives: ranked.slice(1).map(toRecommendation),
  }
}
