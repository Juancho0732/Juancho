# Marketing Metrics

Aplicación web (PWA), optimizada para iPad, para calcular, comparar y entender
métricas financieras y de marketing. Recibe datos del negocio, calcula 18
métricas con fórmulas documentadas, las explica en lenguaje sencillo y ofrece
un simulador de escenarios, diagnóstico automático y un Health Score.

Todos los datos se guardan **solo en el dispositivo** (IndexedDB del
navegador) — no hay backend ni se envía información a servicios externos.

## Instalarla en un iPad (o iPhone)

La app se despliega automáticamente a GitHub Pages en cada push a `main` o a
`claude/marketing-metrics-app-7ynccy` (ver
`.github/workflows/deploy-pages.yml`). Una vez publicada, queda disponible en:

**https://duquem5765-gif.github.io/Claude-pro/**

Para instalarla:

1. Abre esa URL en **Safari** en el iPad (tiene que ser Safari).
2. Toca el ícono de compartir (el cuadrado con la flecha hacia arriba).
3. Elige **"Añadir a pantalla de inicio"**.
4. Listo — queda como app instalada, con su propio ícono, y funciona offline
   (el service worker cachea la app; los datos siempre viven solo en el
   dispositivo, con o sin conexión).

## Requisitos

- Node.js 20 o superior
- npm

## Ejecutar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` en el navegador. La app funciona igual en
escritorio, iPad e iPhone (diseño responsive, sidebar en iPad/desktop, barra
inferior en iPhone).

Para instalarla como PWA (pantalla de inicio de iPad): abre la URL en Safari,
toca el botón de compartir y selecciona "Añadir a pantalla de inicio". Para
probar el modo instalado/offline hace falta servir un build de producción
(ver abajo), no el servidor de desarrollo.

## Otros comandos

```bash
npm run build      # build de producción (tsc + vite build), genera /dist
npm run preview    # sirve el build de producción en local
npm run test       # corre los 163 tests (Vitest) una vez
npm run test:watch # corre los tests en modo watch
npm run lint       # oxlint
```

## Arquitectura

- `src/core/` — motor de cálculo: fórmulas puras y testeadas (sin React),
  validaciones, motor de diagnóstico, Health Score y motor de escenarios.
  Cada fórmula documenta su fórmula, variaciones conocidas y la decisión
  tomada directamente en el código.
- `src/data/` — capa de datos local (Dexie/IndexedDB): proyectos, periodos
  (snapshots) y escenarios, más exportación/importación (CSV, PDF).
- `src/components/` — componentes de UI reutilizables (layout, calculadora
  genérica dirigida por metadata, gráficos, UI base).
- `src/pages/` — una página por sección (Dashboard, Calculadoras, Simulador,
  Diagnóstico, Health Score, Gráficos, Historial, Proyectos, Aprendizaje).
- `src/content/` — contenido educativo del Modo Aprendizaje.

## Privacidad

No hay login ni sincronización entre dispositivos: si se borra el
navegador/dispositivo sin exportar antes (CSV desde Proyectos), los datos se
pierden. Se recomienda exportar periódicamente como respaldo.
