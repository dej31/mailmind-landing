import { useState } from 'react'
import type { Match } from '@/models'
import { projectEndTime } from '@/algorithms/delay'
import { Button, Panel } from '@/components'
import { updateMatch } from '@/repositories'

export function DelayBanner({
  delayMinutes,
  remainingMatches,
  transitionDuration,
  onApplied,
}: {
  delayMinutes: number
  remainingMatches: Match[]
  transitionDuration: number
  onApplied: () => void
}) {
  const [applying, setApplying] = useState(false)

  if (delayMinutes < 5 || remainingMatches.length === 0) return null

  const currentDuration = remainingMatches[0].plannedDuration
  const shortenedDuration = Math.max(4, currentDuration - 1)
  if (shortenedDuration === currentDuration) return null

  const from = remainingMatches[0].scheduledStart
  const newEndTime = projectEndTime(
    remainingMatches,
    from,
    transitionDuration,
    shortenedDuration,
  )

  async function applyShorterMatches() {
    setApplying(true)
    try {
      await Promise.all(
        remainingMatches.map((m) =>
          updateMatch(m.id, { plannedDuration: shortenedDuration }),
        ),
      )
      onApplied()
    } finally {
      setApplying(false)
    }
  }

  return (
    <Panel className="flex flex-col gap-2 border-gold/50 bg-gold/10 p-4">
      <p className="font-display text-lg font-bold text-cream">
        ⚠ {Math.round(delayMinutes)} min de retard
      </p>
      <p className="text-sm text-cream/80">
        Passer les prochains matchs de {currentDuration} à {shortenedDuration} min
        ramènerait la fin estimée à <strong>{newEndTime}</strong>.
      </p>
      <Button size="md" onClick={applyShorterMatches} disabled={applying}>
        {applying ? 'Application…' : `Appliquer ${shortenedDuration} min`}
      </Button>
    </Panel>
  )
}
