import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-gold px-4 py-2 text-center text-sm font-semibold text-ink"
    >
      <WifiOff size={16} />
      Pas de connexion — les dernières données affichées peuvent dater. Nouvelle
      tentative automatique.
    </div>
  )
}
