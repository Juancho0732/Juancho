import { create } from 'zustand';

type ToastState = {
  message: string | null;
  showToast: (message: string) => void;
  hideToast: () => void;
};

/**
 * Feedback global para acciones sin un lugar natural en pantalla donde
 * mostrar un error (Prioridad 6: favoritos se togglea desde tarjetas en
 * listas, no hay un formulario ahí para mostrar un mensaje inline). Se llama
 * con `useToastStore.getState().showToast(...)` desde fuera de componentes
 * (por ejemplo el onError de una mutación) igual que el resto de los stores
 * de la app (ver features/auth/store.ts).
 */
export const useToastStore = create<ToastState>((set) => ({
  message: null,
  showToast: (message) => set({ message }),
  hideToast: () => set({ message: null }),
}));
