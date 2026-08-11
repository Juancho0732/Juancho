-- Registro de búsquedas por IA, para monitorear costo/calidad (Regla 3) y como
-- insumo futuro de personalización (Fase 8). Tabla aprobada como opcional en
-- docs/00-fase0-analisis.md sección 17, ítem 8.
create table public.ai_search_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  raw_query text not null,
  parsed_intent jsonb,
  result_count integer,
  created_at timestamptz not null default now()
);

create index ai_search_logs_user_id_idx on public.ai_search_logs (user_id);
create index ai_search_logs_created_at_idx on public.ai_search_logs (created_at);

alter table public.ai_search_logs enable row level security;

-- Sin policies: solo la Edge Function `ai-search` (Fase 7), que usa la service
-- role key, puede leer/escribir aquí. No se expone a clientes anon/authenticated
-- para evitar que se falsifiquen registros de uso/costo.
