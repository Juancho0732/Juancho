import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/design-system/theme';

import { Button } from './Button';
import { Card } from './Card';
import { Text } from './Text';

/**
 * Mensaje genérico a propósito (auditoría de beta-readiness, Prioridad 2):
 * nunca mostrar detalles internos, de Supabase o de red al usuario.
 */
const DEFAULT_ERROR_MESSAGE = 'No pudimos cargar esto. Revisa tu conexión e intenta de nuevo.';

type Props = {
  isLoading: boolean;
  isError: boolean;
  /** Se llama al tocar "Reintentar". Normalmente el `refetch` de React Query. */
  onRetry: () => void;
  /** true si la consulta funcionó pero no hay datos que mostrar (distinto de un error). */
  isEmpty: boolean;
  emptyMessage: string;
  loadingMessage?: string;
  errorMessage?: string;
  children: ReactNode;
};

/**
 * Estado reutilizable para pantallas que dependen de una query: carga, error
 * (con acción de Reintentar), vacío (sin resultados, distinto de un error) o
 * el contenido real. Mismo patrón visual que ya usaba `recommendations.tsx`
 * antes de esta fase (Card + texto + botón), ahora compartido.
 */
export function QueryState({
  isLoading,
  isError,
  onRetry,
  isEmpty,
  emptyMessage,
  loadingMessage = 'Cargando…',
  errorMessage = DEFAULT_ERROR_MESSAGE,
  children,
}: Props) {
  if (isLoading) {
    return (
      <Card>
        <Text variant="body" color="textSecondary">
          {loadingMessage}
        </Text>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <View style={styles.errorContent}>
          <Text variant="body" color="danger">
            {errorMessage}
          </Text>
          <Button label="Reintentar" variant="secondary" onPress={onRetry} />
        </View>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card>
        <Text variant="body" color="textSecondary">
          {emptyMessage}
        </Text>
      </Card>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  errorContent: {
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
});
