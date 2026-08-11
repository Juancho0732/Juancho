import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button, Card, FormInput, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';
import { signUp, registerSchema, type RegisterInput } from '@/features/auth';

export default function RegisterScreen() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const result = await signUp(values);
      if (result.needsEmailConfirmation) {
        setNeedsEmailConfirmation(true);
      }
      // Si no requiere confirmación, useProtectedRoute redirige a /home solo.
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo crear la cuenta.');
    }
  });

  if (needsEmailConfirmation) {
    return (
      <Screen>
        <View style={styles.content}>
          <Text variant="title">Revisa tu correo</Text>
          <Card>
            <Text variant="body" color="textSecondary">
              Te enviamos un enlace de confirmación. Ábrelo para activar tu cuenta y luego inicia
              sesión.
            </Text>
          </Card>
          <Link href="/login" style={styles.link}>
            <Text variant="body" color="primary">
              Ir a iniciar sesión
            </Text>
          </Link>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Crea tu cuenta</Text>

        <FormInput
          control={control}
          name="displayName"
          label="Nombre"
          placeholder="Tu nombre"
          errorMessage={errors.displayName?.message}
        />
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
          placeholder="Mínimo 8 caracteres"
          secureTextEntry
          errorMessage={errors.password?.message}
        />

        {submitError ? (
          <Text variant="caption" color="danger">
            {submitError}
          </Text>
        ) : null}

        <Button
          label={isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
          onPress={onSubmit}
          disabled={isSubmitting}
        />

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
  link: {
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
  },
});
