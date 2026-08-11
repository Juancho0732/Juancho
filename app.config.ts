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
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
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
};

export default config;
