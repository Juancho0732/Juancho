import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToastStore } from '@/components/ui';
import { useAuthStore } from '@/features/auth';
import { addFavorite, removeFavorite } from '@/services/supabase/queries';
import { logAndGetSafeMessage } from '@/utils/errors';

type ToggleFavoriteInput = {
  placeId: string;
  isFavorite: boolean;
};

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.session?.user.id);

  return useMutation({
    mutationFn: async ({ placeId, isFavorite }: ToggleFavoriteInput) => {
      if (!userId) throw new Error('Debes iniciar sesión para guardar favoritos.');
      if (isFavorite) {
        await removeFavorite(userId, placeId);
      } else {
        await addFavorite(userId, placeId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-ids'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-places'] });
    },
    // Prioridad 6: el corazón de favoritos se togglea desde tarjetas en listas
    // (Home, Search, Favorites, Recomendaciones, Detalle) -- no hay un lugar
    // natural en esas pantallas para un mensaje de error inline, así que se
    // usa el toast global. No hay estado optimista que revertir: la UI ya
    // refleja el estado real (favoriteIds) y solo cambia cuando la mutación
    // realmente termina, así que un error simplemente deja el corazón como
    // estaba (nunca queda "prendido" mostrando algo que no se guardó).
    onError: (error) => {
      useToastStore
        .getState()
        .showToast(logAndGetSafeMessage('toggleFavorite', error, 'No se pudo actualizar tu favorito. Intenta de nuevo.'));
    },
  });
}
