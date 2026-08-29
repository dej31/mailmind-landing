-- Challenge Halle Back — schéma initial
-- Tournoi de rugby touché à terrain unique : tournaments -> pools -> teams -> matches.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- tournaments
-- ---------------------------------------------------------------------
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  date date not null,
  start_time time not null,
  target_end_time time not null,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'running', 'finals', 'finished')),

  pool_match_duration int not null default 6 check (pool_match_duration > 0),
  semi_final_duration int not null default 8 check (semi_final_duration > 0),
  final_duration int not null default 10 check (final_duration > 0),
  transition_duration numeric not null default 1 check (transition_duration >= 0),
  points_win int not null default 3,
  points_draw int not null default 2,
  points_loss int not null default 1,

  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tournaments_owner_id_idx on public.tournaments (owner_id);
create index if not exists tournaments_status_idx on public.tournaments (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tournaments_set_updated_at on public.tournaments;
create trigger tournaments_set_updated_at
  before update on public.tournaments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- pools
-- ---------------------------------------------------------------------
create table if not exists public.pools (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  name text not null,
  order_index int not null,
  unique (tournament_id, order_index)
);

create index if not exists pools_tournament_id_idx on public.pools (tournament_id);

-- ---------------------------------------------------------------------
-- teams
-- ---------------------------------------------------------------------
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  name text not null,
  short_name text,
  category text not null check (category in ('male', 'female', 'youth')),
  level text check (level in ('leisure', 'intermediate', 'confirmed')),
  status text not null default 'active' check (status in ('active', 'forfeit')),
  pool_id uuid references public.pools (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (tournament_id, name)
);

create index if not exists teams_tournament_id_idx on public.teams (tournament_id);
create index if not exists teams_pool_id_idx on public.teams (pool_id);

-- ---------------------------------------------------------------------
-- matches
-- ---------------------------------------------------------------------
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  pool_id uuid references public.pools (id) on delete cascade,
  type text not null check (type in ('pool', 'semifinal', 'final')),
  team_a_id uuid not null references public.teams (id) on delete cascade,
  team_b_id uuid not null references public.teams (id) on delete cascade,
  scheduled_start timestamptz not null,
  planned_duration int not null check (planned_duration > 0),
  actual_start timestamptz,
  actual_end timestamptz,
  score_a int check (score_a >= 0),
  score_b int check (score_b >= 0),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'ready', 'live', 'finished')),
  order_index int not null,
  check (team_a_id <> team_b_id),
  unique (tournament_id, order_index)
);

create index if not exists matches_tournament_id_idx on public.matches (tournament_id);
create index if not exists matches_pool_id_idx on public.matches (pool_id);
create index if not exists matches_status_idx on public.matches (tournament_id, status);
create index if not exists matches_team_a_idx on public.matches (team_a_id);
create index if not exists matches_team_b_idx on public.matches (team_b_id);

-- ---------------------------------------------------------------------
-- qualifications — trace des 4 qualifiés retenus pour les demi-finales,
-- y compris une éventuelle correction manuelle de l'organisateur.
-- ---------------------------------------------------------------------
create table if not exists public.qualifications (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  seed int not null check (seed between 1 and 4),
  source text not null default 'auto' check (source in ('auto', 'manual')),
  created_at timestamptz not null default now(),
  unique (tournament_id, seed)
);

create index if not exists qualifications_tournament_id_idx
  on public.qualifications (tournament_id);
