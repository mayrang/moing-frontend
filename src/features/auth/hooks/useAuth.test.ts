import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import useAuth from './useAuth';

// next/navigation 모킹
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => '/',
}));

// Zustand store 모킹
const mockSetLoginData = vi.fn();
const mockClearLoginData = vi.fn();
const mockResetData = vi.fn();
const mockSetIsGuestUser = vi.fn();
vi.mock('@/store/client/authStore', () => ({
  authStore: () => ({
    setLoginData: mockSetLoginData,
    clearLoginData: mockClearLoginData,
    accessToken: 'existing-token',
    resetData: mockResetData,
    setIsGuestUser: mockSetIsGuestUser,
  }),
}));

const mockSetSocialLogin = vi.fn();
vi.mock('@/store/client/userStore', () => ({
  userStore: () => ({
    setSocialLogin: mockSetSocialLogin,
  }),
}));

vi.mock('@/store/client/backPathStore', () => ({
  useBackPathStore: () => ({}),
}));

vi.mock('@/utils/user', () => ({
  getJWTHeader: (token: string) => ({ Authorization: `Bearer ${token}` }),
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

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('loginEmail', () => {
    it('성공 시 로그인 데이터를 저장하고 홈으로 이동한다', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      act(() => {
        result.current.loginEmail({ email: 'test@test.com', password: 'Password123!' });
      });

      await waitFor(() => expect(result.current.loginEmailMutation.isSuccess).toBe(true));

      expect(mockSetLoginData).toHaveBeenCalledWith({
        userId: 1,
        accessToken: 'test-access-token',
      });
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('실패 시 error 상태가 된다', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      act(() => {
        result.current.loginEmail({ email: 'wrong@test.com', password: 'wrongpassword' });
      });

      await waitFor(() => expect(result.current.loginEmailMutation.isError).toBe(true));
    });
  });

  describe('registerEmail', () => {
    it('성공 시 로그인 데이터를 저장한다', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      act(() => {
        result.current.registerEmail({
          email: 'new@test.com',
          password: 'Password123!',
          name: '테스터',
          agegroup: '20대',
          gender: 'M',
          sessionToken: 'test-session',
          preferredTags: [],
        });
      });

      await waitFor(() => expect(result.current.registerEmailMutation.isSuccess).toBe(true));

      expect(mockSetLoginData).toHaveBeenCalledWith({
        userId: 3,
        accessToken: 'register-access-token',
      });
    });
  });

  describe('socialLogin', () => {
    it('성공 시 로그인 데이터를 저장하고 홈으로 이동한다', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      act(() => {
        result.current.socialLogin({ socialLoginId: 'google-id-123', email: 'social@test.com' });
      });

      await waitFor(() => expect(result.current.socialLoginMutation.isSuccess).toBe(true));

      expect(mockSetLoginData).toHaveBeenCalledWith({
        userId: 2,
        accessToken: 'social-access-token',
      });
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('logout', () => {
    it('성공 시 로그인 데이터를 초기화한다', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      act(() => {
        result.current.logout();
      });

      await waitFor(() => expect(result.current.logoutMutation.isSuccess).toBe(true));

      expect(mockClearLoginData).toHaveBeenCalled();
      expect(mockResetData).toHaveBeenCalled();
      expect(mockSetSocialLogin).toHaveBeenCalledWith(null, null);
    });
  });

  describe('userPostRefreshToken', () => {
    it('성공 시 새 토큰으로 로그인 데이터를 갱신한다', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      act(() => {
        result.current.userPostRefreshToken();
      });

      await waitFor(() => expect(result.current.refreshTokenMutation.isSuccess).toBe(true));

      expect(mockSetLoginData).toHaveBeenCalledWith({
        userId: 1,
        accessToken: 'refreshed-token',
      });
    });
  });
});
