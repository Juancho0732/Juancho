import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button, Card, FormInput, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';
import { forgotPasswordSchema, requestPasswordReset, type ForgotPasswordInput } from '@/features/auth';
import { logAndGetSafeMessage } from '@/utils/errors';

export default function ForgotPasswordScreen() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await requestPasswordReset(values);
      setRequestSent(true);
    } catch (error) {
      setSubmitError(
        logAndGetSafeMessage('requestPasswordReset', error, 'No se pudo procesar la solicitud. Intenta de nuevo.'),
      );
    }
  });

  if (requestSent) {
    return (
      <Screen>
        <View style={styles.content}>
          <Text variant="title">Revisa tu correo</Text>
          <Card>
            <Text variant="body" color="textSecondary">
              Si ese correo tiene una cuenta, te enviamos un enlace para restablecer tu contraseña.
              Ábrelo desde el mismo celular donde tienes la app instalada.
            </Text>
          </Card>
          <Link href="/login" style={styles.link}>
            <Text variant="body" color="primary">
              Volver a iniciar sesión
            </Text>
          </Link>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Recupera tu contraseña</Text>
        <Text variant="body" color="textSecondary">
          Escribe el correo de tu cuenta y te mandamos un enlace para elegir una contraseña nueva.
        </Text>

        <FormInput
          control={control}
          name="email"
          label="Correo"
          placeholder="tu@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          errorMessage={errors.email?.message}
        />

        {submitError ? (
          <Text variant="caption" color="danger">
            {submitError}
          </Text>
        ) : null}

        <Button
          label={isSubmitting ? 'Enviando…' : 'Enviar enlace'}
          onPress={onSubmit}
          disabled={isSubmitting}
        />

        <Link href="/login" style={styles.link}>
          <Text variant="body" color="primary">
            Volver a iniciar sesión
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
