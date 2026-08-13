# Lugares fuera del lote — pendientes de revisión o descartados

Este archivo documenta los 4 lugares que estaban en la versión original de
`real_places_batch1_bogota.csv` (32 filas) y que la ronda de corrección de
calidad sacó del CSV. Ninguno de los 4 está en el archivo actual (28 filas).
Se documentan acá para no perder el trabajo de investigación ya hecho, no
para que se importen tal cual.

## RECHAZADO (no se repone en este lote)

### Presence Spa (Hotel Marriott Bogotá)
- **Motivo:** la localidad usada ("Salitre") no es una localidad
  administrativa válida de Bogotá -- Salitre es un sector/zona informal, no
  una de las 20 localidades oficiales. La dirección real (Avenida El Dorado
  #69B-53) cae en la localidad de **Fontibón**.
- **Decisión del usuario:** eliminar del lote, no reemplazar todavía.
- **Para reactivarlo en un lote futuro:** volver a armar la fila con
  `locality = Fontibón` (o la localidad oficial que corresponda tras
  verificar la dirección exacta) y volver a pasar por la validación completa
  de 10 criterios.

## REVISAR (coordenadas no verificables con confianza suficiente)

### Parque Nacional Enrique Olaya Herrera
- **Coordenadas:** no se encontró en OpenStreetMap/Nominatim un punto que
  corresponda específicamente a "Carrera 7 con Calle 39" (la referencia
  usada). Los intentos devolvieron el centroide del barrio/parque completo
  (`lat=4.6221748, lng=-74.0629696`, tipo `neighbourhood`) o el centroide del
  polígono del parque (`lat=4.6238922, lng=-74.0615740`, tipo `park`) -- ninguno
  es la esquina puntual referenciada.
- **Localidad:** confirmada repetidamente por reverse-geocoding como
  **Santa Fe** (no Chapinero, como estaba en el CSV original). Este dato sí
  es confiable y puede aplicarse cuando el registro se retome.
- **Por qué no se aproxima silenciosamente:** instrucción explícita del
  usuario -- si no se puede verificar una coordenada exacta con confianza,
  se marca REVISAR en vez de aproximar.
- **Para resolverlo:** conseguir una fuente con coordenadas puntuales (ej.
  Google Places API, o confirmación manual en el sitio) en vez de depender
  solo de Nominatim.

### Scape Games (Galerías)
- **Coordenadas:** no se encontró ningún resultado a nivel de POI o de
  dirección exacta en Nominatim para "Transversal 24 #53C-56" ni para el
  nombre del negocio ("Scape Games", "worldofescapes"). Los intentos con la
  dirección solo devolvieron segmentos genéricos de la Transversal 24 en
  distintas localidades (Teusaquillo, Ciudad Bolívar), ninguno específico al
  número #53C-56.
- **Localidad:** Teusaquillo/Galerías ya estaba confirmada correcta en la
  auditoría anterior (esto no cambia); solo la precisión de la coordenada
  queda pendiente.
- **Para resolverlo:** mismo camino que Parque Nacional -- se necesita una
  fuente de geocodificación más precisa que Nominatim para este negocio
  puntual.

### Theatron
- **Motivo:** el horario `jue_sab=21:00-03:00` que estaba en el CSV original
  no viene de ninguna fuente oficial publicada -- se había *inferido* de la
  estructura de precios del cover (20.000 COP de 9 a 10pm, luego tragos
  ilimitados hasta las 2am), tal como quedó registrado en
  `real_places_batch1_bogota_RESEARCH_NOTES.md` (fila 22: "NOTA: horario
  exacto por día no confirmado en fuente oficial explícita -- inferido de
  los cortes de precio del cover").
- **Por qué se saca del lote en vez de dejar un horario "vacío":** el campo
  `schedule` es obligatorio para el importador y no tiene una forma honesta
  de representar "no se sabe" sin construir un valor que de todos modos
  parezca un horario real. A diferencia de Bogotá Bike Tours (que sí tiene
  dos horas puntuales verificadas, solo mal representadas como rango),
  Theatron no tiene ningún dato horario verificado que se pueda usar.
- **Para resolverlo:** conseguir el horario oficial directamente del club
  (redes sociales oficiales, o visita/llamada) en vez de inferirlo del
  precio.

---

Ninguno de estos 4 lugares fue insertado en ninguna base de datos. Este
archivo es solo un registro de investigación para retomar en un lote
posterior.
