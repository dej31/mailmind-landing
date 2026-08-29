export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Chargement"
      className={`inline-block h-6 w-6 animate-spin rounded-full border-2 border-cream/20 border-t-gold ${className}`}
    />
  )
}
