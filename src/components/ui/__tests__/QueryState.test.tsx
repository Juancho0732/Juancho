import { Text as RNText } from 'react-native';

import { fireEvent, render, screen } from '@testing-library/react-native';

import { QueryState } from '../QueryState';

const baseProps = {
  isLoading: false,
  isError: false,
  onRetry: () => {},
  isEmpty: false,
  emptyMessage: 'No hay nada para mostrar.',
};

describe('QueryState', () => {
  it('muestra el mensaje de carga mientras isLoading', async () => {
    await render(
      <QueryState {...baseProps} isLoading loadingMessage="Buscando…">
        <RNText>contenido</RNText>
      </QueryState>,
    );
    expect(screen.getByText('Buscando…')).toBeTruthy();
    expect(screen.queryByText('contenido')).toBeNull();
  });

  it('muestra un mensaje genérico y el botón Reintentar cuando isError, nunca el detalle interno', async () => {
    await render(
      <QueryState {...baseProps} isError>
        <RNText>contenido</RNText>
      </QueryState>,
    );
    expect(screen.getByText(/No pudimos cargar esto/)).toBeTruthy();
    expect(screen.getByText('Reintentar')).toBeTruthy();
    expect(screen.queryByText('contenido')).toBeNull();
  });

  it('llama a onRetry al tocar Reintentar', async () => {
    const onRetry = jest.fn();
    await render(
      <QueryState {...baseProps} isError onRetry={onRetry}>
        <RNText>contenido</RNText>
      </QueryState>,
    );
    fireEvent.press(screen.getByText('Reintentar'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('acepta un errorMessage específico por pantalla', async () => {
    await render(
      <QueryState {...baseProps} isError errorMessage="No pudimos cargar tus favoritos.">
        <RNText>contenido</RNText>
      </QueryState>,
    );
    expect(screen.getByText('No pudimos cargar tus favoritos.')).toBeTruthy();
  });

  it('muestra el mensaje de vacío (sin botón Reintentar) cuando isEmpty, distinto de un error', async () => {
    await render(
      <QueryState {...baseProps} isEmpty emptyMessage="Todavía no hay resultados.">
        <RNText>contenido</RNText>
      </QueryState>,
    );
    expect(screen.getByText('Todavía no hay resultados.')).toBeTruthy();
    expect(screen.queryByText('Reintentar')).toBeNull();
    expect(screen.queryByText('contenido')).toBeNull();
  });

  it('renderiza los children cuando no está cargando, no hay error y no está vacío', async () => {
    await render(
      <QueryState {...baseProps}>
        <RNText>contenido</RNText>
      </QueryState>,
    );
    expect(screen.getByText('contenido')).toBeTruthy();
  });

  it('prioriza isLoading sobre isError e isEmpty', async () => {
    await render(
      <QueryState {...baseProps} isLoading isError isEmpty>
        <RNText>contenido</RNText>
      </QueryState>,
    );
    expect(screen.getByText('Cargando…')).toBeTruthy();
  });

  it('prioriza isError sobre isEmpty', async () => {
    await render(
      <QueryState {...baseProps} isError isEmpty>
        <RNText>contenido</RNText>
      </QueryState>,
    );
    expect(screen.getByText('Reintentar')).toBeTruthy();
  });
});
