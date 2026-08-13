import type { ExpoConfig } from 'expo/config';

/**
 * app.config.ts en vez de app.json: la Fase 5 necesita leer
 * GOOGLE_MAPS_API_KEY de una variable de entorno en tiempo de build (no es
 * EXPO_PUBLIC_ porque no la usa el bundle JS, solo la config nativa de
 * Android que `expo prebuild`/EAS Build vuelcan en AndroidManifest.xml).
 */
const config: ExpoConfig = {
  name: 'Zone',
  slug: 'zone',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'zone',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    // Identificador definitivo, aprobado por el equipo junto con el nombre
    // "Zone". Cambiarlo después de la primera build interna solo obliga a
    // generar una build nueva; en App Store sí queda atado a la ficha.
    bundleIdentifier: 'com.zone.app',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    // Mismo identificador que ios.bundleIdentifier. Ojo: en Android el
    // applicationId queda fijo PARA SIEMPRE una vez que se publica en Google
    // Play, así que este valor ya no debería cambiar.
    package: 'com.zone.app',
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
  },
  extra: {
    // PENDIENTE -- REQUIERE DECISIÓN HUMANA (login de una cuenta Expo/EAS):
    // `eas init` (o la primera vez que se corre `eas build`) rellena esto
    // automáticamente con el ID real del proyecto en EAS. No se puede
    // generar ni inventar desde acá -- sin este valor, eas.json/build
    // funciona igual para builds locales, pero `eas build` en la nube lo va
    // a pedir.
    eas: {
      projectId: 'PENDIENTE-correr-eas-init',
    },
  },
};

export default config;
