# Checklist de lanzamiento de beta

Checklist operativo para pasar de "beta-readiness técnica" (ver
[`BETA_READINESS_FINAL.md`](BETA_READINESS_FINAL.md)) a una beta cerrada real. Cada ítem indica
`[x]` hecho o `[ ]` pendiente, con una explicación breve. Detalle completo de la parte de
infraestructura en [`INFRA_READINESS.md`](INFRA_READINESS.md).

---

## A. Código

- [x] Fases 0-8 (producto funcional completo) y Prioridades de auditoría 1-15 completas — ver
      `README.md` y `BETA_READINESS_FINAL.md`.
- [x] 219 tests de Jest, TypeScript estricto y ESLint limpios.
- [x] Migración de categorías como taxonomía real (no MOCK) — corregido en esta ronda, ver
      `INFRA_READINESS.md` sección 1.
- [x] `.env.example` documentado con PUBLIC/BUILD ONLY/SERVER ONLY.
- [x] `app.config.ts`/`eas.json` preparados para builds nativos (con placeholders explícitos donde
      falta una decisión humana).
- [ ] Identificador de paquete definitivo (`android.package`/`ios.bundleIdentifier`) — hoy es un
      placeholder (`com.example.juancho`), requiere decisión humana de branding.

## B. Supabase

- [ ] Proyecto Supabase real creado — **requiere configuración externa**, no existe ninguno
      conectado a este repositorio.
- [ ] Las 13 migraciones aplicadas contra ese proyecto (`supabase db push` o equivalente).
- [ ] Secretos de la Edge Function `ai-search` configurados (`AI_API_KEY`, `AI_MODEL`,
      `AI_PROVIDER`, límites de tasa) — ver `INFRA_READINESS.md` sección 1.
- [ ] Auth configurado: Redirect URLs (`juancho://reset-password`), Site URL, decisión sobre
      confirmación de email.
- [x] Salvaguardas contra correr el seed MOCK sobre datos reales — auditadas, 3 capas intactas
      (`INFRA_READINESS.md` sección 8).
- [ ] **`supabase/seed.sql` NUNCA debe correr contra este proyecto** — recordatorio explícito, no
      una tarea a marcar.

## C. IA

- [x] Arquitectura de la IA (interpreta + explica, nunca decide ranking ni inventa lugares) sin
      cambios — fuera de alcance de esta ronda.
- [x] Control de costos (límite por minuto/día por usuario + límite global) implementado y
      probado (Prioridad 9).
- [x] Seguridad contra prompt injection (Prioridad 3) y validación de salida de la IA.
- [ ] `AI_API_KEY` real configurada en el proyecto Supabase real — depende de B.

## D. Mapas

- [x] iOS (Apple Maps) y web (OpenStreetMap) no necesitan ninguna key — confirmado.
- [x] Android: código y config listos, confirmado con un `expo prebuild` de prueba que el
      `GOOGLE_MAPS_API_KEY` se aplica correctamente (o se omite de forma segura si falta).
- [ ] API key de Google Maps real, obtenida y restringida en Google Cloud Console (Application
      restrictions: Android + package name + SHA-1; API restrictions: solo Maps SDK for Android) —
      **requiere configuración externa**, bloqueada además por el identificador de paquete
      definitivo (ítem A).

## E. Datos reales

- [x] Importador de lugares reales (`import_real_places.py`) auditado: 29/29 tests, probado
      end-to-end contra una base con solo migraciones, sin bugs encontrados.
- [x] Valida nombre, categoría, dirección, localidad, coordenadas, precio, horario, descripción,
      imágenes, fuente y fecha de verificación — ninguno se completa automáticamente.
- [ ] Ningún lugar real cargado todavía — **a propósito**, no se inventaron datos reales en esta
      auditoría ni en ninguna anterior. Cargar el primer lote real es trabajo/decisión del equipo.

## F. iOS

- [x] `ios.bundleIdentifier` placeholder configurado, `expo prebuild` genera un proyecto Xcode
      válido (verificado en una copia aislada, no en el repo real).
- [ ] Identificador definitivo — decisión humana (ítem A).
- [ ] Cuenta de Apple Developer, certificados/perfiles de aprovisionamiento — **requiere
      configuración externa**, no gestionable desde este repositorio sin una cuenta real.
- [ ] Primer build real (`eas build --platform ios`) — bloqueado por login de EAS (ítem G/sección 4
      de `INFRA_READINESS.md`).

## G. Android

- [x] `android.package` placeholder configurado, `expo prebuild` genera un proyecto Gradle válido
      con `applicationId` correcto (verificado en copia aislada).
- [ ] Identificador definitivo — decisión humana (ítem A).
- [ ] Cuenta de Google Play Console (si se va a publicar ahí) — **requiere configuración externa**.
- [ ] Login de una cuenta Expo/EAS (`eas login` + `eas init`) — bloqueante para cualquier build real
      en la nube de EAS, confirmado que este entorno no tiene sesión iniciada.
- [ ] Primer build real (`eas build --platform android --profile development`).

## H. Seguridad

- [x] Auditoría de secretos en el repo (incluyendo historial de git) — sin hallazgos, Prioridad 11.
- [x] RLS auditado y probado (24 escenarios en `rls_smoke_test.sql`), incluida esta ronda contra
      una base completamente nueva.
- [x] `CHECK` constraints de validación de contenido (defensa en profundidad, no solo cliente).
- [x] `anon key` pública por diseño (protegida por RLS); `service_role`/`AI_API_KEY` nunca en el
      cliente — auditado de nuevo en esta ronda.
- [ ] Restricción de la API key de Google Maps (ítem D) — pendiente de proyecto real.

## I. Testing

- [x] 219 tests Jest, TypeScript y ESLint limpios (verificado en esta sesión, sección de
      verificación final).
- [x] RLS smoke test (24 escenarios) verificado contra una base Postgres completamente nueva en
      esta sesión.
- [x] CI (GitHub Actions) corriendo en cada push/PR, confirmado verde contra la infraestructura
      real de GitHub.
- [x] Walkthrough de 25 puntos como beta tester (`BETA_READINESS_FINAL.md`) — 21/25 verificados con
      evidencia real, 4 pendientes de verificación manual contra un backend real (login, registro,
      logout, sesión expirada).
- [ ] Los 4 puntos de arriba, contra el proyecto Supabase real, una vez exista (ítem B).
- [ ] Prueba en dispositivo/simulador nativo real (iOS/Android) — todo lo verificado hasta ahora
      fue en navegador web (la vía rápida de desarrollo de UI) o análisis de código, nunca en un
      build nativo real.

## J. Usuarios beta

- [ ] Lista de beta testers definida — decisión del equipo, fuera del alcance técnico.
- [ ] Mecanismo de distribución decidido (TestFlight interno / APK directo vía `preview` de EAS) —
      la infraestructura de build ya soporta ambos (`eas.json`, ítem A), falta decidir cuál usar y
      ejecutarlo.
- [ ] Canal de feedback/reporte de bugs para los testers — no definido, decisión del equipo.

## K. App Store / Google Play

- [ ] **Explícitamente fuera de alcance de esta auditoría** — no se publicó ni se intentó publicar
      nada, según instrucción explícita. Ningún paso de esta sección se ejecutó:
- [ ] Cuentas de desarrollador (Apple Developer Program, Google Play Console).
- [ ] Ficha de la tienda (descripción, capturas, ícono definitivo, política de privacidad).
- [ ] Cumplimiento de políticas de cada tienda (revisar antes de intentar publicar).
- [ ] Primer envío a revisión.
