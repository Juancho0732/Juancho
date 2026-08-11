import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

export type Coordinates = { lat: number; lng: number };

type LocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'granted'; coords: Coordinates }
  | { status: 'denied' }
  | { status: 'error'; message: string };

/**
 * Pide el permiso de ubicación solo cuando se llama a `requestLocation` (no
 * al montar), para no sorprender al usuario con un prompt apenas abre Home.
 */
export function useUserLocation() {
  const [state, setState] = useState<LocationState>({ status: 'idle' });

  const requestLocation = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState({ status: 'denied' });
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setState({
        status: 'granted',
        coords: { lat: position.coords.latitude, lng: position.coords.longitude },
      });
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'No se pudo obtener tu ubicación.',
      });
    }
  }, []);

  return { ...state, requestLocation };
}
