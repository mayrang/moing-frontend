import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import useEnrollment from './useEnrollment';

vi.mock('@/store/client/authStore', () => ({
  authStore: () => ({ accessToken: 'test-token', userId: '1' }),
}));

vi.mock('@/store/client/tripDetailStore', () => ({
  tripDetailStore: () => ({ hostUserCheck: true }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: any }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useEnrollment', () => {
  it('호스트인 경우 신청 목록을 가져온다', async () => {
    const { result } = renderHook(() => useEnrollment(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.enrollmentList.isLoading).toBe(false));
    expect(result.current.enrollmentList.data).toBeDefined();
  });

  it('apply, cancel 함수를 반환한다', () => {
    const { result } = renderHook(() => useEnrollment(1), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.apply).toBe('function');
    expect(typeof result.current.cancel).toBe('function');
  });

  it('enrollmentRejectionMutate와 enrollmentAcceptanceMutate 함수를 반환한다', () => {
    const { result } = renderHook(() => useEnrollment(1), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.enrollmentRejectionMutate).toBe('function');
    expect(typeof result.current.enrollmentAcceptanceMutate).toBe('function');
  });

  it('최근 열람 정보를 가져온다', async () => {
    const { result } = renderHook(() => useEnrollment(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.enrollmentsLastViewed.isLoading).toBe(false));
    expect(result.current.enrollmentsLastViewed.data).toBeDefined();
  });
});
