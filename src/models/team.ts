export type TeamCategory = 'male' | 'female' | 'youth'

export type TeamLevel = 'leisure' | 'intermediate' | 'confirmed'

export type TeamStatus = 'active' | 'forfeit'

export interface Team {
  id: string
  tournamentId: string
  name: string
  shortName?: string
  category: TeamCategory
  level?: TeamLevel
  status: TeamStatus
  poolId?: string
  createdAt: string
}

export const TEAM_CATEGORY_LABEL: Record<TeamCategory, string> = {
  male: 'Masculine',
  female: 'Féminine',
  youth: 'Jeune',
}

export const TEAM_CATEGORY_EMOJI: Record<TeamCategory, string> = {
  male: '👨',
  female: '👩',
  youth: '🧒',
}

export const TEAM_LEVEL_LABEL: Record<TeamLevel, string> = {
  leisure: 'Loisir',
  intermediate: 'Intermédiaire',
  confirmed: 'Confirmé',
}
