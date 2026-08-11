-- Prepara `places` para poder cargar lugares reales junto a los MOCK
-- existentes (auditoría de beta-readiness, Prioridad 1). `is_mock` sigue
-- siendo la única fuente de verdad de "esto es ficticio" -- estas columnas
-- son de trazabilidad para cuando is_mock = false.
alter table public.places
  add column source text,
  add column last_verified_at timestamptz;

comment on column public.places.source is
  'De dónde salió el dato (URL verificable, o descripción específica de la '
  'fuente -- ej. "Visita presencial 2026-03-01", "Instagram oficial @lugar"). '
  'Obligatoria si is_mock = false; ver constraint places_real_data_traceable. '
  'El importador (supabase/seed/import_real_places.py) rechaza valores '
  'genéricos como "internet" o "google".';

comment on column public.places.last_verified_at is
  'Cuándo se confirmó que el dato sigue siendo correcto. Obligatoria si '
  'is_mock = false -- nunca se completa automáticamente con la fecha de '
  'importación: si no se verificó, el importador rechaza la fila.';

-- Ningún lugar marcado como real puede quedar sin fuente ni fecha de
-- verificación -- lo impide la base de datos, no solo el importador.
alter table public.places
  add constraint places_real_data_traceable check (
    is_mock = true or (source is not null and last_verified_at is not null)
  );
