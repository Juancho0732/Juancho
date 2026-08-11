import { StyleSheet, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';

export default function ProfileScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Perfil</Text>
        <Card>
          <Text variant="body" color="textSecondary">
            Nombre, correo y preferencias del usuario aparecerán aquí una vez implementada la
            autenticación (Fase 3).
          </Text>
        </Card>
        <Button label="Cerrar sesión" variant="secondary" disabled />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.md,
  },
});
