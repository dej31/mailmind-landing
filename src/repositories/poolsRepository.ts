import { supabase } from '@/services/supabaseClient'
import type { Pool } from '@/models'
import { poolFromRow, poolToRow } from './mappers'

export async function fetchPools(tournamentId: string): Promise<Pool[]> {
  const { data, error } = await supabase
    .from('pools')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return (data ?? []).map(poolFromRow)
}

export async function replacePools(
  tournamentId: string,
  pools: Pool[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('pools')
    .delete()
    .eq('tournament_id', tournamentId)
  if (deleteError) throw deleteError

  if (pools.length === 0) return
  const { error: insertError } = await supabase
    .from('pools')
    .insert(pools.map((p) => poolToRow({ ...p, tournamentId })))
  if (insertError) throw insertError
}
