# Challenge Halle Back — Plan d'implémentation

Tournoi de rugby touché à Montesquieu-Volvestre (depuis 1993), un seul terrain,
6 à 20 équipes, 15h30 → 20h00. Deux publics : organisateurs (`/admin`) et
public (`/tournoi/:slug`), données partagées via Supabase + Realtime.

## 1. Architecture

```
src/
  app/                 # App shell, router, providers, layouts
  components/          # UI générique réutilisable (Button, Card, Badge...)
  features/
    tournament/        # création, wizard, réglages
    teams/              # saisie équipes
    pools/              # génération/affichage poules
    scheduling/         # planning, ordonnancement
    live/                # dashboard live, chrono, retard
    scoring/             # saisie score
    ranking/             # classements poule + inter-poules
    finals/              # qualifs, demi-finales, finale
    public/              # écrans publics (accueil, mon équipe, planning...)
  algorithms/           # fonctions pures, testées, sans dépendance React
  models/                # types TypeScript partagés (miroir du schéma DB)
  services/              # clients Supabase (auth, realtime channels)
  repositories/          # accès données typé (CRUD par entité)
  hooks/                  # hooks React (data fetching, realtime, local storage)
  utils/                  # helpers génériques (temps, format, ids)
  styles/                 # tailwind config, fonts
supabase/
  migrations/
  seed/
```

Séparation stricte : les algorithmes (`src/algorithms`) et modèles
(`src/models`) ne dépendent ni de React ni de Supabase — ils reçoivent des
données en paramètres et retournent des résultats. Les `repositories/`
encapsulent Supabase. Les composants React n'orchestrent que hooks +
algorithmes + repositories.

## 2. Modèle de données (miroir SQL ↔ TS)

- **tournaments** : id, slug, name, date, start_time, target_end_time,
  status (draft|ready|running|finals|finished), pool_match_duration,
  semi_final_duration, final_duration, transition_duration,
  points_win/draw/loss, created_at, updated_at.
- **teams** : id, tournament_id, name, short_name?, category
  (male|female|youth), level? (leisure|intermediate|confirmed), pool_id?,
  status (active|forfeit), created_at.
- **pools** : id, tournament_id, name, order.
- **matches** : id, tournament_id, pool_id?, type (pool|semifinal|final),
  team_a_id, team_b_id, scheduled_start, planned_duration, actual_start?,
  actual_end?, score_a?, score_b?, status
  (scheduled|ready|live|finished), order_index.
- **qualifications** (table légère) : tournament_id, team_id, seed,
  source (auto|manual), pour tracer une correction manuelle des qualifiés.

Contraintes : FK CASCADE sur tournament_id, scores >= 0
(`CHECK (score_a >= 0 AND score_b >= 0)`), team_a_id <> team_b_id,
unicité (tournament_id, slug).

## 3. Routes

- `/` — liste/redirection (en dev : lien vers démo)
- `/login` — connexion organisateur
- `/admin` — liste des tournois de l'organisateur, "Créer un tournoi"
- `/admin/:id` — wizard/réglages tournoi (équipes, génération, simulation)
- `/admin/:id/live` — cockpit live (chrono, scores, retard)
- `/admin/:id/finals` — qualifs, demi-finales, finale
- `/tournoi/:slug` — accueil public (onglets Accueil/Matchs/Classement/Finales)
- `/tournoi/:slug/display` — écran grand format

## 4. Algorithme de format (`findBestTournamentFormat`)

Pour N équipes (6-20), génère plusieurs scénarios (2/3/4 poules, round robin
complet vs limité) et calcule un `TournamentFormatScore` pénalisant :
fin après l'heure cible (très fort), matchs < 4min (fort), < 2 matchs/équipe
(fort), déséquilibre du nombre de matchs entre équipes, déséquilibre
catégories entre poules, récupération faible, durées non "rondes"
(hors {4,5,6,7,8,9,10,12}). Bonus pour marge de 10-20 min avant l'heure
cible. Retourne le meilleur scénario + une explication textuelle simple.

## 5. Équilibrage des poules (`generateBalancedPools`)

Recherche locale randomisée (plusieurs milliers d'itérations) : répartition
initiale en serpentin par catégorie (femmes puis jeunes puis hommes),
puis swaps aléatoires acceptés si `calculatePoolBalanceScore` s'améliore
(variance catégories, variance niveaux, écart de taille). On garde la
meilleure solution trouvée. Déterministe via seed optionnelle (tests).

## 6. Planning (`generateRoundRobin` / `generateLimitedPoolMatches` +
`optimizeMatchSchedule`)

1. Génération des rencontres par poule (round robin complet si le budget
   temps le permet, sinon un nombre limité de rencontres équilibré).
2. Ordonnancement global sur le terrain unique : recherche locale qui
   mélange les matchs de poules différentes pour maximiser le repos
   (pénalité énorme si une équipe enchaîne, forte si un seul match
   d'écart, bonus si récupération homogène) via `calculateScheduleScore`.
3. `calculateTournamentTiming` attribue les horaires (durée + transition)
   et `estimateTournamentEnd` projette la fin (poules + demies + finale).

## 7. Temps réel

Supabase Realtime (postgres_changes) sur `matches`, `teams`, `pools`,
`tournaments` filtrés par `tournament_id`. Hook `useRealtimeTable` avec
fallback polling (30s) si le canal se déconnecte. Écritures optimistes
côté admin avec file d'attente locale (localStorage) en cas d'échec
réseau, retry automatique.

## 8. Design system

Tailwind avec palette custom (terre cuite `#844431`, fond `#080D13`, crème
`#F3EBDD`, accent or). Police titres : Fraunces (Google Fonts, self-hosted
via `@fontsource` ou lien Google Fonts). Police interface : Inter. Police
accroche manuscrite : Caveat (usage très ponctuel). Composants de base :
`Button` (gros, tactile), `BigScore`, `PageHeader`, `StatusPill`,
`Section`. Pas de glassmorphism, pas de gradients, aplats + bordures.

## 9. Sécurité

- Supabase Auth (email/password) pour l'organisateur.
- RLS : lecture publique uniquement sur tournois `status IN
  ('published','running','finals','finished')` (pas `draft`) et leurs
  entités liées ; écriture réservée à `auth.uid() = tournaments.owner_id`.
- Aucune clé service_role dans le frontend.

## 10. Étapes de développement

1. Scaffold Vite/TS/Tailwind + dépendances.
2. Types + algorithmes + tests Vitest.
3. Migrations Supabase + RLS.
4. Design system + composants de base.
5. Services/repositories + auth.
6. Admin — création/génération/simulation.
7. Admin — live (chrono, scores, retard, corrections, forfaits).
8. Admin — qualifications/demi-finales/finale.
9. Public — accueil/mon équipe/planning/classement/finales.
10. Display + QR code + partage.
11. Realtime + PWA + offline.
12. Données de démo.
13. CI/CD + README.
14. Validation (lint/test/build) + passe responsive.
