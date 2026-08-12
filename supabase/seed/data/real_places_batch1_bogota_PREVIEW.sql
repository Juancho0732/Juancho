-- Generado por supabase/seed/import_real_places.py.
-- REVISAR ANTES DE APLICAR -- este archivo no se generó ni se aplicó solo.
-- No lo corras contra un proyecto real sin haber verificado cada fila a mano.

begin;

-- Fila 1: El Cielo
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  'aa6f977e-6ea6-4eb9-a14e-4494bdeb0420'::uuid,
  'El Cielo',
  (select id from public.categories where name = 'Restaurantes'),
  'Calle 70 #4-47',
  'Chapinero',
  4.6543108,
  -74.0591851,
  180000.0,
  355320.0,
  '{"mar_mie": "06:00-23:00", "jue_sab": "12:00-23:00", "dom": "12:00-17:00", "lun": "06:00-22:00"}'::jsonb,
  'Restaurante de alta cocina colombiana con técnicas de gastronomía molecular, menú de degustación de varios tiempos que cambia cada cuatro meses.',
  array['alta_cocina', 'menu_degustacion'],
  false,
  'https://elcielo.com.co/bogota/',
  '2026-08-12'::timestamptz
);

-- Fila 2: Abasto
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '53900b85-cd7c-4cbf-89c3-6f85789e388c'::uuid,
  'Abasto',
  (select id from public.categories where name = 'Restaurantes'),
  'Calle 118 #5-41',
  'Usaquén',
  4.6998722,
  -74.0518378,
  40000.0,
  80000.0,
  '{"lun": "07:00-16:00", "mar_vie": "07:00-21:00", "sab": "08:00-21:00", "dom": "08:00-16:30"}'::jsonb,
  'Restaurante de cocina colombiana e internacional en Usaquén, popular para brunch, con productos de mercado y ambiente familiar.',
  array['pet_friendly', 'brunch'],
  false,
  'https://abasto.com.co/',
  '2026-08-12'::timestamptz
);

-- Fila 3: Mesa Franca
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '92444c07-c176-4a0d-922e-b8d71cb6330b'::uuid,
  'Mesa Franca',
  (select id from public.categories where name = 'Restaurantes'),
  'Calle 61 #5-56',
  'Chapinero',
  4.647962,
  -74.0640407,
  60000.0,
  120000.0,
  '{"mar": "19:00-22:00", "mie": "12:00-16:00,19:00-22:00", "jue_vie": "12:00-16:00,19:00-23:00", "sab": "13:00-23:00", "dom": "13:00-17:00"}'::jsonb,
  'Restaurante de autor en Chapinero Alto con cocina colombiana de granja a mesa, dirigido por el chef Iván Cadena. Cerrado los lunes.',
  array['farm_to_table', 'cocina_de_autor'],
  false,
  'https://www.restaurantemesafranca.com/',
  '2026-08-12'::timestamptz
);

-- Fila 4: Central Cevichería (Zona T)
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '2d2fd7ef-2f4e-465f-912a-02bb90ada51e'::uuid,
  'Central Cevichería (Zona T)',
  (select id from public.categories where name = 'Restaurantes'),
  'Carrera 13 #85-14',
  'Zona Rosa',
  4.6692281,
  -74.0535095,
  50000.0,
  80000.0,
  '{"lun_mie": "12:00-21:30", "jue_sab": "12:00-22:00", "dom": "12:00-21:00"}'::jsonb,
  'Cadena de cevichería y mariscos con varias sedes en Bogotá; esta reseña corresponde específicamente a la sede de la Zona T (Carrera 13 #85-14).',
  array['mariscos', 'ceviche'],
  false,
  'https://takami.co/central-cevicheria/',
  '2026-08-12'::timestamptz
);

-- Fila 5: Crepes & Waffles (Zona T)
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '81b98c6c-834c-4887-8c65-443e60caa98d'::uuid,
  'Crepes & Waffles (Zona T)',
  (select id from public.categories where name = 'Restaurantes'),
  'Carrera 12A #83-40',
  'Zona Rosa',
  4.6677619,
  -74.0537632,
  15000.0,
  35000.0,
  '{"lun_vie": "11:45-22:00", "sab": "11:45-22:30", "dom": "08:00-20:00"}'::jsonb,
  'Cadena colombiana reconocida de crepes y postres, sede específica en la Zona T, popular para brunch y comidas familiares.',
  array['brunch', 'postres'],
  false,
  'https://www.crepesywaffles.com/ubicaciones',
  '2026-08-12'::timestamptz
);

-- Fila 6: Apache Rooftop Bar
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '63ab08b3-b9f3-4eb2-8ab6-d7e6afa22427'::uuid,
  'Apache Rooftop Bar',
  (select id from public.categories where name = 'Bares y Rooftops'),
  'Carrera 11 #93-77',
  'Zona Rosa',
  4.6753543,
  -74.0474642,
  30000.0,
  70000.0,
  '{"lun_mie": "12:00-24:00", "jue": "12:00-01:00", "vie_sab": "13:00-02:00"}'::jsonb,
  'Rooftop de hamburguesas y cocteles en el Hotel Click Clack, con vista panorámica de 360 grados de Bogotá. DJs en vivo de miércoles a sábado.',
  array['rooftop', 'vista_panoramica'],
  false,
  'https://www.clickclackhotel.com/en/hotel-clickclackbogota-in-bogota/restaurants/apache/',
  '2026-08-12'::timestamptz
);

-- Fila 7: Bogotá Beer Company (Parque 93)
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '79f000a3-78d5-48fb-8ccf-b4fc345fb180'::uuid,
  'Bogotá Beer Company (Parque 93)',
  (select id from public.categories where name = 'Bares y Rooftops'),
  'Carrera 11A #93A-94',
  'Zona Rosa',
  4.676768,
  -74.0482874,
  30000.0,
  50000.0,
  '{"lun_jue": "12:30-23:00", "vie_sab": "12:30-01:00", "dom": "12:30-22:00"}'::jsonb,
  'Cervecería artesanal colombiana pionera del sector, sede Parque 93, con más de 20 estilos de cerveza propia.',
  array['cerveza_artesanal'],
  false,
  'https://direccion.com.co/lugar/bogota/bogota-beer-company-bbc-parque-de-la-93/',
  '2026-08-12'::timestamptz
);

-- Fila 8: Metrónomo Bar
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '4eb8c549-2512-4653-8ebb-4add5c15930a'::uuid,
  'Metrónomo Bar',
  (select id from public.categories where name = 'Bares y Rooftops'),
  'Calle 67 #5-20',
  'Chapinero',
  4.6510177,
  -74.0586775,
  38000.0,
  60000.0,
  '{"mar_mie": "15:30-23:00", "jue_sab": "15:30-01:00"}'::jsonb,
  'Bar de coctelería de autor en Chapinero con ambiente romántico, cócteles clásicos y creaciones con sabores locales. Cerrado domingo y lunes.',
  array['coctelería'],
  false,
  'https://www.degusta.com.co/bogota/restaurante/metronomo-bar_107717.html',
  '2026-08-12'::timestamptz
);

-- Fila 9: Café San Alberto (Usaquén)
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '3d5e2bfe-ab68-4a76-8b3a-67acd0d241cc'::uuid,
  'Café San Alberto (Usaquén)',
  (select id from public.categories where name = 'Cafés'),
  'Calle 117 #6A-47',
  'Usaquén',
  4.6938655,
  -74.0305743,
  13000.0,
  30000.0,
  '{"lun_dom": "08:30-20:00"}'::jsonb,
  'Café de especialidad premiado internacionalmente, tienda insignia de Usaquén de una finca cafetera familiar desde 1972.',
  array['cafe_especialidad'],
  false,
  'https://cafesanalbertoint.com/sucursal/usaquen-bogota/',
  '2026-08-12'::timestamptz
);

-- Fila 10: Varietale (Candelaria)
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  'db72585c-fede-4fc8-a7ff-ba042d66e8a5'::uuid,
  'Varietale (Candelaria)',
  (select id from public.categories where name = 'Cafés'),
  'Calle 12 #1-20',
  'Candelaria',
  4.5983612,
  -74.0734472,
  7600.0,
  16800.0,
  '{"lun_dom": "00:00-23:59"}'::jsonb,
  'Café de especialidad abierto 24 horas en La Candelaria, popular entre estudiantes universitarios, con métodos de preparación como sifón y cold brew.',
  array['cafe_especialidad', '24_horas'],
  false,
  'https://varietale.com/',
  '2026-08-12'::timestamptz
);

-- Fila 11: Museo del Oro
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '89f368d0-30ed-407e-aa26-be69502e8c5b'::uuid,
  'Museo del Oro',
  (select id from public.categories where name = 'Cultura y Museos'),
  'Carrera 6 #15-88',
  'Candelaria',
  4.6005881,
  -74.0726955,
  0.0,
  8000.0,
  '{"mar_sab": "09:00-17:00", "dom": "10:00-17:00"}'::jsonb,
  'Museo del Banco de la República con la mayor colección de orfebrería prehispánica del mundo. Entrada gratuita los domingos. Cerrado los lunes.',
  array['museo', 'entrada_gratis_domingo'],
  false,
  'https://www.banrepcultural.org/bogota/museo-del-oro/programa-tu-visita',
  '2026-08-12'::timestamptz
);

-- Fila 12: Museo Nacional de Colombia
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  'a27e553a-4c96-415f-a402-a7ba7ea387eb'::uuid,
  'Museo Nacional de Colombia',
  (select id from public.categories where name = 'Cultura y Museos'),
  'Carrera 7 #28-66',
  'Candelaria',
  4.5911354,
  -74.0793541,
  0.0,
  3000.0,
  '{"mar_dom": "09:00-17:00"}'::jsonb,
  'El museo más antiguo de Colombia, con colecciones de arte, historia y arqueología nacional. Gratis domingos y miércoles de 3 a 5pm.',
  array['museo'],
  false,
  'https://bogota.gov.co/mi-ciudad/cultura-recreacion-y-deporte/horarios-y-precios-de-entrada-los-museos-de-bogota-foto',
  '2026-08-12'::timestamptz
);

-- Fila 13: Museo Botero
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  'a9860820-c367-4b99-9b96-cf2354213c15'::uuid,
  'Museo Botero',
  (select id from public.categories where name = 'Cultura y Museos'),
  'Calle 11 #4-41',
  'Candelaria',
  4.5966918,
  -74.0730851,
  0.0,
  0.0,
  '{"lun_sab": "09:00-19:00", "dom": "10:00-17:00"}'::jsonb,
  'Museo con la colección donada por Fernando Botero, incluyendo obra propia y de artistas internacionales. Entrada completamente gratuita. Cerrado martes.',
  array['museo', 'entrada_gratis'],
  false,
  'https://bogota.gov.co/mi-ciudad/cultura-recreacion-y-deporte/horarios-y-precios-de-entrada-los-museos-de-bogota-foto',
  '2026-08-12'::timestamptz
);

-- Fila 14: Museo de Arte Moderno de Bogotá (MAMBO)
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  'ed608309-4163-4e6e-8394-03a17d1b3b8d'::uuid,
  'Museo de Arte Moderno de Bogotá (MAMBO)',
  (select id from public.categories where name = 'Cultura y Museos'),
  'Calle 24 #6-00',
  'Candelaria',
  4.6213776,
  -74.0803611,
  8000.0,
  12000.0,
  '{"mar_sab": "09:00-17:00", "dom": "12:00-17:00"}'::jsonb,
  'Museo de arte moderno y contemporáneo colombiano e internacional, con exposiciones temporales. 2x1 los martes. Cerrado lunes.',
  array['museo', 'arte_contemporaneo'],
  false,
  'https://bogota.gov.co/mi-ciudad/cultura-recreacion-y-deporte/horarios-y-precios-de-entrada-los-museos-de-bogota-foto',
  '2026-08-12'::timestamptz
);

-- Fila 15: Museo de Bogotá
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  'fa91a1e7-8eb3-4597-8699-d2c3d67ec4ff'::uuid,
  'Museo de Bogotá',
  (select id from public.categories where name = 'Cultura y Museos'),
  'Calle 10 #3-61',
  'Candelaria',
  4.5953781,
  -74.0728977,
  0.0,
  0.0,
  '{"mar_vie": "09:00-17:00", "sab_dom": "10:00-17:00"}'::jsonb,
  'Museo dedicado a la historia y transformación urbana de Bogotá, entrada gratuita. Cerrado lunes.',
  array['museo', 'entrada_gratis'],
  false,
  'https://bogota.gov.co/mi-ciudad/cultura-recreacion-y-deporte/horarios-y-precios-de-entrada-los-museos-de-bogota-foto',
  '2026-08-12'::timestamptz
);

-- Fila 16: Museo de la Independencia - Casa del Florero
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  'caf5a85c-985d-40f6-9395-e6e9815746f5'::uuid,
  'Museo de la Independencia - Casa del Florero',
  (select id from public.categories where name = 'Cultura y Museos'),
  'Carrera 7 #11-28',
  'Candelaria',
  4.5926402,
  -74.0785297,
  0.0,
  3000.0,
  '{"mar_dom": "09:00-17:00"}'::jsonb,
  'Casa museo donde ocurrió el Grito de Independencia del 20 de julio de 1810. Gratis domingos y miércoles de 3 a 5pm. Cerrado lunes.',
  array['museo', 'historia'],
  false,
  'https://bogota.gov.co/mi-ciudad/cultura-recreacion-y-deporte/horarios-y-precios-de-entrada-los-museos-de-bogota-foto',
  '2026-08-12'::timestamptz
);

-- Fila 17: Parque Metropolitano Simón Bolívar
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  'cc753050-b9db-49f7-80e5-924159ea8b23'::uuid,
  'Parque Metropolitano Simón Bolívar',
  (select id from public.categories where name = 'Aire Libre y Parques'),
  'Avenida Carrera 68 #63-13',
  'Teusaquillo',
  4.656248,
  -74.1012032,
  0.0,
  0.0,
  '{"lun_dom": "06:00-18:00"}'::jsonb,
  'El parque metropolitano más grande de Bogotá, 113 hectáreas de zonas verdes, lagos y espacios para deporte y recreación. Entrada libre.',
  array['parque', 'entrada_gratis'],
  false,
  'https://bogota.gov.co/mi-ciudad/cultura-recreacion-y-deporte/parque-simon-bolivar-conoce-sus-horarios-el-plan-perfecto-en-bogota',
  '2026-08-12'::timestamptz
);

-- Fila 18: Parque Nacional Enrique Olaya Herrera
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '43709b96-e78e-4dd8-a606-c5da730f1c4e'::uuid,
  'Parque Nacional Enrique Olaya Herrera',
  (select id from public.categories where name = 'Aire Libre y Parques'),
  'Carrera 7 con Calle 39',
  'Chapinero',
  4.6221748,
  -74.0629696,
  0.0,
  0.0,
  '{"lun_sab": "04:00-23:00", "dom": "05:00-22:00"}'::jsonb,
  'Parque histórico en el límite entre Chapinero y el centro de Bogotá, con zonas verdes, canchas deportivas y senderos. Entrada libre.',
  array['parque', 'entrada_gratis'],
  false,
  'https://www.idrd.gov.co/parques-y-escenarios',
  '2026-08-12'::timestamptz
);

-- Fila 19: Parque de Usaquén
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '0b0c5092-3f01-4c07-9707-3351b0cd61b5'::uuid,
  'Parque de Usaquén',
  (select id from public.categories where name = 'Aire Libre y Parques'),
  'Carrera 6A #119B-05',
  'Usaquén',
  4.6953039,
  -74.0312487,
  0.0,
  0.0,
  '{"lun_sab": "04:00-23:00", "dom": "05:00-22:00"}'::jsonb,
  'Parque principal del tradicional barrio de Usaquén, junto al mercado de pulgas de los domingos. Entrada libre.',
  array['parque', 'entrada_gratis'],
  false,
  'https://www.tripadvisor.com/Attraction_Review-g294074-d7729122-Reviews-Parque_de_Usaquen-Bogota.html',
  '2026-08-12'::timestamptz
);

-- Fila 20: Parque Recreodeportivo El Salitre
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '90806bf1-31ef-4adc-ac79-0785833a3b63'::uuid,
  'Parque Recreodeportivo El Salitre',
  (select id from public.categories where name = 'Aire Libre y Parques'),
  'Carrera 60 #63-75',
  'Barrios Unidos',
  4.6746301,
  -74.0783119,
  0.0,
  0.0,
  '{"lun_dom": "06:00-18:00"}'::jsonb,
  'Parque deportivo administrado por el IDRD, junto al Parque Salitre Mágico y el Museo de los Niños, con instalaciones para varios deportes. Entrada libre.',
  array['parque', 'deporte', 'entrada_gratis'],
  false,
  'https://www.idrd.gov.co/parques-y-escenarios/parque-deportivo-el-salitre',
  '2026-08-12'::timestamptz
);

-- Fila 21: Theatron
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '1fdf37b3-13df-4cc4-ae85-7f422211bc2d'::uuid,
  'Theatron',
  (select id from public.categories where name = 'Vida Nocturna'),
  'Calle 58 Bis #10-32',
  'Chapinero',
  4.644768,
  -74.0636913,
  20000.0,
  55000.0,
  '{"jue_sab": "21:00-03:00"}'::jsonb,
  'La discoteca LGBT+ más grande de Latinoamérica, con 20 ambientes musicales distintos bajo un mismo techo.',
  array['lgbt', 'discoteca'],
  false,
  'https://en.wikipedia.org/wiki/Theatron_(club)',
  '2026-08-12'::timestamptz
);

-- Fila 22: Scape Games (Galerías)
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  'bd10c24a-07df-4a03-be5f-a96d2bc260d4'::uuid,
  'Scape Games (Galerías)',
  (select id from public.categories where name = 'Planes con Amigos'),
  'Transversal 24 #53C-56',
  'Teusaquillo',
  4.6425588,
  -74.0728283,
  35000.0,
  50000.0,
  '{"lun_vie": "14:00-21:00", "sab": "11:00-21:00", "dom": "11:00-19:00"}'::jsonb,
  'Escape room con 4 salas temáticas (hospital psiquiátrico, invasión zombie, campamento nazi, naufragio del Titanic), 60 minutos por partida.',
  array['escape_room'],
  false,
  'https://worldofescapes.co/bogota',
  '2026-08-12'::timestamptz
);

-- Fila 23: Cantores Lounge
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '16d15fc5-26f2-48ab-977c-4c1f01a5eded'::uuid,
  'Cantores Lounge',
  (select id from public.categories where name = 'Planes con Amigos'),
  'Calle 45 #7-16',
  'Chapinero',
  4.6316817,
  -74.0646931,
  12000.0,
  25000.0,
  '{"lun_mie": "16:00-01:00", "jue_sab": "16:00-03:00"}'::jsonb,
  'Bar de karaoke con salas privadas para grupos en Chapinero, sistema de karaoke con TV y micrófonos, ambiente informal.',
  array['karaoke'],
  false,
  'https://www.eltiempo.com/bogota/los-cinco-mejores-lugares-para-cantar-karaoke-en-bogota-635662',
  '2026-08-12'::timestamptz
);

-- Fila 24: Relier: Juegos de Mesa
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  'd79c4aec-15e6-4e59-9077-5263f24c6875'::uuid,
  'Relier: Juegos de Mesa',
  (select id from public.categories where name = 'Planes con Amigos'),
  'Carrera 13 #118A-32',
  'Usaquén',
  4.7489109,
  -74.034758,
  10000.0,
  20000.0,
  '{"mar_dom": "13:00-21:00"}'::jsonb,
  'Café de juegos de mesa con una amplia colección para jugar en el lugar mientras se consume algo. Cerrado lunes.',
  array['juegos_de_mesa'],
  false,
  'https://relier.com.co/nuestro-cafe-en-bogota',
  '2026-08-12'::timestamptz
);

-- Fila 25: Momentino Wine Bar
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '729bd9e1-3094-495a-b4c2-d3db5bcf2842'::uuid,
  'Momentino Wine Bar',
  (select id from public.categories where name = 'Planes en Pareja'),
  'Calle 61 #5-30',
  'Chapinero',
  4.645909,
  -74.0598273,
  11000.0,
  58000.0,
  '{"lun_mar": "16:00-22:00", "mie": "16:00-23:00", "jue_sab": "16:00-24:00"}'::jsonb,
  'Vinoteca con más de 260 referencias de vino de 17 países, tapas para compartir, en Chapinero Alto. Cerrado domingos.',
  array['vinoteca', 'tapas'],
  false,
  'https://www.momentino.co/',
  '2026-08-12'::timestamptz
);

-- Fila 26: Presence Spa (Hotel Marriott Bogotá)
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '0cba0c5c-416e-4724-859a-21e42510da06'::uuid,
  'Presence Spa (Hotel Marriott Bogotá)',
  (select id from public.categories where name = 'Planes en Pareja'),
  'Avenida El Dorado #69B-53',
  'Salitre',
  4.6627647,
  -74.1096806,
  180000.0,
  1190000.0,
  '{"lun_dom": "08:00-20:00"}'::jsonb,
  'Spa del Hotel Marriott con tratamientos en pareja, masajes, hidroterapia y aromaterapia.',
  array['spa', 'masajes'],
  false,
  'https://theplacetobe.lat/spas/spa-marriott-bogota/',
  '2026-08-12'::timestamptz
);

-- Fila 27: Catación Pública (Usaquén)
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '532ff352-d8bb-418f-bf6a-6ef33b6a9f59'::uuid,
  'Catación Pública (Usaquén)',
  (select id from public.categories where name = 'Experiencias y Talleres'),
  'Calle 120A #3A-47',
  'Usaquén',
  4.6968115,
  -74.0299857,
  44000.0,
  185000.0,
  '{"mar_dom": "09:00-18:00"}'::jsonb,
  'Experiencias de catación de café colombiano y cursos para profundizar en el mundo del café de especialidad. Cerrado lunes.',
  array['cafe', 'cata', 'taller'],
  false,
  'https://catacionpublica.co/',
  '2026-08-12'::timestamptz
);

-- Fila 28: Alharaca Taller de Cerámica
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '5fbe6644-0e04-4782-b3ef-bbd7fef00a85'::uuid,
  'Alharaca Taller de Cerámica',
  (select id from public.categories where name = 'Experiencias y Talleres'),
  'Calle 64 #9A-32',
  'Chapinero',
  4.6476626,
  -74.0581485,
  128000.0,
  128000.0,
  '{"lun": "10:00-13:00,14:30-20:00", "mar": "09:30-12:30", "mie": "14:30-17:30", "vie": "09:30-12:30", "sab": "18:30-20:30", "dom": "10:00-12:00,14:30-18:30"}'::jsonb,
  'Taller de cerámica en torno para grupos pequeños (desde 3 personas) en el sector de Lourdes, Chapinero.',
  array['ceramica', 'taller'],
  false,
  'https://www.alharacataller.com/alharaca',
  '2026-08-12'::timestamptz
);

-- Fila 29: Bogotá Bike Tours
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  'c6b58f2e-9041-4e4d-b5e1-1c83a809991b'::uuid,
  'Bogotá Bike Tours',
  (select id from public.categories where name = 'Experiencias y Talleres'),
  'Carrera 3 #12-42',
  'Candelaria',
  4.5990553,
  -74.0699296,
  109000.0,
  109000.0,
  '{"lun_dom": "10:30-15:30"}'::jsonb,
  'Tour guiado en bicicleta por el centro histórico de Bogotá, arte urbano y mercados tradicionales. Salidas diarias a las 10:30am y 1:30pm.',
  array['bicicleta', 'tour'],
  false,
  'https://www.bogotabiketours.com/',
  '2026-08-12'::timestamptz
);

-- Fila 30: Bendito Tejo
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '5a979cb8-9b6a-4a36-ad1b-9e1d80e27a78'::uuid,
  'Bendito Tejo',
  (select id from public.categories where name = 'Deportes y Recreación'),
  'Calle 138 #47-28',
  'Suba',
  4.7242843,
  -74.0536968,
  40000.0,
  60000.0,
  '{"mar_jue": "16:00-22:00", "vie_sab": "13:00-02:00", "dom": "13:00-20:00"}'::jsonb,
  'Cancha de tejo y bolirana con servicio de comida rápida, hasta 8 personas por cancha.',
  array['tejo', 'juego_tradicional'],
  false,
  'https://benditotejo.co/',
  '2026-08-12'::timestamptz
);

-- Fila 31: Betaclimb (sede Calle 72)
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '2c55612b-2623-4a74-aef4-8efe7c651ca4'::uuid,
  'Betaclimb (sede Calle 72)',
  (select id from public.categories where name = 'Deportes y Recreación'),
  'Calle 72 #20-73',
  'Chapinero',
  4.6518184,
  -74.0510026,
  25000.0,
  55000.0,
  '{"lun_vie": "08:00-22:00", "sab": "08:30-20:30", "dom": "08:30-18:30"}'::jsonb,
  'Rocódromo indoor con rutas de escalada para todos los niveles, alquiler de equipo y capacitación disponible.',
  array['escalada', 'rocodromo'],
  false,
  'https://betaclimb.com.co/sedes/',
  '2026-08-12'::timestamptz
);

-- Fila 32: Locos X Pádel
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '1df3931e-e900-4ac4-b87c-0de52383f1cc'::uuid,
  'Locos X Pádel',
  (select id from public.categories where name = 'Deportes y Recreación'),
  'Calle 147 #58-04',
  'Suba',
  4.7353938,
  -74.0660186,
  60000.0,
  152619.0,
  '{"lun_dom": "06:00-23:00"}'::jsonb,
  'El primer club de pádel de Bogotá y actualmente el más grande de Colombia, con 8 canchas, cafetería y parqueadero.',
  array['padel', 'deporte'],
  false,
  'https://www.locosxpadel.com/',
  '2026-08-12'::timestamptz
);

commit;
