import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth';
import { addFavorite, removeFavorite } from '@/services/supabase/queries';

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
  });
}
