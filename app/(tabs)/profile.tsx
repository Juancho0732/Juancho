import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';
import { signOut, useAuthStore, useProfile } from '@/features/auth';

export default function ProfileScreen() {
  const session = useAuthStore((state) => state.session);
  const { data: profile, isLoading } = useProfile();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setError(null);
    setIsSigningOut(true);
    try {
      await signOut();
      // useProtectedRoute (app/_layout.tsx) redirige a /login al detectar el cierre de sesión.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cerrar sesión.');
      setIsSigningOut(false);
    }
  };

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Perfil</Text>
        <Card>
          {isLoading ? (
            <Text variant="body" color="textSecondary">
              Cargando…
            </Text>
          ) : (
            <View style={styles.profileInfo}>
              <Text variant="subtitle">{profile?.display_name ?? 'Sin nombre'}</Text>
              <Text variant="body" color="textSecondary">
                {session?.user.email}
              </Text>
            </View>
          )}
        </Card>
        {error ? (
          <Text variant="caption" color="danger">
            {error}
          </Text>
        ) : null}
        <Button
          label={isSigningOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
          variant="secondary"
          onPress={handleSignOut}
          disabled={isSigningOut}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.md,
  },
  profileInfo: {
    gap: theme.spacing.xs,
  },
});
