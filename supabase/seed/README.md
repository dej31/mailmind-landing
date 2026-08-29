# Données de démonstration

Il n'y a volontairement pas de script SQL de seed ici : chaque tournoi
appartient à un `owner_id` (un utilisateur Supabase Auth réel), qu'un
script SQL statique ne peut pas créer proprement.

À la place, la démo se déclenche depuis l'application : une fois connecté
en tant qu'organisateur, le bouton **"Créer un tournoi de démonstration"**
(visible uniquement en développement, voir `src/services/demoData.ts`)
crée un tournoi complet — 12 équipes aux noms humoristiques, poules,
planning — directement via les mêmes repositories que le reste de
l'application. C'est la façon la plus fiable de tester tout le parcours
organisateur de bout en bout.
