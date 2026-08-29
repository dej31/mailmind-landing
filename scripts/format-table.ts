/**
 * Outil de développement (section 43/76 du cahier des charges) : imprime,
 * pour chaque nombre d'équipes de 6 à 20, le format recommandé par
 * `findBestTournamentFormat` en partant de 15:30 avec une fin cible à
 * 20:00. Permet de vérifier d'un coup d'œil la cohérence des formats
 * produits. Lancer avec `npm run format:table`.
 */
import { findBestTournamentFormat } from '../src/algorithms/format'
import type { Team } from '../src/models'

function teamsFor(n: number): Team[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `t${i}`,
    tournamentId: 'demo',
    name: `Équipe ${i}`,
    category: 'male',
    status: 'active',
    createdAt: new Date().toISOString(),
  }))
}

const rows: Record<string, string | number>[] = []

for (let n = 6; n <= 20; n++) {
  const { recommended } = findBestTournamentFormat(teamsFor(n), {
    startTime: '15:30',
    targetEndTime: '20:00',
  })
  const s = recommended.scenario
  rows.push({
    Teams: n,
    Pools: s.pool.poolCount,
    'Pool sizes': s.pool.poolSizes.join('-'),
    'Full RR': s.pool.fullRoundRobin ? 'yes' : 'no',
    'Pool matches': s.pool.poolMatchCount,
    'Min games/team': s.pool.minMatchesPerTeam,
    'Pool dur.': s.poolMatchDuration,
    'Semi dur.': s.semiFinalDuration,
    'Final dur.': s.finalDuration,
    'Final start': minutesToTime(s.finalStartMinutes),
    'End time': minutesToTime(s.endMinutes),
    'Margin (min)': Math.round(s.marginMinutes),
  })
}

function minutesToTime(total: number): string {
  const h = Math.floor(total / 60)
  const m = Math.round(total % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

console.table(rows)
