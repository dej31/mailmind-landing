export interface PoolPlan {
  poolCount: number
  /** Taille de chaque poule, ex: [4,4,4] */
  poolSizes: number[]
  /** true si round robin complet, false si nombre de matchs limité */
  fullRoundRobin: boolean
  /** Nombre minimum de matchs garantis par équipe */
  minMatchesPerTeam: number
  poolMatchCount: number
}

export interface TournamentFormatScenario {
  teamCount: number
  pool: PoolPlan
  poolMatchDuration: number
  semiFinalDuration: number
  finalDuration: number
  transitionDuration: number
  /** Minutes écoulées entre le début du tournoi et le début de la finale */
  finalStartMinutes: number
  /** Minutes écoulées entre le début du tournoi et la fin de la finale */
  endMinutes: number
  /** Marge en minutes entre la fin estimée et l'heure cible (peut être négative) */
  marginMinutes: number
}

export interface TournamentFormatScoreBreakdown {
  endTimePenalty: number
  shortMatchPenalty: number
  fewMatchesPenalty: number
  unfairMatchCountPenalty: number
  categoryBalancePenalty: number
  recoveryPenalty: number
  roundDurationPenalty: number
  marginBonus: number
  total: number
}

export interface TournamentFormatRecommendation {
  scenario: TournamentFormatScenario
  score: TournamentFormatScoreBreakdown
  /** Explications courtes, orientées utilisateur ("✓ 3 matchs minimum par équipe") */
  highlights: string[]
  /** Avertissement éventuel si un compromis a été nécessaire */
  warning?: string
}
