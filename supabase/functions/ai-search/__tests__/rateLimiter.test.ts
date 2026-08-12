import { checkRateLimit, type RateLimitConfig } from '../rateLimiter.ts';

const config: RateLimitConfig = {
  perUserPerMinute: 5,
  perUserPerDay: 50,
  globalPerMinute: 60,
};

describe('checkRateLimit', () => {
  it('permite la búsqueda cuando ningún contador llegó al límite', () => {
    const result = checkRateLimit(
      { userSearchesLastMinute: 0, userSearchesLastDay: 0, globalSearchesLastMinute: 0 },
      config,
    );
    expect(result).toEqual({ allowed: true });
  });

  it('bloquea por el límite de usuario por minuto (protección original, sigue igual)', () => {
    const result = checkRateLimit(
      { userSearchesLastMinute: 5, userSearchesLastDay: 1, globalSearchesLastMinute: 1 },
      config,
    );
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.message).toMatch(/muy rápido/);
  });

  it('Prioridad 9: bloquea por el límite diario aunque el usuario respete el límite por minuto', () => {
    const result = checkRateLimit(
      { userSearchesLastMinute: 1, userSearchesLastDay: 50, globalSearchesLastMinute: 1 },
      config,
    );
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.message).toMatch(/límite de búsquedas con IA por hoy/);
  });

  it('Prioridad 9: bloquea por el límite global aunque este usuario individual esté dentro de sus límites', () => {
    const result = checkRateLimit(
      { userSearchesLastMinute: 1, userSearchesLastDay: 1, globalSearchesLastMinute: 60 },
      config,
    );
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.message).toMatch(/mucha demanda/);
  });

  it('evalúa los límites en orden: usuario/minuto primero, luego usuario/día, luego global', () => {
    // Los tres a la vez llegaron al tope -- el mensaje debe ser el del primero en revisarse.
    const result = checkRateLimit(
      { userSearchesLastMinute: 5, userSearchesLastDay: 50, globalSearchesLastMinute: 60 },
      config,
    );
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.message).toMatch(/muy rápido/);
  });

  it('justo por debajo de cada límite todavía permite la búsqueda', () => {
    const result = checkRateLimit(
      { userSearchesLastMinute: 4, userSearchesLastDay: 49, globalSearchesLastMinute: 59 },
      config,
    );
    expect(result).toEqual({ allowed: true });
  });
});
