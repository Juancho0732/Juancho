import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import type { AuthStatus } from './store';

const PUBLIC_ROOT_SEGMENTS = new Set<string | undefined>([undefined, 'onboarding']);

/**
 * Redirige según el estado de sesión: sin sesión, solo puede ver splash /
 * onboarding / (auth); con sesión, no puede quedarse en esas pantallas.
 * El resto de la app (tabs, detalle de lugar, recomendaciones) requiere sesión.
 *
 * Caso especial (Prioridad 5, recuperación de contraseña): al intercambiar el
 * código del enlace de recuperación, Supabase entrega una sesión válida antes
 * de que la persona haya elegido su nueva contraseña -- ese estado ya cuenta
 * como "signedIn" acá, pero no debe expulsarla de /reset-password hacia
 * /home a mitad del flujo.
 */
export function useProtectedRoute(status: AuthStatus) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    // Los segmentos tipados de expo-router son una unión de tuplas de largo
    // variable según la ruta -- se castea a string[] simple para poder mirar
    // el segundo nivel sin pelear con esa unión (typedRoutes en app.config.ts).
    const segmentList = segments as readonly string[];
    const rootSegment = segmentList[0];
    const isAuthGroup = rootSegment === '(auth)';
    const isPublicRoute = PUBLIC_ROOT_SEGMENTS.has(rootSegment);
    const isResetPasswordScreen = isAuthGroup && segmentList[1] === 'reset-password';

    if (status === 'signedOut' && !isAuthGroup && !isPublicRoute) {
      router.replace('/login');
    } else if (status === 'signedIn' && (isAuthGroup || isPublicRoute) && !isResetPasswordScreen) {
      router.replace('/home');
    }
  }, [status, segments, router]);
}
