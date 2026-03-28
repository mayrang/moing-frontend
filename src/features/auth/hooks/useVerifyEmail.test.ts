import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import useVerifyEmail from './useVerifyEmail';

// 네트워크/에러 스토어 mock (새 에러 정책 라이브러리)
vi.mock('@/shared/lib/errors/errorToastStore', () => ({
  errorToastStore: { getState: () => ({ show: vi.fn(), dismiss: vi.fn() }) },
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
