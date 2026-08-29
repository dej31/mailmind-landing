import { supabase } from '@/services/supabaseClient'
import type { Tournament } from '@/models'
import type { Database } from '@/services/database.types'
import { tournamentFromRow, tournamentToRow } from './mappers'

export async function fetchTournamentBySlug(
  slug: string,
): Promise<Tournament | null> {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data ? tournamentFromRow(data) : null
}

export async function fetchTournamentById(id: string): Promise<Tournament | null> {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? tournamentFromRow(data) : null
}

export async function fetchMyTournaments(ownerId: string): Promise<Tournament[]> {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(tournamentFromRow)
}

export async function createTournament(
  tournament: Partial<Tournament> & {
    ownerId: string
    slug: string
    name: string
    date: string
    startTime: string
    targetEndTime: string
  },
): Promise<Tournament> {
  const row = tournamentToRow(
    tournament,
  ) as Database['public']['Tables']['tournaments']['Insert']
  const { data, error } = await supabase
    .from('tournaments')
    .insert(row)
    .select('*')
    .single()
  if (error) throw error
  return tournamentFromRow(data)
}

export async function updateTournament(
  id: string,
  patch: Partial<Tournament>,
): Promise<Tournament> {
  const { data, error } = await supabase
    .from('tournaments')
    .update(tournamentToRow(patch))
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return tournamentFromRow(data)
}

export async function slugExists(slug: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('tournaments')
    .select('id', { count: 'exact', head: true })
    .eq('slug', slug)
  if (error) throw error
  return (count ?? 0) > 0
}
