import { useMemo } from 'react'
import { Trophy } from 'lucide-react'

const CONFETTI_COLORS = ['#D9A441', '#844431', '#F3EBDD', '#B5432E']

export function ChampionScreen({
  championName,
  finalistName,
  year,
  onClose,
}: {
  championName: string
  finalistName?: string
  year: number
  onClose?: () => void
}) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: `${Math.round((i / 40) * 100 + (i % 3) * 2)}%`,
        delay: `${(i % 10) * 0.25}s`,
        duration: `${2.5 + (i % 5) * 0.4}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    [],
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center">
      {confetti.map((c, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: c.left,
            animationDelay: c.delay,
            animationDuration: c.duration,
            backgroundColor: c.color,
          }}
        />
      ))}

      <Trophy className="mb-4 text-gold" size={64} />
      <p className="font-hand text-3xl text-gold">Champions {year}</p>
      <h1 className="mt-2 font-display text-5xl font-black text-cream sm:text-6xl">
        {championName}
      </h1>
      <p className="mt-1 font-display text-lg text-cream/60">Challenge Halle Back</p>

      {finalistName && (
        <p className="mt-8 text-cream/50">
          Finaliste : <span className="text-cream/80">{finalistName}</span>
        </p>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-10 min-h-11 rounded-full border-2 border-cream/30 px-6 text-cream/80"
        >
          Continuer
        </button>
      )}
    </div>
  )
}
