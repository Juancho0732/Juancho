import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button, Card, FormInput, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';
import {
  exchangeRecoveryCode,
  resetPasswordSchema,
  updatePassword,
  type ResetPasswordInput,
} from '@/features/auth';
import { logAndGetSafeMessage } from '@/utils/errors';

type LinkStatus = 'exchanging' | 'ready' | 'invalid';

/**
 * Llega acá desde el enlace de recuperación (?code=..., ver requestPasswordReset
 * en features/auth/api.ts). El código se intercambia una sola vez al montar la
 * pantalla; si falta o ya no es válido (expirado, ya usado), se lo decimos
 * claramente en vez de mostrar un formulario que solo puede fallar.
 */
export default function ResetPasswordScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const router = useRouter();
  // Sin code no hay nada que intercambiar -- se decide en el estado inicial
  // (no dentro del efecto) para no disparar un setState síncrono en el cuerpo
  // del efecto solo para ese caso.
  const [linkStatus, setLinkStatus] = useState<LinkStatus>(() => (code ? 'exchanging' : 'invalid'));
  const [submitError, setSubmitError] = useState<string | null>(null);
  const exchangeAttempted = useRef(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (exchangeAttempted.current || !code) return;
    exchangeAttempted.current = true;

    exchangeRecoveryCode(code)
      .then(() => setLinkStatus('ready'))
      .catch((error) => {
        // Mismo patrón que logAndGetSafeMessage (Prioridad 4): el detalle real
        // queda solo en consola, la UI ya tiene su propio mensaje fijo para este caso.
        console.error('exchangeRecoveryCode:', error);
        setLinkStatus('invalid');
      });
  }, [code]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await updatePassword(values.password);
      router.replace('/home');
    } catch (error) {
      setSubmitError(
        logAndGetSafeMessage('updatePassword', error, 'No se pudo actualizar la contraseña. Intenta de nuevo.'),
      );
    }
  });

  if (linkStatus === 'exchanging') {
    return (
      <Screen>
        <View style={styles.content}>
          <Text variant="body" color="textSecondary">
            Verificando tu enlace…
          </Text>
        </View>
      </Screen>
    );
  }

  if (linkStatus === 'invalid') {
    return (
      <Screen>
        <View style={styles.content}>
          <Text variant="title">Enlace no válido</Text>
          <Card>
            <Text variant="body" color="textSecondary">
              Este enlace ya no funciona (puede haber expirado o ya haberse usado). Solicita uno
              nuevo.
            </Text>
          </Card>
          <Link href="/forgot-password" style={styles.link}>
            <Text variant="body" color="primary">
              Solicitar nuevo enlace
            </Text>
          </Link>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Elige tu nueva contraseña</Text>

        <FormInput
          control={control}
          name="password"
          label="Contraseña nueva"
          placeholder="Mínimo 8 caracteres"
          secureTextEntry
          errorMessage={errors.password?.message}
        />
        <FormInput
          control={control}
          name="confirmPassword"
          label="Confirma la contraseña"
          placeholder="Repite tu contraseña nueva"
          secureTextEntry
          errorMessage={errors.confirmPassword?.message}
        />

        {submitError ? (
          <Text variant="caption" color="danger">
            {submitError}
          </Text>
        ) : null}

        <Button
          label={isSubmitting ? 'Guardando…' : 'Guardar contraseña'}
          onPress={onSubmit}
          disabled={isSubmitting}
        />
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
