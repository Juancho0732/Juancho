-- Perfil público del usuario (espejo de auth.users). No contiene datos sensibles:
-- el email y credenciales viven en auth.users, fuera de alcance del cliente.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Lectura pública: necesaria para mostrar el nombre del autor en reseñas de otros
-- usuarios. El diseño original (docs/00-fase0-analisis.md) proponía "solo su propia
-- fila"; se ajusta aquí porque bloquear la lectura habría impedido mostrar quién
-- escribió cada reseña. No hay datos sensibles en esta tabla, así que es seguro.
create policy "profiles_select_all" on public.profiles for select using (true);

create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Crea automáticamente el perfil cuando se registra un usuario en Supabase Auth.
-- security definer: corre con privilegios del dueño de la función (postgres),
-- por eso puede insertar en profiles aunque el usuario recién creado todavía no
-- tenga una fila que pase las policies de arriba.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
