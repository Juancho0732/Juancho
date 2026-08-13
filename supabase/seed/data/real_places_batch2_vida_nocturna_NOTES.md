# Lote 2 — Vida Nocturna (Bogotá)

Motivo: tras la ronda de correcciones del lote 1, la categoría **Vida Nocturna
quedó en 0 lugares** (Theatron, el único aceptado, salió por horario inferido).
Una categoría vacía se ve como una app rota, así que este lote existe para
cerrar ese hueco.

Archivo: `real_places_batch2_vida_nocturna.csv` — 2 filas. Ningún INSERT
ejecutado contra Supabase.

## Hallazgo estructural (lo más importante de esta ronda)

**Los establecimientos de vida nocturna de Bogotá casi no publican horarios
oficiales.** Se revisaron ~14 locales; de todos ellos, **uno solo** (Galería
Café Libro) publica horario en su propio sitio. Verificado directamente:

- `cumbiahouse.com` → publica dirección, **no** horario.
- `andrescarnederes.com/andres-dc` → publica dirección, **no** horario.
- `octavaclub.com` → **ni** dirección **ni** horario.
- `portaltheatron.co` → publica dirección, **no** horario (confirma que la
  decisión de sacar a Theatron del lote 1 fue correcta).
- `cityin.com.co` (Video Club) → dirección, **no** horario.
- `quiebracanto.com` → **no** publica ni dirección ni horario.

El campo `schedule` es obligatorio en `import_real_places.py` (aunque el
esquema de la base sí acepta NULL). En esta categoría eso obliga a elegir
entre inventar un horario o descartar el lugar — por eso la categoría lleva
dos rondas quedando casi vacía. Ver "Recomendación" al final.

## Aceptados (2)

### 1. Galería Café Libro (Parque 93)
- Dirección: Carrera 11A #93-42 — sitio oficial.
- Horario: `mar_sab=17:00-03:00` — sitio oficial
  (`galeriacafelibro.com.co/page/sedes`: "martes a sábados: 5:00 pm a 3:00
  am"), **confirmado de forma independiente** por hotelesb3.com ("martes a
  sábado de 5:00 pm a 3:00 am"). Doble fuente.
- Precio: $50.400 por persona — degusta.com.co (fuente ya usada y aceptada en
  el lote 1 para Metrónomo Bar).
- Coordenadas: `4.6753951, -74.047949` — match de POI en OSM ("Galería, Café y
  Libro, Carrera 11A", `type=bar`). No aproximado. Queda a ~60 m del BBC
  Parque 93 del lote 1, consistente con estar en la misma cuadra.
- El sitio oficial también menciona "Domingos prefestivos de 6:00 pm a 3:00
  am". Es condicional (solo domingos prefestivos), así que **no** se metió en
  `schedule` para no presentarlo como horario regular; se dejó dicho en la
  `description`.
- Nota: el sitio oficial lista además una sede Palermo y una "Salón Café
  Bohemia" **en la misma dirección** (Trv 15B #46-38) pero con horarios
  distintos entre sí. Esa contradicción de la propia fuente es la razón por la
  que solo se cargó la sede Parque 93.

### 2. Casa Quiebra Canto
- Dirección: Carrera 5 #17-76 — coincide en **tres** fuentes independientes
  (hotelesb3, degusta, El Tiempo).
- Horario: `jue_sab=17:00-03:00` — hotelesb3.com ("jueves a sábado de 5:00 pm
  a 3:00 am"), página leída directamente.
- Precio: $45.000 por persona — degusta.com.co.
- Coordenadas: `4.6032177, -74.0706732` — match de POI en OSM
  ("Quiebracanto", `type=bar`). No aproximado.
- **Localidad: Santa Fe, no Candelaria.** Degusta la ubica en "La Candelaria"
  (uso coloquial de "el centro"), pero el reverse-geocoding de OSM la sitúa en
  el barrio La Veracruz, Localidad Santa Fé. Se aplicó el mismo criterio que
  con MAMBO en el lote 1: manda el límite administrativo, no el nombre
  coloquial. Genera advertencia no bloqueante del importador (Santa Fe no está
  entre las 6 localidades curadas).

## Rechazados / pendientes, y por qué

| Lugar | Qué falta | Detalle |
|---|---|---|
| Cumbia House (Gaira) | horario verificable | Dirección oficial ✓, precio $80.000 (degusta) ✓, coordenada de POI ✓ (`4.6806323, -74.0476341`). Los horarios solo aparecen en agregadores scrapeados; restaurantguru devolvió 503 y carta.menu 403, así que **no** se pudo leer la fuente directamente. A un solo campo de entrar. |
| Salsa Camará | precio | Dirección y horario ✓ (hotelesb3, leído: Cra 11 #70A-22, jue-sáb 16:00-03:00). Las cifras de precio se contradicen entre fuentes (25.000 / 60.000-80.000 / reales brasileños), así que ninguna es usable. |
| Andrés D.C. | dirección y precio | El sitio oficial dice "Calle 82 No. 11 – 15"; Tripadvisor y degusta dicen "Calle 82 No. 12-21". Conflicto sin resolver. Precio no confirmado para la sede D.C. |
| El Coq | precio | Horario (mié-dom 22:00-03:00) y dirección (Ac. 85 #13-85) de agregadores; sin precio. |
| Latino Power | precio | Calle 58 #13-88, jue-sáb 21:00-03:00; página oficial de contacto da 404. |
| Baum | precio | Calle 33 #6-24, vie-sáb 22:00-05:00 según Resident Advisor, pero RA responde 403 y no se pudo leer directo. |
| Octava | horario y precio | El sitio oficial no publica ni dirección ni horario. |
| Video Club | horario y precio | Sin horario en ninguna fuente; solo "abre hasta las 5am". |
| Habana 93 | dirección | hotelesb3 solo dice "parque la 93", sin número. |
| Theatron | horario | Sigue sin horario oficial publicado (confirmado en portaltheatron.co). Se mantiene fuera. |
| Armando Records | horario | **Trampa evitada:** Páginas Amarillas publica "lun-sáb 8:00-18:00", que es el horario de oficina de la empresa Armando Records SAS, no del club. No se usó. |

## Recomendación

Dos opciones para desbloquear esta categoría de forma permanente:

1. **Permitir `schedule` vacío** en `import_real_places.py` (la base ya lo
   acepta) y que la app muestre "Horario no publicado — confirmar con el
   lugar" en vez de un horario inventado. Es la opción honesta y desbloquea
   de inmediato ~6 lugares que ya tienen todo lo demás verificado.
2. **Aceptar agregadores como fuente de horario** de forma explícita para esta
   categoría. Más rápido, pero baja el estándar de trazabilidad que se aplicó
   al lote 1.

La opción 1 es la recomendada: no baja el estándar y además refleja mejor la
realidad (los clubes de Bogotá abren por evento, no por horario fijo).
