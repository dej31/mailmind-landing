import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

const dirname = import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  // Sur Vercel/Netlify le site est servi à la racine (base '/', par
  // défaut). Sur GitHub Pages (projet, pas domaine perso), il est servi
  // sous /<nom-du-repo>/ : le workflow de déploiement fixe alors
  // VITE_BASE_PATH avant le build (voir .github/workflows/deploy.yml).
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Challenge Halle Back',
        short_name: 'Halle Back',
        description: 'Tournoi de rugby touché de Montesquieu-Volvestre',
        theme_color: '#844431',
        background_color: '#080D13',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Ne jamais servir des scores/plannings obsolètes depuis le cache :
        // navigation + API en network-first, seuls les assets statiques
        // sont mis en cache agressivement.
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'style' ||
              request.destination === 'script' ||
              request.destination === 'font' ||
              request.destination === 'image',
            handler: 'CacheFirst',
            options: { cacheName: 'static-assets' },
          },
          {
            urlPattern: ({ url }) => url.hostname.includes('supabase.co'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-data',
              networkTimeoutSeconds: 4,
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
})
