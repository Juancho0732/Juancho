import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth';
import { listPersonalizedPlaces } from '@/services/supabase/queries';

/**
 * "Recomendado para ti" (Fase 8): la RPC `personalized_places` ya funciona
 * sin señales (cae a orden por rating, igual que "Lugares populares"), pero
 * mostrar la sección en ese caso sería un duplicado disfrazado de
 * personalización. `hasSignal` (favoritos del usuario, ya se consulta en
 * Home) decide si vale la pena pedirla y mostrarla.
 */
export function usePersonalizedPlaces(hasSignal: boolean) {
  const userId = useAuthStore((state) => state.session?.user.id);

  return useQuery({
    queryKey: ['personalized-places', userId],
    queryFn: () => listPersonalizedPlaces(6),
    enabled: Boolean(userId) && hasSignal,
  });
}
