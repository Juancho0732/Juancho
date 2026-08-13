-- Generado por supabase/seed/import_real_places.py.
-- REVISAR ANTES DE APLICAR -- este archivo no se generó ni se aplicó solo.
-- No lo corras contra un proyecto real sin haber verificado cada fila a mano.

begin;

-- Fila 1: El Cielo
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  'a6aa093b-00ca-4e2b-907b-7e8647d8dc81'::uuid,
  'El Cielo',
  (select id from public.categories where name = 'Restaurantes'),
  'Calle 70 #4-47',
  'Chapinero',
  4.6543108,
  -74.0591851,
  180000.0,
  355320.0,
  '{"mar_mie": "06:00-23:00", "jue_sab": "12:00-23:00", "dom": "12:00-17:00", "lun": "06:00-22:00"}'::jsonb,
  'Restaurante de alta cocina colombiana con técnicas de gastronomía molecular, menú de degustación de varios tiempos que cambia cada cuatro meses. El rango de precio indicado corresponde al menú de degustación de referencia, no a un rango típico de gasto general por persona.',
  array['alta_cocina', 'menu_degustacion'],
  false,
  'https://elcielo.com.co/bogota/',
  '2026-08-12'::timestamptz
);

-- Fila 2: Abasto
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '84329911-a624-4a1d-97f7-c7a86886e1b4'::uuid,
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
  '95576cea-1da2-4914-a244-dedd6d7e1d2d'::uuid,
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
  'c3d499a6-8a4c-4c59-b5ed-4c3485ac39ca'::uuid,
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
  '42845bee-bb28-4914-aa9c-f2e6f446bb7d'::uuid,
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
  '36fa35bd-f917-41bd-ad28-a9d4b7862454'::uuid,
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
  '3120f452-d1f9-40b8-a065-e393781153b6'::uuid,
  'Bogotá Beer Company (Parque 93)',
  (select id from public.categories where name = 'Bares y Rooftops'),
  'Carrera 11A #93A-94',
  'Zona Rosa',
  4.6758524,
  -74.0476984,
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
  'bc76b097-9447-4cf7-bb7d-b7491b164910'::uuid,
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
  '4f4c1fdf-8853-43a6-8fd3-63daecb6e1c2'::uuid,
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
  'e49683ab-1399-4709-b314-074f3bd4a50b'::uuid,
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
  '0f66063f-fba5-43c3-a38e-1db954ce72c7'::uuid,
  'Museo del Oro',
  (select id from public.categories where name = 'Cultura y Museos'),
  'Carrera 6 #15-88',
  'Candelaria',
  4.6005881,
  -74.0726955,
  0.0,
  8000.0,
  '{"mar_sab": "09:00-17:00", "dom": "10:00-17:00"}'::jsonb,
  'Museo del Banco de la República dedicado a la orfebrería y otras colecciones arqueológicas prehispánicas de Colombia. Entrada gratuita los domingos. Cerrado los lunes.',
  array['museo', 'entrada_gratis_domingo'],
  false,
  'https://www.banrepcultural.org/bogota/museo-del-oro/programa-tu-visita',
  '2026-08-12'::timestamptz
);

-- Fila 12: Museo Nacional de Colombia
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '870d7a6a-1fa4-4d65-b5c7-a3e83c52c0e7'::uuid,
  'Museo Nacional de Colombia',
  (select id from public.categories where name = 'Cultura y Museos'),
  'Carrera 7 #28-66',
  'Candelaria',
  4.5911354,
  -74.0793541,
  0.0,
  3000.0,
  '{"mar_dom": "09:00-17:00"}'::jsonb,
  'Uno de los museos más antiguos de América, con colecciones de arte, historia y arqueología de Colombia. Gratis domingos y miércoles de 3 a 5pm.',
  array['museo'],
  false,
  'https://bogota.gov.co/mi-ciudad/cultura-recreacion-y-deporte/horarios-y-precios-de-entrada-los-museos-de-bogota-foto',
  '2026-08-12'::timestamptz
);

-- Fila 13: Museo Botero
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '76271f11-8a90-4eb8-ba82-283492716c70'::uuid,
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
  '5bc3443d-42ca-456a-ab34-ed6715e620de'::uuid,
  'Museo de Arte Moderno de Bogotá (MAMBO)',
  (select id from public.categories where name = 'Cultura y Museos'),
  'Calle 24 #6-00',
  'Los Mártires',
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
  'd9dd4bb6-0162-48e4-a668-720d4f42bf17'::uuid,
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
  'bbf112fe-42f0-4e50-b4fe-919e99e5279a'::uuid,
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
  'bebab514-a999-4a08-bf30-4aefaf81c643'::uuid,
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

-- Fila 18: Parque de Usaquén
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '711ceab5-f9c3-48cf-aab3-8ff74b4c990c'::uuid,
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

-- Fila 19: Parque Recreodeportivo El Salitre
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '1090eb50-bab8-458b-92f9-636ad3118c85'::uuid,
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

-- Fila 20: Cantores Lounge
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  'b95deb6f-e3a8-4c66-90eb-7a903935d058'::uuid,
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

-- Fila 21: Relier: Juegos de Mesa
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '91582cf4-9017-4bee-a0d6-f6788da2034d'::uuid,
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

-- Fila 22: Momentino Wine Bar
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '483c2fa3-bba4-4bff-aa54-e83c70795754'::uuid,
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

-- Fila 23: Catación Pública (Usaquén)
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '8036ac7b-a9ae-4c35-bb25-a6df073c42b1'::uuid,
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

-- Fila 24: Alharaca Taller de Cerámica
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  'bcae8d22-2e68-4b0c-920a-096d44a6ea21'::uuid,
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

-- Fila 25: Bogotá Bike Tours
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '09fa2010-7347-4df3-9313-66264a1d9526'::uuid,
  'Bogotá Bike Tours',
  (select id from public.categories where name = 'Experiencias y Talleres'),
  'Carrera 3 #12-42',
  'Candelaria',
  4.5990553,
  -74.0699296,
  109000.0,
  109000.0,
  '{"salida_manana": "10:30", "salida_tarde": "13:30"}'::jsonb,
  'Tour guiado en bicicleta por el centro histórico de Bogotá, arte urbano y mercados tradicionales. No es un horario de apertura continuo: dos salidas diarias fijas, a las 10:30 a.m. y a la 1:30 p.m.',
  array['bicicleta', 'tour'],
  false,
  'https://www.bogotabiketours.com/',
  '2026-08-12'::timestamptz
);

-- Fila 26: Bendito Tejo
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '90dc0737-77a0-435e-80ae-a419ede5c0fb'::uuid,
  'Bendito Tejo',
  (select id from public.categories where name = 'Deportes y Recreación'),
  'Calle 138 #47-28',
  'Suba',
  4.7242843,
  -74.0536968,
  40000.0,
  60000.0,
  '{"mar_jue": "16:00-22:00", "vie_sab": "13:00-02:00", "dom": "13:00-20:00"}'::jsonb,
  'Cancha de tejo y bolirana con servicio de comida rápida.',
  array['tejo', 'juego_tradicional'],
  false,
  'https://benditotejo.co/',
  '2026-08-12'::timestamptz
);

-- Fila 27: Betaclimb (sede Calle 72)
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '23b8ce62-3ba5-4b97-bc4a-c41b6401bc45'::uuid,
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

-- Fila 28: Locos X Pádel
insert into public.places
  (id, name, category_id, address, locality, lat, lng, price_min, price_max, schedule, description, tags, is_mock, source, last_verified_at)
values (
  '9e609abf-f8fc-42df-9dd5-0fc73cc69e3f'::uuid,
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
