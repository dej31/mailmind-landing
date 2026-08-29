-- Active Supabase Realtime (postgres_changes) sur les tables consultées en
-- direct par le mode public : matchs en cours, scores, poules, statut du
-- tournoi.

alter publication supabase_realtime add table public.tournaments;
alter publication supabase_realtime add table public.pools;
alter publication supabase_realtime add table public.teams;
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.qualifications;

-- REPLICA IDENTITY FULL pour recevoir l'ancien ET le nouvel enregistrement
-- sur les UPDATE (utile pour détecter précisément ce qui a changé côté
-- client sans requête supplémentaire).
alter table public.tournaments replica identity full;
alter table public.pools replica identity full;
alter table public.teams replica identity full;
alter table public.matches replica identity full;
alter table public.qualifications replica identity full;
