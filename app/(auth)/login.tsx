import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button, FormInput, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';
import { signIn, loginSchema, type LoginInput } from '@/features/auth';
import { logAndGetSafeMessage } from '@/utils/errors';

export default function LoginScreen() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await signIn(values);
      // useProtectedRoute (app/_layout.tsx) redirige a /home al detectar la sesión.
    } catch (error) {
      setSubmitError(logAndGetSafeMessage('signIn', error, 'No se pudo iniciar sesión. Verifica tu correo y contraseña.'));
    }
  });

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Inicia sesión</Text>

        <FormInput
          control={control}
          name="email"
          label="Correo"
          placeholder="tu@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          errorMessage={errors.email?.message}
        />
        <FormInput
          control={control}
          name="password"
          label="Contraseña"
          placeholder="••••••••"
          secureTextEntry
          errorMessage={errors.password?.message}
        />

        {submitError ? (
          <Text variant="caption" color="danger">
            {submitError}
          </Text>
        ) : null}

        <Button
          label={isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
          onPress={onSubmit}
          disabled={isSubmitting}
        />

        <Link href="/register" style={styles.link}>
          <Text variant="body" color="primary">
            ¿No tienes cuenta? Regístrate
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
  link: {
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
  },
});
