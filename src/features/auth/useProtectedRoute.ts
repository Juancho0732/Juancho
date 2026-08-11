import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import type { AuthStatus } from './store';

const PUBLIC_ROOT_SEGMENTS = new Set<string | undefined>([undefined, 'onboarding']);

/**
 * Redirige según el estado de sesión: sin sesión, solo puede ver splash /
 * onboarding / (auth); con sesión, no puede quedarse en esas pantallas.
 * El resto de la app (tabs, detalle de lugar, recomendaciones) requiere sesión.
 */
export function useProtectedRoute(status: AuthStatus) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    const rootSegment = segments[0];
    const isAuthGroup = rootSegment === '(auth)';
    const isPublicRoute = PUBLIC_ROOT_SEGMENTS.has(rootSegment);

    if (status === 'signedOut' && !isAuthGroup && !isPublicRoute) {
      router.replace('/login');
    } else if (status === 'signedIn' && (isAuthGroup || isPublicRoute)) {
      router.replace('/home');
    }
  }, [status, segments, router]);
}
