create type public.place_status as enum ('active', 'inactive', 'pending');

create table public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  -- Características libres (ej. {pet_friendly, outdoor, live_music}). Evita una
  -- tabla many-to-many de categorías secundarias que no es necesaria para el MVP.
  tags text[] not null default '{}',
  address text,
  locality text,
  lat double precision not null,
  lng double precision not null,
  -- Rango de precio por persona, en COP.
  price_min numeric,
  price_max numeric,
  schedule jsonb,
  -- Cacheados desde `reviews` por trigger (ver 20260811120005_reviews.sql) para
  -- no calcular un avg()/count() en cada consulta de listado.
  rating_avg numeric not null default 0,
  review_count integer not null default 0,
  status public.place_status not null default 'active',
  -- Marca explícita de dato ficticio mientras no haya datos reales (Regla 1).
  is_mock boolean not null default true,
  created_at timestamptz not null default now(),
  constraint places_price_range_check check (
    price_min is null or price_max is null or price_min <= price_max
  )
);

create index places_locality_idx on public.places (locality);
create index places_category_id_idx on public.places (category_id);
create index places_status_idx on public.places (status);
create index places_name_trgm_idx on public.places using gin (name gin_trgm_ops);
create index places_description_trgm_idx on public.places using gin (description gin_trgm_ops);
-- Índice geográfico para consultas de cercanía (earth_box/earth_distance).
create index places_lat_lng_idx on public.places using gist (ll_to_earth(lat, lng));

alter table public.places enable row level security;

create policy "places_select_all" on public.places for select using (true);

-- Sin policies de insert/update/delete: los lugares se cargan por seed/migración
-- con la service role. No hay creación de lugares por usuarios en el MVP.
