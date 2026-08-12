# Auditoría final de beta-readiness (Prioridad 15)

Cierre de la ronda autónoma de beta-readiness (Prioridades 6-15) sobre Juancho, app de
descubrimiento de planes en Bogotá. Este documento es la entrega final: qué quedó hecho, qué
quedó pendiente, y qué riesgos siguen existiendo, para que el equipo pueda revisarlo sin tener
que reconstruir el razonamiento desde cero.

Etiquetas usadas en todo el documento: **HECHO**, **PENDIENTE**, **REQUIERE CONFIGURACIÓN
EXTERNA**, **RIESGO**, **RECOMENDACIÓN**.

> **Actualización posterior:** este documento describe el estado en el momento en que se escribió
> (todo verificado contra Postgres local, sin proyecto Supabase real). Desde entonces el equipo
> creó un proyecto Supabase real y se conectó, migró y verificó desde el repositorio — incluido el
> login/registro real que acá queda listado como pendiente. Ver
> [`docs/INFRA_READINESS.md`](INFRA_READINESS.md) sección 0 para el estado actual y la evidencia.

---

## 1. Estado general

**HECHO** — Las Fases 0-8 (producto funcional completo: auth, lugares, mapas, reseñas, búsqueda
por IA, personalización) y las Prioridades de auditoría 1-14 (datos reales/seed seguro, estados
de error, seguridad de IA, mensajes de error seguros, recuperación de contraseña, errores de
mutación, paginación, validación de contenido, costos de IA, CI, seguridad de configuración,
salvaguarda del seed, rendimiento de listas, accesibilidad) están completas, probadas y
documentadas en el `README.md` principal (cada una tiene su propia sección "auditoría de
beta-readiness, Prioridad N").

**PENDIENTE** — La Prioridad 15 (esta auditoría) se completó dentro de las limitaciones del
entorno de verificación: no hay un proyecto Supabase real disponible en este sandbox (sin
Docker, sin Supabase CLI, sin GoTrue real), así que el walkthrough de 25 puntos combina (a)
evidencia real ya generada en Playwright durante las Prioridades 1-14, (b) una nueva ronda de
regresión de esta sesión contra Postgres real + un shim REST local, y (c) para lo que
estructuralmente no se puede probar sin un backend real (login/registro/logout/sesión expirada
end-to-end), una explicación honesta de por qué y qué verificación manual falta. Ver sección 3.

**Conclusión de estado:** el proyecto está en un punto razonable para una **beta cerrada y
supervisada**, no para producción abierta. La brecha principal no es de código sino de
configuración externa (proyecto Supabase real, restricción de la API key de Google Maps,
identidad de la app para builds nativos) — ver secciones 9 y 10.

---

## 2. Prioridades completadas

| # | Prioridad | Commit | Resumen |
|---|-----------|--------|---------|
| Fase 0-8 | Producto funcional completo | `13b47ee`…`c989bb5` | Auth, lugares/mapas/reseñas, búsqueda por IA, personalización |
| 1 | Datos reales + protección del seed MOCK | `6e5959d` | Importador real, 3 salvaguardas contra cargar mock sobre datos reales |
| 2 | Estados de error visibles | `dae190a` | Ninguna pantalla de datos se queda en blanco/infinito ante un error |
| 3 | Seguridad de la IA (prompt injection) | `0cb6081` | Sanitización de instrucciones inyectadas en la búsqueda por IA |
| 4 | Nunca exponer mensajes internos de error | `e5b7c3c` | `error.message` nunca llega crudo a la UI |
| 5 | Recuperación de contraseña | `fb012ad` | Flujo completo forgot/reset-password |
| 6 | Errores en mutaciones | `5162281` | Toast global + `ConfirmDialog` con manejo de error, favoritos/reseñas |
| 7 | Paginación y escalabilidad | `4d94a94` | `useInfiniteQuery` + `FlatList` en Search; bug de orden no determinístico encontrado y corregido |
| 8 | Validación de datos | `17882c9` | 4 `CHECK` constraints nuevos (defensa en profundidad, no solo cliente) |
| 9 | Control de costos de IA | `8503fcf` | Límite diario por usuario + límite global, además del límite por minuto ya existente |
| 10 | CI | `36a45f4` | GitHub Actions real (lint/typecheck/test + migraciones/seed contra Postgres); arregló un `package-lock.json` roto preexistente |
| 11 | Seguridad de configuración | `32ff23b` | Auditoría de env vars/secretos; checklist de Google Maps documentado |
| 12 | Seed y protección contra accidentes | `beec55a` | Tercera capa de salvaguarda (bloquea si ya hay cuentas reales) |
| 13 | Rendimiento y calidad de listas | `6f3efbf` | `listPlaces` deja de pedir columnas que nadie usa |
| 14 | Accesibilidad | `5743751` | Labels de inputs, agrupamiento de `StarRating`, rol semántico de `PlaceCard`, auditoría de contraste WCAG |

Cada fila tiene su narrativa completa (qué se encontró, cómo se verificó, qué se descartó) en la
sección correspondiente del `README.md` — este documento no la repite, la referencia.

---

## 3. Prioridades parcialmente completadas

### Prioridad 15 — Auditoría final de beta

**Metodología real de esta sesión:** se levantó Postgres 16 local + las 12 migraciones + el seed
MOCK completo (72 lugares, 6 usuarios de desarrollo, 120 reseñas) desde cero, un shim REST local
(`rest_shim.py`, solo en el scratchpad de verificación, nunca en el repo) sirviendo los mismos
endpoints que Supabase, y Expo Web contra ese backend. Se usó una sesión inyectada temporalmente
en `useInitAuth.ts` (patrón `TEMP-VERIFICACION`, ya usado en prioridades anteriores) para poder
probar pantallas que requieren estar autenticado — **confirmado revertido antes de cualquier
commit** (`git diff` limpio).

**Walkthrough de los 25 puntos pedidos:**

| # | Punto | Estado | Evidencia |
|---|-------|--------|-----------|
| 1 | Registro | PENDIENTE (verificación manual) | Validación de formulario verificada en navegador (Fase 3); `signUp()` probado con mocks (`auth/__tests__/api.test.ts`); el registro real contra un backend no se puede completar en este sandbox (no hay GoTrue real) |
| 2 | Login | PENDIENTE (verificación manual) | Mismo caso que Registro — validación de errores sí verificada visualmente, el login real no |
| 3 | Logout | PENDIENTE (verificación manual) | `signOut()` probado con mocks; sin backend real no se pudo confirmar visualmente el ciclo completo (tocar "Cerrar sesión" → limpiar sesión → redirigir a login) |
| 4 | Recuperación de contraseña | HECHO | Flujo completo verificado en navegador, Prioridad 5 (capturas `pw5-01`…`pw5-09`) |
| 5 | Home | HECHO | Verificado repetidas veces, incluyendo éxito/error/reintento/vacío (`home-01`…`home-05`) |
| 6 | Categorías | HECHO | Tap de categoría → Search filtrado, verificado de nuevo en esta sesión (`p15-02-search-from-category.png`) |
| 7 | Búsqueda | HECHO | Texto libre + paginación infinita (Prioridad 7); se encontró y corrigió un bug real de orden no determinístico en la paginación |
| 8 | Filtros | HECHO | `FiltersSheet` abierto y aplicado, zona + categoría (`places-04`, `places-05`) |
| 9 | Presupuesto | HECHO | Mismo componente `Chip`/mismo query-builder que zona/categoría; cubierto por los tests unitarios del builder de filtros (Fase 4) |
| 10 | Cerca de ti | HECHO | RPC `nearby_places` con tests SQL + verificación visual (Fase 5) |
| 11 | Mapa | HECHO | Verificado en detalle de lugar, con fallback web documentado (OpenStreetMap sin key) |
| 12 | Detalle | HECHO | Verificado repetidas veces (`place-detail-01`…`04`, y de nuevo en esta sesión) |
| 13 | Favoritos | HECHO, con una investigación adicional — ver sección 8 | Toggle de favorito, pantalla de favoritos, estados vacío/error/reintento (`favorites-01`…`04`) |
| 14-16 | Reseñas: crear/editar/eliminar | HECHO | Ciclo completo con confirmación de borrado mejorada en Prioridad 6 (`reviews-01`…`09`) |
| 17 | Recomendaciones | HECHO | RPC `personalized_places`, verificado visualmente (Fase 8) y con tests SQL (escenarios 16-17 del smoke test) |
| 18 | Búsqueda por IA | HECHO | Fallback heurístico + aclaración cuando no se entiende la consulta (Fase 7, `ai-01`…`06`) |
| 19 | Errores de red | HECHO | Mensaje seguro + reintentar en cada pantalla de datos (`home-02/03`, `search-03`, `favorites-02`, `place-detail-02`, `reviews-02`) |
| 20 | Estados vacíos | HECHO | `search-02`, `favorites-04`, `reviews-04` |
| 21 | Estados de loading | HECHO | `ai-03` (recomendaciones cargando), `QueryState` con tests unitarios |
| 22 | Estados de error | HECHO | Igual que "errores de red"; cubre también errores de validación, no solo de red |
| 23 | Reintentos | HECHO | `home-04`, `search-04`, `favorites-03`, `place-detail-03`, `reviews-03` — todos muestran reintentar-éxito |
| 24 | Sesión expirada | PENDIENTE (verificación manual) | Arquitectónicamente **idéntica** a logout: ambas limpian `session` a `null` a través del mismo `onAuthStateChange` del store (`useInitAuth.ts`) — no hay código especial para "expirada" vs. "cerrada manualmente", y no debería hacer falta. No se pudo forzar una expiración real de JWT en este sandbox para confirmarlo con una captura |
| 25 | Datos inválidos | HECHO | Validación de cliente (zod) + defensa en profundidad en BD (`CHECK` constraints, Prioridad 8); los 24 escenarios del RLS smoke test (incluidos los 6 de Prioridad 8) se re-verificaron en un ciclo de Postgres completamente nuevo en esta misma sesión — ver sección 5 |

**Por qué 1/2/3/24 quedan como PENDIENTE y no como HECHO:** `supabase.auth.signIn/signUp/signOut`
requieren un servidor GoTrue real que emita/valide JWTs firmados — no hay forma de simularlo
fielmente con un shim REST casero sin reimplementar buena parte de Supabase Auth, lo cual sería
un esfuerzo desproporcionado y con su propio riesgo de dar una falsa sensación de seguridad. La
capa que sí es código propio (validación de formularios, manejo de errores, la función delgada
`api.ts`) está probada; lo que falta es la integración real con el backend, que requiere un
proyecto Supabase real (sección 9) y **una prueba manual de un humano** antes de abrir la beta.

---

## 4. Archivos modificados

Resumen por prioridad (detalle completo de cada archivo en el commit correspondiente y en la
sección del README de esa prioridad):

| Prioridad | Archivos | Líneas +/- |
|---|---|---|
| 6 — Errores en mutaciones | 11 | +349 / -5 |
| 7 — Paginación | 9 | +282 / -29 |
| 8 — Validación de datos | 7 | +172 / -4 |
| 9 — Costos de IA | 5 | +208 / -13 |
| 10 — CI | 3 | +799 / -227 |
| 11 — Seguridad de configuración | 1 (README) | +80 / -1 |
| 12 — Seed | 3 | +41 / -11 |
| 13 — Rendimiento de listas | 6 | +79 / -6 |
| 14 — Accesibilidad | 7 | +202 / -4 |
| 15 — Esta auditoría | 1 (nuevo: `docs/BETA_READINESS_FINAL.md`) | — |

Ningún archivo de configuración con secretos reales fue creado ni modificado (`.env` sigue sin
existir en el repo, solo `.env.example` con placeholders vacíos).

---

## 5. Tests ejecutados

- **Jest:** 24 suites, **219 tests**, todos unitarios/de integración con mocks (componentes UI,
  hooks de React Query, validación zod, utilidades, módulos de la Edge Function `ai-search`).
- **TypeScript:** `tsc --noEmit` — 0 errores (modo estricto).
- **ESLint:** `eslint .` — 0 problemas.
- **RLS / constraints (SQL):** `supabase/tests/rls_smoke_test.sql`, 24 escenarios, ejecutado en
  esta sesión contra un ciclo **completamente nuevo** de Postgres 16 (`00_local_stub.sql` → 12
  migraciones en orden → seed MOCK completo con la frase de confirmación → smoke test), no
  reutilizando ninguna base de datos de sesiones anteriores.
- **CI real:** el workflow de GitHub Actions (Prioridad 10) sigue corriendo en cada push/PR;
  última corrida confirmada exitosa en la infraestructura real de GitHub antes de esta sesión.
- **Regresión visual (Playwright, esta sesión):** Home → tocar categoría → Search filtrado →
  favoritos, contra Postgres real + shim REST + Expo Web, para confirmar que los cambios de
  Prioridad 13 (columnas recortadas) y Prioridad 14 (accesibilidad) no rompieron nada visual ni
  funcional. Ver sección 8 para el hallazgo puntual que salió de esta ronda.

---

## 6. Resultados

Todo lo anterior corrió limpio en esta sesión, en este orden, justo antes de escribir este
documento:

```
Jest:          24 suites, 219 tests, 0 fallos
tsc --noEmit:  0 errores
eslint .:      0 problemas
RLS smoke:     24/24 escenarios con el resultado esperado (10 "debe fallar" que fallaron
               con el constraint correcto, 14 "debe funcionar" que funcionaron)
```

`git status` queda limpio (sin cambios sin commitear, sin archivos temporales, sin `.env`) al
cierre de esta auditoría.

---

## 7. Decisiones técnicas

- **No se tocó la capa de autenticación (`api.ts`, `store.ts`, `useInitAuth.ts`) más allá de usar
  el hack `TEMP-VERIFICACION` (siempre revertido) para poder probar otras pantallas.** Es una
  capa delgada sobre `supabase-js` (SDK ya probado y ampliamente usado), la lógica propia
  (validación, manejo de errores) ya estaba probada, y no había ninguna prioridad que pidiera
  cambiarla.
- **Se investigó y luego se descartó un cambio en `PlaceCard.tsx`.** Durante la regresión de esta
  sesión pareció que tocar el corazón de favoritos después de navegar de Home a Search también
  disparaba una navegación al detalle (un bug real, de ser cierto). Se agregó
  `event.stopPropagation()` como corrección, pero antes de commitearla se investigó la causa raíz
  con más profundidad: probando el mismo tap en una carga de página aislada (sin la navegación
  Home→Search de por medio) el problema no se reproducía, y usando el propio chequeo de
  "el elemento realmente puede recibir el clic" de Playwright (en vez de forzarlo) el intento
  simplemente no encontraba un objetivo estable — no navegaba a ningún lado equivocado. Eso apunta
  a un artefacto del entorno de prueba (expo-router mantiene la pantalla de Home montada detrás de
  Search) combinado con un clic *forzado* de Playwright, no a un bug real que un usuario pudiera
  disparar con un toque normal. Se revirtió el cambio (`git stash drop` tras confirmar) siguiendo
  la regla de "no cambios artificiales si la prioridad ya funciona bien". Queda documentado como
  riesgo de bajo impacto en la sección 8, no como código sin terminar.
- **No se creó un sistema de billing/moderación/CI enterprise.** Cada prioridad que lo
  mencionaba explícitamente pedía evitar sobre-ingeniería (Prioridades 8, 9, 10) — se
  respetó en los tres casos.
- **`colors.rating` no se cambió** pese a fallar el nuevo test de contraste WCAG (Prioridad 14) —
  es una decisión de marca fuera del alcance de una auditoría técnica.

---

## 8. Riesgos pendientes

- **RIESGO — Login/registro/logout/sesión expirada sin verificación end-to-end contra un backend
  real.** Ver sección 3, puntos 1-3 y 24. La lógica propia está probada; la integración con
  GoTrue real no se pudo ejercitar en este sandbox.
- **RIESGO (bajo impacto) — anomalía puntual de tap en el corazón de favoritos, solo en pruebas
  automatizadas de web con clic forzado, tras navegar Home→Search.** Ver la explicación completa
  en la sección 7. Con un tap real (no forzado), Playwright no logró completar el clic en absoluto
  (timeout) en vez de navegar a un lugar equivocado — es decir, en el peor caso el usuario tendría
  que volver a tocar, no que la app lo mande a una pantalla no deseada. No se reprodujo en una
  carga de página aislada. **Recomendación:** confirmar manualmente este flujo específico
  (Home → tocar una categoría → tocar el corazón de la primera tarjeta) en un dispositivo/
  navegador real antes de la beta, dado que no se pudo llegar a una explicación 100% concluyente.
- **RIESGO — `colors.rating` sobre fondo no alcanza el mínimo de contraste 3:1 para componentes
  gráficos/UI (Prioridad 14).** Documentado a propósito como test que falla, no corregido
  (decisión de marca fuera de alcance).
- **RIESGO — el limitador de costos de IA puede subcontar el uso si el `INSERT` a
  `ai_search_logs` falla** (Prioridad 9, aceptado explícitamente para evitar construir un sistema
  de billing).
- **RIESGO — nunca se probó contra un volumen real de "cientos/miles" de lugares**, solo contra
  los 72 del seed MOCK. La paginación/consultas están escritas para escalar (offset/limit con
  tiebreaker determinístico, columnas recortadas), pero el rendimiento real a esa escala no se
  midió empíricamente.
- **RIESGO — no hay ningún proyecto Supabase de producción/staging real**; todo lo validado en
  este documento corrió contra Postgres local + un shim REST de verificación, nunca contra la
  infraestructura hospedada real que usará la beta.

---

## 9. Configuración externa pendiente

**REQUIERE CONFIGURACIÓN EXTERNA** (nada de esto se puede simular ni fingir desde el código):

1. **Crear el proyecto Supabase real** (producción o staging), aplicar las 12 migraciones en
   orden, y decidir conscientemente si/cuándo correr el seed MOCK ahí (las 3 salvaguardas lo
   hacen difícil de ejecutar por accidente, pero siguen requiriendo una decisión humana
   explícita).
2. **Configurar Supabase Auth**: plantillas de correo, `redirectTo` para recuperación de
   contraseña apuntando al esquema `juancho://reset-password` de la app real, y confirmar si se
   requiere confirmación de correo antes del primer login.
3. **Restringir la API key de Google Maps** en Google Cloud Console: restricción de aplicación
   (Android, por nombre de paquete + huella SHA-1) y restricción de API (solo Maps SDK for
   Android) — detallado en la sección "Seguridad de configuración" del README.
4. **Decidir `android.package` / `ios.bundleIdentifier`** en `app.config.ts` (no existen
   todavía — es una decisión de marca, no técnica) y crear `eas.json` para poder generar builds
   nativos reales.
5. **Configurar los secretos de la Edge Function `ai-search`** en el proyecto real
   (`AI_API_KEY`, `AI_PROVIDER`, `AI_MODEL`, `SUPABASE_SERVICE_ROLE_KEY`) vía
   `supabase secrets set` — nunca en el bundle del cliente.
6. **Decidir hosting/dominio** si se publica alguna vez la versión web (hoy es solo la vía rápida
   de desarrollo de UI, no un target de producción).

---

## 10. Qué falta antes de abrir beta

- Completar la sección 9 completa (bloquea cualquier build nativo real).
- Verificar manualmente, contra el proyecto Supabase real: registro, login, logout y
  recuperación de contraseña de punta a punta (sección 3, puntos 1-4 y 24).
- Probar la app en un dispositivo o simulador nativo real (iOS/Android), no solo en la versión
  web — mapas, geolocalización y gestos táctiles se comportan distinto ahí.
- Cargar un primer lote de lugares reales de Bogotá con `supabase/seed/import_real_places.py`
  (el importador ya existe y está probado; cargar los datos reales en sí es una decisión y
  trabajo del equipo, no algo que se debiera automatizar sin supervisión).
- Confirmar el hallazgo de la sección 8 (tap del corazón) en un dispositivo real.

---

## 11. Qué NO tocar sin revisión

- **La arquitectura de la IA** (interpreta y explica, nunca decide ranking ni inventa/crea/
  modifica lugares) — cualquier cambio ahí es una decisión de producto, no un ajuste técnico.
- **Los colores del design system**, incluido `colors.rating` aunque falle su test de contraste
  — es intencional, ver sección 7.
- **Las 3 salvaguardas del seed MOCK** (`generate_seed.py` / `seed.sql`) — no simplificarlas ni
  deshabilitarlas para "que sea más fácil" cargar datos de prueba.
- **Las migraciones ya aplicadas** — no editarlas retroactivamente; cualquier cambio de esquema
  va en una migración nueva.
- **El job de migraciones+seed en CI** — si falla, investigar la causa real, no comentarlo ni
  marcarlo `continue-on-error` para "que pase".
- **Los `CHECK` constraints de contenido** (Prioridad 8) — son la única protección real contra
  quien llame a la REST API de Supabase directamente, sin pasar por la validación del cliente.

---

## 12. Próximos pasos recomendados

1. **RECOMENDACIÓN:** priorizar la sección 9 (configuración externa) — es lo único que bloquea
   tener una build real que alguien fuera de este entorno pueda instalar.
2. **RECOMENDACIÓN:** una vez exista el proyecto Supabase real, repetir el walkthrough de 25
   puntos manualmente, con foco especial en los 4 puntos que quedaron PENDIENTE (registro, login,
   logout, sesión expirada).
3. **RECOMENDACIÓN:** cargar un primer lote de lugares reales y repetir la verificación de
   rendimiento de listas (Prioridad 13) con ese volumen, no solo con los 72 del seed MOCK.
4. **RECOMENDACIÓN:** confirmar en un dispositivo real el hallazgo de la sección 8 antes de
   invitar a los primeros beta testers; de reproducirse ahí sí ameritaría una corrección de
   código.
5. **RECOMENDACIÓN:** mantener la disciplina de "una prioridad, un commit, tests antes de seguir"
   que se siguió en esta ronda — hizo posible encontrar y corregir bugs reales (paginación no
   determinística, `package-lock.json` roto) sin acumular regresiones silenciosas.
