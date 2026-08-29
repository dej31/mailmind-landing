-- Row Level Security : le public a uniquement un accès en lecture aux
-- tournois publiés (jamais aux brouillons), l'organisateur authentifié a
-- tous les droits sur SES tournois uniquement.

alter table public.tournaments enable row level security;
alter table public.pools enable row level security;
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.qualifications enable row level security;

-- ---------------------------------------------------------------------
-- tournaments
-- ---------------------------------------------------------------------
create policy "public can read published tournaments"
  on public.tournaments for select
  using (status <> 'draft' or owner_id = auth.uid());

create policy "owner can insert own tournaments"
  on public.tournaments for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "owner can update own tournaments"
  on public.tournaments for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owner can delete own tournaments"
  on public.tournaments for delete
  to authenticated
  using (owner_id = auth.uid());

-- ---------------------------------------------------------------------
-- pools / teams / matches / qualifications share the same shape of policy:
-- readable when the parent tournament is readable, writable only by the
-- tournament's owner.
-- ---------------------------------------------------------------------
create policy "public can read pools of visible tournaments"
  on public.pools for select
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = pools.tournament_id
        and (t.status <> 'draft' or t.owner_id = auth.uid())
    )
  );

create policy "owner can write pools"
  on public.pools for all
  to authenticated
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = pools.tournament_id and t.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tournaments t
      where t.id = pools.tournament_id and t.owner_id = auth.uid()
    )
  );

create policy "public can read teams of visible tournaments"
  on public.teams for select
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = teams.tournament_id
        and (t.status <> 'draft' or t.owner_id = auth.uid())
    )
  );

create policy "owner can write teams"
  on public.teams for all
  to authenticated
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = teams.tournament_id and t.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tournaments t
      where t.id = teams.tournament_id and t.owner_id = auth.uid()
    )
  );

create policy "public can read matches of visible tournaments"
  on public.matches for select
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = matches.tournament_id
        and (t.status <> 'draft' or t.owner_id = auth.uid())
    )
  );

create policy "owner can write matches"
  on public.matches for all
  to authenticated
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = matches.tournament_id and t.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tournaments t
      where t.id = matches.tournament_id and t.owner_id = auth.uid()
    )
  );

create policy "public can read qualifications of visible tournaments"
  on public.qualifications for select
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = qualifications.tournament_id
        and (t.status <> 'draft' or t.owner_id = auth.uid())
    )
  );

create policy "owner can write qualifications"
  on public.qualifications for all
  to authenticated
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = qualifications.tournament_id and t.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tournaments t
      where t.id = qualifications.tournament_id and t.owner_id = auth.uid()
    )
  );
