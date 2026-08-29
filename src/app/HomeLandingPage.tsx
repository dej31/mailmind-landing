import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { Button } from '@/components'

export function HomeLandingPage() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink px-4 text-center">
      <Trophy className="text-gold" size={48} />
      <div>
        <p className="font-hand text-3xl text-gold">Challenge</p>
        <h1 className="font-display text-5xl font-black text-cream">Halle Back</h1>
        <p className="mt-2 text-cream/60">
          Tournoi de rugby touché — Montesquieu-Volvestre
        </p>
      </div>

      <Link to={user ? '/admin' : '/login'}>
        <Button size="xl">Espace organisateur</Button>
      </Link>

      <p className="max-w-xs text-sm text-cream/40">
        Vous cherchez à suivre un tournoi en cours ? Scannez le QR code fourni
        par l'organisateur, ou ouvrez le lien qu'il vous a partagé.
      </p>
    </div>
  )
}
