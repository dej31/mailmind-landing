import type { Pool, Team } from '@/models'
import { TEAM_CATEGORY_EMOJI } from '@/models'
import { InfoDisclosure, Panel } from '@/components'

export function PoolsPreview({ pools, teams }: { pools: Pool[]; teams: Team[] }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <p className="font-display text-lg font-bold text-cream">Poules équilibrées</p>
        <InfoDisclosure label="Comment ça marche ?">
          On répartit autant que possible les équipes jeunes, féminines et
          masculines entre les différentes poules, pour éviter qu'une poule
          ne soit composée presque uniquement d'une seule catégorie.
        </InfoDisclosure>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {pools.map((pool) => {
          const poolTeams = teams.filter((t) => t.poolId === pool.id)
          return (
            <Panel key={pool.id} className="p-3">
              <p className="mb-2 font-display font-bold text-gold">{pool.name}</p>
              <ul className="flex flex-col gap-1">
                {poolTeams.map((team) => (
                  <li key={team.id} className="flex items-center gap-2 text-cream/90">
                    <span>{TEAM_CATEGORY_EMOJI[team.category]}</span>
                    {team.name}
                  </li>
                ))}
              </ul>
            </Panel>
          )
        })}
      </div>
    </div>
  )
}
