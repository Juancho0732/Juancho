import MapView, { Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';

import { theme } from '@/design-system/theme';

type Props = {
  lat: number;
  lng: number;
  title: string;
};

/**
 * Vista nativa (iOS/Android) — Apple Maps en iOS (sin costo), Google Maps en
 * Android (necesita `GOOGLE_MAPS_API_KEY`, ver app.config.ts). No hay
 * versión web de `react-native-maps`; el fallback está en el archivo
 * `.web.tsx` de al lado, que Metro resuelve automáticamente por plataforma.
 */
export function PlaceMapPreview({ lat, lng, title }: Props) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker coordinate={{ latitude: lat, longitude: lng }} title={title} />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 180,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
});
