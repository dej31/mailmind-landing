import { supabase } from '@/services/supabaseClient'
import type { QualifiedTeam } from '@/models'
import { qualificationFromRow } from './mappers'

export async function fetchQualifications(
  tournamentId: string,
): Promise<QualifiedTeam[]> {
  const { data, error } = await supabase
    .from('qualifications')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('seed', { ascending: true })
  if (error) throw error
  return (data ?? []).map(qualificationFromRow)
}

export async function saveQualifications(
  tournamentId: string,
  qualified: QualifiedTeam[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('qualifications')
    .delete()
    .eq('tournament_id', tournamentId)
  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('qualifications').insert(
    qualified.map((q) => ({
      tournament_id: tournamentId,
      team_id: q.teamId,
      seed: q.seed,
      source: q.source,
    })),
  )
  if (insertError) throw insertError
}
