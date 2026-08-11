import { useQuery } from '@tanstack/react-query';

import { getProfile } from '@/services/supabase/queries';

import { useAuthStore } from './store';

export function useProfile() {
  const userId = useAuthStore((state) => state.session?.user.id);

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId as string),
    enabled: Boolean(userId),
  });
}
