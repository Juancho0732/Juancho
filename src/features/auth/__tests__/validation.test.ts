import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../validation';

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

describe('forgotPasswordSchema', () => {
  it('acepta un correo válido', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'ana@example.com' }).success).toBe(true);
  });

  it('rechaza un correo inválido', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'no-es-correo' }).success).toBe(false);
  });

  it('rechaza correo vacío', () => {
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('acepta cuando la contraseña y su confirmación coinciden (8+ caracteres)', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza cuando la confirmación no coincide', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'password123',
      confirmPassword: 'otra-cosa',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword']);
    }
  });

  it('rechaza contraseña menor a 8 caracteres', () => {
    const result = resetPasswordSchema.safeParse({
      password: '1234567',
      confirmPassword: '1234567',
    });
    expect(result.success).toBe(false);
  });
});
