# Fase 0 — Análisis (sin código)

App de descubrimiento de planes/lugares — Bogotá, Colombia. MVP.

Este documento es la entrega de Fase 0. No se ha escrito código de la aplicación todavía. Está pendiente de tu aprobación (ver sección 17) antes de iniciar Fase 1.

---

## 1. Arquitectura propuesta

Arquitectura de 3 capas, con Supabase haciendo de backend completo (sin servidor propio):

```
┌─────────────────────────────┐
│   App móvil (Expo / RN)     │  UI + estado local + llamadas a Supabase
└───────────────┬──────────────┘
                │  (anon key, protegido por RLS)
┌───────────────▼──────────────┐
│         Supabase             │
│  ┌─────────────────────────┐ │
│  │ Postgres (datos, RLS)   │ │
│  ├─────────────────────────┤ │
│  │ Auth                    │ │
│  ├─────────────────────────┤ │
│  │ Storage (imágenes)      │ │
│  ├─────────────────────────┤ │
│  │ Edge Functions (Deno)   │◄┼── única capa con acceso a la API key de IA
│  │  - ai-search             │ │  (nunca vive en el cliente)
│  └─────────────────────────┘ │
└───────────────┬──────────────┘
                │
        ┌───────▼────────┐
        │  Proveedor IA   │  (Anthropic / OpenAI / otro — intercambiable)
        └─────────────────┘
```

**Decisión clave:** usar **Supabase Edge Functions** como backend para IA, en vez de levantar un servidor Node/Express aparte. Razón: ya necesitamos Supabase para auth/DB/storage; añadir otro servicio duplica infraestructura, aumenta costo y superficie de mantenimiento sin beneficio real para el MVP (Regla 13: evitar infraestructura/servicios duplicados). La API key de IA vive solo como secreto de la Edge Function, nunca en el bundle de la app. Esto requiere tu aprobación explícita (ítem #1 en sección 17) porque compromete el stack a Deno/TypeScript para esa pieza.

La app **no llama al proveedor de IA directamente**. Todo pasa por la Edge Function, que también es la única que puede tocar la base de datos con privilegios elevados cuando haga falta (el resto del acceso a datos va con la anon key + RLS).

---

## 2. Stack tecnológico recomendado

| Capa | Elección | Motivo |
|---|---|---|
| App móvil | React Native + Expo (managed, con dev client) + TypeScript estricto | Confirmado, adecuado. Expo acelera setup, OTA updates, EAS Build. |
| Navegación | Expo Router (file-based) | Estándar actual de Expo, menos boilerplate que React Navigation manual. |
| Estado servidor | TanStack Query | Cache, revalidación, loading/error states sin reinventar. |
| Estado cliente ligero | Zustand (solo si hace falta: p.ej. filtros activos) | Evita Redux/boilerplate innecesario. |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions) | Confirmado, adecuado para MVP. |
| Validación | Zod (cliente y Edge Functions) | Un único sistema de validación, tipado compartido. |
| Formularios | react-hook-form | Ligero, evita re-renders innecesarios. |
| Mapas | `react-native-maps` (gratuito) + `expo-location` | Ver justificación en sección de riesgos/costos más abajo. No se usa Google Places ni Mapbox en el MVP. |
| Distancia geográfica | Extensión `cube` + `earthdistance` de Postgres | Suficiente para una sola ciudad; PostGIS sería sobreingeniería en esta fase. |
| IA | Capa de abstracción propia (`AIProvider`), implementación inicial sugerida: Claude Haiku (Anthropic) por costo/latencia | Intercambiable sin tocar el resto de la app (Regla 8). |
| Imágenes | `expo-image` | Cache y performance mejor que `Image` de RN. |
| Testing | Jest + React Testing Library (RN) | Estándar, suficiente para MVP. E2E (Detox/Maestro) se difiere. |
| Lint/format | ESLint + Prettier + TypeScript strict | Calidad de código (sección 16). |

### Sobre mapas — análisis explícito

Pediste evaluar Google Maps vs Mapbox sin asumir Google por defecto. Mi conclusión: **ninguno de los dos es necesario en el MVP como API de pago.**

Nuestros lugares ya tienen `lat`/`lng` guardados en nuestra base de datos (no dependemos de buscar direcciones de terceros). Lo que realmente necesitamos es:
1. Mostrar un mapa con marcadores → `react-native-maps` lo hace gratis (usa Apple Maps en iOS, Google Maps SDK en Android — la SDK de mapa base de Google tiene tier gratuito amplio).
2. Saber dónde está el usuario → `expo-location` (GPS del dispositivo, gratis, sin API externa).
3. Calcular distancia a un lugar → fórmula Haversine, la resolvemos en Postgres con `cube`/`earthdistance`, sin llamar a ninguna API.

Solo necesitaríamos Google Places o Mapbox Geocoding si quisiéramos **autocompletar direcciones que el usuario escribe libremente** (p. ej. "estoy en la Cra 15 # 85-20"). Eso no está en el alcance del MVP (el usuario da su ubicación por GPS o elige una localidad de una lista curada). Si más adelante lo necesitamos, mi recomendación sería Mapbox Geocoding por su tier gratuito más generoso y pricing más predecible que Google Places.

**Nota de riesgo de desarrollo:** `react-native-maps` requiere código nativo, por lo que **no funciona en Expo Go** — se necesita `expo-dev-client` / EAS Build desde el principio. Esto es una decisión que afecta el flujo de desarrollo (ítem #5 en sección 17).

---

## 3. Estructura de carpetas

```
/
├── app/                              # Expo Router — rutas/pantallas
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (onboarding)/index.tsx
│   ├── (tabs)/
│   │   ├── home.tsx
│   │   ├── search.tsx
│   │   ├── favorites.tsx
│   │   └── profile.tsx
│   ├── place/[id].tsx
│   ├── place/[id]/reviews.tsx
│   └── _layout.tsx
├── src/
│   ├── design-system/
│   │   ├── tokens.ts              # colores, espaciado, radios, tipografía
│   │   └── theme.ts
│   ├── components/
│   │   ├── ui/                    # Button, Card, Input, RatingStars, Badge...
│   │   └── domain/                # PlaceCard, ReviewItem, SearchBar, FilterSheet...
│   ├── features/
│   │   ├── auth/
│   │   ├── places/
│   │   ├── ai-search/
│   │   ├── reviews/
│   │   └── favorites/
│   ├── services/
│   │   ├── supabase/              # cliente + queries tipadas
│   │   └── ranking/                # función de scoring, pura y testeable
│   ├── hooks/
│   ├── types/
│   └── utils/
├── supabase/
│   ├── migrations/                 # SQL versionado
│   ├── functions/
│   │   └── ai-search/              # Edge Function (interpretar intención + explicar)
│   └── seed/                       # datos MOCK, claramente marcados
├── docs/                            # este documento y futuras decisiones
├── .env.example
├── app.config.ts
├── package.json
└── tsconfig.json
```

Organización por *feature* (no por tipo de archivo puro) para que cada módulo sea fácil de ubicar y de crecer sin volverse un archivo gigante (sección 16).

---

## 4. Diagrama conceptual de arquitectura

```
[Usuario] 
   │ texto libre / filtros
   ▼
[App RN] ──(anon key + RLS)──► [Supabase Postgres] ──► lugares, categorías, reviews, favoritos
   │
   │ "quiero algo barato en Chapinero"
   ▼
[Edge Function: ai-search]
   │
   ├─► (1) IA interpreta intención → JSON estructurado y validado (Zod)
   ├─► (2) Query a Postgres con esos parámetros (filtros reales, no IA)
   ├─► (3) Ranking determinístico (función pura, sin IA) ordena candidatos
   ├─► (4) IA genera explicación usando SOLO los datos de los resultados obtenidos
   ▼
[App RN] ◄── { intención detectada, resultados reales, explicación breve }
```

La IA nunca toca la base de datos directamente ni inventa resultados: solo transforma texto→parámetros, y luego datos→explicación. Los datos de verdad siempre vienen de Postgres.

---

## 5 y 6. Modelo de base de datos y relaciones

Diseño normalizado, sin tablas innecesarias. RLS activado en todas las tablas de usuario.

```
profiles (1) ──< favorites >── (1) places
   │                                │
   │                                ├──< place_images
   │                                ├──< reviews >── (1) profiles
   │                                └── (N:1) categories
```

### `profiles`
Espejo de `auth.users`, para datos públicos/editables del usuario.
- `id uuid PK` (= `auth.users.id`)
- `display_name text`
- `avatar_url text null`
- `created_at timestamptz default now()`

### `categories`
- `id uuid PK`
- `name text unique`
- `slug text unique`
- `icon text null`

### `places`
- `id uuid PK`
- `name text not null`
- `description text`
- `category_id uuid FK → categories`
- `tags text[]` — características libres (ej. `{pet_friendly, outdoor, live_music}`), evita una tabla many-to-many innecesaria para el MVP
- `address text`
- `locality text` — localidad de Bogotá (Chapinero, Usaquén, etc.), indexado
- `lat double precision`, `lng double precision`
- `price_min numeric`, `price_max numeric` — rango por persona, en COP
- `schedule jsonb` — horarios por día
- `rating_avg numeric default 0` — **cacheado**, actualizado por trigger al crear/editar/borrar reviews
- `review_count int default 0` — cacheado, mismo motivo
- `status text default 'active'` — `active | inactive | pending`
- `is_mock boolean default true` — marca explícita de dato ficticio (Regla 1, sección 6)
- `created_at timestamptz default now()`

### `place_images`
- `id uuid PK`
- `place_id uuid FK → places`
- `url text`
- `position int default 0`

### `reviews`
- `id uuid PK`
- `place_id uuid FK → places`
- `user_id uuid FK → profiles`
- `rating int check (1-5)`
- `comment text`
- `amount_paid numeric null`
- `occasion text null` — para qué tipo de plan fue (date, amigos, familia...)
- `created_at`, `updated_at`
- **Constraint único** `(place_id, user_id)` — un usuario, una reseña por lugar (puede editarla, no duplicarla). Necesita tu confirmación (ítem #10).

### `favorites`
- `user_id uuid FK → profiles`
- `place_id uuid FK → places`
- `created_at`
- PK compuesta `(user_id, place_id)`

### `ai_search_logs` (propuesta, opcional)
- `id`, `user_id null`, `raw_query text`, `parsed_intent jsonb`, `result_count int`, `created_at`
- Sirve para monitorear costo/calidad de la IA (Regla 3) y para futura personalización (Fase 8). Bajo costo de mantenimiento. Pido tu confirmación porque es una tabla adicional a las que listaste (ítem #8).

### Índices propuestos
- `places(locality)`, `places(category_id)`, `places(status)`
- `places(lat, lng)` vía `cube`/`earthdistance` para búsquedas por cercanía
- `reviews(place_id)`, `favorites(user_id)`
- Índice GIN `pg_trgm` sobre `places(name, description)` para búsqueda por texto simple (fallback sin IA)

### Row Level Security (resumen)
- `places`, `categories`, `place_images`: **SELECT público** (incluso anónimo), **INSERT/UPDATE/DELETE solo service role** (no hay creación de lugares por usuarios en el MVP).
- `reviews`: SELECT público; INSERT/UPDATE/DELETE solo si `auth.uid() = user_id`.
- `favorites`: SELECT/INSERT/DELETE solo si `auth.uid() = user_id`.
- `profiles`: usuario puede leer/editar solo su propia fila.

---

## 7. Flujo completo de IA

1. Usuario escribe en lenguaje natural en Home.
2. App llama a la Edge Function `ai-search` (nunca al proveedor de IA directamente).
3. **Interpretación:** la IA recibe el texto + un *system prompt* que fuerza salida estructurada (tool-calling / structured output), devolviendo únicamente un JSON con forma conocida:
   ```json
   {
     "people": 2,
     "budget_total": 120000,
     "location": "Usaquén",
     "occasion": "date",
     "activity_preference": "different",
     "category_hint": null
   }
   ```
4. **Validación:** el JSON se valida con Zod en el servidor. Campos inválidos o fuera de rango se descartan (no se confía ciegamente en la salida del modelo).
5. **Consulta real:** con los parámetros validados se construye una query a Postgres (filtros de presupuesto, localidad/distancia, categoría, estado activo).
6. **Ranking:** función determinística (sección 8) ordena los candidatos. La IA no decide el orden.
7. **Selección:** se toman los top N (5–8) resultados reales.
8. **Explicación:** segunda llamada a la IA, con *system prompt* explícito: "usa únicamente los datos entregados abajo, no inventes nombres, precios ni datos", pasando solo los campos reales de esos N resultados.
9. Respuesta al cliente: `{ intent, results, explanation }`.

**Manejo de errores / ambigüedad:** si la extracción falla o quedan campos críticos vacíos (ej. no se detecta presupuesto ni ubicación), la función no inventa valores — devuelve una bandera `needs_clarification` con una pregunta corta, o cae a una búsqueda heurística simple (keywords conocidas: montos con "$", localidades de Bogotá, "amigos/pareja/familia/solo") para no dejar al usuario sin resultados.

**Control de costo:** rate limit por usuario (ej. N búsquedas IA/minuto), prompts cortos (solo se envían los N resultados ya filtrados, nunca la base completa), sin llamadas a IA para nada que no sea interpretar intención o explicar resultados.

---

## 8. Sistema inicial de ranking

Función pura, testeable, sin IA, con pesos centralizados y documentados (no mágicos):

```
score = w_budget   * budgetFit
      + w_distance * distanceFit
      + w_rating   * ratingScore
      + w_reviews  * reviewConfidence
      + w_intent   * intentMatch      (categoría/ocasión/tags vs. intención)
```

Cada sub-score normalizado a 0–1. Pesos iniciales propuestos (ajustables en un solo archivo `ranking/weights.ts`, con comentario de por qué):

| Factor | Peso inicial | Justificación |
|---|---|---|
| Ajuste a presupuesto | 0.25 | Es el filtro más mencionado en los ejemplos del usuario |
| Distancia | 0.20 | Relevante pero secundario a presupuesto |
| Rating | 0.20 | Señal de calidad |
| Coincidencia con intención (categoría/ocasión/tags) | 0.20 | Relevancia semántica |
| Confianza por volumen de reseñas | 0.15 | Evita que un lugar con 1 reseña de 5★ opaque a uno con 200 reseñas de 4.5★ |

Estos pesos son un **punto de partida documentado, no una verdad definitiva** — se ajustarán con datos reales de uso (Regla: no fijar pesos arbitrarios sin documentarlos, cumplida).

---

## 9. Flujo de usuario

```
Splash → Onboarding (solo primera vez) → Login/Register
   → Home ("¿Qué quieres hacer?" + categorías + populares/cercanos)
      → [Búsqueda IA en lenguaje natural]  ó  [Explorar/Filtrar manualmente]
   → Resultados / Recomendaciones
   → Detalle de lugar (fotos, mapa, reviews, favorito)
   → Reseñas (leer / escribir)
   → Perfil (favoritos, cuenta)
```

Objetivo de UX: de "no sé qué hacer" a "encontré un plan" en el menor número de toques — el buscador de IA en Home es el camino corto; explorar/filtrar es el camino alterno para quien prefiera navegar.

---

## 10. Pantallas necesarias

Las 13 que listaste, confirmadas: Splash, Onboarding, Login, Register, Home, Search, Filters, Recommendations, Place Detail, Reviews, Favorites, Profile.

**Sugerencia de simplificación (necesita tu aprobación, ítem #7):** implementar **Filters como bottom sheet/modal sobre Search**, no como pantalla de navegación separada. Reduce un paso de navegación y encaja con el objetivo de la sección 11 ("evitar demasiados filtros/pantallas"), sin perder funcionalidad.

---

## 11. Dependencias necesarias

```
expo, expo-router, expo-location, expo-image, expo-dev-client
react, react-native, typescript
@supabase/supabase-js
@tanstack/react-query
zustand
react-hook-form
zod
react-native-maps
date-fns

# dev
jest, @testing-library/react-native, eslint, prettier, typescript-eslint

# supabase/functions (Deno)
zod (compatible), fetch nativo para llamar al proveedor de IA elegido
```

Nada de librerías de UI kit pesadas (evita atar el diseño a un sistema de terceros, sección 10) — construimos componentes propios sobre `design-system/tokens.ts`.

---

## 12. Variables de entorno necesarias

`.env.example` (se crea en Fase 1, aquí solo se documentan):

```
# Cliente (públicas por diseño de Supabase — protegidas por RLS, no por secreto)
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Solo servidor — secretos de la Edge Function, JAMÁS en el bundle de la app
AI_PROVIDER=            # "anthropic" | "openai" | ...
AI_API_KEY=
AI_MODEL=
SUPABASE_SERVICE_ROLE_KEY=
AI_RATE_LIMIT_PER_MINUTE=
```

---

## 13. Riesgos técnicos

- **`react-native-maps` no corre en Expo Go** → obliga a `expo-dev-client`/EAS Build desde Fase 1, no solo al final. Afecta el flujo de pruebas rápidas.
- **Salida no estructurada de la IA**: incluso con tool-calling, el modelo puede fallar el formato → mitigado con validación Zod estricta + fallback heurístico.
- **RLS mal configurada** → expone datos de otros usuarios. Mitigar con tests específicos de RLS antes de dar por cerrada la Fase 2/3.
- **Rating desnormalizado (`rating_avg`, `review_count` cacheados)** puede desincronizarse si el trigger falla → mitigar con trigger simple y bien testeado, o recálculo periódico de respaldo.
- **Cache de queries de IA**: poco margen porque las consultas varían mucho texto a texto; no sobre-invertir aquí para el MVP.

## 14. Riesgos de producto

- Frases vagas ("algo diferente") son difíciles de traducir a filtros — depende de una buena taxonomía de `tags`/categorías desde el principio.
- **Cold start de datos**: con pocos lugares MOCK, las recomendaciones se sentirán repetitivas o vacías. Se necesita variedad real (categorías, localidades, rangos de precio) para que la demo se sienta creíble.
- **Cold start de reseñas**: sin reseñas, el rating y el Detalle de Lugar se ven vacíos. Definir si sembramos reseñas MOCK (claramente marcadas) para la demo.
- Si la explicación de la IA alguna vez no coincide con los datos mostrados (bug, caché desalineada), se rompe la confianza del usuario rápidamente — el pipeline debe garantizar que la explicación se genera con los mismos datos que se muestran, en la misma request.

## 15. Posibles costos (orden de magnitud, MVP)

- **Supabase**: tier gratuito alcanza para desarrollo y validación inicial (500MB DB, 1GB storage, ~2GB egress/mes). Escalar a plan Pro (~US$25/mes) cuando haya usuarios reales.
- **Mapas**: US$0 — sin Google Places/Directions ni Mapbox de pago en el MVP (sección 2).
- **IA**: costo por token, variable según proveedor/modelo elegido; con un modelo económico (ej. gama "Haiku") el costo por búsqueda es fracciones de centavo. Rate limiting igual recomendado como salvaguarda.
- **EAS Build**: necesario por `react-native-maps`; tier gratuito de Expo tiene límite de builds/mes, suficiente para desarrollo, revisar si se necesita plan pago al acercarse a producción/tienda.

## 16. Qué simplificar para el MVP

- Una categoría principal por lugar + `tags` libres, sin tabla many-to-many de categorías.
- `cube`/`earthdistance` en vez de PostGIS.
- Sin autocompletado de direcciones (Google Places/Mapbox Geocoding) — ubicación por GPS o localidad de una lista curada.
- Reseñas solo con: rating, comentario, monto pagado (opcional), ocasión (opcional) — sin sub-atributos (ambiente, atención, etc., quedan para después).
- Sin personalización/ML — solo ranking por reglas documentadas.
- Sin panel admin — datos MOCK sembrados por script SQL / Supabase Studio directamente.
- Filters como modal/bottom sheet, no pantalla separada (pendiente tu OK).
- Sin notificaciones push, chat, pagos ni funciones sociales — fuera de alcance del MVP (no las mencionaste, lo confirmo explícitamente para evitar scope creep).

## 17. Decisiones que necesito que apruebes antes de comenzar

1. **Backend de IA**: Supabase Edge Functions (Deno) en vez de un servidor Node separado. *Recomiendo: sí.*
2. **Mapas**: `react-native-maps` (gratis) + `expo-location`, sin Google Places ni Mapbox de pago en el MVP. *Recomiendo: sí.*
3. **Proveedor de IA por defecto** para la primera implementación (intercambiable después): sugiero un modelo económico tipo Claude Haiku vía API de Anthropic. ¿Confirmas este default, o prefieres que empecemos con otro proveedor?
4. **Modelo de categorías**: una categoría principal por lugar + `tags[]`, en vez de tabla many-to-many. *Recomiendo: sí.*
5. **Flujo de desarrollo**: usar `expo-dev-client`/EAS Build desde el inicio (no Expo Go puro), por el requisito de `react-native-maps`. ¿De acuerdo?
6. **Dataset MOCK inicial**: generaré datos ficticios, marcados explícitamente como `is_mock: true` (no lugares reales de Bogotá). Propongo sembrar ~60–100 lugares distribuidos en ~8–10 categorías y 5–6 localidades para que la demo se sienta creíble. ¿Te parece bien ese alcance, o prefieres aportar tú un dataset real desde ya?
7. **Filters como bottom sheet** sobre la pantalla de Search, en vez de pantalla separada. ¿Apruebas la simplificación de UX?
8. **Tabla `ai_search_logs`** (no listada por ti originalmente) para monitorear costo/calidad de búsquedas IA. ¿La incluimos?
9. **Alcance de testing**: Jest + React Testing Library para unit/integración; se difiere E2E (Detox/Maestro) fuera del MVP. ¿De acuerdo?
10. **Una reseña por usuario por lugar** (constraint único, editable pero no duplicable). ¿Apruebas esta regla de negocio?

---

Quedo a la espera de tu revisión y aprobación (puedes responder punto por punto o en bloque) antes de iniciar la Fase 1 — Foundation.
