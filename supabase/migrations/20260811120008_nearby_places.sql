-- RPC de cercanía (Fase 5). PostgREST no permite ordenar/filtrar por una
-- expresión SQL arbitraria (earth_distance) a través de la API REST normal,
-- así que se expone como función -- Supabase la publica sola en
-- /rest/v1/rpc/nearby_places. Sin SECURITY DEFINER: corre con los
-- privilegios del que llama, así que sigue aplicando la RLS de `places`
-- (que ya es de lectura pública, ver 20260811120003_places.sql).
create or replace function public.nearby_places(
  user_lat double precision,
  user_lng double precision,
  max_distance_km double precision default 15,
  result_limit integer default 10
)
returns table (
  id uuid,
  name text,
  description text,
  category_id uuid,
  tags text[],
  address text,
  locality text,
  lat double precision,
  lng double precision,
  price_min numeric,
  price_max numeric,
  schedule jsonb,
  rating_avg numeric,
  review_count integer,
  status public.place_status,
  is_mock boolean,
  created_at timestamptz,
  distance_m double precision
)
language sql
stable
as $$
  select
    p.id, p.name, p.description, p.category_id, p.tags, p.address, p.locality,
    p.lat, p.lng, p.price_min, p.price_max, p.schedule, p.rating_avg, p.review_count,
    p.status, p.is_mock, p.created_at,
    earth_distance(ll_to_earth(user_lat, user_lng), ll_to_earth(p.lat, p.lng)) as distance_m
  from public.places p
  where p.status = 'active'
    and earth_distance(ll_to_earth(user_lat, user_lng), ll_to_earth(p.lat, p.lng)) <= max_distance_km * 1000
  order by distance_m asc
  limit result_limit;
$$;

grant execute on function public.nearby_places to anon, authenticated;
