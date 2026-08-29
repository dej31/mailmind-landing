import { supabase } from '@/services/supabaseClient'
import type { Team } from '@/models'
import { teamFromRow, teamToRow } from './mappers'

export async function fetchTeams(tournamentId: string): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(teamFromRow)
}

export async function createTeam(team: Partial<Team>): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .insert(teamToRow(team))
    .select('*')
    .single()
  if (error) throw error
  return teamFromRow(data)
}

export async function updateTeam(id: string, patch: Partial<Team>): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .update(teamToRow(patch))
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return teamFromRow(data)
}

export async function deleteTeam(id: string): Promise<void> {
  const { error } = await supabase.from('teams').delete().eq('id', id)
  if (error) throw error
}

/** Marque une équipe forfait sans la supprimer (section 46) — conserve
 * l'historique des matchs déjà joués. */
export async function markTeamForfeit(id: string): Promise<Team> {
  return updateTeam(id, { status: 'forfeit' })
}

export async function assignTeamsToPools(
  assignments: { teamId: string; poolId: string }[],
): Promise<void> {
  await Promise.all(
    assignments.map(({ teamId, poolId }) => updateTeam(teamId, { poolId })),
  )
}
