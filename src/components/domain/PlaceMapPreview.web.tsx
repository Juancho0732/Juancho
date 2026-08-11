import { StyleSheet, View } from 'react-native';

import { theme } from '@/design-system/theme';

type Props = {
  lat: number;
  lng: number;
  title: string;
};

/**
 * Fallback web: `react-native-maps` no tiene versión web. En vez de dejar un
 * hueco vacío, se embebe OpenStreetMap (gratis, sin API key) — coherente con
 * la decisión de Fase 0 de no usar Google Maps/Mapbox de pago. La app nativa
 * (iOS/Android) usa `PlaceMapPreview.tsx`, con el mapa real interactivo.
 */
export function PlaceMapPreview({ lat, lng, title }: Props) {
  const delta = 0.006;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${lat}%2C${lng}&layer=mapnik`;
  const viewUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <View style={styles.wrapper}>
      <iframe
        title={`Mapa de ${title}`}
        src={embedUrl}
        style={{ width: '100%', height: 180, border: 0, borderRadius: theme.radius.md }}
      />
      <a href={viewUrl} target="_blank" rel="noreferrer" style={linkStyle}>
        Ver en OpenStreetMap ↗
      </a>
    </View>
  );
}

const linkStyle = {
  color: theme.colors.primary,
  fontSize: theme.typography.size.sm,
  marginTop: theme.spacing.xs,
  textDecoration: 'none',
} as const;

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.xs,
  },
});
