/**
 * useVerifyEmail — 에러 핸들링 통합 테스트
 *
 * MSW가 의도적으로 실패 응답을 반환하는 시나리오에서
 * ErrorPolicy 가 올바르게 동작하는지 검증한다.
 *
 *  ┌─────────────────────────────────────────────────────────────────┐
 *  │ 검증 대상                                                        │
 *  │  1. verifyEmailSend 500 → toast 호출                            │
 *  │  2. verifyEmail 400 → business 에러, toast 호출 안 함            │
 *  │  3. verifyEmailSend network 에러 → toast 호출 (retry 소진 후)    │
 *  └─────────────────────────────────────────────────────────────────┘
 */
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import useVerifyEmail from './useVerifyEmail';

// ── errorToastStore mock ──────────────────────────────────────────────────
const mockShow = vi.hoisted(() => vi.fn());

vi.mock('@/shared/lib/errors/errorToastStore', () => ({
  errorToastStore: {
    getState: () => ({ show: mockShow, dismiss: vi.fn() }),
  },
}));

// ── helpers ───────────────────────────────────────────────────────────────

const createWrapper = (retry = false) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: retry ? undefined : false },
    },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

// ── 테스트 ────────────────────────────────────────────────────────────────

describe('useVerifyEmail 에러 핸들링', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe('verifyEmailSend', () => {
    it('500 system 에러 → errorToastStore.show 호출 (AUTH_POLICY: system=toast)', async () => {
      server.use(
        http.post('/api/verify/email/send', () =>
          HttpResponse.json({ resultType: 'FAIL' }, { status: 500 })
        )
      );

      const { result } = renderHook(() => useVerifyEmail(), { wrapper: createWrapper() });

      act(() => {
        result.current.verifyEmailSend.mutate({ email: 'test@test.com' });
      });

      await waitFor(() => expect(result.current.verifyEmailSend.isError).toBe(true));

      expect(mockShow).toHaveBeenCalledOnce();
      expect(mockShow.mock.calls[0][0]).toContain('서버');
    });

    it('business 에러 (이메일 전송 실패 등) → isError=true, toast 호출 안 함', async () => {
      // useVerifyEmail의 mutationFn이 success=false이면 status 400으로 throw
      server.use(
        http.post('/api/verify/email/send', () =>
          HttpResponse.json(
            { success: null, error: { reason: '이미 사용 중인 이메일입니다.' } },
            { status: 400 }
          )
        )
      );

      const { result } = renderHook(() => useVerifyEmail(), { wrapper: createWrapper() });

      act(() => {
        result.current.verifyEmailSend.mutate({ email: 'used@test.com' });
      });

      await waitFor(() => expect(result.current.verifyEmailSend.isError).toBe(true));

      expect(mockShow).not.toHaveBeenCalled();
    });

    it('network 에러 → toast 호출 (retry 소진 후)', async () => {
      server.use(
        http.post('/api/verify/email/send', () => HttpResponse.error())
      );

      // retry=true: createMutationOptions의 retry 함수가 동작하도록 QueryClient retry 오버라이드 해제
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      const { result } = renderHook(() => useVerifyEmail(), { wrapper });

      act(() => {
        result.current.verifyEmailSend.mutate({ email: 'test@test.com' });
      });

      // 재시도 3회(1s+2s+4s) 후 onError → toast
      // fake timer 없이 실시간 대기는 너무 길어 여기서는 재시도 중 상태 확인
      // → retry 로직은 createMutationOptions.test.ts에서 단위 검증
      // → 최종 onError에서 toast 호출됨을 확인 (retry 소진 후)
      await waitFor(
        () => expect(result.current.verifyEmailSend.isError).toBe(true),
        { timeout: 10000 }
      );

      expect(mockShow).toHaveBeenCalled();
      expect(mockShow.mock.calls[0][0]).toContain('네트워크');
    }, 15000);
  });

  describe('verifyEmail', () => {
    it('400 business 에러 → isError=true, toast 호출 안 함', async () => {
      // 기본 authHandlers의 /api/verify/email에 verifyCode='000000'이면 400 반환
      sessionStorage.setItem('sessionToken', 'test-session-token');
      const { result } = renderHook(() => useVerifyEmail(), { wrapper: createWrapper() });

      act(() => {
        result.current.verifyEmail.mutate({ verifyCode: '000000' });
      });

      await waitFor(() => expect(result.current.verifyEmail.isError).toBe(true));

      expect(mockShow).not.toHaveBeenCalled();
    });

    it('500 system 에러 → toast 호출', async () => {
      server.use(
        http.post('/api/verify/email', () =>
          HttpResponse.json({ resultType: 'FAIL' }, { status: 500 })
        )
      );

      sessionStorage.setItem('sessionToken', 'test-session-token');
      const { result } = renderHook(() => useVerifyEmail(), { wrapper: createWrapper() });

      act(() => {
        result.current.verifyEmail.mutate({ verifyCode: '123456' });
      });

      await waitFor(() => expect(result.current.verifyEmail.isError).toBe(true));

      expect(mockShow).toHaveBeenCalledOnce();
      expect(mockShow.mock.calls[0][0]).toContain('서버');
    });
  });
});
