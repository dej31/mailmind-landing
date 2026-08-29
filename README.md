# Challenge Halle Back

Application web pour organiser et suivre en direct le **Challenge Halle
Back**, tournoi de rugby touché de Montesquieu-Volvestre (depuis 1993).

Deux expériences, une seule base de données :

- **`/admin`** — l'organisateur crée le tournoi, ajoute les équipes, génère
  poules et planning, chronomètre les matchs, saisit les scores, gère les
  phases finales.
- **`/tournoi/:slug`** — le public (joueurs, spectateurs) suit le tournoi en
  direct depuis son téléphone, sans compte, sans installation, via un QR
  code.

Voir [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) pour le détail de
l'architecture et des algorithmes.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router
- Supabase (PostgreSQL + Auth + Realtime)
- Vitest (tests unitaires des algorithmes) + Playwright (e2e)
- PWA (`vite-plugin-pwa`)

## Installation

```bash
npm install
cp .env.example .env.local
# renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env.local
npm run dev
```

L'application se charge même sans `.env.local` configuré (avec un
avertissement en console), mais aucun appel Supabase ne fonctionnera tant
que les variables ne sont pas renseignées.

## Créer le projet Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Dans **Project Settings → API**, récupérer l'URL du projet et la clé
   `anon public` → à mettre dans `.env.local`.
3. Appliquer les migrations SQL (dans l'ordre) situées dans
   `supabase/migrations/` :
   - via le SQL Editor du dashboard Supabase (copier/coller chaque fichier
     dans l'ordre numérique), ou
   - via la CLI Supabase : `supabase link` puis `supabase db push`.
4. Dans **Authentication → Providers**, garder Email/Password activé, et
   créer manuellement le ou les comptes organisateur (Authentication →
   Users → Add user). Il n'y a pas d'inscription en libre-service dans
   l'app — c'est voulu (section 7 du cahier des charges : un seul rôle
   organisateur, pas de gestion de rôles complexe en V1).
5. Vérifier que Realtime est actif sur le projet (activé par défaut) : la
   migration `0003_realtime.sql` ajoute les tables nécessaires à la
   publication `supabase_realtime`.

Le schéma complet (tables, contraintes, index) est dans
`supabase/migrations/0001_schema.sql`, les Row Level Security Policies dans
`0002_rls.sql`. En résumé :

- Lecture publique : autorisée sur un tournoi dès que `status <> 'draft'`
  (et sur tout ce qui lui est rattaché : équipes, poules, matchs,
  qualifications).
- Écriture : réservée à `auth.uid() = tournaments.owner_id`, propagée aux
  tables liées via une sous-requête sur le tournoi parent.
- Un brouillon (`draft`) reste invisible du public — l'organisateur prépare
  le tournoi avant de le "Publier".

## Données de démonstration

En développement (`npm run dev`), la page `/admin` propose un bouton
**"Créer un tournoi de démonstration"** qui crée un tournoi avec 12 équipes
aux noms humoristiques (répartition 8 masculines / 2 féminines / 2 jeunes)
pour tester tout de suite la génération des poules, du planning, etc.
Voir `src/services/demoData.ts`.

## Algorithmes

Tous les algorithmes métier vivent dans `src/algorithms/`, indépendants de
React et de Supabase (fonctions pures, testées) :

| Fonction | Rôle |
| --- | --- |
| `findBestTournamentFormat` | Compare plusieurs scénarios (nb de poules, round robin complet ou limité, durées) et retient le meilleur |
| `generateBalancedPools` | Recherche locale randomisée pour répartir les équipes en poules équilibrées (catégories, niveaux, tailles) |
| `generateRoundRobin` / `generateLimitedPoolMatches` | Génération des rencontres de poule (méthode du cercle) |
| `optimizeMatchSchedule` | Ordonnance les matchs sur le terrain unique pour maximiser la récupération |
| `calculateTournamentTiming` / `estimateTournamentEnd` | Attribue les horaires réels / projette l'heure de fin |
| `calculatePoolStandings` / `calculateCrossPoolRanking` | Classements de poule et inter-poules normalisés |
| `selectQualifiedTeams` / `generateSemiFinals` / `generateFinal` | Qualification et phases finales |
| `calculateDelayMinutes` / `projectEndTime` | Suivi du retard en direct et simulation d'impact |

Outil de vérification manuelle (imprime le format recommandé pour 6 à 20
équipes) :

```bash
npm run format:table
```

## Tests

```bash
npm run test        # Vitest — algorithmes (6 à 20 équipes, cas déséquilibrés, cas limites)
npm run test:e2e     # Playwright — voir ci-dessous
```

### End-to-end

- `e2e/smoke.spec.ts` tourne sans backend réel (coquille de l'app,
  navigation, redirections).
- `e2e/full-tournament.spec.ts` couvre le parcours complet (créer un
  tournoi → équipes → génération → publication → démarrer un match →
  saisir un score → phases finales). Il nécessite un vrai projet Supabase
  de test avec un compte organisateur déjà créé : fournir
  `E2E_ORG_EMAIL` / `E2E_ORG_PASSWORD` (et `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` pointant vers ce projet) sinon il est
  automatiquement ignoré.

## Build

```bash
npm run lint
npm run test
npm run build
```

## Déploiement

Le code est compatible GitHub Pages (routage SPA géré via
`public/404.html` + le script de décodage dans `index.html`, technique
[rafgraph/spa-github-pages](https://github.com/rafgraph/spa-github-pages)),
avec un workflow prêt à l'emploi : `.github/workflows/deploy.yml` build et
déploie sur GitHub Pages à chaque push sur `main`.

Pour l'activer :

1. **Settings → Pages → Source** : choisir "GitHub Actions".
2. **Settings → Secrets and variables → Actions** : ajouter
   `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
3. Push sur `main`.

**Alternative recommandée : Vercel ou Netlify.** Le routage SPA y est géré
nativement (pas de bidouille 404.html nécessaire) et le déploiement est
plus simple — il suffit de connecter le repo et de renseigner les deux
variables d'environnement dans leur dashboard. Le code reste 100%
compatible avec les deux approches (`vite.config.ts` n'applique un
sous-chemin `base` que si `VITE_BASE_PATH` est défini, ce qui n'est le cas
que dans le workflow GitHub Pages).

`.github/workflows/ci.yml` fait tourner lint + tests + build sur chaque
push et pull request vers `main`.

## PWA

L'app est installable ("Ajouter à l'écran d'accueil"). Le service worker
met en cache agressivement les assets statiques (police, JS, CSS) mais
jamais les données de tournoi : tous les appels Supabase passent en
stratégie *network-first* (voir `vite.config.ts`), pour ne jamais afficher
un score obsolète. Une icône trophée provisoire est fournie dans
`public/pwa-192.png` / `pwa-512.png` — si le logo officiel du Challenge est
disponible, le placer dans `src/assets/logo.svg` (ou `.png`) et l'utiliser
à la place (voir section Logo ci-dessous).

## Logo

Aucun logo officiel n'était présent dans le dépôt : une icône trophée
provisoire (cohérente avec la charte graphique) a été générée à la place.
Pour utiliser le vrai logo du Challenge Halle Back :

1. Placer le fichier dans `src/assets/logo.svg` (ou `logo.png`).
2. L'utiliser dans les en-têtes (`src/components/PageHeader.tsx`,
   `src/app/HomeLandingPage.tsx`, `src/app/LoginPage.tsx`) à la place de
   l'icône trophée Lucide actuelle.
3. Régénérer les icônes PWA (`public/pwa-192.png`, `public/pwa-512.png`)
   et le favicon (`public/favicon.svg`) à partir du logo.

## Structure du projet

```
src/
  app/          # shell, auth, routing helpers
  components/   # UI générique (Button, MatchCard, BigScore...)
  features/     # écrans regroupés par domaine (tournament, live, public...)
  algorithms/   # logique métier pure, testée (voir tableau ci-dessus)
  models/       # types TypeScript partagés
  services/     # client Supabase, auth, file d'attente hors-ligne, démo
  repositories/ # accès aux données typé (CRUD par entité)
  hooks/        # hooks React (données + realtime, localStorage, offline)
supabase/
  migrations/   # schéma SQL + RLS + realtime
```

## Points recommandés pour une V2

- Génération de types Supabase automatique (`supabase gen types
  typescript`) plutôt que le fichier `database.types.ts` écrit à la main.
- Historique/archivage multi-éditions (2026, 2027...) avec une vue dédiée.
- Gestion plus fine des forfaits en cours de tournoi (réattribution
  automatique des matchs restants).
- Édition manuelle du planning par glisser-déposer côté admin.
- Notifications push ciblées ("votre équipe joue dans 10 min").
