import type { RawIntent } from './intentSchema.ts';
import type { PlaceRow, SearchIntent } from './types.ts';

/**
 * Capa de abstracción de IA (Regla 8: debe poder cambiarse de proveedor sin
 * reescribir la app). Cualquier proveedor nuevo solo necesita implementar
 * esta interfaz; el resto de la Edge Function (validación, ranking,
 * orquestación) no sabe ni le importa cuál es.
 */
export interface AIProvider {
  /** Texto libre -> intención estructurada (sin validar todavía). */
  interpretIntent(query: string): Promise<unknown>;
  /** Explicación breve, generada ÚNICAMENTE a partir de los lugares reales pasados. */
  generateExplanation(query: string, intent: SearchIntent, places: PlaceRow[]): Promise<string>;
}

export class AIProviderError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'AIProviderError';
  }
}

const INTENT_TOOL_NAME = 'extract_search_intent';

const INTENT_SYSTEM_PROMPT = `Eres el intérprete de búsquedas de una app de descubrimiento de planes en Bogotá, Colombia.
Tu única tarea es extraer parámetros estructurados del texto del usuario usando la herramienta ${INTENT_TOOL_NAME}.
No inventes datos que no estén implícitos en el texto: si algo no se menciona, usa null.
"location" debe ser una localidad de Bogotá si el usuario la menciona (ej. Chapinero, Usaquén, Candelaria, Teusaquillo, Zona Rosa, Suba) o null si no.
"budget_total" es el presupuesto total en pesos colombianos (COP) que menciona el usuario, como número, o null.
"occasion" es una de: amigos, pareja, familia, solo, trabajo — o null si no es clara.
No respondas con texto, solo llama a la herramienta.`;

const INTENT_TOOL_SCHEMA = {
  name: INTENT_TOOL_NAME,
  description: 'Extrae la intención estructurada de una búsqueda de planes en Bogotá.',
  input_schema: {
    type: 'object',
    properties: {
      people: { type: ['integer', 'null'], description: 'Número de personas, o null.' },
      budget_total: { type: ['number', 'null'], description: 'Presupuesto total en COP, o null.' },
      location: { type: ['string', 'null'], description: 'Localidad de Bogotá mencionada, o null.' },
      occasion: {
        type: ['string', 'null'],
        description: 'Una de: amigos, pareja, familia, solo, trabajo; o null.',
      },
      category_hint: {
        type: ['string', 'null'],
        description: 'Tipo de lugar/actividad mencionado (ej. "café", "bar"), o null.',
      },
      activity_preference: {
        type: ['string', 'null'],
        description: 'Preferencia libre sobre el tipo de experiencia (ej. "diferente", "tranquilo"), o null.',
      },
    },
    required: ['people', 'budget_total', 'location', 'occasion', 'category_hint', 'activity_preference'],
  },
} as const;

const EXPLANATION_SYSTEM_PROMPT = `Escribes explicaciones breves (2-3 frases, en español) para recomendaciones de planes en Bogotá.
Usa ÚNICAMENTE los datos de los lugares que te paso en el mensaje (nombre, categoría, localidad, precio, rating).
No inventes nombres, precios, direcciones ni datos que no estén en la lista. No menciones lugares que no estén en la lista.
Sé cálido y directo, como si le contaras a un amigo qué encontraste.`;

type AnthropicContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; name: string; input: unknown };

type AnthropicResponse = {
  content: AnthropicContentBlock[];
};

export type AnthropicProviderConfig = {
  apiKey: string;
  model: string;
  /** Inyectable para tests; por defecto `fetch` global (disponible en Deno y en Node 18+). */
  fetchImpl?: typeof fetch;
  baseUrl?: string;
};

export class AnthropicProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;

  constructor(config: AnthropicProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.fetchImpl = config.fetchImpl ?? fetch;
    this.baseUrl = config.baseUrl ?? 'https://api.anthropic.com/v1/messages';
  }

  private async callMessages(body: Record<string, unknown>): Promise<AnthropicResponse> {
    const response = await this.fetchImpl(this.baseUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: this.model, ...body }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new AIProviderError(`Anthropic API respondió ${response.status}: ${text}`);
    }

    return (await response.json()) as AnthropicResponse;
  }

  async interpretIntent(query: string): Promise<RawIntent> {
    const data = await this.callMessages({
      max_tokens: 300,
      system: INTENT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: query }],
      tools: [INTENT_TOOL_SCHEMA],
      tool_choice: { type: 'tool', name: INTENT_TOOL_NAME },
    });

    const toolUse = data.content.find(
      (block): block is Extract<AnthropicContentBlock, { type: 'tool_use' }> =>
        block.type === 'tool_use' && block.name === INTENT_TOOL_NAME,
    );
    if (!toolUse) {
      throw new AIProviderError('La IA no devolvió una intención estructurada.');
    }
    return toolUse.input as RawIntent;
  }

  async generateExplanation(query: string, intent: SearchIntent, places: PlaceRow[]): Promise<string> {
    const factsForPrompt = places.map((place) => ({
      name: place.name,
      locality: place.locality,
      price_min: place.price_min,
      price_max: place.price_max,
      rating_avg: place.rating_avg,
      review_count: place.review_count,
      description: place.description,
      tags: place.tags,
    }));

    const data = await this.callMessages({
      max_tokens: 220,
      system: EXPLANATION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: JSON.stringify({ userQuery: query, understoodIntent: intent, places: factsForPrompt }),
        },
      ],
    });

    const textBlock = data.content.find(
      (block): block is Extract<AnthropicContentBlock, { type: 'text' }> => block.type === 'text',
    );
    if (!textBlock) {
      throw new AIProviderError('La IA no devolvió una explicación en texto.');
    }
    return textBlock.text.trim();
  }
}
