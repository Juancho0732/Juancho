-- Prueba de humo para RLS: corre contra un Postgres local con el esquema y el
-- seed ya cargados (ver supabase/tests/README.md). No se ejecuta contra
-- Supabase real -- ahí auth.uid()/los roles ya existen de forma nativa.
\set ON_ERROR_STOP off
\pset pager off

\echo '--- 1) anon puede leer places/categories/reviews/place_images ---'
set role anon;
select count(*) from public.places;
select count(*) from public.categories;
select count(*) from public.reviews;
select count(*) from public.place_images;
reset role;

\echo '--- 2) anon NO puede leer favorites (debe dar 0 filas, no error) ---'
set role anon;
select count(*) from public.favorites;
reset role;

\echo '--- 3) anon NO puede leer ai_search_logs (0 filas) ---'
set role anon;
select count(*) from public.ai_search_logs;
reset role;

\echo '--- 4) authenticated (user Laura) puede insertar su propio favorito ---'
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111101';
insert into public.favorites (user_id, place_id)
select '11111111-1111-1111-1111-111111111101', id from public.places limit 1;
select count(*) from public.favorites;
reset role;

\echo '--- 5) authenticated (user Laura) NO puede insertar favorito a nombre de otro usuario (debe fallar) ---'
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111101';
insert into public.favorites (user_id, place_id)
select '11111111-1111-1111-1111-111111111102', id from public.places offset 1 limit 1;
reset role;

\echo '--- 6) authenticated (user Andrés) NO ve el favorito de Laura, solo el suyo (0 filas) ---'
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111102';
select count(*) from public.favorites;
reset role;

\echo '--- 7) authenticated NO puede escribir en places directamente (debe fallar) ---'
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111101';
update public.places set name = 'hackeado' where id = (select id from public.places limit 1);
reset role;

\echo '--- 8) authenticated puede crear una reseña propia ---'
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111103';
insert into public.reviews (place_id, user_id, rating, comment)
select id, '11111111-1111-1111-1111-111111111103', 5, 'Prueba RLS'
from public.places offset 5 limit 1;
reset role;

\echo '--- 9) authenticated NO puede crear una segunda reseña para el mismo lugar (unique constraint) ---'
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111103';
insert into public.reviews (place_id, user_id, rating, comment)
select place_id, '11111111-1111-1111-1111-111111111103', 3, 'Duplicada'
from public.reviews where user_id = '11111111-1111-1111-1111-111111111103' and comment = 'Prueba RLS';
reset role;

\echo '--- 10) authenticated NO puede editar la reseña de otro usuario (0 filas afectadas) ---'
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111104';
update public.reviews set comment = 'hackeado'
where user_id = '11111111-1111-1111-1111-111111111103';
select comment from public.reviews where user_id = '11111111-1111-1111-1111-111111111103' and comment = 'Prueba RLS';
reset role;

\echo '--- 11) profiles: lectura pública funciona, update de otro usuario no afecta filas ---'
set role anon;
select count(*) from public.profiles;
reset role;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111104';
update public.profiles set display_name = 'hackeado' where id = '11111111-1111-1111-1111-111111111101';
select display_name from public.profiles where id = '11111111-1111-1111-1111-111111111101';
reset role;

\echo '--- 12) service_role sí puede leer ai_search_logs / escribir places (bypassa RLS) ---'
set role service_role;
update public.places set is_mock = true where id = (select id from public.places limit 1);
select count(*) from public.ai_search_logs;
reset role;

\echo '--- 13) consulta de cercanía (earthdistance) funciona ---'
set role anon;
select name, locality, round((earth_distance(ll_to_earth(lat, lng), ll_to_earth(4.6486, -74.0628)) / 1000)::numeric, 2) as km
from public.places
order by earth_distance(ll_to_earth(lat, lng), ll_to_earth(4.6486, -74.0628))
limit 3;
reset role;

\echo '--- 14) búsqueda de texto simple (pg_trgm) funciona ---'
set role anon;
select name from public.places where name ilike '%café%' or description ilike '%café%' limit 3;
reset role;

\echo '--- 15) RPC nearby_places (Fase 5): funciona como anon, respeta el radio y el límite ---'
set role anon;
select name, locality, round(distance_m::numeric, 0) as distance_m
from public.nearby_places(4.6486, -74.0628, 5, 3);
-- ninguna fila debería superar max_distance_km * 1000 (5km -> 5000m)
select count(*) as filas_fuera_de_radio
from public.nearby_places(4.6486, -74.0628, 5, 1000)
where distance_m > 5000;
reset role;

\echo '--- 16) RPC personalized_places (Fase 8): usa las señales del propio usuario, no las de otro ---'
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111101';
-- Laura ya tiene un favorito (paso 4). No debería reaparecer en sus recomendaciones.
select count(*) as favorito_repetido
from public.personalized_places(20) pp
where pp.id in (select place_id from public.favorites where user_id = '11111111-1111-1111-1111-111111111101');
-- Debe devolver resultados igual (hay 72 lugares de sobra tras excluir 1 favorito).
select count(*) as total_recomendados from public.personalized_places(6);
reset role;

\echo '--- 17) RPC personalized_places: un usuario sin favoritos/reseñas altas no rompe (cae a orden por rating) ---'
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111106';
select count(*) as total_recomendados_sin_senal from public.personalized_places(6);
reset role;

\echo '--- listo ---'
