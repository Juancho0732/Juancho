import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Ingresa tu correo').email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  // Prioridad 8 (auditoría de beta-readiness): el máximo coincide con el
  // CHECK profiles_display_name_length de la base de datos -- esta es solo
  // la primera capa (feedback inmediato en el formulario), no la única.
  displayName: z.string().trim().min(2, 'Ingresa tu nombre').max(80, 'Máximo 80 caracteres'),
  email: z.string().trim().min(1, 'Ingresa tu correo').email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Ingresa tu correo').email('Correo inválido'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
