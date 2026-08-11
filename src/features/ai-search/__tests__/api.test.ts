import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';

const mockInvoke = jest.fn();

jest.mock('@/services/supabase/client', () => ({
  supabase: { functions: { invoke: (...args: unknown[]) => mockInvoke(...args) } },
}));

// eslint-disable-next-line import/first -- el mock de arriba debe declararse antes de importar '../api'
import { runAiSearch } from '../api';

beforeEach(() => {
  mockInvoke.mockReset();
});

describe('runAiSearch', () => {
  it('llama a la función ai-search con la búsqueda del usuario', async () => {
    mockInvoke.mockResolvedValue({ data: { status: 'ok', intent: {}, explanation: 'listo', results: [] }, error: null });

    await runAiSearch('algo en Chapinero');

    expect(mockInvoke).toHaveBeenCalledWith('ai-search', { body: { query: 'algo en Chapinero' } });
  });

  it('devuelve la respuesta cuando la Edge Function responde 2xx', async () => {
    const response = { status: 'ok' as const, intent: {}, explanation: 'listo', results: [] };
    mockInvoke.mockResolvedValue({ data: response, error: null });

    await expect(runAiSearch('algo')).resolves.toEqual(response);
  });

  it('extrae el mensaje real del cuerpo cuando la Edge Function responde con error HTTP (429, 401...)', async () => {
    const body = { status: 'error', message: 'Estás buscando muy rápido.' };
    const error = new FunctionsHttpError({ json: async () => body });
    mockInvoke.mockResolvedValue({ data: null, error });

    await expect(runAiSearch('algo')).resolves.toEqual(body);
  });

  it('devuelve un mensaje de conexión ante un error de red', async () => {
    const error = new FunctionsFetchError(new Error('network down'));
    mockInvoke.mockResolvedValue({ data: null, error });

    const result = await runAiSearch('algo');
    expect(result.status).toBe('error');
    expect(result).not.toEqual({ status: 'error', message: '' });
  });

  it('cae a un mensaje genérico si falla el relay o el cuerpo del error no es JSON válido', async () => {
    const relayError = new FunctionsRelayError({});
    mockInvoke.mockResolvedValue({ data: null, error: relayError });
    const relayResult = await runAiSearch('algo');
    expect(relayResult.status).toBe('error');

    const badJsonError = new FunctionsHttpError({
      json: async () => {
        throw new Error('not json');
      },
    });
    mockInvoke.mockResolvedValue({ data: null, error: badJsonError });
    const badJsonResult = await runAiSearch('algo');
    expect(badJsonResult.status).toBe('error');
  });

  it('cae a un mensaje genérico si la respuesta 2xx no tiene la forma esperada', async () => {
    mockInvoke.mockResolvedValue({ data: { unexpected: true }, error: null });

    const result = await runAiSearch('algo');
    expect(result.status).toBe('error');
  });
});
