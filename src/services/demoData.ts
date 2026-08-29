import type { Team, Tournament } from '@/models'
import { DEFAULT_NEW_TOURNAMENT, DEFAULT_TOURNAMENT_SETTINGS } from '@/models'
import { createTeam, createTournament, slugExists } from '@/repositories'
import { randomSuffix, slugify } from '@/utils/slugify'

const DEMO_TEAMS: { name: string; category: Team['category'] }[] = [
  { name: 'Les Vieux Crampons', category: 'male' },
  { name: 'Les Pompoms', category: 'female' },
  { name: 'Les Rouges', category: 'male' },
  { name: 'Les Gazelles', category: 'female' },
  { name: 'Les Juniors', category: 'youth' },
  { name: 'Les Rescapés', category: 'male' },
  { name: 'Le XV du Comptoir', category: 'male' },
  { name: 'Les Touristes', category: 'male' },
  { name: 'Les Sangliers', category: 'male' },
  { name: 'Les Minots', category: 'youth' },
  { name: 'Les Retardataires', category: 'male' },
  { name: 'Les Increvables', category: 'male' },
]

/** Crée un tournoi de démonstration complet (section 41) pour tester tout
 * le parcours organisateur sans ressaisir 12 équipes à la main. Réservé au
 * développement (bouton visible seulement en `import.meta.env.DEV`). */
export async function createDemoTournament(ownerId: string): Promise<Tournament> {
  const base = slugify(`${DEFAULT_NEW_TOURNAMENT.name}-demo`)
  let slug = base
  while (await slugExists(slug)) {
    slug = `${base}-${randomSuffix()}`
  }

  const tournament = await createTournament({
    name: `${DEFAULT_NEW_TOURNAMENT.name} (démo)`,
    slug,
    date: new Date().toISOString().slice(0, 10),
    startTime: DEFAULT_NEW_TOURNAMENT.startTime,
    targetEndTime: DEFAULT_NEW_TOURNAMENT.targetEndTime,
    status: 'draft',
    settings: DEFAULT_TOURNAMENT_SETTINGS,
    ownerId,
  })

  for (const team of DEMO_TEAMS) {
    await createTeam({
      tournamentId: tournament.id,
      name: team.name,
      category: team.category,
      status: 'active',
    })
  }

  return tournament
}
