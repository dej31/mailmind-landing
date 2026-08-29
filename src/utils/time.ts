/** Utilitaires de temps "horloge" (HH:mm, minutes depuis minuit), utilisés
 * par les algorithmes de format/planning qui raisonnent en durées avant
 * même que des horodatages réels (ISO) n'existent. */

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(totalMinutes: number): string {
  const m = ((Math.round(totalMinutes) % 1440) + 1440) % 1440
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

export function combineDateAndTime(dateISO: string, hhmm: string): string {
  const minutes = timeToMinutes(hhmm)
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${dateISO}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

export function addMinutesToISO(iso: string, minutes: number): string {
  const date = new Date(iso)
  date.setMinutes(date.getMinutes() + minutes)
  return date.toISOString()
}

export function diffMinutes(isoA: string, isoB: string): number {
  return (new Date(isoA).getTime() - new Date(isoB).getTime()) / 60000
}

export function formatClock(iso: string): string {
  const date = new Date(iso)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
