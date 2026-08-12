import { act, render, screen } from '@testing-library/react-native';

import { Toast } from '../Toast';
import { useToastStore } from '../toastStore';

describe('Toast', () => {
  beforeEach(() => {
    useToastStore.setState({ message: null });
  });

  it('no renderiza nada cuando no hay mensaje', async () => {
    await render(<Toast />);
    expect(screen.queryByText(/./)).toBeNull();
  });

  it('muestra el mensaje cuando se llama a showToast', async () => {
    await render(<Toast />);
    await act(async () => {
      useToastStore.getState().showToast('No se pudo actualizar tu favorito. Intenta de nuevo.');
    });
    expect(screen.getByText('No se pudo actualizar tu favorito. Intenta de nuevo.')).toBeTruthy();
  });

  it('se puede mostrar desde fuera de un componente (onError de una mutación)', () => {
    // Confirma que showToast funciona vía getState(), sin useToastStore() adentro de un hook de React.
    useToastStore.getState().showToast('mensaje de prueba');
    expect(useToastStore.getState().message).toBe('mensaje de prueba');
  });

  it('se auto-oculta pasado un tiempo', async () => {
    jest.useFakeTimers();
    await render(<Toast />);

    await act(async () => {
      useToastStore.getState().showToast('se va a ocultar');
    });
    expect(screen.getByText('se va a ocultar')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(useToastStore.getState().message).toBeNull();
    jest.useRealTimers();
  });
});
