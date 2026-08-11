# Validación local del esquema (sin Supabase CLI / Docker)

Estos scripts permiten validar migraciones, seed y políticas RLS contra un
Postgres local plano, simulando lo mínimo de Supabase (`auth.users`,
`auth.uid()`, roles `anon`/`authenticated`/`service_role`). Útil quando no hay
Docker disponible para correr `supabase start`.

`00_local_stub.sql` **no se aplica nunca a un proyecto Supabase real** — ahí
`auth.*` y los roles ya existen de forma nativa y este script fallaría o
sería redundante.

## Uso

```bash
createdb juancho_test
psql -d juancho_test -v ON_ERROR_STOP=1 -f supabase/tests/00_local_stub.sql
for f in supabase/migrations/*.sql; do
  psql -d juancho_test -v ON_ERROR_STOP=1 -f "$f"
done
psql -d juancho_test -v ON_ERROR_STOP=1 -f supabase/seed.sql

# batería de pruebas de RLS (lectura pública, aislamiento por usuario,
# bloqueo de escritura directa en `places`, unicidad de reseñas, etc.)
psql -d juancho_test -f supabase/tests/rls_smoke_test.sql
```

Cada bloque de `rls_smoke_test.sql` indica en el `\echo` qué debería pasar;
revisar la salida para confirmar que coincide (ej. "NO puede insertar" debe
mostrar un `ERROR: new row violates row-level security policy`).

Limpieza: `dropdb juancho_test`.
