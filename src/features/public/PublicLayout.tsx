import { Outlet, useOutletContext, useParams } from 'react-router-dom'
import { Home, ListOrdered, Swords, Trophy } from 'lucide-react'
import { useTournamentData } from '@/hooks/useTournamentData'
import type { TournamentData } from '@/hooks/useTournamentData'
import { BottomNav, EmptyState, OfflineBanner, Spinner } from '@/components'

export function PublicLayout() {
  const { slug } = useParams<{ slug: string }>()
  const data = useTournamentData({ slug })

  if (data.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <Spinner />
      </div>
    )
  }

  if (!data.tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-4">
        <EmptyState title="Tournoi introuvable" description="Vérifiez le lien ou le QR code." />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <OfflineBanner />
      <main className="flex-1 pb-4">
        <Outlet context={data} />
      </main>
      <BottomNav
        items={[
          { to: `/tournoi/${slug}`, label: 'Accueil', icon: Home, end: true },
          { to: `/tournoi/${slug}/matchs`, label: 'Matchs', icon: Swords },
          { to: `/tournoi/${slug}/classement`, label: 'Classement', icon: ListOrdered },
          { to: `/tournoi/${slug}/finales`, label: 'Finales', icon: Trophy },
        ]}
      />
    </div>
  )
}

export function usePublicTournamentData() {
  return useOutletContext<TournamentData>()
}
