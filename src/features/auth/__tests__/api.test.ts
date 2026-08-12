const mockSignUp = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn();
const mockResetPasswordForEmail = jest.fn();
const mockExchangeCodeForSession = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock('@/services/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      resetPasswordForEmail: (...args: unknown[]) => mockResetPasswordForEmail(...args),
      exchangeCodeForSession: (...args: unknown[]) => mockExchangeCodeForSession(...args),
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
    },
  },
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn((path: string) => `juancho://${path}`),
}));

// eslint-disable-next-line import/first -- los mocks de arriba deben declararse antes de importar '../api'
import {
  exchangeRecoveryCode,
  requestPasswordReset,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from '../api';

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

describe('requestPasswordReset', () => {
  beforeEach(() => {
    mockResetPasswordForEmail.mockReset();
  });

  it('manda el redirectTo con el esquema propio de la app apuntando a reset-password', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

    await requestPasswordReset({ email: 'ana@example.com' });

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith('ana@example.com', {
      redirectTo: 'juancho://reset-password',
    });
  });

  it('propaga el error de Supabase (ej. límite de solicitudes)', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: new Error('email rate limit exceeded') });

    await expect(requestPasswordReset({ email: 'ana@example.com' })).rejects.toThrow(
      'email rate limit exceeded',
    );
  });
});

describe('exchangeRecoveryCode', () => {
  beforeEach(() => {
    mockExchangeCodeForSession.mockReset();
  });

  it('intercambia el code por una sesión', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ data: {}, error: null });

    await exchangeRecoveryCode('abc123');

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('abc123');
  });

  it('propaga el error si el code ya no es válido (expirado o ya usado)', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ data: {}, error: new Error('invalid flow state') });

    await expect(exchangeRecoveryCode('abc123')).rejects.toThrow('invalid flow state');
  });
});

describe('updatePassword', () => {
  beforeEach(() => {
    mockUpdateUser.mockReset();
  });

  it('llama a updateUser con la contraseña nueva', async () => {
    mockUpdateUser.mockResolvedValue({ data: {}, error: null });

    await updatePassword('nueva-contraseña-123');

    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'nueva-contraseña-123' });
  });

  it('propaga el error de Supabase', async () => {
    mockUpdateUser.mockResolvedValue({ data: {}, error: new Error('same password') });

    await expect(updatePassword('nueva-contraseña-123')).rejects.toThrow('same password');
  });
});
