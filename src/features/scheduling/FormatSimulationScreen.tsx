import { useState } from 'react'
import { Check } from 'lucide-react'
import type { TournamentFormatRecommendation } from '@/models'
import { minutesToTime } from '@/utils/time'
import { Button, Panel } from '@/components'

export function FormatSimulationScreen({
  recommended,
  alternatives,
  teamCount,
  startTime,
  targetEndTime,
  onConfirm,
  onCancel,
  confirming,
}: {
  recommended: TournamentFormatRecommendation
  alternatives: TournamentFormatRecommendation[]
  teamCount: number
  startTime: string
  targetEndTime: string
  onConfirm: (choice: TournamentFormatRecommendation) => void
  onCancel: () => void
  confirming?: boolean
}) {
  const options = [recommended, ...alternatives]
  const [selectedIndex, setSelectedIndex] = useState(0)
  const choice = options[selectedIndex]
  const s = choice.scenario
  const totalMatches = s.pool.poolMatchCount + 3

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-4 sm:px-6">
      <div className="text-center">
        <p className="font-hand text-2xl text-gold">C'est parti !</p>
        <h2 className="font-display text-2xl font-bold text-cream">
          {teamCount} équipes — format {selectedIndex === 0 ? 'recommandé' : 'alternatif'}
        </h2>
      </div>

      <Panel className="p-4">
        <div className="mb-3 grid grid-cols-2 gap-3 text-center">
          <Stat label="Poules" value={`${s.pool.poolCount} × ${s.pool.poolSizes.join('-')}`} />
          <Stat
            label="Matchs mini / équipe"
            value={String(s.pool.minMatchesPerTeam)}
          />
          <Stat label="Matchs de poule" value={String(s.pool.poolMatchCount)} />
          <Stat label="Total matchs" value={String(totalMatches)} />
        </div>

        <div className="my-3 border-t border-cream/10" />

        <div className="mb-3 grid grid-cols-3 gap-2 text-center text-sm">
          <Stat label="Poules" value={`${s.poolMatchDuration} min`} small />
          <Stat label="Demies" value={`${s.semiFinalDuration} min`} small />
          <Stat label="Finale" value={`${s.finalDuration} min`} small />
        </div>

        <div className="my-3 border-t border-cream/10" />

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <Stat label="Début" value={startTime} small />
          <Stat label="Finale prévue" value={minutesToTime(s.finalStartMinutes)} small />
          <Stat label="Fin prévue" value={minutesToTime(s.endMinutes)} small />
        </div>

        <p className="mt-3 text-center text-sm text-cream/60">
          Marge avant {targetEndTime} :{' '}
          <span className="font-semibold text-cream">
            {Math.round(s.marginMinutes)} min
          </span>
        </p>
      </Panel>

      <ul className="flex flex-col gap-1.5">
        {choice.highlights.map((h) => (
          <li key={h} className="flex items-center gap-2 text-cream/80">
            <Check size={16} className="shrink-0 text-gold" />
            {h}
          </li>
        ))}
      </ul>

      {choice.warning && (
        <p className="rounded border-2 border-gold/40 bg-gold/10 px-3 py-2 text-sm text-cream/90">
          ⚠ {choice.warning}
        </p>
      )}

      {alternatives.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-cream/60">Autres formats possibles</p>
          <div className="flex flex-wrap gap-2">
            {options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={[
                  'min-h-11 rounded-full border-2 px-4 text-sm font-semibold',
                  i === selectedIndex
                    ? 'border-gold bg-gold/15 text-gold'
                    : 'border-cream/20 text-cream/70',
                ].join(' ')}
              >
                {opt.scenario.pool.poolCount} poules
                {i === 0 ? ' ★' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 flex gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={confirming}>
          Retour
        </Button>
        <Button fullWidth onClick={() => onConfirm(choice)} disabled={confirming}>
          {confirming ? 'Génération…' : 'Ça me va !'}
        </Button>
      </div>
    </div>
  )
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <p
        className={
          small
            ? 'font-display text-lg font-bold text-cream'
            : 'font-display text-2xl font-bold text-cream'
        }
      >
        {value}
      </p>
      <p className="text-xs uppercase tracking-wide text-cream/50">{label}</p>
    </div>
  )
}
