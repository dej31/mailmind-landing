import type { Database } from '@/services/database.types'
import type {
  Match,
  Pool,
  QualifiedTeam,
  Team,
  Tournament,
  TournamentSettings,
  TournamentStatus,
} from '@/models'

type TournamentRow = Database['public']['Tables']['tournaments']['Row']
type PoolRow = Database['public']['Tables']['pools']['Row']
type TeamRow = Database['public']['Tables']['teams']['Row']
type MatchRow = Database['public']['Tables']['matches']['Row']
type QualificationRow = Database['public']['Tables']['qualifications']['Row']

export function tournamentFromRow(row: TournamentRow): Tournament {
  const settings: TournamentSettings = {
    poolMatchDuration: row.pool_match_duration,
    semiFinalDuration: row.semi_final_duration,
    finalDuration: row.final_duration,
    transitionDuration: row.transition_duration,
    pointsWin: row.points_win,
    pointsDraw: row.points_draw,
    pointsLoss: row.points_loss,
  }
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    date: row.date,
    startTime: row.start_time.slice(0, 5),
    targetEndTime: row.target_end_time.slice(0, 5),
    status: row.status as TournamentStatus,
    settings,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function tournamentToRow(
  tournament: Partial<Tournament> & { ownerId?: string },
): Database['public']['Tables']['tournaments']['Update'] {
  const row: Database['public']['Tables']['tournaments']['Update'] = {}
  if (tournament.slug !== undefined) row.slug = tournament.slug
  if (tournament.name !== undefined) row.name = tournament.name
  if (tournament.date !== undefined) row.date = tournament.date
  if (tournament.startTime !== undefined) row.start_time = tournament.startTime
  if (tournament.targetEndTime !== undefined)
    row.target_end_time = tournament.targetEndTime
  if (tournament.status !== undefined) row.status = tournament.status
  if (tournament.ownerId !== undefined) row.owner_id = tournament.ownerId
  if (tournament.settings) {
    row.pool_match_duration = tournament.settings.poolMatchDuration
    row.semi_final_duration = tournament.settings.semiFinalDuration
    row.final_duration = tournament.settings.finalDuration
    row.transition_duration = tournament.settings.transitionDuration
    row.points_win = tournament.settings.pointsWin
    row.points_draw = tournament.settings.pointsDraw
    row.points_loss = tournament.settings.pointsLoss
  }
  return row
}

export function poolFromRow(row: PoolRow): Pool {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    name: row.name,
    order: row.order_index,
  }
}

export function poolToRow(
  pool: Partial<Pool>,
): Database['public']['Tables']['pools']['Insert'] {
  return {
    id: pool.id,
    tournament_id: pool.tournamentId!,
    name: pool.name!,
    order_index: pool.order ?? 0,
  }
}

export function teamFromRow(row: TeamRow): Team {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    name: row.name,
    shortName: row.short_name ?? undefined,
    category: row.category as Team['category'],
    level: (row.level as Team['level']) ?? undefined,
    status: row.status as Team['status'],
    poolId: row.pool_id ?? undefined,
    createdAt: row.created_at,
  }
}

export function teamToRow(
  team: Partial<Team>,
): Database['public']['Tables']['teams']['Insert'] {
  const row: Database['public']['Tables']['teams']['Insert'] = {
    tournament_id: team.tournamentId!,
    name: team.name!,
    category: team.category!,
  }
  if (team.id !== undefined) row.id = team.id
  if (team.shortName !== undefined) row.short_name = team.shortName
  if (team.level !== undefined) row.level = team.level
  if (team.status !== undefined) row.status = team.status
  if (team.poolId !== undefined) row.pool_id = team.poolId
  return row
}

export function matchFromRow(row: MatchRow): Match {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    poolId: row.pool_id ?? undefined,
    type: row.type as Match['type'],
    teamAId: row.team_a_id,
    teamBId: row.team_b_id,
    scheduledStart: row.scheduled_start,
    plannedDuration: row.planned_duration,
    actualStart: row.actual_start ?? undefined,
    actualEnd: row.actual_end ?? undefined,
    scoreA: row.score_a ?? undefined,
    scoreB: row.score_b ?? undefined,
    status: row.status as Match['status'],
    orderIndex: row.order_index,
  }
}

export function matchToRow(
  match: Partial<Match>,
): Database['public']['Tables']['matches']['Insert'] {
  const row: Database['public']['Tables']['matches']['Insert'] = {
    tournament_id: match.tournamentId!,
    type: match.type!,
    team_a_id: match.teamAId!,
    team_b_id: match.teamBId!,
    scheduled_start: match.scheduledStart!,
    planned_duration: match.plannedDuration!,
    order_index: match.orderIndex ?? 0,
  }
  if (match.id !== undefined) row.id = match.id
  if (match.poolId !== undefined) row.pool_id = match.poolId
  if (match.actualStart !== undefined) row.actual_start = match.actualStart
  if (match.actualEnd !== undefined) row.actual_end = match.actualEnd
  if (match.scoreA !== undefined) row.score_a = match.scoreA
  if (match.scoreB !== undefined) row.score_b = match.scoreB
  if (match.status !== undefined) row.status = match.status
  return row
}

export function qualificationFromRow(row: QualificationRow): QualifiedTeam {
  return {
    teamId: row.team_id,
    seed: row.seed as QualifiedTeam['seed'],
    source: row.source as QualifiedTeam['source'],
  }
}
