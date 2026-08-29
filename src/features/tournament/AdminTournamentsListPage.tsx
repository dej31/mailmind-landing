import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Plus, Trophy } from 'lucide-react'
import { useAuth } from '@/app/AuthProvider'
import { fetchMyTournaments } from '@/repositories'
import type { Tournament } from '@/models'
import { signOut } from '@/services/auth'
import { Button, EmptyState, PageHeader, Panel, Spinner, StatusPill } from '@/components'
import { createDemoTournament } from '@/services/demoData'

const STATUS_LABEL: Record<Tournament['status'], string> = {
  draft: 'Brouillon',
  published: 'Publié',
  running: 'En cours',
  finals: 'Phases finales',
  finished: 'Terminé',
}

export function AdminTournamentsListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingDemo, setCreatingDemo] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchMyTournaments(user.id)
      .then(setTournaments)
      .finally(() => setLoading(false))
  }, [user])

  async function handleDemo() {
    if (!user) return
    setCreatingDemo(true)
    try {
      const tournament = await createDemoTournament(user.id)
      navigate(`/admin/${tournament.id}`)
    } finally {
      setCreatingDemo(false)
    }
  }

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Organisateur"
        title="Mes tournois"
        actions={
          <Button
            variant="ghost"
            size="md"
            onClick={() => signOut().then(() => navigate('/login'))}
          >
            <LogOut size={18} /> Déconnexion
          </Button>
        }
      />

      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6">
        <Link to="/admin/nouveau">
          <Button fullWidth size="xl">
            <Plus size={20} /> Créer un tournoi
          </Button>
        </Link>

        {import.meta.env.DEV && (
          <Button variant="secondary" fullWidth onClick={handleDemo} disabled={creatingDemo}>
            {creatingDemo ? 'Création…' : 'Créer un tournoi de démonstration'}
          </Button>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : tournaments.length === 0 ? (
          <EmptyState
            icon={<Trophy size={40} />}
            title="Aucun tournoi encore"
            description="Créez votre premier Challenge Halle Back en moins de 5 minutes."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {tournaments.map((t) => (
              <li key={t.id}>
                <Link to={`/admin/${t.id}`}>
                  <Panel className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-display text-lg font-bold text-cream">{t.name}</p>
                      <p className="text-sm text-cream/60">
                        {t.date} · {t.startTime}
                      </p>
                    </div>
                    <StatusPill tone={t.status === 'draft' ? 'neutral' : 'upcoming'}>
                      {STATUS_LABEL[t.status]}
                    </StatusPill>
                  </Panel>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
