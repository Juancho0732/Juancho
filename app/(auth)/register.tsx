import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Input, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';

/**
 * Placeholder visual. La autenticación real (Supabase Auth, validación,
 * manejo de errores) se implementa en Fase 3.
 */
export default function RegisterScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Crea tu cuenta</Text>
        <Input label="Nombre" placeholder="Tu nombre" editable={false} />
        <Input label="Correo" placeholder="tu@correo.com" keyboardType="email-address" autoCapitalize="none" editable={false} />
        <Input label="Contraseña" placeholder="••••••••" secureTextEntry editable={false} />
        <Button label="Crear cuenta" disabled />
        <Text variant="caption" color="textSecondary" style={styles.note}>
          Disponible en la Fase 3 (Authentication).
        </Text>
        <Link href="/login" style={styles.link}>
          <Text variant="body" color="primary">
            ¿Ya tienes cuenta? Inicia sesión
          </Text>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.md,
  },
  note: {
    textAlign: 'center',
  },
  link: {
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
  },
});
