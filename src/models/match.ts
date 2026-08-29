export type MatchType = 'pool' | 'semifinal' | 'final'

export type MatchStatus = 'scheduled' | 'ready' | 'live' | 'finished'

export interface Match {
  id: string
  tournamentId: string
  poolId?: string
  type: MatchType
  teamAId: string
  teamBId: string
  /** Horaire prévu, ISO datetime */
  scheduledStart: string
  /** Durée prévue, en minutes */
  plannedDuration: number
  /** Horaire réel de coup d'envoi, ISO datetime */
  actualStart?: string
  actualEnd?: string
  scoreA?: number
  scoreB?: number
  status: MatchStatus
  /** Position dans l'ordre de passage sur le terrain unique */
  orderIndex: number
}

export function isMatchDecided(match: Match): boolean {
  return (
    match.status === 'finished' &&
    match.scoreA !== undefined &&
    match.scoreB !== undefined
  )
}
