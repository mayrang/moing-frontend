import { create } from 'zustand';

/**
 * 에러 토스트 전역 상태.
 * createMutationOptions 같은 non-React 코드에서도
 * errorToastStore.getState().show(...) 로 임페러티브하게 호출 가능.
 */
interface ErrorToastState {
  message: string | null;
  onRetry: (() => void) | null;
  show: (message: string, onRetry?: () => void) => void;
  dismiss: () => void;
}

export const errorToastStore = create<ErrorToastState>((set) => ({
  message: null,
  onRetry: null,
  show: (message, onRetry) => set({ message, onRetry: onRetry ?? null }),
  dismiss: () => set({ message: null, onRetry: null }),
}));
