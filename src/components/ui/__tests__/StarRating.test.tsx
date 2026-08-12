import { fireEvent, render, screen } from '@testing-library/react-native';

import { StarRating } from '../StarRating';

describe('StarRating', () => {
  it('de solo lectura (sin onChange) se agrupa en un solo elemento accesible con un resumen (Prioridad 14)', async () => {
    await render(<StarRating value={4} />);
    expect(screen.getByLabelText('4 de 5 estrellas')).toBeTruthy();
  });

  it('editable (con onChange) expone 5 botones individuales, cada uno con su propia etiqueta', async () => {
    const onChange = jest.fn();
    await render(<StarRating value={2} onChange={onChange} />);

    expect(screen.getByLabelText('1 estrella')).toBeTruthy();
    expect(screen.getByLabelText('5 estrellas')).toBeTruthy();
  });

  it('tocar una estrella editable llama a onChange con ese valor', async () => {
    const onChange = jest.fn();
    await render(<StarRating value={2} onChange={onChange} />);

    fireEvent.press(screen.getByLabelText('5 estrellas'));
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
