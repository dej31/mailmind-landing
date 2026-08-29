export interface TeamStanding {
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  pointsFor: number
  pointsAgainst: number
  diff: number
  points: number
}

export interface PoolStanding {
  poolId: string
  rows: TeamStanding[]
}

/** Classement inter-poules normalisé par match joué, pour comparer des
 * équipes n'ayant pas disputé le même nombre de rencontres. */
export interface CrossPoolStandingRow extends TeamStanding {
  poolId: string
  pointsPerGame: number
  diffPerGame: number
  scoredPerGame: number
  winRate: number
  qualified: boolean
  /** Rang au sein de sa propre poule (1 = premier) */
  poolRank: number
}

export function emptyStanding(teamId: string): TeamStanding {
  return {
    teamId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    diff: 0,
    points: 0,
  }
}
