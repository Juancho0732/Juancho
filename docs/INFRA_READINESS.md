# Preparación de infraestructura para beta real

Auditoría técnica de todo lo que el repositorio necesita para conectarse a infraestructura real
(Supabase real, builds nativos, mapas) y arrancar una beta cerrada. Complementa
[`docs/BETA_READINESS_FINAL.md`](BETA_READINESS_FINAL.md) (que audita comportamiento de producto)
con la parte de **infraestructura/configuración**: qué puede prepararse desde el código y qué
requiere una acción humana fuera de este repositorio.

**No hay ningún proyecto Supabase real ni cuenta EAS conectados a este entorno** — se verificó
explícitamente (sin `supabase` CLI instalado, sin `config.toml`, sin credenciales en el entorno,
`eas whoami` devuelve "Not logged in"). Todo lo de este documento se preparó y verificó contra
Postgres local + Postgres real (una base nueva por prueba, nunca reutilizada) y contra el propio
`eas-cli`/`expo` en modo local — nunca contra un servicio de Supabase o Expo/EAS hospedado.

Etiquetas: **HECHO**, **PENDIENTE**, **REQUIERE CONFIGURACIÓN EXTERNA**, **REQUIERE DECISIÓN
HUMANA**.

---

## 1. Infraestructura Supabase

### Migraciones — orden y qué hace cada una

**HECHO.** 13 migraciones en `supabase/migrations/`, con nombre `YYYYMMDDHHMMSS_descripcion.sql`
— el orden de aplicación es alfabético (= cronológico por el prefijo), y así las aplican tanto
`supabase db push` como el job de CI:

| # | Archivo | Qué hace |
|---|---------|----------|
| 1 | `20260811120000_extensions.sql` | Extensiones de Postgres necesarias (`pg_trgm`, `earthdistance`/`cube`, `pgcrypto`) |
| 2 | `20260811120001_profiles.sql` | Tabla `profiles` + trigger que la crea automáticamente al registrarse (`on_auth_user_created`) |
| 3 | `20260811120002_categories.sql` | Tabla `categories` (esquema, sin datos — los datos los agrega la migración 13) |
| 4 | `20260811120003_places.sql` | Tabla `places` + RLS de solo lectura |
| 5 | `20260811120004_place_images.sql` | Tabla `place_images` |
| 6 | `20260811120005_reviews.sql` | Tabla `reviews` + trigger de recálculo de `rating_avg`/`review_count` |
| 7 | `20260811120006_favorites.sql` | Tabla `favorites` + RLS (cada usuario solo ve/edita las suyas) |
| 8 | `20260811120007_ai_search_logs.sql` | Tabla `ai_search_logs` (control de costo de IA, Prioridad 9) |
| 9 | `20260811120008_nearby_places.sql` | RPC `nearby_places` (cercanía geográfica) |
| 10 | `20260811120009_personalized_places.sql` | RPC `personalized_places` (recomendaciones, Fase 8) |
| 11 | `20260811120010_places_real_data_fields.sql` | Columnas `source`/`last_verified_at` en `places` (trazabilidad de datos reales, Prioridad 1) |
| 12 | `20260811120011_content_validation.sql` | 4 `CHECK` constraints de validación de contenido (Prioridad 8) |
| 13 | `20260811120012_seed_reference_categories.sql` | **Nueva en esta auditoría** — inserta las 10 categorías reales (ver hallazgo abajo) |

**Hallazgo real corregido en esta auditoría:** las 10 categorías (`Restaurantes`, `Cafés`, etc.)
solo se insertaban dentro de `supabase/seed.sql` — el mismo archivo con datos MOCK (lugares y
usuarios ficticios) que un proyecto real **nunca debe correr**. Eso significaba que un proyecto
Supabase real que aplicara solo las migraciones (lo correcto) se quedaba sin categorías: sin ellas,
Home no tiene chips que mostrar, Search no tiene por qué filtrar, y el importador de lugares reales
no tiene ninguna categoría contra la cual resolver cada fila (su `select id from categories where
name = ...` no encontraría nada, y el `INSERT` de cada lugar quedaría con `category_id = null` sin
ningún error visible). Se corrigió agregando la migración 13, que inserta las categorías con
`on conflict (slug) do nothing` (segura de correr más de una vez). `generate_seed.py`/`seed.sql`
se actualizaron en paralelo (mismo `on conflict`) para que el flujo de desarrollo local (migraciones
+ seed MOCK) siga funcionando exactamente igual.

**Verificado en esta sesión, contra una base Postgres nueva:**
- Solo migraciones (sin seed) → 10 categorías, 0 lugares, 0 usuarios, 0 reseñas. Exactamente el
  estado en el que debería quedar un proyecto Supabase real recién creado.
- El `.sql` que genera el importador de lugares reales (`import_real_places.py`) se aplicó sin
  error contra esa misma base (solo-migraciones) e insertó el lugar de prueba correctamente
  vinculado a su categoría real.
- Migraciones + seed MOCK (flujo de desarrollo) sigue funcionando igual: 10 categorías (0
  insertadas por el seed, ya estaban), 6 usuarios de desarrollo, 72 lugares, 120 reseñas.
- `supabase/tests/rls_smoke_test.sql` (24 escenarios) — mismo resultado que siempre (10 errores
  esperados, 0 inesperados).

### Edge Functions

**HECHO — auditado.** Una sola Edge Function: `supabase/functions/ai-search/`.

| Variable | Categoría | Quién la configura |
|---|---|---|
| `SUPABASE_URL` | Auto-provista | Supabase la inyecta sola en cada Edge Function desplegada |
| `SUPABASE_ANON_KEY` | Auto-provista | Ídem |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provista (desplegada) / **SECRETA** si se corre local | Auto-provista al desplegar; si se usa `supabase functions serve` local, hay que ponerla a mano en un `.env` local, nunca commiteado |
| `AI_PROVIDER` | Config (no secreta) | `supabase secrets set` — hoy solo implementado `anthropic` |
| `AI_API_KEY` | **SECRETA** | `supabase secrets set` |
| `AI_MODEL` | Config | `supabase secrets set` |
| `AI_RATE_LIMIT_PER_MINUTE` | Config | `supabase secrets set` (default en código: 5) |
| `AI_DAILY_LIMIT_PER_USER` | Config | `supabase secrets set` (default en código: 50) |
| `AI_GLOBAL_RATE_LIMIT_PER_MINUTE` | Config | `supabase secrets set` (default en código: 60) |

Ver `.env.example` (actualizado en esta auditoría) para la misma tabla con más contexto de cada
variable, y la sección 2 de este documento para la clasificación PUBLIC/BUILD ONLY/SERVER ONLY
completa (incluye también las variables del cliente y de build nativo).

### Configuración de Auth necesaria

**REQUIERE CONFIGURACIÓN EXTERNA** (nada de esto existe todavía porque no hay proyecto real):

1. **Redirect URLs** (Authentication → URL Configuration): agregar `juancho://reset-password`
   (y, si en algún momento hay una versión web real, su URL equivalente). Sin esto, Supabase
   rechaza/ignora el `redirectTo` que manda `requestPasswordReset` (`src/features/auth/api.ts`) por
   seguridad — el flujo de recuperación de contraseña no funcionaría contra el proyecto real hasta
   configurarlo. Ver sección 5 (deep links) para el detalle completo del flujo.
2. **Site URL**: definir uno (puede ser un valor provisional si no hay web real todavía) — Supabase
   lo usa como fallback en varios flujos de Auth.
3. **Confirmación de email**: decidir si el registro requiere confirmar el correo antes del primer
   login (`signUp` en `src/features/auth/api.ts` ya maneja los dos casos —
   `needsEmailConfirmation` — así que ambas opciones funcionan del lado del código; es una decisión
   de producto, no técnica).
4. **Plantillas de email**: las de Supabase por defecto funcionan (usan `{{ .ConfirmationURL }}`
   con el `redirectTo` correcto), pero no tienen la marca de Juancho — decisión de branding, no
   bloqueante para una beta cerrada.

### Qué sigue dependiendo de un proyecto Supabase real

**REQUIERE CONFIGURACIÓN EXTERNA**, ninguno se puede resolver desde este repositorio:
- Crear el proyecto (elegir región — Supabase no tiene una en Colombia; la más cercana geográficamente suele ser la de us-east o sa-east según disponibilidad, decisión del equipo).
- Aplicar las 13 migraciones (`supabase db push` o el flujo que use el equipo).
- Configurar los secretos de la Edge Function (tabla de arriba).
- Configurar Auth (punto anterior).
- **Nunca correr `supabase/seed.sql` contra ese proyecto** — ver sección 8.

---

## 2. Variables de entorno

**HECHO.** `.env.example` reescrito en esta auditoría con las tres categorías explícitas (PUBLIC,
BUILD ONLY, SERVER ONLY) y sin ningún valor real — solo nombres y, donde aplica, un default no
sensible (ej. `AI_RATE_LIMIT_PER_MINUTE=5`). Resumen:

| Variable | Categoría | Dónde se usa |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | PUBLIC | `src/services/supabase/client.ts` — bundle de la app |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | PUBLIC | Ídem — protegida por RLS, no por secreto |
| `GOOGLE_MAPS_API_KEY` | BUILD ONLY | `app.config.ts` — solo en tiempo de `expo prebuild`/EAS Build, nunca en el bundle JS |
| `AI_PROVIDER` | SERVER ONLY (config) | Edge Function `ai-search` |
| `AI_API_KEY` | SERVER ONLY (**secreta**) | Ídem |
| `AI_MODEL` | SERVER ONLY (config) | Ídem |
| `AI_RATE_LIMIT_PER_MINUTE` | SERVER ONLY (config) | Ídem |
| `AI_DAILY_LIMIT_PER_USER` | SERVER ONLY (config) | Ídem |
| `AI_GLOBAL_RATE_LIMIT_PER_MINUTE` | SERVER ONLY (config) | Ídem |
| `SUPABASE_SERVICE_ROLE_KEY` | SERVER ONLY (**secreta**, auto-provista al desplegar) | Ídem — ver nota en sección 1 |

Ninguna clave privada está ni estuvo nunca en código cliente — confirmado de nuevo en esta
auditoría con una búsqueda sobre todo el árbol trackeado por git (no solo el estado actual, el
historial completo), sin resultados.

---

## 3. Expo / EAS — preparación para builds nativos

**HECHO — preparado, con placeholders explícitos donde falta una decisión humana:**

- `app.config.ts`: agrega `ios.bundleIdentifier` y `android.package` = `com.example.juancho`.
  **Es un placeholder, no un identificador real** — `com.example.*` es lo que el propio Expo usa
  para "sin definir todavía". Sirve para generar builds de prueba (confirmado, ver sección 4) pero
  **no debe usarse para publicar en ninguna tienda ni para restringir la API key de Google Maps en
  Google Cloud Console**. También agrega `extra.eas.projectId` con el valor
  `"PENDIENTE-correr-eas-init"` — no se puede generar un ID real sin una cuenta EAS (sección 4).
- `eas.json` (nuevo): perfiles `development` (cliente de desarrollo, distribución interna),
  `preview` (distribución interna para beta testers — instalable directo en Android, TestFlight
  interno en iOS) y `production` (`autoIncrement` activado, para cuando se suba a las tiendas).
  **Validado con el schema real de `@expo/eas-json`** (la misma librería que usa `eas-cli`) de
  forma completamente offline, sin necesitar login — ver sección 4 para cómo.

**REQUIERE DECISIÓN HUMANA:**
- El `bundleIdentifier`/`package` definitivo (branding/producto — una vez publicado en una tienda,
  es prácticamente imposible de cambiar).

**REQUIERE CONFIGURACIÓN EXTERNA:**
- Una cuenta Expo/EAS, `eas login`, y `eas init` (o el primer `eas build`) para obtener el
  `projectId` real y reemplazar el placeholder.

---

## 4. Capacidad de build

**HECHO — hasta donde se puede sin credenciales humanas:**

- `eas-cli` (21.8.0) está disponible vía `npx` en este entorno.
- `eas.json` se validó **offline** contra el schema Joi real que usa `eas-cli` internamente
  (`@expo/eas-json`), cargándolo directamente con Node — sin red, sin login, y por lo tanto sin
  depender de que el servicio de EAS esté disponible: es válido según la misma versión de la
  librería que usa el CLI instalado.
- `npx expo config --type public` confirma que `app.config.ts` se resuelve sin errores, con los
  valores esperados (`bundleIdentifier`, `package`, `extra.eas.projectId`, la config de Google
  Maps, etc.)
- **Se generó un build de prueba real, pero solo local y en una copia aislada del repo** (nunca en
  el árbol de trabajo real, para no dejar carpetas `android/`/`ios/` generadas en el repo): `expo
  prebuild` corrió sin errores y produjo proyectos Android y iOS nativos válidos, con
  `applicationId 'com.example.juancho'` en `android/app/build.gradle` y
  `PRODUCT_BUNDLE_IDENTIFIER = "com.example.juancho"` en el proyecto de Xcode — confirma que toda
  la cadena de configuración (identificadores, plugin de `expo-location`, config de Google Maps)
  es válida y produce un resultado consistente.

**REQUIERE CONFIGURACIÓN EXTERNA (credenciales humanas) — detenido exactamente acá:**
- `eas whoami` → `Not logged in`. Cualquier comando que hable con el servicio de EAS (`eas
  config`, `eas build`, `eas init`) pide una cuenta Expo: `eas login` (interactivo) o la variable
  `EXPO_TOKEN` (para CI) — ninguna de las dos existe en este entorno, y no se inventó ninguna.
- Un build real completo (`eas build --platform android`) corre en la nube de EAS y también
  necesita, además del login: el `projectId` real (sección 3) y, para Android, credenciales de
  firma (EAS puede generarlas/gestionarlas automáticamente la primera vez que se corre, con
  confirmación interactiva).
- Un build **local** (sin EAS, con Android Studio/Xcode instalados) no se intentó — este entorno no
  tiene Android SDK ni Xcode, y no es el flujo que usa el proyecto (no hay carpetas `android/`/
  `ios/` versionadas, es un proyecto 100% managed).

**Qué debe hacer el usuario para el primer build real:**
1. `npx eas-cli login` (con una cuenta Expo del equipo).
2. `npx eas-cli init` — vincula el proyecto y completa `extra.eas.projectId` en `app.config.ts`
   automáticamente.
3. Reemplazar `com.example.juancho` por el identificador definitivo (decisión humana, sección 3).
4. `npx eas-cli build --platform android --profile development` (o `preview`) para el primer build
   instalable.

---

## 5. Deep links — recuperación de contraseña de punta a punta

**HECHO — auditado, cadena completa revisada:**

```
forgot-password.tsx (usuario pide el reset)
  -> requestPasswordReset() en features/auth/api.ts
  -> supabase.auth.resetPasswordForEmail(email, { redirectTo: Linking.createURL('reset-password') })
       redirectTo real (nativo) = "juancho://reset-password"
  -> Supabase manda el email con un link a: {redirectTo}?code=XXXX
  -> el usuario toca el link -> el sistema operativo abre la app directo (scheme "juancho"
     registrado en app.config.ts; expo-router resuelve la ruta solo, sin config de linking
     manual -- confirmado, no hay ningún archivo de "linking config" en app/_layout.tsx)
  -> app/(auth)/reset-password.tsx lee ?code= con useLocalSearchParams()
  -> exchangeRecoveryCode(code) -- PKCE (services/supabase/client.ts, flowType: 'pkce') --
     intercambia el code por una sesión de recuperación (nunca se trata como login normal)
  -> formulario de nueva contraseña -> updatePassword() -> router.replace('/home')
```

Todo el código de esta cadena ya está escrito, probado (Fase 5/Prioridad 5) y verificado
visualmente en navegador (capturas `pw5-01`…`pw5-09`, ver `docs/BETA_READINESS_FINAL.md`).

**Por qué el esquema custom (`juancho://`) es la elección correcta acá, y no requiere
configuración extra de la tienda:** a diferencia de los *universal links*/*app links* basados en
`https://` (que necesitan verificar un dominio con `apple-app-site-association`/
`assetlinks.json`), un esquema custom lo asocia el propio sistema operativo con la app instalada
en cuanto está instalada — no hace falta ningún dominio propio ni archivo de verificación. La
contrapartida (aceptable para una beta cerrada) es que el link no hace nada útil si la persona
todavía no tiene la app instalada; para una beta cerrada eso es aceptable, los testers ya van a
tener la app.

**REQUIERE CONFIGURACIÓN EXTERNA (Supabase, proyecto real):**
- Agregar `juancho://reset-password` a **Authentication → URL Configuration → Redirect URLs**. Sin
  esto, Supabase no va a redirigir ahí — el flujo se rompe silenciosamente contra el proyecto real
  aunque todo el código esté correcto (ya se probó exhaustivamente contra el shim de desarrollo,
  pero esa validación de Supabase no existe en el shim, así que no se pudo detectar/reproducir
  acá).

**PENDIENTE (verificación manual, no se puede hacer en este sandbox):** abrir el link real de un
correo de recuperación en un dispositivo con la app instalada, contra el proyecto Supabase real,
una vez esté configurado el punto anterior.

---

## 6. Google Maps

**HECHO — auditado, sin cambios necesarios en el código (ya estaba bien diseñado):**

| Plataforma | Proveedor | ¿Necesita API key? |
|---|---|---|
| iOS | Apple Maps (default de `react-native-maps` sin `provider` explícito) | No |
| Android | Google Maps (`react-native-maps` en Android siempre requiere Google Maps SDK) | Sí — `GOOGLE_MAPS_API_KEY` |
| Web | OpenStreetMap embebido (`PlaceMapPreview.web.tsx`, fallback propio) | No |

Confirmado revisando `PlaceMapPreview.tsx` (sin `provider` prop → default por plataforma) y
`app.config.ts` (`android.config.googleMaps.apiKey`, nada equivalente para iOS). Verificado también
en la prueba de `expo prebuild` de la sección 4: sin `GOOGLE_MAPS_API_KEY` en el entorno, el plugin
de `react-native-maps` simplemente **omite** el tag `<meta-data>` de la API key en
`AndroidManifest.xml` en vez de dejar uno vacío/roto — comportamiento seguro por defecto.

**REQUIERE CONFIGURACIÓN EXTERNA (Google Cloud Console) — no se puede hacer desde el repo, y no se
inventó ninguna key ni restricción:**

1. Obtener una API key de Google Maps (Google Cloud Console → APIs & Services → Credentials →
   Create Credentials → API key).
2. **Credentials → (la key) → Application restrictions → Android apps**: agregar el `package name`
   real (una vez decidido, sección 3) y la huella SHA-1 del keystore de **release** (no la de
   debug). Con EAS Build, el keystore lo puede gestionar el propio EAS.
3. **Credentials → (la key) → API restrictions → Restrict key**: dejar marcada únicamente "Maps
   SDK for Android" — ninguna otra API de Google que este proyecto no use.
4. Poner esa key como secreto `GOOGLE_MAPS_API_KEY` (build-only, ver sección 2) — nunca en un
   `.env` commiteado, y solo se necesita en la máquina/servicio que hace el build (EAS Build la
   toma de sus propias variables de entorno configuradas en el dashboard de EAS, no de este repo).

**Bloqueante para el paso 2:** requiere el `package name` definitivo (sección 3, decisión humana
pendiente) — con el placeholder `com.example.juancho` se puede restringir igual "por ahora" para
probar, pero habría que volver a restringir con el definitivo antes de publicar.

---

## 7. Datos reales — importador

**HECHO — auditado a fondo, sin bugs encontrados, un hallazgo estructural corregido (sección 1).**

`supabase/seed/import_real_places.py`: nunca se conecta a ninguna base de datos, no pide ni
necesita credenciales — lee un CSV/JSON, valida cada fila, y (opcional) escribe un `.sql` de solo
`INSERT` para que un humano lo revise y lo aplique a mano. Valida exactamente los campos pedidos:

| Campo | Validación |
|---|---|
| `name` | Obligatorio, máximo 200 caracteres |
| `category` | Obligatorio, debe matchear (por nombre o slug) una categoría **ya existente** — nunca crea categorías nuevas |
| `address` | Obligatorio, máximo 300 caracteres |
| `locality` | Obligatorio; si no está en la lista curada actual, advertencia (no bloquea) — no aparecería en el filtro de zona hasta agregarla a `src/features/places/constants.ts` |
| `lat`/`lng` | Numéricos, dentro de un rectángulo generoso alrededor de Bogotá (atrapa coordenadas invertidas/basura) |
| `price_min`/`price_max` | Numéricos, no negativos, `min <= max` |
| `schedule` | JSON o formato corto `grupo=HH:MM-HH:MM;...`; advierte (no bloquea) si un valor no tiene forma de horario |
| `description` | Entre 20 y 1000 caracteres |
| `images` | Opcional, URLs http(s) separadas por `\|` o array JSON |
| `source` | Obligatorio, URL o descripción específica — rechaza términos genéricos ("internet", "google", "chatgpt", etc.) |
| `last_verified_at` | Obligatorio, fecha ISO, nunca futura, **nunca se completa automáticamente** |

**Verificado en esta sesión:**
- 29/29 tests unitarios (`python3 -m unittest test_import_real_places -v`) pasan.
- Corrida real contra `supabase/seed/real_places.example.csv` (dry-run y con `--output`): genera
  el `.sql` esperado, con `is_mock = false` y `source`/`last_verified_at` trazables.
- Ese `.sql` generado se aplicó contra una base con solo las 13 migraciones (sin seed MOCK, el
  escenario real de producción) — insertó correctamente, con la categoría bien resuelta gracias a
  la migración 13 (sección 1).

**No se encontró ningún bug que corregir en el importador en sí** — ya estaba bien diseñado y
probado desde la Prioridad 1. El único problema real relacionado era estructural (categorías
ausentes en un proyecto sin seed), corregido en la sección 1.

**No se generaron ni cargaron datos reales** — el `.example.csv` usado para probar tiene valores
explícitamente marcados `EJEMPLO — REEMPLAZAR`, y la fila de prueba insertada en esta sesión fue
solo contra una base de verificación descartable, nunca contra `supabase/seed.sql` ni contra
ningún proyecto real.

---

## 8. MOCK vs. producción

**HECHO — auditado, ya tenía 3 capas robustas (Prioridades 1 y 12), sin gaps de seguridad nuevos
encontrados:**

1. Frase de confirmación explícita (`SET myapp.confirm_mock_seed = '...'`) en la misma
   sesión/conexión — no es algo que corra "sin querer".
2. Se aborta si ya existe algún lugar real (`is_mock = false`).
3. Se aborta si ya existe algún perfil que no sea uno de los 6 usuarios de desarrollo fijos del
   propio seed (cubre el caso de una beta con usuarios reales registrados pero sin lugares reales
   todavía).

Las tres siguen intactas; el único cambio de esta auditoría (mover las categorías a una migración,
sección 1) no las toca ni las debilita — se verificó que el seed sigue abortando en los mismos 3
escenarios (repetido contra una base fresca en esta sesión).

**RECOMENDACIÓN (proceso, no código):** usar proyectos Supabase **separados** para desarrollo/
staging y para producción, y no guardar la cadena de conexión ni la `service_role key` de
producción en ningún lugar donde `generate_seed.py`/`seed.sql` puedan aplicarse por accidente
(ej. un `psql $DATABASE_URL` copiado y pegado contra el proyecto equivocado). Ninguna salvaguarda
a nivel de base de datos puede proteger contra apuntar deliberadamente al proyecto equivocado —
eso es un control de proceso del equipo, no algo que se resuelva con más código.

---

## 9. Observabilidad

**HECHO (lo que ya existe y es razonable para una beta) + PENDIENTE/RECOMENDACIÓN documentados
explícitamente — no se construyó ningún sistema nuevo, se auditó qué ya hay y dónde mirar:**

### Ya existe (HECHO)

- **Cliente:** `logAndGetSafeMessage(context, error, fallback)` (`src/utils/errors.ts`) es el punto
  central de manejo de errores desde la Prioridad 4 — usado de forma consistente en auth, reseñas,
  favoritos, ubicación, perfil. Cada error real va a `console.error` con un contexto identificable
  (`'signIn:'`, `'upsertReview:'`, etc.); el usuario nunca ve el detalle crudo.
- **Edge Function `ai-search`:** cada rama de error (`interpretIntent` falla, `generateExplanation`
  falla, no se pudo registrar `ai_search_logs`, error inesperado) ya tiene su propio
  `console.error` con contexto. Supabase captura automáticamente todo `console.log`/`console.error`
  de una Edge Function desplegada — visible sin configuración adicional en **Dashboard → Edge
  Functions → ai-search → Logs**, o con `supabase functions logs ai-search`.
- **Base de datos/Auth/API:** Supabase también expone sus propios logs sin configuración adicional
  — **Dashboard → Logs** (Postgres, Auth, API/PostgREST). Cubre errores de RLS, constraints
  violados, fallos de autenticación, etc.

### Blind spot real (PENDIENTE)

- **Cliente, en un build instalado real:** `console.error` solo es visible mientras alguien está
  conectado por Metro/el dev client. Una vez que un beta tester tiene la app instalada (build
  `preview`/`production`), el equipo **no tiene ninguna visibilidad remota** de errores que le
  pasen a esa persona — ni crashes, ni errores de red, ni nada — salvo que la persona los reporte a
  mano.

### RECOMENDACIÓN (no implementada a propósito)

Agregar un SDK de crash/error reporting (ej. Sentry, con su integración oficial para Expo) es la
solución estándar para el blind spot de arriba — pero **no se implementó en esta auditoría**
porque: (a) requiere crear una cuenta/proyecto en un servicio externo y un DSN, que es exactamente
el tipo de credencial que no se debía inventar; (b) trae consideraciones de privacidad (qué datos
de usuario terminan en un servicio de terceros) que son una decisión de producto, no solo técnica;
y (c) el pedido explícito de esta auditoría es "NO construyas un sistema empresarial de
observabilidad". Queda como una recomendación concreta y accionable, no como código a medio
terminar.

---

## 10. Analytics — eventos mínimos propuestos

**PENDIENTE — solo documentado, nada implementado a propósito** (mismo motivo que la sección 9:
"NO implementes analytics invasivos", y cualquier SDK de analytics real necesita una cuenta/
credencial externa que no se debía inventar).

Lista mínima para saber si el producto funciona, sin necesidad de tracking invasivo (todos son
eventos de producto, no de comportamiento/perfilado):

| Evento | Cuándo | Por qué importa |
|---|---|---|
| `signup` | Registro completado | Adopción |
| `login` | Login exitoso | Retención/actividad |
| `search` | Búsqueda con filtros (Search) | Uso del flujo principal no-IA |
| `ai_search` | Búsqueda por lenguaje natural completada | Uso del flujo de IA (ya genera un registro en `ai_search_logs` — ver nota abajo) |
| `place_view` | Se abre el detalle de un lugar | Qué lugares generan interés real |
| `favorite_added` | Se marca un lugar como favorito | Señal de interés fuerte |
| `review_created` | Se publica una reseña | Contenido generado por usuarios |
| `recommendation_clicked` | Se toca un resultado de "Recomendado para ti" o de búsqueda por IA | Si la personalización/IA realmente lleva a acción |

**Nota importante:** `ai_search_logs` (tabla ya existente, Prioridad 9) ya registra cada búsqueda
por IA con `user_id`, `raw_query`, `parsed_intent` y `result_count` — para el evento `ai_search`
específicamente, **ya hay HECHO** suficiente para un análisis básico (cuántas búsquedas, con qué
resultado) sin agregar nada nuevo. Los demás eventos de la tabla no tienen ningún registro
equivalente todavía.

**RECOMENDACIÓN:** para una beta cerrada con pocos usuarios, el camino más simple y menos invasivo
es probablemente una tabla propia en Supabase (ej. `product_events`, con RLS para que cada usuario
solo pueda insertar sus propios eventos) en vez de un SDK de analytics de terceros — evita otra
cuenta/credencial externa y mantiene los datos donde ya está todo lo demás. Es una decisión de
producto/equipo, no algo que se debiera decidir unilateralmente en una auditoría técnica.
