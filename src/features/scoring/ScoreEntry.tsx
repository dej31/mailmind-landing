import { Minus, Plus } from 'lucide-react'

export function ScoreEntry({
  teamName,
  score,
  onChange,
}: {
  teamName: string
  score: number
  onChange: (next: number) => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <span className="w-full truncate text-center font-display text-lg font-semibold text-cream">
        {teamName}
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Retirer un point à ${teamName}`}
          onClick={() => onChange(Math.max(0, score - 1))}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-cream/30 text-cream active:bg-cream/10"
        >
          <Minus size={22} />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={score}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-20 rounded border-2 border-cream/20 bg-ink text-center font-display text-4xl font-bold text-cream tabular-nums outline-none focus:border-gold"
        />
        <button
          type="button"
          aria-label={`Ajouter un point à ${teamName}`}
          onClick={() => onChange(score + 1)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-gold/15 text-gold active:bg-gold/25"
        >
          <Plus size={22} />
        </button>
      </div>
    </div>
  )
}
