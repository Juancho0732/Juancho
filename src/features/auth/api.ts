import { supabase } from '@/services/supabase/client';

import type { LoginInput, RegisterInput } from './validation';

/**
 * Capa fina sobre supabase.auth. Sin lógica de UI. Cada función lanza el
 * error de Supabase tal cual para que el formulario decida cómo mostrarlo.
 */

export type SignUpResult = {
  /** true si Supabase requiere confirmar el correo antes de poder iniciar sesión. */
  needsEmailConfirmation: boolean;
};

export async function signUp(input: RegisterInput): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { display_name: input.displayName },
    },
  });
  if (error) throw error;

  return { needsEmailConfirmation: data.session === null };
}

export async function signIn(input: LoginInput): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
