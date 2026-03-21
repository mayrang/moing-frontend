import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import useVerifyEmail from './useVerifyEmail';

vi.mock('./useAuth', () => ({
  checkNetworkConnection: () => true,
}));

const mockUpdateError = vi.fn();
const mockSetIsMutationError = vi.fn();
vi.mock('@/store/client/errorStore', () => ({
  errorStore: () => ({
    updateError: mockUpdateError,
    setIsMutationError: mockSetIsMutationError,
  }),
}));

vi.mock('@/context/ReqeustError', () => ({
  default: class RequestError extends Error {
    constructor(message: any) {
      super(String(message));
    }
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useVerifyEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe('verifyEmailSend', () => {
    it('성공 시 sessionToken을 sessionStorage에 저장한다', async () => {
      const { result } = renderHook(() => useVerifyEmail(), { wrapper: createWrapper() });

      act(() => {
        result.current.verifyEmailSend.mutate({ email: 'test@test.com' });
      });

      await waitFor(() => expect(result.current.verifyEmailSend.isSuccess).toBe(true));

      expect(sessionStorage.getItem('sessionToken')).toBe('test-session-token');
    });
  });

  describe('verifyEmail', () => {
    it('성공 시 isSuccess 상태가 된다', async () => {
      sessionStorage.setItem('sessionToken', 'test-session-token');
      const { result } = renderHook(() => useVerifyEmail(), { wrapper: createWrapper() });

      act(() => {
        result.current.verifyEmail.mutate({ verifyCode: '123456' });
      });

      await waitFor(() => expect(result.current.verifyEmail.isSuccess).toBe(true));
    });
  });
});
