import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { useTournamentData } from '@/hooks/useTournamentData'
import { generateSemiFinals, selectQualifiedTeams } from '@/algorithms/finals'
import { calculateCrossPoolRanking } from '@/algorithms/standings'
import type { QualifiedTeam } from '@/models'
import { createMatches, saveQualifications, updateTournament } from '@/repositories'
import { Button, InfoDisclosure, PageHeader, Panel, Spinner } from '@/components'

export function QualificationReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tournament, teams, pools, matches, loading } = useTournamentData({ id })
  const [overrides, setOverrides] = useState<Record<number, string>>({})
  const [confirming, setConfirming] = useState(false)

  const teamsById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams])

  const proposed = useMemo(() => {
    if (!tournament || pools.length === 0) return []
    return selectQualifiedTeams(pools, teams, matches, tournament.settings)
  }, [tournament, pools, teams, matches])

  const crossRanking = useMemo(() => {
    if (!tournament || pools.length < 3) return []
    return calculateCrossPoolRanking(pools, teams, matches, tournament.settings, 4)
  }, [tournament, pools, teams, matches])

  if (loading || !tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const finalQualified: QualifiedTeam[] = proposed.map((q) => {
    const overrideTeamId = overrides[q.seed]
    if (overrideTeamId && overrideTeamId !== q.teamId) {
      return { teamId: overrideTeamId, seed: q.seed, source: 'manual' }
    }
    return q
  })

  async function handleConfirm() {
    if (!tournament) return
    setConfirming(true)
    try {
      await saveQualifications(tournament.id, finalQualified)
      const bracket = generateSemiFinals(finalQualified)
      const startBase = new Date()
      startBase.setSeconds(0, 0)
      const startISO = startBase.toISOString()
      const semiDurationMs = tournament.settings.semiFinalDuration * 60_000
      const transitionMs = tournament.settings.transitionDuration * 60_000

      await createMatches([
        {
          tournamentId: tournament.id,
          poolId: undefined,
          type: 'semifinal',
          teamAId: bracket.semiFinal1.teamAId,
          teamBId: bracket.semiFinal1.teamBId,
          scheduledStart: startISO,
          plannedDuration: tournament.settings.semiFinalDuration,
          status: 'scheduled',
          orderIndex: matches.length,
        },
        {
          tournamentId: tournament.id,
          poolId: undefined,
          type: 'semifinal',
          teamAId: bracket.semiFinal2.teamAId,
          teamBId: bracket.semiFinal2.teamBId,
          scheduledStart: new Date(
            new Date(startISO).getTime() + semiDurationMs + transitionMs,
          ).toISOString(),
          plannedDuration: tournament.settings.semiFinalDuration,
          status: 'scheduled',
          orderIndex: matches.length + 1,
        },
      ])

      await updateTournament(tournament.id, { status: 'finals' })
      navigate(`/admin/${tournament.id}/live`)
    } finally {
      setConfirming(false)
    }
  }

  const hasManualOverride = Object.values(overrides).some(Boolean)
  const alreadyGenerated = matches.some((m) => m.type === 'semifinal')

  return (
    <div className="pb-16">
      <PageHeader eyebrow="Phases finales" title="Qualifiés proposés" />

      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6">
        {pools.length >= 3 && (
          <InfoDisclosure label="Comment sont choisis les qualifiés ?">
            Comme les poules n'ont pas toutes la même taille, on compare les
            équipes sur leurs statistiques ramenées "par match joué" (points,
            différence, essais marqués) plutôt que sur leurs totaux bruts —
            pour rester équitable.
          </InfoDisclosure>
        )}

        {alreadyGenerated ? (
          <Panel className="p-4 text-center text-cream/80">
            Les demi-finales ont déjà été générées.
            <div className="mt-3">
              <Button onClick={() => navigate(`/admin/${tournament.id}/live`)}>
                Voir le direct
              </Button>
            </div>
          </Panel>
        ) : (
          <>
            <ol className="flex flex-col gap-2">
              {proposed.map((q) => (
                <li key={q.seed}>
                  <Panel className="flex items-center gap-3 p-3">
                    <span className="font-display text-2xl font-bold text-gold">
                      {q.seed}
                    </span>
                    <Trophy size={18} className="shrink-0 text-cream/40" />
                    <select
                      value={overrides[q.seed] ?? q.teamId}
                      onChange={(e) =>
                        setOverrides((o) => ({ ...o, [q.seed]: e.target.value }))
                      }
                      className="flex-1 rounded border-2 border-cream/20 bg-ink px-2 py-2 text-cream"
                    >
                      {teams
                        .filter((t) => t.status !== 'forfeit')
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                    </select>
                    {overrides[q.seed] && overrides[q.seed] !== q.teamId && (
                      <span className="text-xs font-semibold uppercase text-gold">
                        Modifié
                      </span>
                    )}
                  </Panel>
                </li>
              ))}
            </ol>

            {hasManualOverride && (
              <p className="text-sm text-gold">
                ⚠ Une ou plusieurs qualifications ont été modifiées manuellement.
              </p>
            )}

            {crossRanking.length > 0 && (
              <details className="text-sm text-cream/70">
                <summary className="cursor-pointer font-semibold text-cream/80">
                  Voir le classement inter-poules complet
                </summary>
                <ol className="mt-2 flex flex-col gap-1">
                  {crossRanking.map((row, i) => (
                    <li key={row.teamId} className="flex justify-between">
                      <span>
                        {i + 1}. {teamsById.get(row.teamId)?.name}
                      </span>
                      <span>{row.pointsPerGame.toFixed(2)} pts/match</span>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            <Button size="xl" onClick={handleConfirm} disabled={confirming}>
              {confirming ? 'Génération…' : 'Valider les demi-finales'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
