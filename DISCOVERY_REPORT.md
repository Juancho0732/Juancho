# DISCOVERY REPORT — DISRUPTIVO PELUQUERÍA

**Fecha de la investigación:** 2026-08-14
**Fase:** Misión 01 — Investigación y Descubrimiento (sin construcción, sin decisiones de diseño)
**Herramientas usadas:** búsqueda web (WebSearch) y lectura de páginas públicas (WebFetch). Sin acceso a APIs oficiales de Instagram, Google Business, ni AgendaPro. Sin acceso a la "Ficha técnica — Diseño de Métricas para Marketing – Disruptivo" (el documento no fue adjuntado ni encontrado en el repositorio; solo se cuenta con el resumen de su contenido incluido en el brief de esta misión).

> **Advertencia metodológica importante:** varias plataformas clave (Instagram, Google Maps, el panel interactivo de AgendaPro) son aplicaciones que renderizan su contenido con JavaScript o bloquean accesos automatizados. Cuando esto ocurrió, se registra explícitamente como "NO ACCESIBLE" en vez de inventar contenido. Esto limita significativamente la profundidad de esta investigación y debe tenerse en cuenta al leer el informe.

---

## 1. Resumen ejecutivo

Disruptivo Peluquería es un salón de peluquería en Bogotá, dirigido por Andrés Rodríguez, que atiende a hombres y mujeres. Su presencia digital pública confirmable se reduce, en la práctica, a dos puntos: una cuenta de Instagram (@disruptivo_peluqueria, cuyo contenido no pudo ser accedido por bloqueos automatizados) y una página de reservas en AgendaPro cuyo único texto públicamente indexable es un nombre y un eslogan: *"El arte llevado a tu pelo, al mejor estilo Disruptivo."*

No se encontró página web oficial propia, ni Google Business Profile accesible, ni presencia confirmada en Facebook, TikTok, YouTube u otras redes. El nombre "Disruptivo" es compartido por múltiples negocios no relacionados (una tienda de importados, un café, un canal de TV, una agencia de marketing, un colectivo de diseño), lo cual diluye la búsqueda del negocio real.

La investigación no pudo confirmar ni refutar de forma directa la hipótesis de la ficha técnica ("hay visibilidad pero no conversión"), pero sí encontró evidencia estructural consistente con ella: no hay servicios ni precios visibles sin pasar por un flujo de reserva interactivo no indexable, no hay un sitio web propio que centralice información, y no se pudo verificar que WhatsApp esté integrado en ningún canal público encontrado.

Esta investigación deja más preguntas abiertas que respuestas cerradas. Eso es información válida en sí misma: significa que antes de diseñar cualquier web, se necesita una sesión directa con Andrés Rodríguez para llenar los vacíos listados en las secciones 21-24.

---

## 2. Fuentes consultadas

| Fuente | Tipo | Accesible | Resultado |
|---|---|---|---|
| instagram.com/disruptivo_peluqueria | Instagram oficial | ❌ NO (HTTP 429 en todos los intentos) | Sin datos directos |
| peluqueriadeandresrodriguez1.site.agendapro.com/co | AgendaPro (booking del negocio) | ⚠️ PARCIAL (solo shell estático, sin JS) | Nombre + eslogan + evidencia de selector de sucursal |
| agendapro.com/mp/co/peluquerias-bogota | Directorio AgendaPro Bogotá | ⚠️ PARCIAL | Indicios de reseñas indexadas, sin poder confirmar contenido completo |
| Google Search (múltiples queries) | Buscador | ✅ SÍ | Resultados variados, ver secciones siguientes |
| Google Maps (búsqueda directa) | Mapa/negocio | ❌ NO (contenido dinámico no renderizado) | Sin datos |
| Facebook (búsqueda por nombre) | Red social | ⚠️ PARCIAL | Solo se halló una cuenta "Disruptivo Colombia" que **no corresponde** al negocio (ver sección 15) |
| TikTok (búsqueda por nombre) | Red social | ⚠️ PARCIAL | Ninguna cuenta oficial identificada |
| Competidores (El Taller del Pelo, Marco Antonio, Barcé, Lolas New Concept, InVitro) | Webs/redes de terceros | ✅ SÍ | Ver sección 15 |
| Referentes internacionales (Hairrari, Rudy's Barbershop, Logan Parlor) | Webs de terceros | ✅ SÍ | Ver sección 16 |
| Ficha técnica académica "Diseño de Métricas para Marketing – Disruptivo" | Documento interno | ❌ NO ENCONTRADO (no adjuntado, no está en el repositorio) | Solo se dispone del resumen dado en el brief |

**Fuentes consultadas:** ~9 categorías de fuentes, con más de 20 búsquedas individuales.
**Fuentes accesibles (completa o parcialmente):** 6
**Fuentes bloqueadas / no accesibles:** 3 (Instagram, Google Maps, panel interactivo AgendaPro)

---

## 3. Información confirmada

- El nombre del negocio es **Disruptivo Peluquería**.
  EVIDENCIA: Título de la página de reservas: "Disruptivo peluquería | Agenda online".
  FUENTE: https://peluqueriadeandresrodriguez1.site.agendapro.com/co
  NIVEL DE CERTEZA: ALTO

- El negocio usa el eslogan **"El arte llevado a tu pelo, al mejor estilo Disruptivo."**
  EVIDENCIA: Texto visible en la página de reservas de AgendaPro.
  FUENTE: https://peluqueriadeandresrodriguez1.site.agendapro.com/co
  NIVEL DE CERTEZA: ALTO

- El negocio usa **AgendaPro** como sistema de agendamiento online.
  EVIDENCIA: Subdominio dedicado (`peluqueriadeandresrodriguez1.site.agendapro.com`) y aparición en el directorio público `agendapro.com/mp/co/peluquerias-bogota`.
  FUENTE: agendapro.com
  NIVEL DE CERTEZA: ALTO

- La página de AgendaPro ofrece **selección de sucursal** ("Elige una sucursal"), lo que indica que existe más de un punto de atención o que el sistema está preparado para varias sucursales.
  EVIDENCIA: Texto "Elige una sucursal" visible en el shell de la página.
  FUENTE: https://peluqueriadeandresrodriguez1.site.agendapro.com/co
  NIVEL DE CERTEZA: MEDIO (no se pudo ver el listado real de sucursales; puede ser una sola sucursal con el selector genérico de la plantilla de AgendaPro)

- El slug de la URL de AgendaPro es **"peluqueriadeandresrodriguez1"**, lo que vincula directamente al negocio con el nombre **Andrés Rodríguez** dado por el usuario.
  EVIDENCIA: URL del sistema de reservas.
  FUENTE: https://peluqueriadeandresrodriguez1.site.agendapro.com/co
  NIVEL DE CERTEZA: ALTO (como indicio de vínculo nombre-negocio; no confirma el rol exacto de Andrés Rodríguez, ver sección 4)

- Existe una cuenta de Instagram con el usuario exacto **@disruptivo_peluqueria**, tal como fue provista por el usuario.
  EVIDENCIA: URL directa dada como dato de partida; no se pudo verificar contenido por bloqueo de acceso, pero la URL en sí no arrojó error 404.
  FUENTE: https://www.instagram.com/disruptivo_peluqueria/
  NIVEL DE CERTEZA: MEDIO (no se pudo confirmar que la cuenta esté activa, sea pública, o tenga contenido — solo que la URL fue provista por el usuario)

---

## 4. Historia y contexto del negocio

**¿Cuándo aparece Disruptivo? ¿Cuál es su historia de marca?**
NO ENCONTRADO. Ninguna fuente pública consultada menciona fecha de fundación, historia u origen del negocio.

**¿Quién es Andrés Rodríguez? ¿Qué papel cumple?**
NO ENCONTRADO de forma verificable. El usuario indica que es el dueño. La única evidencia digital independiente hallada es que el subdominio de AgendaPro incluye su nombre ("peluqueriadeandresrodriguez1"), lo cual es consistente pero no es una confirmación biográfica. No se encontró información sobre su trayectoria, formación, experiencia previa, ni si es también el estilista principal o solo el propietario/administrador.
NIVEL DE CERTEZA sobre su vínculo con el negocio: ALTO (por la URL). NIVEL DE CERTEZA sobre su rol/historia/trayectoria: NO ENCONTRADO.

**¿Existe información sobre experiencia profesional o certificaciones?**
NO ENCONTRADO. No se debe asumir años de experiencia, formación o certificaciones sin evidencia.

---

## 5. Servicios

No fue posible acceder al catálogo real de servicios y precios. El panel de reservas de AgendaPro es una aplicación interactiva (probablemente Angular/React) que requiere ejecución de JavaScript; la herramienta de lectura usada solo pudo ver el "shell" estático de la página (encabezado, eslogan, botón "Elige una sucursal", promoción de AgendaPro, enlace a términos y condiciones), sin llegar a la lista de servicios, precios o duraciones.

Se encontró un indicio, no verificado de forma directa, de un servicio de **"Corte corto"** apareciendo en fragmentos de reseñas indexadas por buscadores desde el directorio `agendapro.com/mp/co/peluquerias-bogota` (ver sección 7). Esto sugiere que el corte de cabello es, como mínimo, uno de los servicios ofrecidos, pero:

CONCLUSIÓN: Disruptivo ofrece al menos servicio de corte de cabello.
EVIDENCIA: Fragmentos de resultados de búsqueda que citan una reseña por "Corte corto" asociada al listado de Disruptivo en el directorio de AgendaPro.
FUENTE: agendapro.com/mp/co/peluquerias-bogota (contenido no verificado directamente por fetch completo, solo por resultados de búsqueda)
NIVEL DE CERTEZA: MEDIO — "Dato encontrado, pero no verificado de forma directa."

No se encontró ningún otro servicio (coloración, tratamientos, barbería, asesoría de imagen, etc.), ni precios, ni duraciones. Dado que el negocio se presenta como "peluquería" para hombres y mujeres, es razonable **sospechar** que el catálogo sea más amplio que un solo servicio, pero esto es una HIPÓTESIS, no un hecho:

HIPÓTESIS: el catálogo de servicios probablemente incluye corte, coloración y/o tratamientos capilares, como es estándar en peluquerías unisex de Bogotá.
NIVEL DE CERTEZA: BAJO — no confirmado, requiere verificación directa con el dueño o acceso al panel de AgendaPro con JavaScript habilitado.

**Ningún precio fue encontrado.** No se debe inventar ningún precio para Disruptivo.

---

## 6. Cliente

No se pudo acceder a Instagram (fotos, reels, comentarios) ni a un perfil de Google Business con reseñas, que son las fuentes más ricas para inferir el perfil de cliente. Por tanto, la inferencia de cliente es muy limitada.

Lo único disponible: el usuario declara que el público es "hombres y mujeres" y la cobertura es Bogotá. Esto no fue verificado ni refutado por evidencia externa independiente (no se pudo ver contenido de Instagram que muestre ambos géneros como clientes).

INFERENCIA (no confirmada): al tratarse de una peluquería (no barbería exclusiva) con reseñas que mencionan "corte corto", es posible que atienda una base mixta, consistente con lo declarado. Pero esto es una inferencia débil basada en un solo dato.
NIVEL DE CERTEZA: BAJO

Sobre motivaciones, expectativas, rango etario, lo que valoran, lo que temen: **NO ENCONTRADO**. Esta es una de las brechas de información más importantes de todo el informe (ver sección 22).

---

## 7. Reseñas y percepción del cliente

Este es un punto obligatorio según la misión, pero también uno de los más limitados por accesibilidad.

Durante múltiples búsquedas independientes (con distintas queries: "Disruptivo peluqueria Bogota reseñas", "Disruptivo peluqueria Chapinero", "Björn Willms Disruptivo peluqueria review", "Armando Ospina Disruptivo peluqueria corte"), el motor de búsqueda devolvió de forma consistente el mismo fragmento: una reseña de servicio **"Corte corto"**, fechada **19 de mayo de 2026**, asociada a dos nombres distintos según la consulta (**Armando Ospina** en unas respuestas, **Björn Willms** en otras), siempre vinculada al listado de Disruptivo en `agendapro.com/mp/co/peluquerias-bogota`.

CONCLUSIÓN: Existe al menos una reseña real indexada para el servicio de corte de cabello de Disruptivo, aproximadamente de mayo de 2026.
EVIDENCIA: Fragmentos recurrentes y consistentes en los resultados de búsqueda al consultar variantes del nombre del negocio.
FUENTE: agendapro.com/mp/co/peluquerias-bogota
NIVEL DE CERTEZA: MEDIO — el contenido no pudo confirmarse por lectura directa de la página (JavaScript), y la inconsistencia entre los dos nombres de reviewer citados por el motor de búsqueda es una señal de que estos fragmentos pueden estar mezclados con otros negocios del mismo directorio. **Se marca como "dato encontrado, pero de fiabilidad limitada."**

No se encontró:
- Calificación numérica / estrellas de Disruptivo en AgendaPro, Google o cualquier otra plataforma — NO ENCONTRADO.
- Texto completo de ninguna reseña (solo se infiere el tipo de servicio y una fecha aproximada) — NO ENCONTRADO.
- Comentarios de Instagram — NO ACCESIBLE.
- Menciones de Andrés en reseñas, trato, puntualidad, confianza, ambiente, precio — NO ENCONTRADO.

**No es posible, con la evidencia disponible, identificar patrones repetidos de percepción del cliente.** Esto contradice directamente uno de los objetivos obligatorios de la sección 6 de la misión, y debe reportarse como una brecha crítica, no rellenarse con suposiciones.

---

## 8. Personalidad de marca

Con Instagram inaccesible (la fuente principal recomendada por la misión para este análisis) y sin reseñas de texto completo, la evidencia disponible para inferir personalidad de marca es mínima. Lo único analizable es el eslogan:

*"El arte llevado a tu pelo, al mejor estilo Disruptivo."*

Observaciones sobre este único dato textual:
- Usa la palabra "arte", lo que sugiere un posicionamiento hacia lo **artístico/creativo** más que hacia lo puramente técnico o utilitario.
- El nombre "Disruptivo" y la frase "al mejor estilo Disruptivo" sugieren una intención de comunicar **innovación, ruptura con lo convencional o atrevimiento**, aunque esto es una lectura del nombre/eslogan, no evidencia de comportamiento real de marca (que es lo que la misión pide priorizar).

CONCLUSIÓN: Con la evidencia disponible, solo se puede afirmar que la marca **se presenta a sí misma** (vía naming y eslogan) con una intención artística y disruptiva. No hay evidencia suficiente (lenguaje en publicaciones, tono de respuesta a clientes, forma de mostrar resultados) para confirmar si esa personalidad se sostiene en la práctica.
EVIDENCIA: Nombre del negocio y eslogan.
FUENTE: peluqueriadeandresrodriguez1.site.agendapro.com/co
NIVEL DE CERTEZA: BAJO — insuficiente para caracterizar personalidad de marca real; se basa en autopresentación, no en comportamiento observado.

**No se debe forzar a Disruptivo dentro de ninguna de las dimensiones sugeridas por la misión (cercana, sofisticada, atrevida, etc.) sin acceso a Instagram y reseñas reales.**

---

## 9. Posicionamiento actual

No hay evidencia suficiente para determinar por qué un cliente elige Disruptivo sobre otra opción.

Lo único disponible es el eslogan orientado a "arte" y "estilo disruptivo", que **sugiere** una intención de posicionarse por creatividad/diferenciación estética más que por precio. Pero:

CONCLUSIÓN: El posicionamiento actual de Disruptivo, tal como es observable públicamente, es débil o indeterminable con la evidencia disponible.
EVIDENCIA: Ausencia de sitio web propio, ausencia de contenido de Instagram accesible, ausencia de precios o portafolio visibles sin fricción, ausencia de reseñas de texto completo.
FUENTE: Conjunto de fuentes de la sección 2.
NIVEL DE CERTEZA: MEDIO-ALTO sobre la debilidad/indeterminación del posicionamiento **observable**; esto no significa que el posicionamiento real (interno, vivido por el dueño y sus clientes) sea débil — solo que no es comunicado de forma legible hacia afuera con las fuentes que pudimos consultar.

No se puede afirmar, con la evidencia recolectada, que Disruptivo compita por precio, calidad, experiencia, especialización, transformación, asesoría, relación con Andrés, estética o ubicación. Todas esas opciones son HIPÓTESIS sin evidencia suficiente.

---

## 10. Presencia digital

| Canal | Estado |
|---|---|
| Instagram | Existe la cuenta (URL confirmada por el usuario), pero el contenido es NO ACCESIBLE con las herramientas usadas (bloqueo HTTP 429 persistente en todos los intentos). |
| Sitio web propio | NO ENCONTRADO. No existe una web oficial distinta del subdominio de AgendaPro. |
| AgendaPro | Existe y es funcional como sistema de reservas, pero **no es indexable por buscadores en su contenido dinámico** (servicios, precios, sucursales, reseñas) — un buscador o un cliente que llega desde Google no puede ver esa información sin abrir la app interactiva. |
| Google Business Profile / Google Maps | NO ACCESIBLE con las herramientas usadas; no se pudo confirmar su existencia, categoría, horarios, teléfono ni reseñas. |
| Facebook | NO ENCONTRADO oficial. Existe una cuenta llamada "Disruptivo Colombia" pero se verificó que es un negocio distinto (ver sección 15). |
| TikTok | NO ENCONTRADO. |
| YouTube, Pinterest, LinkedIn | NO ENCONTRADO. |
| WhatsApp | NO ENCONTRADO ningún enlace, número o integración visible en las fuentes accesibles, a pesar de ser mencionado como canal principal deseado. |

---

## 11. Instagram

**Estado: NO ACCESIBLE.**

Se intentó acceder directamente a `https://www.instagram.com/disruptivo_peluqueria/` en tres ocasiones distintas durante la investigación. Las tres veces el servidor devolvió **HTTP 429 (Too Many Requests)**, un bloqueo típico de Instagram contra accesos automatizados sin sesión autenticada.

Se intentó también localizar la cuenta indirectamente a través de resultados de buscador (bio, seguidores, publicaciones indexadas). Ninguna búsqueda devolvió el handle exacto `disruptivo_peluqueria` con datos de bio, seguidores o posts — solo aparecieron cuentas de nombre similar pero no relacionadas (ver sección 15).

**Ningún dato de bio, enlace, seguidores, publicaciones, reels, captions, hashtags, comentarios, ubicación etiquetada o estilo visual pudo confirmarse.** Todo lo relacionado con la sección 3.A de la misión queda como NO ENCONTRADO / NO ACCESIBLE, y no debe rellenarse con suposiciones en fases posteriores sin volver a intentar el acceso (idealmente con una herramienta con sesión autenticada, o revisión manual humana).

---

## 12. Google / Maps

**Estado: NO ACCESIBLE.**

Los intentos de consultar Google Maps directamente no devolvieron contenido de negocio (la página es una aplicación dinámica). Las búsquedas web generales no arrojaron un resultado claro de ficha de Google Business para "Disruptivo Peluquería" — ninguna búsqueda devolvió un enlace de `google.com/maps/place/...` o similar para el negocio.

No se pudo confirmar: categoría en Google, horarios, teléfono, calificación, número de reseñas, fotos, preguntas y respuestas, ni descripción del negocio en Google.

Tampoco se pudo confirmar independientemente, vía Google Maps, la dirección dada por el usuario (Calle 82 #14A-17, interior 303). Una búsqueda de esa dirección exacta solo devolvió negocios **vecinos** en la zona (Fantia Boutique, Scalpelo Micropigmentación Capilar, Edificio Inalog, Lili-pink, Vaquerito Bar, Notaría 8), lo que sitúa la dirección en el barrio El Lago, Chapinero, cerca de la Calle 82 con Carrera 14A — una zona consistente con salones de peluquería de gama media/alta en Bogotá — pero sin una confirmación directa de que Disruptivo Peluquería esté registrado ahí en una fuente independiente al dato entregado por el usuario.

CONCLUSIÓN: La dirección de Disruptivo no pudo ser verificada de forma independiente; se mantiene como dato aportado por el usuario, no confirmado por esta investigación.
NIVEL DE CERTEZA: NO VERIFICADO (dato de origen: usuario, no fuente pública).

---

## 13. AgendaPro

Ver también secciones 3 y 5.

Lo confirmado:
- Existe una página de reservas dedicada en AgendaPro con subdominio propio.
- El negocio aparece listado en el directorio público de AgendaPro para peluquerías en Bogotá.
- El eslogan del negocio está presente en esa página.
- La interfaz sugiere selección de sucursal.

Lo NO accesible (por ser contenido cargado con JavaScript, no visible a un lector estático de HTML):
- Lista de servicios.
- Precios.
- Duración de servicios.
- Nombre del o los profesionales que atienden.
- Fotografías del negocio.
- Reseñas completas y su calificación promedio.
- Horarios de atención.
- Dirección exacta tal como la muestra AgendaPro.
- Información de contacto (teléfono) tal como la muestra AgendaPro.

Un dato relevante detectado en la búsqueda: el número total de peluquerías listadas en el directorio de Bogotá de AgendaPro apareció de forma inconsistente entre dos consultas distintas (una vez como "47 mejores peluquerías", otra vez el fetch mostró el texto "28 mejores peluquerías" en el título de la misma página). Esto es evidencia de que el contenido es **dinámico y cambia entre cargas** (probablemente por geolocalización, paginación o actualización en tiempo real del listado), lo cual refuerza que ninguna cifra específica vista en este directorio debe tomarse como estable o definitiva.

NIVEL DE CERTEZA general sobre datos de AgendaPro más allá de nombre/eslogan: BAJO — la mayoría de la sección 3.C de la misión no pudo completarse.

---

## 14. WhatsApp

**NO ENCONTRADO.** Ninguna de las fuentes accesibles (página de AgendaPro, resultados de búsqueda) mostró un número de WhatsApp, enlace `wa.me`, o mención textual de WhatsApp asociada a Disruptivo Peluquería.

Esto es relevante porque el brief del proyecto identifica WhatsApp como el "canal principal de reservas que queremos utilizar" — es decir, es una **aspiración/decisión futura del proyecto**, no necesariamente una realidad actual confirmada del negocio. No se debe asumir que Disruptivo ya usa WhatsApp activamente para reservas hoy; eso debe confirmarse directamente con el dueño.

---

## 15. Competidores

Se seleccionaron 5 competidores directos: peluquerías unisex/salones de gama media-alta en Bogotá, con enfoque similar (corte, color, tratamientos), varios de ellos en o cerca de Chapinero — la misma zona donde se ubicaría Disruptivo según el dato aportado por el usuario.

### 1. El Taller del Pelo
- **Ubicación:** Carrera 14A #82-62, Chapinero, Bogotá. (A pocas cuadras de la dirección declarada de Disruptivo).
- **Historia:** Fundado hace ~23 años por Carlos Álvarez, con un posicionamiento explícito de "peluquería alternativa" — cortes desconectados que "no se podían hacer en salones convencionales de Bogotá".
- **Presencia digital:** Sitio web propio (eltallerdelpelo.com) con reserva online, página de Facebook oficial, presencia en TikTok, y —dato inusual y valioso— reseñas en Tripadvisor bajo la categoría "atracción", lo cual amplía su visibilidad más allá de las plataformas típicas de belleza.
- **Servicios:** Corte, color, maquillaje, tratamientos, servicio infantil.
- **Precios:** Mencionados como "razonables" en algunas reseñas, "costoso" en otras — sin lista de precios pública confirmada.
- **Fortalezas:** Historia de marca fuerte y contada ("por qué existe"), multi-canal (web + FB + TikTok + Tripadvisor), narrativa de fundador con propósito claro (romper con lo convencional).
- **Debilidades:** No se encontró evidencia de reservas por WhatsApp ni de precios públicos.
- **Qué hace mejor que Disruptivo (observable):** Tiene una historia de marca articulada y un sitio web propio que centraliza su identidad; Disruptivo no tiene ninguna de las dos cosas de forma pública.
- FUENTE: eltallerdelpelo.com, revistaexclama.com, tripadvisor.com, facebook.com/ElTallerdelPeloOficial

### 2. Marco Antonio Peluquería & Spa
- **Ubicación:** Calle 33 #13A-97, Teusaquillo (una fuente adicional, no verificada de forma cruzada, menciona también una sede en Chapinero — dato con inconsistencia entre fuentes, marcado como tal).
- **Historia:** Se presenta con "más de 30 años de experiencia" (dato de la propia marca, no verificado externamente).
- **Presencia digital:** Sitio web propio, Facebook, Instagram (@marco.antonio.peluqueria, ~4.657 seguidores).
- **Servicios:** Peluquería, barbería, spa facial y de relajación.
- **Precios:** NO ENCONTRADO públicamente.
- **Fortalezas:** Posicionamiento de trayectoria/experiencia larga, oferta ampliada a spa.
- **Qué hace mejor que Disruptivo (observable):** Comunica antigüedad y experiencia de forma explícita; tiene sitio web propio.
- FUENTE: marcoantoniopeluqueria.com, instagram.com/marco.antonio.peluqueria, facebook.com/marcoantoniopeluqueriayspa

### 3. Barcé Peluquerías
- **Ubicación:** Varias sedes (Rosales/Zona G, Salitre).
- **Historia:** Fundada en 2008, con posicionamiento explícito de "excelente servicio y precios accesibles".
- **Presencia digital:** Sitio web propio con página de reservas dedicada, Instagram principal (@barcepeluquerias, ~5.214 seguidores) y cuentas de Instagram por sede.
- **Servicios:** Corte, color, depilación, masajes, tratamientos faciales.
- **Precios:** Desde ~$20.000 COP (el único competidor con un precio de entrada públicamente citado).
- **Fortalezas:** Transparencia de precio de entrada, estructura multi-sede clara, Instagram segmentado por sede (permite comunicación local).
- **Qué hace mejor que Disruptivo (observable):** Precio de entrada visible; esto reduce fricción/incertidumbre para un cliente nuevo, algo que Disruptivo no ofrece en ninguna fuente pública encontrada.
- FUENTE: barcepeluquerias.com, instagram.com/barcepeluquerias, matrimonio.com.co

### 4. Lolas New Concept
- **Ubicación:** Calle 77A #12-52, Piso 2, Bogotá.
- **Especialización:** Balayage, color.
- **Presencia digital:** Instagram (@lolasnewconceptpeluqueria, ~4.102 seguidores, 1.117 publicaciones), sitio web propio, listado en Fresha, salón afiliado a L'Oréal Professionnel.
- **Calificación:** 4.7/5 (fuente no verificada de forma cruzada con Google directamente, aparece en agregadores de terceros).
- **Precios:** NO ENCONTRADO.
- **Fortalezas:** Especialización clara y comunicable (balayage), afiliación a marca profesional reconocible (L'Oréal Professionnel) como señal de calidad/confianza, calificación pública visible.
- **Qué hace mejor que Disruptivo (observable):** Comunica una especialidad técnica concreta y muestra una calificación numérica pública; Disruptivo no muestra ninguna calificación pública verificable.
- FUENTE: lolasnewconcept.com, instagram.com/lolasnewconceptpeluqueria, fresha.com, lorealprofessionnel.com

### 5. InVitro Peluquería
- **Ubicación:** Calle 59 #6-38, Chapinero Alto.
- **Posicionamiento:** Concepto "Salon Emotions" (L'Oréal Professionnel) — salón de gama alta con diagnóstico capilar gratuito, respaldado por cuatro marcas profesionales (Kérastase, L'Oréal Professionnel, Moroccanoil, Schwarzkopf Professional).
- **Presencia digital:** Instagram con ~143.000 seguidores (muy por encima del resto de la competencia analizada), sitio web propio, Facebook, canal de YouTube.
- **Precios:** NO ENCONTRADO.
- **Fortalezas:** Escala de audiencia muy superior, respaldo de marcas profesionales reconocidas como prueba de estándar de calidad, presencia multicanal completa (web + IG + FB + YouTube).
- **Qué hace mejor que Disruptivo (observable):** Diferenciación clara vía marcas respaldantes y una comunidad digital mucho más grande; esto es, con la evidencia disponible, el competidor con la presencia digital más fuerte del grupo analizado.
- FUENTE: invitropeluqueria.com, instagram.com/invitropeluqueria, facebook.com/invitropeluqueria, youtube.com/@invitropeluqueria1611

### Patrón general observado en la competencia
CONCLUSIÓN: Los 5 competidores analizados tienen, como mínimo, un sitio web propio (no solo un panel de reservas de terceros) y al menos una cifra pública de credibilidad (seguidores, calificación, precio de entrada, años de trayectoria, o marca respaldante). Disruptivo, con la evidencia recolectada, no tiene ninguna de estas señales visibles públicamente.
EVIDENCIA: Comparación directa entre los 5 perfiles de competidores y los hallazgos de las secciones 10-13 sobre Disruptivo.
NIVEL DE CERTEZA: ALTO sobre el patrón de la competencia (bien documentado); MEDIO sobre la comparación con Disruptivo (porque Instagram y Google Maps de Disruptivo no pudieron verse, y podrían contener señales de credibilidad no detectadas por esta investigación).

---

## 16. Referentes digitales

Tres referentes internacionales, no necesariamente competidores directos, elegidos por tener una ejecución digital sólida y relevante para una peluquería/barbería (no se copian diseños, se identifican principios).

### 1. Hairrari (Nueva York y Los Ángeles, EE. UU.)
- Barbería explícitamente de género neutro/inclusiva, fundada en 2011 por Magda Ryczko.
- Sitio construido en Squarespace, con Squarespace Commerce para venta de productos y Resurva como sistema de reservas.
- **Principio a aprender:** posicionamiento inclusivo explícito y coherente en todo el sitio (mensaje, fotografía, y hasta el sistema de reservas) — relevante para Disruptivo dado que su público declarado es "hombres y mujeres". Es un ejemplo de cómo comunicar servicio a todos los géneros sin que se sienta genérico.
- FUENTE: hairrari.com, beautylaunchpad.com, nylon.com

### 2. Rudy's Barbershop (Oregon, Washington, Georgia, EE. UU.)
- Cadena con ~30 años de trayectoria, sitio en Shopify con video como elemento principal ("hero"), venta de producto integrada con reservas.
- Flujo de reserva jerárquico: estado → sede → servicio, en un subdominio dedicado (`book.rudysbarbershop.com`).
- **Principio a aprender:** separación clara entre el sitio de marca (storytelling, video, producto) y el flujo de reserva (optimizado solo para conversión), sin que uno estorbe al otro.
- FUENTE: shipwreckdesign.com, graphichavoc.com, siteinspire.com

### 3. Logan Parlor (Chicago, EE. UU.)
- Salón boutique en el barrio Logan Square, con posicionamiento "gender free services" (servicios sin distinción de género en el precio/menú).
- Reconocimientos de la industria: "Chicago's Best New Salon 2014" (Chicago Magazine), nominaciones de Chicago Reader (2022) y Pro Beauty Association (2023), estilistas con premios NAHA.
- **Principio a aprender:** un menú de servicios que no diferencia precio por género (relevante otra vez para el público mixto de Disruptivo) y el uso de reconocimientos/prensa como prueba social en el sitio.
- FUENTE: loganparlor.com, yelp.com

**Nota:** los tres referentes comparten un patrón relevante para Disruptivo: los tres tienen sitio web propio (no dependen solo de un panel de reservas de terceros), y los tres comunican de forma explícita su enfoque de género inclusivo — un ángulo que, dado que Disruptivo también dice atender "hombres y mujeres", podría ser un tema a explorar (no decidir) en la siguiente fase.

---

## 17. SEO local

No se pudo hacer un análisis técnico de posicionamiento (no hay acceso a herramientas de SEO ni a Google Search Console del negocio). Lo que sí se pudo observar mediante búsquedas manuales:

CONCLUSIÓN: El nombre "Disruptivo" es altamente compartido con negocios y proyectos no relacionados, lo que probablemente dificulta el posicionamiento orgánico del nombre de marca por sí solo.
EVIDENCIA: Búsquedas de variantes de "Disruptivo" devolvieron de forma recurrente resultados no relacionados: "Disruptivo Colombia" (tienda de importados), "Disruptivo Café", "Disruptivo TV" / "DisruptivoTV" (canal/cuenta de X e Instagram), "Agencia Disruptivo" (agencia de marketing), "Disruptivo" (colectivo de diseño social), "Disruptivos" (consultoría de negocios digitales), entre otros.
FUENTE: Resultados agregados de más de 10 búsquedas con la palabra "Disruptivo".
NIVEL DE CERTEZA: ALTO sobre la existencia de la colisión de nombre; MEDIO sobre su impacto real en el posicionamiento (no medido con herramientas SEO reales).

Otras observaciones:
- Búsquedas de intención genérica como "peluquería Bogotá", "peluquería Chapinero" devuelven de forma dominante directorios agregadores (AgendaPro, Fresha, StarOfService, Revista Exclama) y salones consolidados con web propia (El Taller del Pelo, Barcé, InVitro, La Peluquería Bogotá, entre otros) — no a Disruptivo.
- Ninguna búsqueda realizada durante esta investigación posicionó a Disruptivo Peluquería en los primeros resultados por encima de sus competidores o de negocios homónimos no relacionados.
- La futura web debería, como mínimo (sin decidir estrategia todavía), tener contenido estático indexable con nombre del negocio + "peluquería" + "Bogotá"/"Chapinero"/dirección, algo que hoy no existe en ninguna URL propia del negocio.

CONCLUSIÓN: Posicionarse sería relativamente difícil en el estado actual, principalmente por dos motivos combinados: (1) colisión de nombre con negocios no relacionados y (2) ausencia total de una URL propia indexable con contenido textual sobre el negocio.
NIVEL DE CERTEZA: MEDIO-ALTO

---

## 18. Análisis visual

**NO ENCONTRADO / NO ACCESIBLE.**

La misión pide analizar color, composición, fotografía, iluminación, edición, estilo de cabello mostrado, vestuario, local, personas y sensación general — todo esto depende casi por completo de Instagram (inaccesible) y de fotos de Google Maps/AgendaPro (inaccesibles). No se encontró ninguna imagen del negocio en las fuentes que sí se pudieron leer (que eran, en su mayoría, texto).

No se debe describir ningún elemento visual de Disruptivo en esta fase. Cualquier descripción visual en este momento sería inventada, lo cual está expresamente prohibido por la regla 17 de la misión.

---

## 19. Problemas detectados

Clasificados según el sistema pedido: **CONFIRMADO / PROBABLE / HIPÓTESIS**.

1. **CONFIRMADO** — No existe un sitio web propio del negocio. Solo existe un panel de reservas de un proveedor externo (AgendaPro), cuyo contenido relevante (servicios, precios, sucursales, reseñas) no es indexable por buscadores.

2. **CONFIRMADO** — El nombre "Disruptivo" está altamente compartido con negocios y proyectos no relacionados, lo que dificulta que un cliente potencial encuentre el negocio correcto al buscar solo el nombre.

3. **CONFIRMADO** — No hay ningún precio de ningún servicio visible públicamente en ninguna fuente accesible.

4. **PROBABLE** — No hay prueba social pública visible (calificación numérica, número de reseñas, testimonios) en ninguna fuente accesible, a diferencia de varios competidores analizados que sí la muestran. (Se marca "probable" y no "confirmado" porque Instagram y Google Maps —donde normalmente vive esta prueba social— no pudieron revisarse.)

5. **PROBABLE** — No se encontró evidencia de integración de WhatsApp en ningún canal público, pese a ser el canal de reservas que el proyecto quiere priorizar. Esto podría representar una desconexión entre el canal deseado y el canal real usado hoy (AgendaPro).

6. **HIPÓTESIS** — La propuesta de valor / diferenciación de Disruptivo frente a competidores no es comunicada de forma clara en ninguna fuente pública accesible, lo que podría contribuir a la baja conversión mencionada en la ficha técnica. Esto es una hipótesis porque no se pudo revisar el contenido real de Instagram, que es probablemente donde la marca sí comunica su diferenciación (solo no pudimos verlo).

7. **HIPÓTESIS** — La dependencia de una sola plataforma externa (AgendaPro) como fuente central de información puede generar fricción: un cliente que llega desde Google no puede ver servicios/precios sin abrir una app interactiva adicional, lo que añade un paso más al proceso de decisión.

Sobre la afirmación central de la ficha técnica ("hay visibilidad digital pero no conversión suficiente"): esta investigación **no pudo confirmarla ni refutarla directamente** (no tuvimos acceso a métricas reales de tráfico, alcance de Instagram, ni tasa de conversión). Lo que sí aporta esta investigación es evidencia estructural indirecta y consistente con esa hipótesis: ausencia de web propia, ausencia de precios visibles, ausencia de prueba social pública y una posible colisión de nombre que dificulta encontrar al negocio — todos factores que, en términos generales, suelen asociarse con baja conversión, pero que no equivalen a una prueba directa del problema declarado en la ficha técnica.

---

## 20. Oportunidades

(Identificadas, no decididas — no son elecciones de diseño ni de estrategia, solo observaciones abiertas a validar)

- Existe una base de al menos un cliente con reseña indexada por AgendaPro; esto sugiere que ya hay actividad real y algo de historial de reseñas que vale la pena rescatar y centralizar en un canal propio.
- Ningún competidor analizado usa WhatsApp como canal de reserva primario documentado; si Disruptivo lo prioriza (como el proyecto plantea) y lo hace bien, podría ser un diferenciador de fricción baja frente al grupo de competencia analizado.
- El eslogan actual ("El arte llevado a tu pelo") ya apunta hacia un ángulo artístico que ningún competidor analizado usa como mensaje central (los competidores se apoyan más en trayectoria, marcas respaldantes o especialización técnica) — podría ser un espacio de diferenciación a explorar, no a decidir todavía.
- La colisión de nombre con "Disruptivo Colombia" y otros usos del término es un problema, pero también una oportunidad de aclarar activamente la identidad del negocio (ej. mediante contenido que combine "Disruptivo" + "peluquería" + ubicación de forma consistente).
- Ningún competidor analizado, salvo Barcé, muestra un precio de entrada público. Publicar aunque sea un precio de referencia podría diferenciar a Disruptivo por transparencia.

---

## 21. Información contradictoria

- El conteo de peluquerías listadas en el directorio de AgendaPro Bogotá varió entre "47" y "28" en dos lecturas distintas de la misma URL (`agendapro.com/mp/co/peluquerias-bogota`) — evidencia de contenido dinámico/paginado, no un dato fijo.
- El nombre del reviewer asociado al servicio "Corte corto" fechado el 19 de mayo de 2026 apareció como "Armando Ospina" en una búsqueda y como "Björn Willms" en otra, ambas atribuidas al mismo listado de Disruptivo — no se pudo determinar cuál (si alguno) es correcto, ni si ambos son reseñas distintas del mismo día.
- Una fuente ubica a Marco Antonio Peluquería (competidor) en Teusaquillo, otra fuente distinta menciona una sede adicional en Chapinero — no verificado de forma cruzada, se reporta como inconsistencia de fuente externa, no de Disruptivo.

---

## 22. Información desconocida

Estas son las brechas que **deben preguntarse directamente al dueño** antes de definir cualquier cosa en la siguiente fase (ver también sección 24):

- Historia real del negocio: cuándo se fundó, por qué se eligió el nombre "Disruptivo".
- Trayectoria profesional de Andrés Rodríguez y de cualquier otro estilista que trabaje en el salón.
- Número de sucursales reales (el selector de AgendaPro sugiere más de una, pero no está confirmado).
- Catálogo completo de servicios y precios actuales.
- Si Instagram es gestionado activamente por Andrés o por alguien más, y con qué frecuencia se publica.
- Si existe o ha existido alguna vez un sitio web propio.
- Si existe Google Business Profile, y si el dueño tiene acceso/control de él.
- Si WhatsApp ya se usa hoy de manera informal (número personal, por ejemplo) aunque no esté documentado públicamente.
- Perfil real de cliente: edades, motivaciones, cómo llegan hoy (referidos, Instagram, Google, caminando).
- Cuál es, en palabras del propio dueño, la propuesta de valor frente a la competencia.
- Métricas actuales de Instagram (seguidores, alcance, interacción) y de AgendaPro (visitas a la página, tasa de reserva completada).
- Contenido y hallazgos completos de la ficha técnica académica mencionada en el brief, que no fue entregada a esta investigación.

---

## 23. Hipótesis que debemos validar

- Que la baja conversión mencionada en la ficha técnica está relacionada con la ausencia de un sitio propio y de precios visibles (HIPÓTESIS, sección 19).
- Que el público es efectivamente mixto en proporciones significativas de hombres y mujeres, y no predominantemente uno de los dos (HIPÓTESIS, sección 6).
- Que existe más de una sucursal (HIPÓTESIS, sección 3/13).
- Que el posicionamiento "artístico" del eslogan se sostiene y es reconocido así por los clientes reales, y no es solo un eslogan aspiracional (HIPÓTESIS, sección 8-9).
- Que WhatsApp no está siendo usado hoy de forma activa como canal de reserva (HIPÓTESIS por ausencia de evidencia, no por evidencia directa de que no se use — podría usarse de forma informal y no estar documentado públicamente).

---

## 24. Preguntas para el dueño

1. ¿Cuándo y por qué nació Disruptivo Peluquería? ¿De dónde viene el nombre?
2. ¿Cuál es tu rol exacto — dueño, estilista principal, ambos? ¿Cuál es tu trayectoria?
3. ¿Cuántas sedes tiene el negocio hoy? ¿Dónde están?
4. ¿Cuál es el catálogo completo de servicios y sus precios actuales?
5. ¿Quién administra el Instagram? ¿Con qué frecuencia se publica y qué tipo de contenido funciona mejor?
6. ¿Existe o ha existido alguna vez una página web propia?
7. ¿Tienen Google Business Profile? ¿Tienes acceso a él?
8. ¿Usan WhatsApp hoy para reservas o consultas, aunque sea de forma informal?
9. ¿Cómo describirías, en tus propias palabras, qué hace diferente a Disruptivo de otras peluquerías de Bogotá?
10. ¿Quiénes son tus clientes típicos — rango de edad, cómo te encuentran, por qué vuelven?
11. ¿Qué te dicen tus clientes que más valoran cuando te dejan una reseña o te lo dicen en persona?
12. ¿Tienes acceso a las estadísticas de Instagram y de AgendaPro (alcance, visitas, reservas completadas vs. iniciadas)?
13. ¿Puedes compartir el contenido completo de la ficha técnica académica de marketing mencionada, para poder contrastarla con esta investigación?

---

## 25. Recomendaciones para la siguiente fase

- Antes de avanzar a definiciones de marca o web, se recomienda una sesión de entrevista directa con Andrés Rodríguez que cubra específicamente las preguntas de la sección 24 — la mayoría de la información crítica (historia, cliente, propuesta de valor, servicios reales) no es accesible públicamente con las herramientas usadas en esta investigación.
- Se recomienda intentar de nuevo el acceso a Instagram con un método que sí pueda ver contenido público (por ejemplo, revisión manual humana desde un navegador, o una herramienta con sesión autenticada), dado que fue la fuente más rica prevista por la misión y terminó siendo la más bloqueada.
- Se recomienda solicitar directamente al dueño (o a quien tenga acceso) capturas o exportes del panel de AgendaPro (servicios, precios, reseñas) ya que su contenido dinámico no es accesible por lectura automatizada externa.
- Se recomienda solicitar el documento completo de la ficha técnica académica para poder contrastarla rigurosamente con hallazgos externos, tal como pide la misión, en lugar de trabajar solo con el resumen entregado en el brief.
- Cualquier definición de posicionamiento, propuesta de valor o personalidad de marca debería esperar a tener, como mínimo, acceso a Instagram y a reseñas reales — hacerlo antes sería definir la marca desde el nombre y el eslogan únicamente, que es precisamente lo que la misión pide evitar.
