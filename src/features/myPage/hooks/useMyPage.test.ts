import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import useMyPage from './useMyPage';

vi.mock('@/store/client/authStore', () => ({
  authStore: () => ({ userId: 1, accessToken: 'test-token' }),
}));

vi.mock('@/store/client/myPageStore', () => ({
  myPageStore: () => ({
    name: '테스터',
    preferredTags: [],
    agegroup: '20대',
    addProfileUrl: vi.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useMyPage', () => {
  it('마이페이지 데이터와 뮤테이션 함수를 반환한다', () => {
    const { result } = renderHook(() => useMyPage(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.isLoading).toBe('boolean');
    expect(typeof result.current.updateMyPageMutation).toBe('function');
    expect(typeof result.current.verifyPasswordMutation).toBe('function');
    expect(typeof result.current.updatePasswordMutation).toBe('function');
    expect(typeof result.current.withdrawMutation).toBe('function');
  });

  it('프로필 이미지 관련 함수를 반환한다', () => {
    const { result } = renderHook(() => useMyPage(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.firstProfileImageMutation).toBe('function');
    expect(typeof result.current.updateProfileImgMutation).toBe('function');
    expect(typeof result.current.updateDefaultProfileImgMutation).toBe('function');
    expect(typeof result.current.deleteMyProfileImgMutation).toBe('function');
    expect(typeof result.current.updateRealProfileImgMutation).toBe('function');
    expect(typeof result.current.tempProfileImageMutation).toBe('function');
    expect(typeof result.current.deleteTempProfileImgMutation).toBe('function');
  });

  it('쿼리 상태값을 반환한다', () => {
    const { result } = renderHook(() => useMyPage(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.isLoadingImage).toBe('boolean');
    expect(typeof result.current.isUpdatedSuccess).toBe('boolean');
    expect(typeof result.current.isVerified).toBe('boolean');
    expect(typeof result.current.isVerifiedError).toBe('boolean');
  });
});
