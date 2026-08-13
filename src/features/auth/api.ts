import * as Linking from 'expo-linking';

import { supabase } from '@/services/supabase/client';

import type { ForgotPasswordInput, LoginInput, RegisterInput } from './validation';

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

/**
 * Recuperación de contraseña (Prioridad 5, auditoría de beta-readiness).
 * `resetPasswordForEmail` no distingue entre correo existente/inexistente en
 * su respuesta (así lo diseña Supabase justamente para no filtrar qué
 * correos están registrados) -- por eso la UI siempre muestra el mismo
 * mensaje de éxito sin importar el resultado real de este llamado.
 *
 * `redirectTo` usa el esquema propio de la app (`app.config.ts`, scheme
 * "zone") para que el enlace del correo, en el celular, abra la app
 * directamente en /reset-password en vez de un navegador.
 */
export async function requestPasswordReset(input: ForgotPasswordInput): Promise<void> {
  const redirectTo = Linking.createURL('reset-password');
  const { error } = await supabase.auth.resetPasswordForEmail(input.email, { redirectTo });
  if (error) throw error;
}

/**
 * Intercambia el `code` que llega en el enlace de recuperación por una
 * sesión temporal (flujo PKCE, ver services/supabase/client.ts). Esa sesión
 * alcanza para llamar a `updatePassword` pero no es una sesión "normal" --
 * la pantalla de reset-password nunca la trata como login exitoso.
 */
export async function exchangeRecoveryCode(code: string): Promise<void> {
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
