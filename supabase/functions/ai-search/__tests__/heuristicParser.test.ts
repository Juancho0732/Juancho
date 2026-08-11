import { heuristicParseIntent } from '../heuristicParser.ts';

/**
 * Casos pedidos explícitamente para probar la búsqueda por IA (el prompt
 * maestro del proyecto, sección 17). Este parser es el respaldo cuando la
 * IA falla, así que se prueba con estos mismos textos.
 */
describe('heuristicParseIntent — casos del prompt maestro', () => {
  it('"Tengo $50.000 y quiero salir con mis amigos."', () => {
    const intent = heuristicParseIntent('Tengo $50.000 y quiero salir con mis amigos.');
    expect(intent.budgetTotal).toBe(50000);
    expect(intent.occasion).toBe('amigos');
  });

  it('"Quiero una cita barata."', () => {
    const intent = heuristicParseIntent('Quiero una cita barata.');
    expect(intent.occasion).toBe('pareja');
    expect(intent.budgetTotal).toBeNull();
  });

  it('"Estoy cerca de Chapinero."', () => {
    const intent = heuristicParseIntent('Estoy cerca de Chapinero.');
    expect(intent.location).toBe('Chapinero');
  });

  it('"Quiero hacer algo diferente este sábado." (vaga: sin señales concretas)', () => {
    const intent = heuristicParseIntent('Quiero hacer algo diferente este sábado.');
    expect(intent.budgetTotal).toBeNull();
    expect(intent.location).toBeNull();
    expect(intent.occasion).toBeNull();
    expect(intent.people).toBeNull();
  });

  it('"No quiero gastar más de $30.000."', () => {
    const intent = heuristicParseIntent('No quiero gastar más de $30.000.');
    expect(intent.budgetTotal).toBe(30000);
  });

  it('"Somos 6 personas."', () => {
    const intent = heuristicParseIntent('Somos 6 personas.');
    expect(intent.people).toBe(6);
  });

  it('combina varias condiciones en un solo texto', () => {
    const intent = heuristicParseIntent(
      'Somos 4 amigos en Usaquén, tenemos $200.000 en total para algo diferente.',
    );
    expect(intent.people).toBe(4);
    expect(intent.location).toBe('Usaquén');
    expect(intent.budgetTotal).toBe(200000);
    expect(intent.occasion).toBe('amigos');
  });
});

describe('heuristicParseIntent — extracción de presupuesto', () => {
  it('reconoce montos con separador de miles', () => {
    expect(heuristicParseIntent('tengo 80.000 pesos').budgetTotal).toBe(80000);
  });

  it('reconoce "X mil"', () => {
    expect(heuristicParseIntent('tengo 80 mil pesos').budgetTotal).toBe(80000);
  });

  it('no confunde un número de personas con presupuesto', () => {
    expect(heuristicParseIntent('somos 6 personas').budgetTotal).toBeNull();
  });
});

describe('heuristicParseIntent — ocasión', () => {
  it('detecta pareja por sinónimos (novia/novio/cita)', () => {
    expect(heuristicParseIntent('quiero salir con mi novia').occasion).toBe('pareja');
    expect(heuristicParseIntent('una cita con mi novio').occasion).toBe('pareja');
  });

  it('detecta familia', () => {
    expect(heuristicParseIntent('un plan familiar en familia').occasion).toBe('familia');
  });

  it('devuelve null si no hay ninguna palabra clave', () => {
    expect(heuristicParseIntent('quiero ir a comer algo rico').occasion).toBeNull();
  });
});
