import { Modal, StyleSheet, View } from 'react-native';

import { theme } from '@/design-system/theme';

import { Button } from './Button';
import { Text } from './Text';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Prioridad 6: deshabilita ambos botones mientras la acción está en curso. */
  isConfirming?: boolean;
  /** Prioridad 6: si la acción falló, se muestra acá y el diálogo permanece abierto
   * (nunca se cierra solo ni deja a la persona sin saber que falló). */
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * `Alert.alert` de React Native es un no-op en react-native-web (no muestra
 * nada), así que las confirmaciones destructivas (borrar una reseña) usan
 * este modal propio en vez de romperse silenciosamente en la web.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isConfirming = false,
  errorMessage,
  onConfirm,
  onCancel,
}: Props) {
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text variant="subtitle">{title}</Text>
          {message ? (
            <Text variant="body" color="textSecondary">
              {message}
            </Text>
          ) : null}
          {errorMessage ? (
            <Text variant="caption" color="danger">
              {errorMessage}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <View style={styles.actionButton}>
              <Button
                label={cancelLabel}
                variant="secondary"
                onPress={onCancel}
                disabled={isConfirming}
              />
            </View>
            <View style={styles.actionButton}>
              <Button
                label={isConfirming ? 'Un momento…' : confirmLabel}
                onPress={onConfirm}
                disabled={isConfirming}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
