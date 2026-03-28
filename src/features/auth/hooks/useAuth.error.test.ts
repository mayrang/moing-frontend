/**
 * useAuth — 에러 핸들링 통합 테스트
 *
 * MSW가 의도적으로 실패 응답을 반환하는 시나리오에서
 * ErrorPolicy 가 올바르게 동작하는지 검증한다.
 *
 *  ┌─────────────────────────────────────────────────────────────────┐
 *  │ 검증 대상                                                        │
 *  │  1. 500 system 에러 → errorToastStore.show() 호출               │
 *  │  2. 401 business 에러 → isError=true, toast 호출 안 함           │
 *  │  3. ignore 정책 (logout) → 500 에러여도 toast 호출 안 함         │
 *  └─────────────────────────────────────────────────────────────────┘
 */
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import useAuth from './useAuth';

// ── vi.hoisted: 모듈 mock 전에 참조할 변수 ──────────────────────────────
const mockShow = vi.hoisted(() => vi.fn());
const mockSetIsGuestUser = vi.hoisted(() => vi.fn());

// ── errorToastStore mock ──────────────────────────────────────────────────
vi.mock('@/shared/lib/errors/errorToastStore', () => ({
  errorToastStore: {
    getState: () => ({ show: mockShow, dismiss: vi.fn() }),
  },
}));

// ── Next.js / store mock ──────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/login',
}));

vi.mock('@/store/client/authStore', () => ({
  authStore: () => ({
    setLoginData: vi.fn(),
    clearLoginData: vi.fn(),
    accessToken: 'test-token',
    resetData: vi.fn(),
    setIsGuestUser: mockSetIsGuestUser,
  }),
}));

vi.mock('@/store/client/userStore', () => ({
  userStore: () => ({ setSocialLogin: vi.fn() }),
}));

vi.mock('@/utils/user', () => ({
  getJWTHeader: () => ({ Authorization: 'Bearer test-token' }),
}));

// ── helpers ───────────────────────────────────────────────────────────────

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

// ── 테스트 ────────────────────────────────────────────────────────────────

describe('useAuth 에러 핸들링', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginEmailMutation', () => {
    it('500 system 에러 → errorToastStore.show 호출 (AUTH_POLICY: system=toast)', async () => {
      server.use(
        http.post('/api/login', () =>
          HttpResponse.json({ resultType: 'FAIL', success: null, error: null }, { status: 500 })
        )
      );

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      act(() => {
        result.current.loginEmail({ email: 'test@test.com', password: 'Password123!' });
      });

      await waitFor(() => expect(result.current.loginEmailMutation.isError).toBe(true));

      expect(mockShow).toHaveBeenCalledOnce();
      expect(mockShow.mock.calls[0][0]).toContain('서버');
    });

    it('401 business 에러 → isError=true, toast 호출 안 함', async () => {
      // axiosInstance 인터셉터는 401 시 /api/token/refresh를 호출한다.
      // refresh도 실패(400)하면 AxiosError(400) → 'business' → toast 안 뜸.
      server.use(
        http.post('/api/token/refresh', () =>
          HttpResponse.json({ resultType: 'FAIL' }, { status: 400 })
        )
      );

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      act(() => {
        result.current.loginEmail({ email: 'wrong@test.com', password: 'wrong' });
      });

      await waitFor(() => expect(result.current.loginEmailMutation.isError).toBe(true));

      expect(mockShow).not.toHaveBeenCalled();
    });
  });

  describe('logoutMutation (ignore 정책)', () => {
    it('500 system 에러 → onError 콜백 실행, toast 호출 안 함', async () => {
      server.use(
        http.post('/api/logout', () =>
          HttpResponse.json({ resultType: 'FAIL' }, { status: 500 })
        )
      );

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      act(() => {
        result.current.logout();
      });

      await waitFor(() =>
        expect(result.current.logoutMutation.isError).toBe(true)
      );

      // ignore 정책 → createMutationOptions onError는 no-op
      // logoutMutation의 명시적 onError가 로컬 상태 초기화만 함
      expect(mockShow).not.toHaveBeenCalled();
    });
  });

  describe('refreshTokenMutation (ignore 정책)', () => {
    it('500 system 에러 → toast 호출 안 함', async () => {
      server.use(
        http.post('/api/token/refresh', () =>
          HttpResponse.json({ resultType: 'FAIL' }, { status: 500 })
        )
      );

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      act(() => {
        result.current.userPostRefreshToken();
      });

      await waitFor(() =>
        expect(result.current.refreshTokenMutation.isError).toBe(true)
      );

      expect(mockShow).not.toHaveBeenCalled();
    });

    it('network 에러 → toast 호출 안 함 (ignore 정책)', async () => {
      server.use(
        http.post('/api/token/refresh', () => HttpResponse.error())
      );

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      act(() => {
        result.current.userPostRefreshToken();
      });

      await waitFor(() =>
        expect(result.current.refreshTokenMutation.isError).toBe(true)
      );

      expect(mockShow).not.toHaveBeenCalled();
    });
  });
});
