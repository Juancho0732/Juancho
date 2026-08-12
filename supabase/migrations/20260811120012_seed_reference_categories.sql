-- Preparación para beta real: las categorías son taxonomía del producto (no
-- datos ficticios) -- toda la app depende de que existan (chips de Home,
-- filtro de categoría en Search, el importador de lugares reales las
-- resuelve por nombre/slug). Antes de esta migración solo se insertaban
-- dentro de supabase/seed.sql, junto con los usuarios y lugares MOCK, así que
-- un proyecto Supabase real que (correctamente) nunca corre ese seed se
-- quedaba sin categorías y sin poder importar un solo lugar real.
--
-- Con on conflict do nothing: segura de correr más de una vez y compatible
-- con bases que ya las tengan (ej. una base de desarrollo donde ya se corrió
-- supabase/seed.sql antes de que existiera esta migración).
insert into public.categories (name, slug) values
  ('Restaurantes', 'restaurantes'),
  ('Bares y Rooftops', 'bares-rooftops'),
  ('Cafés', 'cafes'),
  ('Cultura y Museos', 'cultura-museos'),
  ('Aire Libre y Parques', 'aire-libre-parques'),
  ('Vida Nocturna', 'vida-nocturna'),
  ('Planes con Amigos', 'planes-amigos'),
  ('Planes en Pareja', 'planes-pareja'),
  ('Experiencias y Talleres', 'experiencias-talleres'),
  ('Deportes y Recreación', 'deportes-recreacion')
on conflict (slug) do nothing;
