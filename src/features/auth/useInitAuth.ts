import { useEffect } from 'react';

import { supabase } from '@/services/supabase/client';

import { useAuthStore } from './store';

/**
 * Lee la sesión persistida (AsyncStorage) al arrancar y se suscribe a los
 * cambios de auth (login, logout, refresh de token). Llamar una sola vez,
 * en el layout raíz.
 */
export function useInitAuth() {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.subscription.unsubscribe();
  }, [setSession]);
}
