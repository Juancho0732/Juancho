const mockSignUp = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn();

jest.mock('@/services/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
    },
  },
}));

// eslint-disable-next-line import/first -- el mock de arriba debe declararse antes de importar '../api'
import { signIn, signOut, signUp } from '../api';

describe('signUp', () => {
  beforeEach(() => {
    mockSignUp.mockReset();
  });

  it('manda el display_name en los metadatos del usuario', async () => {
    mockSignUp.mockResolvedValue({ data: { session: {} }, error: null });

    await signUp({ displayName: 'Ana', email: 'ana@example.com', password: 'password123' });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'password123',
      options: { data: { display_name: 'Ana' } },
    });
  });

  it('indica needsEmailConfirmation cuando Supabase no devuelve sesión', async () => {
    mockSignUp.mockResolvedValue({ data: { session: null }, error: null });

    const result = await signUp({ displayName: 'Ana', email: 'ana@example.com', password: 'password123' });

    expect(result.needsEmailConfirmation).toBe(true);
  });

  it('needsEmailConfirmation es false cuando ya hay sesión', async () => {
    mockSignUp.mockResolvedValue({ data: { session: { access_token: 'x' } }, error: null });

    const result = await signUp({ displayName: 'Ana', email: 'ana@example.com', password: 'password123' });

    expect(result.needsEmailConfirmation).toBe(false);
  });

  it('propaga el error de Supabase (ej. correo ya registrado)', async () => {
    mockSignUp.mockResolvedValue({ data: {}, error: new Error('User already registered') });

    await expect(
      signUp({ displayName: 'Ana', email: 'ana@example.com', password: 'password123' }),
    ).rejects.toThrow('User already registered');
  });
});

describe('signIn', () => {
  beforeEach(() => {
    mockSignInWithPassword.mockReset();
  });

  it('llama a signInWithPassword con las credenciales', async () => {
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: null });

    await signIn({ email: 'ana@example.com', password: 'password123' });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'password123',
    });
  });

  it('propaga el error de credenciales inválidas', async () => {
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: new Error('Invalid login credentials') });

    await expect(signIn({ email: 'ana@example.com', password: 'wrong' })).rejects.toThrow(
      'Invalid login credentials',
    );
  });
});

describe('signOut', () => {
  it('propaga el error si Supabase falla al cerrar sesión', async () => {
    mockSignOut.mockResolvedValue({ error: new Error('network error') });

    await expect(signOut()).rejects.toThrow('network error');
  });

  it('resuelve sin lanzar cuando no hay error', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    await expect(signOut()).resolves.toBeUndefined();
  });
});
