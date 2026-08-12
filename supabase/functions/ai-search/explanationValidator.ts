import type { PlaceRow } from './types.ts';

/**
 * Validación de salida proporcional al MVP (Prioridad 3, auditoría de
 * beta-readiness) -- NO es un sistema de moderación semántica. Son cuatro
 * chequeos baratos y deterministas que detectan las formas más obvias de
 * que la explicación generada por la IA se haya salido de los datos reales:
 *
 *   1. afirmaciones categóricas no respaldadas ("es el mejor", "sin duda");
 *   2. cifras de precio que no corresponden a ningún resultado real;
 *   3. referencias a lugares que no están en `results`;
 *   4. señales claras de contenido reputacional negativo no respaldado.
 *
 * Ante cualquier duda, el llamador (index.ts) usa buildFallbackExplanation
 * en vez de esto -- es preferible una explicación genérica y segura a una
 * más "inteligente" pero potencialmente falsa. Por eso estos chequeos están
 * escritos para inclinarse hacia el rechazo cuando no están seguros: un
 * falso positivo cuesta un texto un poco menos natural (cae al resumen de
 * plantilla, que ya usa los mismos datos reales); un falso negativo cuesta
 * una afirmación falsa mostrada como si fuera cierta.
 */

const UNSUPPORTED_CLAIM_PATTERNS: RegExp[] = [
  /\bel\s+mejor\b/i,
  /\bla\s+mejor\b/i,
  /\blos\s+mejores\b/i,
  /\blas\s+mejores\b/i,
  /\bsin\s+duda\b/i,
  /\bgarantizad[oa]\b/i,
  /\b100\s?%\s+recomendado\b/i,
  /\bel\s+n[uú]mero\s+uno\b/i,
  /\bindiscutiblemente\b/i,
  /\bel\s+[uú]nico\b/i,
  /\bla\s+[uú]nica\b/i,
  /\bnunca\s+falla\b/i,
  /\bjam[aá]s\s+decepciona\b/i,
  /\bperfect[oa]\b/i,
];

const REPUTATIONAL_RED_FLAG_PATTERNS: RegExp[] = [
  /\bcerrad[oa]\b/i,
  /\bcerr[oó]\b/i,
  /\bya\s+no\s+existe\b/i,
  /\bestafa\b/i,
  /\bno\s+recomendad[oa]\b/i,
  /\bevita\s+este\s+lugar\b/i,
  /\bp[eé]simo/i,
  /\bterrible\b/i,
  /\bsucio\b/i,
  /\bpeligroso\b/i,
  /\bdenuncias?\b/i,
  /\bilegal\b/i,
  /\bfraude\b/i,
  /\bno\s+vayas\b/i,
  /\bmalas\s+pr[aá]cticas\b/i,
  /\binsalubre\b/i,
];

function hasUnsupportedSuperlative(text: string): boolean {
  return UNSUPPORTED_CLAIM_PATTERNS.some((pattern) => pattern.test(text));
}

function hasReputationalRedFlag(text: string): boolean {
  return REPUTATIONAL_RED_FLAG_PATTERNS.some((pattern) => pattern.test(text));
}

/** Extrae montos con pinta de pesos colombianos: "$50.000", "50.000", "80 mil". */
function extractMoneyMentions(text: string): number[] {
  const values: number[] = [];

  for (const match of text.matchAll(/(\d+(?:[.,]\d+)?)\s*mil\b/gi)) {
    const value = Number(match[1].replace(',', '.')) * 1000;
    if (Number.isFinite(value)) values.push(value);
  }
  for (const match of text.matchAll(/\$\s?(\d{1,3}(?:[.,]\d{3})+)\b|\b(\d{1,3}(?:[.,]\d{3})+)\b/g)) {
    const raw = match[1] ?? match[2];
    const value = Number(raw.replace(/[.,]/g, ''));
    if (Number.isFinite(value)) values.push(value);
  }
  return values;
}

/** true si algún monto mencionado no es plausible frente a los precios reales de `results`. */
function hasPriceMismatch(text: string, results: PlaceRow[]): boolean {
  const mentions = extractMoneyMentions(text);
  if (mentions.length === 0) return false;

  const realPrices = results.flatMap((place) =>
    [place.price_min, place.price_max].filter((value): value is number => value !== null),
  );
  // Se menciona una cifra de dinero pero ningún resultado tiene precio real: no hay nada que la respalde.
  if (realPrices.length === 0) return true;

  const min = Math.min(...realPrices);
  const max = Math.max(...realPrices);
  // Tolerancia generosa (redondeos, paráfrasis) sin dejar pasar cifras inventadas de otro orden de magnitud.
  const lowerBound = min * 0.5;
  const upperBound = max * 2;

  return mentions.some((value) => value < lowerBound || value > upperBound);
}

const KNOWN_CONTEXT_WORDS = new Set(['bogota', 'colombia', 'cop']);

/**
 * Verbos/pronombres/conectores que suelen arrancar una frase en español y
 * por eso aparecen con mayúscula inicial sin ser parte de un nombre propio.
 */
const SENTENCE_STARTER_STOPWORDS = new Set([
  'encontramos', 'recomendamos', 'te', 'aqui', 'cerca', 'en', 'con', 'para',
  'si', 'cuando', 'ademas', 'tambien', 'este', 'esta', 'estos', 'estas',
  'es', 'son', 'hay', 'entre', 'segun', 'buscas', 'busca', 'prueba', 'visita',
]);

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * true si el texto menciona un posible nombre propio (2+ palabras seguidas
 * con mayúscula inicial) que no coincide con ningún lugar/localidad real de
 * `results`. Es una heurística, no un gazetteer -- puede tener falsos
 * positivos (aceptable: cae al fallback) pero no debería dispararse con
 * texto normal, porque en español los sustantivos comunes no van en
 * mayúscula, así que dos palabras seguidas en mayúscula casi siempre son un
 * nombre propio real o inventado.
 */
function hasUnknownPlaceReference(text: string, results: PlaceRow[]): boolean {
  const knownPhrases = new Set<string>(KNOWN_CONTEXT_WORDS);
  for (const place of results) {
    knownPhrases.add(normalize(place.name));
    if (place.locality) knownPhrases.add(normalize(place.locality));
  }

  const rawCandidates = text.match(/(?:[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+){1,4}[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/g) ?? [];
  const candidates = rawCandidates
    .map((candidate) => {
      const words = candidate.split(/\s+/);
      // "Encontramos Café..." no es un nombre inventado -- es "Encontramos" +
      // el nombre real "Café...". Se descartan conectores/verbos de arranque
      // de frase del borde izquierdo antes de evaluar el candidato.
      while (words.length > 1 && SENTENCE_STARTER_STOPWORDS.has(normalize(words[0]))) {
        words.shift();
      }
      return words;
    })
    .filter((words) => words.length >= 2)
    .map((words) => words.join(' '));

  return candidates.some((candidate) => {
    const normalizedCandidate = normalize(candidate);
    for (const phrase of knownPhrases) {
      if (phrase && (normalizedCandidate.includes(phrase) || phrase.includes(normalizedCandidate))) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Punto de entrada único: true si la explicación es segura para mostrar tal
 * cual. Si devuelve false, el llamador debe usar buildFallbackExplanation en
 * su lugar -- nunca mostrar el texto igual "porque probablemente esté bien".
 */
export function isExplanationSafe(explanation: string, results: PlaceRow[]): boolean {
  if (!explanation || !explanation.trim()) return false;
  if (hasUnsupportedSuperlative(explanation)) return false;
  if (hasReputationalRedFlag(explanation)) return false;
  if (hasPriceMismatch(explanation, results)) return false;
  if (hasUnknownPlaceReference(explanation, results)) return false;
  return true;
}
