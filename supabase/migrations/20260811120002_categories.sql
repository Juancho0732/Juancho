create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon text,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_select_all" on public.categories for select using (true);

-- Sin policies de insert/update/delete: solo la service role (usada por scripts de
-- seed / futura administración) puede escribir. No hay panel admin en el MVP.
