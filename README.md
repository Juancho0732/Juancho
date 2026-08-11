# Juancho — App de descubrimiento de planes (Bogotá)

App móvil que responde "¿qué puedo hacer?": el usuario describe lo que busca en lenguaje
natural (presupuesto, compañía, ubicación, ocasión) y la app recomienda lugares reales que
encajan, combinando un motor de intención por IA con un ranking determinístico sobre datos
propios (no inventados).

El análisis completo de arquitectura, modelo de datos, flujo de IA, riesgos y decisiones está
en [`docs/00-fase0-analisis.md`](docs/00-fase0-analisis.md). Este README cubre lo ya
implementado (Fases 1 a 5).

## Estado del proyecto

- ✅ **Fase 0** — Análisis y arquitectura.
- ✅ **Fase 1** — Foundation: proyecto Expo + TypeScript, navegación, sistema de diseño,
  cliente Supabase, estructura de carpetas. Las pantallas existen como placeholders; la lógica
  real (auth, datos, IA) se implementa en las fases siguientes.
- ✅ **Fase 2** — Database: esquema SQL, RLS, triggers de rating, datos MOCK y capa de queries
  tipada. Ver detalle abajo.
- ✅ **Fase 3** — Authentication: registro, login, logout, sesión persistente y protección de
  rutas. Ver detalle abajo.
- ✅ **Fase 4** — Places: lista, detalle, categorías, búsqueda con filtros y favoritos, con
  datos MOCK reales. Ver detalle abajo.
- ✅ **Fase 5** — Maps: mapa en el detalle de lugar, "Cerca de ti" en Home y cálculo de
  distancia real. Ver detalle abajo.
- ⏳ Fases 6–8 — pendientes.

## Stack

React Native + Expo + TypeScript (estricto) · Expo Router · Supabase (Postgres/Auth/Storage/Edge
Functions) · TanStack Query · Zustand · react-hook-form + zod · react-native-maps + expo-location.
Ver justificación de cada elección en `docs/00-fase0-analisis.md`.

## Requisitos

- Node.js 20+
- Cuenta de Supabase (gratuita) para tener datos reales; sin ella la app sigue arrancando pero
  las pantallas de datos no tendrán nada que mostrar
- Para iOS/Android: `expo-dev-client` (este proyecto usa `react-native-maps`, que **no** funciona
  en Expo Go — hay que compilar un dev client o usar `--platform web` para desarrollo rápido de UI)
- Para el mapa en Android: `GOOGLE_MAPS_API_KEY` (ver sección "Mapas y ubicación" más abajo). En
  iOS no hace falta — usa Apple Maps sin costo.

## Instalación

```bash
npm install
cp .env.example .env
# completa EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY (ver sección Variables de entorno)
```

## Ejecutar

```bash
npm run web        # más rápido para iterar sobre UI/navegación (react-native-web)
npm run ios         # requiere dev client / macOS
npm run android      # requiere dev client
```

## Variables de entorno

Ver `.env.example`. Resumen:

| Variable | Dónde vive | Notas |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Cliente (bundle) | Pública por diseño de Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Cliente (bundle) | Pública, protegida por Row Level Security |
| `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL` | Solo Supabase Edge Function | Nunca en el cliente |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo Supabase Edge Function | Nunca en el cliente |
| `AI_RATE_LIMIT_PER_MINUTE` | Solo Supabase Edge Function | Control de costo |
| `GOOGLE_MAPS_API_KEY` | Solo build nativo Android (`app.config.ts`) | No llega al bundle JS |

Sin `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY` la app falla al iniciar con un
error explícito (`src/services/supabase/client.ts`) en vez de fallar silenciosamente más adelante.

## Estructura del proyecto

```
app/            # rutas (Expo Router) — solo UI/navegación, sin lógica de negocio
src/
  design-system/  # tokens y theme — única fuente de verdad para estilos
  components/ui/   # primitivos reutilizables (Button, Card, Input, FormInput, Text, Screen)
  components/domain/ # componentes específicos del dominio (se van llenando por fase)
  features/
    auth/            # api (signUp/signIn/signOut), store de sesión, validación, protección de rutas
    places/          # hooks de categorías/lugares, FiltersSheet, localidades curadas
    favorites/       # hooks de favoritos (listar, alternar)
    location/        # useUserLocation (expo-location, permiso bajo demanda)
    ai-search/, reviews/ # se llenan en fases siguientes
  services/         # supabase client + queries tipadas, query client, ranking
  hooks/, types/, utils/
app.config.ts       # config de Expo (no app.json) — lee GOOGLE_MAPS_API_KEY del entorno
supabase/
  migrations/       # SQL versionado — esquema, RLS, triggers, RPCs
  seed.sql            # datos MOCK/DEMO (generado por seed/generate_seed.py)
  seed/generate_seed.py # script que produce seed.sql (reproducible, seed fijo)
  functions/ai-search/ # Edge Function de IA (Fase 7)
  tests/            # validación local de RLS sin depender de Supabase CLI/Docker
docs/             # decisiones de arquitectura
```

## Base de datos (Fase 2)

Esquema: `profiles`, `categories`, `places`, `place_images`, `reviews`, `favorites` y
`ai_search_logs` (logging de búsquedas IA). Detalle de relaciones, índices y RLS en
`docs/00-fase0-analisis.md` sección 5–6.

Decisiones tomadas al implementar (afinan el análisis de Fase 0 con casos concretos):

- **`profiles` es de lectura pública** (no solo del dueño): se necesita para poder mostrar el
  nombre del autor en las reseñas de otros usuarios. No contiene datos sensibles (el email vive
  en `auth.users`, fuera de alcance del cliente).
- **Cercanía geográfica** vía extensiones `cube`/`earthdistance` (no PostGIS) con índice GiST
  sobre `ll_to_earth(lat, lng)`.
- **Rating cacheado** (`places.rating_avg`, `places.review_count`) mantenido por un trigger
  `security definer` en cada INSERT/UPDATE/DELETE de `reviews` — evita calcular `avg()`/`count()`
  en cada listado.
- **`places`/`categories` son de solo lectura para el cliente**: sin policies de INSERT/UPDATE/DELETE,
  solo la service role (seed/futura administración) puede escribir.

### Levantar un proyecto Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com) (plan gratuito alcanza para el MVP).
2. Copiar `Project URL` y `anon public key` a tu `.env` (`EXPO_PUBLIC_SUPABASE_URL` /
   `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
3. Correr las migraciones, en orden, desde el SQL Editor del proyecto o con la Supabase CLI:
   ```bash
   # con Supabase CLI (recomendado si ya tienes el proyecto enlazado)
   supabase db push
   ```
   o pegando el contenido de cada archivo de `supabase/migrations/` (en orden de nombre) en el
   SQL Editor.
4. Cargar los datos MOCK ejecutando `supabase/seed.sql` de la misma forma. **No correr contra un
   proyecto que ya tenga datos reales** — inserta usuarios de desarrollo ficticios en
   `auth.users`.
5. Para regenerar el seed (por ejemplo, al escalar de 100 a 500 lugares — ver
   `docs/00-fase0-analisis.md` sección 6): `python3 supabase/seed/generate_seed.py > supabase/seed.sql`.

### Validar el esquema sin un proyecto Supabase (local, sin Docker)

`supabase/tests/` trae un stub mínimo de `auth.users`/`auth.uid()`/roles para poder correr las
migraciones y una batería de pruebas de RLS contra un Postgres local plano. Ver
`supabase/tests/README.md` para el paso a paso. Esto es lo que se usó para verificar que las
policies (lectura pública, aislamiento por usuario, bloqueo de escritura directa en `places`,
unicidad de reseñas) se comportan como se documentó.

## Autenticación (Fase 3)

Usa Supabase Auth directamente (email/contraseña) — sin servidor propio. Piezas:

- `src/features/auth/api.ts` — `signUp`/`signIn`/`signOut`, envuelven `supabase.auth.*`.
- `src/features/auth/store.ts` — store Zustand con la sesión actual y el estado
  (`loading` | `signedIn` | `signedOut`).
- `src/features/auth/useInitAuth.ts` — lee la sesión persistida (AsyncStorage) al arrancar y se
  suscribe a `onAuthStateChange`; se llama una sola vez en `app/_layout.tsx`.
- `src/features/auth/useProtectedRoute.ts` — según el estado de sesión, redirige: sin sesión solo
  se puede ver splash/onboarding/`(auth)`; con sesión, esas pantallas redirigen a `/home`. El
  resto de la app (tabs, detalle de lugar, recomendaciones) requiere sesión.
- `src/features/auth/validation.ts` — esquemas zod para los formularios de login/registro.

**Decisión de producto que conviene que confirmes:** por ahora la app exige cuenta para todo
excepto splash/onboarding/login/registro — no hay modo "explorar como invitado". Es la lectura
más simple del flujo que describiste (Splash → Onboarding → Login/Register → Home) y evita
construir dos rutas de datos (pública vs. autenticada) en el MVP. Si prefieres permitir explorar
lugares sin cuenta y pedir login solo para guardar favoritos/reseñas, es un cambio acotado a
`useProtectedRoute` — avísame y lo ajustamos.

El registro crea el usuario en Supabase Auth y un trigger de base de datos (Fase 2) inserta
automáticamente su fila en `profiles`. Si el proyecto de Supabase tiene activada la confirmación
por correo, el registro no deja sesión iniciada de inmediato — la pantalla lo detecta y muestra
"revisa tu correo" en vez de navegar.

## Places y favoritos (Fase 4)

Home, Search, Place Detail y Favorites ya consumen datos reales de Supabase (o del seed MOCK)
en vez de placeholders:

- **Home** — categorías (chips, tocar una navega a Search con ese filtro) y "Lugares populares"
  (`usePlaces({ limit: 10 })`, ordenado por `rating_avg`). "Cerca de ti" y "Recomendado para ti"
  siguen como placeholder: requieren geolocalización (Fase 5) y el pipeline de IA/personalización
  (Fase 7/8) respectivamente — mezclarlos con datos falsos habría sido peor que dejarlos vacíos.
- **Search** — búsqueda por texto (debounced, `name`/`description` con `ilike`) + `FiltersSheet`:
  zona (localidad curada), categoría, presupuesto (presets) y rating mínimo. Implementado como
  modal/bottom sheet sobre la propia pantalla, no como ruta separada — la simplificación de UX
  que quedó aprobada en la Fase 0.
- **Place Detail** — datos reales de `places` + `place_images`, tags, horario, rating, botón de
  favorito y mapa (Fase 5). La lista/creación de reseñas queda para la Fase 6 (por ahora solo se
  muestra el rating/conteo ya cacheado).
- **Favoritos** — `listFavoritePlaces` (join `favorites` → `places`) y toggle optimista vía
  `useToggleFavorite`, invalidando la caché de React Query.

**Simplificación deliberada, no en la lista original de filtros:** "número de personas" no quedó
como filtro de `Search`, porque no hay una columna de capacidad en `places` — es un parámetro de
*intención* de búsqueda (para la IA de la Fase 7), no un atributo del lugar. Igual con "distancia":
depende de la ubicación del usuario (Fase 5), así que el filtro de zona (localidad) cubre ese caso
por ahora.

## Mapas y ubicación (Fase 5)

- **Cercanía en la base de datos** — `supabase/migrations/20260811120008_nearby_places.sql`
  agrega una función `nearby_places(user_lat, user_lng, max_distance_km, result_limit)` expuesta
  automáticamente por Supabase como RPC (`supabase.rpc('nearby_places', ...)`). PostgREST no deja
  ordenar/filtrar por una expresión SQL arbitraria (`earth_distance`) desde la API REST normal —
  por eso es una función y no un filtro más de `listPlaces`.
- **Ubicación del usuario** — `src/features/location/useUserLocation.ts` pide el permiso de
  `expo-location` solo cuando el usuario toca "Activar ubicación" en Home (no al abrir la
  pantalla, para no sorprenderlo con un prompt de permiso apenas entra a la app).
- **Mapa en Place Detail**: `PlaceMapPreview` — dos archivos, uno por plataforma (Metro elige
  automáticamente):
  - `PlaceMapPreview.tsx` (iOS/Android): `MapView` real de `react-native-maps`. iOS usa Apple
    Maps sin costo; Android usa Google Maps y necesita `GOOGLE_MAPS_API_KEY`.
  - `PlaceMapPreview.web.tsx`: `react-native-maps` no tiene versión web. En vez de dejar un hueco
    vacío o hacer crashear el bundle web, se embebe OpenStreetMap (gratis, sin API key) — la app
    web sigue siendo solo la vía rápida de desarrollo de UI (ver "Requisitos"), el mapa real vive
    en la build nativa.

**Por qué Android necesita una API key y iOS no:** decisión ya señalada en
`docs/00-fase0-analisis.md` (riesgos técnicos) — `react-native-maps` usa el proveedor de mapas
nativo de cada plataforma; Apple Maps no requiere key, el SDK de Google Maps en Android sí. Se
pasa como variable de entorno de build (`GOOGLE_MAPS_API_KEY`, sin prefijo `EXPO_PUBLIC_`, ya que
`app.config.ts` la vuelca en `AndroidManifest.xml` al hacer `expo prebuild`/EAS Build — nunca
llega al bundle de JavaScript).

## Testing

```bash
npm test         # Jest + React Native Testing Library
npm run typecheck  # tsc --noEmit
npm run lint      # ESLint
```

Fase 3 agrega pruebas unitarias de los esquemas de validación (login/registro) y de la capa
`api.ts` con el cliente Supabase mockeado (credenciales inválidas, correo ya registrado,
confirmación de correo pendiente, etc.). Fase 4 agrega pruebas de `queries.ts` (filtros de
`listPlaces`, saneo del término de búsqueda, favoritos), y Fase 5 suma `listNearbyPlaces` (llamada
a la RPC con los parámetros correctos) y `formatDistance`/`formatCOP`/`formatPriceRange` — todo
con el cliente Supabase mockeado, sin red ni proyecto real.

`supabase/tests/rls_smoke_test.sql` (Fase 2) ahora también prueba `nearby_places` contra Postgres
real: que funcione como rol `anon` y que ningún resultado supere el radio pedido.

Además, cada fase con UI se verificó con un recorrido de Playwright contra datos reales: sin
Docker disponible en este entorno para levantar Supabase local, se armó un servidor REST mínimo
(no forma parte del repo) que habla el mismo protocolo que `supabase-js` usa contra el Postgres ya
sembrado en la Fase 2 — incluyendo el endpoint RPC para `nearby_places`. En Fase 5 se simuló
además la geolocalización del navegador (`context.setGeolocation`) para confirmar que "Cerca de
ti" pide permiso, consulta la RPC y muestra distancias reales, y que el fallback de mapa en web
(OpenStreetMap) renderiza en vez de romper el bundle.

## Próximos pasos

Fase 6 (Reviews): crear/editar/eliminar reseñas, rating y recálculo de promedio (el trigger de
Fase 2 ya lo mantiene cacheado en `places`).
