import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/design-system/theme';

import { Text } from './Text';
import { useToastStore } from './toastStore';

const AUTO_HIDE_MS = 4000;

/**
 * Se monta una sola vez en app/_layout.tsx. Cualquier código, incluso fuera
 * de un componente (el onError de una mutación), puede mostrar un mensaje
 * con `useToastStore.getState().showToast(...)`.
 */
export function Toast() {
  const message = useToastStore((state) => state.message);
  const hideToast = useToastStore((state) => state.hideToast);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hideToast, AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [message, hideToast]);

  if (!message) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.toast}>
        <Text variant="body" color="textInverse">
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: theme.spacing.xl,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  toast: {
    backgroundColor: theme.colors.textPrimary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    maxWidth: 480,
  },
});
