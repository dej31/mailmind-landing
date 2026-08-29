import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { Button } from '@/components'
import { useAuth } from './AuthProvider'
import { signInWithPassword } from '@/services/auth'

export function LoginPage() {
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!authLoading && user) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/admin'
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await signInWithPassword(email, password)
    } catch {
      setError('Connexion impossible. Vérifiez votre email et votre mot de passe.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-4">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <Trophy className="text-gold" size={40} />
        <h1 className="font-display text-3xl font-bold text-cream">
          Challenge Halle Back
        </h1>
        <p className="text-cream/60">Espace organisateur</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded border-2 border-cream/15 bg-ink-soft p-6"
      >
        <label className="mb-1 block text-sm font-semibold text-cream/80" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border-2 border-cream/20 bg-ink px-3 py-2.5 text-cream outline-none focus:border-gold"
        />

        <label
          className="mb-1 block text-sm font-semibold text-cream/80"
          htmlFor="password"
        >
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border-2 border-cream/20 bg-ink px-3 py-2.5 text-cream outline-none focus:border-gold"
        />

        {error && <p className="mb-4 text-sm text-accent-red">{error}</p>}

        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </div>
  )
}
