import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import useUserProfile from './useUserProfile';

vi.mock('@/store/client/authStore', () => ({
  authStore: () => ({ accessToken: 'test-token' }),
}));

vi.mock('@/store/client/userProfileOverlayStore', () => ({
  userProfileOverlayStore: () => ({ userProfileUserId: 1 }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useUserProfile', () => {
  it('유저 프로필 정보 쿼리를 반환한다', () => {
    const { result } = renderHook(() => useUserProfile(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.isLoadingUserProfileInfo).toBe('boolean');
  });

  it('유저가 만든 여행 목록 쿼리를 반환한다', () => {
    const { result } = renderHook(() => useUserProfile(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.isUserProfileCreatedTravelsLoading).toBe('boolean');
    expect(typeof result.current.fetchNextUserProfileCreatedTravelsPage).toBe('function');
    expect(typeof result.current.refetchUserProfileCreatedTravels).toBe('function');
    expect(typeof result.current.isUserProfileCreatedTravelsFetching).toBe('boolean');
    expect(typeof result.current.hasNextUserProfileCreatedTravelsPage).toBe('boolean');
  });

  it('유저가 신청한 여행 목록 쿼리를 반환한다', () => {
    const { result } = renderHook(() => useUserProfile(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.isUserProfileAppliedTravelsLoading).toBe('boolean');
    expect(typeof result.current.fetchNextUserProfileAppliedTravelsPage).toBe('function');
    expect(typeof result.current.refetchUserProfileAppliedTravels).toBe('function');
    expect(typeof result.current.isUserProfileAppliedTravelsFetching).toBe('boolean');
    expect(typeof result.current.hasNextUserProfileAppliedTravelsPage).toBe('boolean');
  });
});
