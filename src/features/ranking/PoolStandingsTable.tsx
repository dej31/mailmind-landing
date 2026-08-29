import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { PoolStanding, Team } from '@/models'

/** Classement de poule, mobile-first : on affiche d'abord équipe + points,
 * le détail (MJ/V/N/D/pour/contre/diff) se déplie au besoin (section 22). */
export function PoolStandingsTable({
  standing,
  teamsById,
  qualifiedTeamIds,
}: {
  standing: PoolStanding
  teamsById: Map<string, Team>
  qualifiedTeamIds?: Set<string>
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="overflow-hidden rounded border-2 border-cream/15">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between bg-ink-soft px-3 py-2 text-sm font-semibold text-cream/70"
      >
        Détails
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          {expanded && (
            <tr className="border-b border-cream/10 text-cream/50">
              <th className="px-3 py-1 font-medium">#</th>
              <th className="px-3 py-1 font-medium">Équipe</th>
              <th className="px-2 py-1 text-center font-medium">MJ</th>
              <th className="px-2 py-1 text-center font-medium">V</th>
              <th className="px-2 py-1 text-center font-medium">N</th>
              <th className="px-2 py-1 text-center font-medium">D</th>
              <th className="px-2 py-1 text-center font-medium">Diff</th>
              <th className="px-3 py-1 text-right font-medium">Pts</th>
            </tr>
          )}
        </thead>
        <tbody>
          {standing.rows.map((row, index) => {
            const team = teamsById.get(row.teamId)
            const qualified = qualifiedTeamIds?.has(row.teamId)
            return (
              <tr key={row.teamId} className="border-b border-cream/10 last:border-0">
                <td className="px-3 py-2 font-display text-cream/50">{index + 1}</td>
                <td className="px-3 py-2 font-semibold text-cream">
                  {team?.name ?? '—'}
                  {qualified && (
                    <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-ink">
                      Qualifié
                    </span>
                  )}
                </td>
                {expanded ? (
                  <>
                    <td className="px-2 py-2 text-center text-cream/70">{row.played}</td>
                    <td className="px-2 py-2 text-center text-cream/70">{row.won}</td>
                    <td className="px-2 py-2 text-center text-cream/70">{row.drawn}</td>
                    <td className="px-2 py-2 text-center text-cream/70">{row.lost}</td>
                    <td className="px-2 py-2 text-center text-cream/70">
                      {row.diff > 0 ? `+${row.diff}` : row.diff}
                    </td>
                  </>
                ) : (
                  <td colSpan={5} />
                )}
                <td className="px-3 py-2 text-right font-display text-lg font-bold text-gold">
                  {row.points}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
