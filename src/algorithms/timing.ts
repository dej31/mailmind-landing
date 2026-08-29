import type { Match } from '@/models'
import { addMinutesToISO, combineDateAndTime, minutesToTime } from '@/utils/time'

export interface TimedSegment {
  startMinutes: number
  endMinutes: number
}

/** Place séquentiellement des créneaux de durées données, séparés par un
 * temps de transition, à partir de startMinutes (minutes depuis minuit). */
export function scheduleSegments(
  startMinutes: number,
  durations: number[],
  transitionDuration: number,
): TimedSegment[] {
  const segments: TimedSegment[] = []
  let cursor = startMinutes
  for (const duration of durations) {
    const start = cursor
    const end = start + duration
    segments.push({ startMinutes: start, endMinutes: end })
    cursor = end + transitionDuration
  }
  return segments
}

export interface EndEstimateInput {
  startTime: string
  poolMatchCount: number
  poolMatchDuration: number
  semiFinalCount?: number
  semiFinalDuration: number
  finalDuration: number
  transitionDuration: number
}

export interface EndEstimate {
  finalStartTime: string
  endTime: string
  finalStartMinutes: number
  endMinutes: number
}

/** Estime, à partir des compteurs et durées d'un scénario, l'heure de
 * début de la finale et l'heure de fin du tournoi. Utilisé aussi bien lors
 * du choix du format (avant tirage) que pour projeter la fin réelle en
 * cours de tournoi. */
export function estimateTournamentEnd(input: EndEstimateInput): EndEstimate {
  const semiFinalCount = input.semiFinalCount ?? 2
  const durations = [
    ...Array(input.poolMatchCount).fill(input.poolMatchDuration),
    ...Array(semiFinalCount).fill(input.semiFinalDuration),
    input.finalDuration,
  ]
  const startMinutes =
    Number(input.startTime.split(':')[0]) * 60 +
    Number(input.startTime.split(':')[1])
  const segments = scheduleSegments(
    startMinutes,
    durations,
    input.transitionDuration,
  )
  const finalSegment = segments[segments.length - 1]
  return {
    finalStartTime: minutesToTime(finalSegment.startMinutes),
    endTime: minutesToTime(finalSegment.endMinutes),
    finalStartMinutes: finalSegment.startMinutes,
    endMinutes: finalSegment.endMinutes,
  }
}

/** Attribue les horaires réels (ISO datetime) à une liste de matchs déjà
 * ordonnée (orderIndex croissant), à partir de la date et l'heure de début
 * du tournoi. Ne modifie pas l'ordre ni les durées, seulement scheduledStart. */
export function calculateTournamentTiming(
  matches: Pick<Match, 'id' | 'plannedDuration' | 'orderIndex'>[],
  tournamentDate: string,
  startTime: string,
  transitionDuration: number,
): Record<string, string> {
  const ordered = [...matches].sort((a, b) => a.orderIndex - b.orderIndex)
  const startISO = combineDateAndTime(tournamentDate, startTime)

  const result: Record<string, string> = {}
  let cursor = startISO
  for (const match of ordered) {
    result[match.id] = cursor
    cursor = addMinutesToISO(
      cursor,
      match.plannedDuration + transitionDuration,
    )
  }
  return result
}
