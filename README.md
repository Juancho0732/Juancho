# Juancho — App de descubrimiento de planes (Bogotá)

App móvil que responde "¿qué puedo hacer?": el usuario describe lo que busca en lenguaje
natural (presupuesto, compañía, ubicación, ocasión) y la app recomienda lugares reales que
encajan, combinando un motor de intención por IA con un ranking determinístico sobre datos
propios (no inventados).

El análisis completo de arquitectura, modelo de datos, flujo de IA, riesgos y decisiones está
en [`docs/00-fase0-analisis.md`](docs/00-fase0-analisis.md). Este README cubre lo ya
implementado (Fases 1 a 8).

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
- ✅ **Fase 6** — Reviews: crear, editar, eliminar y calificar, con recálculo de promedio. Ver
  detalle abajo.
- ✅ **Fase 7** — AI Search: input en lenguaje natural, Edge Function `ai-search` que interpreta
  la intención, la valida, consulta Supabase y rankea determinísticamente, con respaldo heurístico
  si la IA falla. Ver detalle abajo.
- ✅ **Fase 8** — Personalización: sección "Recomendado para ti" en Home basada en las señales
  reales del propio usuario (favoritos y reseñas bien calificadas), sin IA de por medio. Ver
  detalle abajo.

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
    places/          # hooks de categorías/lugares/personalización, FiltersSheet, localidades curadas
    favorites/       # hooks de favoritos (listar, alternar)
    location/        # useUserLocation (expo-location, permiso bajo demanda)
    reviews/         # validación, mutations (upsert/delete), ReviewFormSheet
    ai-search/       # types, api.ts (invoke + manejo de errores), useAiSearch
  services/         # supabase client + queries tipadas, query client, ranking
  hooks/, types/, utils/
app.config.ts       # config de Expo (no app.json) — lee GOOGLE_MAPS_API_KEY del entorno
supabase/
  migrations/       # SQL versionado — esquema, RLS, triggers, RPCs
  seed.sql            # datos MOCK/DEMO (generado por seed/generate_seed.py)
  seed/generate_seed.py # script que produce seed.sql (reproducible, seed fijo)
  functions/ai-search/ # Edge Function de IA: intención, heurística de respaldo, ranking,
                        # proveedor de IA (Anthropic), orquestación (index.ts)
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
  favorito, mapa (Fase 5) y enlace a las reseñas (Fase 6).
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

## Reseñas (Fase 6)

- **Una reseña por usuario por lugar, editable** — `upsertReview` usa `.upsert(..., { onConflict:
  'place_id,user_id' })` sobre el constraint único ya creado en Fase 2: crear y editar son la
  misma operación a nivel de base de datos. La UI decide si abre el formulario vacío ("Escribir
  reseña") o precargado (tocar "Editar" en la reseña propia) según si el usuario ya tiene una.
- **Autor visible** — `listReviewsForPlace` hace `select('*, profiles(display_name)')` (posible
  porque `profiles` es de lectura pública desde la Fase 2) para mostrar quién escribió cada
  reseña sin una consulta aparte.
- **Rating promedio** — lo recalcula el trigger de Fase 2 en cada INSERT/UPDATE/DELETE de
  `reviews`; el cliente solo invalida las queries relevantes (`reviews`, `place`, `places`,
  `nearby-places`, `favorite-places`) para que Home/Search/Detalle reflejen el nuevo promedio sin
  volver a calcularlo en el cliente.
- **Formulario** (`ReviewFormSheet`, mismo patrón de bottom sheet que `FiltersSheet`): estrellas
  (`StarRating`, reutilizado también de solo lectura para mostrar el promedio), comentario
  opcional, monto pagado opcional y ocasión (chips: amigos/pareja/familia/solo/trabajo).
- **Confirmación de borrado sin `Alert.alert`** — `Alert.alert` de React Native **no hace nada en
  react-native-web** (es un no-op ahí). Se detectó al construir esta fase, así que la confirmación
  de "Eliminar reseña" usa un `ConfirmDialog` propio (modal) en vez de `Alert`, para que también
  funcione en la vía rápida de desarrollo web.

## Búsqueda por IA (Fase 7)

Implementa el pipeline descrito en `docs/00-fase0-analisis.md` (Reglas 8 y 10): **la IA nunca es
la fuente de verdad de lugares/precios/disponibilidad**, solo interpreta la intención del usuario
y (opcionalmente) redacta la explicación final — siempre a partir de datos ya consultados en
Postgres.

```
Usuario escribe en Home → Edge Function ai-search
  1. Interpreta intención  (IA con tool-calling forzado; si falla o no hay API key -> heurística regex)
  2. Sanea/valida           (descarta cualquier campo que la IA haya inventado fuera de las listas curadas)
  3. Consulta Supabase      (candidatos reales: activos, hasta 100, filtrados por categoría si hay alta confianza)
  4. Rankea determinístico  (fórmula fija de Fase 0, la IA no decide el orden — Regla 10)
  5. Explica                (IA redacta un resumen SOLO con los datos ya obtenidos; si falla -> plantilla)
  6. Registra                (ai_search_logs: costo/uso, además sirve de límite de tasa)
```

- **`supabase/functions/ai-search/`** — Edge Function (Deno). Módulos separados y sin sintaxis
  específica de Deno donde es posible, para poder probarlos con Jest sin tener Deno instalado:
  - `intentSchema.ts` — esquema zod crudo + `sanitizeIntent()`, que normaliza localidad/ocasión
    contra las listas curadas de la app y **descarta** cualquier valor que la IA haya devuelto
    fuera de esas listas (nunca se confía en texto libre de la IA para filtrar la base de datos).
  - `heuristicParser.ts` — parser por regex/palabras clave (presupuesto, personas, localidad,
    ocasión) que sirve de respaldo cuando no hay proveedor de IA configurado o la llamada falla.
    Probado con las frases exactas del prompt maestro (`__tests__/heuristicParser.test.ts`).
  - `ranking.ts` — función pura y determinística (sin llamadas a IA ni red): pondera presupuesto
    (0.25), localidad (0.20), rating (0.20), coincidencia de intención (0.20) y confianza por
    número de reseñas (0.15). Documentada línea por línea; los pesos son la única "fórmula mágica"
    del proyecto y están centralizados en `RANKING_WEIGHTS`.
  - `aiProvider.ts` — interfaz `AIProvider` (Regla 8: cambiar de proveedor es implementar esta
    interfaz, no tocar `index.ts`) + `AnthropicProvider`, con `fetch` crudo (sin SDK) contra la
    API de Anthropic, usando tool-calling forzado (`tool_choice`) para obligar una respuesta JSON
    estructurada en vez de parsear texto libre.
  - `fallbackExplanation.ts` — arma un resumen en español solo con nombres/localidades/precios que
    ya vinieron de Postgres, para cuando la llamada de explicación a la IA falla.
  - `index.ts` — orquesta lo anterior: autentica al usuario (header `Authorization` reenviado),
    aplica el límite de tasa (`AI_RATE_LIMIT_PER_MINUTE`, cuenta filas recientes de
    `ai_search_logs` — control de costo, Regla 13), interpreta, sanea, consulta, rankea, explica y
    registra. Nunca deja al usuario sin respuesta: si la IA falla en cualquier punto, cae al camino
    heurístico/plantilla en vez de propagar el error.
- **Cliente** (`src/features/ai-search/`) — `api.ts` invoca la Edge Function con
  `supabase.functions.invoke('ai-search', { body: { query } })` y distingue los tres tipos de
  error que expone `@supabase/supabase-js` (`FunctionsHttpError` con el cuerpo real de la
  respuesta vía `error.context.json()`, `FunctionsFetchError` para fallas de red,
  `FunctionsRelayError`) para no perder el mensaje que la función sí alcanzó a construir.
  `useAiSearch` usa React Query con `staleTime` de 5 minutos — repetir la misma búsqueda de
  inmediato no vuelve a gastar una llamada a la IA (Regla 3/13).
- **UI** — el input de Home navega a `/recommendations?query=...`; esa pantalla cubre los cuatro
  estados de la respuesta: cargando, error (con botón "Buscar manualmente" hacia `/search`),
  "no entendimos, dinos más" (`needs_clarification`, mismo botón de respaldo) y éxito (explicación
  + lista de `PlaceCard` con los resultados reales, favoritos incluidos).

**Decisión que conviene confirmar:** por ahora la Edge Function corta la interpretación por IA
también para la *explicación* si ya se usó la heurística (`usedFallbackParser`), en vez de
intentar la IA solo para redactar el texto — si no pudimos confiar en la IA para entender qué
pidió el usuario, tampoco se le pide que redacte sobre esos mismos resultados; se usa la plantilla
en ambos casos. Es más conservador y barato, pero significa que un fallo puntual de la API dejará
esa búsqueda entera sin el toque "conversacional" de la IA, no solo la interpretación.

### Verificación (sandbox sin Docker/Deno/API key real)

Mismo método que las fases anteriores (servidor REST propio contra el Postgres ya sembrado, fuera
del repo) extendido para simular también la Edge Function, ya que este entorno no tiene Deno ni
una API key de Anthropic real:

- Se agregó una ruta `POST /functions/v1/ai-search` al servidor REST de verificación, que reenvía
  a un pequeño servidor Node/`tsx` que **importa directamente los módulos reales de
  `supabase/functions/ai-search/`** (`heuristicParser.ts`, `intentSchema.ts`, `ranking.ts`,
  `fallbackExplanation.ts` — los mismos que corren bajo Jest, sin reimplementar nada) y reproduce
  la orquestación de `index.ts` contra ese mismo REST de verificación.
- Esto es fiel al comportamiento real en este entorno, no una simulación aparte: como no hay
  `AI_API_KEY` configurada, `getAIProvider()` en el `index.ts` real también devuelve `null` y cae
  exactamente a `heuristicParseIntent` + `buildFallbackExplanation` — el camino que se verificó es
  el mismo que correría la función real acá.
- Lo único que la verificación simplifica (documentado, no oculto): no valida el JWT contra un
  Auth Server real (no hay GoTrue en este sandbox) — igual que la sesión falsa que
  `useInitAuth.ts` recibe temporalmente en cada fase para poder navegar la app sin backend de auth
  real. El límite de tasa y el registro en `ai_search_logs` sí corren de verdad, contra Postgres.
- Recorrido probado con Playwright: Home (input + botón "Buscar con IA") → escribir la frase del
  prompt maestro *"Tengo $50.000 y quiero salir con mis amigos en Chapinero"* → Recomendaciones
  con explicación real y 6 lugares reales rankeados; luego una búsqueda vaga
  ("Quiero hacer algo diferente este sábado.") → estado `needs_clarification` con el botón
  "Buscar manualmente". También se confirmó que, al superar `AI_RATE_LIMIT_PER_MINUTE` búsquedas
  en un minuto, las siguientes devuelven 429 en vez de seguir gastando cupo, y que cada búsqueda
  válida (incluida la que pide aclaración) deja su fila en `ai_search_logs`.

## Personalización (Fase 8)

"Recomendado para ti" en Home: una sección más, con las mismas reglas que el resto del proyecto
(Regla 10) — nada de IA ni de modelos de recomendación, es una consulta SQL determinística sobre
señales reales del propio usuario.

- **`personalized_places(result_limit)`** (`supabase/migrations/20260811120009_personalized_places.sql`)
  — función RPC (mismo mecanismo que `nearby_places` en Fase 5: PostgREST no deja construir este
  tipo de score por columnas relacionadas desde la API REST normal). Toma dos señales del usuario
  que ya llama a la función (vía `auth.uid()`, **sin** `SECURITY DEFINER` — sigue aplicando la RLS
  normal de `favorites`/`reviews`, un usuario nunca puede ver ni usar las señales de otro):
  - Lugares que marcó como favoritos.
  - Lugares que calificó con 4 o 5 estrellas (le gustaron aunque no los haya guardado).

  Con eso arma qué categorías y qué localidades le gustan (contando cuántas veces aparecen) y
  ordena el resto de lugares activos —excluyendo los que ya le gustaron— por: coincidencia de
  categoría (pesa el doble que la localidad, es más probable que a alguien le guste el mismo tipo
  de plan en otra zona que un plan distinto en la misma zona) + coincidencia de localidad, y como
  desempate, rating y número de reseñas. Documentado línea por línea en la migración.
- **`usePersonalizedPlaces(hasSignal)`** (`src/features/places/`) — solo se habilita si
  `hasSignal` es `true`. La función SQL en sí no necesita ningún favorito para funcionar (sin
  señales, simplemente cae a ordenar por rating, igual que "Lugares populares") pero mostrar la
  sección en ese caso sería fingir una personalización que no existe — así que Home solo la pide y
  la muestra cuando el usuario ya tiene al menos un favorito.

**Simplificación deliberada:** el gating de "¿hay señal?" en Home usa solo la cantidad de
favoritos (ya se consulta ahí para los corazones de cada tarjeta), no reseñas ≥4★ — aunque la RPC
sí las use para rankear una vez que ya se decidió mostrar la sección. Evita una query adicional
solo para decidir si mostrar el título; si más adelante alguien calificara lugares sin nunca
marcar un favorito, seguiría sin ver la sección hasta su primer favorito. Aceptable para el MVP,
fácil de ajustar si se vuelve un problema real.

**Verificación:** extendiendo el mismo servidor REST de verificación (Fases 2-7) para reenviar
`personalized_places` como cualquier otra RPC, con un ajuste puntual: como el shim conecta a
Postgres como superusuario (bypassa RLS) y no hay GoTrue real fijando el JWT, `auth.uid()` sería
siempre `NULL` ahí dentro. Se resolvió tomando el token del header `Authorization` tal cual y
fijándolo como `request.jwt.claim.sub` en la conexión antes de llamar a la función — con la misma
sesión falsa de verificación que usan todas las fases. Con eso, la prueba en el navegador (usuaria
Laura, con un favorito real de "Restaurantes" en Zona Rosa) mostró los 6 lugares recomendados
siendo todos de la categoría "Restaurantes", con el favorito ya guardado correctamente excluido de
la lista. `supabase/tests/rls_smoke_test.sql` suma dos pruebas contra Postgres real: que un
usuario nunca vuelva a ver su propio favorito entre sus recomendaciones, y que un usuario sin
ninguna señal (sin favoritos ni reseñas) igual reciba resultados sin que la función falle.

## Testing

```bash
npm test         # Jest + React Native Testing Library
npm run typecheck  # tsc --noEmit
npm run lint      # ESLint
```

Fase 3 agrega pruebas unitarias de los esquemas de validación (login/registro) y de la capa
`api.ts` con el cliente Supabase mockeado (credenciales inválidas, correo ya registrado,
confirmación de correo pendiente, etc.). Fase 4 agrega pruebas de `queries.ts` (filtros de
`listPlaces`, saneo del término de búsqueda, favoritos), Fase 5 suma `listNearbyPlaces` (llamada a
la RPC con los parámetros correctos) y `formatDistance`/`formatCOP`/`formatPriceRange`, y Fase 6
agrega el esquema de validación de reseñas (rating 1-5, comentario ≤500 caracteres, monto pagado
opcional) y `listReviewsForPlace`/`upsertReview`/`deleteReview` — todo con el cliente Supabase
mockeado, sin red ni proyecto real.

`supabase/tests/rls_smoke_test.sql` (Fase 2) ahora también prueba `nearby_places` contra Postgres
real: que funcione como rol `anon` y que ningún resultado supere el radio pedido.

Además, cada fase con UI se verificó con un recorrido de Playwright contra datos reales: sin
Docker disponible en este entorno para levantar Supabase local, se armó un servidor REST mínimo
(no forma parte del repo) que habla el mismo protocolo que `supabase-js` usa contra el Postgres ya
sembrado en la Fase 2 — incluyendo los endpoints RPC y `upsert`. En Fase 6 se recorrió el ciclo
completo crear → editar → eliminar una reseña, confirmando que el rating cacheado del lugar se
actualiza en pantalla en cada paso y que el diálogo de confirmación de borrado funciona en web.

## Próximos pasos

Con las Fases 0 a 8 completas, el MVP descrito en `docs/00-fase0-analisis.md` está implementado
de punta a punta (foundation, datos, auth, lugares/favoritos, mapas, reseñas, búsqueda por IA y
personalización). Ideas para después, ninguna bloqueante:

- Incorporar `ai_search_logs` (localidades/ocasiones que el usuario ya buscó) como tercera señal
  de `personalized_places`, además de favoritos y reseñas.
- Build nativo real (EAS Build) para probar el mapa de `react-native-maps` en un dispositivo/
  simulador, más allá del fallback web con OpenStreetMap.
- Sustituir el proyecto Supabase real por el hosteado (hoy todo se verificó contra el Postgres
  local del sandbox, ver "Testing") y correr `supabase secrets set` con una `AI_API_KEY` real para
  probar el camino de IA completo (no solo el heurístico) en un entorno con Deno disponible.
