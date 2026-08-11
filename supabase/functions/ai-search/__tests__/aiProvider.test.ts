import { AIProviderError, AnthropicProvider } from '../aiProvider.ts';
import { EMPTY_INTENT } from '../intentSchema.ts';
import type { PlaceRow } from '../types.ts';

function fakeFetch(response: { ok: boolean; status?: number; json?: () => unknown; text?: () => string }) {
  return jest.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? (response.ok ? 200 : 500),
    json: async () => response.json?.(),
    text: async () => response.text?.() ?? '',
  }) as unknown as typeof fetch;
}

describe('AnthropicProvider.interpretIntent', () => {
  it('extrae el input del bloque tool_use', async () => {
    const fetchImpl = fakeFetch({
      ok: true,
      json: () => ({
        content: [
          {
            type: 'tool_use',
            name: 'extract_search_intent',
            input: { people: 2, budget_total: 80000, location: 'Chapinero', occasion: null, category_hint: null, activity_preference: null },
          },
        ],
      }),
    });
    const provider = new AnthropicProvider({ apiKey: 'test', model: 'claude-test', fetchImpl });

    const result = await provider.interpretIntent('algo en Chapinero por 80000 para 2');

    expect(result).toEqual({
      people: 2,
      budget_total: 80000,
      location: 'Chapinero',
      occasion: null,
      category_hint: null,
      activity_preference: null,
    });
  });

  it('manda el texto del usuario y fuerza la herramienta de extracción', async () => {
    const fetchImpl = fakeFetch({
      ok: true,
      json: () => ({ content: [{ type: 'tool_use', name: 'extract_search_intent', input: {} }] }),
    });
    const provider = new AnthropicProvider({ apiKey: 'secret-key', model: 'claude-test', fetchImpl });

    await provider.interpretIntent('mi búsqueda');

    expect(fetchImpl).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'x-api-key': 'secret-key' }),
      }),
    );
    const [, options] = (fetchImpl as jest.Mock).mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.messages).toEqual([{ role: 'user', content: 'mi búsqueda' }]);
    expect(body.tool_choice).toEqual({ type: 'tool', name: 'extract_search_intent' });
  });

  it('lanza AIProviderError si la API responde con error HTTP', async () => {
    const fetchImpl = fakeFetch({ ok: false, status: 401, text: () => 'unauthorized' });
    const provider = new AnthropicProvider({ apiKey: 'bad-key', model: 'claude-test', fetchImpl });

    await expect(provider.interpretIntent('algo')).rejects.toThrow(AIProviderError);
  });

  it('lanza AIProviderError si la respuesta no trae un bloque tool_use', async () => {
    const fetchImpl = fakeFetch({ ok: true, json: () => ({ content: [{ type: 'text', text: 'no debería responder así' }] }) });
    const provider = new AnthropicProvider({ apiKey: 'k', model: 'claude-test', fetchImpl });

    await expect(provider.interpretIntent('algo')).rejects.toThrow(AIProviderError);
  });
});

describe('AnthropicProvider.generateExplanation', () => {
  const place: PlaceRow = {
    id: 'p1',
    name: 'Café de Prueba',
    description: 'Un café tranquilo',
    category_id: null,
    tags: ['quiet'],
    address: null,
    locality: 'Chapinero',
    lat: 4.65,
    lng: -74.05,
    price_min: 10000,
    price_max: 20000,
    schedule: null,
    rating_avg: 4.5,
    review_count: 12,
    status: 'active',
    is_mock: true,
    created_at: '2026-01-01T00:00:00Z',
  };

  it('devuelve el texto de la respuesta', async () => {
    const fetchImpl = fakeFetch({
      ok: true,
      json: () => ({ content: [{ type: 'text', text: '  Encontramos un café tranquilo en Chapinero.  ' }] }),
    });
    const provider = new AnthropicProvider({ apiKey: 'k', model: 'claude-test', fetchImpl });

    const explanation = await provider.generateExplanation('algo tranquilo', EMPTY_INTENT, [place]);

    expect(explanation).toBe('Encontramos un café tranquilo en Chapinero.');
  });

  it('solo manda los datos reales de los lugares (nombre, precio, rating...) en el mensaje', async () => {
    const fetchImpl = fakeFetch({ ok: true, json: () => ({ content: [{ type: 'text', text: 'ok' }] }) });
    const provider = new AnthropicProvider({ apiKey: 'k', model: 'claude-test', fetchImpl });

    await provider.generateExplanation('algo', EMPTY_INTENT, [place]);

    const [, options] = (fetchImpl as jest.Mock).mock.calls[0];
    const body = JSON.parse(options.body);
    const sentPayload = JSON.parse(body.messages[0].content);
    expect(sentPayload.places).toEqual([
      {
        name: 'Café de Prueba',
        locality: 'Chapinero',
        price_min: 10000,
        price_max: 20000,
        rating_avg: 4.5,
        review_count: 12,
        description: 'Un café tranquilo',
        tags: ['quiet'],
      },
    ]);
  });

  it('lanza AIProviderError si no hay bloque de texto en la respuesta', async () => {
    const fetchImpl = fakeFetch({ ok: true, json: () => ({ content: [] }) });
    const provider = new AnthropicProvider({ apiKey: 'k', model: 'claude-test', fetchImpl });

    await expect(provider.generateExplanation('algo', EMPTY_INTENT, [place])).rejects.toThrow(
      AIProviderError,
    );
  });
});
