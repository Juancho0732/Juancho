import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '../Button';

describe('Button', () => {
  it('renders its label', async () => {
    await render(<Button label="Comenzar" onPress={() => {}} />);
    expect(screen.getByText('Comenzar')).toBeTruthy();
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<Button label="Comenzar" onPress={onPress} />);
    fireEvent.press(screen.getByText('Comenzar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button label="Comenzar" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText('Comenzar'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
