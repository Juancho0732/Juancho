-- RPC de personalización (Fase 8). Sigue la Regla 10: nada de IA decidiendo
-- qué mostrar -- es una consulta SQL determinística sobre señales reales del
-- propio usuario (sus favoritos y sus reseñas con calificación alta).
--
-- Sin SECURITY DEFINER (igual que nearby_places): corre con los privilegios
-- de quien llama, así que auth.uid() adentro de la función es el mismo que
-- ve la RLS de `favorites`/`reviews` -- un usuario nunca puede leer las
-- señales de otro a través de esta función.
create or replace function public.personalized_places(result_limit integer default 6)
returns setof public.places
language sql
stable
as $$
  with liked_places as (
    -- Señal 1: lugares que el usuario ya marcó como favoritos.
    select place_id from public.favorites where user_id = auth.uid()
    union
    -- Señal 2: lugares que calificó con 4 o 5 estrellas (le gustaron aunque
    -- no los haya guardado como favoritos).
    select place_id from public.reviews where user_id = auth.uid() and rating >= 4
  ),
  liked_categories as (
    select p.category_id, count(*) as weight
    from liked_places lp
    join public.places p on p.id = lp.place_id
    where p.category_id is not null
    group by p.category_id
  ),
  liked_localities as (
    select p.locality, count(*) as weight
    from liked_places lp
    join public.places p on p.id = lp.place_id
    where p.locality is not null
    group by p.locality
  )
  select pl.*
  from public.places pl
  left join liked_categories lc on lc.category_id = pl.category_id
  left join liked_localities ll on ll.locality = pl.locality
  where pl.status = 'active'
    and pl.id not in (select place_id from liked_places)
  order by
    -- La categoría pesa más que la localidad: es más probable que a alguien
    -- le guste el mismo tipo de plan en otra zona que un plan distinto en la
    -- misma zona.
    (coalesce(lc.weight, 0) * 2 + coalesce(ll.weight, 0)) desc,
    pl.rating_avg desc,
    pl.review_count desc
  limit result_limit;
$$;

grant execute on function public.personalized_places(integer) to authenticated;
