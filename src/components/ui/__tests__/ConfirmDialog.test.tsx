import { act, fireEvent, render } from '@testing-library/react-native';

import { ConfirmDialog } from '../ConfirmDialog';

const baseProps = {
  visible: true,
  title: 'Eliminar reseña',
  onConfirm: () => {},
  onCancel: () => {},
};

describe('ConfirmDialog', () => {
  it('no renderiza nada cuando visible es false', async () => {
    const { queryByText } = await render(<ConfirmDialog {...baseProps} visible={false} />);
    expect(queryByText('Eliminar reseña')).toBeNull();
  });

  it('llama a onConfirm/onCancel al tocar los botones', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { getByText, unmount } = await render(
      <ConfirmDialog {...baseProps} onConfirm={onConfirm} onCancel={onCancel} />,
    );

    await act(async () => {
      fireEvent.press(getByText('Confirmar'));
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(getByText('Cancelar'));
    });
    expect(onCancel).toHaveBeenCalledTimes(1);

    await act(async () => {
      await unmount();
    });
  });

  it('deshabilita ambos botones y cambia la etiqueta mientras isConfirming (Prioridad 6)', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { getByText, queryByText } = await render(
      <ConfirmDialog {...baseProps} isConfirming onConfirm={onConfirm} onCancel={onCancel} />,
    );

    expect(getByText('Un momento…')).toBeTruthy();
    expect(queryByText('Confirmar')).toBeNull();

    await act(async () => {
      fireEvent.press(getByText('Un momento…'));
      fireEvent.press(getByText('Cancelar'));
    });
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('muestra errorMessage y el diálogo permanece abierto (Prioridad 6: nunca se cierra solo tras un error)', async () => {
    const { getByText } = await render(
      <ConfirmDialog {...baseProps} errorMessage="No se pudo eliminar la reseña. Intenta de nuevo." />,
    );
    expect(getByText('No se pudo eliminar la reseña. Intenta de nuevo.')).toBeTruthy();
    expect(getByText('Eliminar reseña')).toBeTruthy();
  });
});
