import { loginSchema, registerSchema } from '../validation';

describe('loginSchema', () => {
  it('acepta correo y contraseña válidos', () => {
    const result = loginSchema.safeParse({ email: 'ana@example.com', password: 'algo' });
    expect(result.success).toBe(true);
  });

  it('rechaza un correo inválido', () => {
    const result = loginSchema.safeParse({ email: 'no-es-correo', password: 'algo' });
    expect(result.success).toBe(false);
  });

  it('rechaza contraseña vacía', () => {
    const result = loginSchema.safeParse({ email: 'ana@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('acepta datos válidos', () => {
    const result = registerSchema.safeParse({
      displayName: 'Ana',
      email: 'ana@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza contraseña menor a 8 caracteres', () => {
    const result = registerSchema.safeParse({
      displayName: 'Ana',
      email: 'ana@example.com',
      password: '1234567',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza nombre demasiado corto', () => {
    const result = registerSchema.safeParse({
      displayName: 'A',
      email: 'ana@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza correo inválido', () => {
    const result = registerSchema.safeParse({
      displayName: 'Ana',
      email: 'ana@',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });
});
