import { logAndGetSafeMessage } from '../errors';

describe('logAndGetSafeMessage', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('siempre devuelve el mensaje genérico, nunca el mensaje crudo del error', () => {
    const error = new Error('duplicate key value violates unique constraint "reviews_place_id_user_id_key"');
    const result = logAndGetSafeMessage('upsertReview', error, 'No se pudo guardar la reseña.');
    expect(result).toBe('No se pudo guardar la reseña.');
    expect(result).not.toContain('constraint');
  });

  it('devuelve el mensaje genérico también para errores que no son instancias de Error', () => {
    expect(logAndGetSafeMessage('ctx', 'texto crudo', 'Algo salió mal.')).toBe('Algo salió mal.');
    expect(logAndGetSafeMessage('ctx', null, 'Algo salió mal.')).toBe('Algo salió mal.');
    expect(logAndGetSafeMessage('ctx', { code: 500, body: 'detalle interno' }, 'Algo salió mal.')).toBe(
      'Algo salió mal.',
    );
  });

  it('registra el error real en la consola, con el contexto dado', () => {
    const error = new Error('Invalid login credentials');
    logAndGetSafeMessage('signIn', error, 'No se pudo iniciar sesión.');
    expect(consoleErrorSpy).toHaveBeenCalledWith('signIn:', error);
  });
});
