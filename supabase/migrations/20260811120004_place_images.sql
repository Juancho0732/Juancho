create table public.place_images (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index place_images_place_id_idx on public.place_images (place_id);

alter table public.place_images enable row level security;

create policy "place_images_select_all" on public.place_images for select using (true);
