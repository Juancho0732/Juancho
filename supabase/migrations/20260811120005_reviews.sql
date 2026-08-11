create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  amount_paid numeric,
  occasion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Un usuario puede editar su reseña de un lugar, no duplicarla.
  unique (place_id, user_id)
);

create index reviews_place_id_idx on public.reviews (place_id);
create index reviews_user_id_idx on public.reviews (user_id);

alter table public.reviews enable row level security;

create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_insert_own" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_own" on public.reviews for update using (auth.uid() = user_id);
create policy "reviews_delete_own" on public.reviews for delete using (auth.uid() = user_id);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

-- Recalcula el rating cacheado de `places` cada vez que cambian sus reseñas.
-- security definer: los usuarios normales no tienen permiso de UPDATE sobre
-- `places` (ver 20260811120003_places.sql), así que esta función necesita
-- correr con los privilegios del dueño (postgres) para poder actualizarla.
create function public.refresh_place_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_place_id uuid := coalesce(new.place_id, old.place_id);
begin
  update public.places
  set
    rating_avg = coalesce(
      (select round(avg(rating)::numeric, 2) from public.reviews where place_id = target_place_id),
      0
    ),
    review_count = (select count(*) from public.reviews where place_id = target_place_id)
  where id = target_place_id;

  return null;
end;
$$;

create trigger reviews_refresh_place_rating
after insert or update or delete on public.reviews
for each row execute function public.refresh_place_rating();
