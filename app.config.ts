import type { ExpoConfig } from 'expo/config';

/**
 * app.config.ts en vez de app.json: la Fase 5 necesita leer
 * GOOGLE_MAPS_API_KEY de una variable de entorno en tiempo de build (no es
 * EXPO_PUBLIC_ porque no la usa el bundle JS, solo la config nativa de
 * Android que `expo prebuild`/EAS Build vuelcan en AndroidManifest.xml).
 */
const config: ExpoConfig = {
  name: 'Parch Out',
  slug: 'parch-out',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'parchout',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    // Renombrado de com.zone.app a com.parchout.app junto con el rebrand a
    // "Parch Out" (2026-09-14). La app todavía no se había publicado, así
    // que este es el último momento en que cambiarlo es gratis — después de
    // la primera build interna solo obliga a generar una build nueva; en App
    // Store sí queda atado a la ficha.
    bundleIdentifier: 'com.parchout.app',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#EFF7FC',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    // Mismo identificador que ios.bundleIdentifier. Ojo: en Android el
    // applicationId queda fijo PARA SIEMPRE una vez que se publica en Google
    // Play, así que este valor ya no debería cambiar.
    package: 'com.parchout.app',
    // Requerido por react-native-maps en Android (Google Maps SDK). En iOS no
    // hace falta: usa Apple Maps por defecto, sin costo ni key. Ver README
    // "Mapas (Fase 5)" para cómo conseguir esta key.
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
      },
    },
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-dev-client',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Usamos tu ubicación para mostrarte planes cercanos.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    // Solo se define para el export estático de GitHub Pages (ver
    // .github/workflows/deploy-web.yml), que sirve el sitio bajo /Juancho/
    // en vez de la raíz del dominio. Sin EXPO_WEB_BASE_URL (build nativo o
    // `expo start`), esto queda undefined y no afecta nada.
    baseUrl: process.env.EXPO_WEB_BASE_URL,
  },
  owner: 'juancho0725',
  updates: {
    url: 'https://u.expo.dev/f49fad08-a17f-468a-b90a-89d24bd812b5',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  extra: {
    // ID real del proyecto en EAS (@juancho0725/zone), creado con `eas init`.
    // Se escribe a mano porque `eas init` no sabe editar un app.config.ts
    // (solo app.json); el valor viene de la API de Expo, no es inventado.
    eas: {
      projectId: 'f49fad08-a17f-468a-b90a-89d24bd812b5',
    },
  },
};

export default config;
