import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants — copiez .env.example vers .env.local. ' +
      "L'application se charge quand même, mais aucun appel Supabase ne fonctionnera.",
  )
}

// `createClient` lève une exception synchrone si l'URL est vide, ce qui
// ferait planter tout le rendu React au chargement du module. On retombe
// sur une URL factice valide pour permettre à l'app de s'afficher (avec un
// message d'erreur clair au premier appel réseau) plutôt qu'un écran blanc.
export const supabase = createClient<Database>(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
)
