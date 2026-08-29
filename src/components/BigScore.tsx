/** Affichage "gros score" lisible de loin — utilisé en admin (chrono/saisie)
 * comme en public (match en cours). Section 3/52/78. */
export function BigScore({
  teamName,
  score,
  emphasis = false,
}: {
  teamName: string
  score: number | undefined
  emphasis?: boolean
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 text-center min-w-0">
      <span className="w-full truncate font-display text-lg font-semibold text-cream sm:text-xl">
        {teamName}
      </span>
      <span
        className={[
          'font-display font-bold leading-none tabular-nums',
          emphasis ? 'text-7xl text-gold sm:text-8xl' : 'text-6xl text-cream sm:text-7xl',
        ].join(' ')}
      >
        {score ?? '–'}
      </span>
    </div>
  )
}
