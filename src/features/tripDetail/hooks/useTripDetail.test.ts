import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import useTripDetail from './useTripDetail';

vi.mock('@/store/client/authStore', () => ({
  authStore: () => ({ accessToken: 'test-token', userId: '1', isGuestUser: false }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: any }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useTripDetail', () => {
  it('초기 상태에서 tripDetail은 로딩 중이다', () => {
    const { result } = renderHook(() => useTripDetail(1), {
      wrapper: createWrapper(),
    });
    expect(result.current.tripDetail.isLoading).toBe(true);
  });

  it('여행 상세 정보를 가져온다', async () => {
    const { result } = renderHook(() => useTripDetail(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.tripDetail.isLoading).toBe(false));
    expect(result.current.tripDetail.data).toBeDefined();
  });

  it('신청자 수를 가져온다', async () => {
    const { result } = renderHook(() => useTripDetail(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.tripEnrollmentCount.isLoading).toBe(false));
    expect(result.current.tripEnrollmentCount.data).toBeDefined();
  });

  it('동행자 목록을 가져온다', async () => {
    const { result } = renderHook(() => useTripDetail(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.companions.isLoading).toBe(false));
    expect(result.current.companions.data).toBeDefined();
  });

  it('updateTripDetailMutate와 deleteTripDetailMutation 함수를 반환한다', () => {
    const { result } = renderHook(() => useTripDetail(1), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.updateTripDetailMutate).toBe('function');
    expect(typeof result.current.deleteTripDetailMutation).toBe('function');
  });

  it('travelNumber가 0이면 쿼리가 비활성화된다', () => {
    const { result } = renderHook(() => useTripDetail(0), {
      wrapper: createWrapper(),
    });

    expect(result.current.tripDetail.isLoading).toBe(false);
    expect(result.current.tripDetail.data).toBeUndefined();
  });
});
