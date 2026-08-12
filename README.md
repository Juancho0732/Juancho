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
- ✅ **Auditoría de beta-readiness (Prioridades 1-15)** — antes de abrir el MVP a usuarios reales
  se hizo una revisión de datos reales/seed, errores visibles, seguridad de la IA, mensajes de
  error seguros, recuperación de contraseña, errores de mutación, paginación/escalabilidad,
  validación de datos, costos de IA, CI, seguridad de configuración, salvaguarda del seed,
  rendimiento de listas y accesibilidad — todas remediadas y documentadas en sus propias secciones
  de este README. El cierre completo, con el walkthrough final de 25 puntos como beta tester,
  riesgos pendientes y qué configuración externa falta antes de invitar beta testers reales, está
  en [`docs/BETA_READINESS_FINAL.md`](docs/BETA_READINESS_FINAL.md) — **léelo antes de decidir
  abrir la beta**, distingue claramente lo probado de lo que requiere verificación manual contra
  un backend real.

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
| `AI_RATE_LIMIT_PER_MINUTE`, `AI_DAILY_LIMIT_PER_USER`, `AI_GLOBAL_RATE_LIMIT_PER_MINUTE` | Solo Supabase Edge Function | Control de costo (Prioridad 9) |
| `GOOGLE_MAPS_API_KEY` | Solo build nativo Android (`app.config.ts`) | No llega al bundle JS |

Sin `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY` la app falla al iniciar con un
error explícito (`src/services/supabase/client.ts`) en vez de fallar silenciosamente más adelante.

## Seguridad de configuración (auditoría de beta-readiness, Prioridad 11)

**Auditado, sin secretos expuestos:** se revisó todo el repositorio (archivos trackeados por git,
incluyendo el historial completo, no solo el estado actual) buscando patrones de claves reales
(API keys de Anthropic/Google, JWTs, llaves privadas) — no se encontró ninguna. Nunca se commiteó
un `.env` real, solo `.env.example` (con valores vacíos). `.gitignore` cubre `.env`/`.env*.local`.

**Cómo está separado cliente vs. servidor, y por qué es seguro así:**

- `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY` van en el bundle de la app a
  propósito — es el diseño de Supabase: la `anon key` no es secreta, la protección real es Row
  Level Security en Postgres (auditada en cada fase de este proyecto vía `rls_smoke_test.sql`). Si
  alguna tabla/RPC no tuviera RLS bien configurada, esa sí sería la vulnerabilidad real, no la
  presencia de la key en el bundle.
- `SUPABASE_SERVICE_ROLE_KEY` (bypassa RLS por completo) y `AI_API_KEY` **nunca** llegan al
  cliente: solo existen como secretos de la Edge Function (`supabase secrets set`, o el `.env`
  local de Supabase para desarrollo), leídos con `Deno.env.get(...)` dentro de
  `supabase/functions/ai-search/index.ts`. `SUPABASE_URL`/`SUPABASE_ANON_KEY` (sin el prefijo
  `EXPO_PUBLIC_`, son variables *distintas* aunque el valor final coincida con las del cliente) los
  inyecta Supabase automáticamente en el entorno de cada Edge Function — no hace falta
  configurarlos a mano.
- `GOOGLE_MAPS_API_KEY` no lleva prefijo `EXPO_PUBLIC_` a propósito: `app.config.ts` la usa solo en
  tiempo de build (`expo prebuild`/EAS Build) para generarla dentro de `AndroidManifest.xml` —
  nunca pasa por el bundle de JavaScript. Aun así, una API key de Google Maps siempre termina
  siendo visible (cualquiera puede extraerla del `.apk` compilado) — por eso la protección real no
  es ocultarla, es restringirla en Google Cloud Console (siguiente punto).

**REQUIERE CONFIGURACIÓN EXTERNA — restricción de la API key de Google Maps en Google Cloud
Console** (no se puede hacer desde este repositorio, y no se debe dejar la key sin restringir en
un build real):

1. En [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials),
   editar la API key usada como `GOOGLE_MAPS_API_KEY`.
2. **Application restrictions → Android apps**: agregar el `package name` de la app y su huella
   SHA-1 de firma (la del keystore de release, no la de debug — EAS Build la genera/gestiona si se
   usa `eas build`).
3. **API restrictions**: limitarla únicamente a "Maps SDK for Android" (la única que esta app usa
   en Android; iOS usa Apple Maps sin key, ver "Mapas y ubicación").
4. Sin esto, cualquiera que extraiga la key del `.apk` publicado podría usarla desde su propia app,
   consumiendo la cuota/facturación del proyecto de Google Cloud sin límite.

**Bloqueante para el paso anterior, y también REQUIERE DECISIÓN DEL EQUIPO:** `app.config.ts`
todavía no define `android.package` ni `ios.bundleIdentifier`, y no existe un `eas.json` con
perfiles de build. Sin un `package name` definitivo no hay nada que restringir en el paso 2 de
arriba, y tampoco se puede generar un build real (EAS Build ni `expo prebuild` lo aceptan sin
esto). Elegir el identificador de paquete (ej. `com.juancho.app`) es una decisión de branding/
producto — no se inventó uno acá a propósito, para no comprometer un identificador que después sea
difícil de cambiar (una vez publicado en las tiendas, el `package name`/`bundleIdentifier` es
prácticamente inmutable).

**CORS de la Edge Function** (`Access-Control-Allow-Origin: '*'` en
`supabase/functions/ai-search/index.ts`) — revisado, no es un hueco: la función se autentica con un
JWT en el header `Authorization`, no con cookies. CORS solo protege contra que un sitio ajeno haga
que el *navegador de la víctima* mande credenciales automáticamente (como pasa con cookies); un
`Authorization` header no se manda solo, un sitio atacante tendría que tener ya el JWT en su propio
JavaScript para reenviarlo — en ese punto CORS no agrega protección real. Restringir el origen a un
dominio fijo tampoco tiene sentido todavía: no existe un despliegue web de producción (el build web
es solo la vía rápida de desarrollo de UI, ver "Requisitos"), así que cualquier dominio que se
fijara ahora sería una suposición.

**Checklist antes de abrir la beta con un proyecto Supabase real** (hoy todo este proyecto se
verificó contra Postgres local + un REST shim de desarrollo, nunca contra Supabase real — ver cada
sección "Verificación" de este README):

- REQUIERE CONFIGURACIÓN EXTERNA — crear el proyecto Supabase real, aplicar las migraciones
  (`supabase db push` o el flujo que use el equipo), configurar los secretos de la Edge Function
  (`supabase secrets set AI_API_KEY=... AI_MODEL=... AI_RATE_LIMIT_PER_MINUTE=... AI_DAILY_LIMIT_PER_USER=... AI_GLOBAL_RATE_LIMIT_PER_MINUTE=...`).
- REQUIERE CONFIGURACIÓN EXTERNA — completar el `.env` real de la app
  (`EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY` del proyecto real) y **nunca**
  commitearlo.
- REQUIERE CONFIGURACIÓN EXTERNA — habilitar/configurar confirmación de correo y las Redirect URLs
  de recuperación de contraseña en Supabase Auth (`juancho://reset-password`, ver Prioridad 5) para
  el proyecto real.
- REQUIERE DECISIÓN DEL EQUIPO — elegir `android.package`/`ios.bundleIdentifier`, crear `eas.json`,
  obtener y restringir una API key de Google Maps real para ese package name (puntos anteriores).
- REQUIERE CONFIGURACIÓN EXTERNA — decidir si el seed MOCK se carga en el proyecto de
  staging/beta (con la salvaguarda de la Prioridad 1 ya lista) o si la beta arranca sin datos
  ficticios hasta tener lugares reales importados (Prioridad 1, `import_real_places.py`).

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
  seed.sql            # datos MOCK/DEMO (generado por seed/generate_seed.py), protegido contra correr sin querer
  seed/generate_seed.py # script que produce seed.sql (reproducible, seed fijo)
  seed/import_real_places.py # valida CSV/JSON de lugares reales y genera SQL para revisión humana
  seed/real_places.example.csv # formato esperado del CSV (sin datos reales)
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
4. Cargar los datos MOCK ejecutando `supabase/seed.sql` de la misma forma — **requiere confirmar
   explícitamente antes** (ver "Salvaguarda del seed MOCK" abajo); sin eso, el script se aborta
   solo y no cambia nada.
5. Para regenerar el seed (por ejemplo, al escalar de 100 a 500 lugares — ver
   `docs/00-fase0-analisis.md` sección 6): `python3 supabase/seed/generate_seed.py > supabase/seed.sql`.

### Salvaguarda del seed MOCK (auditoría de beta-readiness, Prioridades 1 y 12)

`supabase/seed.sql` carga datos **ficticios** — nunca debe correr contra un proyecto con usuarios
o datos reales. Antes solo había un aviso en este README; ahora el archivo se protege solo, en tres
capas:

1. **Confirmación explícita obligatoria.** El archivo se aborta (sin cambiar nada) salvo que, en
   la misma sesión/conexión, antes de correrlo, se ejecute:
   ```sql
   SET myapp.confirm_mock_seed = 'si-quiero-cargar-datos-ficticios';
   ```
2. **Bloqueo si ya hay lugares reales.** Si la base ya tiene algún lugar con `is_mock = false`, el
   seed se rechaza igual, aunque se haya confirmado — no se puede sembrar MOCK encima de datos
   reales.
3. **Bloqueo si ya hay cuentas reales, aunque todavía no haya lugares reales (Prioridad 12).** El
   chequeo #2 por sí solo dejaba un hueco real: una beta puede tener usuarios ya registrados
   (`auth.users`/`profiles` reales) usando el catálogo MOCK como contenido temporal, sin que nadie
   haya importado todavía ningún lugar real (`import_real_places.py`, más abajo) — en ese caso
   `is_mock = false` nunca se cumple, y sin este tercer chequeo el seed habría sembrado alegremente
   6 perfiles de desarrollo falsos (con emails/UUIDs fijos) encima de una base con cuentas reales.
   Ahora el seed también se rechaza si `public.profiles` tiene cualquier fila que no sea uno de los
   6 usuarios de desarrollo fijos que el propio seed define — verificado insertando un perfil con
   un UUID/email cualquiera (simulando un registro real) contra una base recién migrada y
   confirmando que el seed se frena con ese caso específico, además de re-confirmar los otros dos
   (sin confirmación, y con un lugar real ya presente) contra una base nueva de punta a punta.

Todo el archivo corre dentro de una única transacción (`begin;` ... `commit;`), así que si la
salvaguarda lanza una excepción, nada se llega a insertar — ni siquiera corriendo `psql` sin
`-v ON_ERROR_STOP=1` (que por defecto sigue ejecutando statements después de un error; sin la
transacción explícita, un error a mitad de archivo dejaría el seed a medio aplicar).

### Datos reales (auditoría de beta-readiness, Prioridad 1)

`places` tiene `is_mock` (default `true`, así siempre queda claro qué es ficticio) y dos columnas
de trazabilidad para cuando `is_mock = false`: `source` (de dónde salió el dato) y
`last_verified_at` (cuándo se confirmó que sigue siendo correcto). Un `CHECK` en la base
(`places_real_data_traceable`) impide insertar un lugar real sin ambos datos — no depende de que
la app o el importador se acuerden de validarlo.

**`supabase/seed/import_real_places.py`** valida un CSV o JSON de lugares reales (investigados a
mano — esta herramienta no inventa ni verifica que un lugar exista, solo valida formato y
trazabilidad) y, si hay filas válidas, genera un `.sql` de solo-INSERT para revisión humana. Nunca
se conecta a ninguna base de datos ni escribe nada salvo que se le pida explícitamente con
`--output`:

```bash
# Solo valida y muestra el reporte (dry run, no escribe nada)
python3 supabase/seed/import_real_places.py mis_lugares.csv

# Valida y además genera el SQL de las filas válidas, para revisar antes de aplicar
python3 supabase/seed/import_real_places.py mis_lugares.csv --output supabase/seed/real_places_import.sql

# Después de revisar el .sql a mano:
psql "$DATABASE_URL" -f supabase/seed/real_places_import.sql
```

Ver `supabase/seed/real_places.example.csv` para el formato exacto de columnas. Valida, entre
otras cosas: categoría contra las ya existentes (no crea categorías nuevas), coordenadas dentro de
un rango razonable de Bogotá, precios (`min ≤ max`, no negativos), horario, longitud de
descripción, URLs de imágenes si hay, y — como pediste explícitamente — `source` no puede ser un
término genérico como "internet" o "google" (tiene que ser una URL o describir la fuente
específica), y `last_verified_at` es obligatoria y **nunca se completa automáticamente**: si falta,
la fila se rechaza en vez de asumir que se verificó "hoy". Localidades fuera de las 6 curadas hoy
(`BOGOTA_LOCALITIES`) no bloquean la importación, solo generan una advertencia (el lugar se
importa igual, pero no aparece en el filtro de zona de Search hasta agregar la localidad a
`src/features/places/constants.ts`).

Pruebas: `python3 -m unittest supabase.seed.test_import_real_places -v` (29 casos: validación de
`source`/`last_verified_at`/categoría/coordenadas/precios/descripción/imágenes, y casos
específicos contra intentar "colar" un lugar sin verificar como si lo estuviera). La base de datos
suma dos escenarios en `supabase/tests/rls_smoke_test.sql` (18-19) confirmando el `CHECK` contra
Postgres real.

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

### Recuperación de contraseña (auditoría de beta-readiness, Prioridad 5)

Flujo estándar de Supabase Auth con PKCE (`flowType: 'pkce'` en `services/supabase/client.ts`):
el enlace de recuperación llega como `?code=...` (parámetro de query normal, igual en web y en el
deep link nativo `juancho://reset-password?code=...`) en vez de un fragmento `#access_token=...` —
más simple de leer desde `expo-router` (`useLocalSearchParams`) y no expone tokens en la URL ni en
el historial del navegador/correo.

- **`/login`** — nuevo enlace "¿Olvidaste tu contraseña?" hacia `/forgot-password`.
- **`/forgot-password`** — pide el correo y llama a `requestPasswordReset` (`features/auth/api.ts`),
  que arma el `redirectTo` con `Linking.createURL('reset-password')` (esquema propio de la app,
  `app.config.ts`) y llama a `supabase.auth.resetPasswordForEmail`. Siempre muestra el mismo
  mensaje de éxito ("si ese correo tiene una cuenta, te enviamos un enlace..."), sin importar si el
  correo existe o no — `resetPasswordForEmail` de Supabase ya está diseñado para no filtrar esa
  información, así que la UI simplemente no le agrega una diferencia que la API no tiene.
- **`/reset-password`** — recibe el `code` por query param. Al montar, lo intercambia una única vez
  por una sesión temporal (`exchangeRecoveryCode` → `supabase.auth.exchangeCodeForSession`). Si no
  hay `code`, o si el intercambio falla (enlace expirado o ya usado), muestra "Enlace no válido" con
  un link para pedir uno nuevo, en vez de un formulario que solo puede fallar. Si el intercambio
  funciona, muestra el formulario de contraseña nueva (`resetPasswordSchema`: mínimo 8 caracteres,
  confirmación debe coincidir) y llama a `updatePassword` (`supabase.auth.updateUser`) al enviar.
- **`useProtectedRoute`** — la sesión temporal que deja el intercambio de código ya cuenta como
  "signedIn" para el resto de la app; sin un caso especial, el guard de rutas expulsaría a la
  persona de `/reset-password` hacia `/home` antes de que pudiera elegir su contraseña nueva. Se
  agregó una excepción puntual para esa única pantalla — el resto de las reglas de acceso no cambia.
- Ningún catch de esta pantalla expone `error.message` (Prioridad 4): usa `logAndGetSafeMessage`
  igual que el resto de la app.

**Verificación (sandbox sin GoTrue real):** el REST shim de verificación (Fases 2-8) solo simula
`/rest/v1/*` (PostgREST), no `/auth/v1/*` — no hay un Auth Server real corriendo acá, así que el
intercambio de código nunca puede completarse de verdad en este entorno (tampoco llega un correo
real). Lo que sí se verificó en el navegador, contra el código real de la app (sin mockear nada de
`features/auth`): el enlace en Login, el formulario de `forgot-password` con su validación y sus
dos estados (éxito siempre igual, error genérico cuando la llamada de red falla), `reset-password`
sin `code` → "Enlace no válido", `reset-password` con un `code` inventado → intenta intercambiarlo
contra Supabase de verdad, falla (era de prueba), cae a "Enlace no válido" — confirmando que el
manejo de errores de extremo a extremo funciona. El formulario de contraseña nueva (validación de
mínimo 8 caracteres y de que ambas contraseñas coincidan) se verificó forzando el estado interno de
la pantalla a "código ya intercambiado" — el único paso que de verdad no se puede probar acá es la
llamada exitosa a `exchangeCodeForSession` en sí, porque requiere un GoTrue real respondiendo.

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
- **Favoritos** — `listFavoritePlaces` (join `favorites` → `places`) y toggle vía
  `useToggleFavorite`, invalidando la caché de React Query al terminar (no es optimista: la
  corrección de esa descripción y el resto del manejo de errores de esta mutación están en la
  sección de Prioridad 6, más abajo).

**Simplificación deliberada, no en la lista original de filtros:** "número de personas" no quedó
como filtro de `Search`, porque no hay una columna de capacidad en `places` — es un parámetro de
*intención* de búsqueda (para la IA de la Fase 7), no un atributo del lugar. Igual con "distancia":
depende de la ubicación del usuario (Fase 5), así que el filtro de zona (localidad) cubre ese caso
por ahora.

### Paginación y escalabilidad (auditoría de beta-readiness, Prioridad 7)

Antes de esta prioridad, Search traía como máximo 30 lugares (`listPlaces({ limit: 30 })`) sin
forma de ver el resto, y tanto Search como Favoritos y Reseñas renderizaban toda la lista con
`ScrollView` + `.map()` — funciona con 72 lugares MOCK, pero no escala a cientos/miles.

- **Search** — `usePlacesInfinite` (`src/features/places/usePlacesInfinite.ts`) usa
  `useInfiniteQuery` de React Query: cada página trae `PLACES_PAGE_SIZE` (20) lugares, y al llegar
  cerca del final de la lista (`FlatList` + `onEndReached`) se pide la siguiente. `listPlaces`
  ahora acepta `offset` y usa `.range(offset, offset + limit - 1)` en vez de `.limit()` a secas.
  `getNextPageParam` decide que no hay más páginas cuando la última trajo menos de una página
  completa — evita una consulta de conteo aparte solo para saber si "hay más".
- **Favoritos** — se cambió `ScrollView`+`.map()` por `FlatList` (virtualización) sin agregar
  paginación completa: a diferencia del catálogo de lugares, los favoritos están acotados por el
  propio comportamiento de la persona (los que ella misma guardó), no por el tamaño del catálogo.
- **Reseñas** — `listReviewsForPlace` ahora tiene un límite defensivo (200) y su pantalla también
  pasó a `FlatList`. No es paginación completa (no hace falta todavía: reseñas por lugar es una
  escala mucho menor que el catálogo completo de lugares), pero evita que un lugar muy popular
  algún día traiga miles de reseñas de una sola vez.
- **Home** — sin cambios a propósito: sus secciones ("Lugares populares", "Cerca de ti",
  "Recomendado para ti") ya eran listas cortas y acotadas a propósito (10/10/6, un dashboard con
  vistas previas, no un catálogo navegable — para eso está Search), y viven dentro de un único
  `ScrollView` de la pantalla; anidar `FlatList`s ahí sería el anti-patrón "VirtualizedList dentro
  de ScrollView" que React Native explícitamente desaconseja.

**Bug real encontrado y corregido durante la verificación de esta prioridad:** `listPlaces`
ordenaba solo por `rating_avg` (`ORDER BY rating_avg DESC`), pero esa columna no es única — en el
seed MOCK, 40 de los 72 lugares empatan en `3.33`. Sin una columna de desempate, Postgres no
garantiza el mismo orden entre dos consultas paginadas con `OFFSET`/`LIMIT` distintos, así que al
pedir la página siguiente en Search a veces se repetía un lugar que ya había aparecido (y se
saltaba otro) — con datos reales a mayor escala esto habría sido mucho más notorio. Se agregó `id`
como segundo criterio de orden (`.order('rating_avg', ...).order('id', ...)`), que sí es único, para
que el orden sea determinístico entre páginas. Encontrado gracias a una verificación real en
navegador (ver abajo), no habría aparecido con una sola página de resultados.

**Verificación en navegador:** extendiendo el REST shim de verificación (Fases 2-8) para soportar
`offset`/`limit` como los manda `supabase-js` (no hace falta el header HTTP `Range`, esta versión
de `postgrest-js` ya los manda como parámetros de query) y múltiples `.order()` encadenados. Con
eso, contra el código real de la app (sin mockear `usePlacesInfinite` ni `listPlaces`): carga
inicial de 20 tarjetas, scroll hasta el final → 40, scroll de nuevo → 60, scroll de nuevo → las 72
completas sin duplicados, y scrolls adicionales después de eso no vuelven a pedir más (`hasNextPage`
correctamente en `false`). También se confirmó que buscar por texto ("Café") sigue filtrando bien
sobre `usePlacesInfinite`. Como Search/Favoritos no dependen de sesión autenticada (`places` es de
lectura pública), esta fue una de las pocas prioridades de esta ronda que sí se pudo verificar de
punta a punta en el navegador — a diferencia de Prioridad 6, que solo se pudo cubrir con tests.

`src/features/places/__tests__/usePlacesInfinite.test.tsx` (nuevo) prueba la primera página con
`offset: 0`, que `hasNextPage` refleje si la página vino completa o no, y que `fetchNextPage` pida
el `offset` correcto. `queries.test.ts` suma casos para `range()`/`offset` y para el desempate por
`id`.

### Rendimiento de listas (auditoría de beta-readiness, Prioridad 13)

**Cambio real:** `listPlaces` (Search, "Lugares populares" de Home) pedía `select('*')` — las 19
columnas de `places`, incluyendo `description`, `tags`, `address`, `lat`/`lng`, `schedule`
(`jsonb`), `source`, `last_verified_at` y `created_at`. Ninguna de esas la usa `PlaceCard` (la
única forma en que estos resultados se muestran): confirmado con `grep` sobre `PlaceCard.tsx` y
las cuatro pantallas que lo consumen (Search, Home, Favoritos, Recomendaciones). A la escala de
"cientos/miles de lugares" que pide esta prioridad, pedir esas columnas de más en cada página de
20 resultados (Prioridad 7) es puro peso de payload sin ningún beneficio. `listPlaces` ahora pide
solo las 8 columnas que `PlaceCard` de verdad usa (`PLACE_LIST_COLUMNS` en `queries.ts`), con un
tipo nuevo (`PlaceListItem`, subconjunto de `Place`) para que quede explícito en TypeScript qué
puede confiarse que trae un resultado de lista vs. el detalle completo de un lugar
(`getPlaceById`/`Place`, sin cambios). El resto de los datos (`listNearbyPlaces`,
`listFavoritePlaces`, `listPersonalizedPlaces`, resultados de la búsqueda por IA) siguen trayendo
el `Place` completo — todos son estructuralmente compatibles con `PlaceListItem`, así que
`PlaceCard` los sigue aceptando sin ningún cambio en esas pantallas.

**Revisado, sin encontrar un problema real (para no maquillar el hallazgo con cambios que no
hacían falta):**

- **Imágenes** (`app/place/[id]/index.tsx`) — ya usa `expo-image` (no el `Image` básico de React
  Native), con caché en disco/memoria y carga diferida por defecto. La galería de un lugar es una
  lista horizontal corta y acotada (las fotos de un solo lugar a la vez, no de una lista de
  lugares), no hay ventana/virtualización que agregar ahí.
- **Home** — sus tres secciones acotadas (10/10/6, ver Prioridad 7) siguen dentro de un único
  `ScrollView`, a propósito: son vistas previas de un dashboard, no listas para virtualizar.
- **Consultas duplicadas / caché de React Query** — `queryClient` ya tiene `staleTime: 60_000`
  global (`services/query-client.ts`, sin cambios desde la Fase 1). Los `queryKey` que incluyen un
  objeto de filtros recién creado en cada render (ej. `['places', filters]` en `usePlaces`) no son
  un problema: React Query serializa el key de forma estructural para el caché, no depende de que
  el objeto sea la misma referencia entre renders — confirmado revisando cada hook de
  `src/features/places/` y `src/features/favorites/`, ninguno tiene un patrón que dispare
  refetches innecesarios.

### Accesibilidad (auditoría de beta-readiness, Prioridad 14)

Sin rediseño: los cuatro cambios de esta prioridad son props de accesibilidad y una corrección de
rol semántico, no cambios visuales ni de navegación.

- **`Input` sin label asociado al campo (`src/components/ui/Input.tsx`).** El label de arriba de
  cada campo (login, registro, reseñas, filtro de presupuesto) era solo un `<Text>` visual, sin
  ninguna relación programática con el `TextInput` de abajo — un lector de pantalla anunciaba el
  campo ("campo de texto") sin decir para qué es. Ahora `TextInput` recibe
  `accessibilityLabel={label}` por defecto, puesto antes de `{...rest}` para que un
  `accessibilityLabel` explícito pasado por quien use `Input` lo siga pudiendo pisar.
- **`StarRating` de solo lectura exponía 5 elementos sueltos (`src/components/ui/StarRating.tsx`).**
  El rating de un lugar (Search, detalle, listas de reseñas) se renderizaba como 5 `Text`
  independientes sin ningún rol/label — un lector de pantalla los recorría uno por uno
  ("estrella", "estrella", "estrella"...) sin decir el valor. Cuando no hay `onChange` (el caso de
  solo-lectura), ahora se agrupa todo en un único `View` con `accessible` +
  `accessibilityLabel={`${value} de 5 estrellas`}` y los glifos internos marcados
  `importantForAccessibility="no-hide-descendants"`, así un lector de pantalla lo anuncia como una
  sola parada con el valor ya dicho. El caso editable (formulario de reseña, con `onChange`) no
  cambió: sigue siendo 5 botones independientes, cada uno con su propio label ("1 estrella"… "5
  estrellas"), que es lo correcto para algo que se puede tocar.
- **`PlaceCard`: `<button>` anidado dentro de otro `<button>` en web
  (`src/components/domain/PlaceCard.tsx`).** La tarjeta completa tenía `accessibilityRole="button"`
  y contiene, adentro, el corazón de favoritos con su propio `accessibilityRole="button"`.
  `react-native-web` traduce `accessibilityRole="button"` a un `<button>` real de HTML, y HTML no
  permite un `<button>` dentro de otro — esto ya se había visto como advertencia de consola durante
  la verificación en navegador de la Prioridad 7 ("`<button> cannot contain a nested <button>`") y
  quedó pendiente de corregir en ese momento. Se cambió el rol de la tarjeta externa a `"link"`
  (tocarla navega al detalle del lugar, que es semánticamente lo que es) — el corazón interno sigue
  siendo `"button"`, y ya no hay anidamiento inválido. No hay ningún test que dependa del rol
  `"button"` de la tarjeta (confirmado con `grep` sobre `__tests__/`), así que el cambio no rompió
  nada.
- **Auditoría de contraste WCAG 2.1 (`src/design-system/contrast.ts` +
  `src/design-system/__tests__/contrast.test.ts`, nuevos).** Implementación desde cero (sin
  dependencias) de la fórmula estándar del W3C (luminancia relativa + relación de contraste), con
  tests que verifican cada par de color que la app realmente usa (texto principal/secundario sobre
  fondo, texto de botones, fondo del Toast, mensajes de error, corazón de favoritos). Todos pasan
  AA (4.5:1) salvo un hallazgo:
  - **RIESGO DOCUMENTADO, no corregido a propósito:** `colors.rating` (el color del glifo ★ de
    `StarRating`) sobre `colors.background` da ~2.03:1, por debajo del mínimo de 3:1 que exige WCAG
    AA para componentes gráficos/de UI. No se cambió el color acá — es una decisión de marca/diseño
    ("no cambies colores de forma arbitraria"), fuera del alcance de esta auditoría. El hallazgo
    queda registrado como un test que afirma explícitamente que el contraste sigue por debajo del
    mínimo (`toBeLessThan(3)`): si en el futuro alguien cambia `colors.rating`, ese test empieza a
    fallar y obliga a decidir conscientemente, en vez de que el hallazgo se pierda en un documento
    aparte.

**Fuera de alcance de esta prioridad, revisado sin encontrar nada que cambiar:** el resto de los
componentes interactivos (`Button`, `Chip`, `ConfirmDialog`, los `Pressable` de favoritos, filtros y
navegación) ya tenían `accessibilityRole`/`accessibilityLabel` apropiados desde que se construyeron
en fases anteriores.

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

### Validación de contenido (auditoría de beta-readiness, Prioridad 8)

Hasta esta prioridad, los límites de `reviews.comment`/`amount_paid`/`occasion` y
`profiles.display_name` (longitud, rango, valores permitidos) solo vivían en los esquemas zod del
cliente. Eso alcanza para la UI de la app, pero Supabase REST es accesible directamente con
cualquier JWT válido — nada impedía que una llamada hecha a mano se saltara `reviewFormSchema` por
completo. Mismo principio que el `CHECK` de datos reales de la Prioridad 1 (no confiar solo en una
capa): los mismos límites ahora también son `CHECK` constraints
(`supabase/migrations/20260811120011_content_validation.sql`):

- `reviews_comment_length` — `comment` opcional, pero si está presente debe tener entre 1 y 500
  caracteres sin contar espacios al borde (nunca una cadena vacía o solo espacios).
- `reviews_amount_paid_range` — `amount_paid` opcional, pero si está presente debe ser positivo y
  no superar $10.000.000 COP (tope generoso para bloquear valores absurdos/basura, no para
  restringir lugares caros reales).
- `reviews_occasion_valid` — `occasion` opcional, pero si está presente debe ser una de las cinco
  curadas (`amigos`, `pareja`, `familia`, `solo`, `trabajo`) — las mismas que ya limitaban el
  `Chip` del formulario, ahora también a nivel de base de datos.
- `profiles_display_name_length` — entre 1 y 80 caracteres sin contar espacios al borde.

El cliente (`reviewFormSchema`, `registerSchema`) se actualizó para reflejar exactamente los mismos
límites — sigue siendo la primera capa (da el error al instante, sin esperar un roundtrip), pero la
que realmente protege la integridad de los datos es la de la base de datos.

**Verificado contra Postgres real, desde cero** (no solo aplicando la migración encima de una base
ya sembrada): `createdb` nuevo → las 11 migraciones en orden → seed MOCK completo (120 reseñas, 10
perfiles) sin ningún conflicto con los `CHECK` nuevos → `rls_smoke_test.sql` con 6 escenarios
nuevos (20-24, uno con tres sub-casos) confirmando que cada límite rechaza el valor inválido y
acepta el válido. El seed ya generaba solo valores dentro de estos rangos (comentarios cortos,
montos entre $15.000-$90.000, las mismas 5 ocasiones), así que no hizo falta tocarlo.

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

### Seguridad de la IA (auditoría de beta-readiness, Prioridad 3)

Dos capas de defensa contra prompt injection, ninguna de las cuales depende de que el modelo "se
porte bien" — la premisa es que el texto libre del usuario (y, en la segunda llamada, la intención
ya interpretada) puede contener instrucciones dirigidas a la IA, y el sistema debe seguir siendo
seguro aunque el modelo las obedezca:

- **Capa 1 — prevención (delimitación + instrucción explícita).** Las dos llamadas a la IA
  (`interpretIntent`, `generateExplanation` en `aiProvider.ts`) envuelven el contenido variable en
  delimitadores explícitos (`<user_query>...</user_query>` y `<context>...</context>`) y el
  system prompt de cada una dice, en español, que ese contenido es siempre un dato para
  interpretar y nunca una orden — y que cualquier frase dentro de los delimitadores que parezca una
  instrucción ("ignora las instrucciones anteriores", "actúa como", etc.) debe tratarse como texto
  a analizar, no obedecerse. `category_hint`/`activity_preference` (los únicos campos de texto
  libre que la IA puede reinyectar en el segundo prompt) además quedan limitados a 60 caracteres en
  `intentSchema.ts`, para reducir el espacio disponible para reinyectar instrucciones largas.
- **Capa 2 — detección (`explanationValidator.ts`).** Si a pesar de la capa 1 el modelo devolviera
  una explicación comprometida, `isExplanationSafe()` la revisa antes de mostrarla, con
  exactamente 4 chequeos deliberadamente acotados (no es un verificador semántico general):
  afirmaciones categóricas no respaldadas ("el mejor", "sin duda", "garantizado"...), cifras de
  precio que no calzan con los resultados reales (tolerancia 0.5x-2x del rango real, o cualquier
  cifra si ningún resultado tiene precio), nombres propios que no corresponden a ningún lugar/
  localidad de los resultados reales, y contenido reputacional negativo no respaldado ("cerrado",
  "estafa", "peligroso"...). Si la explicación no pasa, o si la llamada a la IA falla por cualquier
  motivo, se usa `buildFallbackExplanation()` (100% determinística, sin IA, arma el texto solo con
  los datos que ya vinieron de Postgres) — el principio explícito es preferir una explicación
  genérica y segura a una más "inteligente" pero potencialmente falsa.

**Riesgo residual documentado (no cubierto por la capa 2):** características/amenidades inventadas
que no son ni una afirmación categórica, ni un precio, ni un lugar inexistente, ni contenido
reputacional negativo (ejemplo probado en `aiSecurity.test.ts`: "Este lugar tiene una piscina
espectacular" pasa la validación de salida). Este caso depende solo de la capa 1. Ampliar la capa 2
a un chequeo de features/amenidades no estaba en el alcance aprobado para esta prioridad.

Lo que **no** cambió (a propósito): el ranking (`ranking.ts`) sigue siendo una función pura y
determinística que la IA nunca toca, y `results` sigue viniendo exclusivamente de la consulta real
a `places` en Postgres — la IA interpreta intención y (opcionalmente) redacta texto, nunca decide
qué lugares aparecen ni en qué orden (Regla 10).

`supabase/functions/ai-search/__tests__/aiSecurity.test.ts` prueba las 7 frases de ataque de la
auditoría contra las dos capas (que queden delimitadas como dato en la capa 1, y que una salida
comprometida hipotética se rechace en la capa 2), más dos búsquedas legítimas de punta a punta para
confirmar que la defensa no rompe el uso normal.

### Control de costos de IA (auditoría de beta-readiness, Prioridad 9)

Antes de esta prioridad solo existía `AI_RATE_LIMIT_PER_MINUTE` (por usuario, por minuto) — protege
contra un abuso rápido y evidente desde una cuenta, pero deja dos huecos reales:

1. **Una sola cuenta podía sostener el límite 24 horas al día.** Con el default de 5/minuto, hasta
   7200 búsquedas por IA en un día desde un único usuario.
2. **El costo agregado no tenía techo con muchos usuarios legítimos a la vez.** 1000 personas
   buscando 4 veces por minuto cada una ya son 4000 llamadas a la IA por minuto, sin ningún límite
   que lo frene.

`supabase/functions/ai-search/rateLimiter.ts` (nuevo) agrega los dos límites que faltaban, sin
tocar la arquitectura: `checkRateLimit()` es una función pura (sin red/DB) que recibe tres
contadores y decide si la búsqueda pasa, en este orden — por usuario/minuto (`AI_RATE_LIMIT_PER_MINUTE`,
default 5), por usuario/día (`AI_DAILY_LIMIT_PER_USER`, default 50) y global/minuto
(`AI_GLOBAL_RATE_LIMIT_PER_MINUTE`, default 60) — devolviendo un mensaje genérico y seguro
(Prioridad 4) distinto para cada caso, sin exponer detalle interno. `index.ts` pide los tres
conteos en paralelo (`Promise.all`, mismas consultas `count: 'exact', head: true` contra
`ai_search_logs`, ya indexada por `user_id` y `created_at` desde la Fase 7 — no hizo falta ninguna
migración nueva) y le pasa el resultado a `checkRateLimit()`.

**Riesgo residual documentado, no resuelto (no amerita más complejidad para una beta):** el
conteo de "búsquedas recientes" depende de que cada búsqueda se haya registrado con éxito en
`ai_search_logs`. Si ese `insert` falla (el código ya lo tolera sin romper la búsqueda del usuario:
`if (logError) console.error(...)`, nunca `throw`), esa búsqueda específica no cuenta para el
límite — el límite se vuelve *menos* efectivo en ese caso puntual, pero no desaparece (sigue
exigiendo que la consulta de conteo funcione en cada intento, y cualquier búsqueda sí registrada
sigue contando). Resolverlo de forma robusta (ej. un contador atómico independiente del insert)
sería exactamente el tipo de complejidad de "sistema de billing" que esta prioridad pidió
explícitamente evitar.

Se mantiene sin cambios, a propósito: el fallback heurístico (`heuristicParseIntent`/
`buildFallbackExplanation`, sin IA) sigue siendo el camino cuando la IA falla, y el ranking
(`ranking.ts`) sigue siendo 100% determinístico — los límites de costo son una capa antes de llegar
a la IA, no tocan lo que pasa después.

`supabase/functions/ai-search/__tests__/rateLimiter.test.ts` (nuevo, 6 casos) prueba `checkRateLimit`
de forma aislada: permite cuando los tres contadores están bajo el límite, bloquea por cada límite
por separado (usuario/minuto, usuario/día, global/minuto) con el mensaje correspondiente, confirma
el orden de evaluación cuando los tres límites se superan a la vez, y confirma que justo por debajo
de cada límite la búsqueda sigue pasando.

### Errores internos (auditoría de beta-readiness, Prioridad 4)

Ningún catch de la app le muestra al usuario el mensaje crudo de un error — puede traer detalle
interno (nombre de tabla/constraint de Postgres, el cuerpo de una respuesta de error de la API de
Anthropic, mensajes de un módulo nativo) o venir en inglés en una app en español (los mensajes de
`supabase-js`, por ejemplo, llegan sin traducir):

- **Cliente** — `src/utils/errors.ts` exporta `logAndGetSafeMessage(context, error, fallback)`:
  registra el error real en consola (equivalente local de "log de servidor" para una app cliente,
  mismo patrón que ya usaba `ai-search/index.ts`) y siempre devuelve el mensaje genérico que cada
  pantalla ya tenía definido — nunca `error.message`. Aplicado en los cinco lugares donde un catch
  mostraba el mensaje crudo: `login.tsx`, `register.tsx`, `profile.tsx` (cierre de sesión),
  `place/[id]/reviews.tsx` (guardar reseña) y `useUserLocation.ts`.
- **Edge Function** — `ai-search/index.ts` tenía un caso que exponía el mensaje crudo de
  `AIProviderError` al cliente cuando el error escapaba del catch general (el cuerpo de texto
  completo de una respuesta de error de la API de Anthropic, con su código HTTP). En el flujo actual
  ese caso ya no era alcanzable en la práctica (ambas llamadas a la IA ya atrapan sus propios
  errores y caen a la heurística/plantilla), pero se corrigió igual: el catch general ahora siempre
  devuelve el mismo mensaje genérico, sin importar el tipo de error, para que quede así también si
  el código cambia más adelante. El error real se sigue registrando completo con `console.error`
  (logs de la función, no de la respuesta al cliente).

`src/utils/__tests__/errors.test.ts` prueba que `logAndGetSafeMessage` nunca deja pasar el mensaje
crudo (incluido un caso con un mensaje de constraint de Postgres real) y que sí registra el error
original en consola.

### Errores en mutaciones (auditoría de beta-readiness, Prioridad 6)

Auditoría de todas las mutaciones de la app (`useMutation`/`mutate`/`mutateAsync`): favoritos,
crear/editar reseña, eliminar reseña, autenticación. Dos huecos reales encontrados y corregidos —
ninguno de los otros (login/registro/perfil/recuperación de contraseña/guardar reseña) tenía este
problema, ya estaban bien manejados desde las Prioridades 4 y 5.

- **Favoritos (`useToggleFavorite`) fallaba en silencio.** El corazón se togglea con `.mutate(...)`
  (fire-and-forget) desde seis pantallas distintas (Home ×3 secciones, Search, Favorites,
  Recomendaciones, Detalle) y ninguna leía el estado de error de la mutación — si la llamada
  fallaba, el corazón simplemente no cambiaba y la persona no se enteraba de nada. Como no hay un
  lugar natural en una tarjeta de lista para un mensaje de error inline, se agregó un toast global
  mínimo (`src/components/ui/Toast.tsx` + `toastStore.ts`, montado una vez en `app/_layout.tsx`) y
  un `onError` en el propio hook que llama a `useToastStore.getState().showToast(...)` con un
  mensaje genérico (nunca `error.message`, mismo patrón que `logAndGetSafeMessage`). Al ser un solo
  hook compartido, arregla las seis pantallas a la vez sin tocarlas. No hay estado optimista que
  revertir: la UI solo refleja el favorito cuando la mutación realmente termina bien.
- **Eliminar reseña (`handleConfirmDelete` en `place/[id]/reviews.tsx`) no atrapaba errores.** Era
  un `await deleteReview.mutateAsync(...)` sin try/catch: si fallaba, la promesa quedaba rechazada
  sin manejar, `setDeleteTarget(null)` nunca se ejecutaba y la persona se quedaba sin saber si
  eliminar funcionó o no (solo podía cerrar el diálogo con "Cancelar", sin ninguna pista de qué
  pasó). Se envolvió en try/catch con `logAndGetSafeMessage`, y `ConfirmDialog` ganó dos props
  nuevas para este caso: `isConfirming` (deshabilita ambos botones y cambia la etiqueta mientras la
  eliminación está en curso) y `errorMessage` (si falla, el diálogo se queda abierto mostrando el
  motivo en vez de cerrarse solo o desaparecer sin explicación).

Ningún otro `useMutation` de la app (`useUpsertReview`) tenía este problema: ya se llamaba con
`mutateAsync` dentro de un try/catch que mostraba el error (Prioridad 4).

`src/components/ui/__tests__/Toast.test.tsx`, `ConfirmDialog.test.tsx` y
`src/features/favorites/__tests__/useToggleFavorite.test.tsx` (nuevos) cubren los tres casos:
mensaje mostrado y auto-ocultado, diálogo deshabilitado/con error, y que un fallo real de
`addFavorite`/`removeFavorite` termina en un toast genérico, no en un error silencioso.

**Verificación visual pendiente (documentado, no maquillado):** este cambio no se pudo probar en
vivo en el navegador de este sandbox. Los flujos de favoritos/reseñas requieren una sesión
autenticada real dentro de `supabase-js` (no solo en el store de la app) para que las llamadas a
`supabase.from(...)` lleven el `Authorization` correcto — y `supabase.auth.setSession()` exige un
`access_token` con forma de JWT válido y decodificable, cosa que este entorno no puede generar sin
un GoTrue real (a diferencia de fases anteriores, donde alcanzaba con leer datos públicos o forzar
el `Authorization` crudo contra el REST shim). La lógica quedó cubierta con tests de componente/hook
en su lugar; falta la confirmación visual de extremo a extremo contra un proyecto Supabase real.

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

### CI (auditoría de beta-readiness, Prioridad 10)

`.github/workflows/ci.yml` corre en cada push y cada pull request (sin restringir a una rama —
todavía no existe `main` en este repo), con dos jobs independientes:

- **`lint-typecheck-test`** — `npm ci`, `npm run lint` (ESLint), `npm run typecheck` (`tsc
  --noEmit`) y `npm test` (Jest). Real y bloqueante: cualquiera de los tres falla el job.
- **`migrations-and-seed`** — levanta un `postgres:16` como servicio, aplica
  `supabase/tests/00_local_stub.sql` (simula `auth.*`/roles de Supabase en Postgres plano) y las
  migraciones en orden, y carga el seed MOCK completo — todo con `ON_ERROR_STOP=1`. También es
  real y bloqueante: si una migración tiene un error, o si un `CHECK` constraint nuevo (como los de
  las Prioridades 1 y 8) rechaza algo que el propio seed genera, este job falla. De hecho ya sirvió
  de verificación para esta misma prioridad: al escribir el workflow se probaron a mano los mismos
  comandos contra un Postgres local con auth por contraseña (para imitar el servicio de CI) antes
  de confiar en que funcionaran.

**Qué queda fuera de la ejecución automática, y por qué (para no simular una CI que no prueba
nada):**

- **`rls_smoke_test.sql` sí corre dentro del job `migrations-and-seed`, pero solo de forma
  informativa** — su salida completa queda en el log de cada corrida, pero el step nunca falla el
  job. El archivo usa `\set ON_ERROR_STOP off` a propósito: varios de sus 24 escenarios *esperan*
  un error de Postgres como resultado correcto (ej. "RLS debe bloquear esto"), pensado para que una
  persona lo revise a simple vista, no como asserts con pass/fail real. Convertirlo en algo
  auto-verificable exigiría reescribirlo con bloques `BEGIN/EXCEPTION` tipo pgTAP — fuera del
  alcance de esta prioridad, y sigue siendo necesario revisarlo a mano antes de un deploy real.
- **Nada que dependa de una API key de IA real, de GoTrue/Auth real, o de un proyecto Supabase
  real** — no hay forma de correr esto en CI sin secretos reales pagos, y no corresponde inventar
  una simulación que parezca cubrir la IA sin probarla de verdad. `supabase/functions/ai-search/`
  sí tiene cobertura real en el job de Jest (todos sus módulos puros: `heuristicParser`, `ranking`,
  `rateLimiter`, `explanationValidator`, `aiSecurity`, etc.) — lo que no se puede probar en CI es
  la Edge Function corriendo de verdad en Deno contra Anthropic.
- **Los recorridos de Playwright contra el navegador** (mencionados arriba, en cada fase con UI) se
  hicieron a mano con herramientas fuera del repo durante el desarrollo — no están automatizados en
  CI. Automatizarlos exigiría además un backend real corriendo (Supabase o el REST shim) dentro del
  runner de CI, que es una inversión mayor a la pedida para esta prioridad.

**Bug real encontrado y corregido al construir esta prioridad:** `package-lock.json` tenía una
entrada transitiva faltante (`json-schema-traverse@0.4.1`, requerida por una versión resuelta de
`ajv` que a su vez no cumplía el rango que pedía `@hookform/resolvers`) — `npm ci` fallaba con eso,
lo que habría roto el job de CI antes de llegar siquiera a correr un test. No era un problema nuevo:
ya estaba en el `package-lock.json` commiteado, heredado de fases anteriores; una `npm ci` real
(la que hace CI, no `npm install`) lo habría revelado en cualquier momento. Se corrigió con
`npm install` (repara el lock file, no cambia ningún rango de versión en `package.json`) y se
verificó que `npm ci` y la suite completa (Jest/tsc/eslint) siguen funcionando igual después.

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
