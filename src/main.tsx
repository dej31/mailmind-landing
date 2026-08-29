import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { startOfflineQueueSync } from '@/services/offlineQueue'

startOfflineQueueSync()

// Nouvelle version dispo -> mise à jour silencieuse au prochain chargement.
// On ne met jamais en cache les données de tournoi elles-mêmes (voir
// vite.config.ts : NetworkFirst sur les appels Supabase), donc rafraîchir
// le service worker ne peut pas afficher un score obsolète (section 39).
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
