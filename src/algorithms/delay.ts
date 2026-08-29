import type { Match } from '@/models'
import { diffMinutes } from '@/utils/time'
import { addMinutesToISO, formatClock } from '@/utils/time'

/** Retard cumulé du tournoi (section 20), en minutes : écart entre
 * l'horaire réel et l'horaire prévu du dernier match démarré. Positif =
 * retard, négatif = avance. */
export function calculateDelayMinutes(matches: Match[]): number {
  const started = matches
    .filter((m) => m.actualStart)
    .sort((a, b) => new Date(b.actualStart!).getTime() - new Date(a.actualStart!).getTime())

  const last = started[0]
  if (!last) return 0
  return diffMinutes(last.actualStart!, last.scheduledStart)
}

/** Projette l'heure de fin en enchaînant les matchs restants à partir de
 * `fromISO`, avec une durée éventuellement raccourcie (simulation avant
 * validation — section 20 : l'organisateur voit l'impact avant de valider). */
export function projectEndTime(
  remainingMatches: { plannedDuration: number }[],
  fromISO: string,
  transitionDuration: number,
  durationOverride?: number,
): string {
  let cursor = fromISO
  remainingMatches.forEach((m, index) => {
    const duration = durationOverride ?? m.plannedDuration
    cursor = addMinutesToISO(cursor, duration)
    if (index < remainingMatches.length - 1) {
      cursor = addMinutesToISO(cursor, transitionDuration)
    }
  })
  return formatClock(cursor)
}
