import type { Match, Team, TeamCategory, Tournament } from '@/models'
import { DEFAULT_TOURNAMENT_SETTINGS } from '@/models'

let counter = 0
function nextId(prefix: string): string {
  counter++
  return `${prefix}-${counter}`
}

export function makeTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: nextId('team'),
    tournamentId: 'tournament-1',
    name: `Équipe ${counter}`,
    category: 'male',
    status: 'active',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

/** Génère `count` équipes en respectant une répartition de catégories,
 * par exemple makeTeams(12, { male: 8, female: 2, youth: 2 }). */
export function makeTeams(
  count: number,
  distribution?: Partial<Record<TeamCategory, number>>,
): Team[] {
  const teams: Team[] = []
  if (distribution) {
    for (const [category, n] of Object.entries(distribution) as [
      TeamCategory,
      number,
    ][]) {
      for (let i = 0; i < n; i++) {
        teams.push(makeTeam({ category }))
      }
    }
  } else {
    for (let i = 0; i < count; i++) {
      teams.push(makeTeam({ category: 'male' }))
    }
  }
  return teams
}

export function makeTournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: nextId('tournament'),
    slug: 'challenge-halle-back',
    name: 'Challenge Halle Back',
    date: '2026-08-29',
    startTime: '15:30',
    targetEndTime: '20:00',
    status: 'draft',
    settings: DEFAULT_TOURNAMENT_SETTINGS,
    ownerId: 'owner-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

export function finishMatch(
  match: Match,
  scoreA: number,
  scoreB: number,
): Match {
  return { ...match, status: 'finished', scoreA, scoreB }
}
