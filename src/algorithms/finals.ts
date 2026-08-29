import type {
  Bracket,
  Match,
  Pool,
  QualifiedTeam,
  Team,
  TournamentSettings,
} from '@/models'
import { calculateCrossPoolRanking, calculatePoolStandings } from './standings'

/** Détermine les 4 équipes qualifiées pour les demi-finales.
 *
 * Cas 2 poules (section 24) : règle explicite du cahier des charges —
 * seed 1 = 1ère poule A, seed 2 = 1ère poule B, seed 3 = 2ème poule A,
 * seed 4 = 2ème poule B (pairées ensuite en croisé par generateSemiFinals).
 *
 * Cas 3 ou 4 poules : classement inter-poules normalisé
 * (`calculateCrossPoolRanking`), on retient les 4 premières équipes. */
export function selectQualifiedTeams(
  pools: Pool[],
  teams: Team[],
  matches: Match[],
  settings: TournamentSettings,
): QualifiedTeam[] {
  if (pools.length === 2) {
    const [poolA, poolB] = pools
    const standingA = calculatePoolStandings(teams, matches, poolA.id, settings)
    const standingB = calculatePoolStandings(teams, matches, poolB.id, settings)

    const firstA = standingA.rows[0]
    const firstB = standingB.rows[0]
    const secondA = standingA.rows[1]
    const secondB = standingB.rows[1]

    const qualified: QualifiedTeam[] = []
    if (firstA) qualified.push({ teamId: firstA.teamId, seed: 1, source: 'auto' })
    if (firstB) qualified.push({ teamId: firstB.teamId, seed: 2, source: 'auto' })
    if (secondA) qualified.push({ teamId: secondA.teamId, seed: 3, source: 'auto' })
    if (secondB) qualified.push({ teamId: secondB.teamId, seed: 4, source: 'auto' })
    return qualified
  }

  const ranking = calculateCrossPoolRanking(pools, teams, matches, settings, 4)
  return ranking.slice(0, 4).map((row, index) => ({
    teamId: row.teamId,
    seed: (index + 1) as 1 | 2 | 3 | 4,
    source: 'auto',
  }))
}

/** Construit les demi-finales à partir des 4 qualifiés : seed1 vs seed4,
 * seed2 vs seed3 (règle unique, cohérente qu'il y ait eu 2, 3 ou 4 poules —
 * voir `selectQualifiedTeams` pour la façon dont les seeds sont attribués). */
export function generateSemiFinals(qualified: QualifiedTeam[]): Bracket {
  if (qualified.length !== 4) {
    throw new Error('Il faut exactement 4 équipes qualifiées.')
  }
  const bySeed = (seed: number) =>
    qualified.find((q) => q.seed === seed)!.teamId

  return {
    qualified,
    semiFinal1: { teamAId: bySeed(1), teamBId: bySeed(4) },
    semiFinal2: { teamAId: bySeed(2), teamBId: bySeed(3) },
  }
}

/** Détermine le vainqueur d'un match terminé (score le plus élevé). */
export function matchWinner(match: Match): string | undefined {
  if (match.status !== 'finished') return undefined
  if (match.scoreA === undefined || match.scoreB === undefined) return undefined
  if (match.scoreA === match.scoreB) return undefined
  return match.scoreA > match.scoreB ? match.teamAId : match.teamBId
}

/** Construit la finale à partir des deux demi-finales terminées. */
export function generateFinal(
  semiFinal1: Match,
  semiFinal2: Match,
): { teamAId: string; teamBId: string } | undefined {
  const winner1 = matchWinner(semiFinal1)
  const winner2 = matchWinner(semiFinal2)
  if (!winner1 || !winner2) return undefined
  return { teamAId: winner1, teamBId: winner2 }
}
