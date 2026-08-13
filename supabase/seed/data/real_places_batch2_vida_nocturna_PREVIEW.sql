-- Generado por supabase/seed/import_real_places.py.
-- REVISAR ANTES DE APLICAR -- este archivo no se generó ni se aplicó solo.
-- No lo corras contra un proyecto real sin haber verificado cada fila a mano.

begin;

-- Fila 1: Galería Café Libro (Parque 93)
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  'd16f8242-71c6-4585-9118-33d6181280a8'::uuid,
  'Galería Café Libro (Parque 93)',
  (select id from public.categories where name = 'Vida Nocturna'),
  'Carrera 11A #93-42',
  'Zona Rosa',
  4.6753951,
  -74.047949,
  50400.0,
  50400.0,
  '{"mar_sab": "17:00-03:00"}'::jsonb,
  'Bar de salsa y música en vivo en el Parque de la 93. Esta ficha corresponde a la sede Parque 93. Según la sede, los domingos prefestivos abre desde las 6:00 p.m.',
  array['salsa', 'musica_en_vivo'],
  false,
  'https://www.galeriacafelibro.com.co/page/sedes',
  '2026-08-13'::timestamptz
);

-- Fila 2: Casa Quiebra Canto
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '293c4c8d-b66a-4f34-9240-cbb65d86d359'::uuid,
  'Casa Quiebra Canto',
  (select id from public.categories where name = 'Vida Nocturna'),
  'Carrera 5 #17-76',
  'Santa Fe',
  4.6032177,
  -74.0706732,
  45000.0,
  45000.0,
  '{"jue_sab": "17:00-03:00"}'::jsonb,
  'Bar de salsa en el centro de Bogotá, con orquesta en vivo los fines de semana.',
  array['salsa', 'musica_en_vivo'],
  false,
  'https://hotelesb3.com/en/salsa-en-bogota-top-5-de-los-mejores-bares-de-salsa/',
  '2026-08-13'::timestamptz
);

-- Fila 3: Cumbia House (Gaira)
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '6d04bdc9-cf4e-4997-9c40-5dce683eb013'::uuid,
  'Cumbia House (Gaira)',
  (select id from public.categories where name = 'Vida Nocturna'),
  'Carrera 13 #96-11',
  'Chapinero',
  4.6806323,
  -74.0476341,
  80000.0,
  80000.0,
  null,
  'Casa de música en vivo dedicada a la cumbia y la música del Caribe colombiano, con cocina costeña. El lugar no publica horario en su sitio oficial.',
  array['musica_en_vivo', 'cumbia'],
  false,
  'https://cumbiahouse.com/',
  '2026-08-13'::timestamptz
);

-- Fila 4: Salsa Camará
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '1efa7b4e-aeea-454b-96bc-a6341f93cba2'::uuid,
  'Salsa Camará',
  (select id from public.categories where name = 'Vida Nocturna'),
  'Carrera 11 #70A-22',
  'Chapinero',
  4.6558511,
  -74.0595782,
  null,
  null,
  '{"jue_sab": "16:00-03:00"}'::jsonb,
  'Bar de salsa en Chapinero con conciertos en vivo de artistas nacionales e internacionales y una amplia carta de licores.',
  array['salsa', 'musica_en_vivo'],
  false,
  'https://hotelesb3.com/en/salsa-en-bogota-top-5-de-los-mejores-bares-de-salsa/',
  '2026-08-13'::timestamptz
);

-- Fila 5: Latino Power
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  'e298313e-a35d-4b91-881d-397bbd945eb5'::uuid,
  'Latino Power',
  (select id from public.categories where name = 'Vida Nocturna'),
  'Calle 58 #13-88',
  'Chapinero',
  4.6446486,
  -74.064966,
  null,
  null,
  null,
  'Sala de conciertos en Chapinero descrita por el lugar como la tarima para la presentación de nuevas músicas y proyectos bogotanos y colombianos. Opera por evento: no publica horario ni precio general, ambos varían según la programación.',
  array['musica_en_vivo', 'conciertos'],
  false,
  'https://tickets.latinopower.com.co/local/latino-power-chapinero/',
  '2026-08-13'::timestamptz
);

commit;
