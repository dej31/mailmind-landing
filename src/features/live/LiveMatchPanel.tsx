import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Plus, Square, WifiOff } from 'lucide-react'
import type { Match, Team } from '@/models'
import { Button, Panel } from '@/components'
import { ScoreEntry } from '@/features/scoring/ScoreEntry'
import { finishMatch, startMatch, updateMatch } from '@/repositories'
import { enqueueMatchWrite } from '@/services/offlineQueue'

function formatCountdown(totalSeconds: number): string {
  const negative = totalSeconds < 0
  const abs = Math.abs(Math.round(totalSeconds))
  const m = Math.floor(abs / 60)
  const s = abs % 60
  return `${negative ? '+' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function LiveMatchPanel({
  match,
  teamA,
  teamB,
  onChanged,
}: {
  match: Match
  teamA?: Team
  teamB?: Team
  onChanged: () => void
}) {
  // État optimiste local pour le score, réinitialisé "pendant le rendu"
  // (pattern recommandé par React pour dériver un état à partir des props
  // sans passer par un effet) dès qu'on change de match ou qu'une valeur
  // plus récente arrive du serveur.
  const [scoreOverride, setScoreOverride] = useState<{ a: number; b: number } | null>(
    null,
  )
  const [trackedMatch, setTrackedMatch] = useState({ id: match.id, scoreA: match.scoreA, scoreB: match.scoreB })
  if (
    trackedMatch.id !== match.id ||
    trackedMatch.scoreA !== match.scoreA ||
    trackedMatch.scoreB !== match.scoreB
  ) {
    setTrackedMatch({ id: match.id, scoreA: match.scoreA, scoreB: match.scoreB })
    setScoreOverride(null)
  }
  const scoreA = scoreOverride?.a ?? match.scoreA ?? 0
  const scoreB = scoreOverride?.b ?? match.scoreB ?? 0

  const [now, setNow] = useState(() => Date.now())
  const [paused, setPaused] = useState(false)
  const [syncFailed, setSyncFailed] = useState(false)
  const pauseAccumRef = useRef(0)
  const pauseStartRef = useRef<number | null>(null)

  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [paused])

  const isLive = match.status === 'live' && match.actualStart

  let remainingSeconds = match.plannedDuration * 60
  if (isLive) {
    const elapsedMs =
      now - new Date(match.actualStart!).getTime() - pauseAccumRef.current
    remainingSeconds = match.plannedDuration * 60 - elapsedMs / 1000
  }

  async function persistScore(a: number, b: number) {
    setScoreOverride({ a, b })
    try {
      await updateMatch(match.id, { scoreA: a, scoreB: b })
      setSyncFailed(false)
    } catch {
      // Connexion perdue : le résultat reste affiché et sera synchronisé
      // dès que possible par la file d'attente hors-ligne (section 40).
      enqueueMatchWrite(match.id, { scoreA: a, scoreB: b })
      setSyncFailed(true)
    }
  }

  async function handleStart() {
    await startMatch(match.id)
    onChanged()
  }

  function togglePause() {
    if (paused) {
      if (pauseStartRef.current) {
        pauseAccumRef.current += Date.now() - pauseStartRef.current
      }
      pauseStartRef.current = null
    } else {
      pauseStartRef.current = Date.now()
    }
    setPaused((p) => !p)
  }

  async function handleExtend() {
    await updateMatch(match.id, { plannedDuration: match.plannedDuration + 1 })
    onChanged()
  }

  async function handleFinish() {
    await finishMatch(match.id, scoreA, scoreB)
    onChanged()
  }

  if (match.status !== 'live') {
    return (
      <Panel className="flex flex-col items-center gap-4 p-6 text-center">
        <p className="font-hand text-2xl text-gold">Prochain match</p>
        <p className="font-display text-2xl font-bold text-cream">
          {teamA?.name ?? '—'} <span className="text-cream/40">vs</span>{' '}
          {teamB?.name ?? '—'}
        </p>
        <Button size="xl" onClick={handleStart}>
          <Play size={22} /> Démarrer le match
        </Button>
      </Panel>
    )
  }

  return (
    <Panel tone="live" className="flex flex-col items-center gap-5 p-6">
      <p
        className={[
          'font-display text-7xl font-bold tabular-nums sm:text-8xl',
          remainingSeconds < 0 ? 'text-accent-red' : 'text-cream',
        ].join(' ')}
      >
        {formatCountdown(remainingSeconds)}
      </p>

      <div className="flex w-full items-start justify-center gap-4">
        <ScoreEntry
          teamName={teamA?.name ?? '—'}
          score={scoreA}
          onChange={(v) => persistScore(v, scoreB)}
        />
        <span className="mt-8 font-display text-2xl text-cream/40">–</span>
        <ScoreEntry
          teamName={teamB?.name ?? '—'}
          score={scoreB}
          onChange={(v) => persistScore(scoreA, v)}
        />
      </div>

      {syncFailed && (
        <p className="flex items-center gap-2 rounded border-2 border-gold/40 bg-gold/10 px-3 py-2 text-sm text-cream/90">
          <WifiOff size={16} className="shrink-0" />
          Connexion perdue — résultat conservé sur ce téléphone, nouvelle
          tentative en cours.
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="secondary" onClick={handleExtend}>
          <Plus size={18} /> 1 min
        </Button>
        <Button variant="secondary" onClick={togglePause}>
          {paused ? <Play size={18} /> : <Pause size={18} />}
          {paused ? 'Reprendre' : 'Pause'}
        </Button>
        <Button variant="danger" onClick={handleFinish}>
          <Square size={18} /> Terminer
        </Button>
      </div>
    </Panel>
  )
}
