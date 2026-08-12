import type { ExpoConfig } from 'expo/config';

/**
 * app.config.ts en vez de app.json: la Fase 5 necesita leer
 * GOOGLE_MAPS_API_KEY de una variable de entorno en tiempo de build (no es
 * EXPO_PUBLIC_ porque no la usa el bundle JS, solo la config nativa de
 * Android que `expo prebuild`/EAS Build vuelcan en AndroidManifest.xml).
 */
const config: ExpoConfig = {
  name: 'Juancho',
  slug: 'Juancho',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'juancho',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    // PLACEHOLDER -- REQUIERE DECISIÓN HUMANA: "com.example.*" es el prefijo
    // que usa el propio Expo para identificadores sin definir todavía; no es
    // un identificador real ni reservado para este proyecto. Un build con
    // este valor puede generarse (para probar el pipeline) pero NO puede
    // subirse a App Store Connect -- ahí sí hace falta el identificador
    // definitivo, decidido por el equipo (normalmente ligado al dominio de
    // la organización, ej. "com.juancho.app" solo si el equipo controla ese
    // dominio/marca). Cambiar este valor después de la primera build interna
    // requiere generar una build nueva, no hay problema en decidirlo tarde.
    bundleIdentifier: 'com.example.juancho',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    // PLACEHOLDER -- REQUIERE DECISIÓN HUMANA: mismo caso que
    // ios.bundleIdentifier arriba, ver ese comentario. En Android además es
    // MÁS difícil de cambiar después de publicar en Google Play (el
    // "application ID" queda fijo para siempre una vez publicado), así que
    // conviene decidirlo antes de la primera subida real a la Play Store
    // (una build interna de prueba con este placeholder no ata nada).
    package: 'com.example.juancho',
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
