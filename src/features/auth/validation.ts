import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Ingresa tu correo').email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  displayName: z.string().trim().min(2, 'Ingresa tu nombre'),
  email: z.string().trim().min(1, 'Ingresa tu correo').email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
