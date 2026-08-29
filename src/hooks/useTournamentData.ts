import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/services/supabaseClient'
import {
  fetchMatches,
  fetchPools,
  fetchQualifications,
  fetchTeams,
  fetchTournamentById,
  fetchTournamentBySlug,
} from '@/repositories'
import type { Match, Pool, QualifiedTeam, Team, Tournament } from '@/models'

const POLL_INTERVAL_MS = 30_000

export interface TournamentData {
  tournament: Tournament | null
  teams: Team[]
  pools: Pool[]
  matches: Match[]
  qualifications: QualifiedTeam[]
  loading: boolean
  error: string | null
  refetch: () => void
}

/** Charge un tournoi et toutes ses données liées, les tient à jour via
 * Supabase Realtime, avec un rafraîchissement périodique de secours
 * (section 33/40) au cas où le canal réaltime serait coupé. Utilisé aussi
 * bien côté admin (dashboard live) que côté public. */
export function useTournamentData(ref: { id?: string; slug?: string }): TournamentData {
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [pools, setPools] = useState<Pool[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [qualifications, setQualifications] = useState<QualifiedTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const tournamentIdRef = useRef<string | null>(null)

  const loadAll = useCallback(async () => {
    try {
      const t = ref.id
        ? await fetchTournamentById(ref.id)
        : ref.slug
          ? await fetchTournamentBySlug(ref.slug)
          : null
      if (!t) {
        setTournament(null)
        setError('Tournoi introuvable.')
        setLoading(false)
        return
      }
      tournamentIdRef.current = t.id
      const [teamsData, poolsData, matchesData, qualificationsData] = await Promise.all([
        fetchTeams(t.id),
        fetchPools(t.id),
        fetchMatches(t.id),
        fetchQualifications(t.id),
      ])
      setTournament(t)
      setTeams(teamsData)
      setPools(poolsData)
      setMatches(matchesData)
      setQualifications(qualificationsData)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement.')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.id, ref.slug])

  useEffect(() => {
    setLoading(true)
    loadAll()
  }, [loadAll])

  useEffect(() => {
    const interval = setInterval(loadAll, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [loadAll])

  useEffect(() => {
    const channel = supabase
      .channel(`tournament-data-${ref.id ?? ref.slug}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments' },
        (payload) => {
          const row = payload.new as { id?: string } | null
          if (!tournamentIdRef.current || row?.id === tournamentIdRef.current) {
            loadAll()
          }
        },
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () =>
        loadAll(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pools' }, () =>
        loadAll(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () =>
        loadAll(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'qualifications' },
        () => loadAll(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.id, ref.slug])

  return { tournament, teams, pools, matches, qualifications, loading, error, refetch: loadAll }
}
